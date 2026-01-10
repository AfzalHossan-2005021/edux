/**
 * FileUploadField Component
 * File upload field component with drag-and-drop support
 */

import React, { useState, useRef } from 'react';
import { HiPhotograph, HiUpload, HiX } from 'react-icons/hi';

export default function FileUploadField({
  label,
  name,
  value,
  onChange,
  accept = 'image/*',
  helperText,
  error,
  required,
  disabled,
}) {
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Trigger onChange with the file
      if (onChange) {
        const event = {
          target: {
            name: name,
            value: file,
            files: [file],
          },
        };
        onChange(event);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleRemove = () => {
    setPreview(null);
    if (onChange) {
      const event = {
        target: {
          name: name,
          value: null,
        },
      };
      onChange(event);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-200
          ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : error
              ? 'border-red-300 dark:border-red-800'
              : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        {preview ? (
          // Preview
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg"
              disabled={disabled}
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
        ) : (
          // Upload Prompt
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              {isDragging ? (
                <HiUpload className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-bounce" />
              ) : (
                <HiPhotograph className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {isDragging ? 'Drop your image here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {accept.includes('image') ? 'PNG, JPG, GIF up to 10MB' : 'Select a file'}
            </p>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Helper Text or Error */}
      {(helperText || error) && (
        <div className="text-sm">
          {error ? (
            <p className="text-red-600 dark:text-red-400 flex items-center gap-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
}
