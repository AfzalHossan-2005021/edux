import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import secureLocalStorage from 'react-secure-storage';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Badge } from '@/components/ui';
import { HiDownload, HiExternalLink, HiCheck, HiClipboard, HiArrowLeft, HiSparkles, HiAcademicCap, HiCalendar } from 'react-icons/hi';
import { downloadCertificate, getCertificateBase64, generateCertificateData } from '@/lib/certificate';

const CertificatesSkeleton = () => (
  <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <div className="bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 pt-20 pb-28">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded-full w-48 mx-auto mb-4" />
          <div className="h-12 bg-white/20 rounded-xl w-96 mx-auto mb-2" />
          <div className="h-6 bg-white/20 rounded-lg w-64 mx-auto" />
        </div>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-4 -mt-24">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white dark:bg-neutral-800 rounded-2xl shadow p-4 animate-pulse min-h-[220px] h-auto" />
        ))}
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <Card className="text-center py-12">
    <div className="text-6xl mb-4">🎖️</div>
    <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-2">No Certificates Yet</h3>
    <p className="text-neutral-600 dark:text-neutral-400 mb-6">Complete courses to earn certificates. Find something new to learn!</p>
    <Link href="/student">
      <Button variant="primary">Explore Courses</Button>
    </Link>
  </Card>
);

const CertificateCard = ({ cert, userId }) => {
  const [preview, setPreview] = useState(cert.previewUrl || null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const makePreview = async () => {
      if (!preview && cert.studentName && cert.courseName) {
        try {
          const data = generateCertificateData({
            studentName: cert.studentName,
            courseName: cert.courseName,
            instructorName: cert.instructorName,
            completionDate: cert.completionDate,
            certificateId: cert.certificateId,
            hoursCompleted: cert.hoursCompleted,
            eduxSignature: cert.eduxSignature,
            instructorSignature: cert.instructorSignature
          });
          const b64 = await getCertificateBase64(data);
          if (mounted) setPreview(b64);
        } catch (err) {
          // silently fail; preview not critical
          console.error('Preview generation failed', err);
        }
      }
    };
    makePreview();
    return () => { mounted = false; };
  }, [cert, preview]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const data = generateCertificateData({
        studentName: cert.studentName,
        courseName: cert.courseName,
        instructorName: cert.instructorName,
        completionDate: cert.completionDate,
        certificateId: cert.certificateId,
        hoursCompleted: cert.hoursCompleted,
        eduxSignature: cert.eduxSignature,
        instructorSignature: cert.instructorSignature
      });
      await downloadCertificate(data);
    } catch (err) {
      console.error('Download fail', err);
      alert('Failed to download certificate');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!cert.certificateId) return;
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${cert.certificateId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="overflow-hidden min-h-[220px]">
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-neutral-800 dark:text-white truncate">{cert.courseName}</h4>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">By {cert.instructorName || '—'}</p>
            <div className="flex items-center gap-3 mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              <span className="flex items-center gap-2">
                <HiCalendar className="w-4 h-4" /> {cert.completionDate}
              </span>
              <Badge variant="success" size="sm">Verified</Badge>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href={`/certificate/${cert.courseId}/${userId}`}>
            <Button size="sm" variant="primary">View</Button>
          </Link>

          <Button size="sm" variant="outline" onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? 'Downloading...' : (
              <>
                <HiDownload className="w-4 h-4 mr-2" /> Download
              </>
            )}
          </Button>

          <Link href={`/verify/${cert.certificateId}`}>
            <Button size="sm" variant="ghost">
              <HiExternalLink className="w-4 h-4 mr-2" /> Verify
            </Button>
          </Link>

          <button onClick={handleCopy} title="Copy verification link" className="ml-auto p-2 rounded-md text-neutral-500 hover:text-primary-500 hover:bg-primary-50 transition-colors">
            {copied ? <HiCheck className="w-5 h-5 text-emerald-500" /> : <HiClipboard className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default function StudentCertificatesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = user?.u_id || (typeof window !== 'undefined' ? secureLocalStorage.getItem('u_id') : null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/student/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!userId) {
      setError('Please log in to view your certificates');
      setLoading(false);
      return;
    }

    const fetchCertificates = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/certificates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to fetch certificates');
        }

        const data = await res.json();
        // Expecting an array of certificate objects
        setCertificates(Array.isArray(data) ? data : (data.certificates || []));
      } catch (err) {
        console.error('Certificates fetch failed', err);
        setError(err.message || 'Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [userId]);

  if (authLoading || loading) return <CertificatesSkeleton />;
  if (error) return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="text-center p-8">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">Unable to load certificates</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
          <Button variant="primary" onClick={() => router.push('/student')}>Back to Dashboard</Button>
        </Card>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>My Certificates | EduX</title>
        <meta name="description" content="Your achieved certificates" />
      </Head>

      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div className="bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 pt-20 pb-28">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Link href="/student" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors">
              <HiArrowLeft className="w-5 h-5" /> Back to Dashboard
            </Link>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400/20 backdrop-blur-sm rounded-full mb-4">
              <HiSparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="text-amber-200 font-medium">Achievements</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">My Certificates</h1>
            <p className="text-lg text-white/80">A record of the courses you've completed and earned certificates for.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-24 pb-12">
          {certificates.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map(cert => (
                <CertificateCard key={cert.certificateId} cert={cert} userId={userId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
