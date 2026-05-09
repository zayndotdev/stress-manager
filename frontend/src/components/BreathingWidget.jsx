import React, { useState, useEffect } from "react";
import gsap from "gsap";
import { Wind, X, Play, Square } from "lucide-react";

const BreathingWidget = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState("Ready"); // Ready, Inhale, Hold, Exhale
  const circleRef = React.useRef(null);
  const textRef = React.useRef(null);
  const timelineRef = React.useRef(null);

  useEffect(() => {
    if (isActive) {
      // 4-7-8 Breathing Technique
      const tl = gsap.timeline({ repeat: -1 });
      timelineRef.current = tl;

      // Inhale (4s)
      tl.call(() => setPhase("Inhale..."))
        .to(circleRef.current, { scale: 1.8, backgroundColor: "var(--primary)", duration: 4, ease: "power1.inOut" });

      // Hold (7s)
      tl.call(() => setPhase("Hold..."))
        .to(circleRef.current, { scale: 1.8, backgroundColor: "var(--secondary)", duration: 7, ease: "none" });

      // Exhale (8s)
      tl.call(() => setPhase("Exhale..."))
        .to(circleRef.current, { scale: 1, backgroundColor: "var(--primary-glow)", duration: 8, ease: "power1.inOut" });
        
    } else {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      setPhase("Ready");
      gsap.to(circleRef.current, { scale: 1, backgroundColor: "var(--primary-glow)", duration: 1, ease: "power2.out" });
    }

    return () => {
      if (timelineRef.current) timelineRef.current.kill();
    };
  }, [isActive]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 100,
        width: 300,
        background: "var(--bg-surface)",
        borderRadius: 20,
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-lg)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      className="animate-fade-in-up"
    >
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Wind size={16} style={{ color: "var(--secondary)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Breathing Exercise</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {/* Breathing Circle */}
        <div
          ref={circleRef}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "var(--primary-glow)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
        <span ref={textRef} style={{ position: "absolute", zIndex: 2, fontSize: 16, fontWeight: 700, color: "var(--text-primary)", pointerEvents: "none" }}>
          {phase}
        </span>
      </div>

      <div style={{ padding: 16, display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => setIsActive(!isActive)}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12,
            background: isActive ? "var(--bg-elevated)" : "linear-gradient(135deg, var(--bubble-user-from), var(--bubble-user-to))",
            color: isActive ? "var(--text-primary)" : "white",
            border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s"
          }}
        >
          {isActive ? <><Square size={14} /> Stop</> : <><Play size={14} /> Start</>}
        </button>
      </div>
    </div>
  );
};

export default BreathingWidget;
