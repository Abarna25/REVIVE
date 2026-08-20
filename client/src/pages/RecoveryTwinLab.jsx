import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getCases, getCaseById, simulateTwin, executeAction, confirmPayment, stopRecovery } from '../services/api';
import TwinVisualizer from '../components/TwinVisualizer';
import StrategyMatrix from '../components/StrategyMatrix';
import ExplainabilityEngine from '../components/ExplainabilityEngine';
import FatigueGuardVisual from '../components/FatigueGuardVisual';
import StagedSimulationLoader from '../components/StagedSimulationLoader';
import DecisionReceiptModal from '../components/DecisionReceiptModal';
import { GitFork, Play, AlertTriangle, Receipt, RefreshCw, StopCircle, CheckCircle2, Clock } from 'lucide-react';

export default function RecoveryTwinLab() {
  const [searchParams] = useSearchParams();
  const caseIdParam = searchParams.get('caseId');
  const navigate = useNavigate();

  const [allCases, setAllCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(caseIdParam || '');
  const [currentCase, setCurrentCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [showStagedLoader, setShowStagedLoader] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [confirming, setConfirming] = useState(false);
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
    setShowStagedLoader(true);
  };

  const handleSimulationLoaderComplete = async () => {
    try {
      const res = await simulateTwin(selectedCaseId);
      if (res.data.success) {
        await loadCaseDetails(selectedCaseId);
        setActionNotice({ type: 'success', text: '✅ WINNING STRATEGY IDENTIFIED across 7 simulated pathways!' });
      }
    } catch (e) {
      setActionNotice({ type: 'error', text: '❌ Simulation failed.' });
    } finally {
      setShowStagedLoader(false);
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
          setActionNotice({ type: 'awaiting', text: `⌛ Payment intervention initialized! Moved to AWAITING_PAYMENT_CONFIRMATION.` });
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

  const handleConfirmPayment = async () => {
    if (!selectedCaseId) return;
    setConfirming(true);
    setActionNotice(null);
    try {
      const res = await confirmPayment(selectedCaseId, `PAY-REF-${Date.now().toString().substring(5)}`, 'CONFIRMED');
      if (res.data.success) {
        await loadCaseDetails(selectedCaseId);
        setActionNotice({ type: 'success', text: `✅ SIMULATED PAYMENT CONFIRMED! Revenue recovered & net value saved calculated.` });
      }
    } catch (e) {
      setActionNotice({ type: 'error', text: '❌ Payment confirmation failed.' });
    } finally {
      setConfirming(false);
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
      {/* Title Header & Case Picker */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <GitFork className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-heading tracking-tight">RECOVERY TWIN LAB</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-sm font-mono">
              ✦ REVIVE SIGNATURE INNOVATION
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1 font-mono">Simulate recovery futures before taking action.</p>
        </div>

        {/* Case Selector */}
        <div className="flex items-center space-x-3">
          <label className="text-xs text-gray-400 font-mono">Select Case:</label>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="bg-gray-900 border border-violet-500/40 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold text-white focus:outline-none focus:border-violet-500"
          >
            {allCases.map((c) => (
              <option key={c.id} value={c.id}>
                #RV-{c.id?.substring(0, 6)} • {c.revenueEvent?.eventType || 'PAYMENT_FAILED'} (₹{c.revenueEvent?.amount?.toLocaleString() || 5000})
              </option>
            ))}
          </select>
        </div>
      </div>

      {actionNotice && (
        <div className={`p-4 rounded-xl text-xs font-semibold border animate-fade-in ${
          actionNotice.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
          actionNotice.type === 'awaiting' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' :
          actionNotice.type === 'graceful_failure' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
          'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {actionNotice.text}
        </div>
      )}

      {/* Payment Confirmation Banner when case is AWAITING_PAYMENT_CONFIRMATION */}
      {currentCase && currentCase.status === 'AWAITING_PAYMENT_CONFIRMATION' && (
        <div className="surface-level-3 p-5 rounded-2xl border border-cyan-500/40 flex items-center justify-between glow-indigo animate-pulse">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-cyan-400" />
            <div>
              <h4 className="text-sm font-bold text-white font-heading">PAYMENT INTERVENTION INITIALIZED — AWAITING CONFIRMATION</h4>
              <p className="text-xs text-cyan-200/80 font-mono mt-0.5">
                Financial Accuracy Principle: Payment link created. Revenue is NOT counted until payment confirmation is received.
              </p>
            </div>
          </div>

          <button
            onClick={handleConfirmPayment}
            disabled={confirming}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-500 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-cyan-500/30 transition transform hover:scale-[1.02] shrink-0 font-mono"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{confirming ? 'Confirming Payment...' : 'Confirm Simulated Payment'}</span>
          </button>
        </div>
      )}

      {/* Staged Intelligence Simulation Loading Modal */}
      {showStagedLoader && (
        <StagedSimulationLoader onComplete={handleSimulationLoaderComplete} />
      )}

      {loading || !currentCase ? (
        <div className="p-12 text-center text-gray-400 space-y-3 surface-level-2 rounded-2xl">
          <RefreshCw className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
          <p className="text-xs font-mono">Initializing Recovery Digital Twin Sandbox...</p>
        </div>
      ) : (
        <>
          {/* Digital Twin Interactive Canvas */}
          <TwinVisualizer
            rescueTwin={currentCase.rescueTwin}
            simulations={currentCase.strategySimulations}
            selectedStrategy={currentCase.selectedStrategy}
          />

          {/* Execution Controls Bar */}
          <div className="surface-level-2 p-5 rounded-2xl border border-gray-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSimulateTwin}
                disabled={simulating}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-cyan-400 font-semibold text-xs border border-cyan-500/30 transition disabled:opacity-50 font-mono"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
                <span>{simulating ? 'Simulating Pathways...' : 'Re-Run Multi-Path Simulation'}</span>
              </button>

              <button
                onClick={() => handleExecuteAction(false)}
                disabled={executing || currentCase.status === 'RECOVERED'}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 font-mono"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{executing ? 'Executing Action...' : 'EXECUTE INTERVENTION'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {/* Mandatory Demo Graceful Failure Button */}
              <button
                onClick={() => handleExecuteAction(true)}
                disabled={executing}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/40 transition font-mono"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Graceful Failure Demo</span>
              </button>

              <button
                onClick={() => setShowReceipt(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition font-mono"
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

          {/* Explainability Engine & Safety Shield Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ExplainabilityEngine
                selectedStrategy={currentCase.selectedStrategy}
                simulations={currentCase.strategySimulations}
              />

              <StrategyMatrix
                simulations={currentCase.strategySimulations}
                selectedStrategy={currentCase.selectedStrategy}
              />
            </div>

            <div className="space-y-6">
              <FatigueGuardVisual
                fatigueScore={currentCase.rescueTwin?.recoveryFatigueScore || 0.22}
                isBlocked={currentCase.status === 'STOPPED'}
                blockReason="Safety threshold reached for repeated retry interventions."
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
