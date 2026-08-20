import React from 'react';
import { Brain } from 'lucide-react';

export default function ExplainabilityEngine({ selectedStrategy, simulations = [], aiExplanation }) {
  if (!selectedStrategy) return null;

  const winningSim = simulations.find(s => s.strategyType === selectedStrategy) || simulations[0] || {};
  const prob = Math.round((winningSim.predictedRecoveryProbability || 0.84) * 100);
  const enrs = winningSim.expectedNetRecoveryScore || 4030;

  const reasoningText = aiExplanation?.explanationText || 
    `Strategy ${selectedStrategy} was selected because historical payment patterns indicate a higher likelihood of successful completion during the customer's preferred evening engagement window. Direct immediate retry was penalized to prevent intervention fatigue.`;

  return (
    <div className="surface-level-3 p-6 rounded-2xl border border-indigo-500/30 space-y-6 glow-indigo relative transition-colors duration-200">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">🧠 WHY THIS DECISION?</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">Explainable AI Evidence & Decision Justification Engine</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
          WINNER: {selectedStrategy}
        </span>
      </div>

      {/* Primary Decision Factor Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800">
          <span className="text-slate-500 dark:text-gray-400 block text-[11px] font-mono">RECOVERY PROBABILITY</span>
          <span className="text-lg font-bold font-heading text-emerald-600 dark:text-emerald-400">{prob}%</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800">
          <span className="text-slate-500 dark:text-gray-400 block text-[11px] font-mono">ENRS SCORE</span>
          <span className="text-lg font-bold font-heading text-cyan-600 dark:text-cyan-400">₹{enrs?.toLocaleString()}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800">
          <span className="text-slate-500 dark:text-gray-400 block text-[11px] font-mono">FATIGUE IMPACT</span>
          <span className="text-lg font-bold font-heading text-amber-600 dark:text-amber-400">22% (Low)</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800">
          <span className="text-slate-500 dark:text-gray-400 block text-[11px] font-mono">RESPONSE WINDOW</span>
          <span className="text-lg font-bold font-heading text-indigo-600 dark:text-indigo-400">7 – 9 PM</span>
        </div>
      </div>

      {/* AI Reasoning Text */}
      <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 text-xs leading-relaxed text-indigo-900 dark:text-indigo-100 font-sans">
        <span className="font-semibold text-indigo-700 dark:text-indigo-300 block mb-1 font-mono uppercase tracking-wider text-[11px]">AI EXPLAINABILITY REASONING:</span>
        {reasoningText}
      </div>

      {/* Contributing Signals Strength Bars */}
      <div className="space-y-3 pt-2">
        <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-gray-400 block tracking-wider">CONTRIBUTING SIGNALS WEIGHT:</span>

        <div className="space-y-2 text-xs">
          <div>
            <div className="flex justify-between text-[11px] text-slate-700 dark:text-gray-300 font-mono mb-1">
              <span>Payment History Reliability</span>
              <span>88%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden">
              <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full" style={{ width: '88%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-700 dark:text-gray-300 font-mono mb-1">
              <span>Customer Engagement Index</span>
              <span>82%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden">
              <div className="h-full bg-cyan-500 dark:bg-cyan-400 rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-700 dark:text-gray-300 font-mono mb-1">
              <span>Timing Alignment Window</span>
              <span>91%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden">
              <div className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full" style={{ width: '91%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-700 dark:text-gray-300 font-mono mb-1">
              <span>Fatigue Guard Capacity</span>
              <span>78% Remaining</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden">
              <div className="h-full bg-amber-500 dark:bg-amber-400 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
