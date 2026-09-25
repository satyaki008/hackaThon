import React from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, Play, Sparkles, Server, ShieldCheck, ArrowRight } from 'lucide-react';

export default function DemoModal({ isOpen, onClose, demoType, timeline, isRunning, result }) {
  if (!isOpen) return null;

  const isAutoRepair = demoType === 'auto-repair';
  const title = isAutoRepair ? '10-Step Distributed Node Failure & Auto-Healing Demo' : 'Data Corruption Detection & Peer Self-Healing Demo';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white m-0">{title}</h3>
              <p className="text-xs text-slate-400 m-0">
                Automated live simulation of real distributed fault recovery
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Timeline */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {isRunning && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs animate-pulse">
              <Clock className="w-4 h-4 animate-spin" />
              Executing real distributed operations on storage nodes in real time...
            </div>
          )}

          <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 py-2">
            {(timeline || []).map((step, idx) => {
              const isCompleted = step.status === 'COMPLETED';
              const isFailed = step.status === 'FAILED';

              return (
                <div key={idx} className="relative pl-6">
                  {/* Step Marker Dot */}
                  <span
                    className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : isFailed
                        ? 'bg-rose-500 border-rose-400 text-white'
                        : 'bg-amber-400 border-amber-300 text-slate-950 animate-ping'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" />}
                  </span>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        Step {step.step}: {step.title}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isFailed
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>

                    {/* Step Details */}
                    {step.details && (
                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
                        {typeof step.details === 'string' ? (
                          step.details
                        ) : (
                          <pre className="text-[11px] overflow-x-auto text-cyan-300 m-0">
                            {JSON.stringify(step.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {result && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                result.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {result.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {result.success
                ? 'Simulation successfully verified! Full fault tolerance, data repair, and checksum integrity confirmed.'
                : 'Simulation encountered an error. Check cluster logs.'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
