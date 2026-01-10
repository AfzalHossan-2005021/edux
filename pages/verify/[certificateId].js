/**
 * Certificate Verification Page
 * Allows anyone to verify the authenticity of a certificate
 * Route: /verify/[certificateId]
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Card, Button, Badge } from '@/components/ui';
import {
  HiCheckCircle,
  HiXCircle,
  HiShieldCheck,
  HiAcademicCap,
  HiUser,
  HiBookOpen,
  HiCalendar,
  HiClipboard,
  HiCheck,
  HiArrowLeft,
  HiExternalLink,
  HiSearch,
  HiLockClosed,
  HiRefresh,
} from 'react-icons/hi';

// Animated Shield Icon
const AnimatedShield = ({ isValid }) => (
  <div className="relative">
    <div className={`w-24 h-24 rounded-3xl flex items-center justify-center ${
      isValid 
        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30'
        : 'bg-gradient-to-br from-red-400 to-rose-500 shadow-lg shadow-red-500/30'
    }`}>
      {isValid ? (
        <HiShieldCheck className="w-12 h-12 text-white" />
      ) : (
        <HiXCircle className="w-12 h-12 text-white" />
      )}
    </div>
    {isValid && (
      <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
        <HiCheckCircle className="w-5 h-5 text-amber-900" />
      </div>
    )}
  </div>
);

// Loading Skeleton
const VerificationSkeleton = () => (
  <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-32">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="animate-pulse">
          <div className="w-24 h-24 bg-white/20 rounded-3xl mx-auto mb-6" />
          <div className="h-8 bg-white/20 rounded-lg w-64 mx-auto mb-4" />
          <div className="h-6 bg-white/20 rounded-lg w-48 mx-auto" />
        </div>
      </div>
    </div>
    <div className="max-w-2xl mx-auto px-4 -mt-20">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 animate-pulse">
        <div className="space-y-4">
          <div className="h-16 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
          <div className="h-16 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
          <div className="h-16 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

// Detail Row Component
const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
    <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
      <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="font-semibold text-neutral-800 dark:text-white truncate">
        {value || '—'}
      </p>
    </div>
  </div>
);

export default function VerifyCertificatePage() {
  const router = useRouter();
  const { certificateId } = router.query;
  
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [manualId, setManualId] = useState('');

  useEffect(() => {
    if (!certificateId) return;

    const verifyCertificate = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/certificate?id=${encodeURIComponent(certificateId)}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setCertificate(data);
          setIsValid(true);
        } else {
          setIsValid(false);
          setError(data.error || 'Certificate not found');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setIsValid(false);
        setError('Failed to verify certificate');
      } finally {
        setIsLoading(false);
      }
    };

    verifyCertificate();
  }, [certificateId]);

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (manualId.trim()) {
      router.push(`/verify/${encodeURIComponent(manualId.trim())}`);
    }
  };

  if (isLoading) {
    return <VerificationSkeleton />;
  }

  return (
    <>
      <Head>
        <title>
          {isValid 
            ? `Verified Certificate - ${certificate?.courseName} | EduX` 
            : 'Certificate Verification | EduX'}
        </title>
        <meta name="description" content="Verify the authenticity of an EduX certificate" />
      </Head>

      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Hero Section */}
        <div className={`relative pt-20 pb-32 overflow-hidden ${
          isValid 
            ? 'bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900'
            : isValid === false 
              ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
              : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        }`}>
          {/* Decorative Elements */}
          <div className="absolute inset-0">
            <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl ${
              isValid ? 'bg-emerald-400/10' : 'bg-slate-400/10'
            }`} />
            <div className={`absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl ${
              isValid ? 'bg-teal-400/10' : 'bg-slate-400/10'
            }`} />
          </div>
          
          <div className="relative max-w-2xl mx-auto px-4 text-center">
            {/* Back Button */}
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
            >
              <HiArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>

            {/* Shield Icon */}
            <div className="flex justify-center mb-6">
              <AnimatedShield isValid={isValid} />
            </div>

            {/* Status Message */}
            {isValid ? (
              <>
                <Badge variant="success" size="lg" className="mb-4 gap-2">
                  <HiCheckCircle className="w-5 h-5" />
                  Verified Certificate
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  This Certificate is Authentic
                </h1>
                <p className="text-lg text-white/70">
                  Issued by EduX Learning Platform
                </p>
              </>
            ) : (
              <>
                <Badge variant="error" size="lg" className="mb-4 gap-2 bg-red-500/20 text-red-300 border-red-500/30">
                  <HiXCircle className="w-5 h-5" />
                  Verification Failed
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Certificate Not Found
                </h1>
                <p className="text-lg text-white/70">
                  {error || 'The certificate ID could not be verified'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 -mt-20 relative z-10 pb-12">
          {isValid ? (
            /* Verified Certificate Card */
            <Card className="shadow-2xl overflow-hidden" padding="none">
              {/* Certificate Header */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 border-b border-emerald-100 dark:border-emerald-800/30">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                      <HiAcademicCap className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800 dark:text-white">Certificate of Completion</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">EduX Learning Platform</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <HiShieldCheck className="w-6 h-6" />
                    <span className="font-semibold">Verified</span>
                  </div>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="p-6 space-y-4">
                <DetailRow 
                  icon={HiUser} 
                  label="Recipient" 
                  value={certificate?.studentName} 
                />
                <DetailRow 
                  icon={HiBookOpen} 
                  label="Course Completed" 
                  value={certificate?.courseName} 
                />
                <DetailRow 
                  icon={HiAcademicCap} 
                  label="Instructor" 
                  value={certificate?.instructorName} 
                />
                <DetailRow 
                  icon={HiCalendar} 
                  label="Issue Date" 
                  value={certificate?.issuedDate ? new Date(certificate.issuedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'N/A'} 
                />

                {/* Certificate ID */}
                <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Certificate ID</p>
                      <code className="text-sm font-mono text-neutral-800 dark:text-white break-all">
                        {certificateId}
                      </code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(certificateId)}
                      className="p-2 text-neutral-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors flex-shrink-0"
                      title="Copy ID"
                    >
                      {copied ? <HiCheck className="w-5 h-5 text-emerald-500" /> : <HiClipboard className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-neutral-50 dark:bg-neutral-850 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <HiShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>This certificate has been verified as authentic</span>
                </div>
              </div>
            </Card>
          ) : (
            /* Invalid Certificate Card */
            <Card className="shadow-2xl" padding="lg">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <HiLockClosed className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">
                  Unable to Verify
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  The certificate ID <code className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-sm">{certificateId}</code> could not be found in our records.
                </p>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/30 text-left mb-6">
                  <p className="text-sm text-amber-700 dark:text-amber-300 font-medium mb-2">
                    Possible reasons:
                  </p>
                  <ul className="text-sm text-amber-600 dark:text-amber-400 space-y-1 list-disc list-inside">
                    <li>The certificate ID may be incorrect</li>
                    <li>The certificate may have been revoked</li>
                    <li>This may not be a valid EduX certificate</li>
                  </ul>
                </div>

                <Button 
                  variant="primary" 
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  <HiArrowLeft className="w-5 h-5 mr-2" />
                  Return to Home
                </Button>
              </div>
            </Card>
          )}

          {/* Manual Verification Form */}
          <Card className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <HiSearch className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
                Verify Another Certificate
              </h3>
            </div>
            <form onSubmit={handleManualVerify} className="flex gap-3">
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="Enter certificate ID..."
                className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Button type="submit" variant="primary" disabled={!manualId.trim()}>
                <HiRefresh className="w-5 h-5 mr-2" />
                Verify
              </Button>
            </form>
          </Card>

          {/* Info Section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              EduX certificates are digitally signed and can be verified using this page.
              <br />
              For questions, contact <a href="mailto:support@edux.com" className="text-primary-500 hover:underline">support@edux.com</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
