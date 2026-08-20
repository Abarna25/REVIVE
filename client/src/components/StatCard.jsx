import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend, level = 2 }) {
  const darkColorMap = {
    indigo: 'from-indigo-900/30 via-indigo-950/10 to-gray-900 border-indigo-500/30 text-indigo-400',
    cyan: 'from-cyan-900/30 via-cyan-950/10 to-gray-900 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-900/30 via-emerald-950/10 to-gray-900 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-900/30 via-amber-950/10 to-gray-900 border-amber-500/30 text-amber-400',
    rose: 'from-rose-900/30 via-rose-950/10 to-gray-900 border-rose-500/30 text-rose-400'
  };

  const lightColorMap = {
    indigo: 'from-indigo-50 via-indigo-100/30 to-white border-indigo-200 text-indigo-700',
    cyan: 'from-cyan-50 via-cyan-100/30 to-white border-cyan-200 text-cyan-700',
    emerald: 'from-emerald-50 via-emerald-100/30 to-white border-emerald-200 text-emerald-700',
    amber: 'from-amber-50 via-amber-100/30 to-white border-amber-200 text-amber-700',
    rose: 'from-rose-50 via-rose-100/30 to-white border-rose-200 text-rose-700'
  };

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${lightColorMap[color] || lightColorMap.indigo} dark:${darkColorMap[color] || darkColorMap.indigo} border surface-level-2 backdrop-blur-md relative overflow-hidden transition-all duration-200 hover:scale-[1.015]`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold font-mono text-slate-500 dark:text-gray-400 uppercase tracking-widest">{title}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 shadow-sm">
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
