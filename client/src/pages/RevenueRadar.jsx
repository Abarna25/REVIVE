import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, ingestEvent } from '../services/api';
import ThreatRadarVisual from '../components/ThreatRadarVisual';
import { Radar, Filter, Search, PlusCircle, ArrowRight, RefreshCw } from 'lucide-react';

export default function RevenueRadar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ingesting, setIngesting] = useState(false);
  const navigate = useNavigate();

  const fetchEventsData = async () => {
    setLoading(true);
    try {
      const res = await getEvents();
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
  }, []);

  const handleSimulateIngest = async () => {
    setIngesting(true);
    try {
      const sampleEvents = [
        { eventType: 'PAYMENT_FAILED', amount: 50000, failureReason: 'INSUFFICIENT_FUNDS', customerName: 'Aarav Sharma' },
        { eventType: 'CHECKOUT_ABANDONED', amount: 24000, failureReason: 'CHECKOUT_DROPOFF', customerName: 'Kavya Nair' },
        { eventType: 'INVOICE_OVERDUE', amount: 35000, failureReason: 'INVOICE_OVERDUE', customerName: 'Zenith Retail Pvt Ltd' },
        { eventType: 'PAYMENT_FAILED', amount: 18000, failureReason: 'CARD_EXPIRED', customerName: 'Priya Patel' }
      ];

      const chosen = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];

      const res = await ingestEvent({
        merchantId: 'merchant-default-001',
        eventType: chosen.eventType,
        amount: chosen.amount,
        currency: 'INR',
        metadata: {
          customerName: chosen.customerName,
          failureReason: chosen.failureReason,
          customerEmail: `${chosen.customerName.toLowerCase().replace(/\s+/g, '')}@example.com`
        }
      });

      if (res.data.success) {
        await fetchEventsData();
        const caseId = res.data.data.recoveryCase.id;
        navigate(`/twin-lab?caseId=${caseId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIngesting(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (e.rawMetadata && e.rawMetadata.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'ALL' || e.eventType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12 animate-fade-in transition-colors duration-200">
      {/* Page Title & Ingest Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading tracking-tight flex items-center space-x-2">
            <Radar className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>REVENUE THREAT RADAR</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-mono">Spatial visual threat detection & target resolution stream</p>
        </div>

        <button
          onClick={handleSimulateIngest}
          disabled={ingesting}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition disabled:opacity-50 font-mono"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{ingesting ? 'Ingesting Threat...' : 'Ingest Sample Revenue Threat'}</span>
        </button>
      </div>

      {/* Hero Visual Threat Radar Canvas */}
      <ThreatRadarVisual events={events} />

      {/* Filter & Search Bar */}
      <div className="surface-level-2 p-4 rounded-2xl border border-slate-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search radar targets by case ID, customer name, or failure code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none w-full font-mono"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <Filter className="w-4 h-4 text-slate-400 dark:text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-gray-200 focus:outline-none"
          >
            <option value="ALL">All Event Scenarios</option>
            <option value="PAYMENT_FAILED">PAYMENT_FAILED</option>
            <option value="CHECKOUT_ABANDONED">CHECKOUT_ABANDONED</option>
            <option value="INVOICE_OVERDUE">INVOICE_OVERDUE</option>
            <option value="SUBSCRIPTION_FAILED">SUBSCRIPTION_FAILED</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-gray-200 focus:outline-none"
          >
            <option value="ALL">All Radar Statuses</option>
            <option value="UNRESOLVED">UNRESOLVED</option>
            <option value="IN_RECOVERY">IN_RECOVERY</option>
            <option value="RECOVERED">RECOVERED</option>
            <option value="STOPPED">STOPPED</option>
            <option value="ESCALATED">ESCALATED</option>
          </select>
        </div>
      </div>

      {/* Operational Data Table */}
      <div className="surface-level-2 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-gray-400 space-y-2">
            <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs font-mono">Scanning Revenue Threat Stream...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-gray-500 text-xs font-mono">
            No matching revenue events detected on radar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-3">Target ID</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Revenue At Risk</th>
                  <th className="py-3 px-3">Failure Reason</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-gray-800/60 font-mono">
                {filteredEvents.map((evt) => {
                  let meta = {};
                  try {
                    meta = typeof evt.rawMetadata === 'string' ? JSON.parse(evt.rawMetadata) : (evt.rawMetadata || {});
                  } catch (e) {}

                  return (
                    <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/40 transition">
                      <td className="py-3 px-3 font-semibold text-indigo-600 dark:text-indigo-400">RV-{evt.id?.substring(0, 8)}</td>
                      <td className="py-3 px-3 text-slate-700 dark:text-gray-300 font-sans font-semibold">{evt.eventType}</td>
                      <td className="py-3 px-3 font-bold font-heading text-slate-900 dark:text-white text-sm">₹{evt.amount?.toLocaleString()}</td>
                      <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-medium font-sans">{meta.failureReason || 'INSUFFICIENT_FUNDS'}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          evt.status === 'RECOVERED' ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                        }`}>
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-sans">
                        <button
                          onClick={() => navigate(`/twin-lab?eventId=${evt.id}`)}
                          className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-600/30 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white transition text-[11px] font-semibold inline-flex items-center space-x-1"
                        >
                          <span>OPEN RECOVERY TWIN</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
