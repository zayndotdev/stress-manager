# Phase 3: Frontend Development

## Overview
The Sakoon frontend is a React-based chat application styled to mimic the familiar WhatsApp interface. It is mobile-first, clean, and uses Roman Urdu for all user-facing status messages.

## Component Tree
- `App.jsx`: Root container, centers the chat window.
  - `ChatWindow.jsx`: The main controller. Assemblies header, list, and input.
    - `PhaseIndicator.jsx`: Discrete status bar showing the current conversation phase in Urdu.
    - `MessageBubble.jsx`: Renders individual messages with WhatsApp-style tails and alignment.
    - `InputBar.jsx`: Text field and send button with keyboard support.

## Components Detail

### 1. `ChatWindow.jsx`
- **Purpose**: Manages the main chat viewport, auto-scroll logic, and typing animation.
- **Key Logic**: Uses `useEffect` on `messages` to scroll the container to the bottom.

### 2. `MessageBubble.jsx`
- **Props**: `{ text: string, sender: 'user' | 'bot' }`
- **Styling**: Uses Tailwind v4 theme tokens:
  - User: `bg-bubble-user` (Light Green), Right-aligned.
  - Bot: `bg-bubble-bot` (White), Left-aligned.
  - Corners: 18px radius with a flat corner on the bottom-side corresponding to the sender's alignment.

### 3. `PhaseIndicator.jsx`
- **Props**: `{ phase: string }`
- **Labels**:
  - `EXPLORE`: "Sun raha hoon..." (Listening)
  - `UNDERSTAND`: "Samajh raha hoon..." (Understanding)
  - `SUGGEST`: "Madad karna chahta hoon..." (Wanting to help)

### 4. `InputBar.jsx`
- **Props**: `{ onSend: function, disabled: boolean }`
- **Features**: Disables when the bot is "typing", supports `Enter` to send.

## State Management (`useChat` hook)
All business logic is encapsulated in `src/hooks/useChat.js`:
- **State**: `messages`, `isLoading`, `currentPhase`.
- **API Connectivity**: 
  - `sendMessage`: Optimistically updates UI, calls `POST /api/chat`, handles errors with Roman Urdu fallbacks.
  - `resetChat`: Calls `GET /api/reset` and clears local state.

## How to Run
1. Navigate to `frontend/`.
2. Run `npm install` (if not already done).
3. Run `npm run dev`.
4. Open [http://localhost:5173/](http://localhost:5173/).

## UI/UX Features
- **Typing Indicator**: 3-dot bouncing animation while waiting for response.
- **Empty State**: Friendly "Assalam-o-Alaikum" starter message.
- **Reset**: Subtle button in the header to restart the journey.

## Status: COMPLETE ✅
