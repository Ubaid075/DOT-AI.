import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { SunIcon, MoonIcon, SparklesIcon, LogoutIcon, UserIcon, StarIcon } from './Icons';
import Button from './Button';
import Modal from './Modal';
import ProfileModal from './ProfileModal';
import Avatar from './Avatar';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isBuyCreditsModalOpen, setIsBuyCreditsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  }

  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm transition-colors duration-300"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0rem)',
          paddingLeft: 'env(safe-area-inset-left, 0rem)',
          paddingRight: 'env(safe-area-inset-right, 0rem)'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 border-b border-gray-200 dark:border-gray-800">
            <Link to="/" className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-black focus:ring-blue-500 rounded-lg">
              <span className="w-5 h-5 bg-blue-500 rounded-full animate-glow"></span>
              <h1 className="text-2xl font-bold tracking-tighter text-black dark:text-white">DOT Ai</h1>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/gallery">
                  <Button variant="secondary" className="!text-sm !px-3 !py-1.5 hidden sm:block">
                      Gallery
                  </Button>
              </Link>
               <Link to="/support">
                  <Button variant="secondary" className="!text-sm !px-3 !py-1.5 hidden sm:block">
                    Support
                  </Button>
               </Link>
              {currentUser ? (
                  <>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setIsDropdownOpen(prev => !prev)}
                        className="flex items-center h-10 space-x-2 bg-gray-200 dark:bg-gray-800 pl-2 pr-3 rounded-full text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-black focus:ring-blue-500"
                        aria-haspopup="true"
                        aria-expanded={isDropdownOpen}
                      >
                        <Avatar user={currentUser} className="w-7 h-7" />
                        <div className="flex items-center">
                          <SparklesIcon className="w-4 h-4 text-blue-500 mr-1" />
                          <span>{currentUser.role === 'admin' ? '∞' : currentUser.credits}</span>
                        </div>
                      </button>
                      {isDropdownOpen && (
                        <div
                          className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1 border dark:border-gray-700 animate-fade-in-scale z-50"
                        >
                          <button
                            type="button"
                            onClick={() => { setIsProfileModalOpen(true); setIsDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                          >
                            <UserIcon className="w-4 h-4" />
                            <span>My Profile</span>
                          </button>
                           <Link
                            to="/favorites"
                            onClick={() => setIsDropdownOpen(false)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                          >
                            <StarIcon className="w-4 h-4" filled={false} />
                            <span>My Favorites</span>
                          </Link>
                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                          >
                            <LogoutIcon className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      )}
                    </div>
                    {currentUser.role !== 'admin' && (
                        <Button onClick={() => setIsBuyCreditsModalOpen(true)} variant="secondary" className="!text-sm !px-3 !py-1.5 hidden sm:inline-flex">
                            Buy Credits
                        </Button>
                    )}
                  </>
              ) : (
                <Link to="/login">
                    <Button className="!text-sm !px-4 !py-1.5">
                      Login / Sign Up
                    </Button>
                </Link>
              )}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-black focus:ring-blue-500 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <MoonIcon className="w-6 h-6 object-contain" /> : <SunIcon className="w-6 h-6 object-contain" />}
              </button>
            </div>
          </div>
        </div>
      </header>
      <Modal isOpen={isBuyCreditsModalOpen} onClose={() => setIsBuyCreditsModalOpen(false)} />
      {currentUser && (
         <ProfileModal 
            isOpen={isProfileModalOpen} 
            onClose={() => setIsProfileModalOpen(false)} 
            user={currentUser}
            isEditable={true}
        />
      )}
    </>
  );
};

export default Header;