import React, { useEffect, useRef } from 'react';
import useChat from '../hooks/useChat';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import PhaseIndicator from './PhaseIndicator';

const ChatWindow = () => {
  const { messages, isLoading, currentPhase, sendMessage, resetChat } = useChat();
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full bg-chat-bg relative overflow-hidden">
      {/* Header */}
      <header className="bg-header text-white p-3 flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sakoon-100 flex items-center justify-center text-header font-bold text-xl">
            S
          </div>
          <div>
            <h1 className="font-semibold text-base leading-tight">Sakoon</h1>
            <p className="text-[12px] text-sakoon-100 opacity-80">Stress Support Bot</p>
          </div>
        </div>
        <button 
          onClick={resetChat}
          className="text-[12px] bg-header-light hover:bg-[#1a9d8d] px-3 py-1.5 rounded-md transition-colors font-medium border border-white/10"
        >
          Reset Chat
        </button>
      </header>

      {/* Phase Info */}
      <PhaseIndicator phase={currentPhase} />

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 opacity-60">
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
              <p className="text-sm text-text-primary">
                Assalam-o-Alaikum! Main yahan aapki sun-ne ke liye hoon. 
                Kuch pareshaani hai?
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble key={idx} text={msg.content} sender={msg.role} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-2">
            <div className="bg-bubble-bot px-4 py-3 rounded-r-[18px] rounded-tl-[18px] rounded-bl-[4px] shadow-sm">
              <div className="flex gap-1.5 pt-1 pb-1">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <InputBar onSend={sendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatWindow;
