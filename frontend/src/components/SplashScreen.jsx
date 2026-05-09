import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const SplashScreen = ({ onComplete }) => {
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const titleTextRef = useRef([]);
  const sakoonTextRef = useRef([]);
  const subtitleRef = useRef(null);
  const lineRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Advanced Cinematic GSAP Timeline
    const tl = gsap.timeline({
      onComplete: () => {
        // Stage 4: The Reveal (Curtain opening effect)
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 1.1, // Slight push forward
          duration: 0.8,
          ease: "power3.inOut",
          onComplete: () => {
            setIsVisible(false);
            onComplete();
          },
        });
      },
    });

    // Stage 1: The Hook (Logo pulse and glow)
    tl.fromTo(
      logoRef.current,
      { scale: 0, opacity: 0, rotateZ: -30, filter: "blur(10px)" },
      { scale: 1, opacity: 1, rotateZ: 0, filter: "blur(0px)", duration: 1.2, ease: "elastic.out(1, 0.5)" }
    );

    // Subtle floating effect on the logo while the rest animates
    gsap.to(logoRef.current, {
      y: -10,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    // Stage 2: The Greeting ("Welcome to")
    tl.fromTo(
      titleTextRef.current,
      { y: 30, opacity: 0, filter: "blur(8px)", rotateX: -90 },
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        rotateX: 0,
        stagger: 0.05,
        duration: 0.8,
        ease: "back.out(1.7)",
      },
      "-=0.6"
    );

    // "Sakoon" Stagger
    tl.fromTo(
      sakoonTextRef.current,
      { y: 50, opacity: 0, filter: "blur(12px)", rotateX: 90, scale: 0.8 },
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        rotateX: 0,
        scale: 1,
        stagger: 0.08,
        duration: 0.8,
        ease: "expo.out",
      },
      "-=0.4"
    );

    // Stage 3: The Line & Subtitle
    tl.fromTo(
      lineRef.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.8, ease: "power4.out" },
      "-=0.4"
    );

    tl.fromTo(
      subtitleRef.current,
      { y: 20, opacity: 0, letterSpacing: "0em" },
      { y: 0, opacity: 1, letterSpacing: "0.08em", duration: 1, ease: "power2.out" },
      "-=0.6"
    );

    // Hold the majesty for a second
    tl.to({}, { duration: 1.2 });

    return () => {
      tl.kill();
      gsap.killTweensOf(logoRef.current);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  const welcomeLetters = "Welcome to".split(" ");
  const sakoonLetters = "SAKOON".split("");

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
        perspective: 1000, // Important for the 3D text effects
      }}
    >
      {/* Cinematic Ambient Glow */}
      <div
        style={{
          position: "absolute",
          width: "80vw",
          height: "80vh",
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 60%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(120px)",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "60vw",
          height: "60vh",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(62, 207, 180, 0.1) 0%, transparent 60%)",
          bottom: "10%",
          right: "10%",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* Logo Container */}
      <div
        ref={logoRef}
        style={{
          width: 90,
          height: 90,
          borderRadius: 24,
          background: "linear-gradient(135deg, var(--bubble-user-from), var(--bubble-user-to))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 40,
          boxShadow: "0 12px 50px var(--primary-glow), inset 0 2px 4px rgba(255,255,255,0.4)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <span style={{ fontSize: 42, color: "white", fontFamily: "var(--font-display)", fontWeight: 800, textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
          S
        </span>
      </div>

      {/* Welcome To */}
      <div style={{ display: "flex", gap: 12, marginBottom: 8, perspective: 800 }}>
        {welcomeLetters.map((word, i) => (
          <span
            key={i}
            ref={(el) => (titleTextRef.current[i] = el)}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 32,
              fontWeight: 400,
              color: "var(--text-secondary)",
              display: "inline-block",
              transformOrigin: "center bottom",
              fontStyle: "italic",
            }}
          >
            {word}
          </span>
        ))}
      </div>

      {/* SAKOON */}
      <div style={{ display: "flex", gap: 4, perspective: 800, marginBottom: 24 }}>
        {sakoonLetters.map((letter, i) => (
          <span
            key={i}
            ref={(el) => (sakoonTextRef.current[i] = el)}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 72,
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "0.1em",
              display: "inline-block",
              transformOrigin: "center center",
              textShadow: "0 4px 20px rgba(0,0,0,0.1)",
              background: "linear-gradient(180deg, var(--text-primary) 0%, var(--text-secondary) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
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
          width: 120,
          height: 2,
          borderRadius: 2,
          background: "linear-gradient(90deg, transparent, var(--primary), var(--secondary), transparent)",
          marginBottom: 24,
          transformOrigin: "center",
        }}
      />

      {/* Subtitle */}
      <p
        ref={subtitleRef}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 16,
          color: "var(--text-muted)",
          fontWeight: 500,
          textTransform: "uppercase",
        }}
      >
        Your private stress companion
      </p>
    </div>
  );
};

export default SplashScreen;
