import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-6">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-mesh pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      
      <GlassCard className="max-w-md text-center p-12 border-white/30 dark:border-white/5" hoverEffect={false}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="inline-block p-4 bg-primary/10 rounded-full text-primary mb-6"
        >
          <Compass className="h-12 w-12" />
        </motion.div>
        
        <h1 className="text-6xl font-black text-primary tracking-tight mb-2">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Lost in Space</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
          The link you followed may be broken or the page might have been removed. Let's get you back on track.
        </p>
        
        <Link
          to="/"
          className="bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/25 px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-all duration-300"
        >
          <Home className="h-4 w-4" /> Go to Home
        </Link>
      </GlassCard>
    </div>
  );
}
