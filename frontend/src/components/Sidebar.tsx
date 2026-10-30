import React from 'react';
import {
  LayoutDashboard,
  User as UserIcon,
  Sparkles,
  AlertTriangle,
  Landmark,
  Users,
  FileText,
  Milestone,
  TrendingUp,
  BookOpen,
  Target,
  Settings,
  MessageSquare,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile
}) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'profile',
      label: user?.role === 'mentor' ? 'My Mentor Profile' : (user?.role === 'admin' ? 'Admin Profile' : 'My Entrepreneur Profile'),
      icon: UserIcon
    },
    { id: 'analysis', label: 'AI Business Analysis', icon: Sparkles, badge: 'AI' },
    { id: 'risk', label: 'Business Risk Assessment', icon: AlertTriangle },
    { id: 'schemes', label: 'SmartGov Connect', icon: Landmark, count: '7' },
    { id: 'mentors', label: 'Entrepreneur Connect', icon: Users },
    { id: 'business-plan', label: 'Business Plan', icon: FileText },
    { id: 'roadmap', label: 'My Roadmap', icon: Milestone },
    { id: 'progress', label: 'Progress Tracker', icon: TrendingUp },
    { id: 'learning', label: 'Learning & Resources', icon: BookOpen },
    { id: 'sdg', label: 'SDG Impact', icon: Target },
    { id: 'community', label: 'Community Forum', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (user?.role === 'admin') {
    navItems.splice(1, 0, { id: 'admin', label: 'Admin Console', icon: ShieldCheck, badge: 'Admin' });
  }

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-screen w-72 bg-plum text-white flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-coral to-empowerment-purple flex items-center justify-center shadow-lg">
              <span className="text-xl font-extrabold text-white font-heading">R</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight font-heading text-white">RiseHer</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-coral text-white px-1.5 py-0.2 rounded-full">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-white/70">Intelligence & Guidance</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-empowerment-purple text-white shadow-md font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon size={18} className={isActive ? 'text-coral' : 'text-white/70'} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-coral text-white">
                    {item.badge}
                  </span>
                )}
                {item.count && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User footer badge */}
        <div className="p-4 border-t border-white/10 bg-plum-dark/60">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user?.full_name || 'User'}
              className="w-10 h-10 rounded-full object-cover border-2 border-coral/60 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=E88979&color=fff`;
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.full_name || 'Guest User'}</p>
              <p className="text-xs text-white/60 capitalize truncate">
                {user?.role === 'entrepreneur' ? 'Founder' : user?.role || 'User'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
