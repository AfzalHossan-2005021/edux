/**
 * Payment Success Page
 * Displayed after successful Stripe checkout
 */

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { verifyPayment } from '../../lib/payments';
import { Button } from '../../components/ui';

export default function PaymentSuccess() {
  const router = useRouter();
  const { session_id } = router.query;

  const [status, setStatus] = useState('verifying');
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session_id) {
      handleVerifyPayment();
    }
  }, [session_id]);

  const handleVerifyPayment = async () => {
    try {
      const result = await verifyPayment(session_id);

      if (result.success) {
        setStatus('success');
        setPayment(result.payment);
      } else {
        setStatus('pending');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. You are now enrolled in the course.
            </p>

            {payment && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-2">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono text-gray-800">{payment.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Course:</span>
                    <span className="text-gray-800">{payment.courseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="text-gray-800 font-semibold">
                      ${payment.amount?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-3">
                <Link href={payment ? `/student/courses/${payment.cId}` : '/student'} className="inline-flex w-full">
                  <Button variant="primary" size="md" className="w-full">Start Learning</Button>
                </Link>
                <Link href="/student" className="block w-full py-3 text-blue-600 hover:text-blue-700 transition-colors">
                  View My Courses
                </Link>
              </div>
            </div>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Processing</h2>
            <p className="text-gray-600 mb-6">
              Your payment is being processed. This usually takes a few moments.
            </p>
            <Button variant="primary" size="md" className="w-full" onClick={handleVerifyPayment}>Check Status</Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-4">
              {error || 'There was an issue verifying your payment.'}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              If you were charged, please contact support with your session ID.
            </p>
            <div className="space-y-3">
              <Button variant="primary" size="md" className="w-full" onClick={handleVerifyPayment}>Try Again</Button>
              <Link
                href="/courses"
                className="block w-full py-3 text-blue-600 hover:text-blue-700 transition-colors"
              >
                Back to Courses
              </Link>
            </div>
          </>
        )}

        {/* Session ID for reference */}
        {session_id && (
          <div className="mt-6 pt-6 border-t text-xs text-gray-400">
            Session: {session_id}
          </div>
        )}
      </div>
    </div>
  );
}
