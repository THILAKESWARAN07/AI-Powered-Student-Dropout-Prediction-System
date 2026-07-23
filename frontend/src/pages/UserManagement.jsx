import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/common/GlassCard';
import { 
  Users, Search, Edit, Trash2, X, Loader2, Award, Landmark, UserPlus, Check, AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [usersList, setUsersList] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit role modal state
  const [editUser, setEditUser] = useState(null);
  const [newRole, setNewRole] = useState('teacher');
  const [newSchoolId, setNewSchoolId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const isDeo = currentUser?.role === 'deo';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsersList(res.data);
    } catch (err) {
      showToast('Failed to load user records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await api.get('/schools');
      setSchools(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchUsers();
    fetchSchools();
  }, []);

  const openEditModal = (userToEdit) => {
    setEditUser(userToEdit);
    setNewRole(userToEdit.role);
    setNewSchoolId(userToEdit.school_id || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Update role if it changed
      if (newRole !== editUser.role) {
        await api.put(`/users/${editUser.id}/role`, { role: newRole });
      }

      // 2. Update school assignment if it changed
      if (parseInt(newSchoolId || 0) !== (editUser.school_id || 0)) {
        await api.put(`/users/${editUser.id}`, {
          school_id: newSchoolId ? parseInt(newSchoolId) : null
        });
      }

      showToast('User registry updated successfully', 'success');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId, email) => {
    if (userId === currentUser.id) {
      showToast('You cannot delete your own account', 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${email}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/users/${userId}`);
      showToast('User deleted successfully', 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete user', 'error');
    }
  };

  const roleLabels = {
    admin: 'Admin',
    headmaster: 'Headmaster',
    teacher: 'Teacher',
    deo: 'DEO'
  };

  const getSchoolName = (schoolId) => {
    if (!schoolId) return 'Not Assigned';
    const school = schools.find(s => s.id === schoolId);
    return school ? school.school_name : `School (ID: ${schoolId})`;
  };

  // Filter search
  const filteredUsers = usersList.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">User Directory</h1>
          <p className="text-sm text-slate-500">Manage user accounts, assign roles, and allocate school access</p>
        </div>
        {isAdmin && (
          <Link
            to="/register"
            className="bg-primary hover:bg-primary/95 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-[0.98] w-fit"
          >
            <UserPlus className="h-5 w-5" />
            Add New User
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <GlassCard className="p-4 flex items-center gap-3 border-white/30 dark:border-white/5" hoverEffect={false}>
        <Search className="h-5 w-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by user name or email address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0"
        />
      </GlassCard>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="text-sm text-slate-500 font-semibold">Loading user accounts directory...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <GlassCard className="p-12 text-center border-white/30 dark:border-white/5" hoverEffect={false}>
          <p className="text-slate-500 dark:text-slate-400 font-semibold">No registered users match your query.</p>
        </GlassCard>
      ) : (
        /* Users Table */
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-900 text-xs font-extrabold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Assigned School</th>
                <th className="px-6 py-4">Status</th>
                {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white/50 dark:bg-slate-950/40 backdrop-blur-md">
              {filteredUsers.map((userRow) => (
                <tr key={userRow.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold uppercase text-xs">
                      {userRow.full_name.charAt(0)}
                    </div>
                    {userRow.full_name}
                  </td>
                  <td className="px-6 py-4">{userRow.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      userRow.role === 'admin' 
                        ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' 
                        : userRow.role === 'headmaster' 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' 
                        : userRow.role === 'deo' 
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {roleLabels[userRow.role] || userRow.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-[200px] truncate">{getSchoolName(userRow.school_id)}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                      <Check className="h-4 w-4" /> Active
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEditModal(userRow)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-primary/10 hover:text-primary text-slate-400 transition-colors"
                          title="Assign Role/School"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(userRow.id, userRow.email)}
                          disabled={userRow.id === currentUser.id}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-red-500/10 hover:text-red-500 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT ROLE & SCHOOL ASSIGNMENT MODAL */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <GlassCard className="max-w-md w-full border-white/40 dark:border-white/5 p-8 relative animate-in zoom-in-95 duration-200" hoverEffect={false}>
            <button
              onClick={() => setEditUser(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Adjust Access Profile
            </h2>
            <p className="text-xs text-slate-500 mb-6">User email: {editUser.email}</p>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">System Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="headmaster">Headmaster</option>
                  <option value="deo">District Officer (DEO)</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Assigned School</label>
                <select
                  value={newSchoolId}
                  onChange={(e) => setNewSchoolId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                >
                  <option value="">No Assigned School</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.school_name}
                    </option>
                  ))}
                </select>
              </div>

              {editUser.id === currentUser.id && newRole !== 'admin' && (
                <div className="flex gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-3.5 rounded-xl text-xs font-medium leading-normal">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <span>WARNING: Changing your own role from Admin will instantly lock you out of this dashboard configuration console.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-75"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Apply Configuration
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
