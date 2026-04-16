# Sakoon — Discrete Stress Management Assistant

Sakoon is an offline-first, professional stress management chatbot designed to communicate in natural Roman Urdu. It leverages local LLM inference (Ollama/Mistral 7B) to provide a private, empathetic, and structured support experience.

## 🩺 System Overview (V4.0)
The project has evolved through four major refactor cycles, landing on a **Discrete Professional Persona**. Unlike typical casual chatbots, Sakoon V4.0 acts as a mature stress manager that:
- **Prioritizes Reflection**: Validates user feelings through active listening.
- **Maintained Neutrality**: Uses respectful Roman Urdu without slang (*Yaar/Bhai*).
- **Dynamic State Management**: Detects user distress automatically and pivots from social bonding to therapeutic support.

## 🧠 Intelligence Layer
- **Model**: Mistral 7B (via Ollama).
- **Parameters**: Tuned for Roman Urdu stability (`temp: 0.4`, `repeat_penalty: 1.15`).
- **Phase Logic**:
  - `EXPLORE`: Initial social check-in and mood assessment.
  - `UNDERSTAND`: Empathetic reflection on detected stress.
  - `SUGGEST`: Light, non-judgmental practical suggestions.

## 🛠️ Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion.
- **Backend**: Node.js + Express.
- **Observability**: Custom persistent logging system (`backend/logs/chat.log`).
- **Environment**: Fully offline (Local API).

## 🚀 Getting Started

### 1. Prerequisites
- [Ollama](https://ollama.com/) installed and running.
- Mistral model pulled: `ollama pull mistral`.

### 2. Backend Setup
```bash
cd backend
npm install
node server.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📖 Project Documentation
Detailed reports and development logs are available in the [`docs/`](./docs) directory:
- [Intelligence Plan V4](./docs/INTELLIGENCE_PLAN.md): Detailed persona guidelines.
- [Walkthrough V4](./docs/WALKTHROUGH_V4.md): Latest refactor summary.
- [Analysis Report](./docs/ANALYSIS_REPORT.md): Deep-dive into Roman Urdu logic.

---
**Status**: **Production Ready (V4.0)** 🚀
