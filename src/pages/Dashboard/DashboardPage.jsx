import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  FileSpreadsheet,
  Briefcase,
  Users,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Server,
  Activity,
  Layers,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';

export default function DashboardPage() {
  const { inquiries, quotes, jobs, applicants, services, team, stats } = useAdminData();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Metrics calculation
  const newInquiries = inquiries.filter((i) => i.status === 'New').length;
  const convertedInquiries = inquiries.filter((i) => i.status === 'Converted').length;
  const activeJobs = jobs.filter((j) => j.status === 'Active').length;
  const pendingApplicants = applicants.filter((a) => a.stage !== 'Hired' && a.stage !== 'Rejected').length;

  const recentInquiries = inquiries.slice(0, 5);
  const recentQuotes = quotes.slice(0, 4);

  // Group inquiries by service
  const serviceDistribution = [
    { name: 'Cloud & DevOps', count: inquiries.filter((i) => i.service?.toLowerCase().includes('cloud')).length, color: 'bg-cyan-400' },
    { name: 'AI & Machine Learning', count: inquiries.filter((i) => i.service?.toLowerCase().includes('artificial') || i.service?.toLowerCase().includes('ai')).length, color: 'bg-purple-400' },
    { name: 'Full-Stack Web/Mobile', count: inquiries.filter((i) => i.service?.toLowerCase().includes('full-stack') || i.service?.toLowerCase().includes('web') || i.service?.toLowerCase().includes('mobile')).length, color: 'bg-blue-400' },
    { name: 'Cybersecurity & Compliance', count: inquiries.filter((i) => i.service?.toLowerCase().includes('cybersecurity')).length, color: 'bg-rose-400' },
    { name: 'Data Engineering & BI', count: inquiries.filter((i) => i.service?.toLowerCase().includes('data')).length, color: 'bg-teal-400' },
  ];

  const totalServiceInquiries = serviceDistribution.reduce((acc, s) => acc + s.count, 0) || 1;

  return (
    <div className="space-y-8">
      {/* Welcome Banner with Cyber Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0c183a] via-[#0d1f4d] to-[#0a122c] border border-cyan-500/20 p-6 sm:p-8 shadow-2xl shadow-cyan-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/15 via-blue-500/10 to-transparent blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Admire Softech Enterprise Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Welcome back, <span className="gradient-text-cyan">{user?.name || 'Administrator'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              You have <span className="text-cyan-400 font-semibold">{newInquiries} unread leads</span> and{' '}
              <span className="text-purple-400 font-semibold">{pendingApplicants} candidate applications</span> waiting for review.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/inquiries')}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center gap-2"
            >
              <Inbox className="w-4 h-4" />
              <span>Review Inquiries</span>
            </button>
            <button
              onClick={() => navigate('/careers')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>Manage ATS Jobs</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total CRM Inquiries"
          value={inquiries.length}
          change={`${newInquiries} new`}
          isPositive={true}
          subtitle={`${newInquiries} pending review`}
          icon={Inbox}
          accent="cyan"
          onClick={() => navigate('/inquiries')}
        />
        <StatCard
          title="Quotes Estimated"
          value={quotes.length}
          change={`${quotes.filter((q) => q.status === 'Pending Review').length} pending`}
          isPositive={true}
          subtitle={`${quotes.length} total quotes submitted`}
          icon={FileSpreadsheet}
          accent="amber"
          onClick={() => navigate('/quotes')}
        />
        <StatCard
          title="Active Openings & ATS"
          value={`${activeJobs} Jobs / ${applicants.length} Apps`}
          change={`${activeJobs} active`}
          isPositive={true}
          subtitle={`${pendingApplicants} active in pipeline`}
          icon={Briefcase}
          accent="purple"
          onClick={() => navigate('/careers')}
        />
        <StatCard
          title="Engineers & CSAT"
          value={`${team.length} Staff / ${stats.clientSatisfaction || '98%'}`}
          change={stats.uptimeSLA || '99.9%'}
          isPositive={true}
          subtitle="SLA Availability"
          icon={Users}
          accent="emerald"
          onClick={() => navigate('/team')}
        />
      </div>

      {/* 2-Column Analytics & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Inquiries by Service Distribution & Conversion */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Client Demand by Practice Area
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time breakdown of project requests across services
                </p>
              </div>
              <button
                onClick={() => navigate('/services')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Services Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {serviceDistribution.map((item) => {
                const percentage = Math.round((item.count / totalServiceInquiries) * 100);
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">{item.name}</span>
                      <span className="text-slate-400 font-semibold">{percentage}% ({item.count} leads)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Inquiries Table */}
          <div className="rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-cyan-400" />
                  Latest Contact Inquiries
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Direct leads captured via Contact Modal</p>
              </div>
              <button
                onClick={() => navigate('/inquiries')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View All Inquiries</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="pb-2.5">Client</th>
                    <th className="pb-2.5">Service Requested</th>
                    <th className="pb-2.5">Budget</th>
                    <th className="pb-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentInquiries.map((inq) => (
                    <tr
                      key={inq.id}
                      onClick={() => navigate('/inquiries')}
                      className="hover:bg-cyan-500/[0.04] cursor-pointer transition-colors"
                    >
                      <td className="py-3">
                        <div className="font-semibold text-slate-200">{inq.fullName}</div>
                        <div className="text-[11px] text-slate-500">{inq.company || inq.email}</div>
                      </td>
                      <td className="py-3 text-slate-300 max-w-[180px] truncate">{inq.service}</td>
                      <td className="py-3 font-medium text-cyan-400">{inq.budget}</td>
                      <td className="py-3">
                        <Badge label={inq.status} size="xs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Quotes & Infrastructure Health */}
        <div className="space-y-6">
          {/* Quick Quotes Stream */}
          <div className="rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  Recent Quick Quotes
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Project budget calculators</p>
              </div>
              <button
                onClick={() => navigate('/quotes')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>All Quotes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentQuotes.map((qt) => (
                <div
                  key={qt.id}
                  onClick={() => navigate('/quotes')}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{qt.name}</span>
                    <span className="text-xs font-bold text-amber-400">{qt.estimatedBudget}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{qt.serviceType}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <Badge label={qt.status} size="xs" />
                    <span>{qt.timeline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System & Architecture Health */}
          <div className="rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              Platform Telemetry
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Main Frontend Website</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Running on :5173
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Backend API Sync</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-cyan-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  LocalStorage Ready
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">SLA Availability</span>
                <span className="font-semibold text-slate-200">{stats.uptimeSLA || '99.9%'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
