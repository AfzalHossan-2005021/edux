import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import secureLocalStorage from 'react-secure-storage';
import { apiPost } from '../../lib/api';
import { Button } from '@/components/ui';

export default function CreateCourse() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    field: '',
    seat: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check if user is logged in and is an instructor
    const u_id = secureLocalStorage.getItem('u_id');
    const isInstr = secureLocalStorage.getItem('isInstructor');

    if (!u_id) {
      setIsLoggedIn(false);
      router.push('/login');
      return;
    }

    setIsLoggedIn(true);
    
    if (isInstr === 'true' || isInstr === true) {
      setIsInstructor(true);
    } else {
      setError('Only instructors can create courses');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  }, [router]);

  const handleChange = (e) => {
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
      newErrors.field = 'Course field/category is required';
    } else if (formData.field.length > 255) {
      newErrors.field = 'Field must not exceed 255 characters';
    }

    if (!formData.seat) {
      newErrors.seat = 'Number of seats is required';
    } else if (isNaN(formData.seat) || parseInt(formData.seat) < 1) {
      newErrors.seat = 'Seats must be a positive number';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const i_id = secureLocalStorage.getItem('u_id');
      
      if (!i_id) {
        setError('Instructor ID not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      const response = await apiPost('/api/user/create-course', {
        i_id: parseInt(i_id),
        title: formData.title.trim(),
        description: formData.description.trim(),
        field: formData.field.trim(),
        seat: parseInt(formData.seat)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create course');
        setIsLoading(false);
        return;
      }

      if (data.success) {
        setSuccess('Course created successfully!');
        setFormData({
          title: '',
          description: '',
          field: '',
          seat: ''
        });
        
        // Redirect to instructor dashboard after 2 seconds
        setTimeout(() => {
          router.push('/instructor/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create course');
      }
    } catch (err) {
      console.error('Error creating course:', err);
      setError('An error occurred while creating the course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!isInstructor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">You must be an instructor to create courses.</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Course</h1>
          <p className="text-gray-600">Fill in the details below to create a new course</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter course title"
              maxLength="100"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Course Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter detailed course description"
              maxLength="1000"
              rows="4"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Field/Category */}
          <div>
            <label htmlFor="field" className="block text-sm font-medium text-gray-700 mb-1">
              Course Field/Category *
            </label>
            <input
              type="text"
              id="field"
              name="field"
              value={formData.field}
              onChange={handleChange}
              placeholder="e.g., Programming, Business, Design"
              maxLength="255"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.field ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.field && (
              <p className="text-red-500 text-xs mt-1">{errors.field}</p>
            )}
          </div>

          {/* Available Seats */}
          <div>
            <label htmlFor="seat" className="block text-sm font-medium text-gray-700 mb-1">
              Available Seats *
            </label>
            <input
              type="number"
              id="seat"
              name="seat"
              value={formData.seat}
              onChange={handleChange}
              placeholder="Enter number of available seats"
              min="1"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.seat ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.seat && (
              <p className="text-red-500 text-xs mt-1">{errors.seat}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Creating Course...' : 'Create Course'}
            </button>
          </div>

          {/* Cancel Button */}
          <div>
            <Link href="/instructor/dashboard">
              <button
                type="button"
                className="w-full py-2 px-4 rounded-md font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
