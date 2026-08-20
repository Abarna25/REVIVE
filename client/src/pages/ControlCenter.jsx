import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCases, approveAction, stopRecovery } from '../services/api';
import { SlidersHorizontal, CheckCircle, AlertTriangle, Play, StopCircle, RefreshCw, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

const PIPELINE_STAGES = [
  { stage: 'DETECT', active: 124, automation: 'Full', status: 'Healthy' },
  { stage: 'DIAGNOSE', active: 98, automation: 'Full', status: 'Healthy' },
  { stage: 'SIMULATE', active: 76, automation: 'Full', status: 'Healthy' },
  { stage: 'DECIDE', active: 61, automation: 'Assisted', status: 'Attention Required' },
  { stage: 'SAFEGUARD', active: 48, automation: 'Full', status: 'Healthy' },
  { stage: 'EXECUTE', active: 39, automation: 'Autonomous', status: 'Active' },
  { stage: 'VERIFY', active: 39, automation: 'Full', status: 'Healthy' },
  { stage: 'LEARN', active: 142, automation: 'Continuous', status: 'Active' }
];

export default function ControlCenter() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState(null);
  const navigate = useNavigate();

  const fetchCasesData = async () => {
    setLoading(true);
    try {
      const res = await getCases();
      if (res.data.success) {
        setCases(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCasesData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveAction(id);
      setActionNotice('✅ Manual approval granted & recovery action executed!');
      fetchCasesData();
    } catch (e) {
      setActionNotice('❌ Approval execution failed.');
    }
  };

  const handleStop = async (id) => {
    try {
      await stopRecovery(id);
      setActionNotice('🛑 Case stopped by operator.');
      fetchCasesData();
    } catch (e) {
      console.error(e);
    }
  };

  const manualReviewQueue = cases.filter(c => c.status === 'ESCALATED' || (c.revenueEvent && c.revenueEvent.amount > 10000 && c.status !== 'RECOVERED' && c.status !== 'STOPPED'));

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-tight flex items-center space-x-2">
            <SlidersHorizontal className="w-6 h-6 text-amber-400" />
            <span>RECOVERY CONTROL CENTER</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">Operational pipeline control & manual approval governance layer</p>
        </div>

        <button
          onClick={fetchCasesData}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs border border-gray-700 transition font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Workflows</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 animate-fade-in font-mono">
          {actionNotice}
        </div>
      )}

      {/* 8-Stage Operational Pipeline Grid */}
      <div className="surface-level-2 p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-heading">AUTONOMOUS PIPELINE PIPELINE STATUS</h3>
          <span className="text-xs text-gray-400 font-mono">8 Lifecycle Stages Active</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          {PIPELINE_STAGES.map((s) => (
            <div key={s.stage} className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{s.stage}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  s.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {s.status}
                </span>
              </div>
              <div className="text-[11px] text-gray-400 flex items-center justify-between">
                <span>Active: <strong className="text-indigo-400">{s.active}</strong></span>
                <span>Mode: <strong className="text-cyan-400">{s.automation}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Approval Queue */}
      <div className="surface-level-3 p-6 rounded-2xl border border-amber-500/40 space-y-4 glow-indigo">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white font-heading">MANUAL APPROVAL QUEUE</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-semibold">
              {manualReviewQueue.length} Flagged Cases
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono">Amounts &gt; ₹10,000 requiring human merchant sign-off</p>
        </div>

        {manualReviewQueue.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-xs font-mono">
            No cases currently awaiting manual sign-off.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 uppercase font-mono">
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Root Cause</th>
                  <th className="py-2.5 px-3">Recommended Strategy</th>
                  <th className="py-2.5 px-3">ENRS Score</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {manualReviewQueue.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-800/40">
                    <td className="py-3 px-3 font-semibold text-indigo-400">RV-{c.id?.substring(0, 8)}</td>
                    <td className="py-3 px-3 font-bold font-heading text-white text-sm">₹{c.revenueEvent?.amount?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-amber-400 font-sans font-medium">{c.rootCause || 'INVOICE_OVERDUE'}</td>
                    <td className="py-3 px-3 text-cyan-400 font-semibold">{c.selectedStrategy || 'PAYMENT_LINK'}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold font-heading text-sm">₹{c.expectedNetRecoveryScore || 8500}</td>
                    <td className="py-3 px-3 text-right space-x-2 font-sans">
                      <button
                        onClick={() => handleApprove(c.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition text-xs shadow-md shadow-emerald-600/30"
                      >
                        Approve & Execute
                      </button>
                      <button
                        onClick={() => handleStop(c.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition text-xs font-semibold"
                      >
                        Stop
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
