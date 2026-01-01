import React from "react";
import secureLocalStorage from "react-secure-storage";

const UserDropDown = ({ setisLoggedIn, userDropdownRef, isOpen = false }) => {
  const logout = () => {
    secureLocalStorage.clear();
    setisLoggedIn(false);
  };

  return (
    <div
      className="flex-col hidden mr-2 md:order-2"
      ref={userDropdownRef}
      aria-hidden={!isOpen}
    >
      <div
        className="z-50 my-2 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600"
        id="user-dropdown"
        role="menu"
        aria-labelledby="user-menu-button"
      >
        <div className="px-4 py-3">
          <span className="block text-sm text-gray-900 dark:text-white">
            {secureLocalStorage.getItem("u_name")}
          </span>
          <span className="block text-sm  text-gray-500 truncate dark:text-gray-400">
            {secureLocalStorage.getItem("u_email")}
          </span>
        </div>
        <ul className="py-2">
          <li role="menuitem">
            <a
              href="/user"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
            >
              Dashboard
            </a>
          </li>
          <li role="menuitem">
            <a
              href="/"
              onClick={logout}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
            >
              Log out
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserDropDown;
