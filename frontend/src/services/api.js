/**
 * AegisStore REST API Service
 * Handles all communication with the backend controller.
 */

const RAW_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
export const API_BASE = RAW_URL
  ? (RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`)
  : '/api';

export const api = {
  // --- System Stats & Events ---
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch system stats');
    return res.json();
  },

  async getEvents(limit = 100, level = null) {
    const url = level ? `${API_BASE}/events?limit=${limit}&level=${level}` : `${API_BASE}/events?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  // --- Nodes Management & Simulation ---
  async getNodes() {
    const res = await fetch(`${API_BASE}/nodes`);
    if (!res.ok) throw new Error('Failed to fetch nodes');
    return res.json();
  },

  async failNode(nodeId) {
    const res = await fetch(`${API_BASE}/nodes/${nodeId}/fail`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to fail node ${nodeId}`);
    return res.json();
  },

  async recoverNode(nodeId) {
    const res = await fetch(`${API_BASE}/nodes/${nodeId}/recover`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to recover node ${nodeId}`);
    return res.json();
  },

  async setNodeLatency(nodeId, latencyMs) {
    const res = await fetch(`${API_BASE}/nodes/${nodeId}/slow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latency_ms: latencyMs }),
    });
    if (!res.ok) throw new Error(`Failed to set latency for node ${nodeId}`);
    return res.json();
  },

  async togglePartition(nodeA, nodeB, enablePartition) {
    const res = await fetch(`${API_BASE}/nodes/partition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        node_a: nodeA,
        node_b: nodeB,
        enable_partition: enablePartition,
      }),
    });
    if (!res.ok) throw new Error('Failed to toggle partition');
    return res.json();
  },

  // --- Objects API ---
  async getObjects(search = '') {
    const url = search ? `${API_BASE}/objects?search=${encodeURIComponent(search)}` : `${API_BASE}/objects`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch objects');
    return res.json();
  },

  async uploadObject(file, replicationFactor = 3) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('replication_factor', replicationFactor.toString());

    const res = await fetch(`${API_BASE}/objects`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async downloadObject(objectId, filename) {
    const res = await fetch(`${API_BASE}/objects/${objectId}/download`);
    if (!res.ok) throw new Error('Failed to download object');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || objectId;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async deleteObject(objectId) {
    const res = await fetch(`${API_BASE}/objects/${objectId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete object');
    return res.json();
  },

  async corruptReplica(objectId, nodeId = null) {
    const url = nodeId
      ? `${API_BASE}/objects/${objectId}/corrupt-replica?node_id=${nodeId}`
      : `${API_BASE}/objects/${objectId}/corrupt-replica`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to corrupt replica');
    return res.json();
  },

  // --- Replication & Repairs ---
  async getReplicationStatus() {
    const res = await fetch(`${API_BASE}/replication/status`);
    if (!res.ok) throw new Error('Failed to fetch replication status');
    return res.json();
  },

  async getRepairJobs(limit = 20) {
    const res = await fetch(`${API_BASE}/replication/jobs?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch repair jobs');
    return res.json();
  },

  async triggerRepair(objectId = null) {
    const res = await fetch(`${API_BASE}/replication/repair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(objectId ? { object_id: objectId } : {}),
    });
    if (!res.ok) throw new Error('Failed to trigger repair');
    return res.json();
  },

  // --- Integrity Audit ---
  async getIntegrityStatus() {
    const res = await fetch(`${API_BASE}/integrity/status`);
    if (!res.ok) throw new Error('Failed to fetch integrity status');
    return res.json();
  },

  async runIntegrityAudit(autoRepair = true) {
    const res = await fetch(`${API_BASE}/integrity/check?auto_repair=${autoRepair}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to run integrity audit');
    return res.json();
  },

  // --- Storage Rebalancing ---
  async getRebalanceStatus() {
    const res = await fetch(`${API_BASE}/rebalance/status`);
    if (!res.ok) throw new Error('Failed to fetch rebalance status');
    return res.json();
  },

  async triggerRebalance(maxMoves = 5) {
    const res = await fetch(`${API_BASE}/rebalance?max_moves=${maxMoves}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to execute rebalance');
    return res.json();
  },

  // --- One-Click Demos ---
  async runAutoRepairDemo() {
    const res = await fetch(`${API_BASE}/demo/auto-repair`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run auto-repair demo');
    return res.json();
  },

  async runCorruptionDemo() {
    const res = await fetch(`${API_BASE}/demo/corruption-heal`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run corruption demo');
    return res.json();
  },

  async resetCluster() {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset cluster');
    return res.json();
  },

  // --- ResiStore: Cloud Nodes, Erasure Coding & Consistent Hashing ---
  async getCloudNodes() {
    const res = await fetch(`${API_BASE}/resistore/nodes/cloud`);
    if (!res.ok) throw new Error('Failed to fetch cloud nodes');
    return res.json();
  },

  async configureCloudNode(nodeId, uri) {
    const res = await fetch(`${API_BASE}/resistore/nodes/${nodeId}/cloud-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to configure cloud node' }));
      throw new Error(err.detail || 'Failed to configure cloud node');
    }
    return res.json();
  },

  async getHashRingTopology() {
    const res = await fetch(`${API_BASE}/resistore/ring`);
    if (!res.ok) throw new Error('Failed to fetch hash ring');
    return res.json();
  },

  async getNode1MongoStats() {
    const res = await fetch(`${API_BASE}/resistore/node1/mongo`);
    if (!res.ok) throw new Error('Failed to fetch MongoDB stats');
    return res.json();
  },

  async uploadErasureObject(file, bucketName = 'default-bucket', storagePolicy = 'ERASURE_CODING_RS_4_2') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket_name', bucketName);
    formData.append('storage_policy', storagePolicy);
    const res = await fetch(`${API_BASE}/resistore/objects`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload erasure-coded object');
    return res.json();
  },

  async getObjectChunks(objectId) {
    const res = await fetch(`${API_BASE}/resistore/objects/${objectId}/chunks`);
    if (!res.ok) throw new Error('Failed to fetch object chunks');
    return res.json();
  },

  async corruptNode1Chunk(chunkId) {
    const res = await fetch(`${API_BASE}/resistore/node1/corrupt-chunk?chunk_id=${encodeURIComponent(chunkId)}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to corrupt chunk');
    return res.json();
  },

  async autoHealObject(objectId) {
    const res = await fetch(`${API_BASE}/resistore/heal/${objectId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to heal object');
    return res.json();
  },

  // --- Chaos Monkey, Benchmark & Eco-Aware ---
  async triggerChaos(killCount = 1, corrupt = true) {
    const res = await fetch(`${API_BASE}/resilience/chaos/trigger?kill_nodes_count=${killCount}&corrupt_replicas=${corrupt}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Chaos experiment failed');
    return res.json();
  },

  async runBenchmark() {
    const res = await fetch(`${API_BASE}/resilience/benchmark/run`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Benchmark failed to execute');
    return res.json();
  },

  async getErasureMatrix() {
    const res = await fetch(`${API_BASE}/resistore/erasure/matrix`);
    if (!res.ok) throw new Error('Failed to fetch erasure matrix');
    return res.json();
  },

  async simulateErasureRecovery(message, lostShards) {
    const res = await fetch(`${API_BASE}/resistore/erasure/simulate-recovery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, lost_shards: lostShards })
    });
    if (!res.ok) throw new Error('Simulation failed');
    return res.json();
  },

  async listS3Buckets() {
    const res = await fetch(`${API_BASE}/s3`);
    if (!res.ok) throw new Error('Failed to list S3 buckets');
    return res.json();
  },

  async uploadErasureCodedObject(formData) {
    const res = await fetch(`${API_BASE}/resistore/objects`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Erasure upload failed');
    return res.json();
  },

  getErasureDownloadUrl(objectId) {
    return `${API_BASE}/resistore/objects/${objectId}/download`;
  },

  async getMongoNode1Stats() {
    const res = await fetch(`${API_BASE}/resistore/node1/mongo`);
    if (!res.ok) throw new Error('Failed to fetch Node 1 MongoDB stats');
    return res.json();
  }
};
