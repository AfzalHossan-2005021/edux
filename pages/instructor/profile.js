import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import secureLocalStorage from 'react-secure-storage';
import { apiPost } from '../../lib/api';
import { withInstructorAuth } from '../../lib/auth/withServerSideAuth';
import { Card, Button, Badge } from '../../components/ui';
import {
  HiAcademicCap,
  HiCog,
  HiMail,
  HiCalendar,
  HiPencilAlt,
  HiCheck,
  HiX
} from 'react-icons/hi';

const InstructorProfile = ({ serverUser }) => {
  const router = useRouter();
  const [instructor, setInstructor] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    expertise: '',
    qualification: '',
    bio: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  const u_id = useMemo(() => serverUser?.u_id || secureLocalStorage.getItem('u_id'), [serverUser]);

  // Get initials for avatar
  const initials = instructor?.name
    ? instructor.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'I';

  useEffect(() => {
    if (!u_id) {
      router.push('/auth/instructor/login');
      return;
    }

    apiPost('/api/instructor/info', { u_id })
      .then((res) => res.json())
      .then((data) => {
        if (data && data[0]) {
          setInstructor(data[0]);
          setProfileForm({
            name: data[0]?.name || '',
            email: data[0]?.email || '',
            expertise: data[0]?.expertise || '',
            qualification: data[0]?.qualification || '',
            bio: data[0]?.bio || ''
          });
        }
      })
      .catch((error) => console.error('Error fetching instructor info:', error));
  }, [u_id, router]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage({ type: '', text: '' });
    try {
      const res = await apiPost('/api/instructor/info', { u_id, ...profileForm });
      const data = await res.json();
      if (res.ok) {
        setInstructor(profileForm);
        setIsEditingProfile(false);
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
      } else {
        setProfileMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileMessage({ type: 'error', text: 'An error occurred while updating profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileForm({
      name: instructor?.name || '',
      email: instructor?.email || '',
      expertise: instructor?.expertise || '',
      qualification: instructor?.qualification || '',
      bio: instructor?.bio || ''
    });
    setIsEditingProfile(false);
    setProfileMessage({ type: '', text: '' });
  };

  return (
    <>
      <Head>
        <title>Instructor Profile | EduX</title>
        <meta name="description" content="Manage your instructor profile" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="pb-8 space-y-6">
          {/* Success/Error Message */}
          {profileMessage.text && (
            <Card
              padding="md"
              className={`border-l-4 ${profileMessage.type === 'success' ? 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-l-red-500 bg-red-50 dark:bg-red-900/20'}`}
            >
              <p className={profileMessage.type === 'success' ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}>
                {profileMessage.text}
              </p>
            </Card>
          )}

          {/* Profile Card */}
          <Card padding="none" className="overflow-hidden">
            <div className="p-8">
              {/* Avatar */}
              <div className="flex items-end justify-between">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 border-4 border-white dark:border-neutral-900 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                  {initials}
                </div>
              </div>

              {/* Profile Name & Bio */}
              {!isEditingProfile ? (
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-neutral-800 dark:text-white">{instructor?.name}</h3>
                      <p className="text-neutral-500 dark:text-neutral-400 flex items-center gap-2 mt-1">
                        <HiAcademicCap className="w-5 h-5" />
                        {profileForm.expertise || 'No expertise set'}
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition"
                    >
                      <HiPencilAlt className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-neutral-800 dark:text-white mb-4">Edit Profile</h3>
                </div>
              )}

              {/* Profile Information or Edit Form */}
              {!isEditingProfile ? (
                <div className="space-y-6 border-t border-neutral-200 dark:border-neutral-700 pt-6">
                  <div>
                    <h4 className="font-bold text-neutral-800 dark:text-white mb-4 flex items-center gap-2">
                      <HiCog className="w-5 h-5 text-primary-500" />
                      Account Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <HiMail className="w-5 h-5 text-blue-500" />
                          </div>
                          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Email</span>
                        </div>
                        <p className="text-neutral-800 dark:text-white font-medium">{profileForm.email}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <HiCalendar className="w-5 h-5 text-emerald-500" />
                          </div>
                          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Member Since</span>
                        </div>
                        <p className="text-neutral-800 dark:text-white font-medium">{instructor?.reg_date}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-neutral-800 dark:text-white mb-4 flex items-center gap-2">
                      <HiAcademicCap className="w-5 h-5 text-amber-500" />
                      Professional Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Expertise</span>
                        </div>
                        <p className="text-neutral-800 dark:text-white font-medium">{profileForm.expertise || 'Not specified'}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Qualification</span>
                        </div>
                        <p className="text-neutral-800 dark:text-white font-medium">{profileForm.qualification || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {profileForm.bio && (
                    <div>
                      <h4 className="font-bold text-neutral-800 dark:text-white mb-2">About Me</h4>
                      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                        <p className="text-neutral-800 dark:text-white">{profileForm.bio}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form className="space-y-6 border-t border-neutral-200 dark:border-neutral-700 pt-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Expertise / Subject</label>
                    <input
                      type="text"
                      name="expertise"
                      value={profileForm.expertise}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Web Development, Data Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Qualification</label>
                    <input
                      type="text"
                      name="qualification"
                      value={profileForm.qualification}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., B.Tech in Computer Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">About Me (Bio)</label>
                    <textarea
                      name="bio"
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                      rows="4"
                      className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder="Tell us about yourself and your teaching experience..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-400 text-white rounded-lg transition"
                    >
                      <HiCheck className="w-4 h-4" />
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      disabled={savingProfile}
                      className="flex items-center gap-2 px-6 py-2 bg-neutral-500 hover:bg-neutral-600 disabled:bg-neutral-400 text-white rounded-lg transition"
                    >
                      <HiX className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default InstructorProfile;

export const getServerSideProps = withInstructorAuth();
