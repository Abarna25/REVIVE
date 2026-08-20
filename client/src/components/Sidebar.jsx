import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Radar, 
  GitFork, 
  Receipt, 
  SlidersHorizontal, 
  History, 
  BarChart3, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';

const NAV_GROUPS = [
  {
    title: 'COMMAND',
    items: [
      { name: 'Command Center', path: '/', icon: LayoutDashboard },
      { name: 'Revenue Threat Radar', path: '/revenue-radar', icon: Radar }
    ]
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { name: 'Recovery Twin Lab', path: '/twin-lab', icon: GitFork, isSignature: true },
      { name: 'Decision Receipt', path: '/receipt', icon: Receipt }
    ]
  },
  {
    title: 'GOVERNANCE',
    items: [
      { name: 'Control Center', path: '/control-center', icon: SlidersHorizontal },
      { name: 'Audit Trail', path: '/audit', icon: History }
    ]
  },
  {
    title: 'INSIGHTS & SYSTEM',
    items: [
      { name: 'Batch Analytics', path: '/analytics', icon: BarChart3 },
      { name: 'Safety Gates', path: '/settings', icon: ShieldCheck }
    ]
  }
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-[#0D1324] border-r border-slate-200 dark:border-gray-800 flex flex-col justify-between h-screen sticky top-0 z-30 transition-colors duration-200 shadow-sm dark:shadow-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center border-b border-slate-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-white dark:bg-[#080D18] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white font-heading">REVIVE</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 font-mono">
                  v1.4
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono font-medium tracking-wide">Autonomous Revenue Engine</p>
            </div>
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 font-mono">
                {group.title}
              </span>
              <div className="space-y-1 mt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? item.isSignature
                              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25'
                              : 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 shadow-sm'
                            : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800/60 hover:text-slate-900 dark:hover:text-white'
                        }`
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      {item.isSignature && (
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer System Status Badge */}
      <div className="p-4 border-t border-slate-200 dark:border-gray-800">
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-mono text-slate-500 dark:text-gray-400 font-semibold">Engine Status</span>
            <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Active</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">Safety Policy Safeguard v2.0</p>
        </div>
      </div>
    </aside>
  );
}
