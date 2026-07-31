import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send recovery link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-6 py-12">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-mesh pointer-events-none -z-10" />

      <GlassCard className="max-w-md w-full border-white/40 dark:border-white/5 p-8 md:p-10" hoverEffect={false}>
        {/* Logo/Icon */}
        <div className="flex items-center justify-center gap-3.5 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight block">DropGuard</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">System Recovery</span>
          </div>
        </div>

        {!success ? (
          <>
            <h2 className="text-xl font-black mb-2 text-center">Recover Your Password</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6 leading-relaxed">
              Enter your registered email address below, and we will issue a secure link to reset your account credentials.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold p-3.5 rounded-xl mb-5 leading-normal">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="name@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-75"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Recovery Link
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <h2 className="text-xl font-black text-emerald-500">Recovery Link Sent!</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              If the email <strong>{email}</strong> is registered in our portal, a password reset link has been dispatched.
            </p>
            <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80 text-[10px] text-slate-400 font-medium">
              Note: For local development testing, copy the generated password reset link directly from the terminal log.
            </div>
          </div>
        )}

        {/* Back Link */}
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-semibold mx-auto mt-8 block w-fit">
          <ArrowLeft className="h-4 w-4" /> Return to Login
        </Link>
      </GlassCard>
    </div>
  );
}
