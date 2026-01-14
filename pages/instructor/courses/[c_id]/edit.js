/**
 * Instructor - Edit Course Settings
 * URL: /instructor/courses/[c_id]/edit
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import secureLocalStorage from 'react-secure-storage';
import { apiPost } from '@/lib/api';
import { withInstructorAuth } from '@/lib/auth/withServerSideAuth';
import { Card, Button } from '@/components/ui';
import { FormField, FileUploadField, CategorySelector } from '@/components/CourseForm';
import {
  HiArrowLeft,
  HiAcademicCap,
  HiChevronRight,
  HiSave,
  HiX,
  HiCheckCircle,
  HiInformationCircle,
  HiCog,
  HiPhotograph,
  HiClipboardList,
  HiPlus,
  HiFlag,
} from 'react-icons/hi';

function EditCourse({ serverUser }) {
  const router = useRouter();
  const { c_id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const u_id = useMemo(() => serverUser?.u_id || secureLocalStorage.getItem('u_id'), [serverUser]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    field: '',
    seat: '',
    price: '',
    lecture_weight: 50,
    thumbnail: null,
    prerequisites: [],
    outcomes: [],
    difficulty_level: 'beginner',
  });

  const [preReqInput, setPreReqInput] = useState('');
  const [outcomeInput, setOutcomeInput] = useState('');

  useEffect(() => {
    if (c_id && u_id) {
      loadCourse();
    }
  }, [c_id, u_id]);

  const loadCourse = async () => {
    try {
      if (!u_id) {
        router.push('/auth/instructor/login');
        return;
      }

      // Get instructor's courses
      const response = await apiPost('/api/instructor_courses', { u_id });
      const data = await response.json();

      // Handle both response formats
      const courses = Array.isArray(data) ? data : (data.courses || []);
      const foundCourse = courses.find(c => (c.c_id || c.C_ID) === Number(c_id));
      
      if (foundCourse) {
        setFormData({
          title: foundCourse.title || foundCourse.NAME || '',
          description: foundCourse.description || '',
          field: foundCourse.field || '',
          seat: foundCourse.seat || '',
          price: foundCourse.price || '',
          // Try multiple possible property names for backwards compatibility
          lecture_weight: foundCourse.lecture_weight || foundCourse.LECTURE_WEIGHT || 50,
          thumbnail: null,
          prerequisites: foundCourse.PREREQUISITES_LIST,
          outcomes: foundCourse.OUTCOMES_LIST,
          difficulty_level: foundCourse.difficulty_level || 'beginner',
        });
      } else {
        router.push('/instructor');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading course:', error);
      router.push('/instructor');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.value || e.target.files?.[0];
    setFormData(prev => ({ ...prev, thumbnail: file }));
    if (errors.thumbnail) {
      setErrors(prev => ({ ...prev, thumbnail: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.field) {
      newErrors.field = 'Please select a category';
    }

    if (formData.seat && (isNaN(formData.seat) || formData.seat < 0)) {
      newErrors.seat = 'Please enter a valid seat number';
    }

    if (formData.price && (isNaN(formData.price) || formData.price < 0)) {
      newErrors.price = 'Please enter a valid price';
    }

    // Validate lecture weight
    if (formData.lecture_weight !== undefined) {
      const lw = parseInt(formData.lecture_weight, 10);
      if (isNaN(lw) || lw < 0 || lw > 100) {
        newErrors.lecture_weight = 'Lecture weight must be between 0 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setSuccessMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('c_id', c_id);
      formDataToSend.append('u_id', u_id);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('field', formData.field);
      formDataToSend.append('seat', formData.seat || 0);
      formDataToSend.append('price', formData.price || 0);
      formDataToSend.append('difficulty_level', formData.difficulty_level);
      formDataToSend.append('lecture_weight', formData.lecture_weight || 0);
      
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }

      // Update course basic information
      const response = await fetch('/api/course/update', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        // Now update prerequisites and outcomes
        const preOutResponse = await apiPost('/api/course/prerequisites-outcomes', {
          c_id: Number(c_id),
          u_id,
          prerequisites: formData.prerequisites,
          outcomes: formData.outcomes
        });

        const preOutResult = await preOutResponse.json();

        if (preOutResult.success) {
          setSuccessMessage('Course updated successfully!');
          setTimeout(() => {
            router.push(`/instructor/courses/${c_id}`);
          }, 2000);
        } else {
          setErrors({ general: preOutResult.message || 'Failed to update prerequisites and outcomes' });
        }
      } else {
        setErrors({ general: result.message || 'Failed to update course' });
      }
    } catch (error) {
      console.error('Error updating course:', error);
      setErrors({ general: 'An error occurred while updating the course' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <HiAcademicCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading course details...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Course - {formData.title} | EduX</title>
        <meta name="description" content="Edit course information and settings" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Header */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="py-3 flex items-center gap-2 text-sm">
              <Link href="/instructor" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                Dashboard
              </Link>
              <HiChevronRight className="w-4 h-4 text-gray-400" />
              <Link href={`/instructor/courses/${c_id}`} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                Course
              </Link>
              <HiChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">Edit</span>
            </div>

            {/* Title Row */}
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                  <HiCog className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                    Edit Course Settings
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 truncate">
                    Update course information and settings
                  </p>
                </div>
              </div>

              <Link href={`/instructor/courses/${c_id}`}>
                <Button variant="outline" size="sm">
                  <HiArrowLeft className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 flex items-center gap-3">
              <HiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-green-800 dark:text-green-200 font-medium">{successMessage}</p>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 flex items-center gap-3">
              <HiX className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-200 font-medium">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <HiInformationCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h2>
                </div>

                <div className="space-y-6">
                  <FormField
                    label="Course Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    error={errors.title}
                    placeholder="Enter course title"
                    required
                    maxLength={100}
                  />

                  <CategorySelector
                    label="Course Category"
                    name="field"
                    value={formData.field}
                    onChange={handleChange}
                    error={errors.field}
                    required
                  />

                  <FormField
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={errors.description}
                    placeholder="Provide a detailed description of your course"
                    type="textarea"
                    rows={4}
                    required
                    maxLength={1000}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      label="Difficulty Level"
                      name="difficulty_level"
                      value={formData.difficulty_level}
                      onChange={handleChange}
                      type="select"
                      options={[
                        { value: 'beginner', label: 'Beginner' },
                        { value: 'intermediate', label: 'Intermediate' },
                        { value: 'advanced', label: 'Advanced' },
                        { value: 'expert', label: 'Expert' },
                      ]}
                    />

                    <FormField
                      label="Seat Capacity"
                      name="seat"
                      value={formData.seat}
                      onChange={handleChange}
                      error={errors.seat}
                      placeholder="e.g., 50"
                      type="number"
                      min="0"
                      helperText="Leave empty for unlimited"
                    />

                    <FormField
                      label="Price ($)"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      error={errors.price}
                      placeholder="e.g., 99.99"
                      type="number"
                      min="0"
                      step="0.01"
                      helperText="Leave empty for free"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Additional Details */}
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <HiClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Additional Details</h2>
                </div>

                <div className="space-y-8">
                  {/* Course Weighting */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <HiClipboardList className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Course Weighting</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">Total Lecture Weight: <strong className="ml-1">{parseInt(formData.lecture_weight || 0, 10)}%</strong></span>
                        <span className="text-sm text-gray-700">Total Exam Weight: <strong className="ml-1">{100 - parseInt(formData.lecture_weight || 0, 10)}%</strong></span>
                      </div>

                      <input
                        type="range"
                        name="lecture_weight"
                        min="0"
                        max="100"
                        step="5"
                        value={formData.lecture_weight}
                        onChange={handleChange}
                        className="w-full h-2 bg-gray-200 rounded-lg accent-indigo-600 focus:outline-none"
                      />

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  {/* Prerequisites Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <HiFlag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prerequisites</h3>
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
                          onKeyPress={(e) => e.key === 'Enter' && addPrerequisite()}
                          placeholder="Add a prerequisite"
                          maxLength={500}
                          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <Button
                          type="button"
                          onClick={addPrerequisite}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center gap-2"
                        >
                          <HiPlus className="w-5 h-5" />
                          Add
                        </Button>
                      </div>

                      {formData.prerequisites.length > 0 ? (
                        <div className="space-y-2">
                          {formData.prerequisites.map((prereq, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <HiFlag className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                <span className="text-gray-900 dark:text-white text-sm break-words">
                                  {index + 1}. {prereq}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removePrerequisite(index)}
                                className="ml-2 p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded flex-shrink-0"
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Outcomes</h3>
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
                          onKeyPress={(e) => e.key === 'Enter' && addOutcome()}
                          placeholder="Add a learning outcome"
                          maxLength={500}
                          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <Button
                          type="button"
                          onClick={addOutcome}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl flex items-center gap-2"
                        >
                          <HiPlus className="w-5 h-5" />
                          Add
                        </Button>
                      </div>

                      {formData.outcomes.length > 0 ? (
                        <div className="space-y-2">
                          {formData.outcomes.map((outcome, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <HiCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                <span className="text-gray-900 dark:text-white text-sm break-words">
                                  {index + 1}. {outcome}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeOutcome(index)}
                                className="ml-2 p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded flex-shrink-0"
                              >
                                <HiX className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm">
                          No learning outcomes added yet. Define them to help students understand what they'll achieve.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Course Thumbnail */}
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <HiPhotograph className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Thumbnail</h2>
                </div>

                <FileUploadField
                  label="Upload Thumbnail"
                  onChange={handleFileChange}
                  error={errors.thumbnail}
                  accept="image/*"
                  helperText="Recommended: 1280x720px, Max 5MB"
                />
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <HiSave className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push(`/instructor/courses/${c_id}`)}
                disabled={saving}
                className="flex-1 sm:flex-initial sm:min-w-[150px]"
              >
                <HiX className="w-5 h-5 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditCourse;

// Server-side authentication
export const getServerSideProps = withInstructorAuth();
