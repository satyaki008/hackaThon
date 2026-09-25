import React, { useState } from 'react';
import { Network, Server, Shield, Cloud, Radio, Activity, Play, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function TopologyView({ nodes, stats, repairJobs }) {
  const [isSimulatingTraffic, setIsSimulatingTraffic] = useState(false);
  const activeRepair = (repairJobs || []).find((j) => j.status === 'IN_PROGRESS');

  const triggerTrafficBurst = () => {
    setIsSimulatingTraffic(true);
    setTimeout(() => setIsSimulatingTraffic(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* ── TOPOLOGY CONTROL BAR ── */}
      <div className="bg-[#161B26] border border-[#1E2736] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white m-0">Live Distributed Cluster Topology & Data Flow</h2>
              <p className="text-xs text-slate-400 m-0">
                Multi-tier architecture: Gateway Quorum Controller &bull; MongoDB Atlas Cloud Tier &bull; Local Standby Daemons
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerTrafficBurst}
            disabled={isSimulatingTraffic}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <Zap className={`w-4 h-4 ${isSimulatingTraffic ? 'animate-bounce text-cyan-400' : ''}`} />
            {isSimulatingTraffic ? 'Simulating I/O Packets...' : 'Simulate Live I/O Burst'}
          </button>
        </div>
      </div>

      {/* ── INTERACTIVE TOPOLOGY GRAPH ── */}
      <div className="bg-[#161B26] border border-[#1E2736] rounded-xl p-8 relative overflow-hidden flex flex-col items-center">
        {/* Tier 1: Client Gateway / S3 Endpoint */}
        <div className="flex flex-col items-center z-10">
          <div className="bg-[#0B0F17] px-6 py-4 rounded-2xl border border-cyan-500/40 shadow-xl shadow-cyan-950/40 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">ResiStore Gateway Controller</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                  PORT 8000
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5 m-0">
                Quorum Consensus &bull; S3 Protocol &bull; Reed-Solomon Cauchy GF(2^8)
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic SVG Connection Cables with Animated Packets */}
        <div className="w-full max-w-4xl h-24 relative my-1">
          <svg className="w-full h-full" viewBox="0 0 800 100" preserveAspectRatio="none">
            {/* 4 Connection Lines from Center (400, 0) to 4 Node Positions (100, 300, 500, 700) */}
            {[100, 300, 500, 700].map((x, idx) => (
              <g key={idx}>
                {/* Background cable */}
                <path
                  d={`M 400 0 C 400 50, ${x} 50, ${x} 100`}
                  fill="none"
                  stroke="#1E2736"
                  strokeWidth="3"
                />
                {/* Active animated traffic stream */}
                <path
                  d={`M 400 0 C 400 50, ${x} 50, ${x} 100`}
                  fill="none"
                  stroke={idx === 0 ? '#10B981' : isSimulatingTraffic ? '#06B6D4' : '#2A3649'}
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  className={isSimulatingTraffic || idx === 0 ? 'animate-pulse' : ''}
                />
                {/* Flowing particle circle when traffic is simulated */}
                {isSimulatingTraffic && (
                  <circle r="4" fill="#06B6D4">
                    <animateMotion
                      path={`M 400 0 C 400 50, ${x} 50, ${x} 100`}
                      dur="0.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Tier 2: 4 Storage Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl z-10">
          {(nodes || []).map((node, idx) => {
            const isNode1 = node.id === 'node-1';
            const isOffline = node.status?.toUpperCase() === 'OFFLINE' || node.is_partitioned;
            const isAtlas = isNode1 || node.name?.toLowerCase().includes('atlas');

            return (
              <div
                key={node.id}
                className={`bg-[#0B0F17] rounded-xl p-4 border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isOffline
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : isAtlas
                    ? 'border-cyan-500/40 shadow-lg shadow-cyan-950/20'
                    : 'border-[#1E2736] hover:border-slate-700'
                }`}
              >
                {/* Top Badge */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg border ${
                        isAtlas
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {isAtlas ? <Cloud className="w-4 h-4" /> : <Server className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs uppercase font-mono m-0">{node.id}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Port {8001 + idx}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      isOffline
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : isAtlas
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {isOffline ? 'OFFLINE' : isAtlas ? 'ONLINE (CLOUD)' : 'STANDBY'}
                  </span>
                </div>

                {/* Node Details */}
                <div className="bg-[#161B26] p-2.5 rounded-lg border border-[#1E2736] text-[11px] font-mono space-y-1 mb-3">
                  <div className="flex justify-between text-slate-400">
                    <span>Replicas:</span>
                    <span className="text-white font-bold">{node.object_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Latency:</span>
                    <span className={node.simulated_latency_ms > 0 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                      {node.response_time_ms ? `${node.response_time_ms}ms` : '<1ms'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Storage Engine:</span>
                    <span className={isAtlas ? 'text-emerald-400' : 'text-slate-400'}>
                      {isAtlas ? 'MongoDB Atlas' : 'Local FS'}
                    </span>
                  </div>
                </div>

                {/* Live Activity Pulsing Strip */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOffline
                        ? 'bg-rose-500'
                        : isAtlas
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span>{isOffline ? 'Node Unreachable' : isAtlas ? 'Serving Live Chunks' : 'Standby Emulation'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Repair Flow Banner */}
        {activeRepair && (
          <div className="mt-6 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300 animate-pulse">
            <Radio className="w-4 h-4 text-amber-400 animate-spin" />
            <span>
              Active Data Transfer: Syncing <b>{activeRepair.object_name}</b> from{' '}
              <b>{activeRepair.source_node_id}</b> to <b>{activeRepair.target_node_id}</b> ({activeRepair.progress_percent}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
