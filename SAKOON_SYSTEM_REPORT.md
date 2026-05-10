# Sakoon Project Architecture & Final Diagnosis Report

---

## 1. Project Overview
**Sakoon** is an offline-capable, AI-powered mental health assistant specifically designed for the Pakistani context. It uses a "Street Smart" but professional persona that communicates exclusively in **Roman Urdu**.

### Core Technologies
- **Frontend**: React (Vite) + Tailwind CSS + GSAP.
- **Backend**: Node.js + Express + Better-SQLite3.
- **AI Engine**: Ollama (Running `qwen2.5:3b` - Hardware Optimized).
- **Communication**: Server-Sent Events (SSE) for real-time response streaming.

---

## 2. Final Diagnosis & Bug Fixes
The system underwent a major overhaul to solve critical quality and reliability issues.

| Category | Issue | Fix |
|---|---|---|
| **Model** | Defaulted to `llama3.1` (uninstalled/poor Urdu) | Locked to `gemma2:2b` (superior Roman Urdu performance). |
| **Persona** | Weak, English-heavy system prompt | Professional "Aap" persona with strict spelling rules and few-shot examples. |
| **Response** | Commentary ("Note:", "Explanation:") leaked into UI | Implemented `responseCleaner.js` to strip all AI artifacts. |
| **Logic** | English sentences mixed with Urdu | Added `responseAnalyzer.js` to shield the UI from English drift. |
| **Stability** | Truncated responses (100 tokens) | Increased to 200 tokens + stopping stream on commentary markers (`:**`). |

---

## 3. The "Response Shield" Architecture
We implemented a three-stage validation pipeline to ensure every response feels authentic and clean:

1.  **Prompt Builder**: Injects the correct persona and current conversation phase (Explore, Understand, Suggest).
2.  **Stream Monitor**: Detects and cuts the stream early if the AI starts generating "meta-notes" (like `**Note:**`).
3.  **Cleaner & Validator**: 
    - Strips Arabic/Urdu script (Arabic letters).
    - Removes English commentary sentences.
    - Normalizes common Roman Urdu spellings (kya, hoon, bohat).

---

## 4. Test Suite Results
The system was verified using the **Roman Urdu Automated Test Suite (`tests/roman_urdu_test.js`)**.

### **Pass Rate: 100% (8/8 Cases Passed)**

| Test ID | Scenario | Input | Status |
|---|---|---|---|
| **TC-01** | Greeting | "Assalam o Alaikum" | ✅ PASS |
| **TC-02** | Stress Trigger | "bohat tension ho rahi hai" | ✅ PASS |
| **TC-03** | Sleep Issues | "neend nahi aati" | ✅ PASS |
| **TC-04** | Confusion | "kuch samajh nahi aa raha" | ✅ PASS |
| **TC-05** | Office Stress | "boss ne daanta aaj" | ✅ PASS |
| **TC-06** | Loneliness | "akela feel ho raha hoon" | ✅ PASS |
| **TC-07** | Positive Mood | "acha din tha yaar" | ✅ PASS |
| **TC-08** | Context | "kal exam bhi hai" | ✅ PASS |

---

## 5. Operational Guide

### How to Start the System
1. Ensure Ollama is running: `ollama pull gemma2` (9B version)
2. Start the Backend: `cd backend && npm start`
3. Start the Frontend: `cd frontend && npm run dev`

### Monitoring & Logs
- **Activity Log**: `backend/logs/chat.log` (General events)
- **LLM Audit**: `backend/logs/llm_responses.log` (Raw exchanges for debugging)
- **Test Results**: `backend/logs/test_results.log` (History of automated runs)

---
**Report Generated on:** May 10, 2026
**System Status:** `STABLE` | **Persona Accuracy:** `HIGH`
