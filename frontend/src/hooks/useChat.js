import { useState, useCallback } from 'react';

const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('EXPLORE');

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    // 1. Add user message to state
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      console.log(`[useChat] Sending message: "${text}"`);
      // 2. Call backend API
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: text }),
      });

      if (!response.ok) {
        console.error(`[useChat] API error: ${response.status} ${response.statusText}`);
        throw new Error('Network error');
      }

      const data = await response.json();
      console.log(`[useChat] Received response. Phase: ${data.phase}, Count: ${data.questionCount}`);

      // 3. Add bot message and update status
      setMessages((prev) => [...prev, { role: 'bot', content: data.botResponse }]);
      setCurrentPhase(data.phase);
    } catch (error) {
      console.error('[useChat] Error in chat flow:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: 'Maaf karna yaar, server mein thoda masla aa gaya hai. Phir se koshish karoge?' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetChat = useCallback(async () => {
    try {
      console.log('[useChat] Resetting chat...');
      await fetch('http://localhost:5000/api/reset');
      console.log('[useChat] Chat reset successful.');
      setMessages([]);
      setCurrentPhase('EXPLORE');
    } catch (error) {
      console.error('[useChat] Reset Error:', error);
    }
  }, []);

  return {
    messages,
    isLoading,
    currentPhase,
    sendMessage,
    resetChat,
  };
};

export default useChat;
