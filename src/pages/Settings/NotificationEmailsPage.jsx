import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Mail,
  FileSpreadsheet,
  Laptop,
  Briefcase,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  Users,
  Layers,
  Radio,
  RefreshCw,
  Search,
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { useToast } from '../../context/ToastContext';

const MODULE_DEFINITIONS = [
  {
    key: 'UNIVERSAL_NOTIFICATION',
    name: 'Universal Notification',
    description: 'Global receiver: automatically receives notifications from all modules.',
    icon: Globe,
    color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
    badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-700/50',
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
  {
    key: 'CONTACT',
    name: 'Contact Form',
    description: 'Contact us form submissions and general inquiries.',
    icon: Mail,
    color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
    badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50',
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
  {
    key: 'QUICK_NOTES',
    name: 'Quick Notes & Quotes',
    description: 'Quick notes and custom engineering quote requests.',
    icon: FileSpreadsheet,
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/50',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  {
    key: 'FREELANCE',
    name: 'Freelance Applications',
    description: 'Freelance gig contractor proposals and bids.',
    icon: Laptop,
    color: 'from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30',
    badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50',
    iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  },
  {
    key: 'JOB',
    name: 'Job Applications',
    description: 'Careers and ATS candidate job applications.',
    icon: Briefcase,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
];

export default function NotificationEmailsPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [recipients, setRecipients] = useState([]);
  const [stats, setStats] = useState({
    totalRecipients: 0,
    activeCount: 0,
    totalModules: MODULE_DEFINITIONS.length,
  });

  // Accordion state: default open Universal Notification
  const [expandedModules, setExpandedModules] = useState({
    UNIVERSAL_NOTIFICATION: true,
  });

  // Form input state per module
  const [formInputs, setFormInputs] = useState({});
  const [submittingModule, setSubmittingModule] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchRecipients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/notifications/recipients');
      if (res && res.recipients) {
        setRecipients(res.recipients);
        setStats({
          totalRecipients: res.totalRecipients ?? res.recipients.length,
          activeCount: res.activeCount ?? res.recipients.filter((r) => r.isActive).length,
          totalModules: res.totalModules ?? MODULE_DEFINITIONS.length,
        });
      }
    } catch (error) {
      console.error('Error fetching notification recipients:', error);
      showToast({
        title: 'Network Error',
        message: 'Could not load notification recipients from the backend.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  const toggleAccordion = (moduleKey) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleKey]: !prev[moduleKey],
    }));
  };

  const handleInputChange = (moduleKey, field, value) => {
    setFormInputs((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [field]: value,
      },
    }));
  };

  const handleAddRecipient = async (e, moduleKey) => {
    e.preventDefault();
    const input = formInputs[moduleKey] || {};
    const email = input.email?.trim();
    const name = input.name?.trim() || '';

    if (!email) {
      showToast({
        title: 'Validation Error',
        message: 'Email address is required.',
        type: 'warning',
      });
      return;
    }

    try {
      setSubmittingModule(moduleKey);
      const res = await apiRequest('/notifications/recipients', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          module: moduleKey,
        }),
      });

      if (res && res.recipient) {
        showToast({
          title: 'Recipient Added',
          message: `Added ${email} to ${moduleKey.replace(/_/g, ' ')}.`,
          type: 'success',
        });

        // Clear input form
        setFormInputs((prev) => ({
          ...prev,
          [moduleKey]: { name: '', email: '' },
        }));

        // Refresh list
        fetchRecipients();
      }
    } catch (error) {
      console.error('Error adding recipient:', error);
      showToast({
        title: 'Addition Failed',
        message: error.message || 'Failed to add recipient.',
        type: 'error',
      });
    } finally {
      setSubmittingModule(null);
    }
  };

  const handleToggleStatus = async (recipient) => {
    const id = recipient._id || recipient.id;
    try {
      setTogglingId(id);
      const res = await apiRequest(`/notifications/recipients/${id}/toggle`, {
        method: 'PATCH',
      });

      if (res && res.recipient) {
        setRecipients((prev) =>
          prev.map((r) =>
            (r._id === id || r.id === id) ? { ...r, isActive: res.recipient.isActive } : r
          )
        );

        setStats((prev) => ({
          ...prev,
          activeCount: res.recipient.isActive
            ? prev.activeCount + 1
            : Math.max(0, prev.activeCount - 1),
        }));

        showToast({
          title: 'Status Updated',
          message: `${recipient.email} is now ${res.recipient.isActive ? 'Active' : 'Inactive'}.`,
          type: 'info',
        });
      }
    } catch (error) {
      console.error('Error toggling recipient status:', error);
      showToast({
        title: 'Update Failed',
        message: error.message || 'Failed to toggle status.',
        type: 'error',
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteRecipient = async (recipient) => {
    const id = recipient._id || recipient.id;
    const confirmDelete = window.confirm(
      `Are you sure you want to remove "${recipient.email}" from ${recipient.module}?`
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await apiRequest(`/notifications/recipients/${id}`, {
        method: 'DELETE',
      });

      setRecipients((prev) => prev.filter((r) => r._id !== id && r.id !== id));
      setStats((prev) => ({
        ...prev,
        totalRecipients: Math.max(0, prev.totalRecipients - 1),
        activeCount: recipient.isActive
          ? Math.max(0, prev.activeCount - 1)
          : prev.activeCount,
      }));

      showToast({
        title: 'Recipient Removed',
        message: `Removed ${recipient.email} from notification list.`,
        type: 'success',
      });
    } catch (error) {
      console.error('Error deleting recipient:', error);
      showToast({
        title: 'Delete Failed',
        message: error.message || 'Failed to remove recipient.',
        type: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-7 max-w-6xl pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <span>SUPER ADMIN</span>
            <span>&rsaquo;</span>
            <span className="text-cyan-400 font-bold">DASHBOARD</span>
            <span>&rsaquo;</span>
            <span className="text-slate-300">NOTIFICATION EMAILS</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Notification Emails</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure system notification dispatch rules, module-specific alerts, and universal email receivers.
          </p>
        </div>

        <button
          onClick={fetchRecipients}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-all cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Recipients */}
        <div className="relative overflow-hidden rounded-2xl bg-[#091126]/90 border border-slate-800/80 p-5 shadow-xl flex flex-col items-center justify-center text-center group hover:border-cyan-500/40 transition-all">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
          <span className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight font-mono">
            {stats.totalRecipients}
          </span>
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mt-1">
            TOTAL RECIPIENTS
          </span>
        </div>

        {/* Active Recipients */}
        <div className="relative overflow-hidden rounded-2xl bg-[#091126]/90 border border-slate-800/80 p-5 shadow-xl flex flex-col items-center justify-center text-center group hover:border-emerald-500/40 transition-all">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
          <div className="flex items-center gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight font-mono">
              {stats.activeCount}
            </span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-400/90 uppercase mt-1">
            ACTIVE
          </span>
        </div>

        {/* Modules */}
        <div className="relative overflow-hidden rounded-2xl bg-[#091126]/90 border border-slate-800/80 p-5 shadow-xl flex flex-col items-center justify-center text-center group hover:border-purple-500/40 transition-all">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all pointer-events-none" />
          <span className="text-3xl sm:text-4xl font-black text-purple-400 tracking-tight font-mono">
            {stats.totalModules}
          </span>
          <span className="text-[11px] font-bold tracking-wider text-purple-300/80 uppercase mt-1">
            MODULES
          </span>
        </div>
      </div>

      {/* Module Accordions */}
      <div className="space-y-4">
        {MODULE_DEFINITIONS.map((mod) => {
          const Icon = mod.icon;
          const isExpanded = !!expandedModules[mod.key];
          const moduleRecipients = recipients.filter((r) => r.module === mod.key);
          const activeModuleCount = moduleRecipients.filter((r) => r.isActive).length;
          const formState = formInputs[mod.key] || { name: '', email: '' };
          const isSubmitting = submittingModule === mod.key;

          return (
            <div
              key={mod.key}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xl ${
                isExpanded
                  ? 'bg-[#091126] border-slate-700/80 shadow-cyan-950/20'
                  : 'bg-[#080d1e]/90 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleAccordion(mod.key)}
                className="w-full flex items-center justify-between p-4 sm:p-5 cursor-pointer select-none transition-colors hover:bg-slate-800/20"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Icon Box */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${mod.iconBg}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Title & Description */}
                  <div className="min-w-0 text-left">
                    <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                      {mod.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                      {mod.description}
                    </p>
                  </div>
                </div>

                {/* Right Badge & Chevron */}
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="hidden xs:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/90 border border-slate-700/70 text-slate-300">
                    {moduleRecipients.length} {moduleRecipients.length === 1 ? 'recipient' : 'recipients'}{' '}
                    <span className="text-emerald-400 font-bold ml-1.5">
                      ({activeModuleCount} active)
                    </span>
                  </span>

                  <button
                    type="button"
                    className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Accordion Body */}
              {isExpanded && (
                <div className="border-t border-slate-800/90 p-4 sm:p-6 space-y-6 bg-[#060b19]/60">
                  {/* ADD RECIPIENT Form Section */}
                  <div className="rounded-xl bg-[#091124] border border-slate-800/90 p-4 sm:p-5 space-y-3">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      ADD RECIPIENT
                    </h4>

                    <form
                      onSubmit={(e) => handleAddRecipient(e, mod.key)}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3"
                    >
                      {/* Name input */}
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          placeholder="Name (optional)"
                          value={formState.name}
                          onChange={(e) =>
                            handleInputChange(mod.key, 'name', e.target.value)
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#070c1e] border border-slate-700/80 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        />
                      </div>

                      {/* Email input */}
                      <div className="sm:col-span-5">
                        <input
                          type="email"
                          required
                          placeholder="Email address *"
                          value={formState.email}
                          onChange={(e) =>
                            handleInputChange(mod.key, 'email', e.target.value)
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#070c1e] border border-slate-700/80 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        />
                      </div>

                      {/* Add Button */}
                      <div className="sm:col-span-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-full min-h-[38px] flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 font-black" />
                          )}
                          <span>ADD</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Recipient Table */}
                  {moduleRecipients.length === 0 ? (
                    <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/20">
                      <p className="text-xs text-slate-400 font-medium">
                        No notification recipients configured for this module yet.
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Use the form above to add designated alert receivers.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800/90 bg-[#070d1e]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-900/60">
                            <th className="py-3 px-4">NAME</th>
                            <th className="py-3 px-4">EMAIL</th>
                            <th className="py-3 px-4">MODULES</th>
                            <th className="py-3 px-4 text-center">ACTIVE</th>
                            <th className="py-3 px-4 text-right">REMOVE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {moduleRecipients.map((rec) => {
                            const recId = rec._id || rec.id;
                            const isToggling = togglingId === recId;
                            const isDeleting = deletingId === recId;
                            const initial = (rec.name || rec.email || 'U')
                              .charAt(0)
                              .toUpperCase();

                            return (
                              <tr
                                key={recId}
                                className="hover:bg-slate-800/30 transition-colors group"
                              >
                                {/* Name with Avatar */}
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
                                      {initial}
                                    </div>
                                    <span className="font-semibold text-slate-200">
                                      {rec.name || 'Unnamed Recipient'}
                                    </span>
                                  </div>
                                </td>

                                {/* Email */}
                                <td className="py-3 px-4 font-mono text-slate-300">
                                  <a
                                    href={`mailto:${rec.email}`}
                                    className="hover:text-cyan-400 transition-colors"
                                  >
                                    {rec.email}
                                  </a>
                                </td>

                                {/* Module Badge */}
                                <td className="py-3 px-4">
                                  <span
                                    className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase border ${mod.badgeColor}`}
                                  >
                                    {rec.module}
                                  </span>
                                </td>

                                {/* Active Toggle Switch */}
                                <td className="py-3 px-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatus(rec)}
                                    disabled={isToggling}
                                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                      rec.isActive
                                        ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                                        : 'bg-slate-700'
                                    } ${isToggling ? 'opacity-50' : ''}`}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        rec.isActive ? 'translate-x-5' : 'translate-x-0'
                                      }`}
                                    />
                                  </button>
                                </td>

                                {/* Remove Button */}
                                <td className="py-3 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRecipient(rec)}
                                    disabled={isDeleting}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                                    title="Remove recipient"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
