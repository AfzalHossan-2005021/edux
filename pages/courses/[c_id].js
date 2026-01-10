/**
 * Course Detail Page
 * Modern, attractive UI with consistent design system
 */

import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { apiPost } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { CourseSummary } from "../../components/ai";
import { Card, Button, Badge } from "../../components/ui";
import { 
  HiStar, 
  HiOutlineStar,
  HiHeart, 
  HiOutlineHeart,
  HiUserGroup, 
  HiAcademicCap, 
  HiClock, 
  HiBookOpen,
  HiPlay,
  HiCheckCircle,
  HiArrowRight,
  HiSparkles,
  HiOfficeBuilding,
  HiChartBar
} from "react-icons/hi";

// Star Rating Component
const StarRating = ({ rating, showNumber = true, size = "md" }) => {
  const sizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
  const fullStars = Math.floor(rating || 0);
  const hasHalfStar = (rating || 0) % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <span key={i}>
          {i < fullStars ? (
            <HiStar className={`${sizes[size]} text-amber-400`} />
          ) : i === fullStars && hasHalfStar ? (
            <HiStar className={`${sizes[size]} text-amber-400 opacity-50`} />
          ) : (
            <HiOutlineStar className={`${sizes[size]} text-neutral-300`} />
          )}
        </span>
      ))}
      {showNumber && (
        <span className="ml-1 font-semibold text-neutral-700 dark:text-neutral-300">
          {rating?.toFixed(1) || '—'}
        </span>
      )}
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ review }) => (
  <Card className="mb-4" padding="md" shadow="soft">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
        {review.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">
            {review.name}
          </h4>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} size="sm" showNumber={false} />
            {review.date && (
              <span className="text-sm text-neutral-500">
                {new Date(review.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            )}
          </div>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {review.review}
        </p>
      </div>
    </div>
  </Card>
);

// Loading Skeleton
const CourseSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 md:h-96 bg-neutral-200 dark:bg-neutral-700 rounded-2xl mb-8" />
    <div className="space-y-4">
      <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
      <div className="h-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
    </div>
  </div>
);

export default function CoursePage({ c_id }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (!c_id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch course details
        const courseRes = await apiPost("/api/selected_course", { c_id });
        const courseData = await courseRes.json();
        if (courseData?.[0]) {
          const c = courseData[0];
          setCourse({
            ...c,
            prerequisites: c.PREREQUISITES_LIST ? c.PREREQUISITES_LIST : (c.prerequisites || []),
            outcomes: c.OUTCOMES_LIST ? c.OUTCOMES_LIST : (c.outcomes || []),
          });
        }

        // Fetch reviews
        const reviewsRes = await apiPost("/api/reviews", { c_id });
        const reviewsData = await reviewsRes.json();
        if (Array.isArray(reviewsData)) {
          setReviews(reviewsData);
        }

        // Check enrollment status
        const userId = user?.u_id || secureLocalStorage.getItem("u_id");
        if (userId) {
          const enrollRes = await apiPost("/api/is_enrolled", { u_id: userId, c_id });
          const enrollData = await enrollRes.json();
          setIsEnrolled(enrollData?.is_enrolled == 1);
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [c_id, user]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/user/login?redirect=/courses/${c_id}`);
      return;
    }

    // Check if course has a price - redirect to payment
    if (course?.price && course.price > 0) {
      router.push(`/payment/checkout?c_id=${c_id}`);
      return;
    }

    // Free course - direct enrollment
    setEnrolling(true);
    try {
      const userId = user?.u_id || secureLocalStorage.getItem("u_id");
      const response = await apiPost("/api/enroll", { u_id: userId, c_id });
      const data = await response.json();
      if (data.code === 1 || data.success) {
        setIsEnrolled(true);
        router.push(`/student/courses/${c_id}`);
      }
    } catch (err) {
      console.error('Error enrolling:', err);
    } finally {
      setEnrolling(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/user/login?redirect=/courses/${c_id}`);
      return;
    }

    setWishlistLoading(true);
    try {
      const userId = user?.u_id || secureLocalStorage.getItem("u_id");
      const response = await apiPost("/api/add_to_wishlist", { u_id: userId, c_id });
      const data = await response.json();
      if (data.code === 1) {
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const goToCourse = () => {
    router.push(`/student/courses/${c_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CourseSkeleton />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20 flex items-center justify-center">
        <Card className="text-center max-w-md" padding="lg">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">
            Course Not Found
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/">
            <Button variant="primary">Browse Courses</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const availableSeats = course.seat - (course.student_count || 0);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Hero Section with Course Image */}
      <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 pt-20">
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Course Info */}
            <div className="text-white order-2 lg:order-1">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="primary" size="md" className="bg-white/20 text-white border-0">
                  {course.field || 'Technology'}
                </Badge>
                {course.student_count > 10 && (
                  <Badge variant="success" size="md" className="bg-emerald-500/20 text-emerald-300 border-0">
                    🔥 Popular
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                {course.title}
              </h1>

              <p className="text-lg text-white/80 mb-6 leading-relaxed">
                {course.description}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <StarRating rating={course.rating} size="md" />
                  <span className="text-white/70">
                    ({reviews.length} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <HiUserGroup className="w-5 h-5" />
                  <span>{course.student_count || 0} students</span>
                </div>
              </div>

              {/* Instructor Info */}
              <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {course.name?.charAt(0)?.toUpperCase() || 'I'}
                </div>
                <div>
                  <p className="font-semibold text-white">{course.name}</p>
                  <p className="text-sm text-white/70">{course.qualification}</p>
                  <p className="text-xs text-white/60">{course.subject}</p>
                </div>
              </div>

              {/* Action Buttons - Mobile */}
              <div className="flex flex-col sm:flex-row gap-3 lg:hidden">
                {isEnrolled ? (
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full sm:w-auto bg-white text-primary-700 hover:bg-neutral-100"
                    onClick={goToCourse}
                  >
                    <HiPlay className="w-5 h-5 mr-2" />
                    Go to Course
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="w-full sm:w-auto bg-white text-primary-700 hover:bg-neutral-100"
                      onClick={handleEnroll}
                      loading={enrolling}
                    >
                      <HiAcademicCap className="w-5 h-5 mr-2" />
                      {course?.price && course.price > 0 
                        ? `Enroll — $${course.price.toFixed(2)}` 
                        : 'Enroll Now — Free'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10"
                      onClick={handleWishlist}
                      loading={wishlistLoading}
                    >
                      {isWishlisted ? (
                        <HiHeart className="w-5 h-5 mr-2 text-red-400" />
                      ) : (
                        <HiOutlineHeart className="w-5 h-5 mr-2" />
                      )}
                      {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Course Image Card */}
            <div className="order-1 lg:order-2">
              <Card className="overflow-hidden shadow-2xl" padding="none">
                <div className="relative aspect-video">
                  <Image
                    src={course.wall || '/images/course-placeholder.jpg'}
                    alt={course.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <HiPlay className="w-12 h-12 p-3 bg-white/20 backdrop-blur-sm rounded-full" />
                        <span className="font-medium">Preview Course</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Price & Enrollment Card - Desktop */}
                <div className="hidden lg:block p-6 bg-white dark:bg-neutral-800">
                  <div className="mb-4">
                    {(course.price && course.price > 0) ? (
                      <>
                        <span className="text-3xl font-bold text-neutral-800 dark:text-white">
                          ${course.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-neutral-500 line-through ml-2">
                          ${(course.price * 1.2).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-neutral-800 dark:text-white">
                        Free
                      </span>
                    )}
                  </div>

                  {isEnrolled ? (
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="w-full mb-3"
                      onClick={goToCourse}
                    >
                      <HiPlay className="w-5 h-5 mr-2" />
                      Go to Course
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-full mb-3"
                        onClick={handleEnroll}
                        loading={enrolling}
                      >
                        <HiAcademicCap className="w-5 h-5 mr-2" />
                        {course?.price && course.price > 0 ? 'Buy Now' : 'Enroll — Free'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="w-full"
                        onClick={handleWishlist}
                        loading={wishlistLoading}
                      >
                        {isWishlisted ? (
                          <HiHeart className="w-5 h-5 mr-2 text-red-500" />
                        ) : (
                          <HiOutlineHeart className="w-5 h-5 mr-2" />
                        )}
                        {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                      </Button>
                    </>
                  )}

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                      <HiUserGroup className="w-5 h-5 text-primary-500" />
                      <span>{availableSeats} seats available</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                      <HiClock className="w-5 h-5 text-primary-500" />
                      <span>Full lifetime access</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                      <HiCheckCircle className="w-5 h-5 text-primary-500" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Summary Section */}
            <Card padding="none" className="overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <HiSparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-800 dark:text-white">
                      AI-Powered Course Insights
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Get intelligent summaries and recommendations
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <CourseSummary courseId={c_id} type="course" />
              </div>
            </Card>

            {/* Prerequisites */}
            <Card>
              <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-4 flex items-center gap-2">
                <HiArrowRight className="w-6 h-6 text-primary-500" />
                Prerequisites
              </h2>
              {course?.prerequisites && course.prerequisites.length > 0 ? (
                <div className="space-y-3">
                  {course.prerequisites.map((p, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <HiCheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700 dark:text-neutral-300">{p}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  No prerequisites listed for this course.
                </p>
              )}
            </Card>

            {/* What You'll Learn */}
            <Card>
              <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-4 flex items-center gap-2">
                <HiBookOpen className="w-6 h-6 text-primary-500" />
                What You'll Learn
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {(course?.outcomes && course.outcomes.length > 0 ? course.outcomes : [
                  'Core concepts and fundamentals',
                  'Hands-on practical projects',
                  'Industry best practices',
                  'Real-world applications',
                  'Problem-solving techniques',
                  'Professional skill development',
                ]).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <HiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-300">{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-800 dark:text-white flex items-center gap-2">
                  <HiChartBar className="w-6 h-6 text-primary-500" />
                  Student Reviews
                </h2>
                <div className="flex items-center gap-2">
                  <StarRating rating={course.rating} size="md" />
                  <span className="text-neutral-500">({reviews.length})</span>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <ReviewCard key={index} review={review} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-2">
                    No Reviews Yet
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Be the first to review this course!
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Course Stats Card */}
            <Card>
              <h3 className="font-bold text-neutral-800 dark:text-white mb-4">
                Course Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700">
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <HiUserGroup className="w-5 h-5" />
                    <span>Enrolled</span>
                  </div>
                  <span className="font-semibold text-neutral-800 dark:text-white">
                    {course.student_count || 0} students
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700">
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <HiAcademicCap className="w-5 h-5" />
                    <span>Total Seats</span>
                  </div>
                  <span className="font-semibold text-neutral-800 dark:text-white">
                    {course.seat || 40}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700">
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <HiOfficeBuilding className="w-5 h-5" />
                    <span>Field</span>
                  </div>
                  <Badge variant="primary">{course.field || 'Technology'}</Badge>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <HiStar className="w-5 h-5" />
                    <span>Rating</span>
                  </div>
                  <StarRating rating={course.rating} size="sm" />
                </div>
              </div>
            </Card>

            {/* Instructor Card */}
            <Card>
              <h3 className="font-bold text-neutral-800 dark:text-white mb-4">
                Your Instructor
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {course.name?.charAt(0)?.toUpperCase() || 'I'}
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800 dark:text-white">
                    {course.name}
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {course.qualification}
                  </p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Expert in {course.subject}
              </p>
              <Link href={`/instructors/${course.i_id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Profile
                  <HiArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>

            {/* Share Card */}
            <Card className="bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 border-primary-100 dark:border-primary-800">
              <div className="text-center">
                <div className="text-4xl mb-3">🎓</div>
                <h3 className="font-bold text-neutral-800 dark:text-white mb-2">
                  Share This Course
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Help others discover this amazing course
                </p>
                <div className="flex justify-center gap-2">
                  {['Twitter', 'LinkedIn', 'Facebook'].map((platform) => (
                    <Button key={platform} variant="ghost" size="sm" className="px-3">
                      {platform}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = async (context) => {
  const { params } = context;
  const { c_id } = params;
  return { props: { c_id } };
};
