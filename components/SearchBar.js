import React, { useEffect, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchBar = ({ allCourses, setResults, containerRef, inputRef }) => {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      if (!allCourses || !Array.isArray(allCourses)) {
        setResults([]);
        return;
      }

      if (!input.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      // Simulate a small delay for better UX
      const timer = setTimeout(() => {
        const results = allCourses.filter((course) => {
          return (
            course &&
            course.title &&
            course.title.toLowerCase().includes(input.toLowerCase())
          );
        });
        setResults(results);
        setIsLoading(false);
      }, 200);

      return () => clearTimeout(timer);
    };

    fetchData();
  }, [input, allCourses, setResults]);

  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setInput("");
        setResults([]);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [containerRef, setResults]);

  const handleChange = (value) => {
    setInput(value);
  };

  const handleClear = () => {
    setInput("");
    setResults([]);
  };

  return (
    <div
      className={`relative w-full flex items-center bg-white dark:bg-neutral-800 rounded-xl border-2 transition-all duration-300 ${isFocused
          ? "border-blue-400 dark:border-blue-500 shadow-lg"
          : "border-gray-200 dark:border-neutral-700 shadow-md hover:shadow-lg hover:border-blue-300"
        }`}
    >
      {/* Search Icon */}
      <div className="pl-5 pr-2 flex items-center">
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <FaSearch className="h-4 w-4 text-blue-500" />
        )}
      </div>

      {/* Input field */}
      <label htmlFor="search_input" className="sr-only">
        Search courses
      </label>
      <input
        id="search_input"
        ref={inputRef}
        aria-label="Search courses"
        aria-controls="search-results-listbox"
        className="relative flex-1 bg-transparent text-sm md:text-base dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 px-3 py-3.5 outline-none transition-colors"
        placeholder="Search courses, topics, instructors..."
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoComplete="off"
      />

      {/* Clear button */}
      {input && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={handleClear}
          className="pr-3 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-400 transition-colors flex items-center"
        >
          <FaTimes className="h-4 w-4" />
        </button>
      )}

      {/* Submit button */}
      <button
        type="button"
        aria-label="Submit search"
        className="relative mr-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 text-white rounded-full p-3 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
      >
        <FaSearch className="h-4 w-4" />
      </button>
    </div>
  );
};

export default SearchBar;
