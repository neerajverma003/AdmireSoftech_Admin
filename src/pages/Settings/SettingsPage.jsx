import React, { useState } from 'react';
import {
  Settings,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Server,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Shield,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function SettingsPage() {
  const { settings, updateSettings, stats, updateStats, resetToDefaults } = useAdminData();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [companyForm, setCompanyForm] = useState({ ...settings });
  const [statsForm, setStatsForm] = useState({ ...stats });

  const handleSaveCompanySettings = (e) => {
    e.preventDefault();
    updateSettings(companyForm);
    showToast({
      title: 'Settings Saved',
      message: 'Company configuration parameters updated.',
      type: 'success',
    });
  };

  const handleSaveStats = (e) => {
    e.preventDefault();
    updateStats(statsForm);
    showToast({
      title: 'Metrics Updated',
      message: 'Company global statistics saved.',
      type: 'success',
    });
  };

  const handleFullReset = () => {
    if (window.confirm('WARNING: This will reset all inquiries, quotes, jobs, and settings back to default factory seed data. Proceed?')) {
      resetToDefaults();
      showToast({
        title: 'Reset Complete',
        message: 'All local store records have been reset to factory seed values.',
        type: 'info',
      });
      setCompanyForm(settings);
      setStatsForm(stats);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100">Platform & Company Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure global metadata, backend API endpoints, enterprise stats, and system parameters
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Company Profile Form */}
          <form
            onSubmit={handleSaveCompanySettings}
            className="rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 p-6 space-y-5 shadow-xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100">Company Information</h3>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Company Name</label>
                  <input
                    type="text"
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Contact Email</label>
                  <input
                    type="email"
                    value={companyForm.contactEmail}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Contact Phone</label>
                  <input
                    type="text"
                    value={companyForm.contactPhone}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Headquarters Location</label>
                  <input
                    type="text"
                    value={companyForm.headquarters}
                    onChange={(e) => setCompanyForm({ ...companyForm, headquarters: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Tagline / Mission</label>
                <input
                  type="text"
                  value={companyForm.tagline}
                  onChange={(e) => setCompanyForm({ ...companyForm, tagline: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Live Frontend URL</label>
                  <input
                    type="text"
                    value={companyForm.frontendUrl}
                    onChange={(e) => setCompanyForm({ ...companyForm, frontendUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Node.js API Base URL</label>
                  <input
                    type="text"
                    value={companyForm.apiBaseUrl}
                    onChange={(e) => setCompanyForm({ ...companyForm, apiBaseUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </form>

          {/* 2. Global Company Stats */}
          <form
            onSubmit={handleSaveStats}
            className="rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 p-6 space-y-5 shadow-xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-slate-100">Global Website Statistics</h3>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 cursor-pointer transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Stats</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Total Delivered Projects</label>
                <input
                  type="text"
                  value={statsForm.totalProjects}
                  onChange={(e) => setStatsForm({ ...statsForm, totalProjects: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Uptime SLA %</label>
                <input
                  type="text"
                  value={statsForm.uptimeSLA}
                  onChange={(e) => setStatsForm({ ...statsForm, uptimeSLA: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Client Satisfaction CSAT</label>
                <input
                  type="text"
                  value={statsForm.clientSatisfaction}
                  onChange={(e) => setStatsForm({ ...statsForm, clientSatisfaction: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Admin Status & System Reset */}
        <div className="space-y-6">
          {/* Active Admin Session Card */}
          <div className="rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">Active Administrator</h3>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/50 shadow-md"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-100">{user?.name}</h4>
                <p className="text-[11px] text-cyan-400 font-semibold">{user?.role}</p>
                <p className="text-[10px] text-slate-500">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span>Access Level:</span>
                <span className="text-emerald-400 font-semibold">Full Read & Write</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Session Expiry:</span>
                <span className="text-slate-300">Persistent Local</span>
              </div>
            </div>
          </div>

          {/* Factory Reset & Danger Zone */}
          <div className="rounded-2xl bg-[#140b15]/90 border border-rose-500/20 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-sm font-bold">System Maintenance Zone</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Reset all local databases, candidate applications, inquiries, and custom edits back to factory defaults.
            </p>

            <button
              onClick={handleFullReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore Factory Seed Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
