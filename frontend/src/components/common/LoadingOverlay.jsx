import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Brain, LineChart, Sparkles, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from './GlassCard';
import LoadingAnimation from './LoadingAnimation';
import LoadingMessages from './LoadingMessages';

export default function LoadingOverlay({ isComplete = false, onTransitionComplete }) {
  const { user } = useAuth();
  const [takingLonger, setTakingLonger] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTakingLonger(true);
    }, 4000); // Trigger slower load message if backend is starting up

    return () => clearTimeout(timer);
  }, []);

  // Success hold duration setup
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        if (onTransitionComplete) {
          onTransitionComplete();
        }
      }, 1000); // Wait 1s for checkmark to draw and hold
      return () => clearTimeout(timer);
    }
  }, [isComplete, onTransitionComplete]);

  const styles = `
    @keyframes dg-overlay-shimmer {
      0% { transform: translateX(-150%); }
      50% { transform: translateX(150%); }
      100% { transform: translateX(150%); }
    }
    @keyframes dg-bg-float-1 {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(8deg); }
    }
    @keyframes dg-bg-float-2 {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(12px) rotate(-6deg); }
    }
    .animate-dg-overlay-shimmer {
      animation: dg-overlay-shimmer 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    .animate-dg-bg-float-1 {
      animation: dg-bg-float-1 7s ease-in-out infinite;
    }
    .animate-dg-bg-float-2 {
      animation: dg-bg-float-2 9s ease-in-out infinite;
    }
  `;

  // Determine user first name and school
  const firstName = user?.full_name ? user.full_name.split(' ')[0] : '';
  const isSchoolUser = user && (user.role === 'teacher' || user.role === 'headmaster');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 dark:bg-slate-950/75 backdrop-blur-xl px-6 py-12 select-none"
    >
      <style>{styles}</style>

      {/* Decorative background radial gradients */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-primary/15 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Floating AI & Education Icons in the Background */}
      <div className="hidden sm:block absolute top-[15%] left-[12%] opacity-15 dark:opacity-20 text-indigo-500 animate-dg-bg-float-1">
        <Brain className="w-12 h-12" />
      </div>
      <div className="hidden sm:block absolute top-[20%] right-[12%] opacity-15 dark:opacity-20 text-primary animate-dg-bg-float-2" style={{ animationDelay: '1s' }}>
        <GraduationCap className="w-12 h-12" />
      </div>
      <div className="hidden sm:block absolute bottom-[22%] left-[10%] opacity-15 dark:opacity-20 text-emerald-500 animate-dg-bg-float-2" style={{ animationDelay: '2.5s' }}>
        <LineChart className="w-10 h-10" />
      </div>
      <div className="hidden sm:block absolute bottom-[18%] right-[10%] opacity-15 dark:opacity-20 text-amber-500 animate-dg-bg-float-1" style={{ animationDelay: '3.5s' }}>
        <Sparkles className="w-10 h-10" />
      </div>
      <div className="hidden sm:block absolute top-[48%] left-[6%] opacity-10 dark:opacity-15 text-slate-400 animate-dg-bg-float-1" style={{ animationDelay: '1.8s' }}>
        <BookOpen className="w-8 h-8" />
      </div>

      <GlassCard className="max-w-md w-full border-white/20 dark:border-white/5 p-8 relative flex flex-col items-center text-center shadow-2xl select-none overflow-hidden" hoverEffect={false}>
        {/* Shimmer Sheen Layer */}
        <div 
          className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black, transparent)'
          }}
        >
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 dark:via-white/5 to-transparent -translate-x-full animate-dg-overlay-shimmer" />
        </div>

        {/* Brand Logo & Personalized Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-6 w-full animate-in fade-in zoom-in-95 duration-550"
        >
          {/* Logo container */}
          <div className="relative bg-gradient-to-br from-primary/10 to-indigo-500/10 dark:from-primary/20 dark:to-indigo-500/20 text-primary p-3.5 rounded-2xl mb-4 border border-primary/20 dark:border-primary/10 shadow-inner group">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl animate-ping opacity-25 scale-75 group-hover:scale-100 transition-transform duration-1000" />
            <GraduationCap className="h-9 w-9 text-primary dark:text-indigo-400 relative z-10" />
          </div>

          {/* Welcome Title */}
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            {firstName ? `Welcome back, ${firstName}!` : "Welcome to DropGuard AI"}
          </h2>

          {/* School Badge (Teacher/Headmaster) */}
          {isSchoolUser && user.school_name && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-semibold mt-2.5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm max-w-[90%] truncate">
              <span className="shrink-0 text-xs">🏫</span>
              <span className="truncate">{user.school_name}</span>
            </div>
          )}

          {/* Workspace Status Banners */}
          {user ? (
            <div className="mt-3.5 flex flex-col items-center">
              <span className="text-[10px] font-bold text-primary dark:text-indigo-400 tracking-widest uppercase bg-primary/5 dark:bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/10">
                {user.role === 'admin' && 'Administrator Workspace'}
                {user.role === 'headmaster' && 'Headmaster Workspace'}
                {user.role === 'teacher' && 'Teacher Workspace'}
                {user.role === 'deo' && 'DEO Workspace'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1.5 animate-pulse">
                {user.role === 'admin' && 'Loading system management dashboard...'}
                {user.role === 'headmaster' && 'Preparing school analytics...'}
                {user.role === 'teacher' && 'Preparing classroom insights...'}
                {user.role === 'deo' && 'Preparing district analytics...'}
              </span>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-2 animate-pulse">
              Preparing your workspace...
            </p>
          )}
        </motion.div>

        {/* Content Section: Switch between loading state & success screen */}
        <div className="w-full flex flex-col items-center justify-center min-h-[240px]">
          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center justify-center py-6 w-full"
              >
                {/* Success checkmark badge */}
                <div className="relative mb-6">
                  <motion.div 
                    className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [0.8, 1.1, 1] }}
                    transition={{ duration: 0.4 }}
                  >
                    <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <motion.path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      />
                    </svg>
                  </motion.div>
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-25 scale-75" />
                </div>

                <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-450 flex items-center gap-1.5 tracking-wide">
                  ✓ Workspace Ready
                </h2>
                <p className="text-slate-555 dark:text-slate-400 text-sm font-semibold mt-2">
                  Welcome to DropGuard AI
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="loading-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center w-full"
              >
                <LoadingAnimation />
                <LoadingMessages />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Custom Footer notice */}
        <div className="mt-4 pt-6 border-t border-slate-100 dark:border-slate-800/80 w-full text-center relative z-10">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold transition-all duration-300 min-h-[32px] flex items-center justify-center leading-relaxed">
            {takingLonger 
              ? "This may take a few moments the first time." 
              : "Please wait while we prepare your personalized workspace."
            }
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
}
