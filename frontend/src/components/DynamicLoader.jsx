import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Sparkles, Brain, Clock } from "lucide-react";

const THINKING_MESSAGES = [
  { text: "Sakoon aapki baat par ghor kar raha hai...", icon: Brain },
  { text: "Gahrai se soch raha hoon...", icon: Clock },
  { text: "Behtareen jawab tayar kar raha hoon...", icon: Sparkles }
];

const DynamicLoader = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const dotRef1 = useRef(null);
  const dotRef2 = useRef(null);
  const dotRef3 = useRef(null);

  useEffect(() => {
    // Message rotation
    const interval = setInterval(() => {
      gsap.to(textRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        onComplete: () => {
          setCurrentIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
          gsap.fromTo(
            textRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.3 }
          );
        }
      });
    }, 4000);

    // Initial mount animation
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
    );

    // Bouncing dots
    gsap.to([dotRef1.current, dotRef2.current, dotRef3.current], {
      y: -6,
      stagger: {
        each: 0.15,
        repeat: -1,
        yoyo: true,
      },
      ease: "sine.inOut",
      duration: 0.6
    });

    return () => {
      clearInterval(interval);
      gsap.killTweensOf([textRef.current, containerRef.current, dotRef1.current, dotRef2.current, dotRef3.current]);
    };
  }, []);

  const Icon = THINKING_MESSAGES[currentIndex].icon;

  return (
    <div 
      ref={containerRef}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 16,
        maxWidth: "85%"
      }}
    >
      {/* Bot Avatar Placeholder */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: "linear-gradient(135deg, var(--primary), var(--secondary))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 2px 8px var(--primary-glow)",
        }}
      >
        <span style={{ color: "white", fontSize: 14, fontWeight: "bold" }}>S</span>
      </div>

      <div
        className="glass-panel"
        style={{
          padding: "12px 16px",
          borderRadius: "4px 16px 16px 16px",
          border: "1px solid var(--border-default)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Icon size={16} color="var(--primary)" />
        
        <div ref={textRef} style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
          {THINKING_MESSAGES[currentIndex].text}
        </div>

        <div style={{ display: "flex", gap: 3, marginLeft: 8 }}>
          <div ref={dotRef1} style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--primary)" }} />
          <div ref={dotRef2} style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--primary)" }} />
          <div ref={dotRef3} style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--primary)" }} />
        </div>
      </div>
    </div>
  );
};

export default DynamicLoader;
