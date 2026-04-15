import React, { useState } from 'react';

const InputBar = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-2 bg-[#f0f2f5] flex items-center gap-2 border-t border-border">
      <input
        type="text"
        className="flex-1 bg-white rounded-lg px-4 py-2 text-[15px] focus:outline-none placeholder:text-text-secondary"
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={disabled}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className={`p-2 rounded-full transition-colors ${
          !input.trim() || disabled ? 'text-gray-400' : 'text-header-light hover:bg-gray-200'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  );
};

export default InputBar;
