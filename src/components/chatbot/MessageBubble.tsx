"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export interface MessageBubbleProps {
  sender: "bot" | "user";
  text: string;
}

export function MessageBubble({ sender, text }: MessageBubbleProps) {
  const isUser = sender === "user";
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    setIsRtl(typeof document !== "undefined" && document.documentElement.dir === "rtl");
  }, []);

  // In RTL, user bubbles sit on the right (round top-left corner off),
  // bot bubbles sit on the left (round top-right corner off).
  const userRounded = isRtl ? "rounded-tl-none" : "rounded-tr-none";
  const botRounded = isRtl ? "rounded-tr-none" : "rounded-tl-none";

  return (
    <div
      className={cn(
        "w-full max-w-[85%] px-3 py-2",
        isUser ? "ms-auto text-end" : "me-auto text-start"
      )}
    >
      <div
        className={cn(
          "inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          isUser
            ? `bg-[var(--brand-blue)] text-white ${userRounded}`
            : `bg-muted/50 dark:bg-[var(--navy-light)]/50 text-foreground ${botRounded}`
        )}
      >
        {text}
      </div>
    </div>
  );
}
