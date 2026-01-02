import React from 'react';

const GamificationBadge = ({ badge, size = 'md', earned = false, className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
  };

  const baseClasses = `inline-flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
    earned
      ? 'bg-primary-100 border-primary-300 text-primary-700 shadow-soft'
      : 'bg-neutral-100 border-neutral-300 text-neutral-400'
  } ${sizes[size]} ${className}`;

  return (
    <div className={baseClasses} title={`${badge.name}: ${badge.description}`}>
      <span role="img" aria-label={badge.name}>
        {badge.icon}
      </span>
    </div>
  );
};

export default GamificationBadge;