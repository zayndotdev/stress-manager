import React, { useRef, useEffect, useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Plus, MessageSquare, Trash2, Pin, X, Search, Wind, Smile, Settings, Menu, Sun, Moon } from "lucide-react";
import gsap from "gsap";
import BreathingWidget from "./BreathingWidget";
import MoodTracker from "./MoodTracker";
import SettingsPanel from "./SettingsPanel";
import SearchPanel from "./SearchPanel";
import { useTheme } from "@/context/ThemeContext";

const Sidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onPinConversation,
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onClose,
  isLoading,
  showSearch,
  setShowSearch,
}) => {
  const ref = useRef(null);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showMood, setShowMood] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (ref.current && isOpen) {
      gsap.fromTo(ref.current, { x: -300 }, { x: 0, duration: 0.35, ease: "power3.out" });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isCollapsed && ref.current) {
      gsap.fromTo(
        ref.current.querySelectorAll('.anim-icon'),
        { y: 15, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: "back.out(1.5)" }
      );
    }
  }, [isCollapsed]);

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
        className={`glass-panel fixed lg:relative ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{
          width: isCollapsed ? 80 : 280,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: "24px",
          boxShadow: "var(--shadow-md)",
          zIndex: 50,
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "16px 14px", borderBottom: isCollapsed ? "none" : "1px solid var(--border-default)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between", marginBottom: 14 }}>
            {!isCollapsed && (
              <span
                className="gradient-text-brand"
                style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800 }}
              >
                Sakoon
              </span>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={onToggleCollapse}
                title="Toggle Sidebar"
                style={{
                  background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-muted)", cursor: "pointer",
                  padding: 6, borderRadius: 8, transition: "all 0.2s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-focus)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
              >
                <Menu size={16} />
              </button>
              {!isCollapsed && (
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
              )}
            </div>
          </div>
          <button
            id="new-chat-button"
            onClick={onNewChat}
            className="btn-primary anim-icon"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: isCollapsed ? "12px 0" : "10px 0",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
            }}
            title={isCollapsed ? "New Chat" : ""}
          >
            <Plus size={isCollapsed ? 20 : 16} />
            {!isCollapsed && "New Chat"}
          </button>
        </div>

        {/* List */}
        <div className="sidebar-list-container" style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
          {isLoading ? (
            <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="shimmer-loading" style={{ height: 48, borderRadius: 10 }} />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            isCollapsed ? null : (
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
            )
          ) : (
            Object.entries(grouped).map(([label, convos]) => (
              <div key={label} style={{ marginBottom: 8 }}>
                {!isCollapsed && (
                  <p
                    style={{
                      fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em",
                      color: "var(--text-muted)", padding: "8px 10px 4px", margin: 0, fontWeight: 600,
                    }}
                  >
                    {label}
                  </p>
                )}
                {convos.map((conv) => (
                  <ConvItem
                    key={conv.id}
                    conv={conv}
                    isCollapsed={isCollapsed}
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
        <div style={{ padding: "8px 12px", borderTop: isCollapsed ? "none" : "1px solid var(--border-default)", display: "flex", flexDirection: "column", gap: 2 }}>
          <SidebarAction className="anim-icon" icon={<Wind size={16} />} label="Breathing Exercise" onClick={() => setShowBreathing(true)} isCollapsed={isCollapsed} />
          <SidebarAction className="anim-icon" icon={<Smile size={16} />} label="Mood Check-in" onClick={() => setShowMood(true)} isCollapsed={isCollapsed} />
          <SidebarAction 
            className="anim-icon" 
            icon={theme === "dark" ? <Sun size={16} /> : <Moon size={16} />} 
            label={theme === "dark" ? "Light Mode" : "Dark Mode"} 
            onClick={toggleTheme} 
            isCollapsed={isCollapsed} 
          />
          <SidebarAction className="anim-icon" icon={<Settings size={16} />} label="Settings" onClick={() => setShowSettings(true)} isCollapsed={isCollapsed} />
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

const ConvItem = ({ conv, isCollapsed, isActive, onSelect, onDelete, onPin }) => {
  const [hovered, setHovered] = React.useState(false);
  const itemRef = useRef(null);

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(
      itemRef.current,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
    );
  }, []);

  return (
    <div
      ref={itemRef}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={isCollapsed ? (conv.title || "New Chat") : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: isCollapsed ? "center" : "flex-start",
        gap: 8,
        padding: isCollapsed ? "12px 0" : "10px 12px",
        borderRadius: 12,
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        background: isActive ? "var(--primary-light)" : hovered ? "var(--bg-hover)" : "transparent",
        transform: hovered && !isActive ? "scale(1.02)" : "scale(1)",
        border: isActive ? "1px solid var(--border-focus)" : "1px solid transparent",
        marginBottom: 4
      }}
    >
      {isCollapsed ? (
        <MessageSquare size={16} style={{ color: isActive ? "var(--primary)" : "var(--text-muted)" }} />
      ) : (
        <>
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
        </>
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

const SidebarAction = ({ icon, label, onClick, isCollapsed, className }) => (
  <button
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    className={className}
    style={{
      display: "flex", alignItems: "center", gap: 10, padding: isCollapsed ? "10px 0" : "10px 12px", width: "100%",
      justifyContent: isCollapsed ? "center" : "flex-start",
      border: "none", background: "transparent", cursor: "pointer", borderRadius: 10,
      color: "var(--text-secondary)", fontSize: 13, fontWeight: 500, transition: "all 0.2s"
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
  >
    {icon}
    {!isCollapsed && label}
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
