import React, { useState, useEffect } from 'react';
import { Layers, ShieldAlert, CheckCircle2, Download, Wrench, Sparkles, Upload, Binary, Cpu, RefreshCw, XCircle } from 'lucide-react';
import { api } from '../services/api';

export default function ErasureCodingView({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Cauchy Matrix Simulator State
  const [matrixInfo, setMatrixInfo] = useState(null);
  const [testMessage, setTestMessage] = useState('ResiStore: Fault-Tolerant Distributed Storage Engine with Reed-Solomon Erasure Coding');
  const [destroyedShards, setDestroyedShards] = useState([0, 4]); // D0 and P0 destroyed by default
  const [simResult, setSimResult] = useState(null);
  const [simRunning, setSimRunning] = useState(false);

  useEffect(() => {
    api.getErasureMatrix().then(setMatrixInfo).catch(() => null);
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('storage_policy', 'ERASURE_CODING_RS_4_2');
    formData.append('bucket_name', 'cold-archive');

    try {
      const data = await api.uploadErasureCodedObject(formData);
      setResult(data);
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (objectId, filename) => {
    window.location.href = api.getErasureDownloadUrl(objectId);
  };

  const toggleShardDestroy = (index) => {
    if (destroyedShards.includes(index)) {
      setDestroyedShards(destroyedShards.filter((i) => i !== index));
    } else {
      if (destroyedShards.length >= 2) {
        alert('RS(4+2) can tolerate a maximum of 2 lost shards (any 4 must survive).');
        return;
      }
      setDestroyedShards([...destroyedShards, index]);
    }
  };

  const handleSimulateRecovery = async () => {
    setSimRunning(true);
    try {
      const res = await api.simulateErasureRecovery(testMessage, destroyedShards);
      setSimResult(res);
    } catch (err) {
      alert(err.message || 'Simulation failed');
    } finally {
      setSimRunning(false);
    }
  };

  const shardLabels = ['D0 (Data)', 'D1 (Data)', 'D2 (Data)', 'D3 (Data)', 'P0 (Parity)', 'P1 (Parity)'];

  return (
    <div className="space-y-6">
      {/* ── 1. REAL RS(4+2) ENCODING PIPELINE ── */}
      <div className="bg-[#161B26] border border-[#1E2736] rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white m-0">
                Reed-Solomon RS(4+2) Erasure Coding Engine
              </h2>
              <p className="text-xs text-slate-400 m-0">
                Galois Field GF(2^8) Cauchy Matrix &bull; 4 Data + 2 Parity Shards (50% Storage Overhead vs 200% Replication)
              </p>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <form onSubmit={handleUpload} className="bg-[#0B0F17] p-4 rounded-xl border border-[#1E2736] flex flex-wrap items-center gap-3">
          <input
            type="file"
            id="erasure-file-picker"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <label
            htmlFor="erasure-file-picker"
            className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-[#161B26] border border-[#1E2736] hover:border-slate-600 text-xs font-medium text-slate-200 transition-colors"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            {file ? file.name : 'Choose File to Encode with RS(4+2)'}
          </label>

          {file && (
            <span className="text-xs text-slate-400 font-mono">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="ml-auto flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-950/50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {uploading ? 'Dispersing Shards...' : 'Encode & Disperse Shards'}
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Resulting Shards Breakdown */}
        {result && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Object Encoded: {result.name} ({result.size_bytes} bytes)
              </span>
              <button
                onClick={() => handleDownload(result.object_id, result.name)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs hover:bg-emerald-600/30 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Decode & Download Original
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(result.shards || []).map((s) => (
                <div
                  key={s.chunk_index}
                  className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 ${
                    s.type === 'DATA'
                      ? 'bg-blue-950/20 border-blue-500/30 text-blue-200'
                      : 'bg-purple-950/20 border-purple-500/30 text-purple-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold">
                      {s.type === 'DATA' ? `D${s.chunk_index}` : `P${s.chunk_index - 4}`}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700">
                      {s.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 m-0">Target: {s.node_id}</p>
                  <p className="text-[10px] text-slate-500 m-0 truncate" title={s.checksum}>
                    {s.checksum.slice(0, 8)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. INTERACTIVE CAUCHY GF(2^8) SHARD LOSS & RECONSTRUCTION SIMULATOR ── */}
      <div className="bg-[#161B26] border border-[#1E2736] rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Binary className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white m-0">
                Interactive Cauchy Matrix Shard Loss & Solver Simulator
              </h3>
              <p className="text-xs text-slate-400 m-0">
                Kill any 1 or 2 shards below, then watch Galois Field GF(2^8) matrix inversion solve and reconstruct the lost bytes!
              </p>
            </div>
          </div>

          <button
            onClick={handleSimulateRecovery}
            disabled={simRunning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Cpu className="w-4 h-4" />
            {simRunning ? 'Inverting Cauchy Matrix...' : 'Solve Cauchy Matrix & Reconstruct'}
          </button>
        </div>

        {/* Test Payload Input */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Test Payload String:
          </label>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#1E2736] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* 6 Shard Blade Toggles */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-400">
            Click Shards to Destroy / Restore (Selected for Loss: {destroyedShards.length}/2):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {shardLabels.map((lbl, idx) => {
              const isDestroyed = destroyedShards.includes(idx);
              const isData = idx < 4;
              return (
                <div
                  key={idx}
                  onClick={() => toggleShardDestroy(idx)}
                  className={`p-4 rounded-xl border text-center cursor-pointer transition-all duration-300 relative select-none ${
                    isDestroyed
                      ? 'bg-rose-950/20 border-rose-500/50 text-rose-300'
                      : isData
                      ? 'bg-[#0B0F17] border-blue-500/30 text-blue-200 hover:border-blue-400'
                      : 'bg-[#0B0F17] border-purple-500/30 text-purple-200 hover:border-purple-400'
                  }`}
                >
                  <div className="text-sm font-bold font-mono">{lbl}</div>
                  <div className="mt-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        isDestroyed
                          ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isDestroyed ? 'DESTROYED ✗' : 'SURVIVING ✓'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simulation Output */}
        {simResult && (
          <div className="bg-[#0B0F17] border border-emerald-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              {simResult.verdict}
            </div>
            <p className="text-xs text-slate-300 font-mono m-0">
              <b>Math Solver:</b> {simResult.math_engine} &bull; Survived <b>{6 - destroyedShards.length}/6</b> shards
            </p>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 break-all">
              <b>Reconstructed Payload:</b> "{simResult.reconstructed_message}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
