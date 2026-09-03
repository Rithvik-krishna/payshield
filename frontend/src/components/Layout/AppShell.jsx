import React, { useState } from "react";
import {
  Shield,
  LayoutDashboard,
  Activity,
  CreditCard,
  AlertOctagon,
  Search,
  Eye,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio,
  Mail,
  Zap,
  Cpu,
  Menu,
  X,
  Play,
  CheckCircle2,
} from "lucide-react";
import useFraudStore from "../../store/fraudStore";

export default function AppShell({
  activeTab,
  onTabChange,
  onLaunchReviewFlow,
  onRunRcaDemo,
  onSimulateClick,
  children,
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const wsConnected = useFraudStore((s) => s.wsConnected);
  const gmailConnected = useFraudStore((s) => s.gmailConnected);
  const demoRunning = useFraudStore((s) => s.demoRunning);
  const alerts = useFraudStore((s) => s.alerts);
  const alertCount = alerts.length;

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, badge: null },
    { id: "operations", label: "Fraud Operations", icon: Zap, badge: null },
    { id: "transactions", label: "Transactions", icon: CreditCard, badge: null },
    { id: "alerts", label: "Alerts & Incidents", icon: AlertOctagon, badge: alertCount > 0 ? alertCount : null, badgeColor: "#ef4444" },
    { id: "investigation", label: "Deep Investigation", icon: Search, badge: null },
    { id: "observability", label: "Observability Brain", icon: Eye, badge: "AIOps", badgeColor: "#06b6d4" },
    { id: "reports", label: "Reports & Compliance", icon: FileText, badge: null },
  ];

  const getPageTitle = () => {
    switch (activeTab) {
      case "overview":
        return { title: "Executive Overview", subtitle: "Autonomous fraud intelligence & telemetry stream" };
      case "operations":
        return { title: "Fraud Operations Workspace", subtitle: "Multi-channel payment review pipeline, Gmail BEC & Bank SMS monitors" };
      case "transactions":
        return { title: "Transaction Monitoring", subtitle: "Real-time payment screening, risk classification, and audit ledger" };
      case "alerts":
        return { title: "Alerts & Incidents", subtitle: "High-risk flagged payments quarantined for manual or step-up review" };
      case "investigation":
        return { title: "Forensic Investigation", subtitle: "6-Model ensemble SHAP explainability and interactive entity graph" };
      case "observability":
        return { title: "Autonomous Observability Brain", subtitle: "Multi-signal Bi-LSTM RCA, 15s self-healing SLA, and on-chain recovery audit" };
      case "reports":
        return { title: "Regulatory & Compliance Reports", subtitle: "Automated Suspicious Activity Reports (SAR) and RBI AML audit filings" };
      default:
        return { title: "PayShield AI", subtitle: "Autonomous Fraud Intelligence Network" };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#070b14", color: "#f1f5f9" }}>
      {/* Sidebar Desktop */}
      <aside
        style={{
          width: sidebarCollapsed ? 76 : 256,
          transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          background: "#0a0f1d",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 40,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "space-between",
            padding: sidebarCollapsed ? "0" : "0 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {!sidebarCollapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 16px rgba(56, 189, 248, 0.35)",
                }}
              >
                <Shield size={18} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.04em", color: "#f8fafc" }}>
                  PAYSHIELD <span style={{ color: "#38bdf8" }}>AI</span>
                </div>
                <div style={{ fontSize: 9, color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Fraud Intelligence
                </div>
              </div>
            </div>
          )}

          {sidebarCollapsed && (
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={20} color="#ffffff" />
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed((c) => !c)}
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "none",
              borderRadius: 6,
              padding: 6,
              color: "#94a3b8",
              cursor: "pointer",
              display: sidebarCollapsed ? "none" : "flex",
            }}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: sidebarCollapsed ? "center" : "space-between",
                  gap: 12,
                  padding: sidebarCollapsed ? "10px 0" : "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: isActive ? "rgba(56, 189, 248, 0.12)" : "transparent",
                  color: isActive ? "#38bdf8" : "#94a3b8",
                  cursor: "pointer",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 13,
                  transition: "all 0.15s ease",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Icon size={18} color={isActive ? "#38bdf8" : "#94a3b8"} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>

                {!sidebarCollapsed && item.badge && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      background: `${item.badgeColor || "#38bdf8"}20`,
                      color: item.badgeColor || "#38bdf8",
                      border: `1px solid ${item.badgeColor || "#38bdf8"}40`,
                      borderRadius: 999,
                      padding: "1px 7px",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom System Status */}
        <div style={{ padding: sidebarCollapsed ? "14px 6px" : "16px 14px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", width: 8, height: 8 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#10b981" }} />
              <div style={{ position: "absolute", inset: -2, borderRadius: "50%", background: "#10b981", opacity: 0.4, animation: "ping 1.5s infinite" }} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0" }}>All Systems Active</div>
                <div style={{ fontSize: 9, color: "#64748b" }}>Sub-50ms Enterprise SLA</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          style={{
            height: 64,
            padding: "0 24px",
            background: "rgba(10, 15, 29, 0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>{title}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{subtitle}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Real-time Status Badges */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 999,
                background: wsConnected ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                border: `1px solid ${wsConnected ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                fontSize: 11,
                fontWeight: 600,
                color: wsConnected ? "#10b981" : "#ef4444",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: wsConnected ? "#10b981" : "#ef4444" }} />
              {wsConnected ? "WS Live" : "WS Offline"}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 999,
                background: gmailConnected ? "rgba(56, 189, 248, 0.1)" : "rgba(148, 163, 184, 0.1)",
                border: `1px solid ${gmailConnected ? "rgba(56, 189, 248, 0.3)" : "rgba(148, 163, 184, 0.3)"}`,
                fontSize: 11,
                fontWeight: 600,
                color: gmailConnected ? "#38bdf8" : "#94a3b8",
              }}
            >
              <Mail size={12} />
              {gmailConnected ? "Gmail Live" : "Gmail Standby"}
            </div>

            {/* Context Action Button */}
            {activeTab === "observability" ? (
              <button
                onClick={onRunRcaDemo}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 0 14px rgba(6, 182, 212, 0.3)",
                }}
              >
                <Play size={14} /> Run RCA Demo
              </button>
            ) : (
              <button
                onClick={onLaunchReviewFlow}
                disabled={demoRunning}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 0 14px rgba(56, 189, 248, 0.3)",
                }}
              >
                <Play size={14} /> {demoRunning ? "Review Running..." : "Launch Review Flow"}
              </button>
            )}
          </div>
        </header>

        {/* Main View Port */}
        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
