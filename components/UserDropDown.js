import React, { useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  HiOutlineLogout,
  HiUser,
  HiViewGrid,
  HiAcademicCap,
  HiBadgeCheck,
  HiChevronRight,
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

const UserDropDown = ({ userDropdownRef, isOpen = false }) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuItemsRef = useRef([]);
  const router = useRouter();
  const { user, logout: authLogout } = useAuth();

  const logout = async () => {
    secureLocalStorage.clear();
    await authLogout();
    router.push('/');
  };

  // Get dashboard URL based on user role
  const getDashboardUrl = () => {
    if (user?.role === 'instructor' || user?.isInstructor) return '/instructor';
    if (user?.role === 'admin' || user?.isAdmin) return '/admin';
    return '/student';
  };

  const getProfileUrl = () => {
    if (user?.role === 'instructor' || user?.isInstructor) return '/instructor/profile';
    if (user?.role === 'admin' || user?.isAdmin) return '/admin/profile';
    return '/student/profile';
  };

  const userName = user?.name || secureLocalStorage.getItem("u_name") || 'User';
  const userEmail = user?.email || secureLocalStorage.getItem("u_email") || '';
  const initials = userName ? userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U';

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

  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full right-0 mt-3 z-50"
      role="region"
      aria-label="User menu"
    >
      <div
        className="w-72 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl shadow-neutral-900/10 dark:shadow-neutral-900/50 overflow-hidden border border-neutral-200/80 dark:border-neutral-700/80 animate-in fade-in slide-in-from-top-2 duration-200"
        id="user-dropdown"
        aria-labelledby="user-menu-button"
        role="menu"
      >
        {/* User Profile Header */}
        <div className="px-5 py-5 bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 border-b border-neutral-200/80 dark:border-neutral-700/80">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/25">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                  {userName}
                </p>
                <HiBadgeCheck className="w-4 h-4 text-primary-500 flex-shrink-0" />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <Link
            ref={(el) => (menuItemsRef.current[0] = el)}
            href={getDashboardUrl()}
            role="menuitem"
            tabIndex={focusedIndex === 0 ? 0 : -1}
            onFocus={() => setFocusedIndex(0)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${focusedIndex === 0
                ? 'bg-primary-50 dark:bg-primary-900/20'
                : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
              <HiViewGrid className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-800 dark:text-white">Dashboard</p>
              <p className="text-xs text-neutral-500">View your learning progress</p>
            </div>
            <HiChevronRight className="w-4 h-4 text-neutral-300" />
          </Link>

          <Link
            ref={(el) => (menuItemsRef.current[1] = el)}
            href={getProfileUrl()}
            role="menuitem"
            tabIndex={focusedIndex === 1 ? 0 : -1}
            onFocus={() => setFocusedIndex(1)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${focusedIndex === 1
                ? 'bg-primary-50 dark:bg-primary-900/20'
                : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <HiUser className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-800 dark:text-white">Profile</p>
              <p className="text-xs text-neutral-500">Manage your account</p>
            </div>
            <HiChevronRight className="w-4 h-4 text-neutral-300" />
          </Link>

          {user?.role === 'student' && (
            <Link
              ref={(el) => (menuItemsRef.current[2] = el)}
              href="/student/certificates"
              role="menuitem"
              tabIndex={focusedIndex === 2 ? 0 : -1}
              onFocus={() => setFocusedIndex(2)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${focusedIndex === 2
                  ? 'bg-primary-50 dark:bg-primary-900/20'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <HiAcademicCap className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-800 dark:text-white">Certificates</p>
                <p className="text-xs text-neutral-500">View your achievements</p>
              </div>
              <HiChevronRight className="w-4 h-4 text-neutral-300" />
            </Link>
          )}
        </div>

        {/* Logout */}
        <div className="p-2 border-t border-neutral-200/80 dark:border-neutral-700/80">
          <button
            ref={(el) => (menuItemsRef.current[3] = el)}
            role="menuitem"
            tabIndex={focusedIndex === 3 ? 0 : -1}
            onFocus={() => setFocusedIndex(3)}
            onClick={logout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${focusedIndex === 3
                ? 'bg-rose-50 dark:bg-rose-900/20'
                : 'hover:bg-rose-50 dark:hover:bg-rose-900/20'
              }`}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
              <HiOutlineLogout className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">Sign Out</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDropDown;
