import React, { useRef, useEffect, useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Plus, MessageSquare, Trash2, Pin, X, Search, Wind, Smile, Settings } from "lucide-react";
import gsap from "gsap";
import BreathingWidget from "./BreathingWidget";
import MoodTracker from "./MoodTracker";
import SettingsPanel from "./SettingsPanel";
import SearchPanel from "./SearchPanel";

const Sidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onPinConversation,
  isOpen,
  onClose,
  isLoading,
}) => {
  const ref = useRef(null);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showMood, setShowMood] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (ref.current && isOpen) {
      gsap.fromTo(ref.current, { x: -300 }, { x: 0, duration: 0.35, ease: "power3.out" });
    }
  }, [isOpen]);

  const grouped = groupByDate(conversations);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // CMD/CTRL + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
      // ESC to close any modal
      if (e.key === "Escape") {
        setShowSearch(false);
        setShowSettings(false);
        setShowMood(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--bg-overlay)",
            zIndex: 40,
            display: "none",
          }}
          className="lg:!hidden max-lg:!block"
        />
      )}

      <aside
        ref={ref}
        style={{
          width: 280,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-default)",
          zIndex: 50,
          transition: "transform 0.3s ease",
        }}
        className={`fixed lg:relative ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Header */}
        <div style={{ padding: "16px 14px", borderBottom: "1px solid var(--border-default)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span
              className="gradient-text-brand"
              style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800 }}
            >
              Sakoon
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowSearch(true)}
                title="Search (Cmd+K)"
                style={{
                  background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-muted)", cursor: "pointer",
                  padding: 6, borderRadius: 8, transition: "all 0.2s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-focus)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
              >
                <Search size={16} />
              </button>
              <button
                onClick={onClose}
                className="lg:hidden"
                style={{
                  background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
                  padding: 6, borderRadius: 8,
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <button
            id="new-chat-button"
            onClick={onNewChat}
            className="btn-primary"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px 0",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
            }}
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
          {isLoading ? (
            <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="shimmer-loading" style={{ height: 48, borderRadius: 10 }} />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", height: 160, textAlign: "center", padding: 16,
              }}
            >
              <MessageSquare size={28} style={{ color: "var(--text-muted)", marginBottom: 10 }} />
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                Naya chat shuru karein
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([label, convos]) => (
              <div key={label} style={{ marginBottom: 4 }}>
                <p
                  style={{
                    fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em",
                    color: "var(--text-muted)", padding: "8px 10px 4px", margin: 0, fontWeight: 600,
                  }}
                >
                  {label}
                </p>
                {convos.map((conv) => (
                  <ConvItem
                    key={conv.id}
                    conv={conv}
                    isActive={conv.id === activeConversationId}
                    onSelect={() => onSelectConversation(conv.id)}
                    onDelete={() => onDeleteConversation(conv.id)}
                    onPin={() => onPinConversation(conv.id, !conv.is_pinned)}
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {/* Tools/Actions */}
        <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border-default)", display: "flex", flexDirection: "column", gap: 2 }}>
          <SidebarAction icon={<Wind size={16} />} label="Breathing Exercise" onClick={() => setShowBreathing(true)} />
          <SidebarAction icon={<Smile size={16} />} label="Mood Check-in" onClick={() => setShowMood(true)} />
          <SidebarAction icon={<Settings size={16} />} label="Settings" onClick={() => setShowSettings(true)} />
        </div>
      </aside>

      {/* Widgets/Modals */}
      {showBreathing && <BreathingWidget onClose={() => setShowBreathing(false)} />}
      {showMood && <MoodTracker conversationId={activeConversationId} onClose={() => setShowMood(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showSearch && <SearchPanel onClose={() => setShowSearch(false)} onSelectConversation={onSelectConversation} />}
    </>
  );
};

const ConvItem = ({ conv, isActive, onSelect, onDelete, onPin }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 10,
        cursor: "pointer",
        transition: "all 0.15s ease",
        position: "relative",
        background: isActive ? "var(--primary-light)" : hovered ? "var(--bg-hover)" : "transparent",
        border: isActive ? "1px solid var(--border-focus)" : "1px solid transparent",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {conv.is_pinned ? <Pin size={10} style={{ color: "var(--primary)" }} /> : null}
          <p
            style={{
              fontSize: 13, fontWeight: isActive ? 600 : 500, margin: 0,
              color: isActive ? "var(--primary)" : "var(--text-primary)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}
          >
            {conv.title || "New Chat"}
          </p>
        </div>
        <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "2px 0 0" }}>
          {fmtDate(conv.updated_at || conv.created_at)}
        </p>
      </div>
      {hovered && (
        <div style={{ display: "flex", gap: 2 }}>
          <ActionBtn icon={<Pin size={11} />} onClick={onPin} title="Pin" />
          <ActionBtn icon={<Trash2 size={11} />} onClick={onDelete} title="Delete" danger />
        </div>
      )}
    </div>
  );
};

const ActionBtn = ({ icon, onClick, title, danger }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    title={title}
    style={{
      width: 24, height: 24, borderRadius: 6, border: "none",
      background: "var(--bg-elevated)", display: "flex",
      alignItems: "center", justifyContent: "center", cursor: "pointer",
      color: danger ? "var(--accent)" : "var(--text-muted)",
      transition: "all 0.15s ease",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = danger ? "var(--accent-light)" : "var(--primary-light)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
  >
    {icon}
  </button>
);

const SidebarAction = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", width: "100%",
      border: "none", background: "transparent", cursor: "pointer", borderRadius: 10,
      color: "var(--text-secondary)", fontSize: 13, fontWeight: 500, transition: "all 0.2s"
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
  >
    {icon}
    {label}
  </button>
);

function fmtDate(d) {
  if (!d) return "";
  const date = new Date(d);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

function groupByDate(convos) {
  const groups = {};
  convos.forEach((c) => {
    const d = new Date(c.updated_at || c.created_at);
    const label = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "MMMM d");
    if (!groups[label]) groups[label] = [];
    groups[label].push(c);
  });
  return groups;
}

export default Sidebar;
