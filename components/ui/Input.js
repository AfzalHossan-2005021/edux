import React from 'react';

const Input = ({
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  labelClassName = '',
  id,
  required = false,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const inputClasses = 'block w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100';

  const labelClasses = `block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 ${labelClassName}`;

  const errorClasses = 'mt-1 text-sm text-error';

  const helperClasses = 'mt-1 text-sm text-neutral-500 dark:text-neutral-400';

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {required && <span className="text-error ml-1" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`${inputClasses} ${error ? 'border-error focus:ring-error focus:border-error' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && <p id={`${inputId}-error`} className={errorClasses} role="alert">{error}</p>}
      {helperText && !error && <p id={`${inputId}-helper`} className={helperClasses}>{helperText}</p>}
    </div>
  );
};

export default Input;