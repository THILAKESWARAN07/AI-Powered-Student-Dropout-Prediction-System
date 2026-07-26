import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, School, Users, History, GraduationCap, Brain, Cpu, FileText, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', path: '/portal/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: ['admin', 'headmaster', 'teacher', 'deo'] },
    { name: 'Schools', path: '/portal/schools', icon: <School className="h-5 w-5" />, roles: ['admin', 'headmaster', 'teacher', 'deo'] },
    { name: 'Students', path: '/portal/students', icon: <GraduationCap className="h-5 w-5" />, roles: ['admin', 'headmaster', 'teacher', 'deo'] },
    { name: 'Risk Analysis', path: '/portal/risk-analysis', icon: <Brain className="h-5 w-5" />, roles: ['admin', 'headmaster', 'teacher', 'deo'] },
    { name: 'Explainable AI', path: '/portal/xai', icon: <Brain className="h-5 w-5" />, roles: ['admin', 'headmaster', 'teacher', 'deo'] },
    { name: 'Reports', path: '/portal/reports', icon: <FileText className="h-5 w-5" />, roles: ['admin', 'headmaster', 'teacher', 'deo'] },
    { name: 'Model Info', path: '/portal/model-info', icon: <Cpu className="h-5 w-5" />, roles: ['admin', 'headmaster', 'teacher', 'deo'] },
    { name: 'Users', path: '/portal/users', icon: <Users className="h-5 w-5" />, roles: ['admin', 'deo'] },
    { name: 'Activity Logs', path: '/portal/logs', icon: <History className="h-5 w-5" />, roles: ['admin'] },
  ];

  const visibleItems = navigationItems.filter(item => item.roles.includes(user?.role));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 border-r border-slate-900/60 p-5 w-64 shadow-2xl">
      {/* Brand Logo & Close Menu */}
      <div className="flex items-center justify-between px-1 py-4 mb-6 border-b border-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-650 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-650/20 flex items-center justify-center">
            <GraduationCap className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-md font-black tracking-wider text-white block">
              DROPGUARD
            </span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block -mt-1">
              Retention AI
            </span>
          </div>
        </div>
        
        {/* Close Button on Mobile view */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-450 hover:bg-slate-900 hover:text-white transition-colors"
          title="Close Navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow space-y-1.5 overflow-y-auto pr-1 select-none">
        {visibleItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all duration-205 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'text-slate-450 hover:bg-slate-900 hover:text-white hover:translate-x-1'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer Branding Label */}
      <div className="pt-4 border-t border-slate-900/80 text-center">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
          Version 1.0.0
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Position) */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-20">
        <SidebarContent />
      </div>

      {/* Mobile Overlay Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in" 
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar Drawer Panel */}
          <div className="relative flex flex-col h-full w-64 max-w-sm bg-slate-950 animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
