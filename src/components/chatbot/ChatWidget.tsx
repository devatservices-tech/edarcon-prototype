"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headset, MessageCircle } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { ChatWindow } from "./ChatWindow";
import { cn } from "@/lib/utils";

const AUTO_OPEN_KEY = "edarcon_chat_autoopened";
const AUTO_OPEN_DELAY = 4000;
const CONTACT_PATH = "/contact";

const reduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ChatWidget() {
  const {
    isOpen,
    setIsOpen,
    unread,
    markRead,
    hasAutoOpened,
    teaser,
  } = useChat();

  const [showTeaser, setShowTeaser] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduledRef = useRef(false);

  useEffect(() => {
    if (scheduledRef.current) return;
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const isContact = pathname.includes(CONTACT_PATH);
    const alreadyOpened = hasAutoOpened();
    if (isContact || alreadyOpened) return;

    scheduledRef.current = true;
    timerRef.current = setTimeout(() => {
      setIsOpen(true);
      setShowTeaser(false);
      try {
        sessionStorage.setItem(AUTO_OPEN_KEY, "1");
      } catch {
        // ignore
      }
    }, AUTO_OPEN_DELAY);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [setIsOpen, hasAutoOpened]);

  // Lock body scroll when chat is open on mobile, restore on close
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleOpen = useCallback(() => {
    markRead();
    setIsOpen(true);
    setShowTeaser(false);
    if (launcherRef.current) launcherRef.current.focus();
  }, [markRead, setIsOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(AUTO_OPEN_KEY, "1");
    } catch {
      // ignore
    }
    setShowTeaser(true);
  }, [setIsOpen]);

  return (
    <div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.2 }}
            className="fixed inset-0 z-[59] bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      <button
        ref={launcherRef}
        onClick={handleOpen}
        aria-label="Open chat"
        aria-haspopup="dialog"
        className={cn(
          "fixed bottom-6 start-6 z-[60] w-14 h-14 rounded-full bg-[var(--brand-blue)] text-white flex items-center justify-center shadow-xl ring-2 ring-offset-2 ring-offset-background focus-visible:ring-ring focus-visible:ring-2",
          "transition-all hover:scale-105 active:scale-95"
        )}
      >
        <Headset className="w-7 h-7" />
        {unread > 0 && (
          <span className="absolute start-1 top-1 w-3 h-3 rounded-full bg-[var(--brand-orange)] ring-2 ring-offset-2 ring-offset-background" />
        )}
      </button>

      {showTeaser && !isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={reduced ? { duration: 0 } : { duration: 0.2 }}
          className="fixed bottom-[86px] start-6 z-[58] rounded-xl border border-border bg-background px-3 py-2 shadow-lg whitespace-nowrap"
        >
          <MessageCircle className="w-3 h-3 mr-2 text-[var(--brand-blue)]" />{" "}
          {teaser}
        </motion.div>
      )}

      <AnimatePresence>
        {isOpen && <ChatWindow />}
      </AnimatePresence>
    </div>
  );
}
