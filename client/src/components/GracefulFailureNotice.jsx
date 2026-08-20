import React from 'react';
import { ShieldCheck, AlertOctagon, Lock } from 'lucide-react';

export default function GracefulFailureNotice({ failureReason }) {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-gray-900 border border-amber-500/40 text-xs text-amber-200 space-y-2 shadow-lg">
      <div className="flex items-center space-x-2 font-bold font-heading text-sm text-amber-400">
        <AlertOctagon className="w-4 h-4 text-amber-400" />
        <span>Action Failed Gracefully → No duplicate charge → Case safely preserved for review</span>
      </div>

      <p className="text-amber-200/80 leading-relaxed">
        The recovery engine detected a gateway response failure during execution ({failureReason || 'Simulated Network Timeout'}).
      </p>

      <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px]">
        <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
          <Lock className="w-3.5 h-3.5" />
          <span>Idempotency Lock Active (Duplicate charge prevented)</span>
        </div>
        <span className="text-gray-400 font-mono">Case Status: FAILED_GRACEFULLY</span>
      </div>
    </div>
  );
}
