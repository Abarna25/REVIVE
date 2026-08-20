import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, GitFork, ShieldCheck, Cpu } from 'lucide-react';
import { resetSeedData } from '../services/api';

export default function Navbar({ onRefresh }) {
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const navigate = useNavigate();

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
    <header className="h-16 surface-level-2 border-b border-gray-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Live System Status Pulse */}
      <div className="flex items-center space-x-3 text-xs font-mono">
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>● LIVE SYSTEM (98.7% Confidence)</span>
        </div>
        <span className="text-gray-500 hidden md:inline">|</span>
        <span className="text-gray-400 hidden md:inline">Autonomous Safety Gates Engaged</span>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {toastMessage && (
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/40 animate-fade-in font-mono">
            {toastMessage}
          </span>
        )}

        {/* Demo Data Reset Trigger */}
        <button
          onClick={handleResetDemo}
          disabled={isResetting}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 transition duration-150 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Seeding 100+ Events...' : 'Reload 100+ Events'}</span>
        </button>

        {/* Primary CTA: Launch Recovery Twin */}
        <button
          onClick={() => navigate('/twin-lab')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition transform hover:scale-[1.02]"
        >
          <GitFork className="w-4 h-4 text-white" />
          <span>Launch Recovery Twin</span>
        </button>
      </div>
    </header>
  );
}
