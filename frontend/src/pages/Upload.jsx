import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { scanFile } from "../api/client";
import { Shield, Upload as UploadIcon, FileCode, AlertCircle, CheckCircle } from "lucide-react";

const SUPPORTED = [".py", ".js", ".ts", ".java", ".go", ".php", ".c", ".cpp", ".rb", ".rs"];

export default function Upload() {
  const [file,    setFile]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [drag,    setDrag]    = useState(false);
  const inputRef  = useRef();
  const navigate  = useNavigate();

  const handleFile = (f) => {
    setError("");
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleScan = async () => {
    if (!file) { setError("Please select a file first."); return; }
    setLoading(true);
    setError("");
    try {
      const { data } = await scanFile(file);
      navigate(`/dashboard/${data.scan_id}`, { state: { scan: data } });
    } catch (err) {
      setError(err.response?.data?.detail || "Scan failed. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: "600px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "72px", height: "72px", background: "rgba(6,182,212,0.1)", borderRadius: "50%", border: "1px solid rgba(6,182,212,0.3)", marginBottom: "20px" }}>
            <Shield size={36} color="#06b6d4" />
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#f1f5f9", marginBottom: "10px" }}>
            SecureVision
          </h1>
          <p style={{ color: "#64748b", fontSize: "16px" }}>
            AI-Powered Static Application Security Testing
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${drag ? "#06b6d4" : file ? "#22c55e" : "#1e3a5f"}`,
            borderRadius: "16px",
            padding: "48px 32px",
            textAlign: "center",
            cursor: "pointer",
            background: drag ? "rgba(6,182,212,0.05)" : file ? "rgba(34,197,94,0.05)" : "rgba(14,28,54,0.5)",
            transition: "all 0.2s",
            marginBottom: "24px",
          }}>
          <input
            ref={inputRef}
            type="file"
            style={{ display: "none" }}
            accept={SUPPORTED.join(",")}
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {file ? (
            <>
              <CheckCircle size={40} color="#22c55e" style={{ marginBottom: "12px" }} />
              <p style={{ color: "#22c55e", fontWeight: 600, fontSize: "16px", marginBottom: "4px" }}>{file.name}</p>
              <p style={{ color: "#64748b", fontSize: "13px" }}>{(file.size / 1024).toFixed(1)} KB — click to change</p>
            </>
          ) : (
            <>
              <UploadIcon size={40} color="#1e3a5f" style={{ marginBottom: "12px" }} />
              <p style={{ color: "#94a3b8", fontWeight: 500, fontSize: "16px", marginBottom: "4px" }}>
                Drop your source file here
              </p>
              <p style={{ color: "#475569", fontSize: "13px" }}>or click to browse</p>
            </>
          )}
        </div>

        {/* Supported Languages */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "24px" }}>
          {["Python", "JavaScript", "TypeScript", "Java", "Go", "PHP", "C/C++", "Ruby", "Rust"].map(lang => (
            <span key={lang} style={{ padding: "4px 12px", background: "rgba(30,58,95,0.5)", border: "1px solid #1e3a5f", borderRadius: "20px", fontSize: "12px", color: "#64748b" }}>
              {lang}
            </span>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", marginBottom: "20px", color: "#fca5a5" }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: "14px" }}>{error}</span>
          </div>
        )}

        {/* Scan Button */}
        <button
          onClick={handleScan}
          disabled={loading || !file}
          style={{
            width: "100%", padding: "16px", borderRadius: "12px", border: "none",
            background: loading || !file ? "#1e3a5f" : "linear-gradient(135deg, #0891b2, #06b6d4)",
            color: loading || !file ? "#475569" : "white",
            fontSize: "16px", fontWeight: 600, cursor: loading || !file ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            transition: "all 0.2s",
          }}>
          {loading ? (
            <>
              <div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Scanning with Semgrep...
            </>
          ) : (
            <><FileCode size={18} /> Run Security Scan</>
          )}
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}