import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, User, Settings, LogOut, ChevronDown, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Header({ setMobileOpen }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleLabels = {
    admin: 'Administrator',
    headmaster: 'Headmaster',
    teacher: 'Educator',
    deo: 'District Officer (DEO)'
  };

  const handleDropdownItemClick = (path) => {
    setDropdownOpen(false);
    navigate(path);
  };

  const handleLogoutClick = async () => {
    setDropdownOpen(false);
    await logout();
  };

  // Safe image path checking
  const getAvatarUrl = () => {
    if (!user?.profile_image) return null;
    return user.profile_image.startsWith('http') 
      ? user.profile_image 
      : `http://localhost:8000${user.profile_image}`;
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/75 dark:bg-slate-950/75 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-all duration-300">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Mobile Hamburger & Logo OR Desktop greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 lg:hidden transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-2 lg:hidden">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-850 dark:text-white">
              DropGuard
            </span>
          </div>

          <div className="hidden lg:flex flex-col">
            <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
              Overview Panel
            </span>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">
              Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{user?.full_name}</span>
            </h2>
          </div>
        </div>

        {/* Right Side: Theme Toggle & Profile Dropdown */}
        <div className="flex items-center gap-4">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-150 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-600" />
            )}
          </button>

          {/* Profile Section */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-all text-left focus:outline-none"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              {/* Avatar picture */}
              <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-200 dark:border-slate-800 bg-indigo-600 flex items-center justify-center font-bold text-white uppercase text-sm shrink-0">
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()}
                    alt="User avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user?.full_name?.charAt(0) || 'U'
                )}
              </div>

              {/* Username + role */}
              <div className="hidden md:flex flex-col pr-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                  {user?.full_name}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate block -mt-0.5">
                  {roleLabels[user?.role] || user?.role}
                </span>
              </div>
              
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Card */}
            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-52 origin-top-right rounded-2xl bg-white dark:bg-slate-950 p-2 shadow-xl border border-slate-150 dark:border-slate-900/60 animate-in fade-in slide-in-from-top-2 duration-150 focus:outline-none z-50"
                role="menu"
              >
                {/* Header-info within dropdown (visible on smaller screens) */}
                <div className="md:hidden px-3 py-2 border-b border-slate-100 dark:border-slate-900 mb-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.full_name}</p>
                  <p className="text-[10px] text-slate-450 truncate">{roleLabels[user?.role] || user?.role}</p>
                </div>

                <button
                  onClick={() => handleDropdownItemClick('/portal/profile')}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
                  role="menuitem"
                >
                  <User className="h-4 w-4 text-slate-450" />
                  My Profile
                </button>

                <button
                  onClick={() => handleDropdownItemClick('/portal/settings')}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
                  role="menuitem"
                >
                  <Settings className="h-4 w-4 text-slate-450" />
                  Settings
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-900" />

                <button
                  onClick={handleLogoutClick}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
