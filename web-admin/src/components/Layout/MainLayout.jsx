import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <main className="lg:ml-64 ml-0 pt-16 min-h-screen transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
