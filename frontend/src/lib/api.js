const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const getSessionId = () => {
  let id = localStorage.getItem("sakoon_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("sakoon_session_id", id);
  }
  return id;
};

const headers = () => ({
  "Content-Type": "application/json",
  "x-session-id": getSessionId(),
});

export const api = {
  // Conversations
  async listConversations() {
    const res = await fetch(`${API_BASE_URL}/api/conversations`, { headers: headers() });
    if (!res.ok) throw new Error("Failed to list conversations");
    return res.json();
  },

  async createConversation(title = "New Chat") {
    const res = await fetch(`${API_BASE_URL}/api/conversations`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to create conversation");
    return res.json();
  },

  async getConversation(id) {
    const res = await fetch(`${API_BASE_URL}/api/conversations/${id}`, { headers: headers() });
    if (!res.ok) throw new Error("Failed to get conversation");
    return res.json();
  },

  async deleteConversation(id) {
    const res = await fetch(`${API_BASE_URL}/api/conversations/${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    if (!res.ok) throw new Error("Failed to delete conversation");
    return res.json();
  },

  async updateConversation(id, updates) {
    const res = await fetch(`${API_BASE_URL}/api/conversations/${id}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update conversation");
    return res.json();
  },

  // Chat
  async sendMessage(conversationId, userMessage) {
    const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/chat`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ userMessage }),
    });
    if (!res.ok) throw new Error("Failed to send message");
    return res.json();
  },

  // Search
  async search(query) {
    const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`, {
      headers: headers(),
    });
    if (!res.ok) throw new Error("Search failed");
    return res.json();
  },

  // Mood
  async recordMood(conversationId, rating, note) {
    const res = await fetch(`${API_BASE_URL}/api/mood`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ conversation_id: conversationId, rating, note }),
    });
    if (!res.ok) throw new Error("Failed to record mood");
    return res.json();
  },

  async getMoodHistory(limit = 30) {
    const res = await fetch(`${API_BASE_URL}/api/mood/history?limit=${limit}`, {
      headers: headers(),
    });
    if (!res.ok) throw new Error("Failed to get mood history");
    return res.json();
  },

  // Voice
  async transliterate(text) {
    const res = await fetch(`${API_BASE_URL}/api/voice/transliterate`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("Transliteration failed");
    return res.json();
  },
};
