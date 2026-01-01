/**
 * Certificate Download Page
 * Allows users to view and download their course certificates
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { downloadCertificate, getCertificateBase64, generateCertificateData } from '@/lib/certificate';

export default function CertificatePage() {
  const router = useRouter();
  const { courseId } = router.query;
  
  const [certificate, setCertificate] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    const fetchCertificate = async () => {
      try {
        // Get user ID from localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
          setError('Please log in to view your certificate');
          setIsLoading(false);
          return;
        }

        const user = JSON.parse(userData);
        
        // Generate certificate data from API
        const response = await fetch('/api/certificate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.U_ID, courseId }),
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
      } catch (err) {
        console.error('Certificate error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificate();
  }, [courseId]);

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
      alert('Certificate link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating your certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Certificate Not Available</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/user" className="text-blue-600 hover:text-blue-700">
            Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Certificate - {certificate?.courseName} | EduX</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🎉 Congratulations!</h1>
            <p className="text-gray-600">You've completed the course</p>
          </div>

          {/* Certificate Preview */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-[500px]"
                title="Certificate Preview"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Certificate
            </button>

            <Link
              href={`/verify/${certificate?.certificateId}`}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verify Certificate
            </Link>
          </div>

          {/* Certificate Details */}
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Certificate Details</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Certificate ID</dt>
                <dd className="font-mono text-sm">{certificate?.certificateId}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Recipient</dt>
                <dd>{certificate?.studentName}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Course</dt>
                <dd>{certificate?.courseName}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Instructor</dt>
                <dd>{certificate?.instructorName}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Completion Date</dt>
                <dd>{certificate?.completionDate}</dd>
              </div>
              {certificate?.hoursCompleted && (
                <div>
                  <dt className="text-sm text-gray-500">Duration</dt>
                  <dd>{certificate.hoursCompleted} hours</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
