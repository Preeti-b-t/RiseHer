import React, { useState } from 'react';
import { Menu, Bell, Sparkles, User as UserIcon, LogOut, CheckCircle2, ChevronDown, ShieldCheck, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DemoSwitcher } from './DemoSwitcher';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileSidebar,
  onNavigate,
  currentView
}) => {
  const { user, profile, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  const notifications = [
    { id: 1, title: 'Mentor Session Confirmed', desc: 'Kavita Rao confirmed your meeting for Sat 11:00 AM', time: '1h ago', unread: true },
    { id: 2, title: 'SmartGov Recommendation', desc: 'PMEGP Subsidy match 99% - download DPR template', time: '3h ago', unread: true },
    { id: 3, title: 'Action Milestone Due', desc: 'Complete 15 customer validation interviews', time: '1d ago', unread: false }
  ];

  const viewTitles: Record<string, string> = {
    overview: 'Executive Dashboard',
    profile: user?.role === 'mentor' ? 'Mentor Profile' : (user?.role === 'admin' ? 'Administrator Profile' : 'Entrepreneur Profile'),
    analysis: 'AI Business Intelligence',
    risk: 'Business Risk Assessment',
    schemes: 'SmartGov Connect',
    mentors: 'Entrepreneur Connect & Mentors',
    'business-plan': 'Adaptive Business Plan',
    roadmap: 'Action Roadmap & Milestones',
    progress: 'Progress & Variance Tracker',
    learning: 'Learning & Resource Centre',
    sdg: 'SDG Impact Measurement',
    community: 'Community Forum',
    settings: 'Platform Settings',
    admin: 'Administrator Console',
    onboarding: 'Entrepreneur Onboarding Wizard'
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-plum/10 px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Hamburger + View title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-charcoal hover:bg-blush transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-charcoal font-heading flex items-center gap-2">
            <span>{viewTitles[currentView] || 'Overview'}</span>
            {profile && currentView === 'overview' && (
              <span className="hidden sm:inline-flex text-xs px-2.5 py-0.5 rounded-full bg-blush text-plum font-semibold">
                {profile.current_stage}
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Right side: Demo Persona Switcher + Notifications + Profile Avatar */}
      <div className="flex items-center gap-3">
        {/* Download Project ZIP */}
        <a
          href="/RiseHer_Complete_Project.zip"
          download="RiseHer_Complete_Project.zip"
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-plum/20 hover:border-plum text-xs font-semibold text-plum hover:bg-blush transition-colors"
          title="Download complete RiseHer project ZIP archive"
        >
          <Download size={13} className="text-coral" />
          <span>ZIP</span>
        </a>

        {/* Hackathon Judge Persona Switcher */}
        <DemoSwitcher />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full hover:bg-blush text-charcoal-muted hover:text-plum transition-colors relative"
            title="View notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral" />
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-plum/15 z-50 p-3 card-shadow animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-xs font-bold text-charcoal font-heading">Notifications</span>
                  <span className="text-[10px] text-empowerment-purple font-medium cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="divide-y divide-gray-100 mt-1 max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`py-2 px-1 text-xs ${n.unread ? 'bg-blush/30 rounded-lg p-2 my-1' : ''}`}>
                      <p className="font-semibold text-charcoal">{n.title}</p>
                      <p className="text-charcoal-muted text-[11px] mt-0.5">{n.desc}</p>
                      <span className="text-[10px] text-gray-400 mt-1 inline-block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User profile menu / avatar */}
        <div className="relative flex items-center gap-2 pl-2 border-l border-gray-200">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-blush/60 transition-all text-left"
            title="User Account Menu"
          >
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user?.full_name || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-plum/20"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=54245F&color=fff`;
              }}
            />
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-charcoal block leading-tight truncate max-w-[100px]">
                {user?.full_name?.split(' ')[0] || 'Account'}
              </span>
              <span className="text-[10px] text-charcoal-muted block leading-none capitalize">
                {user?.role || 'Entrepreneur'}
              </span>
            </div>
            <ChevronDown size={13} className="text-charcoal-muted hidden sm:block" />
          </button>

          {/* User Account Menu Dropdown */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-plum/15 z-50 p-3 card-shadow animate-in fade-in">
                <div className="pb-3 border-b border-plum/10">
                  <p className="text-sm font-bold text-charcoal truncate">{user?.full_name || 'Entrepreneur'}</p>
                  <p className="text-xs text-charcoal-muted truncate">{user?.email}</p>
                  {user?.phone && (
                    <p className="text-[11px] text-plum font-medium mt-0.5">+91 {user.phone}</p>
                  )}
                  {profile?.state && (
                    <span className="inline-block mt-1 text-[10px] bg-blush px-2 py-0.5 rounded-md text-plum font-semibold">
                      {profile.city || profile.district}, {profile.state}
                    </span>
                  )}
                </div>

                <div className="py-2 space-y-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate('profile');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-charcoal hover:bg-blush hover:text-plum transition-colors flex items-center gap-2"
                  >
                    <UserIcon size={14} />
                    <span>{user?.role === 'mentor' ? 'My Mentor Profile' : (user?.role === 'admin' ? 'Admin Profile' : 'My Entrepreneur Profile')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate('settings');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-charcoal hover:bg-blush hover:text-plum transition-colors flex items-center gap-2"
                  >
                    <ShieldCheck size={14} />
                    <span>Account & Security Settings</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-plum/10">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Quick Sign Out Button */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex p-1.5 rounded-lg text-charcoal-muted hover:text-coral hover:bg-coral/10 transition-colors"
            title="Sign out & return to login"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

