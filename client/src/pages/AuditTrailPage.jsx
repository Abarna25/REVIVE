import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../services/api';
import AuditTimeline from '../components/AuditTimeline';
import { History, Search, Filter, RefreshCw } from 'lucide-react';

export default function AuditTrailPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actorFilter, setActorFilter] = useState('ALL');

  const fetchLogsData = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs();
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.recoveryCaseId && log.recoveryCaseId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesActor = actorFilter === 'ALL' || log.actorType === actorFilter;
    return matchesSearch && matchesActor;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-tight flex items-center space-x-2">
            <History className="w-6 h-6 text-indigo-400" />
            <span>Immutable Decision Audit Trail</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Append-only audit log tracking every detection, twin simulation, gate, and recovery action</p>
        </div>

        <button
          onClick={fetchLogsData}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs border border-gray-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter audit logs by case ID, keyword, or event type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-white placeholder-gray-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-gray-200 focus:outline-none"
          >
            <option value="ALL">All Actors</option>
            <option value="AI_ENGINE">AI_ENGINE</option>
            <option value="SAFETY_ENGINE">SAFETY_ENGINE</option>
            <option value="PAYMENT_PROVIDER">PAYMENT_PROVIDER</option>
            <option value="USER">USER</option>
            <option value="SYSTEM">SYSTEM</option>
          </select>
        </div>
      </div>

      {/* Audit Timeline Component */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 space-y-3 glass-panel rounded-2xl">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs font-mono">Loading Immutable Audit Logs...</p>
        </div>
      ) : (
        <AuditTimeline logs={filteredLogs} />
      )}
    </div>
  );
}
