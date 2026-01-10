/**
 * Modern Navbar Component
 * 
 * A sleek, modern navigation bar with glassmorphism effects,
 * smooth animations, and responsive design
 */

import React, { useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { apiGet, apiPost } from "../lib/api";
import { useAuth } from "../context/AuthContext";

import Logo from "./Logo";
import Link from 'next/link';
import SearchBar from "./SearchBar";
import LogInSignUp from "./LogInSignUp";
import UserDropDown from "./UserDropDown";
import ExploreDropDown from "./ExploreDropDown";
import SearchResultsList from "./SearchResultsList";
import Wishlist from "./Wishlist";
import { Badge } from "./ui";
import { useTheme } from "../context/ThemeContext";

import { 
  HiHeart, 
  HiMenu, 
  HiX, 
  HiSparkles,
  HiAcademicCap,
  HiBookOpen,
  HiUser,
} from "react-icons/hi";
import { BsSun, BsMoonStars } from "react-icons/bs";

const Navbar = () => {
  const WishListRef = useRef(null);
  const searchDivRef = useRef();
  const userDropdownRef = useRef();
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Use AuthContext for auth state
  const { isAuthenticated, user, loading } = useAuth();
  const isLoggedIn = isAuthenticated;

  // Derive user info for avatar/initials from AuthContext or fallback to localStorage
  const userName = user?.name || (typeof window !== 'undefined' ? secureLocalStorage.getItem('u_name') || '' : '');
  const initials = userName ? userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '';

  const { theme, toggleTheme } = useTheme();
  const mobileSearchRef = useRef(null);

  // Focus search on mobile menu open and close with Escape
  useEffect(() => {
    if (isMobileMenuOpen) {
      setTimeout(() => mobileSearchRef.current?.focus(), 120);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Simple focus trap for mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const modal = document.getElementById('mobile-menu');
    const focusableSelector = 'a, button, input, [tabindex]:not([tabindex="-1"])';
    const focusable = modal ? Array.from(modal.querySelectorAll(focusableSelector)) : [];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const prevActive = document.activeElement;

    if (first) first.focus();

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => {
      document.removeEventListener('keydown', handleTab);
      prevActive?.focus?.();
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // No longer need to check localStorage for login state - using AuthContext

  const toggleWishList = () => {
    setIsWishlistOpen(!isWishlistOpen);
    setIsUserDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
    setIsWishlistOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        WishListRef.current &&
        !WishListRef.current.contains(e.target) &&
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target)
      ) {
        setIsWishlistOpen(false);
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const removeFromWishlist = (courseId) => {
    const u_id = user?.u_id || secureLocalStorage.getItem("u_id");
    apiPost('/api/remove_from_wishlist', {
      u_id: u_id,
      c_id: courseId,
    });
    const updatedWishlist = wishlistCourses.filter((course) => course.c_id !== courseId);
    setWishlistCourses(updatedWishlist);
  };

  useEffect(() => {
    // Fetch wishlist if user is authenticated
    const userId = user?.u_id || secureLocalStorage.getItem("u_id");
    if (isAuthenticated && userId) {
      apiPost('/api/wishlist', {
        u_id: userId,
      })
        .then(async (Response) => {
          const contentType = Response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return Response.json();
          }
          throw new Error('Response is not JSON');
        })
        .then((json) => {
          setWishlistCourses(json || []);
        })
        .catch((error) => console.error('Error fetching wishlist:', error));
    }

    apiGet('/api/all_courses')
      .then(async (Response) => {
        const contentType = Response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return Response.json();
        }
        throw new Error('Response is not JSON');
      })
      .then((json) => {
        setAllCourses(json || []);
      })
      .catch((error) => console.error('Error fetching courses:', error));
  }, [isAuthenticated, user]);

  return (
    <nav 
      id="main-navbar" 
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl shadow-lg shadow-neutral-900/5 dark:shadow-neutral-900/30 border-b border-neutral-200/50 dark:border-neutral-700/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation - Explore + Search */}
          <div className="hidden lg:flex items-center gap-4 flex-1 max-w-2xl mx-8">
            <ExploreDropDown isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="flex-1 relative" ref={searchDivRef}>
              <SearchBar
                allCourses={allCourses}
                setResults={setResults}
                containerRef={searchDivRef}
              />
              <SearchResultsList results={results} setResults={setResults} />
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group ${
                scrolled 
                  ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800' 
                  : 'hover:bg-white/20 dark:hover:bg-white/10'
              }`}
              aria-label="Toggle theme"
            >
              <div className="relative">
                {theme === 'light' ? (
                  <BsMoonStars className={`w-5 h-5 transition-colors ${scrolled ? 'text-neutral-600' : 'text-neutral-700 dark:text-white'} group-hover:text-primary-600`} />
                ) : (
                  <BsSun className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
                )}
              </div>
            </button>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  {/* Wishlist Button */}
                  <div className="relative" ref={WishListRef}>
                    <button
                      onClick={toggleWishList}
                      className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group ${
                        isWishlistOpen 
                          ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' 
                          : scrolled
                            ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                            : 'hover:bg-white/20 dark:hover:bg-white/10 text-neutral-700 dark:text-white'
                      }`}
                      aria-label="Open wishlist"
                    >
                      <HiHeart className={`w-5 h-5 transition-transform group-hover:scale-110 ${isWishlistOpen ? 'fill-current' : ''}`} />
                      {wishlistCourses.length > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full shadow-lg shadow-rose-500/30">
                          {wishlistCourses.length}
                        </span>
                      )}
                    </button>
                    
                    {/* Wishlist Dropdown */}
                    <Wishlist
                      wishlistCourses={wishlistCourses}
                      onRemoveCourse={removeFromWishlist}
                      WishListRef={WishListRef}
                      isOpen={isWishlistOpen}
                    />
                  </div>

                  {/* User Avatar */}
                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={toggleDropdown}
                      className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden ${
                        isUserDropdownOpen 
                          ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900' 
                          : 'hover:ring-2 hover:ring-primary-300 hover:ring-offset-2 hover:ring-offset-white dark:hover:ring-offset-neutral-900'
                      }`}
                      title={userName || 'Account'}
                      aria-haspopup="true"
                      aria-expanded={isUserDropdownOpen}
                      aria-label="Open user menu"
                    >
                      {initials ? (
                        <div className="w-full h-full bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                          {initials}
                        </div>
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${scrolled ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-white/20 dark:bg-white/10'}`}>
                          <HiUser className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                        </div>
                      )}
                    </button>
                    
                    {/* User Dropdown */}
                    <UserDropDown
                      userDropdownRef={userDropdownRef}
                      isOpen={isUserDropdownOpen}
                    />
                  </div>
                </>
              ) : (
                <LogInSignUp scrolled={scrolled} />
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  scrolled 
                    ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800' 
                    : 'hover:bg-white/20 dark:hover:bg-white/10'
                }`}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <HiX className={`w-6 h-6 ${scrolled ? 'text-neutral-700 dark:text-white' : 'text-neutral-700 dark:text-white'}`} />
                ) : (
                  <HiMenu className={`w-6 h-6 ${scrolled ? 'text-neutral-700 dark:text-white' : 'text-neutral-700 dark:text-white'}`} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="absolute top-0 right-0 w-full max-w-sm h-full bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
                  <HiAcademicCap className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-lg text-neutral-900 dark:text-white">EduX</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
              >
                <HiX className="w-6 h-6 text-neutral-500" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
              {/* Mobile Search */}
              <div className="relative" ref={searchDivRef}>
                <SearchBar
                  allCourses={allCourses}
                  setResults={setResults}
                  containerRef={searchDivRef}
                  inputRef={mobileSearchRef}
                />
                <SearchResultsList results={results} setResults={setResults} />
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-3">Navigation</p>
                
                <Link 
                  href="/explore" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
                    <HiSparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-800 dark:text-white">Explore Courses</span>
                    <p className="text-xs text-neutral-500">Discover new skills</p>
                  </div>
                </Link>

                <Link 
                  href="/courses" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <HiBookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-800 dark:text-white">All Courses</span>
                    <p className="text-xs text-neutral-500">Browse our catalog</p>
                  </div>
                </Link>
              </div>

              {/* User Actions */}
              {isLoggedIn ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-3">Your Account</p>
                  
                  <button
                    onClick={() => {
                      toggleWishList();
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                        <HiHeart className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-neutral-800 dark:text-white">Wishlist</span>
                    </div>
                    {wishlistCourses.length > 0 && (
                      <Badge variant="primary" size="sm">{wishlistCourses.length}</Badge>
                    )}
                  </button>

                  <Link 
                    href="/student" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <HiUser className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-neutral-800 dark:text-white">Dashboard</span>
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <LogInSignUp mobile />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
