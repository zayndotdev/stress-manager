import React, { useState, useRef } from "react";
import { Send } from "lucide-react";
import gsap from "gsap";

const InputBar = ({ onSend, disabled }) => {
  const [input, setInput] = useState("");
  const btnRef = useRef(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      if (btnRef.current) {
        gsap.fromTo(btnRef.current, { scale: 0.85 }, { scale: 1, duration: 0.25, ease: "back.out(2)" });
      }
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const active = input.trim().length > 0 && !disabled;

  return (
    <div
      style={{
        padding: "16px",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        background: "linear-gradient(to top, var(--bg-surface) 60%, transparent)",
      }}
    >
      <div 
        className="glass-panel"
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 10, 
          maxWidth: 800, 
          margin: "0 auto",
          padding: "8px",
          borderRadius: 100,
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <input
          id="message-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Apna message likhein..."
          autoComplete="off"
          style={{
            flex: 1,
            padding: "14px 20px",
            borderRadius: 100,
            border: "none",
            background: "transparent",
            color: "var(--text-primary)",
            fontSize: 15,
            fontFamily: "var(--font-sans)",
            outline: "none",
            opacity: disabled ? 0.5 : 1,
          }}
        />
        <button
          ref={btnRef}
          id="send-button"
          onClick={handleSend}
          disabled={!active}
          aria-label="Send message"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: active ? "pointer" : "default",
            transition: "all 0.2s ease",
            ...(active
              ? {
                  background: "var(--primary)",
                  color: "#FFFFFF",
                  boxShadow: "0 4px 12px var(--primary-glow)",
                }
              : {
                  background: "var(--bg-elevated)",
                  color: "var(--text-muted)",
                }),
          }}
          onMouseEnter={(e) => {
            if (active) e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            if (active) e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default InputBar;
