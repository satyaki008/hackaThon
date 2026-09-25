import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, ShieldAlert, RotateCcw, Sparkles } from 'lucide-react';
import { api } from './services/api';

import Sidebar from './components/Sidebar';
import OverviewCards from './components/OverviewCards';
import NodeGrid from './components/NodeGrid';
import ObjectBrowser from './components/ObjectBrowser';
import RepairMonitor from './components/RepairMonitor';
import IntegrityScanner from './components/IntegrityScanner';
import RebalanceMonitor from './components/RebalanceMonitor';
import ActivityLog from './components/ActivityLog';
import TopologyView from './components/TopologyView';
import DemoModal from './components/DemoModal';
import ErasureCodingView from './components/ErasureCodingView';
import ChaosBenchmarkView from './components/ChaosBenchmarkView';
import OverviewActivityConsole from './components/OverviewActivityConsole';

const PAGE_TITLES = {
  overview: 'Overview',
  objects: 'Object Browser',
  erasure: 'Erasure Coding',
  chaos: 'Chaos & Performance Benchmark',
  topology: 'Cluster Topology',
  repairs: 'Self-Healing Pipeline',
  integrity: 'Integrity Audit',
  rebalance: 'Rebalance Engine',
  logs: 'Audit Log',
};

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLiveSync, setIsLiveSync] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [stats, setStats] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [objects, setObjects] = useState([]);
  const [repairJobs, setRepairJobs] = useState([]);
  const [integrityStatus, setIntegrityStatus] = useState(null);
  const [rebalanceStatus, setRebalanceStatus] = useState(null);
  const [events, setEvents] = useState([]);

  // Demo Modal state
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoType, setDemoType] = useState('auto-repair');
  const [demoTimeline, setDemoTimeline] = useState([]);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoResult, setDemoResult] = useState(null);

  // Auditing / rebalancing loading states
  const [isAuditing, setIsAuditing] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);

  // Load all cluster state
  const loadAllData = useCallback(async () => {
    try {
      const [
        statsData, nodesData, objectsData, repairsData,
        integrityData, rebalanceData, eventsData,
      ] = await Promise.all([
        api.getStats().catch(() => null),
        api.getNodes().catch(() => []),
        api.getObjects(searchQuery).catch(() => []),
        api.getRepairJobs(20).catch(() => []),
        api.getIntegrityStatus().catch(() => null),
        api.getRebalanceStatus().catch(() => null),
        api.getEvents(100).catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      if (nodesData) setNodes(nodesData);
      if (objectsData) setObjects(objectsData);
      if (repairsData) setRepairJobs(repairsData);
      if (integrityData) setIntegrityStatus(integrityData);
      if (rebalanceData) setRebalanceStatus(rebalanceData);
      if (eventsData) setEvents(eventsData);
    } catch (err) {
      console.error('Data refresh error:', err);
    }
  }, [searchQuery]);

  // Initial load
  useEffect(() => { loadAllData(); }, [loadAllData]);

  // Polling
  useEffect(() => {
    if (!isLiveSync) return;
    const interval = setInterval(loadAllData, 2000);
    return () => clearInterval(interval);
  }, [isLiveSync, loadAllData]);

  // ── Node Actions ──
  const handleFailNode = async (nodeId) => { await api.failNode(nodeId); await loadAllData(); };
  const handleRecoverNode = async (nodeId) => { await api.recoverNode(nodeId); await loadAllData(); };
  const handleSetLatency = async (nodeId, ms) => { await api.setNodeLatency(nodeId, ms); await loadAllData(); };
  const handleTogglePartition = async (a, b, en) => { await api.togglePartition(a, b, en); await loadAllData(); };

  // ── Object Actions ──
  const handleUpload = async (file, rf) => { await api.uploadObject(file, rf); await loadAllData(); };
  const handleDownload = async (id, name) => { await api.downloadObject(id, name); };
  const handleDelete = async (id) => { await api.deleteObject(id); await loadAllData(); };
  const handleCorruptReplica = async (id) => { await api.corruptReplica(id); await loadAllData(); };

  // ── Maintenance Actions ──
  const handleTriggerRepairScan = async () => { await api.triggerRepair(); await loadAllData(); };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await api.runIntegrityAudit(true);
      setIntegrityStatus(res);
      await loadAllData();
    } finally { setIsAuditing(false); }
  };

  const handleTriggerRebalance = async () => {
    setIsRebalancing(true);
    try {
      await api.triggerRebalance(5);
      await loadAllData();
    } finally { setIsRebalancing(false); }
  };

  const handleResetCluster = async () => { await api.resetCluster(); await loadAllData(); };

  // ── Demo Handlers ──
  const handleRunAutoRepairDemo = async () => {
    setDemoType('auto-repair');
    setDemoTimeline([{ step: 1, title: 'Cluster Health Verification', status: 'IN_PROGRESS' }]);
    setDemoResult(null);
    setIsDemoModalOpen(true);
    setIsDemoRunning(true);
    try {
      const res = await api.runAutoRepairDemo();
      setDemoTimeline(res.timeline);
      setDemoResult({ success: res.success });
      await loadAllData();
    } catch (err) {
      setDemoResult({ success: false, error: err.message });
    } finally { setIsDemoRunning(false); }
  };

  const handleRunCorruptionDemo = async () => {
    setDemoType('corruption');
    setDemoTimeline([{ step: 1, title: 'Upload Target Object', status: 'IN_PROGRESS' }]);
    setDemoResult(null);
    setIsDemoModalOpen(true);
    setIsDemoRunning(true);
    try {
      const res = await api.runCorruptionDemo();
      setDemoTimeline(res.timeline);
      setDemoResult({ success: res.success });
      await loadAllData();
    } catch (err) {
      setDemoResult({ success: false, error: err.message });
    } finally { setIsDemoRunning(false); }
  };

  // Status badge
  const getStatusBadge = () => {
    const s = stats?.system_status || 'OPERATIONAL';
    switch (s) {
      case 'OPERATIONAL':
        return { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400', text: 'Operational' };
      case 'DEGRADED':
      case 'REPAIRING':
        return { color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', dot: 'bg-amber-400 animate-pulse', text: s === 'REPAIRING' ? 'Self-Healing' : 'Degraded' };
      case 'CRITICAL':
        return { color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', dot: 'bg-rose-500 animate-pulse', text: 'Critical' };
      default:
        return { color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', dot: 'bg-slate-400', text: s };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="flex h-screen bg-[#0B0F17] text-slate-200 overflow-hidden">
      {/* ── Sidebar ── */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        stats={stats}
        badges={{
          objects: objects.length,
          repairs: repairJobs.length,
          events: events.length,
        }}
      />

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Top Bar ── */}
        <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-[#1E2736]">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[11px] text-slate-500 mb-0.5 font-mono">System Control</p>
              <h1 className="text-lg font-semibold text-white leading-tight">{PAGE_TITLES[activeSection]}</h1>
            </div>
            {/* Status pill */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
              <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
              {badge.text}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live sync toggle */}
            <button
              onClick={() => setIsLiveSync(!isLiveSync)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isLiveSync
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-[#161B26] border-[#1E2736] text-slate-400 hover:text-white'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLiveSync ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              {isLiveSync ? 'Live' : 'Paused'}
            </button>

            <div className="h-5 w-px bg-[#1E2736]" />

            {/* Judge Interactive Walkthrough Button */}
            <button
              onClick={handleRunAutoRepairDemo}
              disabled={isDemoRunning}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 shadow-md shadow-cyan-950/50 transition-all border border-cyan-400/30 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-spin" style={{ animationDuration: '4s' }} />
              Judge Live Demo (30s)
            </button>

            {/* Action buttons */}
            <button
              onClick={handleRunAutoRepairDemo}
              disabled={isDemoRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Simulate Failure
            </button>

            <button
              onClick={handleRunCorruptionDemo}
              disabled={isDemoRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Simulate Corruption
            </button>

            <button
              onClick={handleResetCluster}
              className="p-1.5 rounded-lg bg-[#161B26] border border-[#1E2736] text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
              title="Reset Cluster"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ── Content Area ── */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {activeSection === 'overview' && (
              <>
                <OverviewCards stats={stats} nodes={nodes} />
                <NodeGrid
                  nodes={nodes}
                  onFailNode={handleFailNode}
                  onRecoverNode={handleRecoverNode}
                  onSetLatency={handleSetLatency}
                  onTogglePartition={handleTogglePartition}
                  onRefresh={loadAllData}
                />
                <OverviewActivityConsole events={events} onRefresh={loadAllData} />
              </>
            )}

            {activeSection === 'objects' && (
              <ObjectBrowser
                objects={objects}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onUpload={handleUpload}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onCorruptReplica={handleCorruptReplica}
              />
            )}

            {activeSection === 'erasure' && (
              <ErasureCodingView onUploadComplete={loadAllData} />
            )}

            {activeSection === 'chaos' && <ChaosBenchmarkView />}

            {activeSection === 'topology' && (
              <TopologyView nodes={nodes} stats={stats} repairJobs={repairJobs} />
            )}

            {activeSection === 'repairs' && (
              <RepairMonitor
                repairJobs={repairJobs}
                onTriggerRepairScan={handleTriggerRepairScan}
              />
            )}

            {activeSection === 'integrity' && (
              <IntegrityScanner
                integrityStatus={integrityStatus}
                onRunAudit={handleRunAudit}
                isAuditing={isAuditing}
              />
            )}

            {activeSection === 'rebalance' && (
              <RebalanceMonitor
                rebalanceStatus={rebalanceStatus}
                onTriggerRebalance={handleTriggerRebalance}
                isRebalancing={isRebalancing}
              />
            )}

            {activeSection === 'logs' && (
              <ActivityLog events={events} onClearLog={() => setEvents([])} />
            )}
          </div>
        </div>
      </main>

      {/* ── Demo Modal ── */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        demoType={demoType}
        timeline={demoTimeline}
        isRunning={isDemoRunning}
        result={demoResult}
      />
    </div>
  );
}
