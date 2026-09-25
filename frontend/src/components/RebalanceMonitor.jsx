import React from 'react';
import { Scale, ArrowRight, CheckCircle2, Shield, RefreshCw } from 'lucide-react';

export default function RebalanceMonitor({ rebalanceStatus, onTriggerRebalance, isRebalancing }) {
  const isBalanced = rebalanceStatus?.is_balanced ?? true;
  const skewPct = rebalanceStatus?.skew_percentage || 0;
  const utilizations = rebalanceStatus?.node_utilizations || {};
  const moves = rebalanceStatus?.recommended_moves || [];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-base font-semibold text-white m-0">Cluster Storage Rebalancing</h2>
            <p className="text-xs text-slate-400 m-0">
              Capacity skew minimization and non-destructive replica migration
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerRebalance}
          disabled={isRebalancing || isBalanced}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all ${
            isBalanced
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-900/30'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRebalancing ? 'animate-spin' : ''}`} />
          {isRebalancing ? 'Rebalancing Cluster...' : 'Execute Rebalance'}
        </button>
      </div>

      {/* Skew & Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="glass-card p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Balance State</span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                isBalanced
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {isBalanced ? 'BALANCED' : 'IMBALANCE DETECTED'}
            </span>
          </div>
        </div>

        <div className="glass-card p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Capacity Skew</span>
          <p className="text-lg font-bold text-white m-0 mt-1 font-mono">
            {skewPct}% <span className="text-xs font-normal text-slate-400">(Threshold: 20%)</span>
          </p>
        </div>

        <div className="glass-card p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Safe Rule Guarantee</span>
          <p className="text-xs text-slate-300 m-0 mt-1 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            Delete source only after target is verified
          </p>
        </div>
      </div>

      {/* Per Node Utilizations */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-slate-400">Storage Load Distribution</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(utilizations).map(([nodeId, pct]) => (
            <div key={nodeId} className="glass-card p-2.5 rounded-lg border border-slate-800/80">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-mono text-slate-300">{nodeId}</span>
                <span className="font-mono text-white font-semibold">{pct}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${
                    pct > 70 ? 'bg-amber-400' : 'bg-indigo-400'
                  }`}
                  style={{ width: `${Math.max(3, pct)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Migrations */}
      {moves.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-medium text-amber-300 flex items-center gap-1">
            Recommended Rebalancing Migrations ({moves.length})
          </span>
          <div className="space-y-1.5">
            {moves.map((move, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
              >
                <span className="text-white font-medium truncate max-w-[200px]">
                  {move.object_name}
                </span>
                <div className="flex items-center gap-2 font-mono text-slate-300">
                  <span className="px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300">
                    {move.source_node_id} (Overloaded)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                    {move.target_node_id} (Underutilized)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
