import React, { useRef, useState, useEffect } from "react";
import { AiOutlineCaretDown } from "react-icons/ai";
import { Button } from './ui';
import {
  FaCode,
  FaMicroscope,
  FaCalculus,
  FaPalette,
  FaChartBar,
  FaGlobeAmericas,
  FaChevronRight,
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
      color: "from-blue-400 to-blue-600",
    },
    {
      name: "Science and Engineering",
      description: "Physics, Chemistry, Engineering",
      icon: FaMicroscope,
      color: "from-purple-400 to-purple-600",
    },
    {
      name: "Mathematics and Logic",
      description: "Algebra, Calculus, Statistics",
      icon: FaCalculus,
      color: "from-amber-400 to-amber-600",
    },
    {
      name: "Arts and Humanities",
      description: "History, Literature, Philosophy",
      icon: FaPalette,
      color: "from-pink-400 to-pink-600",
    },
    {
      name: "Social Science",
      description: "Psychology, Economics, Sociology",
      icon: FaChartBar,
      color: "from-green-400 to-green-600",
    },
    {
      name: "Language Learning",
      description: "English, Spanish, Mandarin, more",
      icon: FaGlobeAmericas,
      color: "from-red-400 to-red-600",
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
      <Button
        aria-label="Explore categories"
        aria-expanded={isOpen}
        aria-controls="explore-dropdown"
        onClick={() => setIsOpen(!isOpen)}
        variant="primary"
        size="md"
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 ${isOpen ? 'scale-105 shadow-2xl' : 'shadow-lg hover:shadow-xl'}`}
      >
        <span className="text-sm font-bold">Explore</span>
        <AiOutlineCaretDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu with Portal-like behavior */}
      {isOpen && (
        <div
          id="explore-dropdown"
          className="absolute top-full left-0 mt-2 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-100 dark:border-neutral-700 min-w-max animate-in fade-in slide-in-from-top-2 duration-200"
          role="menu"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-neutral-700 dark:to-neutral-600 border-b border-blue-200 dark:border-neutral-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Choose Your Learning Path
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Explore diverse categories and courses
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 gap-1 p-2 max-h-96 overflow-y-auto">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <a
                  key={index}
                  ref={(el) => (menuItemsRef.current[index] = el)}
                  href={`/courses?category=${encodeURIComponent(category.name)}`}
                  role="menuitem"
                  tabIndex={focusedIndex === index ? 0 : -1}
                  onFocus={() => setFocusedIndex(index)}
                  className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none ${
                    focusedIndex === index
                      ? "bg-blue-100 dark:bg-neutral-700"
                      : "hover:bg-gray-50 dark:hover:bg-neutral-700"
                  }`}
                >
                  {/* Icon with gradient background */}
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${category.color} shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-110`}
                  >
                    <IconComponent className="text-white h-5 w-5" />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {category.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {category.description}
                    </p>
                  </div>

                  {/* Arrow Indicator */}
                  <FaChevronRight className="flex-shrink-0 h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all translate-x-0 group-hover:translate-x-1 duration-200" />
                </a>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-neutral-700 dark:to-neutral-600 border-t border-gray-200 dark:border-neutral-700">
            <a
              href="/courses"
              className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-2 group"
            >
              View All Courses
              <FaChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreDropDown;
