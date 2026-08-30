import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Target,
  BarChart3,
  CalendarDays,
  ShieldCheck,
  LogOut,
  User,
  Settings,
  Flame,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 'chat' | 'goals' | 'dashboard' | 'weekly' | 'reflections';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenSecurity: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSecurity,
  onOpenSettings
}) => {
  const { user, logout, switchAccount } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'chat', label: 'Reflection Chat', icon: Sparkles },
    { id: 'goals', label: 'Action Plans & Goals', icon: Target },
    { id: 'dashboard', label: 'Growth Dashboard', icon: BarChart3 },
    { id: 'weekly', label: 'Weekly AI Review', icon: CalendarDays },
    { id: 'reflections', label: 'Journal Archive', icon: BookOpen }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Gemini Growth Journal
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  AI Copilot
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Reflect. Understand. Grow.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions & Account */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Security Verification Badge */}
            <button
              id="security-badge-btn"
              onClick={onOpenSecurity}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60 transition-colors"
              title="Verified Security & Threat Model"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Protected</span>
            </button>

            {/* Quick Multi-Tenant Switcher (for live isolation testing) */}
            <div className="relative">
              <button
                id="switch-tenant-btn"
                onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                title="Switch test profiles to verify data isolation"
              >
                <span>Test Identity</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showSwitchMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowSwitchMenu(false)}
                >
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Verify Isolated User Data
                  </div>
                  <button
                    onClick={() => switchAccount('demo-engineer')}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-white">Alex Chen (Eng Lead)</div>
                      <div className="text-[11px] text-slate-400">Pre-seeded technical goals</div>
                    </div>
                  </button>
                  <button
                    onClick={() => switchAccount('demo-manager')}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-700 flex items-center justify-between mt-1"
                  >
                    <div>
                      <div className="font-semibold text-white">Sarah Lin (Product Mgr)</div>
                      <div className="text-[11px] text-slate-400">Isolated separate journal</div>
                    </div>
                  </button>
                  <button
                    onClick={() => switchAccount('fresh-user')}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-700 flex items-center justify-between mt-1"
                  >
                    <div>
                      <div className="font-semibold text-white">Jordan Taylor (Fresh User)</div>
                      <div className="text-[11px] text-slate-400">Blank state for new demo</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1 pl-2 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden bg-teal-700 flex items-center justify-center text-xs font-bold text-white">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    user?.displayName?.charAt(0) || 'U'
                  )}
                </div>
                <span className="text-xs font-medium text-slate-200 max-w-[90px] truncate hidden sm:block">
                  {user?.displayName || 'User'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-700 mb-1">
                    <p className="text-xs font-semibold text-white truncate">{user?.displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <div className="mt-1 flex items-center text-[10px] text-teal-400 font-mono">
                      UID: {user?.uid.slice(0, 14)}...
                    </div>
                  </div>

                  <button
                    onClick={onOpenSettings}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-200 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Settings & Data Backup</span>
                  </button>

                  <button
                    onClick={onOpenSecurity}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-200 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Security Model</span>
                  </button>

                  <div className="my-1 border-t border-slate-700" />

                  <button
                    id="logout-btn"
                    onClick={logout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-300 rounded-lg hover:bg-rose-950/50 hover:text-rose-200 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center space-x-1 py-2 overflow-x-auto border-t border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
