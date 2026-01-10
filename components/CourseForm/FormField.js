import React from 'react';

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  maxLength,
  rows,
  min,
  max,
  error,
  required,
  helperText,
  disabled,
  options = [],
  ...props
}) {
  const inputClasses = `
    w-full px-4 py-3 rounded-xl
    border-2 transition-all duration-200
    bg-white dark:bg-gray-900
    text-gray-900 dark:text-white
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    focus:outline-none focus:ring-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${
      error
        ? 'border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-red-500/20'
        : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20'
    }
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* TEXTAREA */}
      {type === 'textarea' && (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows || 4}
          disabled={disabled}
          className={`${inputClasses} resize-none`}
          {...props}
        />
      )}

      {/* SELECT */}
      {type === 'select' && (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={inputClasses}
          {...props}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {/* DEFAULT INPUT */}
      {type !== 'textarea' && type !== 'select' && (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          min={min}
          max={max}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
      )}

      {(helperText || error) && (
        <div className="text-sm">
          {error ? (
            <p className="text-red-600 dark:text-red-400">{error}</p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
}
