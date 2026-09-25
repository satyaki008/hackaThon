import React from 'react';
import { Wrench, CheckCircle2, AlertCircle, ArrowRight, Clock, RefreshCw } from 'lucide-react';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function RepairMonitor({ repairJobs, onTriggerRepairScan }) {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-base font-semibold text-white m-0">Autonomous Self-Healing Repair Pipeline</h2>
            <p className="text-xs text-slate-400 m-0">
              Automatic replica synthesis, peer data copying, and cryptographic checksum validation
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerRepairScan}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Trigger Health Audit
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <th className="py-2.5 px-3 font-medium">Object</th>
              <th className="py-2.5 px-3 font-medium">Pipeline Transfer</th>
              <th className="py-2.5 px-3 font-medium">Failure Trigger</th>
              <th className="py-2.5 px-3 font-medium">Progress</th>
              <th className="py-2.5 px-3 font-medium">Transferred</th>
              <th className="py-2.5 px-3 font-medium">Status</th>
              <th className="py-2.5 px-3 font-medium text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {(!repairJobs || repairJobs.length === 0) ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No repair jobs recorded. All replicas are healthy and fully synchronized.
                </td>
              </tr>
            ) : (
              repairJobs.map((job) => {
                const isDone = job.status === 'COMPLETED';
                const isFailed = job.status === 'FAILED';
                const isRunning = job.status === 'IN_PROGRESS';

                return (
                  <tr key={job.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Object */}
                    <td className="py-2.5 px-3 font-medium text-white truncate max-w-[140px]" title={job.object_name}>
                      {job.object_name}
                    </td>

                    {/* Pipeline Transfer */}
                    <td className="py-2.5 px-3 font-mono">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {job.source_node_id || 'ANY'}
                        </span>
                        <ArrowRight className="w-3 h-3 text-amber-400" />
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-800/50 text-cyan-300">
                          {job.target_node_id}
                        </span>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {job.reason}
                    </td>

                    {/* Progress */}
                    <td className="py-2.5 px-3 w-36">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              isDone ? 'bg-emerald-400' : isFailed ? 'bg-rose-500' : 'bg-amber-400'
                            }`}
                            style={{ width: `${job.progress_percent}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono w-7 text-right">
                          {job.progress_percent}%
                        </span>
                      </div>
                    </td>

                    {/* Transferred */}
                    <td className="py-2.5 px-3 text-slate-300 font-mono">
                      {formatBytes(job.bytes_transferred)}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isDone
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isFailed
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-3 h-3" />}
                        {isFailed && <AlertCircle className="w-3 h-3" />}
                        {job.status}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500 text-[11px]">
                      {new Date(job.started_at).toLocaleTimeString()}
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
