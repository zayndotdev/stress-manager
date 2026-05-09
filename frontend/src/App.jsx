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
    sendMessage,
    createNewChat,
    selectConversation,
    deleteConversation,
    pinConversation,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [splashDone, setSplashDone] = useState(() => {
    // Only show splash once per session
    return sessionStorage.getItem("sakoon_splash_done") === "true";
  });

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
    sessionStorage.setItem("sakoon_splash_done", "true");
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

      {/* Layout */}
      <div style={{ position: "relative", zIndex: 5, display: "flex", width: "100%", height: "100%" }}>
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelect}
          onNewChat={handleNewChat}
          onDeleteConversation={deleteConversation}
          onPinConversation={pinConversation}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isLoading={isLoadingConversations}
        />
        <main style={{ flex: 1, height: "100%", minWidth: 0 }}>
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            currentPhase={currentPhase}
            onSendMessage={sendMessage}
            onToggleSidebar={() => setSidebarOpen(true)}
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
