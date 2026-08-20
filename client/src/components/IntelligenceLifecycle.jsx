import React from 'react';
import { Radar, Stethoscope, GitFork, Brain, ShieldCheck, Play, CheckCircle2, RefreshCw } from 'lucide-react';

const STAGES = [
  { id: 'DETECT', label: 'DETECT', icon: Radar, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' },
  { id: 'DIAGNOSE', label: 'DIAGNOSE', icon: Stethoscope, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  { id: 'SIMULATE', label: 'SIMULATE', icon: GitFork, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/30' },
  { id: 'DECIDE', label: 'DECIDE', icon: Brain, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' },
  { id: 'SAFEGUARD', label: 'SAFEGUARD', icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  { id: 'EXECUTE', label: 'EXECUTE', icon: Play, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  { id: 'VERIFY', label: 'VERIFY', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  { id: 'LEARN', label: 'LEARN', icon: RefreshCw, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/30' }
];

export default function IntelligenceLifecycle({ activeStage = 'SIMULATE' }) {
  return (
    <div className="surface-level-2 p-5 rounded-2xl border border-gray-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-widest text-gray-400 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span>Autonomous Revenue Recovery Lifecycle</span>
        </span>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
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
                  ? `${stage.bg} surface-level-3 shadow-lg scale-[1.03] z-10`
                  : 'bg-gray-900/40 border-gray-800/80 hover:bg-gray-800/40'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${stage.bg}`}>
                <Icon className={`w-4 h-4 ${stage.color} ${isActive ? 'animate-pulse' : ''}`} />
              </div>
              <span className={`text-[10px] font-bold tracking-wider font-mono ${isActive ? 'text-white' : 'text-gray-400'}`}>
                {stage.label}
              </span>

              {idx < STAGES.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 text-gray-700 font-mono text-[10px] z-0">
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
