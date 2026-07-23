import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, GraduationCap, AlertCircle, ArrowLeft } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-6">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-mesh pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <GlassCard className="max-w-md w-full border-white/30 dark:border-white/5 p-8" hoverEffect={false}>
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 text-primary p-3 rounded-2xl mb-3">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">DropGuard Portal</h1>
          <p className="text-slate-400 text-xs mt-1">AI-Powered School Dropout Prediction</p>
        </div>

        {/* Info Alert Box */}
        <div className="flex gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-sm mb-6 leading-relaxed">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Module 1 Baseline</span>: Authentication system (JWT credentials and user session validation) will be fully implemented in <strong>Module 2</strong>.
          </div>
        </div>

        {/* Inputs skeletons */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Email / Username</label>
            <div className="h-10 w-full rounded-xl bg-slate-200/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Password</label>
            <div className="h-10 w-full rounded-xl bg-slate-200/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
          </div>
        </div>

        {/* Submit Button skeleton */}
        <button
          disabled
          className="w-full bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 py-3 rounded-xl font-bold text-sm mb-6 cursor-not-allowed"
        >
          Portal Locked (Awaiting Module 2)
        </button>

        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-semibold mx-auto block w-fit">
          <ArrowLeft className="h-4 w-4" /> Return to Landing Page
        </Link>
      </GlassCard>
    </div>
  );
}
