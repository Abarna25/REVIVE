import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, ArrowRight } from 'lucide-react';

export default function ThreatRadarVisual({ events = [] }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const displayEvents = events.slice(0, 16); // Show top 16 active radar targets

  return (
    <div className="surface-level-2 p-6 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-6 relative overflow-hidden transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Radar className="w-5 h-5 text-cyan-600 dark:text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">LIVE REVENUE THREAT RADAR</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 font-semibold">
              TARGET LOCK
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-mono">Spatial evaluation of revenue-at-risk events by threat severity</p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <span className="flex items-center space-x-1.5 text-rose-600 dark:text-rose-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Critical (&gt;₹25k)</span>
          </span>
          <span className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>High Risk (&gt;₹10k)</span>
          </span>
          <span className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span>Medium (&gt;₹5k)</span>
          </span>
        </div>
      </div>

      {/* Radar Canvas with Circular Rings */}
      <div className="relative w-full h-80 rounded-2xl bg-slate-900 dark:bg-[#070B14] border border-slate-700 dark:border-gray-800/80 flex items-center justify-center overflow-hidden bg-grid-pattern shadow-inner">
        {/* Radar Rings */}
        <div className="absolute w-[280px] h-[280px] rounded-full border border-rose-500/20 bg-rose-500/5"></div>
        <div className="absolute w-[210px] h-[210px] rounded-full border border-amber-500/20 bg-amber-500/5"></div>
        <div className="absolute w-[140px] h-[140px] rounded-full border border-indigo-500/20 bg-indigo-500/5"></div>
        <div className="absolute w-[70px] h-[70px] rounded-full border border-cyan-500/20 bg-cyan-500/5"></div>

        {/* Crosshair Lines */}
        <div className="absolute w-full h-[1px] bg-slate-700/60 dark:bg-gray-800/60"></div>
        <div className="absolute h-full w-[1px] bg-slate-700/60 dark:bg-gray-800/60"></div>

        {/* Rotating Radar Sweep Beam */}
        <div 
          className="absolute w-full h-full rounded-full origin-center pointer-events-none opacity-30"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(6, 182, 212, 0.4) 360deg)',
            animation: 'spin 6s linear infinite'
          }}
        ></div>

        {/* Plotted Node Points */}
        {displayEvents.map((evt, idx) => {
          const angle = (idx * (360 / displayEvents.length)) * (Math.PI / 180);
          const radius = evt.amount >= 25000 ? 125 : evt.amount >= 10000 ? 90 : evt.amount >= 5000 ? 60 : 30;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          const isCritical = evt.amount >= 25000;
          const isHigh = evt.amount >= 10000 && evt.amount < 25000;
          const colorClass = isCritical ? 'bg-rose-500 shadow-rose-500/50' : isHigh ? 'bg-amber-500 shadow-amber-500/50' : 'bg-indigo-500 shadow-indigo-500/50';

          return (
            <div
              key={evt.id}
              onClick={() => setSelectedEvent(evt)}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className={`absolute w-4 h-4 rounded-full ${colorClass} cursor-pointer transition-all duration-300 hover:scale-150 shadow-lg flex items-center justify-center group z-20`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping opacity-75"></span>
              
              {/* Tooltip on Hover */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block surface-level-3 px-3 py-1.5 rounded-lg border border-indigo-500/30 text-slate-900 dark:text-white font-mono text-[11px] whitespace-nowrap shadow-xl z-30 pointer-events-none">
                <span>{evt.id} • ₹{evt.amount?.toLocaleString()}</span>
              </div>
            </div>
          );
        })}

        {/* Center Target Indicator */}
        <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 z-10 border border-white"></div>
      </div>

      {/* Selected Target Detail Popup Card */}
      {selectedEvent && (
        <div className="surface-level-3 p-5 rounded-2xl border border-indigo-500/40 animate-fade-in flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">CASE: {selectedEvent.id}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                ₹{selectedEvent.amount?.toLocaleString()} AT RISK
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-300 font-sans">
              Event: <span className="font-semibold text-slate-900 dark:text-white">{selectedEvent.eventType}</span> • Status: <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{selectedEvent.status}</span>
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 dark:text-gray-400 block text-[10px]">Recovery Confidence</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">84%</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-gray-400 block text-[10px]">Fatigue Risk</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">Low (22%)</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-gray-400 block text-[10px]">Urgency</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">High</span>
            </div>
            <button
              onClick={() => navigate(`/twin-lab?eventId=${selectedEvent.id}`)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition flex items-center space-x-1.5 font-mono"
            >
              <span>OPEN RECOVERY TWIN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
