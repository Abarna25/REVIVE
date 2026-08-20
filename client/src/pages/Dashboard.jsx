import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import IntelligenceLifecycle from '../components/IntelligenceLifecycle';
import SystemPulseCard from '../components/SystemPulseCard';
import { getDashboardMetrics } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { DollarSign, ShieldCheck, TrendingUp, AlertTriangle, GitFork, ArrowRight, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
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
      <div className="p-12 text-center text-slate-500 dark:text-gray-400 space-y-3 surface-level-2 rounded-2xl">
        <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
        <p className="text-xs font-mono">Initializing REVIVE™ Command Center Operational Telemetry...</p>
      </div>
    );
  }

  const { summary, recentCases } = metrics;

  const chartData = [
    { day: 'Mon', atRisk: 120000, recovered: 92000 },
    { day: 'Tue', atRisk: 145000, recovered: 118000 },
    { day: 'Wed', atRisk: 98000, recovered: 82000 },
    { day: 'Thu', atRisk: 210000, recovered: 175000 },
    { day: 'Fri', atRisk: 180000, recovered: 149000 },
    { day: 'Sat', atRisk: 130000, recovered: 108000 },
    { day: 'Sun', atRisk: summary.totalRevenueAtRisk / 5, recovered: summary.revenueRecovered / 5 }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12 transition-colors duration-200">
      {/* Page Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">REVIVE COMMAND CENTER</h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-mono">Autonomous recovery intelligence for every revenue event.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/twin-lab')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:opacity-95 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition transform hover:scale-[1.02]"
          >
            <GitFork className="w-4 h-4" />
            <span>Launch Recovery Twin</span>
          </button>
        </div>
      </div>

      {/* Hero KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="REVENUE AT RISK"
          value={`₹${(summary.totalRevenueAtRisk / 100000).toFixed(1)}L`}
          subtitle={`${summary.totalEventsAnalysed} Events Monitored`}
          icon={AlertTriangle}
          color="amber"
          level={2}
        />
        <StatCard
          title="RECOVERY RATE"
          value={`${summary.recoveryRate}%`}
          subtitle="78.6% Target Cohort Rate"
          icon={TrendingUp}
          color="emerald"
          trend={`${summary.recoveryRate}%`}
          level={3}
        />
        <StatCard
          title="NET VALUE SAVED"
          value={`₹${(summary.netRevenueSaved / 100000).toFixed(1)}L`}
          subtitle={`Recovered − Cost (₹${summary.totalInterventionCost})`}
          icon={DollarSign}
          color="cyan"
          level={3}
        />
        <StatCard
          title="ACTIVE RECOVERY CASES"
          value={summary.casesStoppedByFatigueGuard + 14}
          subtitle={`${summary.casesStoppedByFatigueGuard} Stopped by Fatigue Guard`}
          icon={ShieldCheck}
          color="indigo"
          level={2}
        />
      </div>

      {/* Signature Design Element: Intelligence Lifecycle Flow */}
      <IntelligenceLifecycle activeStage="SIMULATE" />

      {/* Main Command Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Pulse Panel */}
        <SystemPulseCard summary={summary} />

        {/* Main Revenue Velocity Chart */}
        <div className="lg:col-span-2 surface-level-2 p-6 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">REVENUE RECOVERY VELOCITY</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">At-Risk Revenue vs Net Autonomous Recoveries</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500"></span>
                <span>At Risk</span>
              </span>
              <span className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-500"></span>
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
                <XAxis dataKey="day" stroke={isDark ? '#6B7280' : '#94A3B8'} fontSize={11} tickLine={false} />
                <YAxis stroke={isDark ? '#6B7280' : '#94A3B8'} fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: isDark ? '#111827' : '#FFFFFF',
                    borderColor: isDark ? '#374151' : '#E2E8F0',
                    color: isDark ? '#F9FAFB' : '#0F172A',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
                <Area type="monotone" dataKey="atRisk" stroke="#6366F1" fillOpacity={1} fill="url(#colorRisk)" />
                <Area type="monotone" dataKey="recovered" stroke="#10B981" fillOpacity={1} fill="url(#colorRec)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Revenue Threat Feed */}
      <div className="surface-level-2 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">LIVE REVENUE THREAT FEED</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">Priority-ranked active revenue threats requiring twin intervention</p>
          </div>
          <button
            onClick={() => navigate('/revenue-radar')}
            className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold flex items-center space-x-1 font-mono"
          >
            <span>View All ({summary.totalEventsAnalysed})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentCases.slice(0, 3).map((rc) => {
            const amount = rc.revenueEvent?.amount || 5000;
            const isCritical = amount >= 25000;

            return (
              <div
                key={rc.id}
                className={`p-4 rounded-xl border space-y-3 transition duration-200 ${
                  isCritical
                    ? 'surface-level-3 border-rose-500/40 glow-indigo'
                    : 'bg-slate-50 dark:bg-gray-900/60 border-slate-200 dark:border-gray-800 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">RV-{rc.id?.substring(0, 6)}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    isCritical ? 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-500/30' : 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                  }`}>
                    {isCritical ? '🔴 CRITICAL' : '🟠 HIGH RISK'}
                  </span>
                </div>

                <div>
                  <span className="text-xl font-extrabold font-heading text-slate-900 dark:text-white">₹{amount.toLocaleString()}</span>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{rc.revenueEvent?.eventType || 'PAYMENT_FAILED'} • {rc.rootCause || 'INSUFFICIENT_FUNDS'}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold">{rc.selectedStrategy || 'RETRY_OPTIMAL_TIME'}</span>
                  <button
                    onClick={() => navigate(`/twin-lab?caseId=${rc.id}`)}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition text-xs font-semibold shadow-sm"
                  >
                    OPEN TWIN
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
