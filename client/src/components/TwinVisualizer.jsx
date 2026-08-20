import React from 'react';
import { GitBranch, Zap, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, XCircle, Trophy } from 'lucide-react';

export default function TwinVisualizer({ rescueTwin, simulations = [], selectedStrategy, onSelectStrategy }) {
  if (!rescueTwin) {
    return (
      <div className="p-8 text-center surface-level-2 rounded-2xl border border-gray-800 text-gray-400">
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
    <div className="surface-level-3 p-6 rounded-2xl border border-indigo-500/40 space-y-6 glow-indigo relative overflow-hidden">
      {/* Twin Header Node */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center">
            <GitBranch className="w-6 h-6 text-violet-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white font-heading">RECOVERY DIGITAL TWIN</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold">
                #RV-{rescueTwin.id?.substring(0, 8)}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Simulating recovery futures for <span className="text-white font-medium">{context.customerName || 'Enterprise Customer'}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block">Revenue At Risk</span>
          <span className="text-2xl font-extrabold font-heading text-emerald-400">₹{rescueTwin.revenueAmount?.toLocaleString()}</span>
        </div>
      </div>

      {/* Customer Signals Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-900/80 p-4 rounded-xl border border-gray-800/80 text-xs font-mono">
        <div>
          <span className="text-gray-400 block text-[10px]">PAYMENT HISTORY</span>
          <span className="text-sm font-bold text-white">{(rescueTwin.customerHistoryScore * 100).toFixed(0)}%</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px]">ENGAGEMENT INDEX</span>
          <span className="text-sm font-bold text-cyan-400">{(rescueTwin.engagementScore * 100).toFixed(0)}%</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px]">FATIGUE LEVEL</span>
          <span className="text-sm font-bold text-amber-400">{(rescueTwin.recoveryFatigueScore * 100).toFixed(0)}%</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px]">BEST RESPONSE WINDOW</span>
          <span className="text-sm font-bold text-indigo-400">{rescueTwin.preferredRecoveryWindow || '7 – 9 PM'}</span>
        </div>
      </div>

      {/* Visual Candidate Strategy Pathways */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulated Candidate Recovery Strategies</span>
          </span>
          <span className="text-[10px] text-gray-500 font-mono">Ranked by ENRS Score</span>
        </div>

        <div className="space-y-3">
          {simulations.map((sim, index) => {
            const isSelected = selectedStrategy === sim.strategyType;
            const isEligible = sim.isEligible !== false;

            return (
              <div
                key={sim.strategyType}
                onClick={() => isEligible && onSelectStrategy && onSelectStrategy(sim.strategyType)}
                className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'surface-level-3 border-indigo-500 shadow-xl glow-indigo'
                    : isEligible
                    ? 'bg-gray-900/50 hover:bg-gray-800/70 border-gray-800'
                    : 'bg-gray-900/20 border-gray-800/40 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-indigo-400 font-mono border border-gray-700">
                      #{sim.rank || index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white font-heading">{sim.strategyType}</span>
                        {isSelected && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white flex items-center space-x-1 font-mono shadow-md">
                            <Trophy className="w-3 h-3 text-amber-300" />
                            <span>WINNING STRATEGY</span>
                          </span>
                        )}
                        {!isEligible && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1 font-mono">
                            <XCircle className="w-3 h-3" />
                            <span>INELIGIBLE</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 font-sans">
                        {isEligible ? `Prob: ${(sim.predictedRecoveryProbability * 100).toFixed(0)}% • Cost: ₹${sim.interventionCost} • Fatigue Impact: ₹${sim.fatiguePenalty}` : sim.ineligibilityReason}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block">ENRS Score</span>
                    <span className={`text-lg font-extrabold font-heading ${sim.expectedNetRecoveryScore > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ₹{sim.expectedNetRecoveryScore?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
