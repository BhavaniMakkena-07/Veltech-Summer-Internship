import { Link, useLocation } from "react-router-dom";
import { Shield, Upload, History, LayoutDashboard } from "lucide-react";

const links = [
  { to: "/",        label: "Scan",      icon: Upload },
  { to: "/history", label: "History",   icon: History },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav style={{
      background: "#0d1424",
      borderBottom: "1px solid #1e3a5f",
      padding: "0 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "64px",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
        <Shield size={26} color="#06b6d4" />
        <span style={{ fontSize: "18px", fontWeight: 700, color: "#06b6d4", letterSpacing: "1px" }}>
          SecureVision
        </span>
      </Link>

      <div style={{ display: "flex", gap: "8px" }}>
        {links.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link key={to} to={to} style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "8px 16px", borderRadius: "8px", textDecoration: "none",
              fontSize: "14px", fontWeight: 500,
              color:      active ? "#06b6d4" : "#94a3b8",
              background: active ? "rgba(6,182,212,0.1)" : "transparent",
              border:     active ? "1px solid rgba(6,182,212,0.3)" : "1px solid transparent",
              transition: "all 0.2s",
            }}>
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}