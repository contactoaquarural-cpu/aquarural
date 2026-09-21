import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const COLLAPSE_KEY = 'aquarural-sidebar-collapsed';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Colapso del Sidebar en desktop (franja de solo-iconos), independiente del
  // toggle móvil (que abre/cierra el drawer completo). Se recuerda entre
  // sesiones para no tener que colapsarlo cada vez que se recarga.
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === 'true');

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-body">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />
      <TopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} collapsed={collapsed} />
      <main className={`${collapsed ? 'lg:ml-20' : 'lg:ml-64'} ml-0 pt-16 min-h-screen transition-all duration-300`}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
