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
        padding: "12px 16px",
        borderTop: "1px solid var(--border-default)",
        background: "var(--bg-surface)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 800, margin: "0 auto" }}>
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
            padding: "12px 16px",
            borderRadius: 14,
            border: "1px solid var(--border-default)",
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            fontSize: 14,
            fontFamily: "var(--font-sans)",
            outline: "none",
            transition: "all 0.2s ease",
            opacity: disabled ? 0.5 : 1,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--border-focus)";
            e.target.style.boxShadow = "0 0 0 3px var(--primary-light)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border-default)";
            e.target.style.boxShadow = "none";
          }}
        />
        <button
          ref={btnRef}
          id="send-button"
          onClick={handleSend}
          disabled={!active}
          aria-label="Send message"
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: active ? "pointer" : "default",
            transition: "all 0.2s ease",
            ...(active
              ? {
                  background: "linear-gradient(135deg, var(--bubble-user-from), var(--bubble-user-to))",
                  color: "#FFFFFF",
                  boxShadow: "0 2px 12px var(--primary-glow)",
                }
              : {
                  background: "var(--bg-elevated)",
                  color: "var(--text-muted)",
                }),
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default InputBar;
