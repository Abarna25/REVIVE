import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, GitFork, Sun, Moon } from 'lucide-react';
import { resetSeedData } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onRefresh }) {
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const { theme, toggleTheme, isDark } = useTheme();
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
    <header className="h-16 bg-white dark:bg-[#0B1020] border-b border-slate-200 dark:border-gray-800 px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200 shadow-sm dark:shadow-none">
      {/* Live System Status Pulse */}
      <div className="flex items-center space-x-3 text-xs font-mono">
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
          <span>● LIVE SYSTEM (98.7% Confidence)</span>
        </div>
        <span className="text-slate-300 dark:text-gray-600 hidden md:inline">|</span>
        <span className="text-slate-500 dark:text-gray-400 hidden md:inline">Autonomous Safety Gates Engaged</span>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3">
        {toastMessage && (
          <span className="text-xs bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 animate-fade-in font-mono">
            {toastMessage}
          </span>
        )}

        {/* Global Light / Dark Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-amber-400 border border-slate-300 dark:border-gray-700 transition duration-150 flex items-center justify-center"
          title={isDark ? 'Switch to Light Mode (FinTech Workspace)' : 'Switch to Dark Mode (AI Console)'}
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Demo Data Reset Trigger */}
        <button
          onClick={handleResetDemo}
          disabled={isResetting}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-200 border border-slate-300 dark:border-gray-700 transition duration-150 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Seeding 100+ Events...' : 'Reload 100+ Events'}</span>
        </button>

        {/* Primary CTA: Launch Recovery Twin */}
        <button
          onClick={() => navigate('/twin-lab')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:opacity-95 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition transform hover:scale-[1.02]"
        >
          <GitFork className="w-4 h-4 text-white" />
          <span>Launch Recovery Twin</span>
        </button>
      </div>
    </header>
  );
}
