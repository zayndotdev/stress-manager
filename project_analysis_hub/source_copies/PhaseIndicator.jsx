import React, { useRef, useEffect } from "react";

const PhaseIndicator = ({ phase }) => {
  const barRef = useRef(null);

  const config = {
    EXPLORE: { label: "Listening", icon: "👂", color: "var(--phase-explore)" },
    UNDERSTAND: { label: "Understanding", icon: "💭", color: "var(--phase-understand)" },
    SUGGEST: { label: "Helping", icon: "✨", color: "var(--phase-suggest)" },
  };

  const c = config[phase] || config.EXPLORE;
  const widths = { EXPLORE: "33%", UNDERSTAND: "66%", SUGGEST: "100%" };

  useEffect(() => {
    if (barRef.current) barRef.current.style.width = widths[phase] || "33%";
  }, [phase]);

  return (
    <div
      style={{
        position: "relative",
        padding: "8px 16px",
        borderBottom: "1px solid var(--border-default)",
        background: "var(--bg-surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      <span style={{ fontSize: 12 }}>{c.icon}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: c.color, letterSpacing: "0.04em" }}>
        {c.label}
      </span>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 2,
          background: "var(--border-default)",
        }}
      >
        <div
          ref={barRef}
          style={{
            height: "100%",
            background: c.color,
            borderRadius: 1,
            transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            width: "33%",
          }}
        />
      </div>
    </div>
  );
};

export default PhaseIndicator;
