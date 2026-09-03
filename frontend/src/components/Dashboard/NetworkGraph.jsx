import React, { useMemo, useState, useCallback } from "react";
import { Share2, AlertTriangle, Shield, CheckCircle2, Radio } from "lucide-react";

const NODE_TYPES = {
  account: { color: "#38bdf8", label: "Account" },
  merchant: { color: "#a855f7", label: "Merchant" },
  device: { color: "#06b6d4", label: "Device" },
  ip: { color: "#10b981", label: "IP Address" },
};

const BASE_RING_NODES = [
  { id: "acc-mule-01", type: "account", fraudScore: 94, x: 140, y: 130, connectedToFraud: true, label: "ACC_MULE_01" },
  { id: "acc-mule-02", type: "account", fraudScore: 91, x: 210, y: 80, connectedToFraud: true, label: "ACC_MULE_02" },
  { id: "acc-mule-03", type: "account", fraudScore: 88, x: 280, y: 140, connectedToFraud: true, label: "ACC_MULE_03" },
  { id: "dev-stolen-01", type: "device", fraudScore: 94, x: 210, y: 190, connectedToFraud: true, label: "DEV_STOLEN_01" },
  { id: "merch-shell-01", type: "merchant", fraudScore: 85, x: 350, y: 110, connectedToFraud: true, label: "MERCH_SHELL_01" },
  { id: "ip-foreign-01", type: "ip", fraudScore: 0, x: 100, y: 210, connectedToFraud: true, label: "IP_FOREIGN_01" },
];

const BASE_RING_EDGES = [
  { from: "acc-mule-01", to: "merch-shell-01", score: 94, txId: "ring-1" },
  { from: "acc-mule-02", to: "merch-shell-01", score: 91, txId: "ring-2" },
  { from: "acc-mule-03", to: "merch-shell-01", score: 88, txId: "ring-3" },
  { from: "dev-stolen-01", to: "acc-mule-01", score: 94, txId: "ring-4" },
  { from: "dev-stolen-01", to: "acc-mule-02", score: 91, txId: "ring-5" },
  { from: "dev-stolen-01", to: "acc-mule-03", score: 88, txId: "ring-6" },
  { from: "ip-foreign-01", to: "acc-mule-01", score: 94, txId: "ring-7" },
];

function shortLabel(value, max = 14) {
  const text = String(value || "unknown");
  return text.length > max ? `${text.slice(0, max)}..` : text;
}

function buildGraph(transactions) {
  const nodes = new Map();
  const edges = [];
  const txList = transactions.slice(0, 30);

  txList.forEach((tx, i) => {
    const uid = tx.userId || `acc-${(tx.txId || `t-${i}`).slice(0, 8)}`;
    const mid = tx.merchant || `merchant-${i}`;
    const did = tx.deviceId || `dev-${(tx.txId || `d-${i}`).slice(0, 6)}`;
    const ipid = tx.ipAddress || `ip-${tx.country || "IN"}-${i % 4}`;
    const suspicious = (tx.fraudScore || 0) >= 70;

    if (!nodes.has(uid)) nodes.set(uid, { id: uid, type: "account", fraudScore: tx.fraudScore || 0, connectedToFraud: false, label: shortLabel(uid) });
    if (!nodes.has(mid)) nodes.set(mid, { id: mid, type: "merchant", fraudScore: suspicious ? (tx.fraudScore || 0) : 0, connectedToFraud: false, label: shortLabel(mid) });
    if (!nodes.has(did)) nodes.set(did, { id: did, type: "device", fraudScore: suspicious ? (tx.fraudScore || 0) : 0, connectedToFraud: false, label: shortLabel(did) });
    if (!nodes.has(ipid)) nodes.set(ipid, { id: ipid, type: "ip", fraudScore: 0, connectedToFraud: false, label: shortLabel(ipid) });

    edges.push({ from: uid, to: mid, score: tx.fraudScore || 0, txId: tx.txId || `edge-${i}` });
    edges.push({ from: did, to: uid, score: tx.fraudScore || 0, txId: `${tx.txId || `edge-${i}`}-d` });
    edges.push({ from: ipid, to: uid, score: tx.fraudScore || 0, txId: `${tx.txId || `edge-${i}`}-i` });

    if (suspicious) {
      nodes.get(uid).fraudScore = Math.max(nodes.get(uid).fraudScore, tx.fraudScore || 0);
      nodes.get(mid).connectedToFraud = true;
      nodes.get(did).connectedToFraud = true;
      nodes.get(ipid).connectedToFraud = true;
    }
  });

  if (nodes.size < 5) {
    BASE_RING_NODES.forEach((node) => nodes.set(node.id, { ...node }));
    BASE_RING_EDGES.forEach((edge) => edges.push({ ...edge }));
  }

  const nodeArr = Array.from(nodes.values());
  nodeArr.forEach((node, i) => {
    if (typeof node.x !== "number" || typeof node.y !== "number") {
      const angle = (i / Math.max(nodeArr.length, 1)) * Math.PI * 2;
      node.x = 230 + 130 * Math.cos(angle);
      node.y = 145 + 85 * Math.sin(angle);
    }
  });

  return { nodes: nodeArr, edges };
}

export default function NetworkGraph({ transactions = [], selectedTransaction }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const focusTxId = selectedTransaction?.txId;
  const { nodes, edges } = useMemo(() => buildGraph(transactions), [transactions, focusTxId]);

  const filteredNodes = useMemo(() => {
    if (filter === "Anomaly") return nodes.filter((n) => (n.fraudScore || 0) >= 70 || n.connectedToFraud);
    return nodes;
  }, [nodes, filter]);

  const filteredIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const getNodeColor = useCallback((node) => {
    if ((node.fraudScore || 0) >= 70) return "#ef4444";
    if (node.connectedToFraud) return "#f59e0b";
    return NODE_TYPES[node.type]?.color || "#38bdf8";
  }, []);

  const selectedNode = selected ? nodes.find((n) => n.id === selected) : null;
  const hasFraudNodes = nodes.some((n) => (n.fraudScore || 0) >= 70);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0d1527 0%, #0a0f1d 100%)",
        borderRadius: 16,
        border: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Header & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>
              Graph Topology Observability
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: hasFraudNodes ? "#ef4444" : "#10b981",
                background: hasFraudNodes ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)",
                border: `1px solid ${hasFraudNodes ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                borderRadius: 999,
                padding: "2px 8px",
              }}
            >
              {hasFraudNodes ? "SUSPICIOUS CLUSTER" : "CLEARED CLUSTER"}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            Interactive entity adjacency &amp; mule account fraud-ring detection
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {["All", "Anomaly"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? "#38bdf8" : "rgba(255, 255, 255, 0.04)",
                color: filter === f ? "#030712" : "#94a3b8",
                border: `1px solid ${filter === f ? "#38bdf8" : "rgba(255, 255, 255, 0.08)"}`,
                borderRadius: 8,
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Legend & Entity counts */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: 8, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {Object.entries(NODE_TYPES).map(([k, meta]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94a3b8" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: meta.color }} />
              {meta.label}
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#ef4444" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
            Flagged Anomaly
          </div>
        </div>

        <div style={{ fontSize: 11, color: "#64748b" }}>
          {nodes.length} Entities ? {edges.length} Connections
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        style={{
          position: "relative",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          background: "#080d19",
          minHeight: 280,
        }}
      >
        <svg viewBox="0 0 460 280" style={{ width: "100%", height: "100%", display: "block" }}>
          {/* Edges */}
          {edges
            .filter((e) => filteredIds.has(e.from) && filteredIds.has(e.to))
            .map((edge, i) => {
              const from = nodes.find((n) => n.id === edge.from);
              const to = nodes.find((n) => n.id === edge.to);
              if (!from || !to) return null;
              const isFraud = (edge.score || 0) >= 70;
              return (
                <line
                  key={`${edge.txId}-${i}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isFraud ? "#ef4444" : "rgba(255,255,255,0.12)"}
                  strokeWidth={isFraud ? 1.8 : 0.8}
                  strokeOpacity={isFraud ? 0.9 : 0.4}
                  strokeDasharray={isFraud ? "none" : "2 2"}
                />
              );
            })}

          {/* Nodes */}
          {filteredNodes.map((node) => {
            const color = getNodeColor(node);
            const isFraud = (node.fraudScore || 0) >= 70;
            const isSelected = selected === node.id;
            const r = isFraud ? 11 : 7;
            return (
              <g
                key={node.id}
                onClick={() => setSelected(selected === node.id ? null : node.id)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? r + 3 : r}
                  fill={color}
                  stroke={isSelected ? "#f8fafc" : "none"}
                  strokeWidth={2}
                  style={{ filter: isFraud ? "drop-shadow(0 0 8px rgba(239,68,68,0.5))" : "none" }}
                />
                <text
                  x={node.x}
                  y={node.y + r + 11}
                  textAnchor="middle"
                  fill={isFraud ? "#ef4444" : "#94a3b8"}
                  style={{ fontSize: isSelected ? 10 : 8, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {shortLabel(node.label, isSelected ? 16 : 10)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: 10,
            padding: "12px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Selected Entity ({selectedNode.type})
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", fontFamily: "'JetBrains Mono', monospace" }}>
              {selectedNode.id}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>Risk Assessment</div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: (selectedNode.fraudScore || 0) >= 70 ? "#ef4444" : "#10b981",
              }}
            >
              {(selectedNode.fraudScore || 0) >= 70 ? "HIGH RISK / QUARANTINE" : "NORMAL TRUST PROFILE"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
