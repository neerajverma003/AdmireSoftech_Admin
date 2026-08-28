import React from 'react';
import { X, Mail, FileText, Briefcase, ChevronRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminData } from '../../context/AdminDataContext';
import Badge from '../common/Badge';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { inquiries, quotes, applicants } = useAdminData();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const newInquiries = inquiries.filter((i) => i.status === 'New').slice(0, 4);
  const pendingQuotes = quotes.filter((q) => q.status === 'Pending Review').slice(0, 3);
  const pendingApplicants = applicants.filter((a) => a.stage === 'Under Review' || a.stage === 'Applied').slice(0, 3);

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#040814]/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#080e22] border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0a122c]">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <h3 className="text-sm font-bold text-slate-100">Live Notification Center</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Content */}
          <div data-lenis-prevent className="flex-1 overflow-y-auto p-4 space-y-6 sidebar-calm-scroll">
            {/* 1. New Inquiries Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Mail className="w-3.5 h-3.5" /> Recent Inquiries ({newInquiries.length})
                </span>
                <button
                  onClick={() => handleNavigate('/inquiries')}
                  className="text-slate-400 hover:text-cyan-300 text-[11px] cursor-pointer"
                >
                  View All
                </button>
              </div>

              {newInquiries.length > 0 ? (
                newInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    onClick={() => handleNavigate('/inquiries')}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 hover:bg-slate-900 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{inq.fullName}</span>
                      <Badge label={inq.priority} size="xs" />
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{inq.message}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>{inq.company || inq.service}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No new inquiries at this moment.</p>
              )}
            </div>

            {/* 2. Pending Quotes Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <FileText className="w-3.5 h-3.5" /> Quote Requests ({pendingQuotes.length})
                </span>
                <button
                  onClick={() => handleNavigate('/quotes')}
                  className="text-slate-400 hover:text-amber-300 text-[11px] cursor-pointer"
                >
                  View All
                </button>
              </div>

              {pendingQuotes.length > 0 ? (
                pendingQuotes.map((qt) => (
                  <div
                    key={qt.id}
                    onClick={() => handleNavigate('/quotes')}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/30 hover:bg-slate-900 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{qt.name}</span>
                      <span className="text-[10px] font-bold text-amber-400">{qt.estimatedBudget}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{qt.serviceType}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No pending quote reviews.</p>
              )}
            </div>

            {/* 3. New Applicants Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <Briefcase className="w-3.5 h-3.5" /> Pending Applicants ({pendingApplicants.length})
                </span>
                <button
                  onClick={() => handleNavigate('/careers')}
                  className="text-slate-400 hover:text-purple-300 text-[11px] cursor-pointer"
                >
                  View ATS
                </button>
              </div>

              {pendingApplicants.length > 0 ? (
                pendingApplicants.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => handleNavigate('/careers')}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/30 hover:bg-slate-900 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{app.fullName}</span>
                      <Badge label={app.stage} size="xs" />
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{app.jobTitle}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No pending candidate reviews.</p>
              )}
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-800 bg-[#0a122c] flex items-center justify-between">
            <span className="text-xs text-slate-500">Auto-synchronized in real-time</span>
            <button
              onClick={onClose}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
