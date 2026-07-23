import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/common/GlassCard';
import { Camera, Loader2, Lock, User as UserIcon, Phone, Mail, Award, Landmark, History } from 'lucide-react';
import api from '../services/api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  // Profile Edit fields
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [avatarLoading, setAvatarLoading] = useState(false);

  const roleLabels = {
    admin: 'System Administrator',
    headmaster: 'School Headmaster',
    teacher: 'Teacher / Educator',
    deo: 'District Education Officer'
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!fullName) {
      showToast('Full name is required', 'error');
      return;
    }
    setUpdatingProfile(true);
    try {
      const res = await api.put(`/users/${user.id}`, {
        full_name: fullName,
        phone: phone || null
      });
      setUser(res.data);
      showToast('Profile details updated successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Could not update profile', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    setUpdatingPassword(true);
    try {
      await api.post('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword
      });
      showToast('Password updated successfully', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Could not update password', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Selected file must be an image', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setAvatarLoading(true);
    try {
      const res = await api.post('/users/me/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(res.data);
      showToast('Avatar updated successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Avatar upload failed', 'error');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Manage Profile</h1>
        <p className="text-sm text-slate-500">Edit account variables, update credentials, and upload profile pictures</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card & Avatar */}
        <div className="space-y-6">
          <GlassCard className="p-8 border-white/30 dark:border-white/5 flex flex-col items-center text-center" hoverEffect={false}>
            {/* Avatar upload */}
            <div className="relative group mb-6">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-primary flex items-center justify-center font-black text-2xl uppercase">
                {user?.profile_image ? (
                  <img 
                    src={user.profile_image.startsWith('http') ? user.profile_image : `http://localhost:8000${user.profile_image}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.full_name.charAt(0)
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white hover:bg-primary/95 transition-all shadow-md group-hover:scale-105"
                title="Change Avatar"
              >
                {avatarLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <h2 className="text-xl font-bold">{user?.full_name}</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mt-2 border border-primary/20">
              <Award className="h-3.5 w-3.5" />
              {roleLabels[user?.role] || user?.role}
            </div>

            {/* Profile info list */}
            <div className="w-full space-y-4 border-t border-slate-200 dark:border-slate-800/50 pt-6 mt-6 text-sm text-left">
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase block">Email Address</span>
                  <span className="font-semibold block truncate">{user?.email}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase block">Phone Number</span>
                  <span className="font-semibold block">{user?.phone || 'Not Configured'}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Landmark className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase block">School Assignment</span>
                  <span className="font-semibold block">
                    {user?.school_id ? `Assigned (School ID: ${user.school_id})` : 'No Assigned School'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <History className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase block">Last Login Audit</span>
                  <span className="font-semibold text-xs block leading-relaxed">
                    {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Just Registered'}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Edit Form & Password Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Details */}
          <GlassCard className="p-8 border-white/30 dark:border-white/5" hoverEffect={false}>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-indigo-500" />
              Account Details
            </h3>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1 uppercase">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1 uppercase">Email Address (Read-only)</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-75 disabled:pointer-events-none"
              >
                {updatingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </form>
          </GlassCard>

          {/* Change Password */}
          {user?.provider !== 'google' && (
            <GlassCard className="p-8 border-white/30 dark:border-white/5" hoverEffect={false}>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-500" />
                Security Password Change
              </h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1 uppercase">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1 uppercase">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1 uppercase">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-75 disabled:pointer-events-none"
                >
                  {updatingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                  Change Password
                </button>
              </form>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
