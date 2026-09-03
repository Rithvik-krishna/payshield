import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, AlertOctagon, Mail, CheckCircle2, X, ExternalLink } from "lucide-react";
import useFraudStore from "../../store/fraudStore";
import { formatINR, normalizeScore } from "../../theme/designSystem";

function resolveToastStyle(toast) {
  const decision = String(toast.decision || "").toLowerCase();
  const score = normalizeScore(toast.fraudScore);

  if (toast.kind === "email") {
    return {
      border: "rgba(56, 189, 248, 0.35)",
      borderLeft: "#38bdf8",
      accent: "#38bdf8",
      icon: <Mail size={14} color="#38bdf8" />,
      tag: "GMAIL BEC",
    };
  }

  if (decision === "block" || score >= 85) {
    return {
      border: "rgba(239, 68, 68, 0.4)",
      borderLeft: "#ef4444",
      accent: "#ef4444",
      icon: <AlertOctagon size={14} color="#ef4444" />,
      tag: "CRITICAL FRAUD",
    };
  }

  if (decision === "quarantine" || score >= 70) {
    return {
      border: "rgba(245, 158, 11, 0.4)",
      borderLeft: "#f59e0b",
      accent: "#f59e0b",
      icon: <AlertTriangle size={14} color="#f59e0b" />,
      tag: "QUARANTINED",
    };
  }

  return {
    border: "rgba(16, 185, 129, 0.3)",
    borderLeft: "#10b981",
    accent: "#10b981",
    icon: <CheckCircle2 size={14} color="#10b981" />,
    tag: "ALERT",
  };
}

export default function AlertNotificationToast() {
  const toasts = useFraudStore((state) => state.toasts);
  const removeToast = useFraudStore((state) => state.removeToast);
  const setSelectedTransaction = useFraudStore((state) => state.setSelectedTransaction);

  // Auto-dismiss within 4 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) => {
      const id = toast.toastId || toast.txId || toast.timestamp;
      return setTimeout(() => removeToast(id), 4000);
    });
    return () => timers.forEach(clearTimeout);
  }, [toasts, removeToast]);

  // Cap visible toasts to maximum 2 at a time so they never block the screen
  const visibleToasts = toasts.slice(0, 2);

  return (
    <div
      style={{
        position: "fixed",
        right: 18,
        bottom: 18,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
        maxWidth: 360,
      }}
    >
      <AnimatePresence>
        {visibleToasts.map((toast) => {
          const id = toast.toastId || toast.txId || toast.timestamp;
          const style = resolveToastStyle(toast);
          const score = normalizeScore(toast.fraudScore);

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{
                pointerEvents: "auto",
                background: "linear-gradient(135deg, rgba(13, 21, 39, 0.96) 0%, rgba(10, 15, 29, 0.96) 100%)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${style.border}`,
                borderLeft: `4px solid ${style.borderLeft}`,
                borderRadius: 12,
                padding: "12px 14px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {style.icon}
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>
                    {toast.title || "Suspicious event flagged"}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      color: style.accent,
                      background: `${style.accent}15`,
                      border: `1px solid ${style.accent}30`,
                      borderRadius: 999,
                      padding: "1px 6px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {style.tag}
                  </span>
                  <button
                    onClick={() => removeToast(id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                      padding: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Dismiss"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Transaction details row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
                <span style={{ color: "#cbd5e1", fontWeight: 500 }}>
                  {toast.merchant || "Counterparty"}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {toast.amount ? (
                    <span style={{ color: "#f8fafc", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                      {formatINR(toast.amount)}
                    </span>
                  ) : null}
                  <span style={{ color: style.accent, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                    {score}/100
                  </span>
                </div>
              </div>

              {/* Rationale & Action */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 2 }}>
                <div style={{ fontSize: 10, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
                  {toast.explanation?.topFeatures?.[0]?.humanReadable || "Escalated by multi-model ensemble consensus"}
                </div>

                {toast.kind === "transaction" && (
                  <button
                    onClick={() => {
                      setSelectedTransaction(toast);
                      removeToast(id);
                    }}
                    style={{
                      background: "rgba(56, 189, 248, 0.12)",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      color: "#38bdf8",
                      borderRadius: 6,
                      padding: "3px 8px",
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      flexShrink: 0,
                    }}
                  >
                    Investigate <ExternalLink size={10} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
