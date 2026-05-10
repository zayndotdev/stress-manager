import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, Square, Loader2 } from "lucide-react";
import gsap from "gsap";
import { api } from "../lib/api";

const urduToRomanMap = {
  'ا': 'a', 'آ': 'aa', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ٹ': 't', 'ث': 's',
  'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ڈ': 'd', 'ذ': 'z',
  'ر': 'r', 'ڑ': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's',
  'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
  'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ں': 'n', 'و': 'o',
  'ہ': 'h', 'ھ': 'h', 'ء': '', 'ی': 'i', 'ے': 'e', 'ي': 'i', 'ؤ': 'o',
  'ئ': 'i', ' ': ' ',
  'َ': 'a', 'ِ': 'i', 'ُ': 'u', 'ّ': ''
};

const urduToRomanWordMap = {
  'کیا': 'kya', 'آپ': 'aap', 'اپ': 'aap', 'میری': 'meri', 'بات': 'baat',
  'سن': 'sun', 'سکتے': 'sakte', 'ہیں': 'hain', 'تو': 'toh', 'مجھے': 'mujhe',
  'تھوڑا': 'thoda', 'تھوڑی': 'thodi', 'سا': 'sa', 'پریشانی': 'pareshani',
  'ہو': 'ho', 'رہی': 'rahi', 'ہے': 'hai', 'میں': 'main', 'ایک': 'ek',
  'بہت': 'bohat', 'مسئلہ': 'masla', 'نہیں': 'nahi', 'اور': 'aur',
  'کر': 'kar', 'کہ': 'keh', 'یہ': 'yeh', 'وہ': 'woh', 'کو': 'ko',
  'سے': 'se', 'کی': 'ki', 'کا': 'ka', 'کے': 'ke', 'آج': 'aaj',
  'دن': 'din', 'کیسے': 'kaise', 'کچھ': 'kuch', 'بھی': 'bhi',
  'لگ': 'lag', 'رہا': 'raha', 'اچھا': 'acha', 'برا': 'bura',
  'نیند': 'neend', 'آ': 'aa', 'السلام': 'assalam', 'علیکم': 'alaikum',
  'کام': 'kaam', 'دل': 'dil', 'ٹینشن': 'tension', 'باتیں': 'baatein'
};

function liveTransliterate(urduText) {
  let words = urduText.split(' ');
  let romanWords = words.map(word => {
    // Clean punctuation from the word for mapping
    let cleanWord = word.replace(/[.,!?؟،۔]/g, '');
    let punctuation = word.slice(cleanWord.length); 
    
    if (urduToRomanWordMap[cleanWord]) {
      return urduToRomanWordMap[cleanWord] + punctuation;
    }
    
    // Fallback to character mapping
    let roman = '';
    for (let char of word) {
      roman += urduToRomanMap[char] !== undefined ? urduToRomanMap[char] : char;
    }
    return roman;
  });
  return romanWords.join(' ');
}

const InputBar = ({ onSend, disabled }) => {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTransliterating, setIsTransliterating] = useState(false);
  const btnRef = useRef(null);
  const micRef = useRef(null);
  const recognitionRef = useRef(null);
  const initialInputRef = useRef("");
  const sessionTranscriptRef = useRef("");

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true; 
      // ALWAYS use ur-PK so the browser perfectly hears the Urdu words
      recognitionRef.current.lang = 'ur-PK'; 

      recognitionRef.current.onresult = (event) => {
        let currentSessionTranscript = "";
        for (let i = 0; i < event.results.length; ++i) {
          currentSessionTranscript += event.results[i][0].transcript;
        }
        
        if (currentSessionTranscript) {
          sessionTranscriptRef.current = currentSessionTranscript;
          // Live map the Arabic characters to Roman characters instantly
          const liveRoman = liveTransliterate(currentSessionTranscript);
          setInput((initialInputRef.current + " " + liveRoman).trim());
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const finalizeTransliteration = async () => {
    const textToTransliterate = sessionTranscriptRef.current;
    if (textToTransliterate) {
      setIsTransliterating(true);
      try {
        const res = await api.transliterate(textToTransliterate);
        if (res.transliterated) {
          // If Ollama hallucinates or the backend fails, it might return raw Arabic script.
          // We must protect the input field from receiving Arabic characters.
          const hasArabic = /[\u0600-\u06FF]/.test(res.transliterated);
          if (!hasArabic) {
            setInput((initialInputRef.current + " " + res.transliterated).trim());
          }
          // If it has Arabic, we do nothing. The input already contains the 95%-perfect JS fast-draft.
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsTransliterating(false);
        sessionTranscriptRef.current = "";
      }
    }
  };

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Chrome or Safari.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      finalizeTransliteration();
    } else {
      try {
        initialInputRef.current = input; // Save what's currently in the box
        sessionTranscriptRef.current = "";
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };
  useEffect(() => {
    if (isTransliterating) {
      gsap.to("#message-input", { opacity: 0.5, filter: "blur(2px)", duration: 0.2 });
    } else {
      gsap.to("#message-input", { opacity: 1, filter: "blur(0px)", duration: 0.3 });
    }
  }, [isTransliterating]);
  useEffect(() => {
    if (isListening && micRef.current) {
       gsap.to(micRef.current, {
         scale: 1.1,
         boxShadow: "0 0 15px var(--primary)",
         background: "var(--primary-glow)",
         color: "white",
         yoyo: true,
         repeat: -1,
         duration: 0.6,
         ease: "sine.inOut"
       });
    } else if (micRef.current) {
       gsap.killTweensOf(micRef.current);
       gsap.to(micRef.current, { 
         scale: 1, 
         boxShadow: "none", 
         background: "transparent",
         color: "var(--text-muted)",
         duration: 0.3 
       });
    }
  }, [isListening]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      if (btnRef.current) {
        gsap.fromTo(btnRef.current, { scale: 0.85 }, { scale: 1, duration: 0.25, ease: "back.out(2)" });
      }
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const active = input.trim().length > 0 && !disabled;

  return (
    <div
      style={{
        padding: "16px",
        zIndex: 20,
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      <div 
        className="glass-panel"
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 10, 
          maxWidth: 800, 
          margin: "0 auto",
          padding: "8px",
          borderRadius: 100,
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <input
          id="message-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isTransliterating}
          readOnly={isListening}
          placeholder={isTransliterating ? "Polishing Roman Urdu..." : "Apna message likhein..."}
          autoComplete="off"
          style={{
            flex: 1,
            padding: "14px 20px",
            borderRadius: 100,
            border: "none",
            background: "transparent",
            color: "var(--text-primary)",
            fontSize: 15,
            fontFamily: "var(--font-sans)",
            outline: "none",
            opacity: disabled ? 0.5 : 1,
            transition: "all 0.2s ease",
          }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          <button
            ref={micRef}
            onClick={toggleListening}
            disabled={disabled || isTransliterating}
            aria-label="Voice input"
            title="Start Dictation"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: (disabled || isTransliterating) ? "default" : "pointer",
              background: "transparent",
              color: "var(--text-muted)",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!isListening && !disabled && !isTransliterating) e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              if (!isListening && !disabled && !isTransliterating) e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            {isTransliterating ? (
              <Loader2 size={20} className="animate-spin" style={{ color: "var(--primary)" }} />
            ) : isListening ? (
              <Square size={16} fill="currentColor" />
            ) : (
              <Mic size={20} />
            )}
          </button>

          <button
            ref={btnRef}
            id="send-button"
            onClick={handleSend}
            disabled={!active}
            aria-label="Send message"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: active ? "pointer" : "default",
              transition: "all 0.2s ease",
              ...(active
                ? {
                    background: "var(--primary)",
                    color: "#FFFFFF",
                    boxShadow: "0 4px 12px var(--primary-glow)",
                  }
                : {
                    background: "var(--bg-elevated)",
                    color: "var(--text-muted)",
                  }),
            }}
            onMouseEnter={(e) => {
              if (active) e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              if (active) e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputBar;
