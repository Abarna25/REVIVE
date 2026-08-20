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

const NAV_ITEMS = [
  { name: 'Executive Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Revenue Radar', path: '/revenue-radar', icon: Radar },
  { name: 'Recovery Twin Lab', path: '/twin-lab', icon: GitFork, badge: 'Signature' },
  { name: 'Decision Receipt', path: '/receipt', icon: Receipt },
  { name: 'Control Center', path: '/control-center', icon: SlidersHorizontal },
  { name: 'Audit Trail', path: '/audit', icon: History },
  { name: 'Batch Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings & Safety', path: '/settings', icon: ShieldCheck }
];

export default function Sidebar() {
  return (
    <aside className="w-64 glass-panel border-r border-gray-800 flex flex-col justify-between h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-heading">
                REVIVE<span className="text-xs text-indigo-400 font-semibold align-top ml-0.5">™</span>
              </h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Revenue Recovery Engine</p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/30 to-indigo-900/20 text-white border border-indigo-500/30 shadow-md shadow-indigo-500/10'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-indigo-400" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 m-4 rounded-xl bg-gray-900/60 border border-gray-800/80 text-xs text-gray-400">
        <div className="flex items-center space-x-2 text-emerald-400 font-medium mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Razorpay Test Mode Active</span>
        </div>
        <p className="text-[11px] text-gray-500">Autonomous Safety Gates Engaged</p>
      </div>
    </aside>
  );
}
