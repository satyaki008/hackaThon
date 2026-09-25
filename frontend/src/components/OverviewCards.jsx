import React from 'react';
import { HardDrive, Server, Copy, ShieldCheck, Zap, Activity } from 'lucide-react';

const formatBytes = (bytes) => {
  if (bytes === 0 || !bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function OverviewCards({ stats, nodes = [] }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#161B26] border border-[#1E2736] rounded-xl p-5 animate-pulse h-32" />
        ))}
      </div>
    );
  }

  const {
    total_storage_bytes = 0,
    used_storage_bytes = 0,
    total_nodes = 0,
    healthy_nodes = 0,
    failed_nodes = 0,
    replication_factor = 0,
    total_replicas = 0,
    active_repairs = 0
  } = stats;

  const cloudNodesCount = (nodes && nodes.length > 0)
    ? nodes.filter(n => n.id === 'node-1' || n.name?.toLowerCase().includes('atlas') || n.url?.includes('mongodb')).length
    : 1;

  const usedPercentage = total_storage_bytes > 0 
    ? ((used_storage_bytes / total_storage_bytes) * 100).toFixed(1) 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* ── CARD 1: TOTAL STORAGE ── */}
      <div className="bg-[#161B26] border border-[#1E2736] hover:border-cyan-500/40 rounded-xl p-5 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-80" />
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Storage Capacity
            </span>
            <div className="text-2xl font-bold font-mono text-white mb-1 tracking-tight">
              {formatBytes(used_storage_bytes)} <span className="text-sm font-normal text-slate-400">/ {formatBytes(total_storage_bytes)}</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-[#0B0F17] rounded-full h-1.5 mt-3 overflow-hidden border border-[#1E2736]">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(3, parseFloat(usedPercentage))}%` }} 
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-1">
              <span>{usedPercentage}% Used</span>
              <span>{formatBytes(Math.max(0, total_storage_bytes - used_storage_bytes))} Free</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 ml-3">
            <HardDrive size={20} />
          </div>
        </div>
      </div>

      {/* ── CARD 2: ACTIVE CLOUD NODES ── */}
      <div className="bg-[#161B26] border border-[#1E2736] hover:border-emerald-500/40 rounded-xl p-5 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80" />
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Cluster Blades
            </span>
            <div className="text-2xl font-bold font-mono text-white mb-1">
              {cloudNodesCount} <span className="text-sm font-normal text-slate-400">/ {total_nodes} Cloud Active</span>
            </div>

            {/* 4 Mini Blade Indicators */}
            <div className="flex items-center gap-1.5 mt-3">
              {(nodes.length > 0 ? nodes : [{id:'node-1'},{id:'node-2'},{id:'node-3'},{id:'node-4'}]).map((n, idx) => {
                const isAtlas = n.id === 'node-1' || n.name?.toLowerCase().includes('atlas') || n.url?.includes('mongodb');
                const isOff = n.status === 'OFFLINE';
                return (
                  <div
                    key={n.id || idx}
                    className={`flex-1 h-2 rounded-sm transition-all ${
                      isOff
                        ? 'bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.5)]'
                        : isAtlas
                        ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                        : 'bg-amber-400/60'
                    }`}
                    title={`${n.id}: ${isOff ? 'Offline' : isAtlas ? 'Atlas Cloud Active' : 'Standby'}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-1">
              <span className="text-emerald-400 font-medium">{cloudNodesCount} Atlas Live</span>
              <span>{Math.max(0, total_nodes - cloudNodesCount)} Standby</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 ml-3">
            <Server size={20} />
          </div>
        </div>
      </div>

      {/* ── CARD 3: REDUNDANCY & DURABILITY ── */}
      <div className="bg-[#161B26] border border-[#1E2736] hover:border-indigo-500/40 rounded-xl p-5 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80" />
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Data Durability
            </span>
            <div className="text-2xl font-bold font-mono text-white mb-1">
              {replication_factor}x <span className="text-sm font-normal text-slate-400">Quorum Consensus</span>
            </div>
            
            <div className="mt-3 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                W=2 &bull; R=2 QUORUM
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                RS(4+2)
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1.5">
              {total_replicas} verified replicas stored
            </div>
          </div>

          <div className="p-2.5 rounded-xl text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 ml-3">
            <Copy size={20} />
          </div>
        </div>
      </div>

      {/* ── CARD 4: SELF-HEALING STATUS ── */}
      <div className="bg-[#161B26] border border-[#1E2736] hover:border-amber-500/40 rounded-xl p-5 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-rose-500 opacity-80" />
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Self-Healing Engine
            </span>
            <div className="text-2xl font-bold font-mono text-white mb-1">
              {active_repairs > 0 ? (
                <span className="text-amber-400 animate-pulse">{active_repairs} Healing...</span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  100% <span className="text-sm font-normal text-slate-400">Synchronized</span>
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Bit-Rot & Loss Protected</span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              Merkle Tree Continuous Hash Audit
            </div>
          </div>

          <div className={`p-2.5 rounded-xl ml-3 border ${
            active_repairs > 0 
              ? 'text-amber-400 bg-amber-400/10 border-amber-400/20 animate-spin' 
              : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
          }`}>
            <Zap size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
