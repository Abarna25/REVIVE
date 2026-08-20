import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend, level = 2 }) {
  const colorMap = {
    indigo: 'from-indigo-900/40 via-indigo-950/20 to-gray-900 border-indigo-500/30 text-indigo-400',
    cyan: 'from-cyan-900/40 via-cyan-950/20 to-gray-900 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-900/40 via-emerald-950/20 to-gray-900 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-900/40 via-amber-950/20 to-gray-900 border-amber-500/30 text-amber-400',
    rose: 'from-rose-900/40 via-rose-950/20 to-gray-900 border-rose-500/30 text-rose-400'
  };

  const surfaceClass = level === 3 ? 'surface-level-3 glow-indigo' : 'surface-level-2';

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${colorMap[color] || colorMap.indigo} border ${surfaceClass} backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:scale-[1.015]`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-widest">{title}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-gray-900/80 border border-gray-800">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl lg:text-3xl font-extrabold font-heading text-white tracking-tight">{value}</span>
        {trend && (
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-gray-400 font-medium">{subtitle}</p>
      )}
    </div>
  );
}
