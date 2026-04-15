# Sakoon — Detailed Development & Server Logs

This document contains the raw logs captured during the Phase 4 manual and automated testing sessions. These logs provide insight into LLM response times, internal state transitions, and cleaning effectiveness.

---

## 📅 Session Log: 2026-04-15 (Manual & Automated Run)

### Session Summary
- **Total Requests**: 15+
- **Average LLM Response Time**: ~45s (Peak: 187s)
- **Phase Transitions**: Verified (EXPLORE -> UNDERSTAND -> SUGGEST)
- **Validation Pass Rate**: ~90% (Occasional length violations)

---

### Detailed Interaction Log

#### 1. Initial Greeting (EXPLORE)
- **User**: "hello, kia hal hai?"
- **LLM Time**: 19.8s
- **Raw Bot**: "Hello, aap kaise ho? Zara khud ko socha kya stress..."
- **Cleaned**: "Hello, aap kaise ho? Zara khud ko socha kya stress ho raha hai?"
- **Status**: Valid ✅

#### 2. Context Denial Test
- **User**: "me to bilkul thk hn,, ap thk ho?"
- **LLM Time**: 34.2s
- **Raw Bot**: "Achoo, main bhi theek hoon. Lekin aapko kya lagta..."
- **Cleaned**: "Achoo, main bhi theek hoon. Lekin aapko kya lagta hai ke stress naa hai?"
- **Status**: Valid ✅ (But linguistically awkward)

#### 3. Stress Identification
- **User**: "mujhy thora stress feel ho rha hai,, mujhy lgata hy k job ki wajah se hy"
- **LLM Time**: 29.9s
- **Cleaned**: "Aapko thoda stress lag raha hai? Kya yeh office ka pressure wala ho jiske sath aap zyada samne jate rehte ho?"
- **Status**: Valid ✅

#### 4. Automated Suite — Sleep & Tension (EXPLORE Phase)
- **M1 ("stressed hoon")**: 123s | Result: "Arre yaar... Kya aap stress ke liye sabse pehle kuch soch rahe ho?"
- **M2 ("kaam ka pressure")**: 29.8s | Result: "...office mein kya kaam hai jiske saath pressure aa raha hai?"
- **M3 ("neend nahi aa rahi")**: 36.3s | Result: "...Aapko kisi baat ke dhoop dhoondh raho ke woh saamne na aati?"

#### 5. Phase Transition: EXPLORE -> UNDERSTAND
- **M4 ("ghar mein tension")**: 42.6s
- **Log**: `[STATE] 🔔 Phase Transition: EXPLORE -> UNDERSTAND`
- **Cleaned**: "Arre yaar... Ghar pe bhi koi stress hai ya sirf office?..." 

#### 6. Deeper Reflection (UNDERSTAND Phase)
- **M5 ("koi samajhta nahi")**: 136s | Result: "...Aapko kis liye kisi cheez ke dhoop dhoondh raho ke woh saamne na aati?"
- **M6 ("akela feel hota")**: 39s | Result: "...Main aapki dost hoon, sab se pehle tayyar ho jata hoon. Aaj tak kaisa feel hota hai?"

#### 7. Phase Transition: UNDERSTAND -> SUGGEST
- **M7 ("sab theek ho jayega")**: 55.3s
- **Log**: `[STATE] 🔔 Phase Transition: UNDERSTAND -> SUGGEST`
- **Cleaned**: "...aapko kuch iska ilaj karne ka intezaar karna chahte ho na?"

#### 8. Final Message (SUGGEST Phase)
- **M8 ("dar lagta hai")**: 187s
- **Cleaned**: "...Main apne aap kaam karke aapko support deta hoon, aur main agle baar baat pachtaunga. Aaj tak kaisa feel hota hai?"

---

### Technical Findings & Anomalies

1. **Hallucination Alert**: 
   - LLM used the word `buddhiya` (old woman) in a response to "Meri tabiyat theek nahi lag rahi". This indicates the model is hallucinating specific user traits not present in the prompt.
2. **Grammar Artifacts**:
   - `Achoo` used as a filler word or greeting.
   - `intezaar karna chahte ho na` (suggesting treatment/cure) shows the SUGGEST phase is active but phrasing is unnatural.
3. **Performance Latency**:
   - Several calls exceeded **120 seconds**. This is likely due to running Mistral 7B on a CPU or limited GPU resources. Recommend optimizing Ollama/Windows configuration.
4. **Validation Failure (Length)**:
   - Message: "Aap toh aisa lag raha hai kuch aaram hi kabhi nahi milega..." (219 chars). 
   - Root Cause: ResponseCleaner failed to truncate or LLM was too verbose for the cleaner to solve without losing meaning.

---
**End of Log Report**
