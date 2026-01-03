import { HiHeart, HiTrash, HiExternalLink, HiSparkles } from "react-icons/hi";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const Wishlist = ({ wishlistCourses, onRemoveCourse, WishListRef, isOpen = false }) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuItemsRef = useRef([]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen || !wishlistCourses || wishlistCourses.length === 0) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => {
            const newIndex = prev < (wishlistCourses.length - 1) ? prev + 1 : 0;
            menuItemsRef.current[newIndex]?.focus();
            return newIndex;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : wishlistCourses.length - 1;
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
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, focusedIndex, wishlistCourses]);

  // Reset focus when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full right-0 mt-3 z-50"
      role="region"
      aria-label="Wishlist"
    >
      <div
        className="w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl shadow-neutral-900/10 dark:shadow-neutral-900/50 overflow-hidden border border-neutral-200/80 dark:border-neutral-700/80 animate-in fade-in slide-in-from-top-2 duration-200"
        id="wishlist-dropdown"
        aria-labelledby="wishlist-button"
        role="menu"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-b border-neutral-200/80 dark:border-neutral-700/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                <HiHeart className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                My Wishlist
              </h3>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-full shadow-sm">
              {wishlistCourses?.length || 0} items
            </span>
          </div>
        </div>

        {/* Course List */}
        <div className="max-h-80 overflow-y-auto" role="menu">
          {wishlistCourses && wishlistCourses.length > 0 ? (
            <div className="p-2">
              {wishlistCourses.map((course, index) => (
                <div
                  key={course.c_id}
                  className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    focusedIndex === index
                      ? 'bg-rose-50 dark:bg-rose-900/20'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                  role="menuitem"
                >
                  <Link
                    ref={(el) => (menuItemsRef.current[index] = el)}
                    href={`/courses/${course.c_id}`}
                    tabIndex={focusedIndex === index ? 0 : -1}
                    onFocus={() => setFocusedIndex(index)}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium text-neutral-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate transition-colors">
                      {course.title}
                    </p>
                    {course.instructor && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        by {course.instructor}
                      </p>
                    )}
                  </Link>
                  <button
                    type="button"
                    aria-label={`Remove ${course.title} from wishlist`}
                    className="p-2 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    onClick={() => onRemoveCourse(course.c_id)}
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <HiHeart className="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
              </div>
              <h4 className="text-sm font-semibold text-neutral-800 dark:text-white mb-1">
                Your wishlist is empty
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Save courses you're interested in
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlistCourses && wishlistCourses.length > 0 && (
          <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200/80 dark:border-neutral-700/80">
            <Link
              href="/wishlist"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-semibold hover:from-rose-600 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40"
            >
              <span>View All Wishlist</span>
              <HiExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
