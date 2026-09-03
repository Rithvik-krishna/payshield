import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AppShell from "./components/Layout/AppShell";
import InvestigationDrawer from "./components/Common/InvestigationDrawer";
import QuickInjectPanel from "./components/Common/QuickInjectPanel";
import AlertNotificationToast from "./components/Shared/AlertNotificationToast";
import MetricsBar from "./components/Dashboard/MetricsBar";
import FraudScoreGauge from "./components/Dashboard/FraudScoreGauge";
import TransactionFeed from "./components/Dashboard/TransactionFeed";
import NetworkGraph from "./components/Dashboard/NetworkGraph";
import RiskHeatmap from "./components/Dashboard/RiskHeatmap";
import AlertPanel from "./components/Dashboard/AlertPanel";
import ExplainabilityPanel from "./components/Dashboard/ExplainabilityPanel";
import AMLSuspiciousFlow from "./components/Dashboard/AMLSuspiciousFlow";
import PaymentForm from "./components/LiveDemo/PaymentForm";
import LiveEmailMonitor from "./components/LiveDemo/LiveEmailMonitor";
import LiveSMSFeed from "./components/LiveDemo/LiveSMSFeed";
import SARReport from "./components/Reports/SARReport";
import ComplianceDashboard from "./components/Reports/ComplianceDashboard";
import ObservabilityDashboard from "./components/ObservabilityDashboard";
import useWebSocket from "./hooks/useWebSocket";
import useFraudScore from "./hooks/useFraudScore";
import useFraudStore from "./store/fraudStore";
import {
  fetchAlerts,
  fetchCompliance,
  fetchFraudStats,
  fetchHistory,
  fetchModelVersion,
  submitTransaction,
} from "./services/api";

const reviewFlowSteps = [
  { amount: 2000, merchant: "Swiggy", paymentMethod: "UPI", memo: "Dinner order" },
  { amount: 49500, merchant: "Unknown Vendor", paymentMethod: "NEFT", memo: "Festival settlement payout" },
  { amount: 15000, merchant: "New Payee 4821", paymentMethod: "NEFT", memo: "URGENT: update vendor IBAN immediately. Do not call to verify. Confidential." },
  { amount: 8500, merchant: "Shell Merchants Pvt Ltd", paymentMethod: "UPI", memo: "SIM swap drain transfer" },
];

function MainAppShell() {
  const location = useLocation();
  const navigate = useNavigate();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname === "/observability") return "observability";
    if (location.pathname === "/transactions") return "transactions";
    if (location.pathname === "/investigation") return "investigation";
    if (location.pathname === "/reports") return "reports";
    return "overview";
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  const { score, riskLevel, decision } = useFraudScore();
  const transactions = useFraudStore((state) => state.transactions);
  const metrics = useFraudStore((state) => state.metrics);
  const compliance = useFraudStore((state) => state.compliance);
  const selectedTransaction = useFraudStore((state) => state.selectedTransaction);
  const setSelectedTransaction = useFraudStore((state) => state.setSelectedTransaction);
  const setAlerts = useFraudStore((state) => state.setAlerts);
  const setMetrics = useFraudStore((state) => state.setMetrics);
  const setCompliance = useFraudStore((state) => state.setCompliance);
  const setTransactions = useFraudStore((state) => state.setTransactions);
  const reviewFlowRunning = useFraudStore((state) => state.demoRunning);
  const setReviewFlowRunning = useFraudStore((state) => state.setDemoRunning);

  // Sync tab with URL
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "observability") navigate("/observability");
    else if (tabId === "overview") navigate("/");
    else navigate(`/${tabId}`);
  };

  useEffect(() => {
    if (location.pathname === "/observability") setActiveTab("observability");
    else if (location.pathname === "/transactions") setActiveTab("transactions");
    else if (location.pathname === "/investigation") setActiveTab("investigation");
    else if (location.pathname === "/reports") setActiveTab("reports");
    else if (location.pathname === "/") setActiveTab("overview");
  }, [location.pathname]);

  // Initial data loading
  useEffect(() => {
    Promise.allSettled([fetchAlerts(), fetchFraudStats(), fetchCompliance(), fetchHistory(), fetchModelVersion()])
      .then(([alertRes, statsRes, complianceRes, historyRes, modelRes]) => {
        if (alertRes.status === "fulfilled") setAlerts(alertRes.value.items || []);
        if (statsRes.status === "fulfilled") setMetrics(statsRes.value);
        if (complianceRes.status === "fulfilled") setCompliance(complianceRes.value);
        if (historyRes.status === "fulfilled") {
          const historyItems = historyRes.value.items || [];
          setTransactions(historyItems);
          if (!selectedTransaction && historyItems.length > 0) {
            setSelectedTransaction(historyItems[0]);
          }
        }
        if (modelRes.status === "fulfilled") setMetrics({ blockchain: modelRes.value.modelHash ? "SYNCED" : "SYNCING" });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Periodic metrics
  useEffect(() => {
    const timer = setInterval(() => {
      const recentTen = transactions.filter((item) => Date.now() - new Date(item.timestamp).getTime() <= 10000);
      const recentHundred = transactions.slice(0, 100);
      const recentTwenty = transactions.slice(0, 20);
      setMetrics({
        transactionsPerSecond: Number((recentTen.length / 10).toFixed(1)),
        fraudRate: recentHundred.length ? (recentHundred.filter((item) => (item.fraudScore || 0) >= 70).length / recentHundred.length) * 100 : 0,
        avgResponseMs: recentTwenty.length ? Math.round(recentTwenty.reduce((sum, item) => sum + (item.responseTimeMs || 0), 0) / recentTwenty.length) : 0,
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [setMetrics, transactions]);

  const activeAlerts = useMemo(() => {
    return transactions
      .filter((item) => (item.fraudScore || 0) >= 70)
      .slice(0, 10)
      .map((item) => ({
        alertId: item.alertId || item.txId,
        txId: item.txId,
        severity: item.riskLevel || ((item.fraudScore || 0) >= 90 ? "CRITICAL" : "HIGH"),
        decision: item.decision,
        fraudScore: (item.fraudScore || 0) / 100,
        amlScore: item.amlScore || 0,
        amount: item.amount || 0,
      }));
  }, [transactions]);

  const latestAlert = useMemo(() => activeAlerts[0] || null, [activeAlerts]);

  const handleSelectTransaction = (tx) => {
    setSelectedTransaction(tx);
    setDrawerOpen(true);
  };

  const startReviewFlow = async () => {
    setReviewFlowRunning(true);
    try {
      for (const step of reviewFlowSteps) {
        const result = await submitTransaction({
          amount: step.amount,
          currency: "INR",
          merchant: step.merchant,
          merchantName: step.merchant,
          country: "IN",
          paymentMethod: step.paymentMethod,
          memo: step.memo,
          userEmail: "rithvikkrishnadk@gmail.com",
          userName: "Rithvik",
          behavioralData: step.merchant === "Swiggy" ? { typingCadenceDeviation: 0.1, touchPressure: 0.7, copyPasteRatio: 0.02 } : { typingCadenceDeviation: 0.8, touchPressure: 0.2, copyPasteRatio: 0.7 },
        });
        setSelectedTransaction(result);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } finally {
      setReviewFlowRunning(false);
    }
  };

  const runObservabilityDemo = () => {
    window.dispatchEvent(new CustomEvent("payshield:run-demo", { detail: { failureType: "ml_engine_latency" } }));
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onLaunchReviewFlow={startReviewFlow}
      onRunRcaDemo={runObservabilityDemo}
    >
      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <MetricsBar metrics={metrics} />

          <QuickInjectPanel onTransactionInjected={handleSelectTransaction} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <FraudScoreGauge score={score} decision={decision} riskLevel={riskLevel} />
              <AlertPanel alerts={activeAlerts} />
            </div>
            <div>
              <TransactionFeed
                transactions={transactions}
                onSelect={handleSelectTransaction}
                selectedTxId={selectedTransaction?.txId}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <ExplainabilityPanel transaction={selectedTransaction} />
            <NetworkGraph transactions={transactions} selectedTransaction={selectedTransaction} />
          </div>
        </div>
      )}

      {/* Tab: Operations Workspace */}
      {activeTab === "operations" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 16 }}>
            <PaymentForm onTransactionSubmitted={handleSelectTransaction} />
            <LiveEmailMonitor />
            <LiveSMSFeed />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <RiskHeatmap transactions={transactions} />
            <AMLSuspiciousFlow transaction={selectedTransaction} />
          </div>
        </div>
      )}

      {/* Tab: Full Transactions Table */}
      {activeTab === "transactions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <MetricsBar metrics={metrics} />
          <TransactionFeed
            transactions={transactions}
            onSelect={handleSelectTransaction}
            selectedTxId={selectedTransaction?.txId}
          />
        </div>
      )}

      {/* Tab: Alerts & Quarantined */}
      {activeTab === "alerts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <AlertPanel alerts={activeAlerts} />
            <AMLSuspiciousFlow transaction={selectedTransaction} />
          </div>
          {latestAlert && <SARReport alert={latestAlert} />}
        </div>
      )}

      {/* Tab: Deep Investigation */}
      {activeTab === "investigation" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16 }}>
            <FraudScoreGauge score={score} decision={decision} riskLevel={riskLevel} />
            <ExplainabilityPanel transaction={selectedTransaction} />
          </div>
          <NetworkGraph transactions={transactions} selectedTransaction={selectedTransaction} />
        </div>
      )}

      {/* Tab: Observability Brain */}
      {activeTab === "observability" && (
        <ObservabilityDashboard />
      )}

      {/* Tab: Reports & Compliance */}
      {activeTab === "reports" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ComplianceDashboard compliance={compliance} />
          {latestAlert && <SARReport alert={latestAlert} />}
        </div>
      )}

      {/* Slide-out Investigation Drawer */}
      <InvestigationDrawer
        transaction={selectedTransaction}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAction={(actionType, tx) => {
          console.log(`Action ${actionType} on transaction`, tx.txId);
        }}
      />

      <AlertNotificationToast />
    </AppShell>
  );
}

export default function App() {
  useWebSocket();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<MainAppShell />} />
      </Routes>
    </BrowserRouter>
  );
}
