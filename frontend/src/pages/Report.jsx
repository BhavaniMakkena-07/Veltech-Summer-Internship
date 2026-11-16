import { useParams, Link } from "react-router-dom";
import { reportUrl } from "../api/client";
import { FileText, Download, ChevronLeft, Shield } from "lucide-react";

export default function Report() {
  const { id } = useParams();
  const url    = reportUrl(id);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <Link to={`/dashboard/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#64748b", textDecoration: "none", fontSize: "13px", marginBottom: "40px" }}>
        <ChevronLeft size={14} /> Back to Dashboard
      </Link>

      <div style={{ padding: "48px", background: "#0d1424", border: "1px solid #1e3a5f", borderRadius: "20px" }}>
        <div style={{ width: "72px", height: "72px", background: "rgba(34,197,94,0.1)", borderRadius: "50%", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <FileText size={32} color="#22c55e" />
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9", marginBottom: "10px" }}>Security Assessment Report</h1>
        <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", marginBottom: "32px" }}>
          Your professional PDF security report is ready. It includes all findings, risk assessment, CWE/OWASP mappings, and remediation recommendations.
        </p>
        <a href={url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "14px 28px", background: "linear-gradient(135deg, #16a34a, #22c55e)",
            border: "none", borderRadius: "12px", color: "white",
            fontSize: "15px", fontWeight: 600, cursor: "pointer",
          }}>
            <Download size={18} /> Download PDF Report
          </button>
        </a>
        <p style={{ color: "#334155", fontSize: "12px", marginTop: "20px" }}>Scan #{id}</p>
      </div>
    </div>
  );
}