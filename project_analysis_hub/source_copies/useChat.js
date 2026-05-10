import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "@/lib/api";

const useChat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("EXPLORE");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [streamingContent, setStreamingContent] = useState("");
  const isStreamingRef = useRef(false);

  // Load conversation list on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const data = await api.listConversations();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error("[useChat] Failed to load conversations:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  const selectConversation = useCallback(async (id) => {
    try {
      const data = await api.getConversation(id);
      setActiveConversationId(id);
      setMessages(
        (data.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.created_at,
        }))
      );
      setCurrentPhase(data.conversation?.phase || "EXPLORE");
    } catch (err) {
      console.error("[useChat] Failed to load conversation:", err);
    }
  }, []);

  const createNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setCurrentPhase("EXPLORE");
    setStreamingContent("");
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isStreamingRef.current) return;

      let convId = activeConversationId;
      // Auto-create conversation if none active
      if (!convId) {
        try {
          const data = await api.createConversation();
          convId = data.conversation.id;
          setActiveConversationId(convId);
        } catch (err) {
          console.error("Failed to auto-create conversation", err);
          return;
        }
      }

      // Optimistic UI — add user message
      const userMsg = { role: "user", content: text, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setStreamingContent("");
      isStreamingRef.current = true;

      try {
        await api.sendMessageStream(
          convId,
          text,
          // onToken — called for each token as it arrives
          (token) => {
            setStreamingContent((prev) => prev + token);
          },
          // onDone — called when streaming is complete
          (data) => {
            const botMsg = {
              role: "bot",
              content: data.fullResponse || "",
              timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, botMsg]);
            setStreamingContent("");
            setCurrentPhase(data.phase || "EXPLORE");
            isStreamingRef.current = false;
            setIsLoading(false);

            // Refresh conversation list to update titles/timestamps
            loadConversations();
          }
        );
      } catch (error) {
        console.error("[useChat] Stream error:", error);
        // Fallback: try non-streaming API
        try {
          const data = await api.sendMessage(convId, text);
          const botMsg = {
            role: "bot",
            content: data.botResponse,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, botMsg]);
          setCurrentPhase(data.phase);
          loadConversations();
        } catch (fallbackErr) {
          console.error("[useChat] Fallback error:", fallbackErr);
          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              content: "Maaf karna, server mein thoda masla aa gaya hai. Phir se koshish karoge?",
              timestamp: new Date().toISOString(),
            },
          ]);
        }
        setStreamingContent("");
        isStreamingRef.current = false;
        setIsLoading(false);
      }
    },
    [activeConversationId, loadConversations]
  );

  const deleteConversation = useCallback(
    async (id) => {
      try {
        await api.deleteConversation(id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          setActiveConversationId(null);
          setMessages([]);
          setCurrentPhase("EXPLORE");
        }
      } catch (err) {
        console.error("[useChat] Failed to delete:", err);
      }
    },
    [activeConversationId]
  );

  const pinConversation = useCallback(async (id, isPinned) => {
    try {
      await api.updateConversation(id, { is_pinned: isPinned ? 1 : 0 });
      loadConversations();
    } catch (err) {
      console.error("[useChat] Failed to pin:", err);
    }
  }, [loadConversations]);

  return {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    isLoadingConversations,
    currentPhase,
    streamingContent,
    sendMessage,
    createNewChat,
    selectConversation,
    deleteConversation,
    pinConversation,
    loadConversations,
  };
};

export default useChat;
