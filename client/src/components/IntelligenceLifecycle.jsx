import React from 'react';
import { Radar, Stethoscope, GitFork, Brain, ShieldCheck, Play, CheckCircle2, RefreshCw } from 'lucide-react';

const STAGES = [
  { id: 'DETECT', label: 'DETECT', icon: Radar, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-500/30' },
  { id: 'DIAGNOSE', label: 'DIAGNOSE', icon: Stethoscope, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-500/30' },
  { id: 'SIMULATE', label: 'SIMULATE', icon: GitFork, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30 border-violet-300 dark:border-violet-500/40' },
  { id: 'DECIDE', label: 'DECIDE', icon: Brain, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-500/30' },
  { id: 'SAFEGUARD', label: 'SAFEGUARD', icon: ShieldCheck, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/30' },
  { id: 'EXECUTE', label: 'EXECUTE', icon: Play, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-500/30' },
  { id: 'VERIFY', label: 'VERIFY', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/30' },
  { id: 'LEARN', label: 'LEARN', icon: RefreshCw, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-500/30' }
];

export default function IntelligenceLifecycle({ activeStage = 'SIMULATE' }) {
  return (
    <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-3 shadow-sm dark:shadow-none transition-colors duration-200">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 dark:text-gray-400 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span>Autonomous Revenue Recovery Lifecycle</span>
        </span>
        <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-500/30 font-semibold">
          SIGNATURE FLOW ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 relative">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = stage.id === activeStage;

          return (
            <div
              key={stage.id}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition duration-300 relative ${
                isActive
                  ? `${stage.bg} shadow-md scale-[1.03] z-10 font-bold border-2`
                  : 'bg-slate-50 dark:bg-gray-900/60 border-slate-200 dark:border-gray-800/80 hover:bg-slate-100 dark:hover:bg-gray-800/40'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${stage.bg}`}>
                <Icon className={`w-4 h-4 ${stage.color} ${isActive ? 'animate-pulse' : ''}`} />
              </div>
              <span className={`text-[10px] tracking-wider font-mono ${isActive ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-gray-400 font-semibold'}`}>
                {stage.label}
              </span>

              {idx < STAGES.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-700 font-mono text-[10px] z-0">
                  →
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
