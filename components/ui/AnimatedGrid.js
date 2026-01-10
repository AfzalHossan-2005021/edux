import React from 'react';

const AnimatedGrid = ({
  children,
  className = '',
  stagger = true,
  staggerType = 'wave', // 'wave', 'diagonal', 'random'
  animationType = 'fade-in' // 'fade-in', 'slide-up', 'bounce-in'
}) => {
  const childrenArray = React.Children.toArray(children);

  const getStaggerDelay = (index, total) => {
    if (!stagger) return 0;

    switch (staggerType) {
      case 'wave':
        // Simple wave pattern with responsive consideration
        return index * 150;

      case 'diagonal':
        // Diagonal pattern
        return index * 150;

      case 'random':
        // Random delay between 0-500ms
        return Math.random() * 500;

      default:
        return index * 100;
    }
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 ${className}`}>
      {childrenArray.map((child, index) => (
        <div
          key={index}
          className={`animate-${animationType}`}
          style={{
            animationDelay: `${getStaggerDelay(index, childrenArray.length)}ms`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default AnimatedGrid;