/**
 * Create Course Page - Modern course creation form for instructors
 * Comprehensive form with validation, image upload, and API integration
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import secureLocalStorage from 'react-secure-storage';
import { apiPost } from '@/lib/api';
import { withInstructorAuth } from '@/lib/auth/withServerSideAuth';
import { Card } from '@/components/ui';
import { FormField, FileUploadField, CategorySelector } from '@/components/CourseForm';
import {
  HiArrowLeft,
  HiSparkles,
  HiCheckCircle,
  HiExclamationCircle,
  HiArrowRight,
  HiAcademicCap,
  HiBookOpen,
  HiUserGroup,
  HiLightningBolt,
  HiClipboardList,
  HiPhotograph,
  HiPlus,
  HiX,
  HiFlag,
} from 'react-icons/hi';

const CreateCourse = ({ serverUser }) => {
  const router = useRouter();
  const u_id = useMemo(() => serverUser?.u_id || secureLocalStorage.getItem('u_id'), [serverUser]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    field: '',
    seat: '50',
    difficulty_level: 'beginner',
    price: '',
    prerequisites: [],
    outcomes: [],
    wall: null,
  });

  const [preReqInput, setPreReqInput] = useState('');
  const [outcomeInput, setOutcomeInput] = useState('');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    if (!u_id) {
      router.push('/auth/instructor/login');
    }
  }, [u_id, router]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (!formData.field.trim()) {
      newErrors.field = 'Course category is required';
    } else if (formData.field.length > 255) {
      newErrors.field = 'Category must not exceed 255 characters';
    }

    if (!formData.seat) {
      newErrors.seat = 'Number of seats is required';
    } else if (isNaN(formData.seat) || parseInt(formData.seat) < 1) {
      newErrors.seat = 'Seats must be a positive number';
    } else if (parseInt(formData.seat) > 10000) {
      newErrors.seat = 'Seats cannot exceed 10,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && Array.isArray(file) && file.length > 0) {
      console.log("Correct!!!")
    } else {
      console.log("Not correct!!!")
    }
    setFormData(prev => ({ ...prev, wall: file }));
    if (errors.wall) {
      setErrors(prev => ({ ...prev, wall: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const courseFormData = new FormData();
      courseFormData.append('i_id', u_id);
      courseFormData.append('title', formData.title.trim());
      courseFormData.append('description', formData.description.trim());
      courseFormData.append('field', formData.field.trim());
      courseFormData.append('seat', parseInt(formData.seat));
      courseFormData.append('difficulty_level', formData.difficulty_level.trim());
      courseFormData.append('price', formData.price ? parseFloat(formData.price) : 0);
      courseFormData.append('prerequisites', JSON.stringify(formData.prerequisites));

      courseFormData.append('outcomes', JSON.stringify(formData.outcomes));

      courseFormData.append('wall', formData.wall);

      console.log('Submitting course data:', courseFormData);

      const response = await apiPost('/api/course/create', courseFormData);
      const data = await response.json();

      if (!response.ok) {
        setGeneralError(data.message || 'Failed to create course. Please try again.');
        setLoading(false);
        return;
      }

      if (data.success && data.course) {
        setSuccess(true);

        // Reset form
        setFormData({
          title: '',
          description: '',
          field: '',
          seat: '50',
          difficulty_level: 'beginner',
          price: '',
          prerequisites: [],
          outcomes: [],
          wall: null,
        });

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push(`/instructor/courses/${data.course.c_id}`);
        }, 2000);
      } else {
        setGeneralError(data.message || 'Failed to create course');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      setGeneralError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Add prerequisite
  const addPrerequisite = () => {
    if (preReqInput.trim().length > 0) {
      if (preReqInput.trim().length <= 500) {
        setFormData(prev => ({
          ...prev,
          prerequisites: [...prev.prerequisites, preReqInput.trim()]
        }));
        setPreReqInput('');
      }
    }
  };

  // Remove prerequisite
  const removePrerequisite = (index) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  // Add outcome
  const addOutcome = () => {
    if (outcomeInput.trim().length > 0) {
      if (outcomeInput.trim().length <= 500) {
        setFormData(prev => ({
          ...prev,
          outcomes: [...prev.outcomes, outcomeInput.trim()]
        }));
        setOutcomeInput('');
      }
    }
  };

  // Remove outcome
  const removeOutcome = (index) => {
    setFormData(prev => ({
      ...prev,
      outcomes: prev.outcomes.filter((_, i) => i !== index)
    }));
  };

  // Get character counts for display
  const titleCount = formData.title.length;
  const descriptionCount = formData.description.length;

  return (
    <>
      <Head>
        <title>Create Course - EduX Instructor</title>
        <meta name="description" content="Create and launch your online course on EduX" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Header */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/instructor">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium text-sm">
                <HiArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            </Link>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <HiAcademicCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold text-gray-900 dark:text-white">Create New Course</span>
            </div>

            <div className="w-16" /> {/* Spacer for alignment */}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-start gap-3">
              <HiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-200">Course Created Successfully!</h3>
                <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                  Your course has been created. Redirecting to course dashboard...
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {generalError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
              <HiExclamationCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200">Error Creating Course</h3>
                <p className="text-sm text-red-800 dark:text-red-300 mt-1">{generalError}</p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <Card className="bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-lg shadow-indigo-500/10">
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <HiSparkles className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Launch Your Course
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  Fill in the details below to create your online course and start teaching
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Course Basic Info Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <HiBookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Title Field */}
                    <FormField
                      label="Course Title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Complete Web Development Bootcamp"
                      maxLength={100}
                      error={errors.title}
                      required
                      helperText={`${titleCount}/100 characters`}
                    />

                    {/* Category Field */}
                    <CategorySelector
                      label="Course Category"
                      name="field"
                      value={formData.field}
                      onChange={handleInputChange}
                      error={errors.field}
                      required
                    />

                    {/* Description Field */}
                    <FormField
                      label="Course Description"
                      name="description"
                      type="textarea"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe what students will learn, topics covered, and what they'll achieve. Be specific about learning outcomes and course benefits..."
                      maxLength={1000}
                      rows={6}
                      error={errors.description}
                      required
                      helperText={`${descriptionCount}/1000 characters`}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Difficulty Level Field */}
                      <FormField
                        label="Difficulty Level"
                        name="difficulty_level"
                        value={formData.difficulty_level}
                        onChange={handleInputChange}
                        type="select"
                        options={[
                          { value: 'beginner', label: 'Beginner' },
                          { value: 'intermediate', label: 'Intermediate' },
                          { value: 'advanced', label: 'Advanced' },
                          { value: 'expert', label: 'Expert' },
                        ]}
                        error={errors.difficulty_level}
                      />

                      {/* Seats Field */}
                      <FormField
                        label="Available Seats"
                        name="seat"
                        type="number"
                        value={formData.seat}
                        onChange={handleInputChange}
                        placeholder="50"
                        min="1"
                        max="10000"
                        error={errors.seat}
                        required
                        helperText="Maximum number of students who can enroll"
                      />

                      {/* Price Field */}
                      <FormField
                        label="Course Price (USD)"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        error={errors.price}
                        helperText="Set to 0 for free courses"
                      />
                    </div>
                  </div>
                </div>

                {/* Prerequisites Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                      <HiFlag className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Prerequisites</h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({formData.prerequisites.length})
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={preReqInput}
                        onChange={(e) => setPreReqInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addPrerequisite();
                          }
                        }}
                        placeholder="e.g., Basic knowledge of JavaScript"
                        maxLength={500}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      />
                      <button
                        type="button"
                        onClick={addPrerequisite}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium transition-colors"
                      >
                        <HiPlus className="w-5 h-5" />
                        Add
                      </button>
                    </div>

                    {/* Prerequisites List */}
                    {formData.prerequisites.length > 0 ? (
                      <div className="space-y-2">
                        {formData.prerequisites.map((prereq, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                {index + 1}
                              </div>
                              <p className="text-gray-700 dark:text-gray-300">{prereq}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removePrerequisite(index)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <HiX className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No prerequisites added yet. Add them to help students understand if they're ready for your course.
                      </div>
                    )}
                  </div>
                </div>

                {/* Learning Outcomes Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <HiCheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Outcomes</h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({formData.outcomes.length})
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={outcomeInput}
                        onChange={(e) => setOutcomeInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addOutcome();
                          }
                        }}
                        placeholder="e.g., Build responsive web applications using React"
                        maxLength={500}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <button
                        type="button"
                        onClick={addOutcome}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
                      >
                        <HiPlus className="w-5 h-5" />
                        Add
                      </button>
                    </div>

                    {/* Outcomes List */}
                    {formData.outcomes.length > 0 ? (
                      <div className="space-y-2">
                        {formData.outcomes.map((outcome, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                {index + 1}
                              </div>
                              <p className="text-gray-700 dark:text-gray-300">{outcome}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeOutcome(index)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <HiX className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No learning outcomes added yet. Add them to showcase what students will achieve.
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                      Additional Details
                    </span>
                  </div>
                </div>

                {/* Course Media Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <HiPhotograph className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Course Image</h2>
                  </div>

                  <FileUploadField
                    label="Course Thumbnail"
                    name="wall"
                    onChange={handleFileChange}
                    accept="image/*"
                    helperText="Upload a high-quality image that represents your course (recommended: 1200x600px)"
                  />
                </div>

                {/* Submit Section */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={loading || success}
                    className={`
                      w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-base
                      transition-all duration-300 ease-out transform
                      ${loading || success
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]'
                      }
                    `}
                  >
                    {loading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Creating Your Course...</span>
                      </>
                    ) : success ? (
                      <>
                        <HiCheckCircle className="w-6 h-6" />
                        <span>Course Created Successfully!</span>
                      </>
                    ) : (
                      <>
                        <HiLightningBolt className="w-5 h-5" />
                        <span>Create Course & Continue</span>
                        <HiArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  {/* Helper text */}
                  <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <HiClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 dark:text-blue-200">What happens next?</p>
                        <ul className="mt-2 space-y-1 text-blue-800 dark:text-blue-300">
                          <li>• Your course will be pending approval from our team</li>
                          <li>• You can add topics, lectures, and exams after creation</li>
                          <li>• Students can enroll once your course is approved</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </Card>

          {/* Feature Cards */}
          <div className="mt-8 grid sm:grid-cols-3 gap-6">
            {/* Best Practices Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 via-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:via-indigo-800/30 dark:to-blue-900/30 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative p-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                  <HiAcademicCap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2 text-lg">Course Title</h3>
                <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">
                  Choose a clear, searchable title that reflects the course content and appeals to students
                </p>
                <div className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  Max: 100 characters
                </div>
              </div>
            </Card>

            {/* Description Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100 dark:from-purple-900/30 dark:via-purple-800/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative p-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                  <HiClipboardList className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-purple-900 dark:text-purple-200 mb-2 text-lg">Description</h3>
                <p className="text-sm text-purple-800 dark:text-purple-300 leading-relaxed">
                  Explain learning outcomes, target audience, prerequisites, and what makes your course unique
                </p>
                <div className="mt-3 text-xs text-purple-600 dark:text-purple-400 font-medium">
                  Max: 1000 characters
                </div>
              </div>
            </Card>

            {/* Enrollment Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-pink-50 via-pink-100 to-rose-100 dark:from-pink-900/30 dark:via-pink-800/30 dark:to-rose-900/30 border border-pink-200 dark:border-pink-800 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative p-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-pink-500/30">
                  <HiUserGroup className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-pink-900 dark:text-pink-200 mb-2 text-lg">Available Seats</h3>
                <p className="text-sm text-pink-800 dark:text-pink-300 leading-relaxed">
                  Set the maximum enrollment capacity based on your teaching capacity and support
                </p>
                <div className="mt-3 text-xs text-pink-600 dark:text-pink-400 font-medium">
                  1 - 10,000 students
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = withInstructorAuth();

export default CreateCourse;
