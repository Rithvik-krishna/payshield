import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Filter, ArrowUpRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { RiskScoreBadge, DecisionBadge, ChannelBadge } from "../Common/RiskBadge";
import { formatINR } from "../../theme/designSystem";

const FILTERS = ["All", "Flagged", "Blocked", "Cleared", "Gmail", "SMS"];

export default function TransactionFeed({ transactions = [], onSelect, selectedTxId }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      // Channel / Risk filter
      if (filter === "Flagged" && (tx.fraudScore || 0) < 70) return false;
      if (filter === "Blocked" && !["block", "quarantine"].includes(String(tx.decision).toLowerCase())) return false;
      if (filter === "Cleared" && (tx.fraudScore || 0) >= 70) return false;
      if (filter === "Gmail" && tx.source !== "GMAIL_LIVE") return false;
      if (filter === "SMS" && tx.source !== "BANK_SMS") return false;

      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = String(tx.txId || "").toLowerCase().includes(q);
        const matchMerch = String(tx.merchant || tx.merchantName || "").toLowerCase().includes(q);
        const matchUser = String(tx.userId || tx.userEmail || "").toLowerCase().includes(q);
        const matchAmount = String(tx.amount || "").includes(q);
        if (!matchId && !matchMerch && !matchUser && !matchAmount) return false;
      }

      return true;
    });
  }, [transactions, filter, search]);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0d1527 0%, #0a0f1d 100%)",
        borderRadius: 16,
        border: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Table Controls Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>
              Live Transactions Stream
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#38bdf8",
                background: "rgba(56, 189, 248, 0.1)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                borderRadius: 999,
                padding: "1px 8px",
              }}
            >
              {transactions.length} Screened
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            Click any transaction to launch deep forensic investigation
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              style={{
                background: filter === item ? "#38bdf8" : "rgba(255, 255, 255, 0.04)",
                color: filter === item ? "#030712" : "#94a3b8",
                border: `1px solid ${filter === item ? "#38bdf8" : "rgba(255, 255, 255, 0.08)"}`,
                borderRadius: 8,
                padding: "5px 12px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: "relative", width: "100%" }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by Transaction ID, Merchant, Amount, or User..."
          style={{
            width: "100%",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: 10,
            padding: "9px 12px 9px 36px",
            color: "#f8fafc",
            fontSize: 12,
            outline: "none",
          }}
        />
      </div>

      {/* Table Container */}
      <div style={{ maxHeight: 380, overflowY: "auto", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.04)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 12 }}>
          <thead style={{ background: "rgba(255, 255, 255, 0.03)", position: "sticky", top: 0, zIndex: 5 }}>
            <tr style={{ color: "#64748b", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.06em" }}>
              <th style={{ padding: "10px 14px" }}>Transaction ID</th>
              <th style={{ padding: "10px 14px" }}>Merchant / Entity</th>
              <th style={{ padding: "10px 14px" }}>Amount</th>
              <th style={{ padding: "10px 14px" }}>Channel</th>
              <th style={{ padding: "10px 14px" }}>Risk Score</th>
              <th style={{ padding: "10px 14px" }}>Decision</th>
              <th style={{ padding: "10px 14px" }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map((tx) => {
                const isSelected = selectedTxId === tx.txId;
                const score = Number(tx.fraudScore || 0);
                return (
                  <motion.tr
                    key={tx.txId}
                    onClick={() => onSelect?.(tx)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      cursor: "pointer",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                      background: isSelected ? "rgba(56, 189, 248, 0.08)" : "transparent",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "rgba(255, 255, 255, 0.025)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <td style={{ padding: "12px 14px", fontFamily: "'JetBrains Mono', monospace", color: "#e2e8f0", fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <ArrowUpRight size={13} color="#64748b" />
                        {String(tx.txId).slice(0, 14)}
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", color: "#f8fafc", fontWeight: 500 }}>
                      {tx.merchant || tx.merchantName || "Bank Transfer"}
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: "'JetBrains Mono', monospace", color: "#f8fafc", fontWeight: 700 }}>
                      {formatINR(tx.amount)}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <ChannelBadge source={tx.source} />
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <RiskScoreBadge score={score} size="sm" />
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <DecisionBadge decision={tx.decision} size="sm" />
                    </td>
                    <td style={{ padding: "12px 14px", color: "#64748b", fontSize: 11 }}>
                      {new Date(tx.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 16px", color: "#64748b" }}>
            No transactions match the current filter.
          </div>
        )}
      </div>
    </div>
  );
}
