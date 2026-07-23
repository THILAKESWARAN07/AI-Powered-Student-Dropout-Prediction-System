import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/common/GlassCard';
import { School, Users, ShieldAlert, Cpu, Sparkles, LogIn } from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [schoolsCount, setSchoolsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const schools = await api.get('/schools');
        setSchoolsCount(schools.data.length);
      } catch (err) {}

      try {
        if (user?.role === 'admin' || user?.role === 'deo') {
          const users = await api.get('/users');
          setUsersCount(users.data.length);
        }
      } catch (err) {}
    };
    fetchStats();
  }, [user]);

  const roleLabels = {
    admin: 'Administrator Portal',
    headmaster: 'Headmaster Registry',
    teacher: 'Educator Console',
    deo: 'District Education Officer Dashboard'
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Welcome Banner */}
      <GlassCard className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-white/30 dark:border-white/5 p-8" hoverEffect={false}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
              <Sparkles className="h-4 w-4" />
              Welcome Back, {user?.full_name}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {roleLabels[user?.role] || 'Academic Console'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-xl">
              Monitor school strengths, review student dropouts risks matrices, and maintain administrative records.
            </p>
          </div>
          <div className="shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">System Status</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold">Online & Active</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="border-white/30 dark:border-white/5 flex items-center gap-4">
          <div className="bg-blue-500/10 text-blue-500 p-4 rounded-2xl">
            <School className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase">Registered Schools</span>
            <h3 className="text-3xl font-bold mt-1">{schoolsCount}</h3>
          </div>
        </GlassCard>

        {(user?.role === 'admin' || user?.role === 'deo') && (
          <GlassCard className="border-white/30 dark:border-white/5 flex items-center gap-4">
            <div className="bg-indigo-500/10 text-indigo-500 p-4 rounded-2xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase">System Users</span>
              <h3 className="text-3xl font-bold mt-1">{usersCount}</h3>
            </div>
          </GlassCard>
        )}

        <GlassCard className="border-white/30 dark:border-white/5 flex items-center gap-4">
          <div className="bg-amber-500/10 text-amber-500 p-4 rounded-2xl">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase">Risk Predictor Status</span>
            <h3 className="text-sm font-semibold mt-1.5 text-slate-500">Locked (Module 3)</h3>
          </div>
        </GlassCard>
      </div>

      {/* Overview/Notice Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-8 border-white/30 dark:border-white/5" hoverEffect={false}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-500" />
            System Architecture Progress
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="bg-emerald-500/10 text-emerald-500 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
              <div>
                <h4 className="font-semibold text-sm">Module 1: Baseline</h4>
                <p className="text-xs text-slate-500">Database core connections, React routers, static stylesheets, and Docker templates.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-emerald-500/10 text-emerald-500 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
              <div>
                <h4 className="font-semibold text-sm">Module 2: Identity & Portal Access</h4>
                <p className="text-xs text-slate-500">JWT security mechanisms, user profile updates, Activity Audit Logs, and School registries.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-slate-100 dark:bg-slate-800 text-slate-400 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
              <div>
                <h4 className="font-semibold text-sm text-slate-400">Module 3: Student registries & ML predictions (Upcoming)</h4>
                <p className="text-xs text-slate-500/50">Student demographics data upload (Excel/CSV), machine learning risk evaluations, and counseling interventions tracking.</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-8 border-white/30 dark:border-white/5" hoverEffect={false}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <LogIn className="h-5 w-5 text-indigo-500" />
            Session Statistics
          </h3>
          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/50 pb-2">
              <span className="text-slate-500 font-medium">Authentication Type:</span>
              <span className="font-bold">Role-Based JWT</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/50 pb-2">
              <span className="text-slate-500 font-medium">Assigned Email:</span>
              <span className="font-bold">{user?.email}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/50 pb-2">
              <span className="text-slate-500 font-medium">Allocated School ID:</span>
              <span className="font-bold">{user?.school_id || 'Not Assigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Last Login:</span>
              <span className="font-bold text-xs">
                {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Just Registered'}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
