import React, { useState } from 'react';
import { RefreshCw, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { resetSeedData } from '../services/api';

export default function Navbar({ onRefresh }) {
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await resetSeedData();
      setToastMessage('✅ Successfully loaded 100+ synthetic revenue events!');
      if (onRefresh) onRefresh();
    } catch (err) {
      setToastMessage('❌ Demo reset failed');
    } finally {
      setIsResetting(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <header className="h-16 glass-panel border-b border-gray-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Loop Ticker */}
      <div className="flex items-center space-x-3 text-xs">
        <span className="font-mono text-gray-500 uppercase tracking-widest">Intelligence Loop:</span>
        <div className="flex items-center space-x-1.5 font-semibold text-indigo-400">
          <span>DETECT</span>
          <span className="text-gray-600">→</span>
          <span>TWIN</span>
          <span className="text-gray-600">→</span>
          <span className="text-cyan-400">SIMULATE</span>
          <span className="text-gray-600">→</span>
          <span>DECIDE</span>
          <span className="text-gray-600">→</span>
          <span className="text-amber-400">GUARD</span>
          <span className="text-gray-600">→</span>
          <span>ACT</span>
          <span className="text-gray-600">→</span>
          <span className="text-emerald-400">VERIFY</span>
          <span className="text-gray-600">→</span>
          <span>LEARN</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {toastMessage && (
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/40 animate-fade-in">
            {toastMessage}
          </span>
        )}

        {/* Demo Data Reset Trigger */}
        <button
          onClick={handleResetDemo}
          disabled={isResetting}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-800/80 hover:bg-gray-700 text-gray-200 border border-gray-700 transition duration-150 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Seeding 100+ Events...' : 'Reload 100+ Demo Events'}</span>
        </button>

        {/* Safety Mode Badge */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Fatigue Guard™ Active</span>
        </div>
      </div>
    </header>
  );
}
