import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: "#070b14", minHeight: "100vh", color: "#f8fafc", padding: 40, fontFamily: "sans-serif" }}>
          <div style={{ maxWidth: 700, margin: "40px auto", background: "#0d1527", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: 16, padding: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
            <h2 style={{ color: "#ef4444", margin: "0 0 12px" }}>Dashboard Runtime Recovery</h2>
            <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5 }}>
              A UI component encountered an issue:
            </p>
            <pre style={{ background: "#050811", color: "#fca5a5", padding: 14, borderRadius: 8, overflowX: "auto", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: 16, background: "#38bdf8", color: "#04131b", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
