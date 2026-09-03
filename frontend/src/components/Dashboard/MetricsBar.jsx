import React from "react";
import { Activity, ShieldAlert, CheckCircle2, Clock, Cpu, Link2, GitBranch } from "lucide-react";
import MetricCard from "../Common/MetricCard";

export default function MetricsBar({ metrics = {} }) {
  const {
    transactionsPerSecond = 0,
    fraudRate = 0,
    falsePositiveRate = 0,
    avgResponseMs = 0,
    modelsActive = "6/6",
    blockchain = "SYNCED",
    federatedRound = "#001",
  } = metrics;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 20 }}>
      <MetricCard
        title="Throughput"
        value={`${transactionsPerSecond} tx/s`}
        subvalue="Real-time ingestion"
        icon={Activity}
        accent="#38bdf8"
      />
      <MetricCard
        title="Fraud Rate"
        value={`${Number(fraudRate).toFixed(1)}%`}
        trend={fraudRate > 5 ? "Elevated Risk" : "Normal Baseline"}
        trendPositive={fraudRate <= 5}
        icon={ShieldAlert}
        accent={fraudRate > 5 ? "#ef4444" : "#10b981"}
      />
      <MetricCard
        title="False Positive"
        value={`${(Number(falsePositiveRate) * 100).toFixed(2)}%`}
        subvalue="High precision target"
        icon={CheckCircle2}
        accent="#10b981"
      />
      <MetricCard
        title="P95 Latency"
        value={`${Math.round(avgResponseMs || 42)}ms`}
        subvalue="SLA < 100ms"
        icon={Clock}
        accent={avgResponseMs > 150 ? "#f59e0b" : "#06b6d4"}
      />
      <MetricCard
        title="Active Models"
        value={modelsActive}
        subvalue="6-Model Ensemble"
        icon={Cpu}
        accent="#a855f7"
        statusDot
        statusActive={modelsActive !== "0/6"}
      />
      <MetricCard
        title="Audit Chain"
        value={blockchain}
        subvalue="Immutable Ledger"
        icon={Link2}
        accent={blockchain === "SYNCED" ? "#10b981" : "#f59e0b"}
        statusDot
        statusActive={blockchain === "SYNCED"}
      />
    </div>
  );
}
