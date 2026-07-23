import React, { useState, useEffect } from 'react';
import GlassCard from '../components/common/GlassCard';
import { useToast } from '../context/ToastContext';
import { History, Search, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function ActivityLogs() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/activity-logs');
      setLogs(res.data);
    } catch (err) {
      showToast('Could not load audit log records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'login': return 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'logout': return 'bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400';
      case 'password_change': return 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400';
      case 'register': return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400';
      case 'school_create': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      case 'school_update': return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400';
      case 'school_delete': return 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400';
      default: return 'bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400';
    }
  };

  // Search filter
  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user?.email && log.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Security & Audit Logs</h1>
        <p className="text-sm text-slate-500">Track registration records, credentials changes, and schema updates</p>
      </div>

      {/* Search Input */}
      <GlassCard className="p-4 flex items-center gap-3 border-white/30 dark:border-white/5" hoverEffect={false}>
        <Search className="h-5 w-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Filter audit logs by action, keyword description, or user email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-transparent border-none text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0"
        />
      </GlassCard>

      {/* Logs Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="text-sm text-slate-500 font-semibold">Loading system activity audit trail...</span>
        </div>
      ) : paginatedLogs.length === 0 ? (
        <GlassCard className="p-12 text-center border-white/30 dark:border-white/5" hoverEffect={false}>
          <p className="text-slate-500 dark:text-slate-400 font-semibold">No audit logs match your search.</p>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300 border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-900 text-xs font-extrabold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">User Identity</th>
                  <th className="px-6 py-4">Event Action</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white/50 dark:bg-slate-950/40 backdrop-blur-md">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {log.user ? (
                        <div className="flex flex-col">
                          <span>{log.user.full_name}</span>
                          <span className="text-xs text-slate-500 font-normal">{log.user.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">System Event</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${getActionBadgeColor(log.action)}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium max-w-[300px] truncate" title={log.description}>
                      {log.description}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 select-none">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 disabled:opacity-50 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 disabled:opacity-50 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
