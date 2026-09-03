import React, { useState } from "react";
import {
  Zap,
  Play,
  Mail,
  Smartphone,
  ShieldAlert,
  Server,
  Activity,
  CheckCircle2,
  AlertOctagon,
  ChevronDown,
} from "lucide-react";
import { submitTransaction, simulateFraud, sendTestBecEmail, testSms, injectObservabilityFailure } from "../../services/api";
import useFraudStore from "../../store/fraudStore";
import { formatINR, normalizeScore } from "../../theme/designSystem";

const TRANSACTION_PRESETS = [
  { id: "normal", label: "Clean Swiggy UPI", amount: 2000, merchant: "Swiggy", method: "UPI", memo: "Dinner order", risk: "LOW", color: "#10b981" },
  { id: "velocity", label: "High Velocity NEFT", amount: 49500, merchant: "Unknown Vendor", method: "NEFT", memo: "Festival settlement payout", risk: "REVIEW", color: "#f59e0b" },
  { id: "bec_urgency", label: "Vendor IBAN Shift", amount: 15000, merchant: "New Payee 4821", method: "NEFT", memo: "URGENT: update vendor IBAN immediately. Do not call to verify. Confidential.", risk: "HIGH", color: "#ef4444" },
  { id: "sim_swap", label: "SIM Swap Drain", amount: 8500, merchant: "Shell Merchants Pvt Ltd", method: "UPI", memo: "Account takeover transfer", risk: "HIGH", color: "#ef4444" },
];

const ATTACK_PATTERNS = [
  { id: "micro_bot", label: "Micro Bot Attack (5 Txs)", desc: "Rapid burst of 5 micro-transactions" },
  { id: "fraud_ring", label: "Fraud Ring GNN (4 Txs)", desc: "Mule account syndicate graph flow" },
  { id: "account_takeover", label: "Account Takeover (3 Txs)", desc: "Unrecognized device escalating balance drain" },
  { id: "card_not_present", label: "Card Not Present (4 Txs)", desc: "E-commerce multi-merchant authorization burst" },
  { id: "synthetic_identity", label: "Synthetic ID (3 Txs)", desc: "Probing and maxing synthetic credit lines" },
  { id: "bec", label: "Executive BEC (2 Txs)", desc: "Urgent vendor wire & CEO memo escalation" },
];

const ATTACK_CAMPAIGNS = {
  micro_bot: [
    { amount: 35, merchant: "Google Play Store", method: "UPI", memo: "Micro auth ping (Bot Worker 01)", deviceId: "bot-cluster-1" },
    { amount: 75, merchant: "Digital Goods Pay", method: "UPI", memo: "Micro authorization probe (Bot Worker 01)", deviceId: "bot-cluster-1" },
    { amount: 140, merchant: "FastPay Gateway", method: "UPI", memo: "Rapid API card probe (Bot Worker 01)", deviceId: "bot-cluster-1" },
    { amount: 280, merchant: "Razorpay Checkout", method: "UPI", memo: "Automated micro debit burst (Bot Worker 01)", deviceId: "bot-cluster-1" },
    { amount: 850, merchant: "Unknown Vendor", method: "UPI", memo: "High frequency micro drain (Bot Worker 01)", deviceId: "bot-cluster-1" },
  ],
  fraud_ring: [
    { amount: 18000, merchant: "Mule Hub Alpha", method: "NEFT", memo: "Syndicate fan-out layer 1", userId: "acc-mule-01" },
    { amount: 24500, merchant: "Mule Node Beta", method: "NEFT", memo: "Circular mule adjacency hop", userId: "acc-mule-02" },
    { amount: 36000, merchant: "Shell Merchants Pvt Ltd", method: "NEFT", memo: "Mule cluster balance aggregation", userId: "acc-mule-03" },
    { amount: 49500, merchant: "Offshore Settlement Corp", method: "NEFT", memo: "Final syndicate cashout withdrawal", userId: "acc-mule-04" },
  ],
  account_takeover: [
    { amount: 150, merchant: "Unknown Payee", method: "UPI", memo: "Unrecognized device baseline probe", deviceId: "hacked-sim-x" },
    { amount: 4500, merchant: "Crypto P2P Desk", method: "UPI", memo: "Immediate post-credential reset debit", deviceId: "hacked-sim-x" },
    { amount: 42000, merchant: "Shell Account Transfer", method: "NEFT", memo: "Full balance sweep - Impossible travel location", deviceId: "hacked-sim-x" },
  ],
  card_not_present: [
    { amount: 120, merchant: "Steam Games", method: "UPI", memo: "CVV brute force ping" },
    { amount: 480, merchant: "Flipkart Pay", method: "UPI", memo: "E-commerce small ticket test" },
    { amount: 3500, merchant: "Amazon India", method: "UPI", memo: "Rapid card testing escalation" },
    { amount: 24900, merchant: "Croma Electronics", method: "UPI", memo: "High-value card unauthorized checkout" },
  ],
  synthetic_identity: [
    { amount: 1500, merchant: "Instant Credit Pay", method: "UPI", memo: "Unlinked credit profile authorization" },
    { amount: 8500, merchant: "BNPL Platform", method: "UPI", memo: "Synthetic identity credit utilization" },
    { amount: 32000, merchant: "CashOut Terminal", method: "NEFT", memo: "Maximum synthetic credit line drain" },
  ],
  bec: [
    { amount: 15000, merchant: "New Payee 4821", method: "NEFT", memo: "URGENT: update vendor IBAN immediately. Do not call to verify. Confidential." },
    { amount: 58000, merchant: "Apex Settlement Corp", method: "NEFT", memo: "CONFIDENTIAL: Executive wire instruction authorized by CEO - immediate settlement" },
  ],
};

export default function QuickInjectPanel({ onTransactionInjected }) {
  const [running, setRunning] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [selectedAttack, setSelectedAttack] = useState("fraud_ring");

  const addTransaction = useFraudStore((s) => s.addTransaction);
  const setSelectedTransaction = useFraudStore((s) => s.setSelectedTransaction);
  const addAlert = useFraudStore((s) => s.addAlert);

  const runTxPreset = async (preset) => {
    setRunning(true);
    setActiveAction(preset.id);
    setStatusMsg(`Submitting ${preset.label}...`);
    try {
      const res = await submitTransaction({
        amount: preset.amount,
        merchant: preset.merchant,
        merchantName: preset.merchant,
        paymentMethod: preset.method,
        currency: "INR",
        country: "IN",
        memo: preset.memo,
        userEmail: "rithvikkrishnadk@gmail.com",
        userName: "Rithvik",
        source: "MANUAL",
        timestamp: new Date().toISOString(),
      });
      res.fraudScore = normalizeScore(res.fraudScore);
      addTransaction(res);
      setSelectedTransaction(res);
      onTransactionInjected?.(res);
      setStatusMsg(`Injected: ${preset.label} -> Score ${res.fraudScore}/100 (${String(res.decision || "approve").toUpperCase()})`);
    } catch (err) {
      console.error("Injection failed:", err);
      setStatusMsg(`Injection failed: ${err.message}`);
    } finally {
      setRunning(false);
      setActiveAction(null);
    }
  };

  const runAttackPattern = async (patternId) => {
    setRunning(true);
    setActiveAction(patternId);
    const steps = ATTACK_CAMPAIGNS[patternId] || ATTACK_CAMPAIGNS.micro_bot;
    setStatusMsg(`Initiating ${patternId} attack sequence (${steps.length} sequential transactions)...`);
    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setStatusMsg(`Firing ${patternId} [${i + 1}/${steps.length}]: ${step.merchant} (${formatINR(step.amount)})...`);
        const res = await submitTransaction({
          amount: step.amount,
          merchant: step.merchant,
          merchantName: step.merchant,
          paymentMethod: step.method,
          currency: "INR",
          country: "IN",
          memo: step.memo,
          userEmail: "rithvikkrishnadk@gmail.com",
          userName: "Rithvik",
          deviceId: step.deviceId || `sim-device-${patternId}`,
          userId: step.userId || "sim-user",
          source: "SIMULATOR",
          timestamp: new Date().toISOString(),
          behavioralData: {
            typingCadenceDeviation: 0.94,
            touchPressure: 0.08,
            copyPasteRatio: 0.92,
          },
        });
        res.fraudScore = normalizeScore(res.fraudScore);
        addTransaction(res);
        setSelectedTransaction(res);
        onTransactionInjected?.(res);
        if (i < steps.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      setStatusMsg(`Attack Complete: Fired all ${steps.length} sequential transactions for ${patternId}!`);
    } catch (err) {
      console.error("Attack simulation failed:", err);
      setStatusMsg(`Simulation failed: ${err.message}`);
    } finally {
      setRunning(false);
      setActiveAction(null);
    }
  };

  const runTestEmail = async () => {
    setRunning(true);
    setActiveAction("email");
    setStatusMsg("Sending test BEC email...");
    try {
      const res = await sendTestBecEmail("standard");
      setStatusMsg(`Email dispatched: ${res.message || "Scanning inbox"}`);
    } catch (err) {
      setStatusMsg(`Email failed: ${err.message}`);
    } finally {
      setRunning(false);
      setActiveAction(null);
    }
  };

  const runTestSms = async () => {
    setRunning(true);
    setActiveAction("sms");
    setStatusMsg("Sending test Indian Bank SMS alert...");
    try {
      const res = await testSms();
      if (res && res.status === "scored") {
        useFraudStore.getState().addSmsFeedItem({
          type: "LIVE_SMS_SCORED",
          from: res.from || res.parsed?.bankName || "HDFCBK",
          raw: res.raw || "Test Bank SMS Alert",
          parsed: res.parsed,
          result: res.result,
          timestamp: new Date().toISOString(),
        });
        if (res.result) {
          addTransaction(res.result);
          setSelectedTransaction(res.result);
        }
        setStatusMsg(`Bank SMS Scored: ${formatINR(res.parsed?.amount || 2000)} -> ${res.result?.decision?.toUpperCase()}`);
      }
    } catch (err) {
      setStatusMsg(`Bank SMS failed: ${err.message}`);
    } finally {
      setRunning(false);
      setActiveAction(null);
    }
  };

  const runChaosFailure = async (type) => {
    setRunning(true);
    setActiveAction(type);
    setStatusMsg(`Injecting ${type} into AIOps Observability Brain...`);
    try {
      const res = await injectObservabilityFailure(type);
      setStatusMsg(`AIOps Fault Injected: ${res.failure_type}. Self-healing loop triggered.`);
    } catch (err) {
      setStatusMsg(`Fault injection error: ${err.message}`);
    } finally {
      setRunning(false);
      setActiveAction(null);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0d1527 0%, #0a0f1d 100%)",
        borderRadius: 16,
        padding: "18px 20px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderLeft: "4px solid #38bdf8",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ padding: 6, borderRadius: 8, background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8" }}>
            <Zap size={16} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>
              Demo Simulation &amp; Attack Injection Suite
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>
              1-click test scenarios to evaluate live ML ensemble decisions, BEC inbox monitoring, and self-healing
            </div>
          </div>
        </div>

        {statusMsg && (
          <div style={{ fontSize: 11, color: "#38bdf8", background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.25)", padding: "4px 10px", borderRadius: 8, fontFamily: "'JetBrains Mono', monospace" }}>
            {statusMsg}
          </div>
        )}
      </div>

      {/* Button Row 1: Direct Transaction Presets */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          Live Payment &amp; Channel Injections (Click to Stream)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 8 }}>
          {TRANSACTION_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => runTxPreset(p)}
              disabled={running}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: `1px solid ${p.color}40`,
                borderLeft: `3px solid ${p.color}`,
                borderRadius: 8,
                padding: "8px 12px",
                textAlign: "left",
                cursor: running ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#f8fafc" }}>{p.label}</span>
                <span style={{ fontSize: 9, fontWeight: 800, color: p.color }}>{p.risk}</span>
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                {formatINR(p.amount)} &bull; {p.method}
              </div>
            </button>
          ))}

          {/* Email Inject */}
          <button
            onClick={runTestEmail}
            disabled={running}
            style={{
              background: "rgba(56, 189, 248, 0.08)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderLeft: "3px solid #38bdf8",
              borderRadius: 8,
              padding: "8px 12px",
              textAlign: "left",
              cursor: running ? "not-allowed" : "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#f8fafc" }}>Inject BEC Email</span>
              <Mail size={12} color="#38bdf8" />
            </div>
            <div style={{ fontSize: 10, color: "#38bdf8", marginTop: 2 }}>Vendor IBAN memo NLP</div>
          </button>

          {/* Bank SMS Inject */}
          <button
            onClick={runTestSms}
            disabled={running}
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderLeft: "3px solid #f59e0b",
              borderRadius: 8,
              padding: "8px 12px",
              textAlign: "left",
              cursor: running ? "not-allowed" : "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#f8fafc" }}>Inject Bank SMS</span>
              <Smartphone size={12} color="#f59e0b" />
            </div>
            <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 2 }}>UPI debit webhook</div>
          </button>
        </div>
      </div>

      {/* Button Row 2: Attack Patterns & Chaos Injection */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
            Fraud Attack Simulator:
          </span>
          <select
            value={selectedAttack}
            onChange={(e) => setSelectedAttack(e.target.value)}
            style={{
              background: "#0a0f1d",
              color: "#f8fafc",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 6,
              padding: "5px 8px",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {ATTACK_PATTERNS.map((a) => (
              <option key={a.id} value={a.id}>{a.label} - {a.desc}</option>
            ))}
          </select>
          <button
            onClick={() => runAttackPattern(selectedAttack)}
            disabled={running}
            style={{
              background: "#ef4444",
              color: "#ffffff",
              border: "none",
              borderRadius: 6,
              padding: "5px 12px",
              fontSize: 11,
              fontWeight: 700,
              cursor: running ? "not-allowed" : "pointer",
            }}
          >
            Fire Attack
          </button>
        </div>

        <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)" }} />

        {/* Chaos Engineering */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
            AIOps Chaos Fault:
          </span>
          <button
            onClick={() => runChaosFailure("ml_engine_latency")}
            disabled={running}
            style={{
              background: "rgba(239, 68, 68, 0.12)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 6,
              padding: "5px 10px",
              fontSize: 10,
              fontWeight: 700,
              cursor: running ? "not-allowed" : "pointer",
            }}
          >
            ML Latency Spike
          </button>
          <button
            onClick={() => runChaosFailure("cascade_failure")}
            disabled={running}
            style={{
              background: "rgba(239, 68, 68, 0.12)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 6,
              padding: "5px 10px",
              fontSize: 10,
              fontWeight: 700,
              cursor: running ? "not-allowed" : "pointer",
            }}
          >
            Full Cascade Failover
          </button>
        </div>
      </div>
    </div>
  );
}
