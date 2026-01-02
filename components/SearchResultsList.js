import React from "react";
import { FaStar, FaPlay, FaUser } from "react-icons/fa";

const SearchResultsList = ({ results, setResults, listboxId = 'search-results-listbox' }) => {
  return (
    <div
      className={`absolute left-0 right-0 top-full mt-3 bg-white dark:bg-neutral-800 shadow-2xl rounded-xl z-50 overflow-hidden transition-all duration-300 ${
        results.length === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {results.length > 0 && (
        <>
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-neutral-700 dark:to-neutral-600 border-b border-blue-200 dark:border-neutral-600">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Found {results.length} course{results.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Results List */}
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Search results"
            className="divide-y divide-gray-100 dark:divide-neutral-700 max-h-96 overflow-y-auto"
          >
            {results.slice(0, 8).map((result, id) => (
              <li key={id} role="option" className="transition-colors">
                <a
                  href={`/courses/${result.c_id}`}
                  className="block px-4 py-3 hover:bg-blue-50 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:bg-blue-50 dark:focus:bg-neutral-700 group"
                  onClick={() => setResults([])}
                >
                  <div className="flex items-start gap-3">
                    {/* Course Icon/Placeholder */}
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mt-1 group-hover:shadow-lg transition-shadow">
                      <FaPlay className="text-white text-sm" />
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {result.title}
                      </h3>

                      {/* Course Meta */}
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {result.instructor_name && (
                          <div className="flex items-center gap-1">
                            <FaUser className="h-3 w-3" />
                            <span className="truncate">{result.instructor_name}</span>
                          </div>
                        )}

                        {result.rating && (
                          <div className="flex items-center gap-1">
                            <FaStar className="h-3 w-3 text-yellow-400" />
                            <span>{result.rating}</span>
                          </div>
                        )}

                        {result.students_count && (
                          <span>{result.students_count} students</span>
                        )}
                      </div>

                      {/* Description Preview */}
                      {result.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>

          {/* Footer - Show more */}
          {results.length > 8 && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-neutral-700 border-t border-gray-100 dark:border-neutral-600 text-center">
              <a
                href={`/courses?search=${encodeURIComponent(results[0]?.title || "")}`}
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                onClick={() => setResults([])}
              >
                View all {results.length} results →
              </a>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {results.length === 0 && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No courses found</p>
        </div>
      )}
    </div>
  );
};

export default SearchResultsList;
