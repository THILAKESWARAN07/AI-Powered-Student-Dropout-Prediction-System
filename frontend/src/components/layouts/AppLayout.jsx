import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';


export default function AppLayout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-all duration-300">
      {/* Dynamic Portal Sidebar */}
      <Sidebar />

      {/* Main View Area */}
      <main className="flex-grow p-6 lg:p-10 overflow-y-auto w-full max-w-full">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
