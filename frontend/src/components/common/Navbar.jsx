import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, GraduationCap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'About Project', href: '#about' },
    { name: 'Technology', href: '#technology' },
  ];

  const handleScroll = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    
    // Check if we are on the landing page
    if (window.location.pathname !== '/') {
      navigate('/');
      // Wait for navigation before scrolling
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-white/20 dark:border-white/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-primary/10 text-primary p-2 rounded-xl group-hover:bg-primary/20 transition-all duration-300">
          <GraduationCap className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 tracking-tight">
          DropGuard<span className="text-primary font-black">.</span>
        </span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            onClick={(e) => handleScroll(e, link.href)}
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors duration-200"
          >
            {link.name}
          </a>
        ))}
      </div>

      {/* Actions (Theme & Login) */}
      <div className="hidden md:flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
        </button>

        {/* Login Button */}
        <Link
          to="/login"
          className="bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/25 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5"
        >
          Portal Login
        </Link>
      </div>

      {/* Mobile Toggle Buttons */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-700 dark:text-slate-300"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl text-slate-700 dark:text-slate-300"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-[73px] left-0 w-full glass-panel border-b border-white/20 dark:border-white/5 py-6 px-6 flex flex-col gap-4 md:hidden shadow-lg animate-in fade-in slide-in-from-top-5 duration-200">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="text-base font-medium text-slate-700 dark:text-slate-300 py-2 border-b border-slate-100 dark:border-slate-800 hover:text-primary transition-colors"
            >
              {link.name}
            </a>
          ))}
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="bg-primary text-white hover:bg-primary/95 text-center py-3 rounded-xl text-base font-semibold shadow-md shadow-primary/25 mt-2"
          >
            Portal Login
          </Link>
        </div>
      )}
    </nav>
  );
}
