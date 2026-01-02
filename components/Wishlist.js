import { AiOutlineCloseCircle } from "react-icons/ai";
import { HiOutlineHeart, HiOutlineTrash } from "react-icons/hi";
import { useEffect, useRef, useState } from "react";
import { Button } from './ui';

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
          // Close dropdown - parent will handle this
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

  return (
    <div
      className="relative flex-col md:order-2 pt-2"
      ref={WishListRef}
      role="region"
      aria-hidden={!isOpen}
      aria-label="Wishlist"
    >
      {isOpen && (
        <div
          className="z-50 w-80 text-base list-none bg-white dark:bg-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-700 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 animate-in fade-in zoom-in-95 duration-200"
          id="wishlist-dropdown"
          aria-labelledby="wishlist-button"
          role="menu"
        >
          <div className="px-4 py-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <HiOutlineHeart className="text-red-500" />
              My Wishlist
            </h3>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full">
              {wishlistCourses?.length || 0} items
            </span>
          </div>
          <div className="max-h-96 overflow-y-auto py-1" role="menu" aria-labelledby="wishlist-button">
            {wishlistCourses && wishlistCourses.length > 0 ? (
              wishlistCourses.map((course, index) => (
                <div
                  key={course.c_id}
                  className="group flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                  role="menuitem"
                >
                  <a
                    ref={(el) => (menuItemsRef.current[index] = el)}
                    href={`/courses/${course.c_id}`}
                    tabIndex={focusedIndex === index ? 0 : -1}
                    onFocus={() => setFocusedIndex(index)}
                    className="flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 truncate focus:outline-none"
                  >
                    {course.title}
                  </a>
                  <Button type="button" variant="icon" size="md" aria-label={`Remove ${course.title} from wishlist`} className="text-neutral-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => onRemoveCourse(course.c_id)}>
                    <HiOutlineTrash className="text-lg" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mx-auto mb-3">
                  <HiOutlineHeart className="text-2xl text-neutral-400" />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Your wishlist is empty
                </p>
              </div>
            )}
          </div>
          {wishlistCourses && wishlistCourses.length > 0 && (
            <div className="p-2">
              <a
                href="/wishlist"
                className="block w-full text-center py-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg transition-colors"
              >
                View all wishlist
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
