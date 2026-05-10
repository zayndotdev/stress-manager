import React, { useRef, useEffect } from "react";
import { format } from "date-fns";
import gsap from "gsap";

const MessageBubble = React.memo(({ text, sender, timestamp, isNew = false }) => {
  const isUser = sender === "user";
  const ref = useRef(null);

  useEffect(() => {
    if (isNew && ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 14, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" }
      );
    }
  }, [isNew]);

  const time = timestamp ? format(new Date(timestamp), "h:mm a") : "";

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 12,
        opacity: isNew ? 0 : 1,
      }}
      role="listitem"
    >
      <div
        style={{
          maxWidth: "78%",
          padding: "12px 16px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          fontSize: 14,
          lineHeight: 1.6,
          position: "relative",
          ...(isUser
            ? {
                background: "linear-gradient(135deg, var(--bubble-user-from), var(--bubble-user-to))",
                color: "#FFFFFF",
                boxShadow: "0 2px 12px var(--primary-glow)",
              }
            : {
                background: "var(--bubble-bot-bg)",
                color: "var(--text-primary)",
                border: "1px solid var(--bubble-bot-border)",
              }),
        }}
      >
        <p style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{text}</p>
        {time && (
          <span
            style={{
              display: "block",
              fontSize: 10,
              marginTop: 6,
              textAlign: "right",
              opacity: 0.5,
              color: isUser ? "rgba(255,255,255,0.6)" : "var(--text-muted)",
            }}
            aria-label={`Sent at ${time}`}
          >
            {time}
          </span>
        )}
      </div>
    </div>
  );
});

export default MessageBubble;
