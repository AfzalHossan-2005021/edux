/**
 * Payment Checkout Page
 * Handles course purchase before enrollment
 */

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { apiPost } from '../../lib/api';
import { Card, CardContent, Button, Badge } from '../../components/ui';
import { 
  HiCreditCard, 
  HiShieldCheck, 
  HiCheckCircle,
  HiArrowLeft,
  HiTag
} from 'react-icons/hi';

export default function PaymentCheckout() {
  const router = useRouter();
  const { c_id } = router.query;
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [error, setError] = useState(null);

  // Coupon codes
  const coupons = {
    'WELCOME10': 10,
    'EDUX20': 20,
    'SUMMER25': 25,
    'FLASH50': 50,
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/student/login?redirect=/payment/checkout?c_id=${c_id}`);
      return;
    }

    if (c_id && isAuthenticated) {
      fetchCourseDetails();
    }
  }, [c_id, isAuthenticated, authLoading]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const response = await apiPost('/api/selected_course', { c_id });
      const data = await response.json();
      
      if (data?.[0]) {
        setCourse(data[0]);
        
        // If course is free, redirect to direct enrollment
        if (!data[0].price || data[0].price === 0) {
          router.push(`/courses/${c_id}`);
        }
      } else {
        setError('Course not found');
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    if (coupons[code]) {
      setAppliedCoupon({ code, discount: coupons[code] });
      setError(null);
    } else {
      setError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const calculateTotal = () => {
    if (!course?.price) return 0;
    const basePrice = course.price;
    if (appliedCoupon) {
      return basePrice - (basePrice * appliedCoupon.discount / 100);
    }
    return basePrice;
  };

  const handlePayment = async () => {
    if (!user?.u_id || !c_id) {
      setError('Missing user or course information');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'create-checkout',
          userId: user.u_id,
          courseId: parseInt(c_id),
          amount: calculateTotal(),
          currency: 'usd',
          couponCode: appliedCoupon?.code || null,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe checkout (or mock success page in dev)
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to initiate payment');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20 flex items-center justify-center">
        <Card className="text-center max-w-md" padding="lg">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">
            {error}
          </h2>
          <Link href="/">
            <Button variant="primary">Browse Courses</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href={`/courses/${c_id}`}
          className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 mb-6"
        >
          <HiArrowLeft className="w-5 h-5" />
          Back to Course
        </Link>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Order Summary - Left */}
          <div className="md:col-span-3">
            <Card padding="lg">
              <h1 className="text-2xl font-bold text-neutral-800 dark:text-white mb-6">
                Checkout
              </h1>

              {/* Course Info */}
              <div className="flex gap-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-6">
                <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={course?.wall || '/images/course-placeholder.jpg'}
                    alt={course?.title || 'Course'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-800 dark:text-white line-clamp-2">
                    {course?.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    By {course?.name}
                  </p>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Have a coupon?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    disabled={!!appliedCoupon}
                    className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                  />
                  {appliedCoupon ? (
                    <Button variant="outline" onClick={removeCoupon}>
                      Remove
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={applyCoupon}>
                      Apply
                    </Button>
                  )}
                </div>
                {appliedCoupon && (
                  <div className="mt-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <HiTag className="w-4 h-4" />
                    <span className="text-sm">
                      {appliedCoupon.code} - {appliedCoupon.discount}% off applied!
                    </span>
                  </div>
                )}
              </div>

              {/* What's Included */}
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
                <h3 className="font-semibold text-neutral-800 dark:text-white mb-4">
                  What's Included
                </h3>
                <ul className="space-y-3">
                  {[
                    'Full lifetime access',
                    'Access on mobile and desktop',
                    'Certificate of completion',
                    'All course materials',
                    '30-day money-back guarantee',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                      <HiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          {/* Payment Summary - Right */}
          <div className="md:col-span-2">
            <Card padding="lg" className="sticky top-24">
              <h2 className="text-lg font-bold text-neutral-800 dark:text-white mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Original Price</span>
                  <span>${course?.price?.toFixed(2) || '0.00'}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount ({appliedCoupon.discount}%)</span>
                    <span>-${((course?.price || 0) * appliedCoupon.discount / 100).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between py-4 text-lg font-bold text-neutral-800 dark:text-white">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full mb-4"
                onClick={handlePayment}
                loading={processing}
              >
                <HiCreditCard className="w-5 h-5 mr-2" />
                Complete Payment
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                <HiShieldCheck className="w-4 h-4" />
                <span>Secure 256-bit SSL encryption</span>
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-4">
                By completing your purchase you agree to our Terms of Service and Privacy Policy.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
