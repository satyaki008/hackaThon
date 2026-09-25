import React, { useState } from 'react';
import { 
  Server, 
  Cloud, 
  Activity, 
  Database, 
  Clock, 
  WifiOff, 
  PowerOff, 
  Power, 
  Plus, 
  X, 
  Zap, 
  Globe,
  Radio,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function NodeGrid({ 
  nodes, 
  onFailNode, 
  onRecoverNode, 
  onSetLatency, 
  onTogglePartition, 
  onRefresh 
}) {
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [mongoUri, setMongoUri] = useState('');
  const [configuring, setConfiguring] = useState(false);

  const handleOpenCloudModal = (nodeId) => {
    setSelectedNode(nodeId);
    setCloudModalOpen(true);
  };

  const handleCloseModal = () => {
    setCloudModalOpen(false);
    setSelectedNode(null);
    setMongoUri('');
  };

  const handleConfigureCloud = async (e) => {
    e.preventDefault();
    if (!selectedNode || !mongoUri) return;
    
    setConfiguring(true);
    try {
      await api.configureCloudNode(selectedNode, mongoUri);
      if (onRefresh) await onRefresh();
      handleCloseModal();
    } catch (err) {
      console.error("Failed to configure cloud node", err);
      alert("Failed to configure cloud node: " + (err.message || "Unknown error"));
    } finally {
      setConfiguring(false);
    }
  };

  const getStatusColor = (status, isAtlas) => {
    if (status?.toUpperCase() === 'OFFLINE') return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    if (!isAtlas) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    if (status?.toUpperCase() === 'ONLINE') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (status?.toUpperCase() === 'DEGRADED') return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono m-0">
            Physical & Cloud Storage Blades (4 Dispersal Nodes)
          </h3>
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          Independent Failure Domains &bull; Quorum Threshold: W &ge; 2
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {nodes.map((node) => {
          const isNode1 = node.id === 'node-1';
          const isAtlas = isNode1 || node.name?.toLowerCase().includes('atlas') || node.url?.includes('mongodb');
          const isOffline = node.status?.toUpperCase() === 'OFFLINE';
          const hasLatency = node.simulated_latency_ms > 0;
          const isPartitioned = node.is_partitioned;
          
          const statusText = isOffline
            ? 'OFFLINE'
            : !isAtlas
            ? 'STANDBY (NO CLOUD)'
            : 'ONLINE';

          const usedPercent = node.total_capacity_bytes > 0 
            ? (node.used_capacity_bytes / node.total_capacity_bytes) * 100 
            : 0;

          return (
            <div 
              key={node.id} 
              className={`relative bg-[#161B26] border rounded-xl p-5 flex flex-col justify-between transition-all duration-300 overflow-hidden group ${
                isOffline 
                  ? 'border-rose-500/30 bg-rose-950/10' 
                  : isAtlas 
                  ? 'border-cyan-500/40 shadow-lg shadow-cyan-950/20 hover:border-cyan-400/70' 
                  : 'border-[#1E2736] hover:border-slate-700'
              }`}
            >
              {/* Top Accent Strip */}
              <div 
                className={`absolute top-0 left-0 right-0 h-1 transition-all ${
                  isOffline
                    ? 'bg-rose-500'
                    : isAtlas
                    ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                    : 'bg-gradient-to-r from-amber-500/60 to-slate-700'
                }`}
              />

              <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-3 pt-1">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-xl border ${
                      isOffline 
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                        : isAtlas 
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}>
                      {isAtlas ? <Cloud size={18} /> : <Server size={18} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wider text-sm font-mono m-0 flex items-center gap-1.5">
                        {node.id}
                        {isAtlas && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        {isAtlas ? (
                          <span className="text-[9px] font-bold font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
                            <Globe size={10} /> ATLAS CLOUD
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                            AWAITING CLOUD
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Pill */}
                  <div className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1.5 font-mono ${getStatusColor(node.status, isAtlas)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isOffline ? 'bg-rose-400' : !isAtlas ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                    }`} />
                    {statusText}
                  </div>
                </div>

                {/* Cloud Cluster Snippet */}
                {isAtlas && (
                  <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E2736] text-[10px] font-mono text-cyan-300/80 flex items-center justify-between">
                    <span className="text-slate-500">URI:</span>
                    <span className="truncate max-w-[170px]" title="cluster0.i7avjwe.mongodb.net">
                      cluster0.i7avjwe.mongodb.net
                    </span>
                  </div>
                )}

                {/* Connect Cloud Button for Standby Nodes */}
                {!isAtlas && (
                  <button
                    onClick={() => handleOpenCloudModal(node.id)}
                    className="mb-3 w-full flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-amber-500/30 rounded-lg text-xs font-mono text-amber-400/90 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all cursor-pointer"
                  >
                    <Plus size={14} /> Connect MongoDB Atlas
                  </button>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4 bg-[#0B0F17] p-3 rounded-lg border border-[#1E2736]">
                  {/* Latency with Sparkline */}
                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-mono flex items-center gap-1">
                      <Activity size={10} className="text-cyan-400" /> Latency
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className={`text-sm font-mono font-bold ${hasLatency ? 'text-amber-400' : 'text-slate-200'}`}>
                        {node.response_time_ms ? `${node.response_time_ms}ms` : '<1ms'}
                      </span>
                      {/* Sparkline Bars */}
                      <div className="flex items-end gap-0.5 h-4 ml-1">
                        {[30, 45, 25, 40, hasLatency ? 85 : 35, hasLatency ? 100 : (node.response_time_ms > 10 ? 60 : 30)].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-t transition-all duration-300 ${
                              hasLatency ? 'bg-amber-400' : 'bg-cyan-500/70'
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Replicas count */}
                  <div className="flex flex-col justify-between border-l border-[#1E2736] pl-2.5">
                    <span className="text-[10px] text-slate-500 uppercase font-mono flex items-center gap-1">
                      <Database size={10} className="text-blue-400" /> Stored
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-sm font-mono font-bold text-white">
                        {node.object_count || 0}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">shards</span>
                    </div>
                  </div>
                </div>

                {/* Storage Capacity Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>Capacity</span>
                    <span>{formatBytes(node.used_capacity_bytes)} / {formatBytes(node.total_capacity_bytes)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#0B0F17] rounded-full overflow-hidden border border-[#1E2736]">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        usedPercent > 80 
                          ? 'bg-rose-500' 
                          : isAtlas 
                          ? 'bg-gradient-to-r from-cyan-500 to-emerald-400' 
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.max(2, Math.min(100, usedPercent))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 pt-3 border-t border-[#1E2736] mt-auto">
                {isOffline ? (
                  <button 
                    onClick={() => onRecoverNode(node.id)}
                    className="flex-1 flex justify-center items-center gap-1.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-all text-xs font-semibold font-mono cursor-pointer"
                  >
                    <Power size={13} /> Recover
                  </button>
                ) : (
                  <button 
                    onClick={() => onFailNode(node.id)}
                    className="flex-1 flex justify-center items-center gap-1.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-all text-xs font-semibold font-mono cursor-pointer"
                  >
                    <PowerOff size={13} /> Fail Blade
                  </button>
                )}

                <button 
                  onClick={() => onSetLatency(node.id, hasLatency ? 0 : 500)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    hasLatency 
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
                      : 'bg-[#0B0F17] border-[#1E2736] text-slate-400 hover:text-amber-400 hover:border-amber-400/30'
                  }`}
                  title={hasLatency ? "Clear Injected Latency" : "Inject 500ms Latency Jitter"}
                >
                  <Clock size={15} />
                </button>

                <button 
                  onClick={() => onTogglePartition(node.id, 'controller', !isPartitioned)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isPartitioned 
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' 
                      : 'bg-[#0B0F17] border-[#1E2736] text-slate-400 hover:text-rose-400 hover:border-rose-400/30'
                  }`}
                  title={isPartitioned ? "Heal Network Partition" : "Isolate Node (Split-Brain Simulation)"}
                >
                  <WifiOff size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cloud Config Modal */}
      {cloudModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#161B26] border border-[#1E2736] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-[#1E2736] bg-[#0B0F17]">
              <div className="flex items-center gap-2.5">
                <Cloud size={20} className="text-cyan-400" />
                <h3 className="text-base font-bold text-white m-0">
                  Connect {selectedNode?.toUpperCase()} to MongoDB Atlas
                </h3>
              </div>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleConfigureCloud} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                  Target Storage Node
                </label>
                <div className="bg-[#0B0F17] px-3.5 py-2 rounded-lg border border-[#1E2736] text-cyan-400 font-mono text-xs font-bold">
                  {selectedNode?.toUpperCase()}
                </div>
              </div>

              <div>
                <label htmlFor="mongoUri" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                  MongoDB Connection URI
                </label>
                <input
                  id="mongoUri"
                  type="password"
                  value={mongoUri}
                  onChange={(e) => setMongoUri(e.target.value)}
                  placeholder="mongodb+srv://<user>:<password>@cluster0.mongodb.net/?appName=Cluster0"
                  className="w-full bg-[#0B0F17] border border-[#1E2736] focus:border-cyan-500 rounded-lg px-3.5 py-2.5 text-slate-100 placeholder-slate-600 outline-none transition-all font-mono text-xs"
                  required
                />
                <p className="mt-2 text-[11px] text-slate-500">
                  ResiStore will ping the cluster, authenticate, and register collection <code className="text-cyan-300">{selectedNode}_chunks</code>.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-[#0B0F17] border border-[#1E2736] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={configuring || !mongoUri}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
                >
                  {configuring ? (
                    <>
                      <Zap size={14} className="animate-spin" /> Verifying Connection...
                    </>
                  ) : (
                    <>
                      <Cloud size={14} /> Attach Atlas Cloud
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
