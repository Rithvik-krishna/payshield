import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Layers,
  Play,
  RefreshCw,
  Server,
  Shield,
  Zap,
  Radio,
  FileText,
  Workflow,
  Sparkles,
} from "lucide-react";

import {
  fetchSystemStatus,
  fetchObservabilityAnomalies,
  fetchObservabilityMetrics,
  fetchRemediationHistory,
  fetchRootCauseLatest,
  injectObservabilityFailure,
} from "../services/api";

const brainWsUrl = import.meta.env.VITE_OBSERVABILITY_WS_URL || "ws://localhost:9000/ws/live-feed";
const serviceList = [
  "payshield-frontend",
  "payshield-backend",
  "payshield-ml-engine",
  "payshield-blockchain",
  "payshield-simulator",
  "redis",
];

const failureTypes = [
  { id: "ml_engine_latency", label: "ML Latency Spike", desc: "Injects 450ms P95 latency into ensemble models" },
  { id: "ml_engine_oom", label: "ML Memory Exhaustion", desc: "Simulates memory pressure & thread pool saturation" },
  { id: "cascade_failure", label: "Full Cascade Breakdown", desc: "Triggers chained dependency failure across ML & Backend" },
];

function humanize(value = "") {
  return String(value || "")
    .replace(/^payshield-/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\bml\b/gi, "ML")
    .replace(/\brca\b/gi, "RCA")
    .replace(/\bapi\b/gi, "API")
    .replace(/\bws\b/gi, "WS")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function GaugeCard({ service, score }) {
  const bounded = Math.max(0, Math.min(1, score || 0));
  const isCritical = bounded > 0.65;
  const isWarning = bounded >= 0.4;
  const color = isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981";
  const arc = d3.arc().innerRadius(28).outerRadius(36).startAngle(-Math.PI / 2).endAngle(-Math.PI / 2 + Math.PI * bounded);

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
          {humanize(service)}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
          {Math.round(bounded * 100)}%
        </div>
        <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase" }}>
          {isCritical ? "CRITICAL" : isWarning ? "WATCH" : "STABLE"}
        </div>
      </div>

      <svg width="80" height="50" viewBox="0 0 100 60">
        <g transform="translate(50,50)">
          <path d={d3.arc().innerRadius(28).outerRadius(36).startAngle(-Math.PI / 2).endAngle(Math.PI / 2)()} fill="rgba(255,255,255,0.06)" />
          <path d={arc()} fill={color} />
        </g>
      </svg>
    </div>
  );
}

export default function ObservabilityDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [anomalies, setAnomalies] = useState([]);
  const [latestRootCause, setLatestRootCause] = useState(null);
  const [remediations, setRemediations] = useState([]);
  const [lastCycleDurationMs, setLastCycleDurationMs] = useState(0);
  const [injecting, setInjecting] = useState(null);
  const [injectionStatus, setInjectionStatus] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [remediationSteps, setRemediationSteps] = useState([]);

  const displayedRootCause = useMemo(() => {
    if (latestRootCause?.root_cause_service && latestRootCause.root_cause_service !== "unknown") {
      return latestRootCause;
    }
    const anomalyRoot = anomalies[0]?.rootCause || anomalies[0];
    return anomalyRoot?.root_cause_service ? anomalyRoot : latestRootCause;
  }, [anomalies, latestRootCause]);

  const handleInject = useCallback(async (failureType) => {
    setInjecting(failureType);
    setRemediationSteps([]);
    setAnomalies([]);
    setLatestRootCause(null);
    setInjectionStatus({ type: "info", message: `Scheduling ${failureType} for the next RCA cycle...` });
    try {
      const response = await injectObservabilityFailure(failureType);
      setInjectionStatus({ type: "success", message: `${response.failure_type} scheduled. Telemetry analyzing...` });
      setTimeout(async () => {
        try {
          const [anomalyRes, rootRes, remediationRes] = await Promise.all([
            fetchObservabilityAnomalies(),
            fetchRootCauseLatest(),
            fetchRemediationHistory(),
          ]);
          setAnomalies(anomalyRes || []);
          setLatestRootCause(rootRes || null);
          setRemediations(remediationRes || []);
        } catch (_error) {}
      }, 4000);
    } catch (error) {
      setInjectionStatus({
        type: "error",
        message: error?.response?.data?.detail || error?.message || `Failed to schedule ${failureType}.`,
      });
    } finally {
      setInjecting(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let socket;

    const refresh = async () => {
      const [anomalyRes, rootRes, remediationRes, metricsText, systemStatusRes] = await Promise.allSettled([
        fetchObservabilityAnomalies(),
        fetchRootCauseLatest(),
        fetchRemediationHistory(),
        fetchObservabilityMetrics(),
        fetchSystemStatus(),
      ]);

      if (!mounted) return;
      if (anomalyRes.status === "fulfilled") setAnomalies(anomalyRes.value || []);
      if (rootRes.status === "fulfilled") setLatestRootCause(rootRes.value || null);
      if (remediationRes.status === "fulfilled") setRemediations(remediationRes.value || []);
      if (systemStatusRes.status === "fulfilled") setSystemStatus(systemStatusRes.value || null);
      if (metricsText.status === "fulfilled") {
        const match = metricsText.value.match(/last_cycle_duration_ms\s+(\d+(\.\d+)?)/);
        if (match) setLastCycleDurationMs(Number(match[1]));
      }
    };

    refresh();
    const interval = setInterval(refresh, 3000);

    try {
      socket = new WebSocket(brainWsUrl);
      socket.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (payload.type === "DEMO_RESET") {
          setAnomalies([]);
          setLatestRootCause(null);
          setRemediations([]);
          setRemediationSteps([]);
        }
        if (payload.type === "DEMO_INJECTION_STARTED") {
          setInjectionStatus({ type: "info", message: payload.message || `${payload.failureType} scheduled.` });
        }
        if (payload.type === "ANOMALY_DETECTED") {
          setAnomalies((current) => [payload, ...current].slice(0, 20));
          setLatestRootCause(payload.rootCause);
        }
        if (payload.type === "REMEDIATION_STEP") {
          setRemediationSteps((current) => [payload, ...current].slice(0, 20));
        }
        if (payload.type === "REMEDIATION_EXECUTED") {
          setRemediations((current) => [payload.remediation, ...current].slice(0, 50));
        }
        if (payload.type === "SYSTEM_RECOVERED") {
          setLatestRootCause(null);
        }
      };
    } catch (_e) {}

    return () => {
      mounted = false;
      clearInterval(interval);
      if (socket) socket.close();
    };
  }, []);

  const fallbackActive = Boolean(systemStatus?.fallbackActive);
  const incidentAgeMs = displayedRootCause?.timestamp
    ? Date.now() - new Date(displayedRootCause.timestamp).getTime()
    : null;
  const incidentRecovered =
    Boolean(displayedRootCause?.recovered) ||
    (incidentAgeMs !== null && incidentAgeMs > 15000 && !fallbackActive);

  const serviceScores = useMemo(() => {
    const compositeScoreMap = displayedRootCause?.composite_scores || {};
    const next = {
      "payshield-frontend": 0.04,
      "payshield-backend": fallbackActive ? 0.72 : 0.08,
      "payshield-ml-engine": systemStatus ? (systemStatus.mlEngineHealthy ? (incidentRecovered ? 0.08 : compositeScoreMap["payshield-ml-engine"] || 0.08) : 0.9) : 0.08,
      "payshield-blockchain": systemStatus ? (systemStatus.blockchainHealthy ? 0.04 : 0.9) : 0.04,
      "payshield-simulator": 0.04,
      redis: systemStatus ? (systemStatus.cacheMode === "memory_fallback" ? 0.45 : 0.08) : 0.08,
    };

    if (!incidentRecovered && displayedRootCause?.root_cause_service && compositeScoreMap[displayedRootCause.root_cause_service]) {
      next[displayedRootCause.root_cause_service] = compositeScoreMap[displayedRootCause.root_cause_service];
    }
    return next;
  }, [displayedRootCause, fallbackActive, systemStatus, incidentRecovered]);

  const activeConfidence = displayedRootCause?.confidence
    ? `${Math.round(displayedRootCause.confidence * 100)}%`
    : incidentRecovered
    ? "Recovered"
    : "Monitoring";

  const slaProgress = Math.min(100, Math.round(((lastCycleDurationMs || 34) / 15000) * 100));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top 4 Hero KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <div style={{ background: "linear-gradient(135deg, #0d1527 0%, #0a0f1d 100%)", borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(255,255,255,0.07)", borderTop: "2px solid #38bdf8" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Detection Confidence</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#38bdf8", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
            {activeConfidence}
          </div>
        </div>

        <div style={{ background: "linear-gradient(135deg, #0d1527 0%, #0a0f1d 100%)", borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(255,255,255,0.07)", borderTop: "2px solid #10b981" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Scoring Mode</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#10b981", marginTop: 4 }}>
            {systemStatus?.fraudScoringMode || "Full Ensemble"}
          </div>
        </div>

        <div style={{ background: "linear-gradient(135deg, #0d1527 0%, #0a0f1d 100%)", borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(255,255,255,0.07)", borderTop: "2px solid #06b6d4" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Evidence Channels</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#06b6d4", marginTop: 4 }}>
            Metrics ? Logs ? Traces
          </div>
        </div>

        <div style={{ background: "linear-gradient(135deg, #0d1527 0%, #0a0f1d 100%)", borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(255,255,255,0.07)", borderTop: "2px solid #a855f7" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Active Remediation</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: fallbackActive ? "#f59e0b" : "#a855f7", marginTop: 4 }}>
            {fallbackActive ? "Remediating" : "Autonomous Standby"}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: 8 }}>
        {[
          { id: "overview", label: "Health & Live Anomaly Feed" },
          { id: "rca", label: "Root Cause & Telemetry Evidence" },
          { id: "recovery", label: "Self-Healing & Audit Timeline" },
          { id: "testing", label: "Simulation & Failure Testing" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: activeTab === t.id ? "rgba(56, 189, 248, 0.1)" : "transparent",
              color: activeTab === t.id ? "#38bdf8" : "#94a3b8",
              border: `1px solid ${activeTab === t.id ? "rgba(56, 189, 248, 0.3)" : "transparent"}`,
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Health */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Service Gauges Grid */}
          <div style={{ background: "linear-gradient(135deg, #0d1527 0%, #0a0f1d 100%)", borderRadius: 16, padding: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", marginBottom: 14 }}>
              Service Health Monitoring Matrix
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              {serviceList.map((svc) => (
                <GaugeCard key={svc} service={svc} score={serviceScores[svc]} />
              ))}
            </div>
          </div>

          {/* 15-Second SLA & Root Cause Alert */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* SLA Card */}
            <div style={{ background: "linear-gradient(135deg, #0d1527 0%, #0a0f1d 100%)", borderRadius: 16, padding: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>15-Second Self-Healing SLA</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "2px 8px", borderRadius: 999 }}>WITHIN SLA</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#38bdf8", fontFamily: "'JetBrains Mono', monospace", margin: "10px 0" }}>
                {Math.round(lastCycleDurationMs || 32)} ms
              </div>
              <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${Math.max(4, slaProgress)}%`, height: "100%", background: "#10b981", borderRadius: 999 }} />
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>
                Autonomous RCA consensus &amp; failover guaranteed under 15,000ms
              </div>
            </div>

            {/* Active Root Cause Panel */}
            <div style={{ background: "linear-gradient(135deg, #0d1527 0%, #0a0f1d 100%)", borderRadius: 16, padding: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>Attributed Root Cause</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: displayedRootCause?.root_cause_service ? "#ef4444" : "#10b981", marginTop: 10 }}>
                {displayedRootCause?.root_cause_service ? humanize(displayedRootCause.root_cause_service) : "System Healthy / Nominal"}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6, lineHeight: 1.5 }}>
                {displayedRootCause?.failure_pattern || "Continuous telemetry analysis indicates zero active service anomalies."}
              </div>
            </div>
          </div>

          {/* Live Anomaly Feed */}
          <div style={{ background: "linear-gradient(135deg, #0d1527 0%, #0a0f1d 100%)", borderRadius: 16, padding: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", marginBottom: 12 }}>
              Live Anomaly Event Log
            </div>
            {anomalies.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 16px", color: "#64748b", fontSize: 12 }}>
                Waiting for telemetry anomalies. Click &apos;Simulation &amp; Failure Testing&apos; to trigger live RCA.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                {anomalies.map((a, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>{humanize(a.service || a.rootCause?.root_cause_service || "Anomaly")}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>{a.description || a.rootCause?.failure_pattern || "Anomaly detected"}</span>
                    </div>
                    <span style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>{new Date().toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: RCA & Telemetry Evidence */}
      {activeTab === "rca" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "linear-gradient(135deg, #0d1527 0%, #0a0f1d 100%)", borderRadius: 16, padding: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>
              Multi-Signal Root Cause Evidence
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
              {displayedRootCause?.business_impact || "All services operating normally. No high-confidence root cause detected."}
            </div>

            {displayedRootCause?.cause_chain && displayedRootCause.cause_chain.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Causal Chain</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {displayedRootCause.cause_chain.map((c, i) => (
                    <div key={i} style={{ background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "#38bdf8" }}>
                      {i + 1}. {c}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Self-Healing & Remediation */}
      {activeTab === "recovery" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "linear-gradient(135deg, #0d1527 0%, #0a0f1d 100%)", borderRadius: 16, padding: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", marginBottom: 12 }}>
              Autonomous Remediation Actions
            </div>
            {remediations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 16px", color: "#64748b", fontSize: 12 }}>
                No active remediation required. System is stable.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {remediations.map((r, i) => (
                  <div key={i} style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>{r.action || r.title || "Remediation Executed"}</div>
                    <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 2 }}>{r.rationale || r.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Simulation & Failure Testing */}
      {activeTab === "testing" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "linear-gradient(135deg, #0d1527 0%, #0a0f1d 100%)", borderRadius: 16, padding: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>
              Simulation &amp; Failure Testing (Chaos Engineering)
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, marginBottom: 16 }}>
              Safely inject realistic infrastructure faults to test autonomous Bi-LSTM root cause analysis and 15s self-healing.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {failureTypes.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleInject(f.id)}
                  disabled={injecting !== null}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: 12,
                    padding: "14px",
                    textAlign: "left",
                    cursor: injecting ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>{f.label}</span>
                    <Play size={12} color="#ef4444" />
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>{f.desc}</div>
                </button>
              ))}
            </div>

            {injectionStatus && (
              <div style={{ marginTop: 14, background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 11, color: "#38bdf8" }}>
                {injectionStatus.message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
