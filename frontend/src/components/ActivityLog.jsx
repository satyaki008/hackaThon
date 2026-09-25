import React, { useState } from 'react';
import { Terminal, Filter, Trash2, CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export default function ActivityLog({ events, onClearLog }) {
  const [selectedLevel, setSelectedLevel] = useState('ALL');

  const filteredEvents = (events || []).filter((e) => {
    if (selectedLevel === 'ALL') return true;
    return e.level.toUpperCase() === selectedLevel.toUpperCase();
  });

  const getLevelStyle = (level) => {
    switch (level.toUpperCase()) {
      case 'SUCCESS':
        return {
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2,
          text: 'text-emerald-300',
        };
      case 'WARNING':
        return {
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: AlertTriangle,
          text: 'text-amber-200',
        };
      case 'ERROR':
        return {
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: AlertOctagon,
          text: 'text-rose-300',
        };
      default:
        return {
          badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          icon: Info,
          text: 'text-slate-300',
        };
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-white m-0">Cluster Activity & Audit Stream</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Level Filter Buttons */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[11px]">
            {['ALL', 'INFO', 'SUCCESS', 'WARNING', 'ERROR'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  selectedLevel === lvl
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Terminal Feed */}
      <div className="bg-slate-950/90 rounded-xl border border-slate-800/80 p-3 h-72 overflow-y-auto font-mono text-xs space-y-2">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No events recorded for selected level.
          </div>
        ) : (
          filteredEvents.map((e) => {
            const style = getLevelStyle(e.level);
            const Icon = style.icon;

            return (
              <div
                key={e.id}
                className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/40 hover:bg-slate-900/80 transition-colors border border-transparent hover:border-slate-800/50"
              >
                {/* Time */}
                <span className="text-[11px] text-slate-500 whitespace-nowrap pt-0.5">
                  {new Date(e.timestamp).toLocaleTimeString()}
                </span>

                {/* Level Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${style.badge}`}
                >
                  <Icon className="w-3 h-3" />
                  {e.level}
                </span>

                {/* Component Tag */}
                <span className="text-slate-400 text-[11px] whitespace-nowrap">
                  [{e.component}]
                </span>

                {/* Message */}
                <span className={`flex-1 break-all ${style.text}`}>
                  {e.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
