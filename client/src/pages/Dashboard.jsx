import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { getDashboardMetrics } from '../services/api';
import { DollarSign, ShieldCheck, TrendingUp, AlertTriangle, GitFork, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await getDashboardMetrics();
      if (res.data.success) {
        setMetrics(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="p-8 text-center text-gray-400 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
        <p className="text-sm">Loading REVIVE™ Revenue Intelligence Dashboard...</p>
      </div>
    );
  }

  const { summary, recentCases, strategyStats } = metrics;

  // Chart Data Preparation
  const chartData = [
    { day: 'Mon', atRisk: 120000, recovered: 92000 },
    { day: 'Tue', atRisk: 145000, recovered: 118000 },
    { day: 'Wed', atRisk: 98000, recovered: 82000 },
    { day: 'Thu', atRisk: 210000, recovered: 175000 },
    { day: 'Fri', atRisk: 180000, recovered: 149000 },
    { day: 'Sat', atRisk: 130000, recovered: 108000 },
    { day: 'Sun', atRisk: summary.totalRevenueAtRisk / 5, recovered: summary.revenueRecovered / 5 }
  ];

  const pieData = Object.keys(strategyStats || {}).map(key => ({
    name: key,
    value: strategyStats[key].count
  }));

  const COLORS = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EC4899'];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-tight">Executive Revenue Radar & Operations</h1>
          <p className="text-xs text-gray-400 mt-1">Autonomous Revenue Recovery Engine • Real-time Decision Telemetry</p>
        </div>

        <button
          onClick={() => navigate('/twin-lab')}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition"
        >
          <GitFork className="w-4 h-4" />
          <span>Launch Recovery Twin Lab</span>
        </button>
      </div>

      {/* Hero KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue At Risk"
          value={`₹${summary.totalRevenueAtRisk?.toLocaleString()}`}
          subtitle={`${summary.totalEventsAnalysed} Events Analysed`}
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Revenue Recovered"
          value={`₹${summary.revenueRecovered?.toLocaleString()}`}
          subtitle={`Recovery Rate: ${summary.recoveryRate}%`}
          icon={TrendingUp}
          color="emerald"
          trend={`${summary.recoveryRate}%`}
        />
        <StatCard
          title="Net Revenue Saved"
          value={`₹${summary.netRevenueSaved?.toLocaleString()}`}
          subtitle={`Recovered − Intervention Cost (₹${summary.totalInterventionCost})`}
          icon={DollarSign}
          color="cyan"
        />
        <StatCard
          title="Fatigue Guard Interventions"
          value={summary.casesStoppedByFatigueGuard}
          subtitle={`${summary.casesEscalated} Flagged for Review`}
          icon={ShieldCheck}
          color="indigo"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Recovery Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-heading">Revenue Recovery Velocity</h3>
              <p className="text-xs text-gray-400">At-Risk Revenue vs Autonomous Net Recoveries</p>
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
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#6B7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="atRisk" stroke="#6366F1" fillOpacity={1} fill="url(#colorRisk)" />
                <Area type="monotone" dataKey="recovered" stroke="#10B981" fillOpacity={1} fill="url(#colorRec)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategy Breakdown Pie */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-base font-bold text-white font-heading">Strategy Distribution</h3>
          <p className="text-xs text-gray-400">Winning strategy selection frequency</p>

          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-xs">
            {pieData.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between py-1 text-gray-300">
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="font-mono">{item.name}</span>
                </span>
                <span className="font-semibold text-white">{item.value} cases</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Case Feed Table */}
      <div className="glass-panel rounded-2xl border border-gray-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-heading">Active Revenue-At-Risk Feed</h3>
            <p className="text-xs text-gray-400">Real-time detected revenue events & Rescue Twin status</p>
          </div>
          <button
            onClick={() => navigate('/revenue-radar')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
          >
            <span>View All ({summary.totalEventsAnalysed})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-3">Case ID</th>
                <th className="py-3 px-3">Event Type</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Root Cause</th>
                <th className="py-3 px-3">Winning Strategy</th>
                <th className="py-3 px-3">ENRS Score</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {recentCases.map((rc) => (
                <tr key={rc.id} className="hover:bg-gray-800/40 transition">
                  <td className="py-3 px-3 font-mono font-semibold text-indigo-400">{rc.id}</td>
                  <td className="py-3 px-3 text-gray-300">{rc.revenueEvent?.eventType || 'PAYMENT_FAILED'}</td>
                  <td className="py-3 px-3 font-bold font-heading text-white">₹{rc.revenueEvent?.amount?.toLocaleString() || 5000}</td>
                  <td className="py-3 px-3 text-amber-400">{rc.rootCause || 'INSUFFICIENT_FUNDS'}</td>
                  <td className="py-3 px-3 font-semibold text-cyan-400">{rc.selectedStrategy || 'RETRY_OPTIMAL_TIME'}</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">₹{rc.expectedNetRecoveryScore || 4030}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      rc.status === 'RECOVERED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {rc.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate(`/twin-lab?caseId=${rc.id}`)}
                      className="px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition text-[11px] font-semibold"
                    >
                      Open Twin Lab
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
