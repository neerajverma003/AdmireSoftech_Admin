import React, { useState } from 'react';
import {
  Bell,
  Search,
  ChevronDown,
  Shield,
  LogOut,
  RefreshCw,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Logo from '../common/Logo';
import NotificationDrawer from './NotificationDrawer';

export default function Header({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) {
  const { summaryCounts, resetToDefaults } = useAdminData();
  const { user, logout, switchAccount, demoAccounts } = useAuth();
  const { showToast } = useToast();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  const totalNotifications =
    summaryCounts.newInquiries + summaryCounts.pendingQuotes + summaryCounts.pendingApplicants;

  const handleResetData = () => {
    if (window.confirm('Reset all admin modifications and reload seed data?')) {
      resetToDefaults();
      showToast({
        title: 'Data Reset',
        message: 'Admin store has been restored to factory seed data.',
        type: 'info',
      });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-[#070d1e]/90 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Mobile Hamburger & Logo + Search Input */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          {/* Hamburger button for mobile */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-cyan-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Official Logo on Mobile (Compact & Clean) */}
          <div className="lg:hidden shrink-0 max-w-[130px]">
            <Logo variant="full" size="sm" />
          </div>

          {/* Search bar (Visible on md+ screens to preserve mobile header space) */}
          <div className="hidden md:block relative w-full max-w-xs sm:max-w-sm md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads, jobs, quotes..."
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs rounded-xl bg-[#0b1329] border border-slate-700/60 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all"
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Reset Demo Data Button (Desktop XL) */}
          <button
            onClick={handleResetData}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Reset store to initial mock dataset"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          {/* Quick Role Switcher Pill (Tablet & Desktop) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 transition-all cursor-pointer"
              title="Switch demo admin role"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>{user?.role || 'Super Admin'}</span>
              <ChevronDown className="w-3 h-3 text-cyan-400" />
            </button>

            {isRoleSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#091024] border border-cyan-500/30 shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                  Switch Active Role
                </div>
                <div className="py-1 space-y-1">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => {
                        switchAccount(acc);
                        setIsRoleSwitcherOpen(false);
                        showToast({
                          title: 'Role Switched',
                          message: `Logged in as ${acc.name} (${acc.role})`,
                          type: 'success',
                        });
                      }}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        user?.email === acc.email
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-6 h-6 rounded-full object-cover border border-cyan-500/40"
                      />
                      <div className="truncate flex-1">
                        <div className="font-semibold text-slate-200">{acc.name}</div>
                        <div className="text-[10px] text-slate-400">{acc.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Live Notification Bell */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 sm:p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            title="Open Notifications"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-extrabold text-slate-950 animate-subtle-pulse">
                {totalNotifications}
              </span>
            )}
          </button>

          {/* Profile Dropdown (With Mobile Role Switcher) */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt="Avatar"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-cyan-500/50 shadow-md shadow-cyan-500/20"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#091024] border border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-bold text-slate-200">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {user?.role}
                  </span>
                </div>

                {/* Mobile Quick Role Switcher Inside Dropdown */}
                <div className="md:hidden py-2 border-b border-slate-800">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Switch Role
                  </div>
                  <div className="space-y-1">
                    {demoAccounts.map((acc) => (
                      <button
                        key={acc.email}
                        onClick={() => {
                          switchAccount(acc);
                          setIsProfileDropdownOpen(false);
                          showToast({
                            title: 'Role Switched',
                            message: `Logged in as ${acc.name} (${acc.role})`,
                            type: 'success',
                          });
                        }}
                        className={`w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          user?.email === acc.email
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="truncate">{acc.name} ({acc.role})</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      handleResetData();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Demo Data</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-out Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
}
