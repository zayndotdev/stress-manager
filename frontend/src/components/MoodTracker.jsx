import React, { useState } from "react";
import { Smile, Meh, Frown, X, Check } from "lucide-react";
import { api } from "@/lib/api";

const MoodTracker = ({ conversationId, onClose }) => {
  const [rating, setRating] = useState(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("idle");

  const moods = [
    { value: 5, icon: <Smile size={28} />, label: "Bohat Acha", color: "var(--secondary)" },
    { value: 3, icon: <Meh size={28} />, label: "Theek", color: "var(--phase-explore)" },
    { value: 1, icon: <Frown size={28} />, label: "Pareshan", color: "var(--accent)" }
  ];

  const handleSave = async () => {
    if (!rating) return;
    setStatus("saving");
    try {
      await api.recordMood(conversationId, rating, note);
      setStatus("success");
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-overlay)"
    }}>
      <div className="animate-fade-in-up" style={{
        background: "var(--bg-surface)", width: 360, borderRadius: 24, border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-lg)", overflow: "hidden"
      }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Mood Check-in</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <p style={{ textAlign: "center", margin: "0 0 20px", color: "var(--text-secondary)", fontSize: 14 }}>
            Aaj aap kaisa mehsoos kar rahe hain?
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 24 }}>
            {moods.map((m) => (
              <button
                key={m.value}
                onClick={() => setRating(m.value)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  background: rating === m.value ? "var(--bg-active)" : "var(--bg-elevated)",
                  border: rating === m.value ? `2px solid ${m.color}` : "2px solid transparent",
                  color: rating === m.value ? m.color : "var(--text-muted)",
                  padding: "16px 12px", borderRadius: 16, cursor: "pointer", transition: "all 0.2s ease",
                  width: 80
                }}
              >
                {m.icon}
                <span style={{ fontSize: 12, fontWeight: 600 }}>{m.label}</span>
              </button>
            ))}
          </div>

          <textarea
            placeholder="Kuch aur batana chahenge? (Optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              width: "100%", height: 80, padding: 12, borderRadius: 12, border: "1px solid var(--border-default)",
              background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 14, resize: "none",
              marginBottom: 20
            }}
          />

          <button
            onClick={handleSave}
            disabled={!rating || status === "saving" || status === "success"}
            className="btn-primary"
            style={{
              width: "100%", padding: 14, borderRadius: 14, fontSize: 14, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: rating ? 1 : 0.5, cursor: rating ? "pointer" : "not-allowed"
            }}
          >
            {status === "idle" && "Save Mood"}
            {status === "saving" && "Saving..."}
            {status === "success" && <><Check size={16} /> Saved</>}
            {status === "error" && "Try Again"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
