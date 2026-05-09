import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const SplashScreen = ({ onComplete }) => {
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const textRefs = useRef([]);
  const subtitleRef = useRef(null);
  const lineRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 1.05,
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => {
            setIsVisible(false);
            onComplete();
          },
        });
      },
    });

    // Phase 1: Logo scales in with elastic
    tl.fromTo(
      logoRef.current,
      { scale: 0, opacity: 0, rotateZ: -15 },
      { scale: 1, opacity: 1, rotateZ: 0, duration: 0.8, ease: "back.out(1.7)" }
    );

    // Phase 2: Letters stagger in
    tl.fromTo(
      textRefs.current,
      { y: 60, opacity: 0, rotateX: 90 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: "back.out(1.4)",
      },
      "-=0.3"
    );

    // Phase 3: Line expands
    tl.fromTo(
      lineRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.5, ease: "power3.out" },
      "-=0.2"
    );

    // Phase 4: Subtitle fades up
    tl.fromTo(
      subtitleRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.2"
    );

    // Phase 5: Hold for a moment, then exit
    tl.to({}, { duration: 0.8 });

    return () => tl.kill();
  }, [onComplete]);

  if (!isVisible) return null;

  const letters = "SAKOON".split("");

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow circles */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(62, 207, 180, 0.15) 0%, transparent 70%)",
          bottom: "20%",
          right: "30%",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Logo Icon */}
      <div
        ref={logoRef}
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: "linear-gradient(135deg, var(--bubble-user-from), var(--bubble-user-to))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
          boxShadow: "0 8px 40px var(--primary-glow)",
        }}
      >
        <span style={{ fontSize: 36, color: "white", fontFamily: "var(--font-display)", fontWeight: 800 }}>
          S
        </span>
      </div>

      {/* Letters */}
      <div style={{ display: "flex", gap: 4, perspective: 600, marginBottom: 16 }}>
        {letters.map((letter, i) => (
          <span
            key={i}
            ref={(el) => (textRefs.current[i] = el)}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 56,
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "0.08em",
              display: "inline-block",
              transformOrigin: "center bottom",
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      {/* Divider line */}
      <div
        ref={lineRef}
        style={{
          width: 64,
          height: 3,
          borderRadius: 2,
          background: "linear-gradient(90deg, var(--primary), var(--secondary))",
          marginBottom: 16,
          transformOrigin: "center",
        }}
      />

      {/* Subtitle */}
      <p
        ref={subtitleRef}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          color: "var(--text-secondary)",
          fontWeight: 500,
          letterSpacing: "0.04em",
        }}
      >
        Your private stress companion
      </p>
    </div>
  );
};

export default SplashScreen;
