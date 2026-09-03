import React, { useState } from "react";
import { Mail, Send, AlertTriangle, ShieldCheck, Inbox, CheckCircle2 } from "lucide-react";
import { sendTestBecEmail } from "../../services/api";
import useFraudStore from "../../store/fraudStore";

const scenarios = [
  { key: "standard", label: "Vendor Change", desc: "IBAN update request with urgent tone" },
  { key: "ceo_fraud", label: "Executive Request", desc: "Executive wire order bypassing verbal confirmation" },
  { key: "invoice_scam", label: "Invoice Update", desc: "Invoice account redirection to mule account" },
];

export default function LiveEmailMonitor() {
  const [sending, setSending] = useState(false);
  const [scenario, setScenario] = useState("standard");
  const [message, setMessage] = useState("");
  const emailFeed = useFraudStore((state) => state.emailFeed);
  const gmailConnected = useFraudStore((state) => state.gmailConnected);

  const trigger = async () => {
    setSending(true);
    try {
      const response = await sendTestBecEmail(scenario);
      setMessage(response.message);
    } catch (error) {
      setMessage(error.response?.data?.error || "Email submission failed.");
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
            Email Intelligence
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            Real-time BEC &amp; CEO fraud monitoring for rithvikkrishnadk@gmail.com
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontWeight: 600,
            color: gmailConnected ? "#10b981" : "#ef4444",
            background: gmailConnected ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${gmailConnected ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
            padding: "3px 10px",
            borderRadius: 999,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: gmailConnected ? "#10b981" : "#ef4444" }} />
          {gmailConnected ? "Gmail Connected" : "Standby"}
        </div>
      </div>

      {/* Scenario Selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
        {scenarios.map((item) => {
          const isSelected = scenario === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setScenario(item.key)}
              style={{
                background: isSelected ? "rgba(56, 189, 248, 0.1)" : "rgba(255, 255, 255, 0.03)",
                border: `1px solid ${isSelected ? "#38bdf8" : "rgba(255, 255, 255, 0.07)"}`,
                borderRadius: 10,
                padding: "10px 12px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: isSelected ? "#38bdf8" : "#f8fafc" }}>
                {item.label}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{item.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Trigger Button */}
      <button
        onClick={trigger}
        disabled={sending}
        style={{
          background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
          color: "#ffffff",
          border: "none",
          borderRadius: 10,
          padding: "11px",
          fontWeight: 700,
          fontSize: 12,
          cursor: sending ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          boxShadow: "0 4px 16px rgba(56, 189, 248, 0.25)",
        }}
      >
        <Send size={14} />
        {sending ? "Scanning Inbox..." : "Send Review Email"}
      </button>

      {message && <div style={{ fontSize: 11, color: "#10b981", textAlign: "center" }}>{message}</div>}

      {/* Email Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto" }}>
        {emailFeed.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: 12, textAlign: "center", padding: "24px 8px" }}>
            <Inbox size={24} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
            <div>Inbox scanner standby. Click &apos;Send Review Email&apos; above to trigger live NLP detection.</div>
          </div>
        ) : (
          emailFeed.map((email, idx) => (
            <div
              key={`${email.subject}-${idx}`}
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
                <span style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>{email.subject}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: (email.fraudScore || 0) >= 70 ? "#ef4444" : "#10b981",
                  }}
                >
                  {email.fraudScore ? `${email.fraudScore}/100` : "Scanning..."}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>From: {email.from}</div>
              {email.flaggedPhrases?.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                  {email.flaggedPhrases.map((phrase) => (
                    <span
                      key={phrase}
                      style={{
                        background: "rgba(239, 68, 68, 0.12)",
                        border: "1px solid rgba(239, 68, 68, 0.25)",
                        borderRadius: 999,
                        padding: "2px 8px",
                        fontSize: 10,
                        color: "#fca5a5",
                      }}
                    >
                      {phrase}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
