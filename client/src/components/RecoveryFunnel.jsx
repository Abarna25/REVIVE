import React from 'react';
import { Filter, ArrowDown, CheckCircle2 } from 'lucide-react';

export default function RecoveryFunnel({ metrics }) {
  const total = metrics?.totalEvents || 124;
  const eligible = Math.round(total * 0.70);
  const simulated = Math.round(total * 0.61);
  const safetyApproved = Math.round(total * 0.49);
  const executed = Math.round(total * 0.38);
  const recovered = metrics?.totalRecoveredCases || Math.round(total * 0.31);

  const steps = [
    { label: 'DETECTED EVENTS', value: total, color: 'bg-indigo-600', width: '100%' },
    { label: 'ELIGIBLE FOR TWIN', value: eligible, color: 'bg-indigo-500', width: '85%' },
    { label: 'SIMULATED PATHWAYS', value: simulated, color: 'bg-violet-500', width: '70%' },
    { label: 'SAFETY APPROVED', value: safetyApproved, color: 'bg-cyan-500', width: '55%' },
    { label: 'EXECUTED ACTIONS', value: executed, color: 'bg-emerald-500', width: '42%' },
    { label: 'RECOVERED REVENUE', value: recovered, color: 'bg-emerald-400', width: '32%' }
  ];

  return (
    <div className="surface-level-2 p-6 rounded-2xl border border-gray-800 space-y-5">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white font-heading">AUTONOMOUS RECOVERY FUNNEL</h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">Conversion Telemetry</span>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-300 font-semibold">{step.label}</span>
              <span className="text-white font-bold">{step.value} Cases</span>
            </div>
            <div className="w-full h-7 rounded-lg bg-gray-900 overflow-hidden flex items-center p-1 border border-gray-800">
              <div 
                className={`h-full rounded ${step.color} transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white font-mono shadow-md`}
                style={{ width: step.width }}
              >
                {step.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
