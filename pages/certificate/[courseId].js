/**
 * Certificate Download Page
 * Modern, attractive UI for viewing and downloading course certificates
 * Route: /certificate/[courseId]/[studentId]
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import secureLocalStorage from 'react-secure-storage';
import { useAuth } from '@/context/AuthContext';
import { downloadCertificate, getCertificateBase64, generateCertificateData } from '@/lib/certificate';
import { Card, Button, Badge } from '@/components/ui';
import {
  HiDownload,
  HiShare,
  HiCheckCircle,
  HiBadgeCheck,
  HiAcademicCap,
  HiCalendar,
  HiClock,
  HiUser,
  HiBookOpen,
  HiArrowLeft,
  HiSparkles,
  HiShieldCheck,
  HiClipboard,
  HiCheck,
  HiExternalLink,
  HiLockClosed,
  HiExclamation,
} from 'react-icons/hi';

// Confetti Animation Component
const Confetti = () => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
};

// Loading Skeleton
const CertificateSkeleton = () => (
  <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 pt-20 pb-32">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded-full w-48 mx-auto mb-4" />
          <div className="h-12 bg-white/20 rounded-xl w-96 mx-auto mb-2" />
          <div className="h-6 bg-white/20 rounded-lg w-64 mx-auto" />
        </div>
      </div>
    </div>
    <div className="max-w-4xl mx-auto px-4 -mt-24">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 animate-pulse">
        <div className="aspect-[1.4/1] bg-neutral-200 dark:bg-neutral-700 rounded-xl mb-8" />
        <div className="flex gap-4 justify-center">
          <div className="h-12 w-40 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
          <div className="h-12 w-40 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

// Error State Component
const ErrorState = ({ error, onBack }) => (
  <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20 flex items-center justify-center px-4">
    <Card className="max-w-md w-full text-center" padding="lg">
      <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
        <HiLockClosed className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-3">
        Certificate Not Available
      </h2>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
        {error}
      </p>
      <div className="space-y-3">
        <Button variant="primary" onClick={onBack} className="w-full">
          <HiArrowLeft className="w-5 h-5 mr-2" />
          Back to My Courses
        </Button>
        <p className="text-sm text-neutral-500 dark:text-neutral-500">
          Complete all lectures to unlock your certificate
        </p>
      </div>
    </Card>
  </div>
);

// Detail Item Component
const DetailItem = ({ icon: Icon, label, value, mono = false }) => (
  <div className="flex items-start gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className={`font-semibold text-neutral-800 dark:text-white truncate ${mono ? 'font-mono text-sm' : ''}`}>
        {value || '—'}
      </p>
    </div>
  </div>
);

export default function CertificatePage() {
  const router = useRouter();
  const { courseId } = router.query;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [certificate, setCertificate] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Get user ID from auth context or secureLocalStorage
  const userId = user?.u_id || (typeof window !== 'undefined' ? secureLocalStorage.getItem('u_id') : null);

  useEffect(() => {
    if (!courseId) return;
    if (authLoading) return;

    const fetchCertificate = async () => {
      try {
        // Check if user is logged in
        if (!userId) {
          setError('Please log in to view your certificate');
          setIsLoading(false);
          return;
        }
        
        // Generate certificate data from API
        const response = await fetch('/api/certificate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, courseId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to generate certificate');
        }

        const certData = await response.json();
        setCertificate(certData);

        // Generate preview
        const fullCertData = generateCertificateData({
          studentName: certData.studentName,
          courseName: certData.courseName,
          instructorName: certData.instructorName,
          completionDate: certData.completionDate,
          certificateId: certData.certificateId,
          hoursCompleted: certData.hoursCompleted,
        });

        const preview = await getCertificateBase64(fullCertData);
        setPreviewUrl(preview);
        
        // Show confetti on successful load
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } catch (err) {
        console.error('Certificate error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificate();
  }, [courseId, authLoading, userId]);

  const handleDownload = async () => {
    if (!certificate) return;

    setIsDownloading(true);
    try {
      const certData = generateCertificateData({
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        instructorName: certificate.instructorName,
        completionDate: certificate.completionDate,
        certificateId: certificate.certificateId,
        hoursCompleted: certificate.hoursCompleted,
      });

      await downloadCertificate(certData);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download certificate');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!certificate) return;

    const shareUrl = `${window.location.origin}/verify/${certificate.certificateId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `EduX Certificate - ${certificate.courseName}`,
          text: `I completed ${certificate.courseName} on EduX!`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || isLoading) {
    return <CertificateSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onBack={() => router.push('/student')} />;
  }

  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${certificate?.certificateId}`;

  return (
    <>
      <Head>
        <title>Certificate - {certificate?.courseName} | EduX</title>
        <meta name="description" content={`Certificate of completion for ${certificate?.courseName}`} />
      </Head>

      {showConfetti && <Confetti />}

      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 pt-20 pb-40 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
            <div className="absolute top-40 right-20 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl animate-pulse" />
          </div>

          {/* Floating Badges */}
          <div className="absolute top-32 left-[10%] animate-float opacity-60">
            <div className="w-12 h-12 bg-amber-400/30 rounded-xl rotate-12" />
          </div>
          <div className="absolute top-48 right-[15%] animate-float-delayed opacity-60">
            <div className="w-16 h-16 bg-emerald-400/30 rounded-full" />
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            {/* Back Button */}
            <Link 
              href="/student" 
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
            >
              <HiArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>

            {/* Success Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400/20 backdrop-blur-sm rounded-full mb-6">
              <HiSparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="text-amber-200 font-medium">Achievement Unlocked!</span>
              <HiSparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              🎉 Congratulations!
            </h1>
            <p className="text-xl text-white/80 mb-2">
              You've successfully completed
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300">
              {certificate?.courseName}
            </h2>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 -mt-32 relative z-10 pb-12">
          {/* Certificate Preview Card */}
          <Card className="shadow-2xl overflow-hidden" padding="none">
            {/* Certificate Header */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-6 border-b border-amber-100 dark:border-amber-800/30">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                    <HiAcademicCap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-800 dark:text-white">Certificate of Completion</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">EduX Learning Platform</p>
                  </div>
                </div>
                <Badge variant="success" size="lg" className="gap-2">
                  <HiCheckCircle className="w-5 h-5" />
                  Verified
                </Badge>
              </div>
            </div>

            {/* Certificate Preview */}
            <div className="p-6 md:p-8 bg-white dark:bg-neutral-800">
              {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden shadow-inner border-4 border-amber-100 dark:border-amber-900/30">
                  <iframe
                    src={previewUrl}
                    className="w-full h-[400px] md:h-[500px]"
                    title="Certificate Preview"
                  />
                  <div className="absolute inset-0 pointer-events-none border-4 border-transparent rounded-xl" 
                       style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.05)' }} />
                </div>
              ) : (
                <div className="aspect-[1.4/1] bg-neutral-100 dark:bg-neutral-700 rounded-xl flex items-center justify-center">
                  <p className="text-neutral-500">Certificate preview loading...</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-neutral-50 dark:bg-neutral-850 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="min-w-[180px] bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/25"
                >
                  {isDownloading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <HiDownload className="w-5 h-5 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShare}
                  className="min-w-[180px] border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                >
                  {copied ? (
                    <>
                      <HiCheck className="w-5 h-5 mr-2" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <HiShare className="w-5 h-5 mr-2" />
                      Share Certificate
                    </>
                  )}
                </Button>

                <Link href={`/verify/${certificate?.certificateId}`}>
                  <Button variant="ghost" size="lg" className="min-w-[180px]">
                    <HiShieldCheck className="w-5 h-5 mr-2" />
                    Verify
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Certificate Details */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {/* Details Card */}
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <HiBadgeCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
                  Certificate Details
                </h3>
              </div>
              
              <div className="space-y-3">
                <DetailItem 
                  icon={HiUser} 
                  label="Recipient" 
                  value={certificate?.studentName} 
                />
                <DetailItem 
                  icon={HiBookOpen} 
                  label="Course" 
                  value={certificate?.courseName} 
                />
                <DetailItem 
                  icon={HiAcademicCap} 
                  label="Instructor" 
                  value={certificate?.instructorName} 
                />
                <DetailItem 
                  icon={HiCalendar} 
                  label="Completion Date" 
                  value={certificate?.completionDate} 
                />
                {certificate?.hoursCompleted && (
                  <DetailItem 
                    icon={HiClock} 
                    label="Course Duration" 
                    value={`${certificate.hoursCompleted} hours`} 
                  />
                )}
              </div>
            </Card>

            {/* Verification Card */}
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <HiShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
                  Verification
                </h3>
              </div>

              <div className="space-y-4">
                {/* Certificate ID */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Certificate ID</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-sm text-neutral-800 dark:text-white bg-white dark:bg-neutral-800 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 truncate">
                      {certificate?.certificateId}
                    </code>
                    <button
                      onClick={() => copyToClipboard(certificate?.certificateId)}
                      className="p-2 text-neutral-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      title="Copy ID"
                    >
                      {copied ? <HiCheck className="w-5 h-5 text-emerald-500" /> : <HiClipboard className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Verification URL */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium mb-2 flex items-center gap-2">
                    <HiCheckCircle className="w-4 h-4" />
                    Publicly Verifiable
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    Anyone can verify this certificate using the verification link or certificate ID.
                  </p>
                </div>

                {/* Verify Button */}
                <Link href={`/verify/${certificate?.certificateId}`} className="block">
                  <Button variant="outline" className="w-full justify-center">
                    <HiExternalLink className="w-5 h-5 mr-2" />
                    Open Verification Page
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Achievement Banner */}
          <Card className="mt-8 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800/30">
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl shadow-lg shadow-amber-500/30 mb-4">
                <HiSparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">
                Keep up the great work!
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4 max-w-md mx-auto">
                You've proven your dedication to learning. Continue your journey and unlock more certificates!
              </p>
              <Link href="/student">
                <Button variant="primary" size="md">
                  Explore More Courses
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </>
  );
}
