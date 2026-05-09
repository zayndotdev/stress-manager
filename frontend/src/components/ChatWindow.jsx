import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";
import PhaseIndicator from "./PhaseIndicator";
import { useTheme } from "@/context/ThemeContext";
import { Menu, ArrowDown, Sparkles, Sun, Moon } from "lucide-react";
import gsap from "gsap";

const QUICK_PROMPTS = [
  "Assalam o Alaikum 👋",
  "Mujhe stress ho raha hai",
  "Kisi se baat karni hai",
  "Neend nahi aa rahi",
  "Aaj ka din mushkil tha",
];

const ChatWindow = ({
  messages,
  isLoading,
  currentPhase,
  onSendMessage,
  onToggleSidebar,
  activeConversationId,
}) => {
  const scrollRef = useRef(null);
  const welcomeRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    setPrevCount(messages.length);
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length === 0 && welcomeRef.current) {
      const els = welcomeRef.current.querySelectorAll("[data-animate]");
      gsap.fromTo(
        els,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: "power2.out", delay: 0.15 }
      );
    }
  }, [messages.length, activeConversationId]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 80);
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid var(--border-default)",
          background: "var(--bg-surface)",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            id="sidebar-toggle"
            onClick={onToggleSidebar}
            className="lg:hidden"
            style={{
              background: "none", border: "none", color: "var(--text-secondary)",
              cursor: "pointer", padding: 6, borderRadius: 8, display: "flex",
            }}
          >
            <Menu size={20} />
          </button>

          <div
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, var(--bubble-user-from), var(--bubble-user-to))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 10px var(--primary-glow)",
            }}
          >
            <span style={{ color: "white", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18 }}>
              S
            </span>
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              Sakoon
            </h1>
            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>
              Stress support companion
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Phase Badge */}
          <PhaseBadge phase={currentPhase} />
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light" : "Switch to dark"}
            style={{
              width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border-default)",
              background: "var(--bg-elevated)", color: "var(--text-secondary)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <PhaseIndicator phase={currentPhase} />

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          position: "relative",
          zIndex: 5,
        }}
      >
        {messages.length === 0 ? (
          <div
            ref={welcomeRef}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", textAlign: "center",
              padding: "0 24px",
            }}
          >
            <div
              data-animate
              className="animate-float"
              style={{
                width: 72, height: 72, borderRadius: 20,
                background: "linear-gradient(135deg, var(--bubble-user-from), var(--bubble-user-to))",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 24, boxShadow: "0 8px 32px var(--primary-glow)",
              }}
            >
              <Sparkles size={32} color="white" />
            </div>
            <h2
              data-animate
              style={{
                fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800,
                color: "var(--text-primary)", margin: "0 0 8px",
              }}
            >
              Sakoon mein khush amdeed
            </h2>
            <p
              data-animate
              style={{
                fontSize: 14, color: "var(--text-secondary)", margin: "0 0 28px",
                maxWidth: 360, lineHeight: 1.6,
              }}
            >
              Main yahan aapki sun-ne ke liye hoon. Koi bhi baat share karein — sab kuch private hai.
            </p>
            <div data-animate style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, maxWidth: 420 }}>
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => onSendMessage(p)}
                  style={{
                    padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 500,
                    fontFamily: "var(--font-sans)", cursor: "pointer",
                    background: "var(--bg-elevated)", color: "var(--text-secondary)",
                    border: "1px solid var(--border-default)", transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-focus)";
                    e.currentTarget.style.color = "var(--primary)";
                    e.currentTarget.style.background = "var(--primary-light)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-default)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.background = "var(--bg-elevated)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              text={msg.content}
              sender={msg.role}
              timestamp={msg.timestamp}
              isNew={idx >= prevCount}
            />
          ))
        )}

        {isLoading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }} className="animate-fade-in-up">
            <div
              style={{
                padding: "14px 20px", borderRadius: "18px 18px 18px 4px",
                background: "var(--bubble-bot-bg)", border: "1px solid var(--bubble-bot-border)",
              }}
            >
              <div style={{ display: "flex", gap: 4 }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll to bottom */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="animate-fade-in-up"
          style={{
            position: "absolute", bottom: 80, right: 20, zIndex: 20,
            width: 36, height: 36, borderRadius: 10,
            background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
            color: "var(--text-secondary)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "var(--shadow-md)", transition: "all 0.2s ease",
          }}
        >
          <ArrowDown size={16} />
        </button>
      )}

      <InputBar onSend={onSendMessage} disabled={isLoading} />
    </div>
  );
};

const PhaseBadge = ({ phase }) => {
  const map = {
    EXPLORE: { label: "Explore", color: "var(--phase-explore)" },
    UNDERSTAND: { label: "Understand", color: "var(--phase-understand)" },
    SUGGEST: { label: "Suggest", color: "var(--phase-suggest)" },
  };
  const c = map[phase] || map.EXPLORE;
  return (
    <span
      style={{
        padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600,
        color: c.color, background: `color-mix(in srgb, ${c.color} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${c.color} 20%, transparent)`,
        transition: "all 0.4s ease",
      }}
    >
      {c.label}
    </span>
  );
};

export default ChatWindow;
