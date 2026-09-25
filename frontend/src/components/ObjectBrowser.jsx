import React, { useState, useRef } from 'react';
import { Upload, Download, Trash2, Search, FileText, Check, Copy, AlertTriangle, ShieldCheck, Bug, RefreshCw } from 'lucide-react';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function ObjectBrowser({
  objects,
  searchQuery,
  onSearchChange,
  onUpload,
  onDownload,
  onDelete,
  onCorruptReplica,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [replicationFactor, setReplicationFactor] = useState(3);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      await onUpload(selectedFile, replicationFactor);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white m-0">Object Storage Browser</h2>
          <p className="text-xs text-slate-400 m-0">
            Replicated distributed files with cryptographic SHA-256 integrity verification
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Upload Box */}
      <form onSubmit={handleUploadSubmit} className="glass-card p-3 rounded-xl border border-slate-800 flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          id="object-file-picker"
        />
        <label
          htmlFor="object-file-picker"
          className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-200 transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          {selectedFile ? selectedFile.name : 'Choose File to Upload'}
        </label>

        {selectedFile && (
          <span className="text-xs text-slate-400">
            ({formatBytes(selectedFile.size)})
          </span>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-slate-400">Replicas:</label>
          <select
            value={replicationFactor}
            onChange={(e) => setReplicationFactor(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value={1}>1x (No redundancy)</option>
            <option value={2}>2x (Mirror)</option>
            <option value={3}>3x (Default HA)</option>
            <option value={4}>4x (Maximum Quad)</option>
          </select>

          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition-all disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Replicating...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Upload & Replicate
              </>
            )}
          </button>
        </div>
      </form>

      {uploadError && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {uploadError}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <th className="py-2.5 px-3 font-medium">Object Name</th>
              <th className="py-2.5 px-3 font-medium">Object ID</th>
              <th className="py-2.5 px-3 font-medium">Size</th>
              <th className="py-2.5 px-3 font-medium">Ver</th>
              <th className="py-2.5 px-3 font-medium">SHA-256 Checksum</th>
              <th className="py-2.5 px-3 font-medium">Replicas ({objects.length > 0 ? objects[0].replication_factor : 3}x)</th>
              <th className="py-2.5 px-3 font-medium">Status</th>
              <th className="py-2.5 px-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {objects.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No objects found in cluster. Upload a file above or run the one-click demo.
                </td>
              </tr>
            ) : (
              objects.map((obj) => (
                <tr key={obj.id} className="hover:bg-slate-900/40 transition-colors">
                  {/* File Name */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="font-medium text-white truncate max-w-[160px]" title={obj.name}>
                        {obj.name}
                      </span>
                    </div>
                  </td>

                  {/* ID */}
                  <td className="py-2.5 px-3 font-mono text-slate-400">
                    <button
                      onClick={() => copyToClipboard(obj.id, `id-${obj.id}`)}
                      className="hover:text-white flex items-center gap-1 transition-colors"
                      title="Click to copy full UUID"
                    >
                      {obj.id.slice(0, 8)}...
                      {copiedId === `id-${obj.id}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-50" />
                      )}
                    </button>
                  </td>

                  {/* Size */}
                  <td className="py-2.5 px-3 text-slate-300 font-mono">{formatBytes(obj.size_bytes)}</td>

                  {/* Version */}
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                      v{obj.version}
                    </span>
                  </td>

                  {/* SHA-256 */}
                  <td className="py-2.5 px-3 font-mono text-slate-400">
                    <button
                      onClick={() => copyToClipboard(obj.checksum, `sha-${obj.id}`)}
                      className="hover:text-cyan-300 flex items-center gap-1 transition-colors"
                      title="Click to copy full SHA-256"
                    >
                      {obj.checksum.slice(0, 10)}...
                      {copiedId === `sha-${obj.id}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-50" />
                      )}
                    </button>
                  </td>

                  {/* Replicas on Nodes */}
                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap items-center gap-1">
                      {obj.replicas.map((rep) => {
                        const isRepHealthy = rep.status === 'HEALTHY';
                        const isCorrupted = rep.status === 'CORRUPTED';
                        return (
                          <span
                            key={rep.id}
                            title={`Node: ${rep.node_id} | Status: ${rep.status}`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                              isCorrupted
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                                : isRepHealthy
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {rep.node_id.replace('node-', 'N')}
                            {isCorrupted ? ' ✗' : ' ✓'}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* Object Status */}
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        obj.status === 'HEALTHY'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : obj.status === 'CORRUPTED'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {obj.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onDownload(obj.id, obj.name)}
                        className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                        title="Download object (with automatic failover)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onCorruptReplica(obj.id)}
                        className="p-1.5 rounded-md hover:bg-amber-950/30 text-amber-400/80 hover:text-amber-300 transition-colors"
                        title="Inject byte corruption on disk for testing self-healing"
                      >
                        <Bug className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(obj.id)}
                        className="p-1.5 rounded-md hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete object and all replicas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
