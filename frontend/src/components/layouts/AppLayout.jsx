import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-all duration-300">
      {/* Dynamic Portal Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main View Area */}
      <div className="flex-grow flex flex-col h-full min-w-0 overflow-hidden lg:pl-64">
        {/* Sticky top header */}
        <Header setMobileOpen={setMobileOpen} />

        {/* Independent scrollable body */}
        <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
