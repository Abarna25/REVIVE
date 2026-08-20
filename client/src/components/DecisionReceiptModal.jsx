import React from 'react';
import { X, Receipt, CheckCircle, ShieldCheck, Zap, ArrowRight, DollarSign } from 'lucide-react';
import StrategyMatrix from './StrategyMatrix';
import AuditTimeline from './AuditTimeline';
import GracefulFailureNotice from './GracefulFailureNotice';

export default function DecisionReceiptModal({ caseData, onClose }) {
  if (!caseData) return null;

  const event = caseData.revenueEvent;
  const twin = caseData.rescueTwin;
  const amount = event ? event.amount : (twin ? twin.revenueAmount : 0);
  const recovered = caseData.recoveredAmount || 0;
  const cost = caseData.interventionCost || 0;
  const netSaved = caseData.netRevenueSaved || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-4xl rounded-3xl border border-indigo-500/30 p-8 space-y-6 shadow-2xl glow-indigo relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Receipt Header */}
        <div className="border-b border-gray-800 pb-6 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                <Receipt className="w-7 h-7 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-white font-heading tracking-tight">REVIVE™ DECISION RECEIPT</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  CASE: {caseData.id}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Explainable Autonomous Revenue Recovery Audit Record • {new Date(caseData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-400 uppercase tracking-wider block">Recovery Status</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-full inline-block mt-1 ${
              caseData.status === 'RECOVERED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : caseData.status === 'FAILED_GRACEFULLY'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            }`}>
              {caseData.status}
            </span>
          </div>
        </div>

        {/* Graceful Failure Banner if applicable */}
        {caseData.status === 'FAILED_GRACEFULLY' && (
          <GracefulFailureNotice failureReason="Simulated Payment Gateway Timeout" />
        )}

        {/* Financial Metrics Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-gray-900/60 border border-gray-800">
          <div>
            <span className="text-xs text-gray-400 block uppercase font-mono">Revenue At Risk</span>
            <span className="text-xl font-bold font-heading text-white">₹{amount.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block uppercase font-mono">Revenue Recovered</span>
            <span className="text-xl font-bold font-heading text-emerald-400">₹{recovered.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block uppercase font-mono">Intervention Cost</span>
            <span className="text-xl font-bold font-heading text-gray-300">₹{cost}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block uppercase font-mono">Net Revenue Saved</span>
            <span className="text-xl font-bold font-heading text-cyan-400">₹{netSaved.toLocaleString()}</span>
          </div>
        </div>

        {/* AI Explainable Reasoning Block */}
        <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>AI Decision Rationale</span>
          </div>
          <p className="text-sm text-indigo-100 leading-relaxed font-sans">
            Strategy <span className="font-bold text-white">{caseData.selectedStrategy || 'RETRY_OPTIMAL_TIME'}</span> was selected because it yielded the highest valid Expected Net Recovery Score (ENRS: ₹{caseData.expectedNetRecoveryScore}). Direct immediate retries were penalized due to transient failure risk, while time-shifted execution aligned with the customer's historical successful payment window.
          </p>
        </div>

        {/* Strategy Matrix Comparison Table */}
        <StrategyMatrix simulations={caseData.strategySimulations} selectedStrategy={caseData.selectedStrategy} />

        {/* Audit Timeline */}
        <AuditTimeline logs={caseData.auditLogs} />

        {/* Modal Footer */}
        <div className="pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <span>Net Revenue Saved = Revenue Recovered − Intervention Cost</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition shadow-lg shadow-indigo-600/30"
          >
            Close Decision Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
