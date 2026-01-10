import React from "react";
import Link from "next/link";
import { HiArrowRight, HiSparkles } from "react-icons/hi";

const LogInSignUp = ({ scrolled, mobile }) => {
  if (mobile) {
    return (
      <div className="flex flex-col gap-3">
        <Link href="/auth" className="block">
          <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-semibold text-sm hover:from-primary-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 flex items-center justify-center gap-2">
            <HiSparkles className="w-4 h-4 text-amber-300" />
            <span>Get Started</span>
            <HiArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/auth">
        <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-semibold text-sm hover:from-primary-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 flex items-center gap-2">
          <HiSparkles className="w-4 h-4 text-amber-300" />
          <span>Get Started</span>
        </button>
      </Link>
    </div>
  );
};

export default LogInSignUp;
