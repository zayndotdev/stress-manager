import React, { useState, Suspense, useCallback } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import useChat from "@/hooks/useChat";
import ChatWindow from "@/components/ChatWindow";
import Sidebar from "@/components/Sidebar";
import SplashScreen from "@/components/SplashScreen";

const ParticleBackground = React.lazy(() => import("@/components/ParticleBackground"));

function AppContent() {
  const {
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
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile off-canvas
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // For desktop mini-sidebar
  const [showSearch, setShowSearch] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  const handleNewChat = async () => {
    await createNewChat();
    setSidebarOpen(false);
  };

  const handleSelect = async (id) => {
    await selectConversation(id);
    setSidebarOpen(false);
  };

  if (!splashDone) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", overflow: "hidden", position: "relative", background: "var(--bg-base)" }}>
      {/* 3D Background */}
      <Suspense fallback={null}>
        <ParticleBackground phase={currentPhase} />
      </Suspense>

      {/* Floating Layout */}
      <div 
        style={{ 
          position: "relative", 
          zIndex: 5, 
          display: "flex", 
          width: "100%", 
          height: "100%",
          padding: "16px",
          gap: "16px",
          boxSizing: "border-box"
        }}
      >
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelect}
          onNewChat={handleNewChat}
          onDeleteConversation={deleteConversation}
          onPinConversation={pinConversation}
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onClose={() => setSidebarOpen(false)}
          isLoading={isLoadingConversations}
          showSearch={showSearch}
          setShowSearch={setShowSearch}
        />
        <main 
          className="glass-panel"
          style={{ 
            flex: 1, 
            height: "100%", 
            minWidth: 0,
            borderRadius: "24px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "var(--shadow-md)",
            position: "relative"
          }}
        >
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            streamingContent={streamingContent}
            currentPhase={currentPhase}
            onSendMessage={sendMessage}
            onToggleSidebar={() => setSidebarOpen(true)}
            onOpenSearch={() => setShowSearch(true)}
            activeConversationId={activeConversationId}
          />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
