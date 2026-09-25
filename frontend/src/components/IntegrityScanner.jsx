import React from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle, RefreshCw, Sparkles, Wrench } from 'lucide-react';

export default function IntegrityScanner({ integrityStatus, onRunAudit, isAuditing }) {
  const recentChecks = integrityStatus?.recent_checks || [];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-base font-semibold text-white m-0">Cryptographic Integrity Audit & Self-Healing</h2>
            <p className="text-xs text-slate-400 m-0">
              SHA-256 replica validation, silent bit-rot detection, and automatic peer restoration
            </p>
          </div>
        </div>

        <button
          onClick={onRunAudit}
          disabled={isAuditing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
          {isAuditing ? 'Auditing Cluster...' : 'Run Deep Audit Now'}
        </button>
      </div>

      {/* Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Total Checked</span>
          <p className="text-xl font-bold text-white m-0 mt-1">
            {integrityStatus?.total_replicas_checked || 0}
          </p>
        </div>
        <div className="glass-card p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/10">
          <span className="text-[11px] text-emerald-400">Verified Healthy</span>
          <p className="text-xl font-bold text-emerald-300 m-0 mt-1">
            {integrityStatus?.healthy_replicas || 0}
          </p>
        </div>
        <div className="glass-card p-3 rounded-xl border border-rose-500/20 bg-rose-950/10">
          <span className="text-[11px] text-rose-400">Corrupted Detected</span>
          <p className="text-xl font-bold text-rose-300 m-0 mt-1">
            {integrityStatus?.corrupted_replicas || 0}
          </p>
        </div>
        <div className="glass-card p-3 rounded-xl border border-cyan-500/20 bg-cyan-950/10">
          <span className="text-[11px] text-cyan-400">Auto-Repaired</span>
          <p className="text-xl font-bold text-cyan-300 m-0 mt-1 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            {integrityStatus?.auto_repaired_count || 0}
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <th className="py-2.5 px-3 font-medium">Object Name</th>
              <th className="py-2.5 px-3 font-medium">Node</th>
              <th className="py-2.5 px-3 font-medium">Expected Checksum</th>
              <th className="py-2.5 px-3 font-medium">Actual Checksum</th>
              <th className="py-2.5 px-3 font-medium">Audit Result</th>
              <th className="py-2.5 px-3 font-medium">Self-Healing Action</th>
              <th className="py-2.5 px-3 font-medium text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {recentChecks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No integrity checks performed yet. Click &quot;Run Deep Audit Now&quot; to inspect all replicas.
                </td>
              </tr>
            ) : (
              recentChecks.map((check) => {
                const isHealthy = check.is_valid && check.status === 'HEALTHY';
                return (
                  <tr key={check.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-white truncate max-w-[130px]" title={check.object_name}>
                      {check.object_name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-cyan-300">{check.node_id}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400" title={check.expected_checksum}>
                      {check.expected_checksum.slice(0, 10)}...
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400" title={check.actual_checksum}>
                      {check.actual_checksum ? `${check.actual_checksum.slice(0, 10)}...` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isHealthy
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                        }`}
                      >
                        {isHealthy ? <CheckCircle className="w-3 h-3" /> : <AlertOctagon className="w-3 h-3" />}
                        {check.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px] truncate max-w-[200px]" title={check.action_taken}>
                      {check.action_taken || 'None'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500 text-[11px]">
                      {new Date(check.checked_at).toLocaleTimeString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
