/**
 * Payments API
 * Stripe payment processing for courses
 */

import pool from '../../middleware/connectdb';

// Note: In production, use environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_...';

// Mock Stripe for development (replace with real Stripe SDK in production)
const stripe = {
  checkout: {
    sessions: {
      create: async (params) => ({
        id: `cs_test_${Date.now()}`,
        url: `http://localhost:3000/payment/success?session_id=cs_test_${Date.now()}`,
        payment_status: 'unpaid',
      }),
      retrieve: async (sessionId) => ({
        id: sessionId,
        payment_status: 'paid',
        customer_email: 'customer@example.com',
        amount_total: 999,
        metadata: {},
      }),
    },
  },
  refunds: {
    create: async (params) => ({
      id: `re_test_${Date.now()}`,
      status: 'succeeded',
    }),
  },
};

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getPaymentInfo(req, res);
      case 'POST':
        return await processPayment(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Payment API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET - Fetch payment info
async function getPaymentInfo(req, res) {
  const { sessionId, userId, action, paymentId } = req.query;
  let connection;

  try {
    connection = await pool.getConnection();

    // Verify Stripe session
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === 'paid') {
        // Find and update payment record
        const result = await connection.execute(
          `SELECT * FROM EDUX.PAYMENTS WHERE STRIPE_SESSION_ID = :sessionId`,
          { sessionId }
        );

        if (result.rows.length > 0) {
          const payment = formatRow(result.rows[0], result.metaData);

          if (payment.status !== 'completed') {
            await connection.execute(
              `UPDATE EDUX.PAYMENTS SET STATUS = 'completed', COMPLETED_AT = SYSDATE 
               WHERE STRIPE_SESSION_ID = :sessionId`,
              { sessionId },
              { autoCommit: true }
            );

            // Auto-enroll user in course
            await connection.execute(
              `INSERT INTO EDUX.ENROLLMENT (E_ID, U_ID, C_ID, ENROLL_DATE)
               SELECT (SELECT NVL(MAX(E_ID), 0) + 1 FROM EDUX.ENROLLMENT), :userId, :courseId, SYSDATE
               FROM DUAL
               WHERE NOT EXISTS (
                 SELECT 1 FROM EDUX.ENROLLMENT WHERE U_ID = :userId AND C_ID = :courseId
               )`,
              { userId: payment.userId, courseId: payment.courseId },
              { autoCommit: true }
            );
          }

          return res.status(200).json({
            success: true,
            payment: { ...payment, status: 'completed' },
            message: 'Payment verified successfully',
          });
        }
      }

      return res.status(200).json({
        success: false,
        status: session.payment_status,
        message: 'Payment not completed',
      });
    }

    // Get single payment
    if (paymentId) {
      const result = await connection.execute(
        `SELECT p.*, c.NAME as COURSE_NAME 
         FROM EDUX.PAYMENTS p
         JOIN EDUX.COURSE c ON p.C_ID = c.C_ID
         WHERE p.PAYMENT_ID = :paymentId`,
        { paymentId }
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      return res.status(200).json(formatRow(result.rows[0], result.metaData));
    }

    // Get payment history
    if (action === 'history' && userId) {
      const result = await connection.execute(
        `SELECT p.*, c.NAME as COURSE_NAME 
         FROM EDUX.PAYMENTS p
         JOIN EDUX.COURSE c ON p.C_ID = c.C_ID
         WHERE p.U_ID = :userId
         ORDER BY p.CREATED_AT DESC`,
        { userId: parseInt(userId) }
      );

      const payments = result.rows.map((row) => formatRow(row, result.metaData));
      return res.status(200).json({ payments });
    }

    return res.status(400).json({ error: 'Missing required parameters' });
  } catch (error) {
    console.error('Get payment error:', error);
    return res.status(500).json({ error: 'Failed to fetch payment info' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
}

// POST - Process payments
async function processPayment(req, res) {
  const { action } = req.body;

  switch (action) {
    case 'create-checkout':
      return await createCheckout(req, res);
    case 'refund':
      return await processRefund(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

// Create Stripe checkout session
async function createCheckout(req, res) {
  const {
    userId,
    courseId,
    amount,
    currency = 'usd',
    couponCode,
    successUrl,
    cancelUrl,
  } = req.body;

  if (!userId || !courseId || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let connection;

  try {
    connection = await pool.getConnection();

    // Get course info
    const courseResult = await connection.execute(
      `SELECT C_ID, NAME, PRICE FROM EDUX.COURSE WHERE C_ID = :courseId`,
      { courseId: parseInt(courseId) }
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const [cId, courseName, basePrice] = courseResult.rows[0];

    // Check if already enrolled
    const enrollResult = await connection.execute(
      `SELECT * FROM EDUX.ENROLLMENT WHERE U_ID = :userId AND C_ID = :courseId`,
      { userId: parseInt(userId), courseId: parseInt(courseId) }
    );

    if (enrollResult.rows.length > 0) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: courseName,
              description: `Enrollment for ${courseName}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/courses/${courseId}`,
      metadata: {
        userId: userId.toString(),
        courseId: courseId.toString(),
        couponCode: couponCode || '',
      },
    });

    // Record payment attempt
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await connection.execute(
      `INSERT INTO EDUX.PAYMENTS (
        PAYMENT_ID, U_ID, C_ID, AMOUNT, CURRENCY, STATUS,
        STRIPE_SESSION_ID, COUPON_CODE, CREATED_AT
      ) VALUES (
        :paymentId, :userId, :courseId, :amount, :currency, 'pending',
        :sessionId, :couponCode, SYSDATE
      )`,
      {
        paymentId,
        userId: parseInt(userId),
        courseId: parseInt(courseId),
        amount: parseFloat(amount),
        currency,
        sessionId: session.id,
        couponCode: couponCode || null,
      },
      { autoCommit: true }
    );

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
      paymentId,
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
}

// Process refund
async function processRefund(req, res) {
  const { paymentId, reason } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Payment ID is required' });
  }

  let connection;

  try {
    connection = await pool.getConnection();

    // Get payment record
    const result = await connection.execute(
      `SELECT * FROM EDUX.PAYMENTS WHERE PAYMENT_ID = :paymentId`,
      { paymentId }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = formatRow(result.rows[0], result.metaData);

    if (payment.status !== 'completed') {
      return res.status(400).json({ error: 'Can only refund completed payments' });
    }

    // Check if within refund window (7 days)
    const completedAt = new Date(payment.completedAt);
    const daysSincePayment = (Date.now() - completedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSincePayment > 7) {
      return res.status(400).json({ error: 'Refund window has expired (7 days)' });
    }

    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripeSessionId,
    });

    // Update payment status
    await connection.execute(
      `UPDATE EDUX.PAYMENTS SET STATUS = 'refunded', REFUND_REASON = :reason, REFUNDED_AT = SYSDATE
       WHERE PAYMENT_ID = :paymentId`,
      { paymentId, reason: reason || 'User requested refund' },
      { autoCommit: true }
    );

    // Remove enrollment
    await connection.execute(
      `DELETE FROM EDUX.ENROLLMENT WHERE U_ID = :userId AND C_ID = :courseId`,
      { userId: payment.uId, courseId: payment.cId },
      { autoCommit: true }
    );

    return res.status(200).json({
      success: true,
      refundId: refund.id,
      message: 'Refund processed successfully',
    });
  } catch (error) {
    console.error('Refund error:', error);
    return res.status(500).json({ error: 'Failed to process refund' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
}

// Helper function to format row
function formatRow(row, metaData) {
  const formatted = {};
  metaData.forEach((col, index) => {
    const key = col.name.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    formatted[key] = row[index];
  });
  return formatted;
}
