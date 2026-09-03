import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, AlertTriangle, CheckCircle, ExternalLink, Cpu, Smartphone, MapPin, User, DollarSign, Clock, Hash } from "lucide-react";
import { RiskScoreBadge, DecisionBadge, ChannelBadge } from "./RiskBadge";
import { getRiskTier, formatINR } from "../../theme/designSystem";

const MODELS = [
  { key: "GNN", label: "Graph Neural Network", desc: "Fraud ring & shared device topology", accent: "#38bdf8" },
  { key: "LSTM", label: "Sequence Temporal Model", desc: "Warm-up to drain transaction velocity", accent: "#a855f7" },
  { key: "XGBoost", label: "Tabular Ensemble", desc: "500-tree feature novelty & pattern matching", accent: "#f59e0b" },
  { key: "Biometrics", label: "Behavioral Biometrics", desc: "Typing cadence, touch pressure deviation", accent: "#06b6d4" },
  { key: "AML", label: "Anti-Money Laundering", desc: "Smurfing, fan-out, circular flow laundering", accent: "#10b981" },
  { key: "BEC", label: "Email / Memo BEC NLP", desc: "Urgency, IBAN alteration, coercive phrasing", accent: "#ef4444" },
];

export default function InvestigationDrawer({ transaction, isOpen, onClose, onAction }) {
  const [activeModel, setActiveModel] = useState("GNN");

  if (!isOpen || !transaction) return null;

  const score = Number(transaction.fraudScore || 0);
  const tier = getRiskTier(score);
  const explanation = transaction.explanation || {};
  const modelFindings = explanation.modelFindings || {};
  const modelContributions = explanation.modelContributions || {};
  const topFeatures = explanation.topFeatures || [];

  return (
    <AnimatePresence>
      <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", justifyContent: "flex-end" }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: "fixed", inset: 0, background: "rgba(3, 7, 18, 0.75)", backdropFilter: "blur(4px)" }}
        />

        {/* Drawer Content */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 620,
            height: "100vh",
            background: "#0d1527",
            borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "-12px 0 40px rgba(0, 0, 0, 0.6)",
            display: "flex",
            flexDirection: "column",
            zIndex: 10000,
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              background: "rgba(13, 21, 39, 0.95)",
              position: "sticky",
              top: 0,
              zIndex: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Investigation Dossier
                </span>
                <ChannelBadge source={transaction.source} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                {transaction.txId}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "none",
                borderRadius: 8,
                padding: 8,
                color: "#94a3b8",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Risk Assessment Banner */}
            <div
              style={{
                background: tier.bg,
                border: `1px solid ${tier.border}`,
                borderRadius: 16,
                padding: "18px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: tier.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Risk Assessment
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", marginTop: 2 }}>
                  {tier.label}
                </div>
                <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 4 }}>
                  Recommendation: <strong style={{ color: tier.color }}>{String(transaction.decision || "approve").toUpperCase()}</strong>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 44, fontWeight: 900, color: tier.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                  {score}
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>out of 100</div>
              </div>
            </div>

            {/* Transaction Summary Grid */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                Transaction Summary
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                    <DollarSign size={13} /> Amount
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                    {formatINR(transaction.amount)}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                    <User size={13} /> Counterparty / Merchant
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f8fafc", marginTop: 4 }}>
                    {transaction.merchant || transaction.merchantName || "Unknown"}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                    <Clock size={13} /> Timestamp
                  </div>
                  <div style={{ fontSize: 12, color: "#e2e8f0", marginTop: 4 }}>
                    {new Date(transaction.timestamp).toLocaleString("en-IN")}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                    <Smartphone size={13} /> Device / Method
                  </div>
                  <div style={{ fontSize: 12, color: "#e2e8f0", marginTop: 4 }}>
                    {transaction.paymentMethod || "UPI"} &bull; {transaction.deviceId ? transaction.deviceId.slice(0, 10) : "Registered Device"}
                  </div>
                </div>
              </div>
            </div>

            {/* Why is this risky? */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                Why Is This Risky? (SHAP Signals)
              </div>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: `1px solid ${score >= 70 ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                  borderLeft: `4px solid ${score >= 70 ? "#ef4444" : "#10b981"}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "#e2e8f0",
                  marginBottom: 12,
                }}
              >
                {explanation.naturalLanguageExplanation ||
                  (score >= 70
                    ? `Transaction flagged because amount of ${formatINR(transaction.amount)} deviates from baseline behavior and triggered multi-model ensemble alerts.`
                    : `Transaction cleared. Feature vectors remain within normal established spending and location patterns.`)}
              </div>

              {topFeatures.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {topFeatures.map((feat, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: 10,
                        padding: "10px 14px",
                      }}
                    >
                      <span style={{ fontSize: 12, color: "#cbd5e1" }}>{feat.humanReadable || feat.feature}</span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: (feat.shap_value || 0) >= 0 ? "#ef4444" : "#10b981",
                        }}
                      >
                        {(feat.shap_value || 0) >= 0 ? "+" : ""}
                        {Number(feat.shap_value || 0).toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 6-Model Ensemble Breakdown */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  6-Model Ensemble Breakdown
                </span>
                <span style={{ fontSize: 11, color: "#64748b" }}>Click model to view narrative</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MODELS.map((model) => {
                  const contribVal = modelContributions[model.key] ?? modelContributions[model.key.toLowerCase()] ?? 0.15;
                  const pct = Math.round(Number(contribVal) * 100);
                  const isSelected = activeModel === model.key;
                  return (
                    <div
                      key={model.key}
                      onClick={() => setActiveModel(model.key)}
                      style={{
                        background: isSelected ? "rgba(56, 189, 248, 0.08)" : "rgba(255, 255, 255, 0.02)",
                        border: `1px solid ${isSelected ? "rgba(56, 189, 248, 0.3)" : "rgba(255, 255, 255, 0.05)"}`,
                        borderRadius: 12,
                        padding: "12px 14px",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>{model.key}</span>
                          <span style={{ fontSize: 11, color: "#64748b", marginLeft: 8 }}>{model.label}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: model.accent, fontFamily: "'JetBrains Mono', monospace" }}>
                          {pct}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${Math.min(100, Math.max(8, pct))}%`,
                            height: "100%",
                            background: model.accent,
                            borderRadius: 999,
                            transition: "width 0.4s ease-out",
                          }}
                        />
                      </div>

                      {isSelected && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                          {modelFindings[model.key] || model.desc}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Blockchain Immutability Proof */}
            {transaction.blockchainTxHash && (
              <div style={{ background: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle size={14} /> Immutable Audit Proof
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, fontFamily: "'JetBrains Mono', monospace", wordBreak: "break-all" }}>
                  {transaction.blockchainTxHash}
                </div>
              </div>
            )}

            {/* Analyst Action Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8, paddingBottom: 24 }}>
              <button
                onClick={() => { onAction?.("approve", transaction); onClose(); }}
                style={{
                  background: "#10b981",
                  color: "#022c22",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Clear &amp; Approve
              </button>
              <button
                onClick={() => { onAction?.("block", transaction); onClose(); }}
                style={{
                  background: "#ef4444",
                  color: "#450a0a",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Block Transaction
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
