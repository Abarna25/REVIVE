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
  Zap,
  ChevronRight
} from 'lucide-react';

const NAV_GROUPS = [
  {
    group: 'COMMAND',
    items: [
      { name: 'Overview', path: '/', icon: LayoutDashboard },
      { name: 'Revenue Radar', path: '/revenue-radar', icon: Radar }
    ]
  },
  {
    group: 'INTELLIGENCE',
    items: [
      { 
        name: 'Recovery Twin Lab', 
        path: '/twin-lab', 
        icon: GitFork, 
        badge: '✦ Signature',
        tagline: 'Simulate before you act'
      },
      { name: 'Decision Intelligence', path: '/receipt', icon: Receipt }
    ]
  },
  {
    group: 'GOVERNANCE',
    items: [
      { name: 'Control Center', path: '/control-center', icon: SlidersHorizontal },
      { name: 'Audit Trail', path: '/audit', icon: History }
    ]
  },
  {
    group: 'INSIGHTS',
    items: [
      { name: 'Analytics', path: '/analytics', icon: BarChart3 }
    ]
  },
  {
    group: 'SYSTEM',
    items: [
      { name: 'Settings & Safety', path: '/settings', icon: ShieldCheck }
    ]
  }
];

export default function Sidebar() {
  return (
    <aside className="w-64 surface-level-2 border-r border-gray-800 flex flex-col justify-between h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-[#080D18] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white font-heading">
                REVIVE<span className="text-xs text-indigo-400 font-semibold align-top ml-0.5">™</span>
              </h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Revenue Recovery Engine</p>
            </div>
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {NAV_GROUPS.map((group) => (
            <div key={group.group} className="space-y-1">
              <span className="px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 block">
                {group.group}
              </span>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isSignature = item.path === '/twin-lab';

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex flex-col px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative ${
                        isActive
                          ? 'surface-level-3 text-white border border-indigo-500/40 shadow-lg shadow-indigo-500/20'
                          : isSignature
                          ? 'bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 hover:bg-indigo-900/40 hover:border-indigo-500/40'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Icon className={`w-4 h-4 transition ${isActive ? 'text-cyan-400' : isSignature ? 'text-indigo-400' : 'text-gray-400 group-hover:text-gray-200'}`} />
                            <span className="text-xs font-semibold">{item.name}</span>
                          </div>

                          {item.badge && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-sm font-mono">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        {item.tagline && (
                          <span className="text-[10px] text-indigo-300/80 font-mono mt-0.5 ml-7">
                            {item.tagline}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Status Footer */}
      <div className="p-4 m-3 rounded-xl bg-gray-900/80 border border-gray-800 text-xs text-gray-400 font-mono space-y-1">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>RAZORPAY TEST MODE</span>
        </div>
        <p className="text-[10px] text-gray-500">Fatigue Guard™ Active</p>
      </div>
    </aside>
  );
}
