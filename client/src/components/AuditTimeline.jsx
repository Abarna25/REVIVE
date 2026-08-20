import React from 'react';
import { History } from 'lucide-react';

export default function AuditTimeline({ logs = [] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 dark:text-gray-500 text-xs font-mono">
        No audit log events recorded yet.
      </div>
    );
  }

  const getActorBadge = (actorType) => {
    switch (actorType) {
      case 'AI_ENGINE':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/30">AI ENGINE</span>;
      case 'SAFETY_ENGINE':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/30">SAFETY GUARD</span>;
      case 'PAYMENT_PROVIDER':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/30">RAZORPAY</span>;
      case 'USER':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-500/30">MERCHANT USER</span>;
      default:
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300">SYSTEM</span>;
    }
  };

  return (
    <div className="surface-level-2 p-6 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-4 transition-colors duration-200">
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-gray-800 pb-3">
        <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">Immutable Decision Audit Log</h3>
      </div>

      <div className="relative pl-4 space-y-4 font-mono text-xs">
        {logs.map((log, index) => {
          const dateStr = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

          return (
            <div key={log.id || index} className="relative flex items-start justify-between border-b border-slate-200/60 dark:border-gray-800/40 pb-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 dark:text-gray-500 text-[11px] font-mono">{dateStr}</span>
                  {getActorBadge(log.actorType)}
                  <span className="font-semibold text-slate-900 dark:text-gray-200">{log.eventType}</span>
                </div>
                <p className="text-slate-600 dark:text-gray-400 font-sans text-xs">{log.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
