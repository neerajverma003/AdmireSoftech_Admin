import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  FileSpreadsheet,
  Briefcase,
  Layers,
  Users,
  Star,
  HelpCircle,
  Settings,
  LogOut,
  Laptop,
  X,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) {
  const { summaryCounts, settings } = useAdminData();
  const { user, logout } = useAuth();
  const location = useLocation();

  const isDesktopCollapsed = isCollapsed && !isMobileOpen;

  const navGroups = [
    {
      group: 'Core Overview',
      items: [
        {
          name: 'Dashboard',
          path: '/',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      group: 'Lead Pipeline',
      items: [
        {
          name: 'Contact Leads',
          path: '/inquiries',
          icon: Inbox,
          badge: summaryCounts.newInquiries > 0 ? `${summaryCounts.newInquiries} New` : null,
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
        },
        {
          name: 'Quick Quotes',
          path: '/quotes',
          icon: FileSpreadsheet,
          badge: summaryCounts.pendingQuotes > 0 ? `${summaryCounts.pendingQuotes}` : null,
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        },
      ],
    },
    {
      group: 'Recruitment & Talent',
      items: [
        {
          name: 'Careers & ATS',
          path: '/careers',
          icon: Briefcase,
          badge: summaryCounts.pendingApplicants > 0 ? `${summaryCounts.pendingApplicants} App` : null,
          badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
        },
        {
          name: 'Freelance Hub',
          path: '/freelance',
          icon: Laptop,
        },
      ],
    },
    {
      group: 'Content & Catalog',
      items: [
        {
          name: 'Services & Tech',
          path: '/services',
          icon: Layers,
        },
        {
          name: 'Team Directory',
          path: '/team',
          icon: Users,
        },
        {
          name: 'Client Reviews',
          path: '/testimonials',
          icon: Star,
          badge: summaryCounts.pendingReviews > 0 ? 'Pending' : null,
          badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
        },
        {
          name: 'FAQ Center',
          path: '/faqs',
          icon: HelpCircle,
        },
      ],
    },
    {
      group: 'Administration',
      items: [
        {
          name: 'Settings & Config',
          path: '/settings',
          icon: Settings,
        },
      ],
    },
  ];

  const handleLinkClick = () => {
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#040814]/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Aside (Locked to 100vh with flex column) */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen max-h-screen bg-[#070d1e] border-r border-slate-800/80 transition-all duration-300 flex flex-col ${
          // Mobile state
          isMobileOpen
            ? 'translate-x-0 w-72 shadow-2xl shadow-cyan-950/50'
            : '-translate-x-full lg:translate-x-0'
        } ${
          // Desktop state
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        {/* 1. Top Branding Area (Fixed Height, shrink-0) */}
        <div className="h-16 shrink-0 relative flex items-center justify-center px-4 border-b border-slate-800/80 w-full overflow-hidden">
          {/* Centered Logo */}
          <div className="w-full flex items-center justify-center">
            <Logo
              variant={isDesktopCollapsed ? 'icon' : 'full'}
              size={isDesktopCollapsed ? 'sm' : 'md'}
            />
          </div>

          {/* Mobile Close Button */}
          {isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 2. Navigation Group Items (Scrollable middle, flex-1 min-h-0) */}
        <div className="flex-1 min-h-0 py-3 px-3 space-y-5 overflow-y-auto custom-scrollbar">
          {navGroups.map((grp, idx) => (
            <div key={idx} className="space-y-1">
              {!isDesktopCollapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {grp.group}
                </div>
              )}
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    title={isDesktopCollapsed ? item.name : ''}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_-3px_rgba(0,242,254,0.15)] font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    } ${isDesktopCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        isActive ? 'text-cyan-400 scale-110' : 'text-slate-400 group-hover:text-cyan-300'
                      }`}
                    />

                    {!isDesktopCollapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}

                    {!isDesktopCollapsed && item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}

                    {isDesktopCollapsed && item.badge && (
                      <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* 3. Bottom Controls & User Area (Always Pinned & Visible, shrink-0) */}
        <div className="shrink-0 p-3 border-t border-slate-800/80 bg-[#060b18]/95 space-y-2">
          {/* User profile / Logout */}
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-900/90 border border-slate-800 ${
            isDesktopCollapsed ? 'justify-center' : ''
          }`}>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-cyan-500/40 shrink-0"
            />
            {!isDesktopCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-cyan-400 truncate">{user?.role || 'Super Admin'}</p>
              </div>
            )}
            {!isDesktopCollapsed && (
              <button
                onClick={logout}
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
