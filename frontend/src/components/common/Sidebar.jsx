import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, School, Users, History, User, Settings, LogOut, Menu, X, GraduationCap, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', path: '/portal/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: ['admin', 'headmaster', 'teacher', 'deo'] },
    { name: 'Schools', path: '/portal/schools', icon: <School className="h-5 w-5" />, roles: ['admin', 'headmaster', 'teacher', 'deo'] },
    { name: 'Students', path: '/portal/students', icon: <GraduationCap className="h-5 w-5" />, roles: ['admin', 'headmaster', 'teacher', 'deo'] },
    { name: 'Users', path: '/portal/users', icon: <Users className="h-5 w-5" />, roles: ['admin', 'deo'] },
    { name: 'Activity Logs', path: '/portal/logs', icon: <History className="h-5 w-5" />, roles: ['admin'] },
    { name: 'Profile', path: '/portal/profile', icon: <User className="h-5 w-5" />, roles: ['admin', 'headmaster', 'teacher', 'deo'] },
    { name: 'Settings', path: '/portal/settings', icon: <Settings className="h-5 w-5" />, roles: ['admin', 'headmaster', 'teacher', 'deo'] },
  ];

  const visibleItems = navigationItems.filter(item => item.roles.includes(user?.role));

  const roleLabels = {
    admin: 'Administrator',
    headmaster: 'Headmaster',
    teacher: 'Educator',
    deo: 'District Officer (DEO)'
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800 p-4 w-64">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 py-4 border-b border-slate-800 mb-6 justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 text-primary p-2 rounded-xl">
            <GraduationCap className="h-6 w-6 text-indigo-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            DropGuard<span className="text-indigo-400">.</span>
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-slate-800 pt-4 mt-auto">
        <div className="flex items-center gap-3 px-2 py-2 mb-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white uppercase">
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
          <div className="flex-grow min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{user?.full_name}</h4>
            <span className="text-xs text-slate-500 font-medium truncate block">
              {roleLabels[user?.role] || user?.role}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setMobileOpen(false);
            logout();
          }}
          className="flex w-full items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Top Header */}
      <div className="lg:hidden w-full bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center text-white sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-indigo-400" />
          <span className="text-lg font-bold">DropGuard</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Overlay Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar Drawer Panel */}
          <div className="relative flex flex-col h-full w-64 max-w-sm bg-slate-900 animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
