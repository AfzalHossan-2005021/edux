import React, { useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { HiOutlineLogout, HiOutlineUserCircle, HiOutlineViewGrid } from "react-icons/hi";
import { Button } from './ui';

const UserDropDown = ({ setisLoggedIn, userDropdownRef, isOpen = false }) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuItemsRef = useRef([]);

  const logout = () => {
    secureLocalStorage.clear();
    setisLoggedIn(false);
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => {
            const newIndex = prev < (menuItemsRef.current.length - 1) ? prev + 1 : 0;
            menuItemsRef.current[newIndex]?.focus();
            return newIndex;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : menuItemsRef.current.length - 1;
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
          // Close dropdown by calling parent toggle
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, focusedIndex]);

  // Reset focus when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  return (
    <div
      className="flex-col mr-2 md:order-2"
      ref={userDropdownRef}
      role="region"
      aria-hidden={!isOpen}
      aria-label="User menu"
    >
      {isOpen && (
        <div
          className="z-50 my-2 w-56 text-base list-none bg-white dark:bg-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-700 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 animate-in fade-in zoom-in-95 duration-200"
          id="user-dropdown"
          aria-labelledby="user-menu-button"
          role="menu"
        >
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <HiOutlineUserCircle className="text-2xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                  {secureLocalStorage.getItem("u_name")}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {secureLocalStorage.getItem("u_email")}
                </p>
              </div>
            </div>
          </div>
          <div className="py-1" role="menu" aria-labelledby="user-menu-button">
            <a
              ref={(el) => (menuItemsRef.current[0] = el)}
              href="/user"
              role="menuitem"
              tabIndex={focusedIndex === 0 ? 0 : -1}
              onFocus={() => setFocusedIndex(0)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors focus:bg-neutral-50 dark:focus:bg-neutral-700/50 focus:outline-none"
            >
              <HiOutlineViewGrid className="text-lg text-neutral-400" />
              Dashboard
            </a>
          </div>
          <div className="py-1">
            <Button
              ref={(el) => (menuItemsRef.current[1] = el)}
              role="menuitem"
              tabIndex={focusedIndex === 1 ? 0 : -1}
              onFocus={() => setFocusedIndex(1)}
              onClick={logout}
              variant="ghost"
              size="md"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors focus:bg-red-50 dark:focus:bg-red-900/10 focus:outline-none"
            >
              <HiOutlineLogout className="text-lg" />
              Log out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropDown;
