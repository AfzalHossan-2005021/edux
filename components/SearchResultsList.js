import React from "react";
import Link from "next/link";
import { HiStar, HiPlay, HiUser, HiArrowRight, HiSparkles } from "react-icons/hi";

const SearchResultsList = ({ results, setResults, listboxId = 'search-results-listbox' }) => {
  if (results.length === 0) return null;

  return (
    <div
      className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-neutral-900 shadow-2xl shadow-neutral-900/10 dark:shadow-neutral-900/50 rounded-2xl z-50 overflow-hidden border border-neutral-200/80 dark:border-neutral-700/80 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="px-5 py-3 bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 border-b border-neutral-200/80 dark:border-neutral-700/80">
        <div className="flex items-center gap-2">
          <HiSparkles className="w-4 h-4 text-amber-500" />
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Found {results.length} course{results.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Results List */}
      <ul
        id={listboxId}
        role="listbox"
        aria-label="Search results"
        className="max-h-80 overflow-y-auto p-2"
      >
        {results.slice(0, 6).map((result, id) => (
          <li key={id} role="option">
            <Link
              href={`/courses/${result.c_id}`}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-200 group"
              onClick={() => setResults([])}
            >
              {/* Course Icon */}
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/30 group-hover:scale-105 transition-all duration-200">
                <HiPlay className="w-5 h-5 text-white" />
              </div>

              {/* Course Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {result.title}
                </h3>

                {/* Course Meta */}
                <div className="flex items-center flex-wrap gap-3 mt-1.5">
                  {result.instructor_name && (
                    <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                      <HiUser className="w-3.5 h-3.5" />
                      <span className="truncate">{result.instructor_name}</span>
                    </div>
                  )}

                  {result.rating && (
                    <div className="flex items-center gap-1 text-xs">
                      <HiStar className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-neutral-600 dark:text-neutral-400">{result.rating}</span>
                    </div>
                  )}

                  {result.students_count && (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {result.students_count} students
                    </span>
                  )}
                </div>
              </div>

              <HiArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-200 mt-1" />
            </Link>
          </li>
        ))}
      </ul>

      {/* Footer - Show more */}
      {results.length > 6 && (
        <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200/80 dark:border-neutral-700/80">
          <Link
            href={`/explore?search=${encodeURIComponent(results[0]?.title || "")}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 text-white text-sm font-semibold hover:from-primary-600 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
            onClick={() => setResults([])}
          >
            <span>View all {results.length} results</span>
            <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchResultsList;
