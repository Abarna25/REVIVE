import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend }) {
  const iconBgMap = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400'
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 shadow-sm dark:shadow-none relative overflow-hidden transition-all duration-200 hover:scale-[1.015]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold font-mono text-slate-400 dark:text-gray-400 uppercase tracking-widest">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${iconBgMap[color] || iconBgMap.indigo}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl lg:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">{value}</span>
        {trend && (
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-gray-400 font-medium">{subtitle}</p>
      )}
    </div>
  );
}
