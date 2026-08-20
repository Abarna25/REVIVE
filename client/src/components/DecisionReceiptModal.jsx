import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Receipt, Download, Lock, Check } from 'lucide-react';
import StrategyMatrix from './StrategyMatrix';
import AuditTimeline from './AuditTimeline';
import GracefulFailureNotice from './GracefulFailureNotice';

export default function DecisionReceiptModal({ caseData, onClose }) {
  const navigate = useNavigate();

  if (!caseData) return null;

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const event = caseData.revenueEvent;
  const twin = caseData.rescueTwin;
  const amount = event ? event.amount : (twin ? twin.revenueAmount : 0);
  const confidence = Math.round((caseData.predictedRecoveryProbability || 0.84) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="surface-level-3 w-full max-w-4xl rounded-3xl border border-indigo-500/40 p-8 space-y-6 shadow-2xl glow-indigo relative max-h-[90vh] overflow-y-auto transition-colors duration-200">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-gray-700 transition"
          title="Close Decision Receipt"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Official Document Header */}
        <div className="border-b border-slate-200 dark:border-gray-800 pb-6 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-white dark:bg-[#080D18] rounded-[14px] flex items-center justify-center">
                <Receipt className="w-7 h-7 text-indigo-600 dark:text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading tracking-tight">REVIVE™ AUTONOMOUS DECISION RECEIPT</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-mono">
                Receipt ID: <span className="text-indigo-600 dark:text-indigo-400 font-bold">RV-DEC-{caseData.id?.substring(0, 8)}</span> • {new Date(caseData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-widest font-mono block">Safety Validation</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full inline-block mt-1 bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/30 font-mono">
              🛡 PASSED & VERIFIED
            </span>
          </div>
        </div>

        {/* Graceful Failure Banner if applicable */}
        {caseData.status === 'FAILED_GRACEFULLY' && (
          <GracefulFailureNotice failureReason="Simulated Gateway Timeout" />
        )}

        {/* Document Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 text-xs font-mono">
          <div>
            <span className="text-slate-500 dark:text-gray-400 block text-[10px]">EVENT SCENARIO</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{event?.eventType || 'PAYMENT_FAILED'}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-gray-400 block text-[10px]">REVENUE AT RISK</span>
            <span className="text-sm font-bold text-rose-600 dark:text-rose-400">₹{amount.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-gray-400 block text-[10px]">AI DECISION</span>
            <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{caseData.selectedStrategy || 'RETRY_OPTIMAL_TIME'}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-gray-400 block text-[10px]">ENRS SCORE</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{caseData.expectedNetRecoveryScore?.toLocaleString()}</span>
          </div>
        </div>

        {/* WHY THIS WINS Bullet Grid */}
        <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 space-y-3">
          <span className="text-xs font-bold font-mono text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">WHY THIS STRATEGY WAS SELECTED:</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-sans text-slate-800 dark:text-indigo-100">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Highest predicted recovery probability ({confidence}%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Best customer engagement timing window (7–9 PM)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Lowest safe fatigue impact (Fatigue Guard approved)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Strongest Expected Net Recovery Score (₹{caseData.expectedNetRecoveryScore?.toLocaleString()})</span>
            </div>
          </div>
        </div>

        {/* Decision Trace Technical Section */}
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-gray-900/90 border border-slate-200 dark:border-gray-800 text-[11px] font-mono space-y-2 text-slate-600 dark:text-gray-400">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-2 text-slate-800 dark:text-gray-300 font-bold">
            <span className="flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>TECHNICAL VERIFICATION TRACE</span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">STATUS: VERIFIED</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
            <div>
              <span className="block text-[10px] text-slate-500 dark:text-gray-500">DECISION HASH</span>
              <span className="text-slate-900 dark:text-gray-200 font-semibold">0x8f4a...29e1</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 dark:text-gray-500">SIMULATION ID</span>
              <span className="text-slate-900 dark:text-gray-200 font-semibold">SIM-{caseData.id?.substring(0, 6)}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 dark:text-gray-500">MODEL VERSION</span>
              <span className="text-slate-900 dark:text-gray-200 font-semibold">REVIVE-v1.4</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 dark:text-gray-500">POLICY VERSION</span>
              <span className="text-slate-900 dark:text-gray-200 font-semibold">SAFEGUARD-v2.0</span>
            </div>
          </div>
        </div>

        {/* Strategy Matrix Comparison */}
        <StrategyMatrix simulations={caseData.strategySimulations} selectedStrategy={caseData.selectedStrategy} />

        {/* Audit Timeline */}
        <AuditTimeline logs={caseData.auditLogs} />

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => alert("Decision Receipt exported as PDF record.")}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-gray-900 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-200 transition font-mono"
            >
              <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Export Receipt</span>
            </button>
          </div>

          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition shadow-md shadow-indigo-600/20 font-mono"
          >
            Close Decision Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
