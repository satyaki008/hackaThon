import React from 'react';
import { 
  Zap, 
  AlertTriangle, 
  RotateCcw, 
  Activity,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  AlertOctagon
} from 'lucide-react';

export default function Header({
  pageTitle = 'Dashboard',
  systemStatus = 'OPERATIONAL',
  isLiveSync = false,
  onToggleSync,
  onRefresh,
  onRunAutoRepairDemo,
  onRunCorruptionDemo,
  onResetCluster,
  isDemoRunning = false
}) {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'OPERATIONAL':
        return {
          colors: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
          icon: <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
        };
      case 'DEGRADED':
        return {
          colors: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
          icon: <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
        };
      case 'REPAIRING':
        return {
          colors: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
          icon: <Wrench className="w-3.5 h-3.5 mr-1.5" />
        };
      case 'CRITICAL':
        return {
          colors: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
          icon: <AlertOctagon className="w-3.5 h-3.5 mr-1.5" />
        };
      default:
        return {
          colors: 'text-gray-400 bg-gray-800 border-gray-700',
          icon: <Activity className="w-3.5 h-3.5 mr-1.5" />
        };
    }
  };

  const statusConfig = getStatusStyles(systemStatus);

  return (
    <div className="flex flex-row justify-between items-center px-6 py-4 border-b border-[#1E2736] bg-transparent">
      {/* Left: Title & Breadcrumbs */}
      <div className="flex flex-col">
        <div className="text-xs text-gray-500 font-medium mb-0.5">
          System Control / {pageTitle}
        </div>
        <h1 className="text-lg font-semibold text-white">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center space-x-4">
        
        {/* Status Badge */}
        <div className={`flex items-center px-3 py-1.5 rounded-full border text-xs font-medium ${statusConfig.colors}`}>
          {statusConfig.icon}
          {systemStatus}
        </div>

        {/* Live Sync Toggle */}
        <button
          onClick={onToggleSync}
          disabled={isDemoRunning}
          className={`flex items-center px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            isLiveSync 
              ? 'text-blue-400 bg-blue-400/10 border-blue-400/30 hover:bg-blue-400/20' 
              : 'text-gray-400 bg-[#161B26] border-[#1E2736] hover:bg-[#1E2736]'
          } ${isDemoRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Activity className="w-3.5 h-3.5 mr-1.5" />
          Live Sync {isLiveSync ? 'On' : 'Off'}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[#1E2736]" />

        {/* Simulate Corruption */}
        <button
          onClick={onRunCorruptionDemo}
          disabled={isDemoRunning}
          className={`flex items-center px-3 py-1.5 rounded-lg border text-xs font-medium text-amber-400 bg-amber-400/10 border-amber-400/20 hover:bg-amber-400/20 transition-colors ${isDemoRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
          Simulate Corruption
        </button>

        {/* Simulate Failure */}
        <button
          onClick={onRunAutoRepairDemo}
          disabled={isDemoRunning}
          className={`flex items-center px-3 py-1.5 rounded-lg border text-xs font-medium text-rose-400 bg-rose-400/10 border-rose-400/20 hover:bg-rose-400/20 transition-colors ${isDemoRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Zap className="w-3.5 h-3.5 mr-1.5" />
          Simulate Failure
        </button>

        {/* Reset Button */}
        <button
          onClick={onResetCluster}
          disabled={isDemoRunning}
          title="Reset Cluster"
          className={`p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1E2736] transition-colors ${isDemoRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
