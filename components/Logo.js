import React from 'react';
import Link from 'next/link';
import { HiAcademicCap } from 'react-icons/hi';

const Logo = () => {
  return (
    <Link href='/' className="flex items-center gap-2 group">
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow duration-300">
          <HiAcademicCap className="w-6 h-6 text-white" />
        </div>
        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 bg-clip-text text-transparent">
          EduX
        </span>
        <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 -mt-1 tracking-wider uppercase">
          Learn More
        </span>
      </div>
    </Link>
  );
};

export default Logo;
