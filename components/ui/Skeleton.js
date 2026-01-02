import React from 'react';

const Skeleton = ({ className = '', lines = 1 }) => {
  const skeletonLines = Array.from({ length: lines }, (_, i) => (
    <div key={i} className="animate-pulse">
      <div className="h-4 bg-neutral-300 rounded w-full mb-2"></div>
      {i === lines - 1 && <div className="h-4 bg-neutral-300 rounded w-3/4"></div>}
    </div>
  ));

  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-neutral-300 rounded-lg mb-4 h-40"></div>
      {skeletonLines}
    </div>
  );
};

export default Skeleton;