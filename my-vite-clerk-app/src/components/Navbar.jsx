import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignOutButton, useUser } from '@clerk/clerk-react';
import { ChatBubbleLeftIcon, UserIcon, PlusIcon, HomeIcon, Bars3Icon } from '@heroicons/react/24/solid';

function Navbar() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleSignOut = () => {
    navigate('/');
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  return (
    <nav className="bg-gray-900 border-gray-700">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Zesto" />
          <span className="self-center text-2xl font-semibold text-white">Zesto</span>
        </Link>

        {/* Mobile Menu Toggle and Profile */}
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0">
          {user && (
            <div className="relative">
              <button
                type="button"
                className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-600"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                aria-expanded={isProfileDropdownOpen}
                aria-controls="user-dropdown"
              >
                <span className="sr-only">Open user menu</span>
                <img
                  className="w-8 h-8 rounded-full"
                  src={user?.imageUrl || 'https://cdn.flyonui.com/fy-assets/avatar/avatar-1.png'}
                  alt="User profile"
                />
              </button>
              {/* Profile Dropdown */}
              <div
                className={`${
                  isProfileDropdownOpen ? 'block' : 'hidden'
                } z-50 absolute right-0 my-4 text-base list-none bg-gray-700 divide-y divide-gray-600 rounded-lg shadow-sm`}
                id="user-dropdown"
              >
                <div className="px-4 py-3">
                  <span className="block text-sm text-white">{user?.firstName || 'User'}</span>
                  <span className="block text-sm text-gray-400 truncate">{user?.primaryEmailAddress?.emailAddress}</span>
                </div>
                <ul className="py-2" aria-labelledby="user-menu-button">
                  <li>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <UserIcon className="h-5 w-5 mr-2" />
                      Profile
                    </Link>
                  </li>
                 
                  <li>
                    <SignOutButton signOutCallback={handleSignOut}>
                      <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign Out
                      </button>
                    </SignOutButton>
                  </li>
                </ul>
              </div>
            </div>
          )}
          <button
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-400 rounded-lg md:hidden hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-controls="navbar-user"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div
          className={`${
            isMobileMenuOpen ? 'block' : 'hidden'
          } items-center justify-between w-full md:flex md:w-auto md:order-1`}
          id="navbar-user"
        >
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-700 rounded-lg bg-gray-800 md:space-x-8 md:flex-row md:mt-0 md:border-0 md:bg-gray-900">
            <li>
              <Link
                to="/"
                className="block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-500 md:p-0 hover:bg-gray-700 md:hover:bg-transparent md:hover:text-blue-400 transition duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current="page"
              >
                Home
              </Link>
            </li>
            
            <li>
              <Link
                to="/my-ads"
                className="flex items-center py-2 px-3 text-white rounded-sm hover:bg-gray-700 md:hover:bg-transparent md:hover:text-blue-500 md:p-0 transition duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                
                My Ads
              </Link>
            </li>
            <li>
              <Link
                to="/chat"
                className="flex items-center py-2 px-3 text-white rounded-sm hover:bg-gray-700 md:hover:bg-transparent md:hover:text-blue-500 md:p-0 transition duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                Chat Request
              </Link>
            </li>
            
            <li>
              <Link
                to="/post-ad"
                className="flex items-center py-2 px-3 text-white rounded-sm hover:bg-gray-700 md:hover:bg-transparent md:hover:text-blue-500 md:p-0 transition duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Post an Ad
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;