import React, { useState, useRef, useEffect } from 'react';

const Dropdown = ({
  trigger,
  children,
  align = 'left',
  className = '',
  triggerClassName = '',
  contentClassName = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignments = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2',
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef} {...props}>
      <div
        className={`cursor-pointer ${triggerClassName}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute z-10 mt-2 ${alignments[align]} bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-hard min-w-[200px] ${contentClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({
  children,
  onClick,
  disabled = false,
  className = '',
  ...props
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      className={`w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed first:rounded-t-lg last:rounded-b-lg ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const DropdownDivider = ({ className = '', ...props }) => (
  <div className={`border-t border-neutral-200 dark:border-neutral-700 ${className}`} {...props} />
);

export { DropdownItem, DropdownDivider };
export default Dropdown;