import React, { useEffect, useState } from 'react';
import { RefreshCw, GitFork, Brain, ShieldCheck } from 'lucide-react';

const STAGES = [
  { text: 'INITIALIZING RECOVERY TWIN', pct: 20 },
  { text: 'ANALYZING HISTORICAL CUSTOMER SIGNALS', pct: 45 },
  { text: 'SIMULATING 7 RECOVERY PATHWAYS', pct: 76 },
  { text: 'RANKING BY EXPECTED NET RECOVERY SCORE', pct: 100 }
];

export default function StagedSimulationLoader({ onComplete }) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStageIndex((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          if (onComplete) onComplete();
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(timer);
  }, []);

  const currentStage = STAGES[stageIndex];

  return (
    <div className="surface-level-3 p-8 rounded-2xl border border-indigo-500/40 text-center space-y-5 glow-indigo max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto">
        <GitFork className="w-6 h-6 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white font-heading tracking-tight">{currentStage.text}</h4>
        <p className="text-xs text-indigo-300 font-mono">{currentStage.pct}% COMPLETE</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-gray-900 border border-gray-800 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${currentStage.pct}%` }}
        ></div>
      </div>
    </div>
  );
}
