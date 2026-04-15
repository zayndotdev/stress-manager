import React from 'react';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <div className="flex justify-center h-screen w-full bg-[#d1d7db]">
      <div className="w-full max-w-[480px] h-full shadow-2xl bg-white flex flex-col">
        <ChatWindow />
      </div>
    </div>
  );
}

export default App;
