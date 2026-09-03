# PayShield AI ???
### Autonomous Real-Time Fraud Intelligence & AIOps Platform for Digital Payments

PayShield AI is a modular, production-grade fraud detection platform built for modern digital payment ecosystems (UPI, NEFT, RTGS, Cards). It combines a **6-Model Machine Learning Ensemble**, **Google Gemini GenAI Explainability**, **Decentralized Blockchain Ledgers**, and **AWS S3 Cloud Compliance Archival** to generate transparent, real-time risk scores with sub-100ms latency.

---

## Why PayShield AI?

Digital payment systems face increasingly sophisticated threats ? synthetic identities, mule accounts, coordinated fraud rings, and Business Email Compromise (BEC). PayShield AI addresses these with a multi-layered intelligence pipeline that works in real time, at scale, without sacrificing explainability or regulatory compliance.

---

## Core Capabilities ?

- **6-Model ML Ensemble** ? Parallel inference across GNN, Bi-LSTM, XGBoost, Behavioral Biometrics, AML Rules, and BEC NLP Transformers.
- **Google Gemini GenAI Explainability** ? Synthesizes complex mathematical signals and SHAP feature attributions into natural-language forensic rationales.
- **Interactive Gemini Investigation Assistant** ? Natural-language AI chat interface for fraud analysts to ask contextual questions about flagged transactions.
- **Dual-Layer Audit Archival (AWS S3 + Blockchain)**:
  - **AWS S3**: Automated JSON compliance archival for RBI/FINCEN suspicious activity reporting.
  - **Ethereum Smart Contract**: Decentralized, tamper-resistant SHA-256 fingerprint anchoring.
- **Multi-Channel Telemetry** ? Real-time Gmail inbox monitoring for executive wire fraud + Android bank SMS webhook ingestion.
- **AIOps Self-Healing Engine** ? 15-second autonomous SLA recovery powered by Bi-LSTM root cause analysis and dynamic circuit breaker failover.

---

## System Architecture

```
                       ???????????????????????????????????????????
                       ?       React + Vite Modern Dashboard     ?
                       ?    (Executive KPI / Forensic Drawer)    ?
                       ???????????????????????????????????????????
                                            ? WebSocket / HTTP
                                            ?
                       ???????????????????????????????????????????
                       ?     PayShield Node.js API Gateway       ?
                       ? (CORS, Rate Limiting, Telemetry Traces) ?
                       ???????????????????????????????????????????
                             ?              ?              ?
         ?????????????????????????          ?     ?????????????????????????
         ?                       ?          ?     ?                       ?
???????????????????    ???????????????????    ????????????????????    ????????????????????
?  FastAPI Core   ?    ? Google Gemini   ?    ? Hardhat / EVM    ?    ? AWS S3 Bucket    ?
?  (6-Model ML)   ?    ? 3.5 Flash Engine?    ? Smart Contract   ?    ? Regulatory Audit ?
? GNN/LSTM/XGBoost?    ? Forensic Copilot?    ? Immutable Hash   ?    ? High-Risk Events ?
???????????????????    ???????????????????    ????????????????????    ????????????????????
```

---

## ?? AI & Machine Learning Pipeline

PayShield AI uses a hybrid ensemble combining deep learning, gradient boosting, and generative intelligence:

| Model / Service | Role | Key Detection Focus |
|---|---|---|
| **Graph Neural Network (GNN)** | Network Topology | Mule rings, synthetic accounts, device clustering |
| **Bi-LSTM + Attention** | Sequential Anomaly | Sudden spending bursts, velocity shifts |
| **XGBoost & LightGBM** | Tabular Inference | Historical transaction patterns across 500+ trees |
| **Behavioral Biometrics** | Human Telemetry | Typing cadence deviation, touch pressure, copy-paste |
| **AML Graph Engine** | Anti-Money Laundering | Smurfing, layering, circular flows, threshold structuring |
| **BEC Transformer (NLP)** | Memo & Email Text | Urgency markers, IBAN modification, coercion |
| **Google Gemini 3.5 Flash** | GenAI Explainability | Analyst-grade natural language explanations & chat copilot |

---

## ?? Cloud & Regulatory Compliance: AWS S3 + Gemini

### 1. Google Gemini GenAI Copilot
* **Natural-Language Rationales**: Translates high-dimensional SHAP values and model consensus into clear, plain-language sentences under 20 words for security operations.
* **Ask PayShield Copilot (`/api/assistant/ask`)**: An interactive assistant that understands transaction payloads and provides direct forensic verdicts without technical jargon.

### 2. AWS S3 Audit Archival (`awsAuditStore.js`)
* Automatically packages high-risk and quarantined events into immutable JSON audit dossiers.
* Pushes to Amazon S3 (`fraud-events/{txId}.json`) with server-side encryption to meet RBI, FINRA, and GDPR audit retention guidelines.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Framer Motion, Lucide Icons |
| **Backend Gateway** | Node.js, Express, WebSockets, OpenTelemetry |
| **ML Engine** | Python 3.11, FastAPI, PyTorch, Scikit-learn, XGBoost |
| **GenAI** | Google Gemini API (`gemini-3.5-flash`) |
| **Cloud Storage** | AWS S3 SDK (`@aws-sdk/client-s3`) |
| **Blockchain** | Hardhat, Ethers.js, Solidity Smart Contracts |
| **AIOps & Monitoring** | Prometheus, Grafana, Jaeger Tracing, Loki |
| **Caching** | Redis / In-Memory Resilient Fallback |

---

## Environment Configuration

Create a `.env` file in `backend/` with the following variables:

```env
# Server
PORT=3001
NODE_ENV=production

# Machine Learning Engine
ML_SERVICE_URL=http://localhost:8000

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# AWS S3 Compliance Archival
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=payshield-fraud-audit-bucket

# Blockchain
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545

# Email & SMS Ingestion (Demo Mode)
DEMO_USER_EMAIL=rithvikkrishnadk@gmail.com
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/transactions/submit` | Submit payment for 6-model ML scoring and blockchain logging |
| `GET` | `/api/transactions/history` | Retrieve real-time transaction ledger |
| `POST` | `/api/assistant/ask` | Query Gemini Copilot regarding a transaction or recent alerts |
| `POST` | `/api/fraud/simulate` | Execute multi-transaction attack patterns (Bot, Ring, ATO) |
| `POST` | `/api/email/test-bec` | Ingest and analyze email memo via NLP transformer |
| `POST` | `/api/sms/incoming` | Ingest bank debit SMS alert via webhook |
| `GET` | `/api/reports/compliance` | Generate regulatory AML metrics and SAR filing data |
| `GET` | `/health` | Core gateway health and scoring mode |

---

## Getting Started Locally ??

### 1. Clone & Install
```bash
git clone https://github.com/Rithvik-krishna/payshield.git
cd payshield
```

### 2. Run with Docker Compose (Recommended)
```bash
docker compose up -d --build
```

### 3. Or Run Locally:
```bash
# Terminal 1: Hardhat Node
cd Blockchain && npx hardhat node

# Terminal 2: ML Engine
cd ml-engine && uvicorn main:app --port 8000

# Terminal 3: Backend API
cd backend && npm install && node src/server.js

# Terminal 4: Frontend
cd frontend && npm install && npm run dev
```

Visit: **[http://localhost:5173](http://localhost:5173)**

---

## License

This project is licensed under the [MIT License](LICENSE).
