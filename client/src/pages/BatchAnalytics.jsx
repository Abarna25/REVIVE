import React, { useEffect, useState } from 'react';
import { getBatchPerformance } from '../services/api';
import StatCard from '../components/StatCard';
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
      <div className="p-12 text-center text-gray-400 space-y-3 glass-panel rounded-2xl">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
        <p className="text-xs font-mono">Computing Batch Intelligence Telemetry across 100+ Events...</p>
      </div>
    );
  }

  const { batchMetrics, eventTypePerformance, strategyPerformance } = data;

  // Chart Data format
  const eventTypeChartData = Object.keys(eventTypePerformance).map(key => ({
    name: key,
    atRisk: eventTypePerformance[key].atRisk,
    recovered: eventTypePerformance[key].recovered
  }));

  const strategyChartData = Object.keys(strategyPerformance).map(key => ({
    name: key,
    count: strategyPerformance[key].count,
    cost: strategyPerformance[key].cost,
    recovered: strategyPerformance[key].recovered
  }));

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <span>Batch Performance Analytics (100+ Events)</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Measured empirical business results across full synthetic event cohort</p>
        </div>

        <button
          onClick={fetchPerformanceData}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs border border-gray-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-calculate Batch</span>
        </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Events Evaluated"
          value={batchMetrics.totalEvents}
          subtitle="100+ Synthetic Events Seeded"
          icon={BarChart3}
          color="indigo"
        />
        <StatCard
          title="Cohort Recovery Rate"
          value={`${batchMetrics.overallRecoveryRate}%`}
          subtitle={`${batchMetrics.totalRecoveredCases} Cases Recovered`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Net Revenue Saved"
          value={`₹${batchMetrics.netRevenueSaved?.toLocaleString()}`}
          subtitle={`Net Saved = Recovered − Costs`}
          icon={DollarSign}
          color="cyan"
        />
        <StatCard
          title="Graceful Failures Handled"
          value={batchMetrics.totalGracefulFailures}
          subtitle="0 Duplicate Charges Logged"
          icon={AlertOctagon}
          color="amber"
        />
      </div>

      {/* Bar Chart 1: Performance by Event Type */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-heading">Recovery Performance by Event Scenario</h3>
            <p className="text-xs text-gray-400">At-Risk Revenue vs Recovered Revenue per Event Type</p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
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

      {/* Table: Breakdown by Strategy */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h3 className="text-base font-bold text-white font-heading">Strategy Efficiency Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 uppercase font-mono">
                <th className="py-3 px-3">Strategy Candidate</th>
                <th className="py-3 px-3">Cases Evaluated</th>
                <th className="py-3 px-3">Revenue At Risk</th>
                <th className="py-3 px-3">Total Recovered</th>
                <th className="py-3 px-3">Total Intervention Cost</th>
                <th className="py-3 px-3 text-right">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {Object.keys(strategyPerformance).map((strat) => {
                const s = strategyPerformance[strat];
                const rate = s.atRisk > 0 ? ((s.recovered / s.atRisk) * 100).toFixed(0) : 0;

                return (
                  <tr key={strat} className="hover:bg-gray-800/40">
                    <td className="py-3 px-3 font-semibold text-white font-heading">{strat}</td>
                    <td className="py-3 px-3 text-gray-300 font-mono">{s.count}</td>
                    <td className="py-3 px-3 text-gray-300 font-mono">₹{s.atRisk?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold font-heading">₹{s.recovered?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-amber-400 font-mono">₹{s.cost}</td>
                    <td className="py-3 px-3 text-right font-bold text-cyan-400 font-mono">{rate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
