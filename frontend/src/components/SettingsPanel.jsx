import React, { useState } from "react";
import { Settings, X, Moon, Sun, Monitor, Trash2, ShieldAlert } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const SettingsPanel = ({ onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearData = () => {
    if (confirmClear) {
      localStorage.removeItem("sakoon_session_id");
      localStorage.removeItem("sakoon_theme");
      sessionStorage.removeItem("sakoon_splash_done");
      window.location.reload();
    } else {
      setConfirmClear(true);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-overlay)"
    }}>
      <div className="animate-fade-in-up" style={{
        background: "var(--bg-surface)", width: 400, maxWidth: "90%", borderRadius: 24, border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-lg)", overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Settings size={18} style={{ color: "var(--primary)" }} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              Settings
            </h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Theme Settings */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Appearance</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => theme !== "light" && toggleTheme()}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 16, borderRadius: 16,
                  border: theme === "light" ? "2px solid var(--primary)" : "2px solid var(--border-default)",
                  background: theme === "light" ? "var(--primary-light)" : "var(--bg-elevated)",
                  color: theme === "light" ? "var(--primary)" : "var(--text-secondary)", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                <Sun size={24} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Light</span>
              </button>
              <button
                onClick={() => theme !== "dark" && toggleTheme()}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 16, borderRadius: 16,
                  border: theme === "dark" ? "2px solid var(--primary)" : "2px solid var(--border-default)",
                  background: theme === "dark" ? "var(--primary-light)" : "var(--bg-elevated)",
                  color: theme === "dark" ? "var(--primary)" : "var(--text-secondary)", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                <Moon size={24} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Dark</span>
              </button>
            </div>
          </div>

          {/* Privacy & Data */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Privacy & Data</p>
            <div style={{ padding: 16, borderRadius: 16, background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                <ShieldAlert size={20} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Clear all data</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    This will delete your session ID from this browser. You will lose access to all your past conversations. This action cannot be undone.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearData}
                style={{
                  width: "100%", padding: "10px 0", borderRadius: 10, border: "none",
                  background: confirmClear ? "var(--accent)" : "rgba(249, 112, 102, 0.1)",
                  color: confirmClear ? "white" : "var(--accent)", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                }}
              >
                <Trash2 size={16} />
                {confirmClear ? "Are you sure? Click to confirm" : "Clear Session Data"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
