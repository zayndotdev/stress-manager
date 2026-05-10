# Sakoon Codebase Analysis — Why It's Failing

After a deep-dive into the logs and the code, here are the three "Structural Rot" issues making the bot sound robotic and broken.

### 1. The "Technical Jargon" Poisoning (`promptBuilder.js`)
The system prompt is currently filled with English technical terms like "distressActive", "Current Phase: EXPLORE", and "Phase Instruction". 
- **The Bug**: Small models like Qwen 2.5 3B have a "Context-Response Leak". When they see technical English in the system prompt, their internal Urdu weights get corrupted. They start trying to "translate" the technical logic into Urdu, resulting in nonsensical words like "aamad" (income) being used for "arrival" or "explore".

### 2. Brittle Phase Logic (`conversationController.js`)
The system forces a "Phase" (EXPLORE, UNDERSTAND, SUGGEST) from the very first message.
- **The Bug**: If a user says "hello", the code assigns `phase = EXPLORE` and sends the instruction: "Ask a gentle question to understand their situation." 
- **The Result**: The bot ignores the "hello" and jumps straight into an interrogation: "Aap sabse pehle kya hua hai?" (What happened first?). This feels inhuman and rushed.

### 3. Linguistic Hallucination (The "Translator" Trap)
The few-shot examples were too generic. 
- **The Bug**: The model was seeing examples like `Sakoon: "Yeh sun ke afsos hua..."` and then trying to "math" its way into a similar sentence for a different context. 
- **The Result**: You get "thak karke" or "rahia tha". These are literally translated English grammatical structures (Active/Passive voice) forced into Urdu skin. They aren't real Urdu.

### 4. Performance Metrics (Latency)
- **Current Latency**: 20s - 40s (Too slow).
- **Cause**: The `num_ctx` and `num_predict` were too high for the hardware, and the prompt was too long.

---
**Verdict**: The current system is a "Rule-Based Bot" trying to be an "AI". We need to make it a "Persona-Based AI" that understands the *vibe* of a Pakistani supporter.
