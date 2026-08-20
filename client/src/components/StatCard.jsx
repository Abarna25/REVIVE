import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend }) {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-indigo-900/10 border-indigo-500/30 text-indigo-400',
    cyan: 'from-cyan-500/20 to-cyan-900/10 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-500/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-900/10 border-amber-500/30 text-amber-400',
    rose: 'from-rose-500/20 to-rose-900/10 border-rose-500/30 text-rose-400'
  };

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${colorMap[color] || colorMap.indigo} border backdrop-blur-md relative overflow-hidden transition duration-300 hover:scale-[1.01]`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-gray-900/50 border border-gray-800">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold font-heading text-white tracking-tight">{value}</span>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-gray-400 font-medium">{subtitle}</p>
      )}
    </div>
  );
}
