import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function SafetyCheckBadge({ gates = [], requiresManualApproval, isBlocked, blockReason }) {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isBlocked ? (
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          ) : requiresManualApproval ? (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          )}
          <h4 className="text-sm font-bold text-white font-heading">Recovery Fatigue Guard & Safety Gates</h4>
        </div>

        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
          isBlocked
            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            : requiresManualApproval
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}>
          {isBlocked ? 'BLOCKED BY GUARD' : requiresManualApproval ? 'MANUAL REVIEW REQUIRED' : 'ALL GATES PASSED'}
        </span>
      </div>

      {blockReason && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          <span className="font-semibold block mb-0.5">Execution Blocked:</span>
          {blockReason}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        {gates.map((gate, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded-xl border flex items-center justify-between ${
              gate.passed
                ? 'bg-gray-900/40 border-gray-800/60 text-gray-300'
                : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              {gate.passed ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="font-medium">{gate.gateType}</span>
            </div>
            <span className="text-[11px] text-gray-400">{gate.passed ? 'PASSED' : 'FAILED'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
