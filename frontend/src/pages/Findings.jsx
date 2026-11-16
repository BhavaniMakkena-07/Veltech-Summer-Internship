import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getScan } from "../api/client";
import { AlertTriangle, Shield, ChevronLeft, FileCode, Hash } from "lucide-react";

const SEV_STYLE = {
  CRITICAL: { bg: "rgba(239,68,68,0.1)",  border: "#ef4444", color: "#fca5a5" },
  HIGH:     { bg: "rgba(249,115,22,0.1)", border: "#f97316", color: "#fdba74" },
  MEDIUM:   { bg: "rgba(234,179,8,0.1)",  border: "#eab308", color: "#fde047" },
  LOW:      { bg: "rgba(34,197,94,0.1)",  border: "#22c55e", color: "#86efac" },
  INFO:     { bg: "rgba(59,130,246,0.1)", border: "#3b82f6", color: "#93c5fd" },
};

export default function Findings() {
  const { id }  = useParams();
  const [scan, setScan]       = useState(null);
  const [filter, setFilter]   = useState("ALL");

  useEffect(() => { getScan(id).then(r => setScan(r.data)); }, []);

  if (!scan) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", gap: "12px", color: "#64748b" }}>
      <div style={{ width: "24px", height: "24px", border: "2px solid #1e3a5f", borderTop: "2px solid #06b6d4", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading findings...
    </div>
  );

  const filtered = filter === "ALL" ? scan.findings : scan.findings.filter(f => f.severity === filter);

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>

      <Link to={`/dashboard/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#64748b", textDecoration: "none", fontSize: "13px", marginBottom: "20px" }}>
        <ChevronLeft size={14} /> Back to Dashboard
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#f1f5f9", marginBottom: "4px" }}>Vulnerability Findings</h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>{scan.filename} — {scan.findings.length} total findings</p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(f => {
            const style = SEV_STYLE[f] || {};
            const active = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "6px 14px", borderRadius: "20px", border: `1px solid ${active ? (style.border || "#06b6d4") : "#1e3a5f"}`,
                background: active ? (style.bg || "rgba(6,182,212,0.1)") : "transparent",
                color: active ? (style.color || "#06b6d4") : "#64748b",
                fontSize: "12px", fontWeight: 500, cursor: "pointer",
              }}>
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#22c55e" }}>
          <Shield size={48} style={{ marginBottom: "12px" }} />
          <p style={{ fontSize: "16px", fontWeight: 500 }}>No findings for this filter</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filtered.map((item, i) => {
            const sev   = item.severity || "INFO";
            const style = SEV_STYLE[sev] || SEV_STYLE.INFO;
            return (
              <div key={i} style={{ background: "#0d1424", border: `1px solid #1e3a5f`, borderLeft: `4px solid ${style.border}`, borderRadius: "12px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <AlertTriangle size={16} color={style.border} />
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "#f1f5f9" }}>{item.rule_id || "Unknown Rule"}</span>
                  </div>
                  <span style={{ padding: "3px 12px", background: style.bg, border: `1px solid ${style.border}40`, borderRadius: "20px", fontSize: "11px", fontWeight: 700, color: style.color, letterSpacing: "0.5px" }}>
                    {sev}
                  </span>
                </div>

                <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" }}>{item.message}</p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                  {[
                    { icon: FileCode, label: "File", value: item.file || item.path },
                    { icon: Hash,     label: "Line", value: item.line_start || item.line },
                    item.cwe_display && { icon: Shield, label: "CWE",   value: item.cwe_display },
                    item.owasp_display && { icon: Shield, label: "OWASP", value: item.owasp_display },
                  ].filter(Boolean).map(({ icon: Icon, label, value }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "rgba(30,58,95,0.3)", borderRadius: "8px" }}>
                      <Icon size={13} color="#475569" />
                      <span style={{ fontSize: "11px", color: "#475569", minWidth: "36px" }}>{label}</span>
                      <span style={{ fontSize: "12px", color: "#94a3b8", wordBreak: "break-all" }}>{value || "—"}</span>
                    </div>
                  ))}
                </div>

                {item.code_snippet && (
                  <pre style={{ marginTop: "14px", padding: "12px", background: "#060d1a", borderRadius: "8px", fontSize: "12px", color: "#7dd3fc", overflowX: "auto", border: "1px solid #1e3a5f", lineHeight: "1.6" }}>
                    {item.code_snippet}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}