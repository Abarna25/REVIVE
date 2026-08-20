import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, ingestEvent } from '../services/api';
import { Radar, Filter, Search, PlusCircle, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

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
        { eventType: 'PAYMENT_FAILED', amount: 8500, failureReason: 'INSUFFICIENT_FUNDS', customerName: 'Rohan Mehta' },
        { eventType: 'CHECKOUT_ABANDONED', amount: 14200, failureReason: 'CHECKOUT_DROPOFF', customerName: 'Kavya Nair' },
        { eventType: 'INVOICE_OVERDUE', amount: 35000, failureReason: 'INVOICE_OVERDUE', customerName: 'Zenith Retail Pvt Ltd' },
        { eventType: 'PAYMENT_FAILED', amount: 4200, failureReason: 'CARD_EXPIRED', customerName: 'Priya Patel' }
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
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Page Title & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-tight flex items-center space-x-2">
            <Radar className="w-6 h-6 text-cyan-400" />
            <span>Revenue Radar</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Real-time detection stream of at-risk revenue events</p>
        </div>

        <button
          onClick={handleSimulateIngest}
          disabled={ingesting}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{ingesting ? 'Ingesting & Instantiating Twin...' : 'Ingest Sample Revenue Event'}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by event ID, customer name, or failure code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-white placeholder-gray-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-gray-200 focus:outline-none"
          >
            <option value="ALL">All Event Types</option>
            <option value="PAYMENT_FAILED">PAYMENT_FAILED</option>
            <option value="CHECKOUT_ABANDONED">CHECKOUT_ABANDONED</option>
            <option value="INVOICE_OVERDUE">INVOICE_OVERDUE</option>
            <option value="SUBSCRIPTION_FAILED">SUBSCRIPTION_FAILED</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-gray-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNRESOLVED">UNRESOLVED</option>
            <option value="IN_RECOVERY">IN_RECOVERY</option>
            <option value="RECOVERED">RECOVERED</option>
            <option value="STOPPED">STOPPED</option>
            <option value="ESCALATED">ESCALATED</option>
          </select>
        </div>
      </div>

      {/* Main Events Table */}
      <div className="glass-panel rounded-2xl border border-gray-800 p-6 space-y-4">
        {loading ? (
          <div className="p-8 text-center text-gray-400 space-y-2">
            <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs">Scanning Revenue Radar Data Stream...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs font-mono">
            No matching revenue events found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-3">Event ID</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Occurred At</th>
                  <th className="py-3 px-3">Failure Reason</th>
                  <th className="py-3 px-3">Radar Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredEvents.map((evt) => {
                  let meta = {};
                  try {
                    meta = typeof evt.rawMetadata === 'string' ? JSON.parse(evt.rawMetadata) : (evt.rawMetadata || {});
                  } catch (e) {}

                  return (
                    <tr key={evt.id} className="hover:bg-gray-800/40 transition">
                      <td className="py-3 px-3 font-mono font-semibold text-indigo-400">{evt.id}</td>
                      <td className="py-3 px-3 text-gray-300 font-semibold">{evt.eventType}</td>
                      <td className="py-3 px-3 font-bold font-heading text-white">₹{evt.amount?.toLocaleString()}</td>
                      <td className="py-3 px-3 text-gray-400 font-mono text-[11px]">
                        {new Date(evt.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 text-amber-400 font-medium">{meta.failureReason || 'INSUFFICIENT_FUNDS'}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          evt.status === 'RECOVERED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => navigate(`/twin-lab?eventId=${evt.id}`)}
                          className="px-3 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition text-[11px] font-semibold flex items-center space-x-1 ml-auto"
                        >
                          <span>Launch Twin</span>
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
