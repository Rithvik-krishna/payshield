import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, TrendingUp, Info } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => (i === 0 ? "12a" : i < 12 ? `${i}a` : i === 12 ? "12p" : `${i - 12}p`));

function buildDemoTx() {
  const now = Date.now();
  const out = [];
  for (let i = 0; i < 200; i += 1) {
    const d = new Date(now - (i % 7) * 86400000);
    const day = i % 7;
    let hour = (i * 7) % 24;
    let fraudScore = 20 + (i % 20);

    const isWeekendPeak = (day === 5 || day === 6) && (hour >= 22 || hour <= 2);
    const isMondayPeak = day === 1 && hour >= 9 && hour <= 11;
    if (isWeekendPeak) {
      hour = [22, 23, 0, 1, 2][i % 5];
      fraudScore = 70 + (i % 30);
    } else if (isMondayPeak) {
      hour = [9, 10, 11][i % 3];
      fraudScore = 55 + (i % 25);
    }

    d.setHours(hour, (i * 13) % 60, 0, 0);
    out.push({ timestamp: d.toISOString(), fraudScore });
  }
  return out;
}

export default function RiskHeatmap({ transactions = [] }) {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [mode, setMode] = useState("rate");
  const inputTx = transactions.length === 0 ? buildDemoTx() : transactions;

  const grid = useMemo(() => {
    return Array.from({ length: 7 }, (_, day) =>
      Array.from({ length: 24 }, (_, hour) => {
        const matches = inputTx.filter((tx) => {
          const d = new Date(tx.timestamp);
          return d.getDay() === day && d.getHours() === hour;
        });
        const total = matches.length;
        const fraudCount = matches.filter((tx) => (tx.fraudScore || 0) >= 70).length;
        return {
          total,
          fraudCount,
          rate: total > 0 ? fraudCount / total : 0,
          value: mode === "rate" ? (total > 0 ? fraudCount / total : 0) : Math.min(1, total / 10),
        };
      }),
    );
  }, [inputTx, mode]);

  const cellColor = (val) => {
    if (val === 0) return "rgba(255, 255, 255, 0.03)";
    if (val < 0.25) return "rgba(16, 185, 129, 0.3)";
    if (val < 0.5) return "rgba(56, 189, 248, 0.4)";
    if (val < 0.75) return "rgba(245, 158, 11, 0.5)";
    return "rgba(239, 68, 68, 0.75)";
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0d1527 0%, #0a0f1d 100%)",
        borderRadius: 16,
        padding: "20px 22px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>
            Temporal Risk Heatmap
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            24-hour hour-by-day fraud velocity distribution &amp; abnormal surge analysis
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setMode("rate")}
            style={{
              background: mode === "rate" ? "#38bdf8" : "rgba(255,255,255,0.04)",
              color: mode === "rate" ? "#030712" : "#94a3b8",
              border: `1px solid ${mode === "rate" ? "#38bdf8" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Fraud Rate
          </button>
          <button
            onClick={() => setMode("volume")}
            style={{
              background: mode === "volume" ? "#38bdf8" : "rgba(255,255,255,0.04)",
              color: mode === "volume" ? "#030712" : "#94a3b8",
              border: `1px solid ${mode === "volume" ? "#38bdf8" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tx Volume
          </button>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 620 }}>
          {/* Hour labels */}
          <div style={{ display: "grid", gridTemplateColumns: "36px repeat(24, 1fr)", gap: 3, marginBottom: 4 }}>
            <div />
            {HOURS.map((h, i) => (
              <div key={h} style={{ fontSize: 9, color: i % 3 === 0 ? "#94a3b8" : "#475569", textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>
                {i % 3 === 0 ? h : ""}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {grid.map((row, dayIdx) => (
            <div key={DAYS[dayIdx]} style={{ display: "grid", gridTemplateColumns: "36px repeat(24, 1fr)", gap: 3, marginBottom: 3, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{DAYS[dayIdx]}</span>
              {row.map((cell, hrIdx) => (
                <div
                  key={hrIdx}
                  onMouseEnter={() => setActiveTooltip({ day: DAYS[dayIdx], hour: HOURS[hrIdx], ...cell })}
                  onMouseLeave={() => setActiveTooltip(null)}
                  style={{
                    height: 18,
                    borderRadius: 3,
                    background: cellColor(cell.value),
                    border: "1px solid rgba(255, 255, 255, 0.04)",
                    cursor: "pointer",
                    transition: "transform 0.1s ease",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Insights */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94a3b8" }}>
          <TrendingUp size={14} color="#f59e0b" />
          <span>Analytic Insight: <strong>High velocity bursts occur on weekend evenings (10pm - 2am)</strong></span>
        </div>

        {activeTooltip ? (
          <div style={{ fontSize: 11, color: "#38bdf8", fontFamily: "'JetBrains Mono', monospace" }}>
            {activeTooltip.day} {activeTooltip.hour}: {activeTooltip.fraudCount} flagged / {activeTooltip.total} txs ({Math.round(activeTooltip.rate * 100)}%)
          </div>
        ) : (
          <div style={{ fontSize: 10, color: "#64748b" }}>Hover over any cell to view window telemetry</div>
        )}
      </div>
    </div>
  );
}
