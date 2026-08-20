import React from 'react';
import { Activity, ShieldCheck, Zap, Server } from 'lucide-react';

export default function SystemPulseCard({ summary }) {
  return (
    <div className="surface-level-2 p-6 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-5 transition-colors duration-200">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30">
            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">SYSTEM PULSE TELEMETRY</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">Real-time autonomous engine operational health</p>
          </div>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-mono font-bold">
          98.7% CONFIDENCE
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 space-y-1">
          <span className="text-slate-500 dark:text-gray-400 text-[10px]">ACTIVE RECOVERY RUNS</span>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">{summary.activeCasesCount || 14}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 space-y-1">
          <span className="text-slate-500 dark:text-gray-400 text-[10px]">FATIGUE GUARD STATUS</span>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">ENGAGED</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-200 dark:border-gray-800/80 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-gray-400">
        <span>Payment Mode: <strong className="text-slate-800 dark:text-cyan-400 font-bold">Razorpay Simulation</strong></span>
        <span>Gateway Latency: <strong className="text-emerald-600 dark:text-emerald-400">42ms</strong></span>
      </div>
    </div>
  );
}
