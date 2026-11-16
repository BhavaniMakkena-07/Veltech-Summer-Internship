import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getScan } from "../api/client";
import { Shield, Bug, AlertTriangle, Info, ChevronRight, FileText, Brain, Clock } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";

const SEV_COLORS = { CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#eab308", LOW: "#22c55e", INFO: "#3b82f6" };

function ScoreRing({ score, label }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : score >= 40 ? "#f97316" : "#ef4444";
  const r = 54, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div style={{ textAlign: "center" }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1e3a5f" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{ marginTop: "-110px", marginBottom: "70px" }}>
        <div style={{ fontSize: "32px", fontWeight: 700, color }}>{score}</div>
        <div style={{ fontSize: "12px", color: "#64748b" }}>/ 100</div>
      </div>
      <div style={{ fontSize: "13px", fontWeight: 600, color, background: `${color}20`, padding: "4px 14px", borderRadius: "20px", display: "inline-block" }}>
        {label}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state } = useLocation();
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [scan, setScan] = useState(state?.scan || null);

  useEffect(() => {
    if (!scan) getScan(id).then(r => setScan(r.data)).catch(() => navigate("/"));
  }, []);

  if (!scan) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
      <div style={{ width: "36px", height: "36px", border: "3px solid #1e3a5f", borderTop: "3px solid #06b6d4", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const breakdown = scan.score?.breakdown || {};
  const pieData   = Object.entries(SEV_COLORS)
    .map(([sev, color]) => ({ name: sev, value: breakdown[sev] || 0, color }))
    .filter(d => d.value > 0);

  const cards = [
    { label: "Total Findings", value: scan.findings?.length ?? 0,    color: "#06b6d4", icon: Bug },
    { label: "Critical",       value: breakdown.CRITICAL ?? 0,        color: "#ef4444", icon: AlertTriangle },
    { label: "High",           value: breakdown.HIGH ?? 0,            color: "#f97316", icon: AlertTriangle },
    { label: "Medium",         value: breakdown.MEDIUM ?? 0,          color: "#eab308", icon: Info },
    { label: "Low",            value: breakdown.LOW ?? 0,             color: "#22c55e", icon: Info },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "13px", marginBottom: "8px" }}>
          <Shield size={14} color="#06b6d4" />
          <span>Scan #{scan.scan_id || id}</span>
          <ChevronRight size={12} />
          <span style={{ color: "#06b6d4" }}>{scan.filename}</span>
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#f1f5f9" }}>Security Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {cards.map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ background: "#0d1424", border: "1px solid #1e3a5f", borderRadius: "14px", padding: "20px", borderTop: `3px solid ${color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
              <Icon size={16} color={color} />
            </div>
            <div style={{ fontSize: "32px", fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Score + Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "20px", marginBottom: "28px" }}>

        {/* Score Ring */}
        <div style={{ background: "#0d1424", border: "1px solid #1e3a5f", borderRadius: "14px", padding: "28px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>Security Score</p>
          <ScoreRing score={scan.score?.score ?? 0} label={scan.score?.label ?? "Unknown"} />
        </div>

        {/* Pie Chart */}
        <div style={{ background: "#0d1424", border: "1px solid #1e3a5f", borderRadius: "14px", padding: "24px" }}>
          <p style={{ fontSize: "13px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>Severity Distribution</p>
          {pieData.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "180px", color: "#22c55e", fontSize: "15px", gap: "8px" }}>
              <Shield size={20} /> No vulnerabilities found
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0d1424", border: "1px solid #1e3a5f", borderRadius: "8px", color: "#f1f5f9" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: d.color }} />
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>{d.name}</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: d.color, marginLeft: "auto", paddingLeft: "16px" }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ background: "#0d1424", border: "1px solid #1e3a5f", borderRadius: "14px", padding: "24px" }}>
        <p style={{ fontSize: "13px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "20px" }}>Actions</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {[
            { to: `/findings/${scan.scan_id || id}`, label: "View Findings", icon: Bug,       color: "#06b6d4" },
            { to: `/analysis/${scan.scan_id || id}`, label: "AI Analysis",   icon: Brain,     color: "#a855f7" },
            { to: `/report/${scan.scan_id || id}`,   label: "Download PDF",  icon: FileText,  color: "#22c55e" },
            { to: "/history",                         label: "Scan History",  icon: Clock,     color: "#f97316" },
          ].map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to} style={{ textDecoration: "none" }}>
              <button style={{
                display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px",
                background: `${color}15`, border: `1px solid ${color}40`, borderRadius: "10px",
                color, fontSize: "14px", fontWeight: 500, cursor: "pointer",
              }}>
                <Icon size={16} />{label}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}