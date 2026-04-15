# Phase 1: Project Setup

## Environment Details
- **Backend Stack**: Node.js, Express, cors, axios, dotenv
- **Frontend Stack**: React + Vite
- **LLM**: Ollama running Mistral 7B `ollama version 0.20.6`

## Folder Structure
```
sakoon/
├── backend/
│   ├── node_modules/
│   ├── package-lock.json
│   ├── package.json
│   ├── server.js
│   └── test-llm.js
├── docs/
│   ├── MASTER.md
│   └── SETUP.md
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── vite.config.js
│   └── ...
└── README.md
```

## How to Start the App

### 1. Start Ollama (LLM Wrapper)
Ensure the Ollama application is running in the background. Or run:
```bash
ollama serve
```
To run CLI manually:
```bash
ollama run mistral
```

### 2. Start Backend
In a new terminal:
```bash
cd backend
npm start  # or `node server.js`
```
The server will start on port `5000`.

### 3. Start Frontend
In a new terminal:
```bash
cd frontend
npm run dev
```
The app will be available on `localhost:5173`.

## Issues Found & Fixes
- Issue: PowerShell couldn't use `type nul > README.md`. Fixed by using proper node scripting / `write_to_file` standard API to generate files safely.
- Issue: Vite `create-vite` CLI template passing syntax in powershell (`-- --template react`). Fixed by installing cleanly and bypassing powershell interactive bugs.

## Status: COMPLETE ✅
