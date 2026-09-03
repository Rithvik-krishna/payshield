import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, AlertOctagon, Mail } from "lucide-react";
import { getRiskTier, normalizeScore, DECISION_STYLES } from "../../theme/designSystem";

function polarToCartesian(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, start, end) {
  if (end - start >= 360) end = 359.99;
  const s = polarToCartesian(cx, cy, r, start);
  const e = polarToCartesian(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export default function FraudScoreGauge({ score = 0, decision = "pending", reason }) {
  const normalized = normalizeScore(score);
  const tier = getRiskTier(normalized);
  const filled = (normalized / 100) * 360;
  const ds = DECISION_STYLES[String(decision).toLowerCase()] || DECISION_STYLES.pending;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0d1527 0%, #0a0f1d 100%)",
        borderRadius: 16,
        padding: "20px 22px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.35)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 280,
      }}
    >
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Live Fraud Monitor
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: tier.color,
            background: tier.bg,
            border: `1px solid ${tier.border}`,
            padding: "2px 8px",
            borderRadius: 999,
          }}
        >
          {tier.tier}
        </span>
      </div>

      {/* SVG Arc Gauge */}
      <div style={{ position: "relative", width: 170, height: 170, margin: "10px 0" }}>
        <svg viewBox="0 0 170 170" width="170" height="170" style={{ position: "absolute", top: 0, left: 0 }}>
          {/* Background circle */}
          <circle cx="85" cy="85" r="66" fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="11" />
          {/* Animated score arc */}
          {score > 0 && (
            <motion.path
              d={arcPath(85, 85, 66, 0, filled)}
              fill="none"
              stroke={tier.color}
              strokeWidth="11"
              strokeLinecap="round"
              filter={`drop-shadow(0 0 10px ${tier.glow})`}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}
        </svg>

        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <motion.div
            key={normalized}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            style={{ fontSize: 44, fontWeight: 900, lineHeight: 1, color: "#f8fafc", fontFamily: "'JetBrains Mono', monospace" }}
          >
            {normalized}
          </motion.div>
          <div style={{ fontSize: 11, fontWeight: 700, color: tier.color, marginTop: 4, letterSpacing: "0.06em" }}>
            {tier.label}
          </div>
        </div>
      </div>

      {/* Decision status pill */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: "100%" }}>
        <div
          style={{
            padding: "6px 20px",
            borderRadius: 999,
            background: ds.bg,
            border: `1px solid ${ds.border}`,
            color: ds.color,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.06em",
          }}
        >
          {ds.label}
        </div>

        <div style={{ fontSize: 11, color: "#64748b", textAlign: "center", display: "flex", alignItems: "center", gap: 6 }}>
          <Mail size={12} />
          {score >= 70 ? (
            <span>Alert dispatched to <strong style={{ color: "#94a3b8" }}>rithvikkrishnadk@gmail.com</strong></span>
          ) : (
            <span>Cleared through 6-model ensemble</span>
          )}
        </div>
      </div>
    </div>
  );
}
