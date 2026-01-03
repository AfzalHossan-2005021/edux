/**
 * Student Profile Page
 * Route: /student/profile
 * 
 * Modern profile management with editable fields and preferences
 */

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Badge, Skeleton } from '../../components/ui';
import { apiGet, apiPost } from '../../lib/api';
import {
  HiAcademicCap,
  HiArrowLeft,
  HiBadgeCheck,
  HiBookOpen,
  HiCamera,
  HiCheck,
  HiClock,
  HiCog,
  HiExclamationCircle,
  HiMail,
  HiPencil,
  HiPhone,
  HiPhotograph,
  HiSave,
  HiShieldCheck,
  HiSparkles,
  HiStar,
  HiTrendingUp,
  HiUser,
  HiUserCircle,
  HiLockClosed,
  HiEye,
  HiEyeOff,
  HiGlobe,
  HiCalendar,
  HiLocationMarker,
  HiBriefcase,
} from 'react-icons/hi';

// Input Field Component
const InputField = ({
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
  error,
  helpText,
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 rounded-xl border ${
          error
            ? 'border-red-500 focus:ring-red-500/30'
            : 'border-neutral-200 dark:border-neutral-700 focus:ring-primary-500/30'
        } bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
      />
    </div>
    {error && (
      <p className="text-sm text-red-500 flex items-center gap-1">
        <HiExclamationCircle className="w-4 h-4" />
        {error}
      </p>
    )}
    {helpText && !error && (
      <p className="text-sm text-neutral-500">{helpText}</p>
    )}
  </div>
);

// Text Area Component
const TextAreaField = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
}) => (
  <div className="space-y-1.5">
    <div className="flex justify-between">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      {maxLength && (
        <span className="text-xs text-neutral-400">
          {value?.length || 0}/{maxLength}
        </span>
      )}
    </div>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-primary-500/30 transition-all resize-none"
    />
  </div>
);

// Stats Card Component
const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <div className={`${gradient} rounded-2xl p-4 text-white`}>
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white/20 rounded-lg">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-white/80">{label}</p>
      </div>
    </div>
  </div>
);

// Section Component
const Section = ({ title, description, icon: Icon, children }) => (
  <Card className="overflow-hidden">
    <div className="border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-800 dark:text-white">{title}</h3>
          {description && (
            <p className="text-sm text-neutral-500">{description}</p>
          )}
        </div>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </Card>
);

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  
  // Profile form state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    occupation: '',
    website: '',
    joinDate: '',
    avatar: null,
  });

  // Password form state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // Stats
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    certificates: 0,
    hoursLearned: 0,
  });

  // Errors
  const [errors, setErrors] = useState({});

  // Fetch user data
  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchUserData = async () => {
      try {
        // Fetch user info
        const userRes = await apiGet(`/api/user_info?u_id=${user.u_id}`);
        const userData = await userRes.json();

        console.log('Fetched user data:', userData);
        
        if (userData) {
          setProfile({
            name: userData.name || user.name || '',
            email: userData.email || user.email || '',
            date_of_birth: userData.date_of_birth || '',
            gender: userData.gender || '',
            phone: userData.phone || '',
            bio: userData.bio || '',
            location: userData.location || '',
            occupation: userData.occupation || '',
            website: userData.website || '',
            joinDate: userData.join_date || new Date().toISOString(),
            avatar: userData.avatar || null,
          });
        }

        // Fetch user stats
        const coursesRes = await apiGet(`/api/my_courses?u_id=${user.u_id}`);
        const coursesData = await coursesRes.json();
        
        if (coursesData) {
          const courses = Array.isArray(coursesData) ? coursesData : [];
          const completed = courses.filter(c => c.progress >= 100).length;
          
          setStats({
            enrolledCourses: courses.length,
            completedCourses: completed,
            certificates: completed,
            hoursLearned: courses.reduce((acc, c) => acc + (c.hours_watched || 0), 0),
          });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, router]);

  // Handle profile update
  const handleUpdateProfile = async () => {
    setErrors({});
    
    // Validate
    const newErrors = {};
    if (!profile.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await apiPost('/api/update_profile', {
        u_id: user.u_id,
        ...profile,
      });

      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        if (refreshUser) refreshUser();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    setErrors({});

    // Validate
    const newErrors = {};
    if (!passwords.current) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwords.new) {
      newErrors.newPassword = 'New password is required';
    } else if (passwords.new.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwords.new !== passwords.confirm) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await apiPost('/api/update_password', {
        u_id: user.u_id,
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });

      if (res.ok) {
        setPasswords({ current: '', new: '', confirm: '' });
        setShowPasswordFields(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setErrors({ currentPassword: 'Current password is incorrect' });
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setErrors({ general: 'Failed to change password. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Tabs
  const tabs = [
    { id: 'profile', label: 'Profile', icon: HiUser },
    { id: 'security', label: 'Security', icon: HiShieldCheck },
    { id: 'preferences', label: 'Preferences', icon: HiCog },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Profile | EduX</title>
        <meta name="description" content="Manage your EduX profile and account settings" />
      </Head>

      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Header */}
        <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 pt-8 pb-32 overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
            >
              <HiArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>

            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-400 to-indigo-500 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-xl bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex items-center justify-center">
                    {profile.avatar ? (
                      <Image
                        src={profile.avatar}
                        alt={profile.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <HiUserCircle className="w-24 h-24 text-neutral-400" />
                    )}
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-neutral-800 rounded-xl shadow-lg hover:shadow-xl transition-all group-hover:scale-110"
                >
                  <HiCamera className="w-5 h-5 text-primary-600" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* Info */}
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <h1 className="text-3xl font-bold text-white">{profile.name || 'Your Name'}</h1>
                  <HiBadgeCheck className="w-6 h-6 text-primary-400" />
                </div>
                <p className="text-white/80 mb-4">{profile.email}</p>
                <div className="flex items-center gap-4 text-white/60 text-sm justify-center md:justify-start">
                  <span className="flex items-center gap-1">
                    <HiCalendar className="w-4 h-4" />
                    Joined {new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <HiLocationMarker className="w-4 h-4" />
                      {profile.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={HiBookOpen}
              label="Enrolled"
              value={stats.enrolledCourses}
              gradient="bg-gradient-to-br from-primary-500 to-primary-700"
            />
            <StatCard
              icon={HiCheck}
              label="Completed"
              value={stats.completedCourses}
              gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
            />
            <StatCard
              icon={HiAcademicCap}
              label="Certificates"
              value={stats.certificates}
              gradient="bg-gradient-to-br from-amber-500 to-amber-700"
            />
            <StatCard
              icon={HiClock}
              label="Hours Learned"
              value={stats.hoursLearned}
              gradient="bg-gradient-to-br from-violet-500 to-violet-700"
            />
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
              <div className="p-1 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                <HiCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                Your changes have been saved successfully!
              </p>
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
              <div className="p-1 bg-red-100 dark:bg-red-900/40 rounded-full">
                <HiExclamationCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-red-700 dark:text-red-400 font-medium">
                {errors.general}
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <Section
                title="Basic Information"
                description="Update your personal details"
                icon={HiUser}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField
                    label="Full Name"
                    icon={HiUser}
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Enter your name"
                    error={errors.name}
                  />
                  <InputField
                    label="Email Address"
                    icon={HiMail}
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="Enter your email"
                    error={errors.email}
                  />
                  <InputField
                    label="Date of Birth"
                    icon={HiCalendar}
                    type="date"
                    value={profile.date_of_birth}
                    onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                  />
                  <InputField
                    label="Gender"
                    icon={HiUser}
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    placeholder="Male, Female, Other"
                  />
                  <InputField
                    label="Phone Number"
                    icon={HiPhone}
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                  <InputField
                    label="Location"
                    icon={HiLocationMarker}
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="City, Country"
                  />
                  <InputField
                    label="Occupation"
                    icon={HiBriefcase}
                    value={profile.occupation}
                    onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                    placeholder="What do you do?"
                  />
                  <InputField
                    label="Website"
                    icon={HiGlobe}
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div className="mt-6">
                  <TextAreaField
                    label="Bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    maxLength={300}
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={handleUpdateProfile}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <HiSave className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </Section>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Password */}
              <Section
                title="Change Password"
                description="Update your password to keep your account secure"
                icon={HiLockClosed}
              >
                {!showPasswordFields ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <HiShieldCheck className="w-8 h-8 text-primary-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-neutral-800 dark:text-white mb-2">
                      Password Protected
                    </h4>
                    <p className="text-neutral-500 mb-6">
                      Your account is secured with a password. Click below to change it.
                    </p>
                    <Button variant="outline" onClick={() => setShowPasswordFields(true)}>
                      <HiPencil className="w-5 h-5 mr-2" />
                      Change Password
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <InputField
                        label="Current Password"
                        icon={HiLockClosed}
                        type={showPassword.current ? 'text' : 'password'}
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        placeholder="Enter current password"
                        error={errors.currentPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                        className="absolute right-4 top-9 text-neutral-400 hover:text-neutral-600"
                      >
                        {showPassword.current ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="relative">
                      <InputField
                        label="New Password"
                        icon={HiLockClosed}
                        type={showPassword.new ? 'text' : 'password'}
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        placeholder="Enter new password"
                        error={errors.newPassword}
                        helpText="Minimum 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                        className="absolute right-4 top-9 text-neutral-400 hover:text-neutral-600"
                      >
                        {showPassword.new ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="relative">
                      <InputField
                        label="Confirm New Password"
                        icon={HiLockClosed}
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        placeholder="Confirm new password"
                        error={errors.confirmPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                        className="absolute right-4 top-9 text-neutral-400 hover:text-neutral-600"
                      >
                        {showPassword.confirm ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowPasswordFields(false);
                          setPasswords({ current: '', new: '', confirm: '' });
                          setErrors({});
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleChangePassword}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <HiCheck className="w-5 h-5 mr-2" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Section>

              {/* Account Security */}
              <Section
                title="Account Security"
                description="Manage your account security settings"
                icon={HiShieldCheck}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                        <HiMail className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800 dark:text-white">Email Verified</p>
                        <p className="text-sm text-neutral-500">{profile.email}</p>
                      </div>
                    </div>
                    <Badge variant="success">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <HiClock className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800 dark:text-white">Last Login</p>
                        <p className="text-sm text-neutral-500">
                          {new Date().toLocaleDateString('en-US', { 
                            weekday: 'long',
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Notification Preferences */}
              <Section
                title="Notification Preferences"
                description="Manage how you receive notifications"
                icon={HiCog}
              >
                <div className="space-y-4">
                  {[
                    { id: 'email', label: 'Email Notifications', description: 'Receive course updates via email' },
                    { id: 'progress', label: 'Progress Reminders', description: 'Get reminders to continue learning' },
                    { id: 'marketing', label: 'Marketing Emails', description: 'Receive offers and news from EduX' },
                  ].map((pref) => (
                    <div
                      key={pref.id}
                      className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-neutral-800 dark:text-white">{pref.label}</p>
                        <p className="text-sm text-neutral-500">{pref.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Learning Preferences */}
              <Section
                title="Learning Preferences"
                description="Customize your learning experience"
                icon={HiSparkles}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Preferred Learning Style
                    </label>
                    <select className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-500/30">
                      <option value="video">Video Lectures</option>
                      <option value="reading">Reading Materials</option>
                      <option value="interactive">Interactive Exercises</option>
                      <option value="mixed">Mixed Learning</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Daily Learning Goal
                    </label>
                    <select className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-500/30">
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button variant="primary">
                    <HiSave className="w-5 h-5 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </Section>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
