import React from 'react';
import { Cpu, ShieldCheck, Activity, CheckCircle2 } from 'lucide-react';

export default function SystemPulseCard({ summary }) {
  const eventsCount = summary?.totalEventsAnalysed || 124;
  const activeRecoveries = summary?.activeCasesCount || 18;
  const stoppedCount = summary?.casesStoppedByFatigueGuard || 4;

  return (
    <div className="surface-level-3 p-6 rounded-2xl border border-indigo-500/30 space-y-5 glow-indigo relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-heading">REVIVE SYSTEM PULSE</h3>
            <p className="text-[11px] text-gray-400 font-mono">Autonomous Engine Operational</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xl font-extrabold font-heading text-emerald-400">98.7%</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-mono">Operational Confidence</span>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center space-x-2 text-gray-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Detecting real-time revenue-at-risk events</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Simulating 7 candidate recovery pathways per Twin</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-300">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Recovery Fatigue Guard™ actively enforcing policy limits</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-300">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          <span>Continuously learning from historical verified outcomes</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-800/80 text-center font-mono text-[11px]">
        <div className="p-2 rounded-lg bg-gray-900/60 border border-gray-800">
          <span className="text-gray-400 block text-[10px]">MONITORED</span>
          <span className="font-bold text-white text-xs">{eventsCount}</span>
        </div>
        <div className="p-2 rounded-lg bg-gray-900/60 border border-gray-800">
          <span className="text-gray-400 block text-[10px]">ACTIVE</span>
          <span className="font-bold text-indigo-400 text-xs">{activeRecoveries}</span>
        </div>
        <div className="p-2 rounded-lg bg-gray-900/60 border border-gray-800">
          <span className="text-gray-400 block text-[10px]">SIMULATING</span>
          <span className="font-bold text-cyan-400 text-xs">7</span>
        </div>
        <div className="p-2 rounded-lg bg-gray-900/60 border border-gray-800">
          <span className="text-gray-400 block text-[10px]">GUARDED</span>
          <span className="font-bold text-amber-400 text-xs">{stoppedCount}</span>
        </div>
      </div>
    </div>
  );
}
