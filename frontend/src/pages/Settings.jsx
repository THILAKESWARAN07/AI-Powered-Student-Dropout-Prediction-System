import React, { useState } from 'react';
import GlassCard from '../components/common/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Bell, Shield, Keyboard, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('24h');

  const handleSavePreferences = (e) => {
    e.preventDefault();
    showToast('Saved settings preferences successfully', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-500">Configure layout themes, security tokens, and email alerts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side Toggles */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appearance setting */}
          <GlassCard className="p-8 border-white/30 dark:border-white/5" hoverEffect={false}>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Sun className="h-5 w-5 text-indigo-500" />
              Theme Appearance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                  theme === 'light'
                    ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
                }`}
              >
                <Sun className="h-6 w-6 text-amber-500" />
                <span className="text-sm font-semibold">Light Mode</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
                }`}
              >
                <Moon className="h-6 w-6 text-indigo-400" />
                <span className="text-sm font-semibold">Dark Mode</span>
              </button>
            </div>
          </GlassCard>

          {/* Notifications setting */}
          <GlassCard className="p-8 border-white/30 dark:border-white/5" hoverEffect={false}>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-500" />
              Notification Settings (Placeholder)
            </h3>
            <form onSubmit={handleSavePreferences} className="space-y-4">
              <div className="flex items-center justify-between py-2.5 border-b border-slate-200 dark:border-slate-800/50">
                <div>
                  <h4 className="font-semibold text-sm">Critical Risk Email Alerts</h4>
                  <p className="text-xs text-slate-500">Sends daily alert listing high-risk student additions</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded text-primary focus:ring-primary/50 h-4.5 w-4.5"
                />
              </div>

              <div className="flex items-center justify-between py-2.5 border-b border-slate-200 dark:border-slate-800/50">
                <div>
                  <h4 className="font-semibold text-sm">Audit Log SMS Digests</h4>
                  <p className="text-xs text-slate-500">Receive SMS warnings for unauthorized login attempts</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="rounded text-primary focus:ring-primary/50 h-4.5 w-4.5"
                />
              </div>

              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all active:scale-[0.98]"
              >
                Save Preferences
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Side Security */}
        <div className="space-y-6">
          <GlassCard className="p-8 border-white/30 dark:border-white/5" hoverEffect={false}>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500" />
              Security Settings
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Session Token Life</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => {
                    setSessionTimeout(e.target.value);
                    showToast('Session expiration limit updated', 'success');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-200"
                >
                  <option value="1h">1 Hour</option>
                  <option value="12h">12 Hours</option>
                  <option value="24h">24 Hours (Default)</option>
                  <option value="7d">7 Days</option>
                </select>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-xs leading-relaxed">
                Tokens are signed using a secure HS256 algorithm. To invalidate active keys, change the SECRET_KEY environment variable.
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
