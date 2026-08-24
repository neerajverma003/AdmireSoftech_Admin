import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  Save,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Shield,
  ArrowRight,
  BellRing,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function SettingsPage() {
  const { settings, updateSettings, stats, updateStats, resetToDefaults } = useAdminData();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [companyForm, setCompanyForm] = useState({ ...settings });
  const [socialForm, setSocialForm] = useState({
    linkedin: settings?.socialLinks?.linkedin || '',
    twitter: settings?.socialLinks?.twitter || '',
    github: settings?.socialLinks?.github || '',
    youtube: settings?.socialLinks?.youtube || '',
    instagram: settings?.socialLinks?.instagram || '',
    facebook: settings?.socialLinks?.facebook || '',
  });
  const [statsForm, setStatsForm] = useState({
    totalProjects: stats?.totalProjects || settings?.stats?.totalProjects || '',
    globalEnterprises: stats?.globalEnterprises || settings?.stats?.globalEnterprises || '',
    uptimeSLA: stats?.uptimeSLA || settings?.stats?.uptimeSLA || '',
    clientSatisfaction: stats?.clientSatisfaction || settings?.stats?.clientSatisfaction || '',
    ...stats,
  });

  // Sync state when settings change from backend
  useEffect(() => {
    if (settings) {
      setCompanyForm((prev) => ({ ...prev, ...settings }));
      if (settings.socialLinks) {
        setSocialForm({
          linkedin: settings.socialLinks.linkedin || '',
          twitter: settings.socialLinks.twitter || '',
          github: settings.socialLinks.github || '',
          youtube: settings.socialLinks.youtube || '',
          instagram: settings.socialLinks.instagram || '',
          facebook: settings.socialLinks.facebook || '',
        });
      }
      if (settings.stats) {
        setStatsForm((prev) => ({
          ...prev,
          totalProjects: settings.stats.totalProjects || prev.totalProjects || '',
          globalEnterprises: settings.stats.globalEnterprises || prev.globalEnterprises || '',
          uptimeSLA: settings.stats.uptimeSLA || prev.uptimeSLA || '',
          clientSatisfaction: settings.stats.clientSatisfaction || prev.clientSatisfaction || '',
        }));
      }
    }
  }, [settings]);

  useEffect(() => {
    if (stats) {
      setStatsForm((prev) => ({
        ...prev,
        ...stats,
      }));
    }
  }, [stats]);

  const handleSaveCompanySettings = async (e) => {
    e.preventDefault();
    await updateSettings({
      ...companyForm,
      socialLinks: socialForm,
    });
    showToast({
      title: 'Company Settings Saved',
      message: 'Company configuration and contact details updated successfully.',
      type: 'success',
    });
  };

  const handleSaveSocialLinks = async (e) => {
    e.preventDefault();
    await updateSettings({
      socialLinks: socialForm,
    });
    showToast({
      title: 'Social Media Saved',
      message: 'Social channel URLs updated and synced to public website.',
      type: 'success',
    });
  };

  const handleSaveStats = async (e) => {
    e.preventDefault();
    await updateStats(statsForm);
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
          Configure global metadata, social media URLs, headquarters location, backend endpoints, and system parameters
        </p>
      </div>

      {/* Quick Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Admin Profile & Security Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-[#0b1329] border border-cyan-500/30 p-5 shadow-xl flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Administrator Profile & Security</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your administrator profile photo, login credentials, and OTP password recovery.
              </p>
            </div>
          </div>

          <Link
            to="/profile"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer w-full sm:w-auto self-start"
          >
            <span>Edit Profile & Security</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Notification Emails Quick Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#0b1329] border border-purple-500/30 p-5 shadow-xl flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Automated Notification Emails</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage module-specific alert receivers and universal notification email destinations.
              </p>
            </div>
          </div>

          <Link
            to="/settings/notifications"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition-all cursor-pointer w-full sm:w-auto self-start"
          >
            <span>Manage Email Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Company & Contact Information Form */}
          <form
            onSubmit={handleSaveCompanySettings}
            className="rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 p-6 space-y-5 shadow-xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100">Company & Contact Information</h3>
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
                  <label className="text-slate-300 font-semibold">Company Legal Name</label>
                  <input
                    type="text"
                    value={companyForm.companyName || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Official Website URL</label>
                  <input
                    type="url"
                    value={companyForm.websiteUrl || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, websiteUrl: e.target.value })}
                    placeholder="https://admiresoftech.com"
                    className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Public Contact Email</label>
                  <input
                    type="email"
                    value={companyForm.contactEmail || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                    placeholder="contact@admiresoftech.com"
                    className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Support / Helpdesk Email</label>
                  <input
                    type="email"
                    value={companyForm.supportEmail || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, supportEmail: e.target.value })}
                    placeholder="support@admiresoftech.com"
                    className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Contact Phone Number</label>
                  <input
                    type="text"
                    value={companyForm.contactPhone || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactPhone: e.target.value })}
                    placeholder="+91 (120) 456-7890"
                    className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">WhatsApp Business Number</label>
                  <input
                    type="text"
                    value={companyForm.whatsappNumber || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, whatsappNumber: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Headquarters Address / Location</label>
                  <input
                    type="text"
                    value={companyForm.headquarters || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, headquarters: e.target.value })}
                    placeholder="Sector 62, Noida, NCR, India"
                    className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Working Hours / SLA</label>
                  <input
                    type="text"
                    value={companyForm.workingHours || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, workingHours: e.target.value })}
                    placeholder="Mon - Fri: 9:00 AM - 6:00 PM IST"
                    className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Tagline / Mission</label>
                <input
                  type="text"
                  value={companyForm.tagline || ''}
                  onChange={(e) => setCompanyForm({ ...companyForm, tagline: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Live Frontend URL</label>
                  <input
                    type="text"
                    value={companyForm.frontendUrl || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, frontendUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Node.js API Base URL</label>
                  <input
                    type="text"
                    value={companyForm.apiBaseUrl || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, apiBaseUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </form>

          {/* 2. Dynamic Social Media Channels Form */}
          <form
            onSubmit={handleSaveSocialLinks}
            className="rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 p-6 space-y-5 shadow-xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Social Media & Community Channels</h3>
                  <p className="text-[11px] text-slate-400">These URLs dynamically power the public website footer and contact channels</p>
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Social Links</span>
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* LinkedIn */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                </div>
                <div className="flex-1">
                  <label className="text-slate-300 font-semibold block mb-0.5">LinkedIn Profile / Company Page</label>
                  <input
                    type="url"
                    value={socialForm.linkedin}
                    onChange={(e) => setSocialForm({ ...socialForm, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/company/admiresoftech"
                    className="w-full p-2 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                {socialForm.linkedin && (
                  <a href={socialForm.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors mt-4" title="Test link">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Twitter / X */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </div>
                <div className="flex-1">
                  <label className="text-slate-300 font-semibold block mb-0.5">X (Twitter) Handle / Page</label>
                  <input
                    type="url"
                    value={socialForm.twitter}
                    onChange={(e) => setSocialForm({ ...socialForm, twitter: e.target.value })}
                    placeholder="https://x.com/admiresoftech"
                    className="w-full p-2 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                {socialForm.twitter && (
                  <a href={socialForm.twitter} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors mt-4" title="Test link">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* GitHub */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
                </div>
                <div className="flex-1">
                  <label className="text-slate-300 font-semibold block mb-0.5">GitHub Organization</label>
                  <input
                    type="url"
                    value={socialForm.github}
                    onChange={(e) => setSocialForm({ ...socialForm, github: e.target.value })}
                    placeholder="https://github.com/admiresoftech"
                    className="w-full p-2 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                {socialForm.github && (
                  <a href={socialForm.github} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors mt-4" title="Test link">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* YouTube */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </div>
                <div className="flex-1">
                  <label className="text-slate-300 font-semibold block mb-0.5">YouTube Channel</label>
                  <input
                    type="url"
                    value={socialForm.youtube}
                    onChange={(e) => setSocialForm({ ...socialForm, youtube: e.target.value })}
                    placeholder="https://youtube.com/@admiresoftech"
                    className="w-full p-2 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                {socialForm.youtube && (
                  <a href={socialForm.youtube} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors mt-4" title="Test link">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Instagram */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-600/15 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </div>
                <div className="flex-1">
                  <label className="text-slate-300 font-semibold block mb-0.5">Instagram Profile</label>
                  <input
                    type="url"
                    value={socialForm.instagram}
                    onChange={(e) => setSocialForm({ ...socialForm, instagram: e.target.value })}
                    placeholder="https://instagram.com/admiresoftech"
                    className="w-full p-2 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                {socialForm.instagram && (
                  <a href={socialForm.instagram} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors mt-4" title="Test link">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Facebook */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-700/15 border border-blue-600/30 flex items-center justify-center text-blue-500 shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.7 5H18V0h-3.808C10.592 0 9 1.592 9 4.615V8z"/></svg>
                </div>
                <div className="flex-1">
                  <label className="text-slate-300 font-semibold block mb-0.5">Facebook Page (Optional)</label>
                  <input
                    type="url"
                    value={socialForm.facebook}
                    onChange={(e) => setSocialForm({ ...socialForm, facebook: e.target.value })}
                    placeholder="https://facebook.com/admiresoftech"
                    className="w-full p-2 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                {socialForm.facebook && (
                  <a href={socialForm.facebook} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors mt-4" title="Test link">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Total Delivered Projects</label>
                <input
                  type="text"
                  value={statsForm.totalProjects || ''}
                  onChange={(e) => setStatsForm({ ...statsForm, totalProjects: e.target.value })}
                  placeholder="e.g. 500+"
                  className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Global Enterprises</label>
                <input
                  type="text"
                  value={statsForm.globalEnterprises || ''}
                  onChange={(e) => setStatsForm({ ...statsForm, globalEnterprises: e.target.value })}
                  placeholder="e.g. 45+"
                  className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Client Satisfaction CSAT</label>
                <input
                  type="text"
                  value={statsForm.clientSatisfaction || ''}
                  onChange={(e) => setStatsForm({ ...statsForm, clientSatisfaction: e.target.value })}
                  placeholder="e.g. 98%"
                  className="w-full p-2.5 rounded-xl bg-[#070c1e] border border-slate-700 text-slate-200 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Uptime SLA %</label>
                <input
                  type="text"
                  value={statsForm.uptimeSLA || ''}
                  onChange={(e) => setStatsForm({ ...statsForm, uptimeSLA: e.target.value })}
                  placeholder="e.g. 99.9%"
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
