import React from 'react';
import { Check, X, Award, Info } from 'lucide-react';

export default function StrategyMatrix({ simulations = [], selectedStrategy }) {
  if (!simulations || simulations.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl border border-gray-800 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white font-heading">Strategy Simulation Matrix</h3>
          <p className="text-xs text-gray-400">Comparative evaluation of candidate recovery pathways</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
          7 Strategies Simulated
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 uppercase tracking-wider font-mono">
              <th className="py-3 px-3">Strategy</th>
              <th className="py-3 px-3">Recovery Prob</th>
              <th className="py-3 px-3">Est. Amount</th>
              <th className="py-3 px-3">Cost</th>
              <th className="py-3 px-3">Fatigue Penalty</th>
              <th className="py-3 px-3">ENRS Score</th>
              <th className="py-3 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {simulations.map((sim) => {
              const isSelected = selectedStrategy === sim.strategyType;
              const isEligible = sim.isEligible !== false;

              return (
                <tr
                  key={sim.strategyType}
                  className={`transition duration-150 ${
                    isSelected ? 'bg-indigo-600/10 font-medium' : 'hover:bg-gray-800/40'
                  }`}
                >
                  <td className="py-3 px-3 font-semibold text-white flex items-center space-x-2">
                    {isSelected && <Award className="w-4 h-4 text-indigo-400 shrink-0" />}
                    <span>{sim.strategyType}</span>
                  </td>
                  <td className="py-3 px-3 text-cyan-400">{(sim.predictedRecoveryProbability * 100).toFixed(0)}%</td>
                  <td className="py-3 px-3 text-emerald-400">₹{sim.estimatedRecoveryAmount?.toLocaleString()}</td>
                  <td className="py-3 px-3 text-gray-300">₹{sim.interventionCost}</td>
                  <td className="py-3 px-3 text-amber-400">₹{sim.fatiguePenalty}</td>
                  <td className={`py-3 px-3 font-bold font-heading ${sim.expectedNetRecoveryScore > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ₹{sim.expectedNetRecoveryScore?.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {isSelected ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white">
                        Selected Winner
                      </span>
                    ) : isEligible ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-800 text-gray-400">
                        Evaluated
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
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
