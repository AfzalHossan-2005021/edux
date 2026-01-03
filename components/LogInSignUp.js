import React from "react";
import Link from "next/link";
import { HiArrowRight, HiSparkles } from "react-icons/hi";

const LogInSignUp = ({ scrolled, mobile }) => {
  if (mobile) {
    return (
      <div className="flex flex-col gap-3">
        <Link href="/auth" className="block">
          <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-semibold text-sm hover:from-primary-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 flex items-center justify-center gap-2">
            <span>Sign In</span>
            <HiArrowRight className="w-4 h-4" />
          </button>
        </Link>
        <Link href="/auth?mode=signup" className="block">
          <button className="w-full py-3 px-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold text-sm hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300">
            Create Account
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/auth">
        <button 
          className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
            scrolled 
              ? 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-primary-600 dark:hover:text-primary-400' 
              : 'text-neutral-700 dark:text-white hover:bg-white/20 dark:hover:bg-white/10'
          }`}
        >
          Sign In
        </button>
      </Link>
      <Link href="/auth?mode=signup">
        <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-semibold text-sm hover:from-primary-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 flex items-center gap-2">
          <HiSparkles className="w-4 h-4 text-amber-300" />
          <span>Get Started</span>
        </button>
      </Link>
    </div>
  );
};

export default LogInSignUp;
