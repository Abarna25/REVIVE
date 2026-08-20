import React, { useEffect, useState } from 'react';
import { getBatchPerformance } from '../services/api';
import StatCard from '../components/StatCard';
import RecoveryFunnel from '../components/RecoveryFunnel';
import { BarChart3, TrendingUp, DollarSign, ShieldCheck, AlertOctagon, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function BatchAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const res = await getBatchPerformance();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-gray-400 space-y-3 surface-level-2 rounded-2xl">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
        <p className="text-xs font-mono">Computing Batch Intelligence Telemetry across 100+ Events...</p>
      </div>
    );
  }

  const { batchMetrics, eventTypePerformance, strategyPerformance } = data;

  const eventTypeChartData = Object.keys(eventTypePerformance).map(key => ({
    name: key,
    atRisk: eventTypePerformance[key].atRisk,
    recovered: eventTypePerformance[key].recovered
  }));

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <span>BATCH PERFORMANCE ANALYTICS (100+ EVENTS)</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">Empirical performance metrics across synthetic event cohort</p>
        </div>

        <button
          onClick={fetchPerformanceData}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs border border-gray-700 transition font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-calculate Batch</span>
        </button>
      </div>

      {/* Hero KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL EVALUATED EVENTS"
          value={batchMetrics.totalEvents}
          subtitle="100+ Synthetic Events Seeded"
          icon={BarChart3}
          color="indigo"
          level={2}
        />
        <StatCard
          title="COHORT RECOVERY RATE"
          value={`${batchMetrics.overallRecoveryRate}%`}
          subtitle={`${batchMetrics.totalRecoveredCases} Cases Recovered`}
          icon={TrendingUp}
          color="emerald"
          level={3}
        />
        <StatCard
          title="NET REVENUE SAVED"
          value={`₹${(batchMetrics.netRevenueSaved / 100000).toFixed(1)}L`}
          subtitle="Net Saved = Recovered − Costs"
          icon={DollarSign}
          color="cyan"
          level={3}
        />
        <StatCard
          title="GRACEFUL FAILURES"
          value={batchMetrics.totalGracefulFailures}
          subtitle="0 Duplicate Charges Logged"
          icon={AlertOctagon}
          color="amber"
          level={2}
        />
      </div>

      {/* Signature Component: Recovery Funnel */}
      <RecoveryFunnel metrics={batchMetrics} />

      {/* Bar Chart: Performance by Event Type */}
      <div className="surface-level-2 p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-heading">Recovery Performance by Scenario</h3>
            <p className="text-xs text-gray-400 font-mono">At-Risk Revenue vs Recovered Revenue per Event Type</p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span>At Risk</span>
            </span>
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Recovered</span>
            </span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eventTypeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={10} />
              <YAxis stroke="#6B7280" fontSize={11} />
              <Tooltip contentStyle={{ background: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="atRisk" fill="#6366F1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recovered" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
