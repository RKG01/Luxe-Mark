import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, FolderTree, FileText, ArrowLeft } from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: 'Overview Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'Manage Products',
      path: '/admin/products',
      icon: ShoppingBag,
    },
    {
      name: 'Manage Categories',
      path: '/admin/categories',
      icon: FolderTree,
    },
    {
      name: 'Manage Orders',
      path: '/admin/orders',
      icon: FileText,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col flex-shrink-0">
      {/* Admin Branding Header */}
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-sm font-black text-white uppercase tracking-wider">Management Console</h2>
        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Control Center</p>
      </div>

      {/* Menu Links */}
      <nav className="flex-grow p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                active
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Back to Client Store trigger */}
      <div className="p-4 border-t border-slate-800">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-xl text-slate-400 hover:bg-slate-850 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          Back to Storefront
        </Link>
      </div>
    </aside>
  );
};
