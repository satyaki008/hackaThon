import React, { useState } from 'react';
import { 
  Zap, Flame, Gauge, Leaf, Code2, Play, CheckCircle2, 
  AlertTriangle, Copy, Check, Terminal, Cpu, Database, ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function ChaosBenchmarkView() {
  const [activeSubTab, setActiveSubTab] = useState('chaos'); // 'chaos', 'benchmark', 's3'
  
  // Chaos State
  const [isChaosRunning, setIsChaosRunning] = useState(false);
  const [chaosResult, setChaosResult] = useState(null);
  
  // Benchmark State
  const [isBenchmarkRunning, setIsBenchmarkRunning] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState(null);

  // Copy state
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleRunChaos = async () => {
    setIsChaosRunning(true);
    setChaosResult(null);
    try {
      const res = await api.triggerChaos(1, true);
      setChaosResult(res);
    } catch (err) {
      console.error(err);
      alert('Chaos execution failed. See console.');
    } finally {
      setIsChaosRunning(false);
    }
  };

  const handleRunBenchmark = async () => {
    setIsBenchmarkRunning(true);
    setBenchmarkResult(null);
    try {
      const res = await api.runBenchmark();
      setBenchmarkResult(res);
    } catch (err) {
      console.error(err);
      alert('Benchmark failed. See console.');
    } finally {
      setIsBenchmarkRunning(false);
    }
  };

  const copyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const boto3Code = `import boto3

# Connect official AWS Boto3 SDK directly to ResiStore!
s3 = boto3.client(
    's3',
    endpoint_url='http://127.0.0.1:8000/api/s3',
    aws_access_key_id='resistore-root',
    aws_secret_access_key='resistore-secret',
    region_name='us-east-1'
)

# 1. Create a Bucket
s3.create_bucket(Bucket='production-backups')

# 2. Upload an Object with streaming replication
s3.put_object(
    Bucket='production-backups',
    Key='database/snapshot_2026.sql',
    Body=b'-- ResiStore Self-Healing Distributed Database Backup\\nSELECT *;'
)
print("Uploaded successfully via AWS Boto3 SDK!")

# 3. Download Object with Automatic Failover
response = s3.get_object(Bucket='production-backups', Key='database/snapshot_2026.sql')
print("Read content:", response['Body'].read().decode('utf-8'))
`;

  return (
    <div className="space-y-6">
      {/* Sub-Navigation */}
      <div className="flex items-center gap-2 border-b border-[#1E2736] pb-3">
        <button
          onClick={() => setActiveSubTab('chaos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'chaos'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-400" />
          Chaos Monkey Arena
        </button>

        <button
          onClick={() => setActiveSubTab('benchmark')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'benchmark'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Gauge className="w-4 h-4 text-cyan-400" />
          Performance & Eco-Aware Benchmark
        </button>

        <button
          onClick={() => setActiveSubTab('s3')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 's3'
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Code2 className="w-4 h-4 text-indigo-400" />
          AWS S3 SDK Integration
        </button>
      </div>

      {/* ── 1. CHAOS MONKEY ARENA ── */}
      {activeSubTab === 'chaos' && (
        <div className="space-y-5">
          <div className="bg-[#161B26] border border-[#1E2736] rounded-xl p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-rose-400" />
                  <h2 className="text-lg font-bold text-white m-0">Chaos Monkey Cascade Resilience Engine</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Injects random node crashes and silent on-disk bit-rot to verify zero-data-loss recovery and measure live MTTR.
                </p>
              </div>

              <button
                onClick={handleRunChaos}
                disabled={isChaosRunning}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Zap className={`w-4 h-4 ${isChaosRunning ? 'animate-bounce' : ''}`} />
                {isChaosRunning ? 'Executing Chaos Experiment...' : 'Release Chaos Monkey'}
              </button>
            </div>
          </div>

          {chaosResult && (
            <div className="space-y-4">
              {/* Verdict KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#161B26] border border-emerald-500/30 rounded-xl p-4">
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Mean Time to Recovery (MTTR)</span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{chaosResult.mttr_ms} ms</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Autonomous peer synthesis</p>
                </div>

                <div className="bg-[#161B26] border border-cyan-500/30 rounded-xl p-4">
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Data Loss Rate</span>
                  <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">{chaosResult.data_loss_percentage}%</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Zero unrecoverable chunks</p>
                </div>

                <div className="bg-[#161B26] border border-indigo-500/30 rounded-xl p-4">
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Resilience Score</span>
                  <div className="text-2xl font-bold text-indigo-400 mt-1">{chaosResult.resilience_grade}</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Quorum Consensus Verified</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-[#161B26] border border-[#1E2736] rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Experiment Timeline Log</h3>
                <div className="space-y-2">
                  {chaosResult.timeline.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#0B0F17] border border-[#1E2736] text-xs">
                      <div className="p-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        #{step.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-mono">{step.event}</span>
                          <span className="text-[10px] text-slate-500">{new Date(step.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-400 mt-0.5 m-0">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 2. BENCHMARK & ECO-AWARE ── */}
      {activeSubTab === 'benchmark' && (
        <div className="space-y-5">
          <div className="bg-[#161B26] border border-[#1E2736] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Gauge className="w-6 h-6 text-cyan-400" />
                <h2 className="text-lg font-bold text-white m-0">Cluster Benchmark & Eco-Aware Calculator</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Executes parallel multi-node writes to measure real IOPS, throughput, and calculate carbon footprint reduction via Reed-Solomon RS(4+2).
              </p>
            </div>

            <button
              onClick={handleRunBenchmark}
              disabled={isBenchmarkRunning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/50 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Play className={`w-4 h-4 fill-current ${isBenchmarkRunning ? 'animate-spin' : ''}`} />
              {isBenchmarkRunning ? 'Running Synthetic Workload...' : 'Run Benchmark Now'}
            </button>
          </div>

          {benchmarkResult && (
            <div className="space-y-5">
              {/* Performance Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#161B26] border border-[#1E2736] rounded-xl p-4">
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Cluster IOPS</span>
                  <div className="text-2xl font-bold text-white mt-1 font-mono">{benchmarkResult.iops}</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">64 KB Block Transfers</p>
                </div>

                <div className="bg-[#161B26] border border-[#1E2736] rounded-xl p-4">
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Throughput</span>
                  <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">{benchmarkResult.throughput_mb_s} MB/s</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Concurrent Dispersal</p>
                </div>

                <div className="bg-[#161B26] border border-[#1E2736] rounded-xl p-4">
                  <span className="text-[11px] text-slate-400 uppercase font-mono">P50 Latency</span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{benchmarkResult.latency_percentiles_ms.p50} ms</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Median write round-trip</p>
                </div>

                <div className="bg-[#161B26] border border-[#1E2736] rounded-xl p-4">
                  <span className="text-[11px] text-slate-400 uppercase font-mono">P99 Latency</span>
                  <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{benchmarkResult.latency_percentiles_ms.p99} ms</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tail latency</p>
                </div>
              </div>

              {/* Eco-Aware Green Storage Banner */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-[#161B26] to-teal-950/40 border border-emerald-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white m-0">Eco-Aware Green Storage Footprint (ESG Model)</h3>
                    <p className="text-xs text-slate-400 m-0">
                      Reed-Solomon RS(4+2) vs Traditional 3x Replication Efficiency
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                  <div className="bg-[#0B0F17]/80 border border-emerald-500/20 rounded-xl p-4">
                    <span className="text-[11px] text-emerald-400 font-mono">Raw Storage Reduction</span>
                    <div className="text-2xl font-bold text-white mt-1 font-mono">50.0%</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Overhead drops from 300% (3x) to 150% (4+2)</p>
                  </div>

                  <div className="bg-[#0B0F17]/80 border border-teal-500/20 rounded-xl p-4">
                    <span className="text-[11px] text-teal-400 font-mono">Annual Energy Saved</span>
                    <div className="text-2xl font-bold text-white mt-1 font-mono">
                      {benchmarkResult.eco_aware_metrics.estimated_kwh_saved_annually} kWh
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Disk spindown & server thermal savings</p>
                  </div>

                  <div className="bg-[#0B0F17]/80 border border-cyan-500/20 rounded-xl p-4">
                    <span className="text-[11px] text-cyan-400 font-mono">Carbon Emission Offset</span>
                    <div className="text-2xl font-bold text-white mt-1 font-mono">
                      {benchmarkResult.eco_aware_metrics.carbon_offset_kg_co2} kg CO₂e
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Annualized carbon mitigation</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 3. S3 SDK INTEGRATION ── */}
      {activeSubTab === 's3' && (
        <div className="space-y-4">
          <div className="bg-[#161B26] border border-[#1E2736] rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white m-0">AWS Boto3 & S3 CLI Compatibility</h3>
              </div>

              <button
                onClick={() => copyCode(boto3Code)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-mono hover:bg-indigo-500/20 transition-all cursor-pointer"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSnippet ? 'Copied to Clipboard!' : 'Copy Python Script'}
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              ResiStore exposes standard AWS S3 REST endpoints (<code className="text-indigo-300">/api/s3</code>). You can run this exact Python script on any computer without installing special software:
            </p>

            <pre className="bg-[#0B0F17] border border-[#1E2736] rounded-xl p-4 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
              {boto3Code}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
