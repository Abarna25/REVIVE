import React from 'react';
import { History, Cpu, ShieldCheck, UserCheck, CreditCard } from 'lucide-react';

export default function AuditTimeline({ logs = [] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 text-xs font-mono">
        No audit log events recorded yet.
      </div>
    );
  }

  const getActorBadge = (actorType) => {
    switch (actorType) {
      case 'AI_ENGINE':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI ENGINE</span>;
      case 'SAFETY_ENGINE':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">SAFETY GUARD</span>;
      case 'PAYMENT_PROVIDER':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">RAZORPAY</span>;
      case 'USER':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">MERCHANT USER</span>;
      default:
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-gray-800 text-gray-300">SYSTEM</span>;
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
      <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
        <History className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-bold text-white font-heading">Immutable Decision Audit Log</h3>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2 font-mono text-xs">
        {logs.map((log, index) => {
          const dateStr = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

          return (
            <div key={log.id || index} className="relative flex items-start justify-between border-b border-gray-800/40 pb-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 text-[11px] font-mono">{dateStr}</span>
                  {getActorBadge(log.actorType)}
                  <span className="font-semibold text-gray-200">{log.eventType}</span>
                </div>
                <p className="text-gray-400 font-sans text-xs">{log.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
