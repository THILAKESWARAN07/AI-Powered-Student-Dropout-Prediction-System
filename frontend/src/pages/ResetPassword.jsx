import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Password recovery token is missing. Please request a new link.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: password
      });
      setSuccess(true);
      showToast('Password reset successful', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. Link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-6 py-12">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-mesh pointer-events-none -z-10" />

      <GlassCard className="max-w-md w-full border-white/40 dark:border-white/5 p-8 md:p-10" hoverEffect={false}>
        {/* Header Logo */}
        <div className="flex items-center justify-center gap-3.5 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight block">DropGuard</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Reset Credentials</span>
          </div>
        </div>

        {!token ? (
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-500 flex items-center justify-center rounded-full">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-black text-red-500">Invalid Recovery Attempt</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your password recovery request lacks a security verification token. Please request a new recovery link.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              Request Password Reset
            </Link>
          </div>
        ) : !success ? (
          <>
            <h2 className="text-xl font-black mb-2 text-center">Establish New Password</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6 leading-relaxed">
              Create a strong password for your portal account. Minimum length: 6 characters.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold p-3.5 rounded-xl mb-5 leading-normal">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-75 mt-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Change Password
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4 py-4 animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-full">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-black text-emerald-500">Credentials Updated!</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your new password is now active. Redirecting you to login portal in 3 seconds...
            </p>
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
