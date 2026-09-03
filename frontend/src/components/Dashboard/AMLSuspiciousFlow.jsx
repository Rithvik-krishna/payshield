import React from "react";
import { motion } from "framer-motion";
import { Shield, ArrowRight, AlertTriangle, CheckCircle2, Share2, Layers } from "lucide-react";
import { normalizeScore } from "../../theme/designSystem";

const PATTERN_STYLES = {
  smurfing: {
    color: "#ef4444",
    label: "SMURFING",
    desc: "Multiple small-value deposits structured below regulatory AML reporting thresholds.",
    tag: "STRUCTURING ANOMALY",
  },
  layering: {
    color: "#f59e0b",
    label: "LAYERING",
    desc: "Rapid fund movement through intermediary proxy accounts to obscure the originating audit trail.",
    tag: "MULTI-HOP DISPERSAL",
  },
  fan_out: {
    color: "#ef4444",
    label: "FAN-OUT",
    desc: "Single originating source dispersing capital rapidly across multiple unconnected destination nodes.",
    tag: "RAPID DISPERSAL",
  },
  round_trip: {
    color: "#f59e0b",
    label: "ROUND-TRIP",
    desc: "Capital routed through secondary intermediaries and returned to the originating syndicate cluster.",
    tag: "CIRCULAR RETURN",
  },
  circular_flow: {
    color: "#ef4444",
    label: "CIRCULAR FLOW",
    desc: "Closed triangular transaction loop detected across linked parties and shell merchant accounts.",
    tag: "SYNDICATE LOOP",
  },
  fraud_ring: {
    color: "#ef4444",
    label: "MULE NETWORK",
    desc: "Graph Neural Network detected coordinated fund routing across syndicated mule accounts.",
    tag: "GNN CLUSTER MATCH",
  },
  account_takeover: {
    color: "#ef4444",
    label: "ACCOUNT TAKEOVER",
    desc: "Unrecognized device fingerprint and credential shift preceding immediate balance liquidation.",
    tag: "BIOMETRIC SHIFT",
  },
  bec: {
    color: "#f59e0b",
    label: "INVOICE REDIRECTION",
    desc: "Urgent vendor memo alteration flagged by natural language analysis as executive wire fraud.",
    tag: "BEC NLP DETECTED",
  },
  micro_bot: {
    color: "#ef4444",
    label: "BOT TESTING BURST",
    desc: "Automated high-frequency micro-debit burst testing card velocity across distributed endpoints.",
    tag: "HIGH VELOCITY BURST",
  },
  synthetic_identity: {
    color: "#f59e0b",
    label: "SYNTHETIC PROFILE",
    desc: "Recently established unlinked credit identity attempting immediate line utilization.",
    tag: "CREDIT PROBING",
  },
  card_not_present: {
    color: "#f59e0b",
    label: "CARD NOT PRESENT",
    desc: "Rapid authorization attempts across e-commerce payment gateways without physical card presence.",
    tag: "CNP VELOCITY",
  },
  normal: {
    color: "#10b981",
    label: "CLEARED DIRECT ROUTE",
    desc: "Standard legitimate transaction path verified against customer baseline with no laundering topology.",
    tag: "CLEARED AML",
  },
};

function resolvePattern(tx) {
  if (!tx) return PATTERN_STYLES.normal;
  const raw = String(tx.detectedPattern || "").toLowerCase().replace(/ /g, "_");
  if (PATTERN_STYLES[raw]) return PATTERN_STYLES[raw];

  const score = normalizeScore(tx.fraudScore);
  if (score >= 85) {
    return {
      color: "#ef4444",
      label: "CRITICAL DRAIN",
      desc: "Severe anomaly detected across transaction velocity, device trust, and counterparty graph adjacency.",
      tag: "CRITICAL RISK",
    };
  }
  if (score >= 70) {
    return {
      color: "#f59e0b",
      label: "SUSPICIOUS HOP",
      desc: "Unusual transfer timing and counterparty novelty flagged for compliance investigation.",
      tag: "REVIEW REQUIRED",
    };
  }
  if (score >= 35) {
    return {
      color: "#38bdf8",
      label: "MONITORED ROUTE",
      desc: "Standard payment flow with moderate baseline elevation under active behavioral telemetry.",
      tag: "ACTIVE MONITORING",
    };
  }
  return PATTERN_STYLES.normal;
}

function resolveIntermediary(tx) {
  if (tx?.suspiciousAccounts && tx.suspiciousAccounts.length > 0) {
    return tx.suspiciousAccounts.slice(0, 2).join(" ? ");
  }
  const method = String(tx?.paymentMethod || "UPI").toUpperCase();
  if (method === "UPI") return "NPCI UPI Switch";
  if (method === "NEFT") return "RBI NEFT Clearing";
  if (method === "RTGS") return "RBI RTGS Gateway";
  if (method === "CARD") return "Payment Gateway / Acquirer";
  return "Direct Settlement Network";
}

function FlowNode({ title, primary, secondary, isFlagged, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 220 }}
      style={{
        flex: 1,
        minWidth: 0,
        background: isFlagged ? "rgba(239, 68, 68, 0.08)" : "rgba(255, 255, 255, 0.03)",
        border: `1px solid ${isFlagged ? "rgba(239, 68, 68, 0.35)" : "rgba(255, 255, 255, 0.08)"}`,
        borderRadius: 14,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
        {title}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: isFlagged ? "#fca5a5" : "#f1f5f9",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={primary}
      >
        {primary}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "#94a3b8",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {secondary}
      </div>
    </motion.div>
  );
}

export default function AMLSuspiciousFlow({ transaction }) {
  const pattern = resolvePattern(transaction);
  const intermediary = resolveIntermediary(transaction);
  const score = normalizeScore(transaction?.fraudScore);
  const isElevated = score >= 70;

  const sourceName = transaction?.userName || "Rithvik";
  const sourceDetail = transaction?.userEmail || transaction?.userId || "User Account";
  const destName = transaction?.merchantName || transaction?.merchant || "Recipient Merchant";
  const destDetail = transaction?.paymentMethod ? `${transaction.paymentMethod} Settlement` : "Merchant Terminal";

  const amlScore = typeof transaction?.amlRiskScore === "number"
    ? Math.round(transaction.amlRiskScore * 100)
    : Math.min(100, Math.round((score * 0.85) + 8));

  return (
    <div
      style={{
        background: "#0d1527",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 16,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Layers size={15} color="#38bdf8" />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase" }}>
            AML Topology & Flow Analysis
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              background: `${pattern.color}15`,
              border: `1px solid ${pattern.color}40`,
              color: pattern.color,
              borderRadius: 999,
              padding: "3px 10px",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.06em",
            }}
          >
            {pattern.label}
          </span>
        </div>
      </div>

      {/* Rationale description card */}
      <div
        style={{
          background: `${pattern.color}10`,
          border: `1px solid ${pattern.color}25`,
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 11,
          color: "#cbd5e1",
          lineHeight: 1.5,
        }}
      >
        {pattern.desc}
      </div>

      {/* 3-Node Interactive Flow Diagram */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <FlowNode
          title="Source Origin"
          primary={sourceName}
          secondary={sourceDetail}
          isFlagged={isElevated}
          index={0}
        />

        <div style={{ display: "flex", alignItems: "center", flexShrink: 0, padding: "0 2px" }}>
          <ArrowRight size={14} color={pattern.color} />
        </div>

        <FlowNode
          title="Clearing Route"
          primary={intermediary}
          secondary={transaction?.suspiciousAccounts?.length ? "Flagged Intermediary" : "Institutional Switch"}
          isFlagged={Boolean(transaction?.suspiciousAccounts?.length)}
          index={1}
        />

        <div style={{ display: "flex", alignItems: "center", flexShrink: 0, padding: "0 2px" }}>
          <ArrowRight size={14} color={pattern.color} />
        </div>

        <FlowNode
          title="Destination Payee"
          primary={destName}
          secondary={destDetail}
          isFlagged={isElevated}
          index={2}
        />
      </div>

      {/* Bottom AML Risk Meter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 8,
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em" }}>
            AML GRAPH CONFIDENCE
          </span>
          <span style={{ fontSize: 9, color: "#475569" }}>
            ({pattern.tag})
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 120, height: 6, background: "rgba(255, 255, 255, 0.08)", borderRadius: 999, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${amlScore}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                height: "100%",
                background: pattern.color,
                boxShadow: `0 0 8px ${pattern.color}`,
              }}
            />
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: pattern.color, fontFamily: "'JetBrains Mono', monospace" }}>
            {amlScore}%
          </span>
        </div>
      </div>
    </div>
  );
}
