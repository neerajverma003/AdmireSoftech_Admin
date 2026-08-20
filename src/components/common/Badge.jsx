import React from 'react';

const STATUS_VARIANTS = {
  // Lead & Inquiry statuses
  'New': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  'In Discussion': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'Contacted': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Converted': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Closed': 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  'Archived': 'bg-slate-700/20 text-slate-400 border-slate-600/30',

  // Urgency / Priority
  'High': 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-medium',
  'Urgent': 'bg-rose-600/20 text-rose-300 border-rose-500/40 font-semibold animate-pulse',
  'Medium': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Low': 'bg-slate-500/10 text-slate-400 border-slate-500/30',

  // Job & ATS stages
  'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Paused': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Draft': 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  'Applied': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  'Under Review': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Shortlisted': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Interview Scheduled': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'Offer Extended': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 font-semibold',
  'Hired': 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold',
  'Rejected': 'bg-rose-500/10 text-rose-400 border-rose-500/30',

  // Quotes
  'Pending Review': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Estimate Sent': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Approved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Declined': 'bg-rose-500/10 text-rose-400 border-rose-500/30',

  // Service Badges
  'Popular': 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40',
  'Trending': 'bg-purple-500/15 text-purple-300 border-purple-400/40',
  'Core': 'bg-blue-500/15 text-blue-300 border-blue-400/40',
  'Enterprise': 'bg-rose-500/15 text-rose-300 border-rose-400/40',
  'Data-Driven': 'bg-teal-500/15 text-teal-300 border-teal-400/40',
  'Creative': 'bg-amber-500/15 text-amber-300 border-amber-400/40',

  // Default color themes
  'cyan': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  'blue': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'purple': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'emerald': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'amber': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'rose': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

export default function Badge({ label, variant, size = 'sm', dot = false, className = '' }) {
  const variantClass =
    STATUS_VARIANTS[variant] ||
    STATUS_VARIANTS[label] ||
    'bg-slate-700/30 text-slate-300 border-slate-600/30';

  const sizeClass = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  }[size] || 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide select-none ${variantClass} ${sizeClass} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      <span>{label}</span>
    </span>
  );
}
