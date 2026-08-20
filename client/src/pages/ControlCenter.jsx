import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCases, approveAction, executeAction, stopRecovery } from '../services/api';
import { SlidersHorizontal, CheckCircle, AlertTriangle, Play, StopCircle, RefreshCw, ArrowRight } from 'lucide-react';

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
  const pendingQueue = cases.filter(c => c.status === 'ACTION_PENDING' || c.status === 'SIMULATION_COMPLETED' || c.status === 'DETECTED');

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-tight flex items-center space-x-2">
            <SlidersHorizontal className="w-6 h-6 text-amber-400" />
            <span>Recovery Control Center</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manage active recovery queues & approve high-value autonomous actions</p>
        </div>

        <button
          onClick={fetchCasesData}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs border border-gray-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Workflows</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 animate-fade-in">
          {actionNotice}
        </div>
      )}

      {/* Queue 1: Requires Manual Approval */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white font-heading">Manual Approval Queue</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-semibold">
              {manualReviewQueue.length} Cases Flagged
            </span>
          </div>
          <p className="text-xs text-gray-400">Cases exceeding autonomous execution cap (₹10,000 threshold)</p>
        </div>

        {manualReviewQueue.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-xs font-mono">
            No cases currently awaiting manual sign-off.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
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
                    <td className="py-3 px-3 font-mono font-semibold text-indigo-400">{c.id}</td>
                    <td className="py-3 px-3 font-bold font-heading text-white">₹{c.revenueEvent?.amount?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-amber-400">{c.rootCause || 'INVOICE_OVERDUE'}</td>
                    <td className="py-3 px-3 text-cyan-400 font-semibold">{c.selectedStrategy || 'PAYMENT_LINK'}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">₹{c.expectedNetRecoveryScore || 8500}</td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleApprove(c.id)}
                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition text-[11px]"
                      >
                        Approve & Execute
                      </button>
                      <button
                        onClick={() => handleStop(c.id)}
                        className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition text-[11px]"
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

      {/* Queue 2: Pending Workflows */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-heading">Autonomous Pending Workflows</h3>
          <span className="text-xs text-gray-400">{pendingQueue.length} Active Workflows</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 uppercase font-mono">
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {pendingQueue.slice(0, 8).map((c) => (
                <tr key={c.id} className="hover:bg-gray-800/40">
                  <td className="py-3 px-3 font-mono font-semibold text-indigo-400">{c.id}</td>
                  <td className="py-3 px-3 text-gray-300">{c.revenueEvent?.eventType || 'PAYMENT_FAILED'}</td>
                  <td className="py-3 px-3 font-bold font-heading text-white">₹{c.revenueEvent?.amount?.toLocaleString()}</td>
                  <td className="py-3 px-3 text-cyan-400 font-semibold">{c.status}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate(`/twin-lab?caseId=${c.id}`)}
                      className="px-3 py-1 rounded bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition text-[11px]"
                    >
                      Inspect Twin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
