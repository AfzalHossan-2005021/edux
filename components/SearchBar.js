import React, { useEffect, useState } from "react";
import { HiSearch, HiX, HiSparkles } from "react-icons/hi";

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
      className={`relative w-full flex items-center bg-white dark:bg-neutral-800/90 rounded-2xl border-2 transition-all duration-300 ${
        isFocused
          ? "border-primary-400 dark:border-primary-500 shadow-lg shadow-primary-500/10 ring-4 ring-primary-500/10"
          : "border-neutral-200/80 dark:border-neutral-700/80 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md"
      }`}
    >
      {/* Search Icon */}
      <div className="pl-4 pr-2 flex items-center">
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <HiSearch className={`h-5 w-5 transition-colors ${isFocused ? 'text-primary-500' : 'text-neutral-400'}`} />
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
        className="relative flex-1 bg-transparent text-sm dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 px-2 py-3.5 outline-none transition-colors"
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
          className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
        >
          <HiX className="h-4 w-4" />
        </button>
      )}

      {/* AI Search hint */}
      <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 mr-2 bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/30 dark:to-indigo-900/30 rounded-xl border border-primary-100 dark:border-primary-800/50">
        <HiSparkles className="h-3.5 w-3.5 text-primary-500" />
        <span className="text-xs font-medium text-primary-600 dark:text-primary-400">AI</span>
      </div>
    </div>
  );
};

export default SearchBar;
