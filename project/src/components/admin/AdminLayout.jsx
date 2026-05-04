import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-6 pb-20 md:pb-6 overflow-auto flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        <footer className="mt-8 py-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            © 2026 Mahalaxmi Sweets & Farsan. All Rights Reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
