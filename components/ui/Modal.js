import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  className = '',
  overlayClassName = '',
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full',
  };

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayClassName}`}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className={`bg-white dark:bg-neutral-800 rounded-xl shadow-hard w-full ${sizes[size]} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const ModalHeader = ({ children, className = '', onClose, ...props }) => (
  <div className={`flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700 ${className}`} {...props}>
    <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
      {children}
    </div>
    {onClose && (
      <button
        onClick={onClose}
        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
        aria-label="Close modal"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
);

const ModalBody = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

const ModalFooter = ({ children, className = '', ...props }) => (
  <div className={`flex items-center justify-end gap-3 p-6 border-t border-neutral-200 dark:border-neutral-700 ${className}`} {...props}>
    {children}
  </div>
);

export { ModalHeader, ModalBody, ModalFooter };
export default Modal;