# Detailed Analysis & Implementation Plan (V5.0)

This document provides a deep-dive into why Sakoon V4 is producing "Deep Roman Urdu" with grammatical errors and outlines the strategy to achieve a "Natural Professional" tone.

---

## 🔍 Codebase & Linguistic Diagnostic

### 1. The "Izafat" Failure (`baat-e-shakhsiyat`)
*   **The Artifact**: The model produced `"baat-e-shakhsiyat"` (a Persianate possessive).
*   **The Reason**: This is classic "Hallucinated Formality." Because we told the model it is a "Professional Psychiatrist," it is reaching for the most formal linguistic structures it knows (often seen in highly formal and historical Urdu texts). 
*   **The Problem**: These structures are very rare in Roman Urdu datasets, so the model "salads" them into everyday sentences, creating a "Drunk Professional" feel.

### 2. Turn-by-Turn Logic Breakdown (Turn 2)
*   **User**: "me thk hn"
*   **Bot**: "Yeh sun kar itma'nan hua. Kya aapko koi baat-e-shakhsiyat ya kaam ki tarah ke liye share nahi karne chahenge abhi?"
*   **Linguistic Bug**: The sentence structure is incoherent. It mixes formal words (*itma'nan*) with broken connectors (*ki tarah ke liye*).
*   **Cause**: The current `temperature: 0.4` is preventing the model from being creative, but the **High Formality** instruction is forcing it to pick "Heavy" tokens that don't fit together.

### 3. State Inconsistency
*   **Phase**: EXPLORE (Turn 2).
*   **Instruction**: "Greeting ka naturally jawab do."
*   **Failure**: The bot ignored the "Natural" part and went straight to "Psychiatry Introspection."

---

## 🛠️ Work Stream: The "Natural Professional" Refactor

### Work Stream 1: Linguistic Normalization (`promptBuilder.js`)
- **Change**: Replace "Professional Psychiatrist" with "Supportive Professional Guide." 
- **Goal**: Anchor the model to "Middle-Urdu"—respectful words used in modern professional life (e.g., *Sahi, Samajhna, Behtar*) instead of archaic ones (*Itma'nan, Izafat*).
- **Instruction**: Explicitly forbid "Persian-style possessives (avoid baat-e-something)."

### Work Stream 2: Sentence Architecture Control
- **Change**: Add instruction "Ek sentence mein sirf ek baat karein" (One thought per sentence).
- **Few-Shot Update**: Replace formal few-shots with clear, modern, respectful ones.
    - *Example*: "Yeh sun kar achi baat hai. Kya aaj koi khaas baat share karna chahenge?"

### Work Stream 3: Inference Tuning (`llmCaller.js`)
- **Change**: Increase `repeat_penalty` slightly (1.18) to avoid formal word loops.
- **Goal**: Maintain the 0.4 temperature but improve context reliability.

---

## ✅ Verification Protocol

1.  **The "Naturalness" Test**: Send "theek hoon". **Goal**: Response should be professional but NOT use archaic "baat-e-x" constructions.
2.  **The "Pivot" Test**: Ensure it still detects stress (job pressure) and transitions correctly.

---
**Prepared By Antigravity | Lead AI Architect**
