import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full py-12 px-6 md:px-12 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200/50 dark:border-slate-800/30 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold text-slate-800 dark:text-slate-200">
            DropGuard
          </span>
        </div>

        {/* Text */}
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-left">
          &copy; {new Date().getFullYear()} DropGuard. Developed for early warning and proactive student support systems.
        </p>

        {/* Links */}
        <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#about" className="hover:text-primary transition-colors">About</a>
          <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
