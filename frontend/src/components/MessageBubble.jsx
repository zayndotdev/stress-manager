import React from 'react';

const MessageBubble = ({ text, sender }) => {
  const isUser = sender === 'user';
  
  return (
    <div className={`flex w-full mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[85%] px-3 py-2 text-[15.5px] shadow-sm leading-relaxed
          ${isUser 
            ? 'bg-bubble-user text-text-primary rounded-l-[18px] rounded-tr-[18px] rounded-br-[4px] ml-12' 
            : 'bg-bubble-bot text-text-primary rounded-r-[18px] rounded-tl-[18px] rounded-bl-[4px] mr-12'
          }`}
      >
        {text}
      </div>
    </div>
  );
};

export default MessageBubble;
