import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Target,
  Calendar,
  Dumbbell,
  Map,
  User,
  LogOut,
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: Home },
    { name: 'Objectifs', href: '/goals', icon: Target },
    { name: 'Plans d\'entraînement', href: '/training-plans', icon: Calendar },
    { name: 'Séances', href: '/workouts', icon: Dumbbell },
    { name: 'Itinéraires', href: '/routes', icon: Map },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RunAI</h1>
            <p className="text-sm text-gray-600 mt-1">Entraînement intelligent</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg shadow-blue-500/20'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/profile"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2 ${
                isActive('/profile')
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <User size={20} />
              <div className="flex-1">
                <div className="font-medium">{user?.full_name || user?.email}</div>
                <div className="text-xs text-gray-500">Profil</div>
              </div>
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full transition-colors"
            >
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
