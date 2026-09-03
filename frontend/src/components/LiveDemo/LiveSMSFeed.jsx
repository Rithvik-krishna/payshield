import React, { useState } from "react";
import { MessageSquare, Send, Copy, Check, Smartphone, ArrowRight } from "lucide-react";
import { testSms } from "../../services/api";
import useFraudStore from "../../store/fraudStore";
import { formatINR } from "../../theme/designSystem";

export default function LiveSMSFeed() {
  const [sending, setSending] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customSms, setCustomSms] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const smsFeed = useFraudStore((state) => state.smsFeed);

  const localHost = typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? window.location.hostname
    : "10.5.14.181";
  const webhookUrl = `http://${localHost}:3001/api/sms/incoming`;

  const copyWebhook = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const trigger = async (overrideText = null) => {
    setSending(true);
    try {
      const text = overrideText || (customSms.trim() ? customSms.trim() : null);
      const res = await testSms(text ? { sms: text } : {});
      if (res && res.status === "scored") {
        useFraudStore.getState().addSmsFeedItem({
          type: "LIVE_SMS_SCORED",
          from: res.from || res.parsed?.bankName || "HDFCBK",
          raw: res.raw || text || "Bank Alert SMS",
          parsed: res.parsed,
          result: res.result,
          timestamp: new Date().toISOString(),
        });
        if (customSms) setCustomSms("");
      }
    } catch (err) {
      console.error("SMS test failed:", err);
    } finally {
      setSending(false);
    }
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
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>
            Bank Alert Intelligence
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            Real-time Android SMS forwarder webhook for HDFC, ICICI, SBI, Axis UPI debits
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontWeight: 600,
            color: "#10b981",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            padding: "3px 10px",
            borderRadius: 999,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
          Webhook Active
        </div>
      </div>

      {/* Setup Instructions Accordion */}
      <button
        onClick={() => setShowSetup((c) => !c)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: 8,
          padding: "8px 12px",
          color: "#94a3b8",
          fontSize: 11,
          cursor: "pointer",
        }}
      >
        <span>Android Forwarder Instructions &amp; Webhook URL</span>
        <span style={{ fontSize: 10 }}>{showSetup ? "? Hide" : "? Show"}</span>
      </button>

      {showSetup && (
        <div style={{ background: "rgba(0, 0, 0, 0.3)", borderRadius: 8, padding: "12px", fontSize: 11, color: "#cbd5e1", lineHeight: 1.6, border: "1px solid rgba(255, 255, 255, 0.04)" }}>
          <div>1. Install <strong>SMS Forwarder</strong> on your Android phone.</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <span>2. Target Webhook:</span>
            <code style={{ background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", padding: "2px 6px", borderRadius: 4, fontFamily: "'JetBrains Mono', monospace" }}>{webhookUrl}</code>
            <button onClick={copyWebhook} style={{ background: copied ? "#10b981" : "rgba(255, 255, 255, 0.1)", color: copied ? "#000" : "#fff", border: "none", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div style={{ marginTop: 4 }}>3. Filter senders: <code>HDFCBK, ICICIB, SBIPSG, AXISBK</code>.</div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => trigger()}
          disabled={sending}
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
            color: "#030712",
            border: "none",
            borderRadius: 10,
            padding: "11px",
            fontWeight: 700,
            fontSize: 12,
            cursor: sending ? "not-allowed" : "pointer",
            boxShadow: "0 4px 16px rgba(245, 158, 11, 0.25)",
          }}
        >
          {sending ? "Processing..." : "Test Bank SMS Alert"}
        </button>
        <button
          onClick={() => setShowCustom((c) => !c)}
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#94a3b8",
            borderRadius: 10,
            padding: "11px 14px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {showCustom ? "Close Custom" : "Custom SMS"}
        </button>
      </div>

      {/* Custom SMS Drawer */}
      {showCustom && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "rgba(0, 0, 0, 0.3)", padding: 10, borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <textarea
            rows={2}
            value={customSms}
            onChange={(e) => setCustomSms(e.target.value)}
            placeholder="Paste your bank SMS alert here..."
            style={{ width: "100%", background: "#0a0f1d", color: "#f8fafc", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 8, padding: 8, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", resize: "none" }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => trigger(customSms)}
              disabled={sending || !customSms.trim()}
              style={{ background: "#10b981", color: "#000", border: "none", borderRadius: 6, padding: "6px 12px", fontWeight: 700, fontSize: 11, cursor: "pointer" }}
            >
              Parse &amp; Score
            </button>
            <button
              onClick={() => setCustomSms("INR 15000.00 debited from A/c XX7788 on 23-03-26 to VPA newpayee4821@okhdfcbank. UPI Ref 712345678901. URGENT vendor account update.")}
              style={{ background: "rgba(255, 255, 255, 0.05)", color: "#94a3b8", border: "none", borderRadius: 6, padding: "6px 8px", fontSize: 10, cursor: "pointer" }}
            >
              High-Risk Sample
            </button>
          </div>
        </div>
      )}

      {/* SMS Feed List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto" }}>
        {smsFeed.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: 12, textAlign: "center", padding: "24px 8px" }}>
            <Smartphone size={24} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
            <div>Bank SMS receiver active. Make any UPI transaction or click &apos;Test Bank SMS Alert&apos; above.</div>
          </div>
        ) : (
          smsFeed.map((entry, idx) => {
            const score = Number(entry.result?.fraudScore || entry.fraudScore || 0);
            return (
              <div
                key={`${entry.timestamp}-${idx}`}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: 10,
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.25)", padding: "2px 8px", borderRadius: 999 }}>
                    {entry.parsed?.bankName || entry.from || "Bank Alert"}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b", fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatINR(entry.parsed?.amount || 0)}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#cbd5e1" }}>
                  {entry.parsed?.merchant || "Bank Transfer"} ? {entry.parsed?.paymentMethod || "UPI"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, color: "#64748b" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{entry.parsed?.utrNumber || "UTR Pending"}</span>
                  <span style={{ fontWeight: 700, color: score >= 70 ? "#ef4444" : "#10b981" }}>
                    {score}/100 ? {String(entry.result?.decision || entry.decision || "approve").toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
