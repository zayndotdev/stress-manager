# Sakoon Transformation Plan — Operation "Asli Sakoon"

This plan outlines how I will move from "Bot Responses" to "Perfect Human Responses".

## 1. The "Pure Urdu" System Prompt (`promptBuilder.js`)
- **Action**: I will rewrite the system prompt to be 90% Roman Urdu. Instead of explaining instructions in English, I will explain them to the model in Urdu (e.g., "Aap ka kaam sunna hai" instead of "Your job is to explore").
- **Impact**: This keeps the AI's neural weights inside the Urdu linguistic space, preventing English "leaks" and logical confusion.

## 2. Natural Entry-Point Logic (`conversationController.js`)
- **Action**: I will add a "GREETING" phase. If the user says "hello", "hi", or "salam", the bot will respond with a warm welcome *first*, without jumping to the "Explore" interrogation.
- **Impact**: The conversation will feel human from the very first word.

## 3. The "Anti-Translation" Shield (`responseCleaner.js`)
- **Action**: I will add a "Hallucination Catch" list for words the bot is misusing (like "aamad" or "dafa") and replace them with natural synonyms or trigger a silent re-generation.
- **Impact**: No more weird words that make users scratch their heads.

## 4. Hardware Optimization for Speed
- **Action**: I will hard-limit the model's `top_k` and `top_p` in `llmCaller.js` and set the `num_predict` to exactly 60. 
- **Impact**: This will force the bot to be concise and will reduce response latency to < 5 seconds.

## 5. Automated "Gold-Standard" Testing
- **Action**: I will create a new test script `final_perfection_test.js` that compares the bot's response against my "Perfect Responses" using a lexical similarity check.
- **Impact**: Proven verification of the 100% quality target.
