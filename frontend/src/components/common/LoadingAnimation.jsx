import React from 'react';
import { motion } from 'framer-motion';
import { Brain, GraduationCap, LineChart, Sparkles, Cpu } from 'lucide-react';

export default function LoadingAnimation() {
  const styles = `
    @keyframes dg-spin-cw {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes dg-spin-ccw {
      0% { transform: rotate(360deg); }
      100% { transform: rotate(0deg); }
    }
    @keyframes dg-dash-flow {
      0% { stroke-dashoffset: 80; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes dg-pulse-glow {
      0%, 100% { transform: scale(1); opacity: 0.15; }
      50% { transform: scale(1.15); opacity: 0.35; }
    }
    @keyframes dg-float-node {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-4px); }
    }
    .animate-dg-spin-cw {
      animation: dg-spin-cw 20s linear infinite;
    }
    .animate-dg-spin-ccw {
      animation: dg-spin-ccw 15s linear infinite;
    }
    .animate-dg-dash-flow {
      animation: dg-dash-flow 2.5s linear infinite;
    }
    .animate-dg-pulse-glow {
      animation: dg-pulse-glow 3s ease-in-out infinite;
    }
    .animate-dg-float-node {
      animation: dg-float-node 4s ease-in-out infinite;
    }
  `;

  return (
    <div className="relative w-48 h-48 flex items-center justify-center mb-6 select-none">
      <style>{styles}</style>

      {/* Central Pulsing Glow */}
      <div className="absolute w-24 h-24 bg-primary/10 dark:bg-primary/5 rounded-full blur-xl animate-dg-pulse-glow" />

      {/* SVG Circuit Lines & Orbit Rings */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Core dynamic gradient */}
        <defs>
          <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Orbit Rings */}
        <circle cx="100" cy="100" r="75" stroke="currentColor" className="text-slate-200/40 dark:text-slate-800/30" strokeWidth="1" strokeDasharray="6 6" />
        <circle cx="100" cy="100" r="75" stroke="url(#flow-gradient)" strokeWidth="1.5" strokeDasharray="30 150" strokeDashoffset="0" className="animate-dg-dash-flow" />
        
        <circle cx="100" cy="100" r="50" stroke="currentColor" className="text-slate-200/50 dark:text-slate-800/40" strokeWidth="1" />
        <circle cx="100" cy="100" r="50" stroke="url(#flow-gradient)" strokeWidth="1.5" strokeDasharray="15 80" strokeDashoffset="0" className="animate-dg-dash-flow" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />

        {/* Circuit Traces to Outer Nodes */}
        {/* Top Node Connection (100, 25) */}
        <path d="M 100 100 L 100 35" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1.5" />
        <path d="M 100 100 L 100 35" stroke="url(#flow-gradient)" strokeWidth="2" strokeDasharray="15 45" strokeDashoffset="0" className="animate-dg-dash-flow" />

        {/* Right Node Connection (175, 100) */}
        <path d="M 100 100 L 165 100" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1.5" />
        <path d="M 100 100 L 165 100" stroke="url(#flow-gradient)" strokeWidth="2" strokeDasharray="15 45" strokeDashoffset="0" className="animate-dg-dash-flow" />

        {/* Bottom Node Connection (100, 175) */}
        <path d="M 100 100 L 100 165" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1.5" />
        <path d="M 100 100 L 100 165" stroke="url(#flow-gradient)" strokeWidth="2" strokeDasharray="15 45" strokeDashoffset="0" className="animate-dg-dash-flow" />

        {/* Left Node Connection (25, 100) */}
        <path d="M 100 100 L 35 100" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1.5" />
        <path d="M 100 100 L 35 100" stroke="url(#flow-gradient)" strokeWidth="2" strokeDasharray="15 45" strokeDashoffset="0" className="animate-dg-dash-flow" />

        {/* Sub circuit branches */}
        <path d="M 100 70 L 115 55" stroke="currentColor" className="text-slate-200/50 dark:text-slate-800/40" strokeWidth="1" />
        <circle cx="115" cy="55" r="2" className="fill-slate-300 dark:fill-slate-700" />

        <path d="M 130 100 L 145 115" stroke="currentColor" className="text-slate-200/50 dark:text-slate-800/40" strokeWidth="1" />
        <circle cx="145" cy="115" r="2" className="fill-slate-300 dark:fill-slate-700" />

        <path d="M 100 130 L 85 145" stroke="currentColor" className="text-slate-200/50 dark:text-slate-800/40" strokeWidth="1" />
        <circle cx="85" cy="145" r="2" className="fill-slate-300 dark:fill-slate-700" />

        <path d="M 70 100 L 55 85" stroke="currentColor" className="text-slate-200/50 dark:text-slate-800/40" strokeWidth="1" />
        <circle cx="55" cy="85" r="2" className="fill-slate-300 dark:fill-slate-700" />
      </svg>

      {/* Central Hub Badge (AI Processing Core) */}
      <motion.div 
        className="absolute z-10 w-14 h-14 bg-white/80 dark:bg-slate-900/80 border border-primary/30 dark:border-primary/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md text-primary animate-dg-float-node"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <Cpu className="w-7 h-7 text-primary animate-pulse" />
      </motion.div>

      {/* Outer Nodes - Absolute Positioned Badges */}
      {/* Top Node: Brain (AI) */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-10 h-10 bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center shadow-md backdrop-blur-sm text-indigo-500 animate-dg-float-node"
        style={{ animationDelay: '0.5s' }}
      >
        <Brain className="w-5 h-5 text-indigo-500 animate-pulse" />
      </div>

      {/* Right Node: LineChart (Data Analytics) */}
      <div 
        className="absolute right-0 top-1/2 translate-x-2 -translate-y-1/2 w-10 h-10 bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center shadow-md backdrop-blur-sm text-emerald-500 animate-dg-float-node"
        style={{ animationDelay: '1s' }}
      >
        <LineChart className="w-5 h-5 text-emerald-500 animate-pulse" />
      </div>

      {/* Bottom Node: GraduationCap (Education) */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-10 h-10 bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center shadow-md backdrop-blur-sm text-primary animate-dg-float-node"
        style={{ animationDelay: '1.5s' }}
      >
        <GraduationCap className="w-5 h-5 text-primary animate-pulse" />
      </div>

      {/* Left Node: Sparkles (Student Insights) */}
      <div 
        className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-10 h-10 bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center shadow-md backdrop-blur-sm text-amber-500 animate-dg-float-node"
        style={{ animationDelay: '2s' }}
      >
        <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
      </div>
    </div>
  );
}
