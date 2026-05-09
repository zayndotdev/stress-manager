import React, { useState, useEffect } from "react";
import { Search, X, MessageSquare, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";

const SearchPanel = ({ onClose, onSelectConversation }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        try {
          const data = await api.search(query);
          setResults(data.results || []);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center",
      paddingTop: "10vh", background: "var(--bg-overlay)", backdropFilter: "blur(4px)"
    }}>
      <div className="animate-fade-in-up" style={{
        background: "var(--bg-surface)", width: 500, maxWidth: "90%", borderRadius: 20, border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-lg)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "80vh"
      }}>
        {/* Input Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "16px", borderBottom: "1px solid var(--border-default)" }}>
          <Search size={20} style={{ color: "var(--text-muted)", marginRight: 12 }} />
          <input
            autoFocus
            type="text"
            placeholder="Search past conversations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "var(--text-primary)", fontSize: 16, fontFamily: "var(--font-sans)"
            }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <X size={16} />
            </button>
          )}
          <div style={{ width: 1, height: 24, background: "var(--border-default)", margin: "0 12px" }} />
          <button onClick={onClose} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", cursor: "pointer", borderRadius: 6, padding: "4px 8px", fontSize: 12, fontWeight: 600 }}>
            ESC
          </button>
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {isSearching ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 32, gap: 8, color: "var(--text-muted)" }}>
              <Loader2 size={18} className="animate-spin" />
              <span style={{ fontSize: 13 }}>Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {results.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    onSelectConversation(msg.conversation_id);
                    onClose();
                  }}
                  style={{
                    padding: 12, borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                    border: "1px solid var(--border-default)", background: "var(--bg-elevated)"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-focus)"; e.currentTarget.style.background = "var(--bg-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)" }}>{msg.conversation_title}</span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{format(new Date(msg.created_at), "MMM d, h:mm a")}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {msg.role === "user" ? <span style={{ color: "var(--text-muted)", marginRight: 4 }}>You:</span> : <span style={{ color: "var(--text-muted)", marginRight: 4 }}>Sakoon:</span>}
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>
          ) : query.trim().length >= 2 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, textAlign: "center" }}>
              <Search size={32} style={{ color: "var(--text-muted)", marginBottom: 12, opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>No messages found</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Try searching with different keywords</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, textAlign: "center" }}>
              <MessageSquare size={32} style={{ color: "var(--text-muted)", marginBottom: 12, opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>Search Conversations</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Find past advice and feelings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;
