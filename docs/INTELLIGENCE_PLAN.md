# Expert-Level Intelligence & Persona Refactor Plan (V2.0)

This plan moves Sakoon from a "diagnostic bot" to a "conversational companion." We are solving the "Stress Obsession" by introducing social intelligence and linguistic fluidity.

---

## 🔍 Module-by-Module Deep Diagnostic

### 1. `promptBuilder.js` (The Cognitive Brain)
*   **The Problem**: The identity is anchored to "stress support" in the very first sentence. This creates a "Confirmation Bias" in the model—it ignores happy greetings because it feels it *must* find a problem to solve.
*   **The Result**: If a user says "Hi", the bot ignores the greeting and asks "What stress are you facing?". This is human-uncanny.
*   **The Solution**: Implement an **Identity Hierarchy**. The bot is a "Friend" first, and a "Stress Guide" second.

### 2. `conversationManager.js` (The Narrative Engine)
*   **The Problem**: The `phase` is a "blind" counter. It doesn't know if the user is enjoying their day or in a crisis.
*   **The Result**: If the user is happy for 4 turns, the bot still moves to PHASE 2 (UNDERSTAND), which forces "deeper reflection on feelings," causing a non-sequitur.

### 3. `llmCaller.js` (The Inference Layer)
*   **The Problem**: Zero hyper-parameter tuning. We are using Mistral's default tokens which can be repetitive or linguistically "flat" in Roman Urdu.
*   **The Solution**: Inject specialized sampling parameters to reward natural Urdu flow.

---

## 🛠️ Work Stream 1: Prompt Architecture Overlay

### Proposed Instruction Rewrite (`promptBuilder.js`)
We will move to a tiered instruction set:
1.  **Identity Block**: "Tu Sakoon hai, ek empathetic dost. Tera pehla kaam user se dosti karna hai. Agar wo khush hai, tu bhi khush ho. Agar wo pareshan hai, tab support do."
2.  **Linguistic Particles**: Explicitly allow words like: *Yaar, Bhai, Arre, Maza, Zabardast, Khairiyat*.
3.  **Constraint Refinement**: Relax character limit to **250 chars** to allow for natural grammar.

### 5-Turn High-Fidelity Few-Shots
| Scenario | User Input | Proposed Bot Persona Response |
| :--- | :--- | :--- |
| **Greeting** | "Hello Sakoon" | "Hi bhai! Kaise ho yaar? Aaj ka din kaisa ja raha hai?" |
| **Positive State** | "Main bilkul theek hoon" | "Zabardast! Yeh sun kar maza aya. Aaj koi khaas khabar?" |
| **Vague Anxiety** | "Pata nahi weird sa feel ho raha" | "Arre yaar, kab se aisa lag raha hai? Tension mat lo, main hoon na." |
| **Work Stress** | "Boss ne bohot pressure diya hai" | "Haye, yeh boss log bhi na! Kya deadline ka masla hai ya kuch aur?" |
| **Suggestion** | "Kaam khatam hi nahi hota" | "Hmm, thoda break lo yaar. Chai piyo ya koi gaana suno. Phir dekhte hain?" |

---

## 🛠️ Work Stream 2: Backend Logic Updates

### Adaptive Phase Logic (`conversationManager.js`)
Instead of `if (count <= 3)`, I propose a **Contextual State Shift**:
- If `questionCount` is high BUT user messages contain "theek", "mazay", "khush", the prompt will receive an `override` signal to stay in "Social Mode" vs "Support Mode."

### Inference Parameters (`llmCaller.js`)
We will modify the Ollama body to include:
```json
"options": {
  "temperature": 0.72,
  "top_p": 0.9,
  "repeat_penalty": 1.12,
  "num_predict": 100
}
```

---

## 🛠️ Work Stream 3: Post-Processing Logic

### Intelligent Truncated (`responseCleaner.js`)
- **Current**: Hard cut at 200 chars.
- **Proposed**: Find the *last* punctuation (`?`, `.`, `!`) within the 200-250 range. If found, cut there. This prevents "broken sentences."

---

## 📊 Summary of Pros, Cons & Improvements

| Area | Pros | Cons | Improvement |
| :--- | :--- | :--- | :--- |
| **Persona Pivot** | Feels human & supportive. | Might miss a subtle crisis. | Add crisis keyword list for instant escalation. |
| **Tuning (0.7)** | Better Urdu cadence. | Slower response slightly. | Minor tradeoff for 10x better quality. |
| **Few-Shots** | Strongest tool for control. | Higher token cost. | Optimized to be concise. |

---

## ✅ Final Verification Protocol

1.  **The "Happiness" Test**: Send "Main maze mein hoon". **Goal**: Bot should NOT ask about stress.
2.  **The "Greeting" Test**: Send "Hi". **Goal**: Response must be a social greeting.
3.  **The "Urdu Fluidity" Test**: Check if bot says things like "party banti hai" or "haye" appropriately.
