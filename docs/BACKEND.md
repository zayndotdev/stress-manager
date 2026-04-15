# Phase 2: Backend Development

## Overview
This phase establishes the foundational backend API for the Sakoon project. It defines the conversation lifecycle, prompt engineering rules, LLM integrations, and sanity checks for responses on the backend. 

## File Structure
- `src/controllers/chatController.js` – Ties business logic and API endpoints together.
- `src/routes/chatRoutes.js` – Maps endpoints to the chat controller.
- `src/services/conversationManager.js` – Maintains the chatbot's state (`messages`, `questionCount`, `phase`). Handles state transitions.
- `src/services/llmCaller.js` – Simple HTTP boundary module for invoking the local Mistral API (`localhost:11434`), equipped with neat fallbacks.
- `src/utils/promptBuilder.js` – Constructs the complex LLM system prompt integrating user identity, language constraints, and the dynamic Phase guidelines.
- `src/utils/responseValidator.js` – Ensures outputs strictly follow Roman Urdu guidelines and conversational length constraints.
- `server.js` – Registers the API routes and bootstraps the Express server.
- `test-endpoints.js` – Quick simulation tooling to debug interactions purely from the backend scope.


## API Endpoints
### 1. `POST /api/chat`
**Body:** `{ "userMessage": "mera thoda sir dukh raha tha yaar" }`
**Flow:**
1. Adds message appropriately.
2. Updates and extracts current `phase`.
3. Runs the dynamic prompt.
4. Returns payload with response and counts.

**Return:**
```json
{
    "botResponse": "Kya hua, aaram nahi kiya tumne?",
    "phase": "EXPLORE",
    "questionCount": 1,
    "validationResult": { "valid": true, "issues": [] }
}
```

### 2. `GET /api/reset`
**Return:** `{ "message": "Conversation reset", "phase": "EXPLORE", "questionCount": 0 }`

## Phase Definitions
- `EXPLORE` (0-3 questions): Explores feelings, zero advice, active querying.
- `UNDERSTAND` (4-6 questions): Validates context, builds reflective prompts.
- `SUGGEST` (7+ questions): Allows mild suggestions paired with questions.

## Manual Testing
Via curl:
```bash
curl -X POST http://localhost:5000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"userMessage":"Bohot kaam de diya boss ne."}'
```

## TODOs / Limitations
- State is currently kept in-memory globally (`conversationManager`). This will break or overlap for multiple concurrent users. Since Sakoon is a local offline single-user client tool, this suffices for MVP.
- NLP context evaluation for "pure English words vs Roman Urdu" is currently using basic heuristics and regex arrays rather than an extensive DB tokenizer.

## Status: COMPLETE ✅
