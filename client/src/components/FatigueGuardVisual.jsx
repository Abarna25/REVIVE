import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Check, X, Lock } from 'lucide-react';

export default function FatigueGuardVisual({ fatigueScore = 0.22, isBlocked, blockReason }) {
  const fatiguePct = Math.round(fatigueScore * 100);
  const isHighFatigue = fatiguePct > 60;

  return (
    <div className="surface-level-2 p-6 rounded-2xl border border-gray-800 space-y-5 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isBlocked ? 'bg-rose-500/20 border border-rose-500/30' : 'bg-emerald-500/20 border border-emerald-500/30'
          }`}>
            {isBlocked ? <ShieldAlert className="w-5 h-5 text-rose-400" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-heading">FATIGUE GUARD™</h3>
            <p className="text-xs text-gray-400">Autonomous Customer Contact Protection Shield</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
          isBlocked
            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            : isHighFatigue
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}>
          {isBlocked ? 'STATUS: BLOCKED' : 'STATUS: SAFE'}
        </span>
      </div>

      {/* Fatigue Gauge Metric Bar */}
      <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 font-mono">CUSTOMER FATIGUE LEVEL</span>
          <span className={`font-bold font-mono ${isHighFatigue ? 'text-rose-400' : 'text-emerald-400'}`}>
            {fatiguePct}% ({isHighFatigue ? 'HIGH FATIGUE' : 'LOW FATIGUE'})
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-gray-800 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              isHighFatigue ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${fatiguePct}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 font-mono pt-1">
          <span>0% (Optimal)</span>
          <span>Safe Remaining Interventions: {isHighFatigue ? '0' : '3'}</span>
          <span>100% (Exhausted)</span>
        </div>
      </div>

      {/* Guard Allowed vs Blocked Action List */}
      <div className="space-y-2 text-xs">
        <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">INTERVENTION POLICIES:</span>
        <div className="space-y-1.5 font-mono">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Smart Retry (Optimal Window 7–9 PM) — ALLOWED</span>
          </div>
          <div className="flex items-center space-x-2 text-emerald-400">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Personalized Payment Link — ALLOWED</span>
          </div>
          <div className="flex items-center space-x-2 text-rose-400">
            <X className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Immediate Repeat Retry — DISALLOWED (High Fatigue Risk)</span>
          </div>
        </div>
      </div>

      {/* Active Guard Intervention Warning if Blocked */}
      {isBlocked && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 space-y-2">
          <div className="flex items-center space-x-2 font-bold font-heading text-rose-400">
            <Lock className="w-4 h-4" />
            <span>🛡 GUARD INTERVENTION — ACTION BLOCKED</span>
          </div>
          <p className="text-rose-200/80 leading-relaxed">
            {blockReason || "Further intervention is predicted to have negative expected value and may increase customer fatigue."}
          </p>
        </div>
      )}
    </div>
  );
}
