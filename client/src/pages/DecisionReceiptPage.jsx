import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getCases, getCaseById } from '../services/api';
import DecisionReceiptModal from '../components/DecisionReceiptModal';
import { Receipt, RefreshCw } from 'lucide-react';

export default function DecisionReceiptPage() {
  const [searchParams] = useSearchParams();
  const caseIdParam = searchParams.get('caseId');
  const navigate = useNavigate();

  const [allCases, setAllCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(caseIdParam || '');
  const [currentCase, setCurrentCase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
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
    }
    init();
  }, []);

  useEffect(() => {
    async function load() {
      if (!selectedCaseId) return;
      setLoading(true);
      try {
        const res = await getCaseById(selectedCaseId);
        if (res.data.success) {
          setCurrentCase(res.data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCaseId]);

  const handleClose = () => {
    navigate('/twin-lab');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-tight flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-indigo-400" />
            <span>Explainable Recovery Receipt™</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Audit-ready evidence record for every recovery decision</p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs text-gray-400 font-mono">Select Case:</label>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold text-white focus:outline-none"
          >
            {allCases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} • {c.revenueEvent?.eventType || 'PAYMENT_FAILED'} (₹{c.revenueEvent?.amount?.toLocaleString() || 5000})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading || !currentCase ? (
        <div className="p-12 text-center text-gray-400 space-y-3 glass-panel rounded-2xl">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs font-mono">Retrieving Decision Receipt Record...</p>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-3xl border border-indigo-500/30 space-y-6 shadow-2xl">
          <DecisionReceiptModal caseData={currentCase} onClose={handleClose} />
        </div>
      )}
    </div>
  );
}
