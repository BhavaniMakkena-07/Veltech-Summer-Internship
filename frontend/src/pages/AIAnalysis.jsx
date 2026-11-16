import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { analyzeAI } from "../api/client";
import { Brain, ChevronLeft, AlertCircle, CheckCircle, Code, Lightbulb, Target, RefreshCw, Clock } from "lucide-react";

export default function AIAnalysis() {
  const { id }  = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    setAnalysis(null);
    analyzeAI(id)
      .then(r => {
        const data = r.data;
        if (Array.isArray(data.analysis)) {
          const allFailed = data.analysis.every(item =>
            item.analysis?.plain_english_explanation?.includes("temporarily unavailable") ||
            item.analysis?.plain_english_explanation?.includes("quota") ||
            item.analysis?.plain_english_explanation?.includes("exhausted") ||
            item.analysis?.plain_english_explanation?.includes("429")
          );
          if (allFailed) {
            setError("quota exceeded");
          } else {
            setAnalysis(data.analysis);
          }
        } else if (data.analysis?.summary) {
          setAnalysis([{ analysis: { plain_english_explanation: data.analysis.summary }, finding: {} }]);
        } else {
          setError("Unexpected response format from AI.");
        }
      })
      .catch(err => {
        const msg = err.response?.data?.detail || err.message || "AI analysis failed.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const isQuotaError = error.includes("quota") || error.includes("429") ||
                       error.includes("exhausted") || error.includes("RESOURCE_EXHAUSTED");

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>

      {/* Header */}
      <Link to={`/dashboard/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#64748b", textDecoration: "none", fontSize: "13px", marginBottom: "20px" }}>
        <ChevronLeft size={14} /> Back to Dashboard
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <div style={{ padding: "10px", background: "rgba(168,85,247,0.1)", borderRadius: "12px", border: "1px solid rgba(168,85,247,0.3)" }}>
          <Brain size={24} color="#a855f7" />
        </div>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#f1f5f9" }}>AI Security Analysis</h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Powered by Google Gemini</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", gap: "20px" }}>
          <div style={{ position: "relative", width: "64px", height: "64px" }}>
            <div style={{ position: "absolute", inset: 0, border: "3px solid rgba(168,85,247,0.15)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", inset: 0, border: "3px solid transparent", borderTopColor: "#a855f7", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
            <Brain size={24} color="#a855f7" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#c4b5fd", fontSize: "15px", fontWeight: 500, marginBottom: "6px" }}>Gemini is analyzing your findings...</p>
            <p style={{ color: "#475569", fontSize: "13px" }}>This may take 15–30 seconds</p>
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ background: "#0d1424", border: "1px solid #1e3a5f", borderRadius: "16px", padding: "48px 40px", textAlign: "center" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%", display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
            background: isQuotaError ? "rgba(234,179,8,0.1)"  : "rgba(239,68,68,0.1)",
            border:     isQuotaError ? "1px solid rgba(234,179,8,0.3)" : "1px solid rgba(239,68,68,0.3)",
          }}>
            {isQuotaError
              ? <Clock size={28} color="#eab308" />
              : <AlertCircle size={28} color="#ef4444" />}
          </div>

          <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#f1f5f9", marginBottom: "12px" }}>
            {isQuotaError ? "API Quota Limit Reached" : "AI Analysis Failed"}
          </h3>

          {isQuotaError ? (
            <>
              <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.75", maxWidth: "420px", margin: "0 auto 24px" }}>
                The Gemini API free tier daily quota has been reached across all available models.
                This resets automatically every 24 hours. Your scan data — findings, score, and
                PDF report — are all fully available in the meantime.
              </p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 18px", background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)", borderRadius: "8px", marginBottom: "28px" }}>
                <Clock size={13} color="#eab308" />
                <span style={{ fontSize: "12px", color: "#eab308" }}>Quota resets in ~24 hours — try again tomorrow</span>
              </div>
            </>
          ) : (
            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.75", maxWidth: "420px", margin: "0 auto 28px" }}>
              {error}
            </p>
          )}

          <button onClick={load} style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "10px 22px", background: "rgba(6,182,212,0.1)",
            border: "1px solid rgba(6,182,212,0.3)", borderRadius: "8px",
            color: "#06b6d4", fontSize: "14px", cursor: "pointer",
          }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {analysis.map((item, i) => {
            const a = item.analysis || {};
            const f = item.finding  || {};
            return (
              <div key={i} style={{ background: "#0d1424", border: "1px solid #1e3a5f", borderRadius: "16px", overflow: "hidden" }}>

                {/* Card Header */}
                <div style={{ padding: "16px 20px", background: "rgba(168,85,247,0.06)", borderBottom: "1px solid #1e3a5f", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <Brain size={15} color="#a855f7" />
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9", flex: 1 }}>
                    {a.vulnerability_name || f.rule_id || `Finding ${i + 1}`}
                  </span>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {a.cwe_id          && <Badge text={a.cwe_id}                            color="#3b82f6" />}
                    {a.owasp_category  && <Badge text={a.owasp_category.split(" — ")[0]}    color="#f97316" />}
                    {a.estimated_fix_time && <Badge text={`Fix: ${a.estimated_fix_time}`}   color="#22c55e" />}
                  </div>
                </div>

                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

                  {a.plain_english_explanation && (
                    <Section icon={<Lightbulb size={14} color="#eab308" />} title="What this means" color="#eab308">
                      <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.75" }}>
                        {a.plain_english_explanation}
                      </p>
                    </Section>
                  )}

                  {a.root_cause && (
                    <Section icon={<AlertCircle size={14} color="#f97316" />} title="Root cause" color="#f97316">
                      <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.75" }}>
                        {a.root_cause}
                      </p>
                    </Section>
                  )}

                  {a.business_impact && (
                    <Section icon={<Target size={14} color="#ef4444" />} title="Business impact" color="#ef4444">
                      <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.75" }}>
                        {a.business_impact}
                      </p>
                    </Section>
                  )}

                  {Array.isArray(a.remediation_steps) && a.remediation_steps.length > 0 && (
                    <Section icon={<CheckCircle size={14} color="#22c55e" />} title="Remediation steps" color="#22c55e">
                      <ol style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px", margin: 0 }}>
                        {a.remediation_steps.map((step, j) => (
                          <li key={j} style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.65" }}>{step}</li>
                        ))}
                      </ol>
                    </Section>
                  )}

                  {Array.isArray(a.best_practices) && a.best_practices.length > 0 && (
                    <Section icon={<CheckCircle size={14} color="#06b6d4" />} title="Best practices" color="#06b6d4">
                      <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px", margin: 0 }}>
                        {a.best_practices.map((p, j) => (
                          <li key={j} style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.65" }}>{p}</li>
                        ))}
                      </ul>
                    </Section>
                  )}

                  {a.secure_code_example && (
                    <Section icon={<Code size={14} color="#a855f7" />} title="Secure code example" color="#a855f7">
                      <pre style={{ background: "#060d1a", border: "1px solid #1e3a5f", borderRadius: "10px", padding: "16px", fontSize: "12px", color: "#7dd3fc", overflowX: "auto", lineHeight: "1.7", margin: 0 }}>
                        {a.secure_code_example}
                      </pre>
                    </Section>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Badge({ text, color }) {
  return (
    <span style={{ padding: "3px 10px", background: `${color}18`, border: `1px solid ${color}40`, borderRadius: "20px", fontSize: "11px", fontWeight: 600, color, whiteSpace: "nowrap" }}>
      {text}
    </span>
  );
}

function Section({ icon, title, color, children }) {
  return (
    <div style={{ borderLeft: `3px solid ${color}50`, paddingLeft: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px" }}>
        {icon}
        <span style={{ fontSize: "11px", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.7px" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}