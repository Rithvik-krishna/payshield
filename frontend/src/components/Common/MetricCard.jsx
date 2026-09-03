import React from "react";
import { motion } from "framer-motion";

export default function MetricCard({
  title,
  value,
  subvalue,
  trend,
  trendPositive,
  icon: Icon,
  accent = "#38bdf8",
  statusDot = false,
  statusActive = true,
  onClick,
}) {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onClick={onClick}
      style={{
        background: "linear-gradient(135deg, #0d1527 0%, #0a0f1d 100%)",
        border: "1px solid rgba(255, 255, 255, 0.07)",
        borderTop: `2px solid ${accent}`,
        borderRadius: 14,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {title}
        </span>
        {Icon && (
          <div style={{ padding: 6, borderRadius: 8, background: "rgba(255,255,255,0.04)", color: accent }}>
            <Icon size={16} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        {statusDot && (
          <span style={{ position: "relative", display: "inline-block", width: 8, height: 8, marginRight: 2 }}>
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: statusActive ? "#10b981" : "#64748b",
              }}
            />
            {statusActive && (
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "#10b981",
                  opacity: 0.5,
                  animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                }}
              />
            )}
          </span>
        )}
        <div style={{ fontSize: 24, fontWeight: 700, color: "#f8fafc", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em" }}>
          {value}
        </div>
      </div>

      {(trend || subvalue) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b" }}>
          {trend && (
            <span style={{ color: trendPositive ? "#10b981" : "#ef4444", fontWeight: 600 }}>
              {trend}
            </span>
          )}
          {subvalue && <span>{subvalue}</span>}
        </div>
      )}
    </motion.div>
  );
}
