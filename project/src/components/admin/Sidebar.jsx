import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Users, Tag, Settings, LogOut, Store, ChefHat, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useState } from 'react';

const links = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/kitchen', icon: ChefHat, label: 'Kitchen' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const bottomTabs = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/kitchen', icon: ChefHat, label: 'Kitchen' },
  { to: '/admin/customers', icon: Users, label: 'Clients' },
  { to: '/admin/settings', icon: Settings, label: 'More' },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const { settings } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-orange-500 text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <Store size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-sm">{settings.shopName || 'Mahalaxmi'}</h2>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(link => (
          <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setMobileOpen(false)}>
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-md"
      >
        <Menu size={20} className="text-gray-700" />
      </button>

      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r border-gray-100 z-40">
        {sidebar}
      </aside>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg md:hidden animate-slideRight">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-2">
              <X size={20} className="text-gray-500" />
            </button>
            {sidebar}
          </aside>
        </>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex items-center justify-around px-1 py-1 safe-bottom">
        {bottomTabs.map(tab => {
          const isActive = location.pathname === tab.to;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all min-w-[56px] ${
                isActive ? 'text-orange-600' : 'text-gray-400'
              }`}
            >
              <tab.icon size={20} />
              <span className="text-[10px] font-medium mt-0.5">{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
