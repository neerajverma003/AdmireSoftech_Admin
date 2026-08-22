import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Search,
  ChevronDown,
  Shield,
  LogOut,
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
  const { summaryCounts } = useAdminData();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const profileDropdownRef = useRef(null);

  const totalNotifications =
    summaryCounts.newInquiries + summaryCounts.pendingQuotes + summaryCounts.pendingApplicants;

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsProfileDropdownOpen(false);
    showToast({ title: 'Signed Out', message: 'You have been logged out of the Admin panel.', type: 'info' });
    await logout();
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
            title="Toggle Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Desktop Sidebar Toggle Pin */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Logo on mobile view */}
          <div className="lg:hidden shrink-0">
            <Logo compact={true} />
          </div>

          {/* Global Search Bar (Tablet / Desktop) */}
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
          {/* Active Role Badge Pill (Tablet & Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-sm">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="capitalize">{user?.role || 'Admin'}</span>
          </div>

          {/* Notifications Trigger */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            title="View Notifications"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-[9px] font-bold text-slate-950 shadow-sm animate-pulse">
                {totalNotifications}
              </span>
            )}
          </button>

          {/* User Profile Dropdown Trigger */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 pl-1.5 sm:pl-2 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-cyan-500/40 transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-xs shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:block text-left pr-1">
                <p className="text-xs font-semibold text-slate-200 leading-tight">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[140px]">
                  {user?.email || 'admin@admiresoftech.com'}
                </p>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isProfileDropdownOpen ? 'rotate-180 text-cyan-400' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#091024] border border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2.5 border-b border-slate-800/80">
                  <p className="text-xs font-bold text-slate-100">{user?.name || 'Administrator'}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 font-mono capitalize">
                      {user?.role || 'Admin'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-1.5">{user?.email || 'admin@admiresoftech.com'}</p>
                </div>

                <div className="pt-1.5 pb-0.5">
                  <button
                    onClick={handleSignOut}
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
