# ResiStore: Enterprise Self-Healing Distributed Object Storage System

[![Python Version](https://img.shields.io/badge/python-3.12%20%7C%203.13-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/tests-19%20passed-brightgreen.svg)]()
[![S3 Compatible](https://img.shields.io/badge/S3%20API-Compatible-orange.svg)]()
[![MongoDB Atlas](https://img.shields.io/badge/Cloud%20Tier-MongoDB%20Atlas-green.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

> **ResiStore** is an enterprise-grade, fault-tolerant, self-healing distributed object storage system designed for modern cloud resilience. It features configurable N-way replication, Reed-Solomon RS(4+2) Erasure Coding, Quorum write/read consensus, S3-compatible REST API, real-time silent bit-rot detection, automated peer repair, background storage rebalancing, Chaos Monkey resilience testing, and hybrid multi-node MongoDB Atlas cloud tiering.

---

## 📑 Table of Contents
1. [Problem Statement & Architectural Alignment](#1-problem-statement--architectural-alignment)
2. [Key Architecture & Core Features](#2-key-architecture--core-features)
3. [System Architecture Diagram](#3-system-architecture-diagram)
4. [Technology Stack](#4-technology-stack)
5. [Quick Start (Local Laptop Run)](#5-quick-start-local-laptop-run)
6. [3-Minute Hackathon / Judge Demo Walkthrough](#6-3-minute-hackathon--judge-demo-walkthrough)
7. [Automated Testing Suite (19 Passed)](#7-automated-testing-suite-19-passed)
8. [Advanced Distributed Mechanisms](#8-advanced-distributed-mechanisms)
   - [S3-Compatible REST Gateway & AWS Boto3 Integration](#s3-compatible-rest-gateway--aws-boto3-integration)
   - [Reed-Solomon RS(4+2) Cauchy Matrix Erasure Coding](#reed-solomon-rs42-cauchy-matrix-erasure-coding)
   - [Hybrid Multi-Node Cloud Tiering (MongoDB Atlas)](#hybrid-multi-node-cloud-tiering-mongodb-atlas)
   - [Chaos Monkey Resilience Arena & Benchmarking](#chaos-monkey-resilience-arena--benchmarking)
   - [Quorum Consensus ($W \ge 2, R \ge 2$)](#quorum-consensus-w-ge-2-r-ge-2)
   - [Autonomous Self-Healing & Peer Repair](#autonomous-self-healing--peer-repair)
   - [Silent Bit-Rot Auditing (SHA-256)](#silent-bit-rot-auditing-sha-256)
   - [Capacity Skew Analysis & Safe Rebalancing](#capacity-skew-analysis--safe-rebalancing)
9. [REST & S3 API Reference](#9-rest--s3-api-reference)
10. [College Viva & Interview Q&A Cheatsheet](#10-college-viva--interview-qa-cheatsheet)
11. [Project Directory Structure](#11-project-directory-structure)

---

## 1. Problem Statement & Architectural Alignment

| Problem Requirement | ResiStore Engineering Implementation |
|---|---|
| **Fault-Tolerant Distributed Storage** | 4 independently operating storage daemons (ports 8001–8004) with isolated physical disk volumes + live MongoDB Atlas Cloud node. |
| **Concurrent Reads & Writes** | Per-object `asyncio.Lock` eliminates race conditions; SQLite Write-Ahead Logging (`PRAGMA journal_mode=WAL`) provides high-concurrency metadata transactions. |
| **Configurable Durability Policies** | Dynamic $1\times$ to $4\times$ replication factor and Reed-Solomon $RS(4+2)$ Erasure Coding ($4$ data + $2$ parity chunks). |
| **Node Failures & Crash Recovery** | Non-blocking heartbeat monitor checks node liveness every 3s (2s timeout); automatic failover redirects requests to surviving replicas. |
| **Partial Network Partitions** | Partition isolation endpoints (`POST /api/nodes/partition`); quorum rules prevent split-brain writes. |
| **Silent Bit-Rot / Data Corruption** | Background SHA-256 verification detects corrupted bytes on disk and performs automated peer restoration without downtime. |
| **Replica Inconsistency & Self-Healing** | Under-replicated objects are automatically detected; healing engine streams clean replicas to healthy spare nodes to restore target redundancy. |
| **Background Rebalancing** | Skew detector calculates load variance across disks; safe 2-phase migration moves replicas without deleting source until target verification succeeds. |
| **S3 Ecosystem Compatibility** | Full REST S3 Gateway (`/s3/{bucket}/{key}`) supports standard AWS SDKs (`boto3`, MinIO client, `curl`). |
| **Chaos Resilience & Eco-Aware ESG** | Integrated Chaos Monkey injection testing with real-time MTTR tracking and Eco-Aware green storage carbon footprint calculations. |

---

## 2. Key Architecture & Core Features

### 🌟 What Makes ResiStore Stand Out?
1. **Hybrid Cloud Multi-Node Storage**: Unlike purely mocked systems, **Node 1 is backed by live MongoDB Atlas Cloud** (`cluster0.i7avjwe.mongodb.net`, ping ~40ms). Nodes 2–4 support instant dynamic cloud registration via the dashboard.
2. **Reed-Solomon RS(4+2) Erasure Coding**: Implements Cauchy distribution matrices over Galois Field $GF(2^8)$. Reconstructs original data even after 2 nodes are completely destroyed, saving **50% storage overhead** compared to $3\times$ replication.
3. **Chaos Monkey Arena**: 1-click stress testing that crashes random nodes and injects disk corruption simultaneously, demonstrating automated recovery with **0% data loss** and sub-second MTTR.
4. **S3 REST API Gateway**: Direct drop-in compatibility with AWS S3 commands and Python `boto3`.
5. **Obsidian Dark Monitoring UI**: Datadog/Vercel-inspired dashboard with live SVG sparklines, real-time terminal feed, Quorum Cockpit, and 30-second Judge Live Demo mode.

---

## 3. System Architecture Diagram

```
                                      [ Client Applications ]
                       ┌─────────────────────────┴─────────────────────────┐
                       │                                                   │
                       ▼ (Standard S3 SDK / boto3)                         ▼ (REST / Web Dashboard)
                ┌──────────────┐                                    ┌──────────────┐
                │  /s3 Gateway │                                    │  /api Routes │
                └──────┬───────┘                                    └──────┬───────┘
                       │                                                   │
                       └─────────────────────────┬─────────────────────────┘
                                                 ▼
                              ┌─────────────────────────────────────┐
                              │     ResiStore Controller Gateway    │
                              │    FastAPI Gateway • Port 8000      │
                              │  SQLite WAL Metadata • Object Locks │
                              └──────────────────┬──────────────────┘
                                                 │
      ┌────────────────────────┬─────────────────┴───────────────┬────────────────────────┐
      ▼ (HTTP / Cloud API)     ▼ (HTTP Port 8002)                ▼ (HTTP Port 8003)       ▼ (HTTP Port 8004)
┌───────────────┐        ┌───────────────┐                 ┌───────────────┐        ┌───────────────┐
│ Storage Node  │        │ Storage Node  │                 │ Storage Node  │        │ Storage Node  │
│ 1 (Alpha)     │        │ 2 (Beta)      │                 │ 3 (Gamma)     │        │ 4 (Delta)     │
│ Port 8001     │        │ Port 8002     │                 │ Port 8003     │        │ Port 8004     │
│ MongoDB Atlas │        │ Local Disk    │                 │ Local Disk    │        │ Local Disk    │
│ [LIVE CLOUD]  │        │ [STANDBY]     │                 │ [STANDBY]     │        │ [STANDBY]     │
└───────┬───────┘        └───────┬───────┘                 └───────┬───────┘        └───────┬───────┘
        │                        │                                 │                        │
        └────────────────────────┴─────────────────────────────────┴────────────────────────┘
                                                 ▲
                                                 │  (Autonomous Self-Healing & Peer Repair)
                                                 │  (Reed-Solomon RS(4+2) GF(2^8) Reconstruction)
```

---

## 4. Technology Stack

| Layer | Technologies |
|---|---|
| **Backend Gateway** | Python 3.12 / 3.13, FastAPI, Uvicorn, Pydantic v2, HTTPX |
| **Metadata Engine** | SQLite with Write-Ahead Logging (`PRAGMA journal_mode=WAL`), SQLAlchemy 2.0 |
| **Cloud Tier** | MongoDB Atlas Cloud Cluster (Motor / PyMongo async adapter) |
| **Erasure Coding** | Reed-Solomon $RS(4+2)$ Galois Field $GF(2^8)$ Cauchy Distribution Matrix |
| **Distributed Nodes** | Standalone FastAPI HTTP Storage Daemons (`node_server.py`) |
| **Frontend UI** | React 18, Vite, Tailwind CSS v4, Lucide Icons, SVG Sparklines |
| **Test Automation** | Pytest, Pytest-Asyncio, HTTPX ASGI Transport (19/19 passing) |
| **Orchestration** | Single-command launcher (`run_system.py`), Docker Compose |

---

## 5. Quick Start (Local Laptop Run)

### Step 1: Install Backend Requirements
```bash
pip install -r backend/requirements.txt
```

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Step 3: Launch Cluster & Gateway (Single Command)
```bash
python scripts/run_system.py
```
* Controller Gateway: **http://127.0.0.1:8000**
* Interactive Swagger Docs: **http://127.0.0.1:8000/docs**
* Node 1 (MongoDB Atlas Cloud): Connected & verified
* Nodes 2–4: Storage Daemons listening on ports `8002`, `8003`, `8004`

### Step 4: Launch Frontend Dashboard
In a second terminal window:
```bash
cd frontend
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 6. 3-Minute Hackathon / Judge Demo Walkthrough

When presenting to judges, follow this **tested 3-minute script**:

### Minute 1: The Overview & Architecture
1. Open the dashboard at `http://localhost:5173`.
2. Point to the **Node Grid**:
   > *"Notice Node 1 is tagged `[ACTIVE CLOUD]` connected to our live MongoDB Atlas cluster, while Nodes 2–4 represent distributed edge storage blades. Each blade has real-time latency sparklines."*
3. Show the **1-Click Quorum Cockpit** at the bottom of the Overview tab:
   - Click **"Test Quorum Write (2x)"**.
   - Watch the live terminal feed log parallel writes across nodes and commit only after Quorum ($W \ge 2$) SHA-256 validation.

### Minute 2: S3 Compatibility & Reed-Solomon Erasure Coding
1. Navigate to the **Erasure Coding** tab:
   - Explain: *"Traditional 3x replication has 200% storage overhead. With our Reed-Solomon RS(4+2) Galois Field engine, we split data into 4 data shards and 2 Cauchy parity shards, cutting storage overhead down to just 50%."*
   - Click **"Simulate Shard Destruction"** to destroy Shard 2 and Shard 5.
   - Click **"Reconstruct Data"**: Show the GF(2^8) Cauchy matrix invert and restore 100% of the original data with zero data loss!
2. Navigate to **Chaos & Benchmarks**:
   - Point out the **AWS Boto3 SDK snippet**: *"Any standard Python script or S3 tool can connect to ResiStore using standard S3 REST endpoints (`/s3`)."*

### Minute 3: Chaos Monkey Resilience & 30-Second Live Demo
1. In the **Chaos & Benchmarks** tab, click **"Trigger Chaos Monkey"**:
   - Watch it crash a node, inject bit-rot, detect the failure in under 2 seconds, trigger autonomous peer self-healing, and measure **MTTR (Mean Time to Recovery)** with **0% data loss**.
2. Or click the **"✨ Judge Live Demo (30s)"** button in the header navbar to run the automated 10-step self-healing sequence before the judges' eyes!

---

## 7. Automated Testing Suite (19 Passed)

ResiStore includes 19 rigorous unit and integration tests covering all distributed failure modes:

```bash
python -m pytest backend/tests/ -v
```

```
collected 19 items

backend\tests\test_resistore.py .....                                    [ 26%]
backend\tests\test_system.py ...........                                 [ 84%]
backend\tests\test_upgrades.py ...                                       [100%]

======================== 19 passed in 2.61s ========================
```

### Test Suite Highlights:
- `test_01_upload_and_replication`: Tests parallel upload, SHA-256 validation, and placement.
- `test_02_download_object`: Verifies byte-level integrity on retrieval.
- `test_03_download_failover`: Crashes node holding replica; verifies transparent failover to peer replica.
- `test_04_delete_object`: Verifies atomic deletion across nodes and metadata.
- `test_05_node_failure_and_recovery`: Validates node state transitions.
- `test_06_automatic_replica_repair`: Fails replica node; verifies automatic repair to spare Node 4.
- `test_07_corrupted_replica_detection_and_repair`: Tampers with bytes on disk; verifies SHA-256 detection and peer healing.
- `test_08_concurrent_operations`: Tests parallel concurrent uploads and downloads.
- `test_09_storage_rebalancing`: Tests capacity skew detection and safe 2-phase migration.
- `test_10_network_partition`: Tests partitioned network isolation and quorum safety.
- `test_11_interactive_demo_scenarios`: Tests end-to-end automated demo pipelines.
- `test_s3_gateway_endpoints`: Tests S3 PUT/GET/HEAD/DELETE bucket and object operations.
- `test_chaos_monkey_execution`: Tests automated fault injection and MTTR measurement.
- `test_resilience_benchmark`: Validates IOPS, throughput, latency percentiles, and Eco-Aware calculations.

---

## 8. Advanced Distributed Mechanisms

### S3-Compatible REST Gateway & AWS Boto3 Integration
ResiStore implements native S3 REST API emulation (`/s3/{bucket}/{key}`). Applications written for Amazon S3 can connect without code modification:

```python
import boto3

s3 = boto3.client(
    's3',
    endpoint_url='http://127.0.0.1:8000/s3',
    aws_access_key_id='resistore-key',
    aws_secret_access_key='resistore-secret',
    region_name='us-east-1'
)

# Upload object
s3.put_object(Bucket='finance', Key='q4_report.pdf', Body=b'Confidential Financial Data')

# Download object (with transparent self-healing failover)
response = s3.get_object(Bucket='finance', Key='q4_report.pdf')
print(response['Body'].read().decode('utf-8'))
```

### Reed-Solomon RS(4+2) Cauchy Matrix Erasure Coding
- **Galois Field**: Operates over $GF(2^8)$ using standard AES irreducible polynomial $x^8 + x^4 + x^3 + x + 1$ (0x11B).
- **Cauchy Generator Matrix**: Generates $M=2$ parity shards from $K=4$ data shards:
  $$P_i = \sum_{j=1}^{K} A_{i,j} \cdot D_j \pmod{GF(2^8)}$$
- **Fault Tolerance**: Any $K=4$ surviving shards out of the total $N=6$ are mathematically sufficient to invert the generator matrix and reconstruct missing data.
- **Storage Savings**: Reduces raw storage overhead from **200% (3x replication)** down to **50% (RS 4+2)**, delivering dramatic hardware and electricity cost reductions.

### Hybrid Multi-Node Cloud Tiering (MongoDB Atlas)
- **Node 1**: Linked to production MongoDB Atlas Cloud (`cluster0.i7avjwe.mongodb.net`).
- **Dynamic Registration**: Nodes 2–4 can be connected to custom MongoDB Atlas clusters or local simulated daemons on demand through the UI.
- **Resilience**: If local storage drives fail or laptop storage fills up, cloud-backed replicas ensure permanent survivability.

### Chaos Monkey Resilience Arena & Benchmarking
- Simulates sudden power loss, node crashes, and silent disk byte tampering.
- Measures **Mean Time to Recovery (MTTR)** in milliseconds.
- Computes **IOPS**, **Throughput (MB/s)**, and **Latency percentiles ($P_{50}, P_{95}, P_{99}$)**.
- **Eco-Aware ESG Calculator**: Demonstrates kWh electricity savings and carbon offset achieved through erasure coding optimization.

### Quorum Consensus ($W \ge 2, R \ge 2$)
- Writes require confirmation from at least 2 independent nodes with matching SHA-256 hashes before client response.
- Partial writes that fail to achieve quorum are rolled back automatically.

### Autonomous Self-Healing & Peer Repair
- Background Failure Detector pings nodes every 3 seconds.
- When a node is declared offline, under-replicated objects are queued for healing.
- A healthy peer streams pristine replica data to an available spare node without user intervention.

### Silent Bit-Rot Auditing (SHA-256)
- Audits recalculate SHA-256 checksums from physical storage media.
- If a hash mismatch occurs (e.g. disk sector decay or malware tampering), the corrupted replica is quarantined and overwritten with a verified copy from a healthy peer node.

### Capacity Skew Analysis & Safe Rebalancing
- Monitors disk utilization across all nodes.
- When skew exceeds 20%, migrations are scheduled.
- **Zero-Loss Guarantee**: The source replica is never unlinked or deleted until the destination replica is completely written, SHA-256 verified, and committed to metadata.

---

## 9. REST & S3 API Reference

### Core Object Operations
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/objects` | Upload file with configurable replication factor ($1\times - 4\times$) |
| `GET` | `/api/objects` | List all objects with replica node mappings and health status |
| `GET` | `/api/objects/{id}/download` | Download file with transparent replica failover |
| `DELETE` | `/api/objects/{id}` | Safely delete object and physical replicas across all nodes |
| `POST` | `/api/objects/{id}/corrupt-replica` | Test endpoint: Inject bit-rot into physical disk replica |

### S3 Compatible Gateway
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/s3` | List buckets |
| `PUT` | `/s3/{bucket}` | Create bucket |
| `GET` | `/s3/{bucket}` | List objects in bucket |
| `PUT` | `/s3/{bucket}/{key}` | Upload object (S3 compatible) |
| `GET` | `/s3/{bucket}/{key}` | Download object (S3 compatible) |
| `HEAD` | `/s3/{bucket}/{key}` | Get object metadata / ETag |
| `DELETE` | `/s3/{bucket}/{key}` | Delete object |

### Resilience & Chaos Monkey
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/resilience/chaos/trigger` | Inject node crash + bit-rot, measure MTTR |
| `POST` | `/api/resilience/benchmark/run` | Execute IOPS, throughput & ESG benchmark |
| `GET` | `/api/resistore/erasure/matrix` | Get Reed-Solomon Cauchy generator matrix |
| `POST` | `/api/resistore/erasure/simulate-recovery` | Simulate RS(4+2) shard destruction & recovery |
| `POST` | `/api/resistore/nodes/{id}/cloud-config` | Dynamically attach MongoDB Atlas Cloud to node |

### Fault Injection & Node Management
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/nodes` | List nodes with live ping, status, and disk capacity |
| `POST` | `/api/nodes/{id}/fail` | Simulate node crash / offline |
| `POST` | `/api/nodes/{id}/recover` | Recover node back to online |
| `POST` | `/api/nodes/{id}/slow` | Inject artificial network/disk latency |
| `POST` | `/api/nodes/partition` | Isolate node via network partition |
| `POST` | `/api/replication/repair` | Trigger automated replica self-healing |
| `POST` | `/api/integrity/check` | Trigger deep SHA-256 audit and peer repair |
| `POST` | `/api/rebalance` | Execute capacity skew rebalancing |

---

## 10. College Viva & Interview Q&A Cheatsheet

### Q1: What is the CAP theorem trade-off in ResiStore?
> **Answer**: ResiStore prioritizes **Consistency and Partition Tolerance (CP)**. By enforcing a Write Quorum of $W \ge 2$, the system guarantees that stale or conflicting writes are never acknowledged during a network partition. If a partition prevents quorum, writes are safely rejected to preserve strict data integrity.

### Q2: How does ResiStore prevent split-brain during a network partition?
> **Answer**: We enforce strict quorum consensus: $W + R > N$. In a 4-node cluster with replication factor 3, any write must be acknowledged by at least 2 nodes. If a partition isolates 2 nodes from the other 2, neither partition can form an isolated majority write without mutual agreement, preventing divergence.

### Q3: What is "Silent Bit-Rot" and how does ResiStore solve it?
> **Answer**: Bit-rot is silent data corruption caused by disk sector degradation, magnetic drift, or cosmic rays, where the operating system reads corrupted bytes without throwing an I/O error. ResiStore solves this by computing a cryptographic **SHA-256 checksum** during upload. Background audits re-hash disk replicas; if a mismatch is detected, the corrupted file is overwritten with a pristine copy fetched from an uncorrupted peer node.

### Q4: Why use Reed-Solomon Erasure Coding instead of 3x Replication?
> **Answer**: With $3\times$ replication, storing 1 GB of data requires 3 GB of raw disk space (200% storage overhead). With Reed-Solomon $RS(4+2)$, the file is split into 4 data chunks and 2 parity chunks. Storing 1 GB requires only 1.5 GB of space (50% overhead), saving 50% on disk drives, server rack space, and power consumption while still tolerating the loss of any 2 arbitrary nodes.

### Q5: How do you prevent race conditions during concurrent uploads and repairs?
> **Answer**: ResiStore maintains a registry of per-object asynchronous locks (`asyncio.Lock`). When an upload, repair, or deletion is underway for an object ID, any overlapping operation on the same object queues until the lock is released. Additionally, the metadata database runs in SQLite WAL (Write-Ahead Logging) mode to prevent database file locks.

---

## 11. Cloud Hosting Guide (Vercel & Render)

The project is structured into two self-contained folders:
- **`backend/`**: Deployable to Render (includes `main.py`, `Procfile`, `render.yaml`, `requirements.txt`).
- **`frontend/`**: Deployable to Vercel (includes `vercel.json`, `.env.example`, `package.json`, Vite build).

### A. Deploy Backend to Render
1. Push this repository to GitHub.
2. In the **[Render Dashboard](https://dashboard.render.com/)**, click **New +** $\rightarrow$ **Web Service**.
3. Select your repository.
4. Set:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click **Create Web Service**. Copy your URL (e.g., `https://resistore-backend.onrender.com`).

### B. Deploy Frontend to Vercel
1. In the **[Vercel Dashboard](https://vercel.com/dashboard)**, click **Add New...** $\rightarrow$ **Project**.
2. Import your GitHub repository.
3. In Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://resistore-backend.onrender.com` (your Render backend URL)
5. Click **Deploy**. Your app is live!

---

## 12. Project Directory Structure

```
distributed-storage/
├── backend/                           # Render-ready Python FastAPI Backend
│   ├── app/                           # FastAPI Application & Microservices
│   │   ├── api/                       # REST routes (S3, Chaos, Erasure, Nodes, Objects)
│   │   ├── models/                    # SQLAlchemy ORM Models
│   │   ├── schemas/                   # Pydantic Schemas
│   │   └── services/                  # Reed-Solomon, Mongo Atlas, Rebalancer, Repair
│   ├── tests/                         # 19 Pytest Automated Integration Tests
│   ├── storage/                       # Multi-node physical storage partitions
│   ├── scripts/                       # Cluster launcher & process management
│   ├── docs/                          # Architecture, API & Viva Q&A documentation
│   ├── main.py                        # Standalone Render entrypoint ($PORT support)
│   ├── Procfile                       # Render Web Process configuration
│   ├── render.yaml                    # Render Blueprint configuration
│   ├── requirements.txt               # Python dependencies (with pymongo & dnspython)
│   ├── Dockerfile                     # Container definition for backend
│   └── README.md                      # Backend specific deployment guide
│
├── frontend/                          # Vercel-ready React + Vite Frontend
│   ├── src/                           # React UI (Obsidian Dark Theme)
│   │   ├── components/                # Modular UI views (Overview, Chaos, Shards, Rack)
│   │   └── services/api.js            # API client with dynamic VITE_API_URL support
│   ├── public/                        # Static assets & icons
│   ├── vercel.json                    # Vercel SPA routing & asset caching
│   ├── .env.example                   # Environment variable template
│   ├── package.json                   # Scripts & dependencies
│   ├── vite.config.js                 # Vite build & local dev proxy configuration
│   └── README.md                      # Frontend specific deployment guide
│
└── README.md                          # Master documentation & Viva cheatsheet
```

---

## 📄 License
MIT License. Developed for advanced distributed systems engineering, research, and hackathon presentation.
