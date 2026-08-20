import React from 'react';
import { GitBranch, Zap, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function TwinVisualizer({ rescueTwin, simulations = [], selectedStrategy, onSelectStrategy }) {
  if (!rescueTwin) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl border border-gray-800 text-gray-400">
        <GitBranch className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-bounce" />
        <p className="text-sm">Select a recovery case to generate its Revenue Rescue Twin.</p>
      </div>
    );
  }

  let context = {};
  try {
    context = typeof rescueTwin.contextSnapshot === 'string' ? JSON.parse(rescueTwin.contextSnapshot) : (rescueTwin.contextSnapshot || {});
  } catch (e) {}

  return (
    <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6 glow-indigo">
      {/* Twin Header Node */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <GitBranch className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white font-heading">REVENUE RESCUE TWIN</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-medium">
                ID: {rescueTwin.id}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Simulating multi-path recovery pathways for <span className="text-white font-medium">{context.customerName || 'Customer'}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-400 uppercase tracking-wider block">Revenue At Risk</span>
          <span className="text-2xl font-bold font-heading text-emerald-400">₹{rescueTwin.revenueAmount?.toLocaleString()}</span>
        </div>
      </div>

      {/* Contextual Twin State Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-900/60 p-4 rounded-xl border border-gray-800/80 text-xs">
        <div>
          <span className="text-gray-400 block text-[11px]">Customer History Score</span>
          <span className="text-sm font-semibold text-white">{(rescueTwin.customerHistoryScore * 100).toFixed(0)}%</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[11px]">Engagement Index</span>
          <span className="text-sm font-semibold text-cyan-400">{(rescueTwin.engagementScore * 100).toFixed(0)}%</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[11px]">Recovery Fatigue Level</span>
          <span className="text-sm font-semibold text-amber-400">{(rescueTwin.recoveryFatigueScore * 100).toFixed(0)}%</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[11px]">Preferred Window</span>
          <span className="text-sm font-semibold text-indigo-400">{rescueTwin.preferredRecoveryWindow || '19:00 - 21:00'}</span>
        </div>
      </div>

      {/* Visual Pathway Simulation Branch */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulated Candidate Recovery Strategies</span>
          </span>
          <span className="text-[11px] text-gray-500 font-mono">Ranked by Expected Net Recovery Score (ENRS)</span>
        </div>

        <div className="space-y-2.5">
          {simulations.map((sim, index) => {
            const isSelected = selectedStrategy === sim.strategyType;
            const isEligible = sim.isEligible !== false;

            return (
              <div
                key={sim.strategyType}
                onClick={() => isEligible && onSelectStrategy && onSelectStrategy(sim.strategyType)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-900/40 via-indigo-950/20 to-transparent border-indigo-500 shadow-md shadow-indigo-500/10'
                    : isEligible
                    ? 'bg-gray-900/40 hover:bg-gray-800/60 border-gray-800'
                    : 'bg-gray-900/20 border-gray-800/40 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-indigo-400 font-mono">
                      #{sim.rank || index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white font-heading">{sim.strategyType}</span>
                        {isSelected && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500 text-white flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>WINNING STRATEGY</span>
                          </span>
                        )}
                        {!isEligible && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1">
                            <XCircle className="w-3 h-3" />
                            <span>INELIGIBLE</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {isEligible ? `Predicted Prob: ${(sim.predictedRecoveryProbability * 100).toFixed(0)}% | Cost: ₹${sim.interventionCost} | Fatigue Penalty: ₹${sim.fatiguePenalty}` : sim.ineligibilityReason}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Calculated ENRS</span>
                    <span className={`text-base font-bold font-heading ${sim.expectedNetRecoveryScore > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ₹{sim.expectedNetRecoveryScore?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mathematical ENRS Formula Display */}
      <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between font-mono">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Formula: ENRS = (Predicted Recovery Prob × Revenue) − Intervention Cost − Fatigue Penalty</span>
        </div>
        <span className="text-gray-400 text-[11px]">Deterministic Scoring Active</span>
      </div>
    </div>
  );
}
