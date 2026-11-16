import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHistory } from "../api/client";
import { Clock, Shield, ChevronRight, AlertTriangle } from "lucide-react";

const RISK_COLOR = {
  "Secure":        "#22c55e",
  "Low Risk":      "#86efac",
  "Moderate Risk": "#eab308",
  "High Risk":     "#f97316",
  "Critical Risk": "#ef4444",
};

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory().then(r => setHistory(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <Clock size={22} color="#06b6d4" />
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#f1f5f9" }}>Scan History</h1>
        <span style={{ marginLeft: "auto", padding: "4px 12px", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: "20px", fontSize: "12px", color: "#06b6d4" }}>
          {history.length} scans
        </span>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px", color: "#64748b" }}>
          <div style={{ width: "28px", height: "28px", border: "2px solid #1e3a5f", borderTop: "2px solid #06b6d4", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#64748b" }}>
          <Shield size={48} style={{ marginBottom: "12px", opacity: 0.3 }} />
          <p style={{ fontSize: "16px" }}>No scans yet</p>
          <Link to="/" style={{ color: "#06b6d4", textDecoration: "none", fontSize: "14px" }}>Run your first scan →</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {history.map(scan => {
            const riskColor = RISK_COLOR[scan.risk_level] || "#64748b";
            return (
              <Link key={scan.id} to={`/dashboard/${scan.id}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "#0d1424", border: "1px solid #1e3a5f", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", transition: "border-color 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#334155"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1e3a5f"}>

                  {/* Score circle */}
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: `2px solid ${riskColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: riskColor }}>{Math.round(scan.security_score)}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "14px", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{scan.filename}</p>
                    <p style={{ color: "#475569", fontSize: "12px" }}>
                      {scan.language} · {new Date(scan.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertTriangle size={13} color="#ef4444" />
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>{scan.total_findings} findings</span>
                  </div>

                  <span style={{ padding: "4px 12px", background: `${riskColor}15`, border: `1px solid ${riskColor}40`, borderRadius: "20px", fontSize: "11px", fontWeight: 600, color: riskColor }}>
                    {scan.risk_level}
                  </span>

                  <ChevronRight size={16} color="#334155" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}