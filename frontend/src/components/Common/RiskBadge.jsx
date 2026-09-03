import React from "react";
import { getRiskTier, DECISION_STYLES, SOURCE_STYLES } from "../../theme/designSystem";

export function RiskScoreBadge({ score, size = "md" }) {
  const tier = getRiskTier(score);
  const sizeStyles = {
    sm: { padding: "2px 6px", fontSize: 10, borderRadius: 6 },
    md: { padding: "3px 8px", fontSize: 11, borderRadius: 8 },
    lg: { padding: "4px 12px", fontSize: 13, borderRadius: 10 },
  }[size];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: tier.bg,
        border: `1px solid ${tier.border}`,
        color: tier.color,
        fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
        ...sizeStyles,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: tier.color }} />
      {score}
    </span>
  );
}

export function DecisionBadge({ decision = "pending", size = "md" }) {
  const norm = String(decision).toLowerCase();
  const ds = DECISION_STYLES[norm] || DECISION_STYLES.pending;

  const sizeStyles = {
    sm: { padding: "2px 6px", fontSize: 9, borderRadius: 999 },
    md: { padding: "3px 10px", fontSize: 10, borderRadius: 999 },
    lg: { padding: "5px 14px", fontSize: 12, borderRadius: 999 },
  }[size];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: ds.bg,
        border: `1px solid ${ds.border}`,
        color: ds.color,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        ...sizeStyles,
      }}
    >
      {ds.label}
    </span>
  );
}

export function ChannelBadge({ source = "MANUAL" }) {
  const ss = SOURCE_STYLES[source] || { label: source, color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.25)" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: ss.bg,
        border: `1px solid ${ss.border}`,
        color: ss.color,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.05em",
        padding: "2px 7px",
        borderRadius: 999,
      }}
    >
      {ss.label}
    </span>
  );
}
