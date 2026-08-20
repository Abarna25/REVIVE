import React from 'react';
import { Award } from 'lucide-react';

export default function StrategyMatrix({ simulations = [], selectedStrategy }) {
  if (!simulations || simulations.length === 0) return null;

  return (
    <div className="surface-level-2 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 space-y-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Strategy Simulation Matrix</h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">Comparative evaluation of candidate recovery pathways</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 font-semibold font-mono">
          7 Strategies Simulated
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-3">Strategy</th>
              <th className="py-3 px-3">Recovery Prob</th>
              <th className="py-3 px-3">Est. Amount</th>
              <th className="py-3 px-3">Cost</th>
              <th className="py-3 px-3">Fatigue Penalty</th>
              <th className="py-3 px-3">ENRS Score</th>
              <th className="py-3 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-gray-800/60 font-sans">
            {simulations.map((sim) => {
              const isSelected = selectedStrategy === sim.strategyType;
              const isEligible = sim.isEligible !== false;

              return (
                <tr
                  key={sim.strategyType}
                  className={`transition duration-150 ${
                    isSelected ? 'bg-indigo-50 dark:bg-indigo-600/20 font-medium' : 'hover:bg-slate-50 dark:hover:bg-gray-800/40'
                  }`}
                >
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                    {isSelected && <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    <span>{sim.strategyType}</span>
                  </td>
                  <td className="py-3 px-3 text-cyan-600 dark:text-cyan-400 font-mono">{(sim.predictedRecoveryProbability * 100).toFixed(0)}%</td>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-mono">₹{sim.estimatedRecoveryAmount?.toLocaleString()}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-gray-300 font-mono">₹{sim.interventionCost}</td>
                  <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-mono">₹{sim.fatiguePenalty}</td>
                  <td className={`py-3 px-3 font-bold font-heading font-mono ${sim.expectedNetRecoveryScore > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    ₹{sim.expectedNetRecoveryScore?.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {isSelected ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white shadow-sm font-mono">
                        Selected Winner
                      </span>
                    ) : isEligible ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 font-mono">
                        Evaluated
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-mono">
                        Ineligible
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
