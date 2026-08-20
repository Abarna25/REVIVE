import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getCases, getCaseById, simulateTwin, executeAction, stopRecovery } from '../services/api';
import TwinVisualizer from '../components/TwinVisualizer';
import StrategyMatrix from '../components/StrategyMatrix';
import SafetyCheckBadge from '../components/SafetyCheckBadge';
import DecisionReceiptModal from '../components/DecisionReceiptModal';
import GracefulFailureNotice from '../components/GracefulFailureNotice';
import { GitFork, Play, ShieldAlert, AlertTriangle, Receipt, RefreshCw, CheckCircle, StopCircle } from 'lucide-react';

export default function RecoveryTwinLab() {
  const [searchParams] = useSearchParams();
  const caseIdParam = searchParams.get('caseId');
  const navigate = useNavigate();

  const [allCases, setAllCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(caseIdParam || '');
  const [currentCase, setCurrentCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  const fetchCasesList = async () => {
    try {
      const res = await getCases();
      if (res.data.success) {
        setAllCases(res.data.data);
        if (!selectedCaseId && res.data.data.length > 0) {
          setSelectedCaseId(res.data.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadCaseDetails = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getCaseById(id);
      if (res.data.success) {
        setCurrentCase(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCasesList();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      loadCaseDetails(selectedCaseId);
    }
  }, [selectedCaseId]);

  const handleSimulateTwin = async () => {
    if (!selectedCaseId) return;
    setSimulating(true);
    try {
      const res = await simulateTwin(selectedCaseId);
      if (res.data.success) {
        await loadCaseDetails(selectedCaseId);
        setActionNotice({ type: 'success', text: '✅ Revenue Rescue Twin simulated successfully across 7 candidate pathways!' });
      }
    } catch (e) {
      setActionNotice({ type: 'error', text: '❌ Simulation failed.' });
    } finally {
      setSimulating(false);
    }
  };

  const handleExecuteAction = async (isFailDemo = false) => {
    if (!selectedCaseId) return;
    setExecuting(true);
    setActionNotice(null);

    const idempotencyKey = isFailDemo ? `FAIL_DEMO_${selectedCaseId}_${Date.now()}` : `idemp_${selectedCaseId}_${Date.now()}`;

    try {
      const res = await executeAction(selectedCaseId, idempotencyKey);
      if (res.data.success) {
        await loadCaseDetails(selectedCaseId);
        if (res.data.handledGracefully) {
          setActionNotice({ type: 'graceful_failure', text: res.data.message });
        } else {
          setActionNotice({ type: 'success', text: `✅ Recovery Action executed successfully! Revenue recovered.` });
        }
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData && errData.error && errData.error.code === 'SAFETY_GATE_BLOCKED') {
        setActionNotice({ type: 'error', text: `🛡️ Safety Gate Blocked: ${errData.error.message}` });
      } else {
        setActionNotice({ type: 'error', text: '❌ Action execution failed.' });
      }
    } finally {
      setExecuting(false);
    }
  };

  const handleStopRecovery = async () => {
    if (!selectedCaseId) return;
    try {
      await stopRecovery(selectedCaseId);
      await loadCaseDetails(selectedCaseId);
      setActionNotice({ type: 'stopped', text: '🛑 Recovery workflow stopped by operator.' });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Title & Case Picker Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <GitFork className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white font-heading tracking-tight">Recovery Twin Lab</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-sm">
              REVIVE Innovation Signature
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Simulate revenue pathways, compute ENRS, and execute safe bounded interventions</p>
        </div>

        {/* Selector */}
        <div className="flex items-center space-x-3">
          <label className="text-xs text-gray-400 font-mono">Select Case:</label>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="bg-gray-900 border border-indigo-500/30 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold text-white focus:outline-none focus:border-indigo-500"
          >
            {allCases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} • {c.revenueEvent?.eventType || 'PAYMENT_FAILED'} (₹{c.revenueEvent?.amount?.toLocaleString() || 5000})
              </option>
            ))}
          </select>
        </div>
      </div>

      {actionNotice && (
        <div className={`p-4 rounded-xl text-xs font-medium border animate-fade-in ${
          actionNotice.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
          actionNotice.type === 'graceful_failure' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
          'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {actionNotice.text}
        </div>
      )}

      {loading || !currentCase ? (
        <div className="p-12 text-center text-gray-400 space-y-3 glass-panel rounded-2xl">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs font-mono">Instantiating Revenue Rescue Twin Digital Sandbox...</p>
        </div>
      ) : (
        <>
          {/* Rescue Twin Node Graph */}
          <TwinVisualizer
            rescueTwin={currentCase.rescueTwin}
            simulations={currentCase.strategySimulations}
            selectedStrategy={currentCase.selectedStrategy}
          />

          {/* Controls Bar */}
          <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSimulateTwin}
                disabled={simulating}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-cyan-400 font-semibold text-xs border border-cyan-500/30 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
                <span>{simulating ? 'Simulating Pathways...' : 'Re-Run Multi-Path Simulation'}</span>
              </button>

              <button
                onClick={() => handleExecuteAction(false)}
                disabled={executing || currentCase.status === 'RECOVERED'}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{executing ? 'Executing Action...' : 'Execute Optimal Safe Strategy'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {/* Mandatory Demo Graceful Failure Trigger */}
              <button
                onClick={() => handleExecuteAction(true)}
                disabled={executing}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/40 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Graceful Failure Demo</span>
              </button>

              <button
                onClick={() => setShowReceipt(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>View Decision Receipt</span>
              </button>

              <button
                onClick={handleStopRecovery}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                title="Stop Intervention"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Safety & Strategy Matrix Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <StrategyMatrix
                simulations={currentCase.strategySimulations}
                selectedStrategy={currentCase.selectedStrategy}
              />
            </div>

            <div className="space-y-6">
              <SafetyCheckBadge
                gates={currentCase.safetyGates}
                requiresManualApproval={currentCase.revenueEvent?.amount > 10000}
                isBlocked={currentCase.status === 'STOPPED'}
              />
            </div>
          </div>
        </>
      )}

      {/* Decision Receipt Modal */}
      {showReceipt && (
        <DecisionReceiptModal caseData={currentCase} onClose={() => setShowReceipt(false)} />
      )}
    </div>
  );
}
