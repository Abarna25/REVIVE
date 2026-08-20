import React, { useEffect, useState } from 'react';
import { getPolicy, updatePolicy } from '../services/api';
import { ShieldCheck, Save, RefreshCw, Sliders, Lock } from 'lucide-react';

export default function SettingsPage() {
  const [policy, setPolicyState] = useState({
    maxRetryAttempts: 3,
    maxReminders: 2,
    cooldownMinutes: 120,
    minRecoveryProbability: 0.20,
    minExpectedNetRecoveryScore: 100,
    maxAutonomousRecoveryAmount: 25000,
    maxInterventionCost: 500,
    manualApprovalThreshold: 10000
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getPolicy();
        if (res.data.success && res.data.data) {
          setPolicyState(res.data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (field, value) => {
    setPolicyState(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePolicy(policy);
      setToast('✅ Merchant safety policy saved successfully!');
    } catch (e) {
      setToast('❌ Failed to save safety policy.');
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 dark:text-gray-400 space-y-3 surface-level-2 rounded-2xl">
        <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
        <p className="text-xs font-mono">Loading Merchant Recovery Policies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in max-w-4xl transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading tracking-tight flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Settings & Safety Gates</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-mono">Configure merchant autonomous action caps, stopping rules, and safety gate parameters</p>
        </div>

        {toast && (
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/30 animate-fade-in font-medium">
            {toast}
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Safety Limits Card */}
        <div className="surface-level-2 p-6 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-gray-800 pb-3">
            <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Recovery Fatigue Guard™ Limits</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1 font-mono">Max Retry Attempts</label>
              <input
                type="number"
                value={policy.maxRetryAttempts}
                onChange={(e) => handleChange('maxRetryAttempts', parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono shadow-sm"
              />
              <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">Maximum automatic payment retry executions per event</p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1 font-mono">Max Customer Reminders</label>
              <input
                type="number"
                value={policy.maxReminders}
                onChange={(e) => handleChange('maxReminders', parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono shadow-sm"
              />
              <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">Maximum notification reminders before stopping</p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1 font-mono">Cooldown Period (Minutes)</label>
              <input
                type="number"
                value={policy.cooldownMinutes}
                onChange={(e) => handleChange('cooldownMinutes', parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono shadow-sm"
              />
              <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">Minimum quiet period between interventions</p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1 font-mono">Minimum Recovery Probability Threshold</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={policy.minRecoveryProbability}
                onChange={(e) => handleChange('minRecoveryProbability', parseFloat(e.target.value))}
                className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono shadow-sm"
              />
              <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">Below this probability, Fatigue Guard stops recovery</p>
            </div>
          </div>
        </div>

        {/* Financial & Autonomous Caps Card */}
        <div className="surface-level-2 p-6 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-gray-800 pb-3">
            <Sliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Financial Autonomous Execution Boundaries</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1 font-mono">Max Autonomous Recovery Amount (₹)</label>
              <input
                type="number"
                value={policy.maxAutonomousRecoveryAmount}
                onChange={(e) => handleChange('maxAutonomousRecoveryAmount', parseFloat(e.target.value))}
                className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono shadow-sm"
              />
              <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">Hard cap for un-assisted autonomous execution</p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1 font-mono">Manual Approval Threshold (₹)</label>
              <input
                type="number"
                value={policy.manualApprovalThreshold}
                onChange={(e) => handleChange('manualApprovalThreshold', parseFloat(e.target.value))}
                className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono shadow-sm"
              />
              <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">Amounts at or above require human merchant sign-off</p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1 font-mono">Minimum ENRS Threshold (₹)</label>
              <input
                type="number"
                value={policy.minExpectedNetRecoveryScore}
                onChange={(e) => handleChange('minExpectedNetRecoveryScore', parseFloat(e.target.value))}
                className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono shadow-sm"
              />
              <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">Minimum Expected Net Recovery Score required to proceed</p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1 font-mono">Max Intervention Cost Cap (₹)</label>
              <input
                type="number"
                value={policy.maxInterventionCost}
                onChange={(e) => handleChange('maxInterventionCost', parseFloat(e.target.value))}
                className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono shadow-sm"
              />
              <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">Upper limit on allowed operational recovery cost</p>
            </div>
          </div>
        </div>

        {/* Save Controls */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition disabled:opacity-50 font-mono"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Safety Policy...' : 'Save Safety Gate Configurations'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
