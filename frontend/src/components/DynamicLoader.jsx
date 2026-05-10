import React, { useEffect, useRef } from "react";
import { Brain } from "lucide-react";
import gsap from "gsap";

const DynamicLoader = () => {
  const iconRef = useRef(null);
  const textRef = useRef(null);
  const dotRef1 = useRef(null);
  const dotRef2 = useRef(null);
  const dotRef3 = useRef(null);

  useEffect(() => {
    // 1. Brain Icon "Breathing" Pulse
    gsap.to(iconRef.current, {
      scale: 1.15,
      filter: "drop-shadow(0 0 12px var(--primary))",
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // 2. Text "Aura" Glow
    gsap.to(textRef.current, {
      opacity: 0.7,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // 3. Jumping Dots (Typing Indicator)
    const dots = [dotRef1.current, dotRef2.current, dotRef3.current];
    gsap.to(dots, {
      y: -5,
      opacity: 1,
      duration: 0.4,
      stagger: 0.15,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });
  }, []);

  return (
    <div 
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 12, 
        padding: "12px 20px",
        background: "var(--bg-elevated)",
        borderRadius: "16px",
        border: "1px solid var(--border-default)",
        width: "fit-content",
        margin: "10px 0",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      <div ref={iconRef} style={{ color: "var(--primary)", display: "flex" }}>
        <Brain size={20} />
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span 
          ref={textRef}
          style={{ 
            fontSize: 14, 
            fontWeight: 500, 
            color: "var(--text-secondary)",
            fontFamily: "var(--font-sans)"
          }}
        >
          Sakoon soch raha hai
        </span>
        
        {/* Modern Jumping Dots */}
        <div style={{ display: "flex", gap: 3, alignItems: "center", height: 14, paddingTop: 4 }}>
          <div ref={dotRef1} style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--primary)", opacity: 0.4 }} />
          <div ref={dotRef2} style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--primary)", opacity: 0.4 }} />
          <div ref={dotRef3} style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--primary)", opacity: 0.4 }} />
        </div>
      </div>
    </div>
  );
};

export default DynamicLoader;
