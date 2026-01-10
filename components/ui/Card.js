import React from 'react';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  shadow = 'soft',
  ...props
}) => {
  const baseClasses = 'bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all duration-300 ease-in-out';

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const shadows = {
    none: '',
    soft: 'shadow-soft hover:shadow-medium',
    medium: 'shadow-medium hover:shadow-hard',
    hard: 'shadow-hard',
  };

  const hoverClass = hover ? 'hover:-translate-y-2 hover:scale-[1.02] hover:shadow-hard cursor-pointer transition-all duration-300 active:scale-95 active:translate-y-0' : '';

  const classes = `${baseClasses} ${paddings[padding]} ${shadows[shadow]} ${hoverClass} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t border-neutral-200 ${className}`} {...props}>
    {children}
  </div>
);

export { Card, CardHeader, CardContent, CardFooter };
export default Card;