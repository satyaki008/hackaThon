import React from 'react';
import { 
  LayoutDashboard, Database, Layers, Network, 
  Heart, ShieldCheck, Scale, Terminal, Shield, 
  ChevronLeft, ChevronRight, Server, Flame
} from 'lucide-react';

export default function Sidebar({
  activeSection = 'overview',
  onSectionChange,
  isCollapsed = false,
  onToggleCollapse,
  stats,
  badges = {}
}) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'objects', label: 'Objects', icon: Database, badge: badges?.objects },
    { id: 'erasure', label: 'Erasure Coding', icon: Layers },
    { id: 'chaos', label: 'Chaos & Benchmarks', icon: Flame },
    { id: 'topology', label: 'Topology', icon: Network },
    { id: 'repairs', label: 'Self-Healing', icon: Heart, badge: badges?.repairs },
    { id: 'integrity', label: 'Integrity', icon: ShieldCheck },
    { id: 'rebalance', label: 'Rebalance', icon: Scale },
    { id: 'logs', label: 'Audit Log', icon: Terminal, badge: badges?.events },
  ];

  const totalNodes = stats?.total_nodes || 0;
  const healthyNodes = stats?.healthy_nodes || 0;
  const systemStatus = stats?.system_status || 'unknown';

  const statusColor = 
    systemStatus === 'healthy' ? 'bg-emerald-500' :
    systemStatus === 'degraded' ? 'bg-amber-500' :
    systemStatus === 'critical' ? 'bg-red-500' : 'bg-gray-500';

  return (
    <div 
      className={`
        flex flex-col h-full bg-[#0D1117] border-r border-[#1E2736] 
        transition-all duration-300 ease-in-out shrink-0
        ${isCollapsed ? 'w-[64px]' : 'w-[240px]'}
      `}
    >
      {/* Header */}
      <div className="flex items-center h-16 px-4 border-b border-[#1E2736] shrink-0">
        <div className="flex items-center justify-center min-w-[32px] h-8 text-cyan-400">
          <Shield size={24} />
        </div>
        {!isCollapsed && (
          <div className="flex items-center ml-3 overflow-hidden whitespace-nowrap">
            <span className="text-white font-semibold text-lg tracking-wide">ResiStore</span>
            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 rounded">
              v1.0
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange?.(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`
                w-full flex items-center h-10 rounded-lg group transition-colors relative
                ${isCollapsed ? 'justify-center px-0' : 'px-3'}
                ${isActive 
                  ? 'bg-[#1E2736] text-cyan-400' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E2736]/50'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full" />
              )}
              
              <Icon 
                size={20} 
                className={`shrink-0 ${isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-gray-300'}`} 
              />
              
              {!isCollapsed && (
                <>
                  <span className="ml-3 text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                  {item.badge > 0 && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-400/10 text-cyan-400">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </>
              )}
              {isCollapsed && item.badge > 0 && (
                <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-[#0D1117]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / Status */}
      <div className="shrink-0 border-t border-[#1E2736] p-3">
        {!isCollapsed ? (
          <div className="mb-3 px-3 py-2 rounded-lg bg-[#161B26] border border-[#1E2736] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server size={14} className="text-gray-400" />
              <span className="text-xs text-gray-300">
                {healthyNodes}/{totalNodes} Nodes
              </span>
            </div>
            <div className={`w-2 h-2 rounded-full ${statusColor} shadow-[0_0_8px_currentColor]`} />
          </div>
        ) : (
          <div 
            className="mb-3 flex justify-center py-2"
            title={`${healthyNodes}/${totalNodes} Nodes Online`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${statusColor} shadow-[0_0_8px_currentColor]`} />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={`
            w-full flex items-center h-10 rounded-lg text-gray-400 hover:text-white hover:bg-[#1E2736]/50 transition-colors
            ${isCollapsed ? 'justify-center' : 'px-3'}
          `}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <>
              <ChevronLeft size={20} className="shrink-0" />
              <span className="ml-3 text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
