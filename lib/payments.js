/**
 * Payment Integration Library
 * Stripe integration for course purchases
 */

// Note: In production, STRIPE_SECRET_KEY should be in environment variables
// This is a client-side helper - actual Stripe calls should be on server

export const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_KEY || 'pk_test_...';

// Course pricing tiers
export const PricingTiers = {
  FREE: { id: 'free', name: 'Free', price: 0, features: ['Basic content access'] },
  BASIC: { id: 'basic', name: 'Basic', price: 9.99, features: ['Full course access', 'Certificate'] },
  PREMIUM: { id: 'premium', name: 'Premium', price: 19.99, features: ['Full access', 'Certificate', 'Live sessions', '1-on-1 mentoring'] },
  PRO: { id: 'pro', name: 'Professional', price: 49.99, features: ['Everything in Premium', 'Source files', 'Lifetime updates'] },
};

// Payment status
export const PaymentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
};

// Create payment intent data
export function createPaymentData(options) {
  const {
    userId,
    courseId,
    amount,
    currency = 'usd',
    description,
    metadata = {},
  } = options;

  return {
    paymentId: `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    courseId,
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    description,
    status: PaymentStatus.PENDING,
    createdAt: new Date().toISOString(),
    metadata: {
      ...metadata,
      platform: 'edux',
    },
  };
}

// Calculate course price with discounts
export function calculatePrice(basePrice, options = {}) {
  const { couponCode, isStudent = false, bulkCount = 1 } = options;

  let finalPrice = basePrice;
  let discount = 0;
  const appliedDiscounts = [];

  // Student discount (10%)
  if (isStudent) {
    const studentDiscount = finalPrice * 0.1;
    discount += studentDiscount;
    appliedDiscounts.push({ type: 'student', amount: studentDiscount, percentage: 10 });
  }

  // Bulk discount
  if (bulkCount >= 5) {
    const bulkDiscount = finalPrice * 0.15;
    discount += bulkDiscount;
    appliedDiscounts.push({ type: 'bulk', amount: bulkDiscount, percentage: 15 });
  } else if (bulkCount >= 3) {
    const bulkDiscount = finalPrice * 0.1;
    discount += bulkDiscount;
    appliedDiscounts.push({ type: 'bulk', amount: bulkDiscount, percentage: 10 });
  }

  // Coupon codes
  const coupons = {
    'WELCOME10': 10,
    'EDUX20': 20,
    'SUMMER25': 25,
    'FLASH50': 50,
  };

  if (couponCode && coupons[couponCode.toUpperCase()]) {
    const couponDiscount = finalPrice * (coupons[couponCode.toUpperCase()] / 100);
    discount += couponDiscount;
    appliedDiscounts.push({
      type: 'coupon',
      code: couponCode.toUpperCase(),
      amount: couponDiscount,
      percentage: coupons[couponCode.toUpperCase()],
    });
  }

  finalPrice = Math.max(0, finalPrice - discount);

  return {
    originalPrice: basePrice,
    finalPrice: Math.round(finalPrice * 100) / 100,
    totalDiscount: Math.round(discount * 100) / 100,
    appliedDiscounts,
    savings: discount > 0 ? Math.round((discount / basePrice) * 100) : 0,
  };
}

// Format price for display
export function formatPrice(amount, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

// Load Stripe.js
export async function loadStripe() {
  if (window.Stripe) {
    return window.Stripe(STRIPE_PUBLIC_KEY);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      if (window.Stripe) {
        resolve(window.Stripe(STRIPE_PUBLIC_KEY));
      } else {
        reject(new Error('Failed to load Stripe'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Stripe script'));
    document.body.appendChild(script);
  });
}

// Client-side checkout helper
export async function initiateCheckout(courseId, priceData) {
  try {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create-checkout',
        courseId,
        ...priceData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { sessionId, url } = await response.json();

    // Redirect to Stripe Checkout
    if (url) {
      window.location.href = url;
    } else {
      const stripe = await loadStripe();
      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) {
        throw new Error(result.error.message);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Checkout error:', error);
    return { success: false, error: error.message };
  }
}

// Verify payment status
export async function verifyPayment(sessionId) {
  try {
    const response = await fetch(`/api/payments?sessionId=${sessionId}`);
    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }
    return await response.json();
  } catch (error) {
    console.error('Payment verification error:', error);
    return { success: false, error: error.message };
  }
}

// Get payment history
export async function getPaymentHistory(userId) {
  try {
    const response = await fetch(`/api/payments?userId=${userId}&action=history`);
    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }
    return await response.json();
  } catch (error) {
    console.error('Payment history error:', error);
    return { payments: [], error: error.message };
  }
}

// Refund request
export async function requestRefund(paymentId, reason) {
  try {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'refund',
        paymentId,
        reason,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to process refund request');
    }

    return await response.json();
  } catch (error) {
    console.error('Refund error:', error);
    return { success: false, error: error.message };
  }
}
