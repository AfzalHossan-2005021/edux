import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { HiChevronDown, HiSparkles, HiArrowRight } from "react-icons/hi";
import {
  FaCode,
  FaMicroscope,
  FaCalculator,
  FaPalette,
  FaChartBar,
  FaGlobeAmericas,
} from "react-icons/fa";

const ExploreDropDown = ({ isOpen, setIsOpen }) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuItemsRef = useRef([]);
  const containerRef = useRef(null);

  const categories = [
    {
      name: "Information Technology",
      description: "Programming, Web Dev, Cloud",
      icon: FaCode,
      gradient: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      name: "Science and Engineering",
      description: "Physics, Chemistry, Engineering",
      icon: FaMicroscope,
      gradient: "from-violet-500 to-purple-600",
      bgLight: "bg-violet-50 dark:bg-violet-900/20",
    },
    {
      name: "Mathematics and Logic",
      description: "Algebra, Calculus, Statistics",
      icon: FaCalculator,
      gradient: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      name: "Arts and Humanities",
      description: "History, Literature, Philosophy",
      icon: FaPalette,
      gradient: "from-pink-500 to-rose-600",
      bgLight: "bg-pink-50 dark:bg-pink-900/20",
    },
    {
      name: "Social Science",
      description: "Psychology, Economics, Sociology",
      icon: FaChartBar,
      gradient: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      name: "Language Learning",
      description: "English, Spanish, Mandarin, more",
      icon: FaGlobeAmericas,
      gradient: "from-cyan-500 to-blue-600",
      bgLight: "bg-cyan-50 dark:bg-cyan-900/20",
    },
  ];

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => {
            const newIndex = prev < (categories.length - 1) ? prev + 1 : 0;
            menuItemsRef.current[newIndex]?.focus();
            return newIndex;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : categories.length - 1;
            menuItemsRef.current[newIndex]?.focus();
            return newIndex;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && menuItemsRef.current[focusedIndex]) {
            menuItemsRef.current[focusedIndex].click();
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, focusedIndex, categories.length, setIsOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Explore Button */}
      <button
        aria-label="Explore categories"
        aria-expanded={isOpen}
        aria-controls="explore-dropdown"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
          isOpen
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400'
        }`}
      >
        <HiSparkles className={`w-4 h-4 ${isOpen ? 'text-primary-500' : 'text-amber-500'}`} />
        <span>Explore</span>
        <HiChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="explore-dropdown"
          className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl shadow-neutral-900/10 dark:shadow-neutral-900/50 overflow-hidden z-50 border border-neutral-200/80 dark:border-neutral-700/80 animate-in fade-in slide-in-from-top-2 duration-200"
          role="menu"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 border-b border-neutral-200/80 dark:border-neutral-700/80">
            <div className="flex items-center gap-2 mb-1">
              <HiSparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Choose Your Path
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Explore diverse categories and courses
            </p>
          </div>

          {/* Categories Grid */}
          <div className="p-2 max-h-[360px] overflow-y-auto">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={index}
                  ref={(el) => (menuItemsRef.current[index] = el)}
                  href={`/explore?category=${encodeURIComponent(category.name)}`}
                  role="menuitem"
                  tabIndex={focusedIndex === index ? 0 : -1}
                  onFocus={() => setFocusedIndex(index)}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                    focusedIndex === index
                      ? category.bgLight
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-200`}>
                    <IconComponent className="text-white w-5 h-5" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-neutral-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                      {category.name}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {category.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <HiArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200/80 dark:border-neutral-700/80">
            <Link
              href="/explore"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 text-white text-sm font-semibold hover:from-primary-600 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
            >
              <span>View All Courses</span>
              <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreDropDown;
