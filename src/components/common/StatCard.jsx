import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  accent = 'cyan', // cyan | blue | purple | emerald | amber
  onClick,
}) {
  const accentConfigs = {
    cyan: {
      borderHover: 'hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
      glow: 'group-hover:shadow-[0_0_25px_-5px_rgba(0,242,254,0.25)]',
      gradient: 'from-cyan-500/10 to-transparent',
    },
    blue: {
      borderHover: 'hover:border-blue-500/40',
      iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      glow: 'group-hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.25)]',
      gradient: 'from-blue-500/10 to-transparent',
    },
    purple: {
      borderHover: 'hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      glow: 'group-hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.25)]',
      gradient: 'from-purple-500/10 to-transparent',
    },
    emerald: {
      borderHover: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      glow: 'group-hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.25)]',
      gradient: 'from-emerald-500/10 to-transparent',
    },
    amber: {
      borderHover: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      glow: 'group-hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.25)]',
      gradient: 'from-amber-500/10 to-transparent',
    },
  };

  const currentAccent = accentConfigs[accent] || accentConfigs.cyan;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-[#0b1329]/80 border border-slate-800/80 p-5 transition-all duration-300 ${currentAccent.borderHover} ${currentAccent.glow} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Background soft ambient gradient */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${currentAccent.gradient} blur-2xl pointer-events-none opacity-60`}
      />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-100 tracking-tight">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl ${currentAccent.iconBg} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(change || subtitle) && (
        <div className="mt-4 flex items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
          {change && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
