import React, { useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { apiGet, apiPost } from "../lib/api";

import Logo from "./Logo";
import Link from 'next/link';
import SearchBar from "./SearchBar";
import LogInSignUp from "./LogInSignUp";
import UserDropDown from "./UserDropDown";
import ExploreDropDown from "./ExploreDropDown";
import SearchResultsList from "./SearchResultsList";
import Wishlist from "./Wishlist";
import { Button, Badge } from "./ui";
import { useTheme } from "../context/ThemeContext";
import { cta } from "../lib/design-tokens";

import { BiHeart } from "react-icons/bi";
import { BsPersonCircle, BsSun, BsMoon } from "react-icons/bs";
import { HiMenu, HiX } from "react-icons/hi";

const Navbar = () => {
  const WishListRef = useRef(null);
  const searchDivRef = useRef();
  const userDropdownRef = useRef();
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Derive user info for avatar/initials
  const userName = typeof window !== 'undefined' ? secureLocalStorage.getItem('u_name') || '' : '';
  const initials = userName ? userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '';

  const { theme, toggleTheme } = useTheme();
  const mobileSearchRef = useRef(null);

  // Focus search on mobile menu open and close with Escape
  useEffect(() => {
    if (isMobileMenuOpen) {
      setTimeout(() => mobileSearchRef.current?.focus(), 120);
    }

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
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

  useEffect(() => {
    if (secureLocalStorage.getItem("u_id")) {
      setisLoggedIn(true);
    }
  }, []);

  const toggleWishList = () => {
    setIsWishlistOpen(!isWishlistOpen);
  };

  const toggleDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
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
    const u_id = secureLocalStorage.getItem("u_id");
    apiPost('/api/remove_from_wishlist', {
      u_id: u_id,
      c_id: courseId,
    });
    const updatedWishlist = wishlistCourses.filter((course) => course.c_id !== courseId);
    setWishlistCourses(updatedWishlist);
  };

  useEffect(() => {
    if (secureLocalStorage.getItem("u_id")) {
      setisLoggedIn(true);

      apiPost('/api/wishlist', {
        u_id: secureLocalStorage.getItem("u_id"),
      })
        .then((Response) => Response.json())
        .then((json) => {
          setWishlistCourses(json || []);
        })
        .catch((error) => console.error('Error fetching wishlist:', error));
    }

    apiGet('/api/all_courses')
      .then((Response) => Response.json())
      .then((json) => {
        setAllCourses(json || []);
      })
      .catch((error) => console.error('Error fetching courses:', error));
  }, []);

  return (
    <nav id="main-navbar" className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${scrolled
      ? "bg-white/80 dark:bg-neutral-900/75 backdrop-blur-md shadow-xl border border-neutral-100 dark:border-neutral-800"
      : "bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm border-b border-transparent"
      }`}>
      <div className="h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo Section */}
        <div className="flex-shrink-0 flex items-center">
          <Logo />
        </div>

        {/* Desktop Navigation - Explore + Search */}
        <div className="hidden lg:flex items-center gap-6 flex-1 max-w-3xl">
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
        <div className="flex items-center ml-auto gap-2 sm:gap-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors transform-gpu hover:scale-105"
            icon={theme === 'light' ? <BsMoon className="text-lg text-neutral-600" /> : <BsSun className="text-lg text-amber-400" />}
          />

          {/* CTA - Teach */}
          <div className="hidden lg:block ml-2">

            <Link href="/instructor_signup" className="inline-flex">
              <Button>{cta.desktopText}</Button>
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleWishList}
                    className={`rounded-full w-10 h-10 p-0 flex items-center justify-center transition-colors ${isWishlistOpen ? 'bg-red-50 text-red-500' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                    icon={<BiHeart className="text-xl" />}
                  />
                  {wishlistCourses.length > 0 && (
                    <Badge
                      variant="error"
                      size="xs"
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white dark:border-neutral-900"
                    >
                      {wishlistCourses.length}
                    </Badge>
                  )}
                </div>

                <div className="relative" ref={userDropdownRef}>
                  {initials ? (
                    <button
                      onClick={toggleDropdown}
                      className={`rounded-full w-10 h-10 p-0 flex items-center justify-center transition-all text-white font-semibold ${isUserDropdownOpen ? 'ring-2 ring-offset-2 ring-primary-300' : 'hover:scale-105'} bg-gradient-to-br from-primary-500 to-rose-500`}
                      title={userName || 'Account'}
                      aria-haspopup="true"
                      aria-expanded={isUserDropdownOpen}
                    >
                      {initials}
                    </button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleDropdown}
                      className={`rounded-full w-10 h-10 p-0 flex items-center justify-center transition-colors ${isUserDropdownOpen ? 'bg-primary-50 text-primary-600' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      icon={<BsPersonCircle className="text-xl" />}
                    />
                  )}
                </div>
              </>
            ) : (
              <LogInSignUp />
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full w-10 h-10 p-0 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800"
              icon={isMobileMenuOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 flex items-start justify-center p-6 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/6 overflow-hidden animate-in slide-in-from-top duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-4">
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

              {/* Mobile Explore */}
              <div className="py-2">
                <ExploreDropDown isOpen={isOpen} setIsOpen={setIsOpen} />
              </div>

              {/* CTA + User Actions */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-3">
                <Link href="/instructor_signup" className="w-full">
                  <Button variant="primary" size="md" className={`bg-gradient-to-br ${cta.gradient} ${cta.textColor} w-full rounded-full py-3 focus:outline-none ${cta.focusRing}`}>{cta.mobileText}</Button>
                </Link>

                {isLoggedIn ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={toggleWishList}
                      className="w-full justify-center"
                      icon={<BiHeart />}
                    >
                      Wishlist ({wishlistCourses.length})
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={toggleDropdown}
                      className="w-full justify-center"
                      icon={<BsPersonCircle />}
                    >
                      Account
                    </Button>
                  </div>
                ) : (
                  <LogInSignUp />
                )}

                {/* Close button */}
                <div className="pt-3">
                  <Button variant="ghost" size="md" onClick={() => setIsMobileMenuOpen(false)} className="w-full">Close</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Dropdowns */}
      {isLoggedIn && (
        <div className="hidden sm:block absolute top-16 right-4 z-50">
          <UserDropDown
            setisLoggedIn={setisLoggedIn}
            userDropdownRef={userDropdownRef}
            isOpen={isUserDropdownOpen}
          />
          <Wishlist
            wishlistCourses={wishlistCourses}
            onRemoveCourse={removeFromWishlist}
            WishListRef={WishListRef}
            isOpen={isWishlistOpen}
          />
        </div>
      )}

      {/* Mobile Dropdowns */}
      {isMobileMenuOpen && isLoggedIn && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-700 p-4 space-y-4">
          <Wishlist
            wishlistCourses={wishlistCourses}
            onRemoveCourse={removeFromWishlist}
            WishListRef={WishListRef}
            isOpen={isWishlistOpen}
          />
          <UserDropDown
            setisLoggedIn={setisLoggedIn}
            userDropdownRef={userDropdownRef}
            isOpen={isUserDropdownOpen}
          />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
