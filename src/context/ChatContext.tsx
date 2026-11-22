"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useChatFlow } from "@/hooks/useChatFlow";
import { useTranslations } from "next-intl";
import type { ChatMessage, ChatStep, ServiceConfig } from "@/data/chatFlow";

interface ChatContextType {
  step: ChatStep;
  messages: ChatMessage[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  markRead: () => void;
  selectedService: ServiceConfig | null;
  lead: { name?: string; email?: string; phone?: string; details?: string };
  isTyping: boolean;
  inputType: "text" | "email" | "tel";
  disabled: boolean;
  unread: number;
  leadSaved: boolean;
  selectService: (id: string) => void;
  sendMessage: (text: string) => void;
  skipDetails: () => void;
  restart: () => void;
  endChat: () => void;
  autoOpenEligible: () => void;
  hasAutoOpened: () => boolean;
  offerSkipForStep: () => boolean;
  isCurrentStepOptional: () => boolean;
  goToContact: () => void;
  isRtl: boolean;
  teaser: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = "edarcon_chat_autoopened";

export function ChatProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const t = useTranslations("chatbot");
  const [mounted, setMounted] = useState(false);

  const flow = useChatFlow({ t, locale });

  useEffect(() => {
    setMounted(true);
  }, []);

  const value: ChatContextType = {
    ...flow,
    inputType: flow.inputType as "text" | "email" | "tel",
    autoOpenEligible: () => {
      if (typeof window === "undefined") return;
      sessionStorage.removeItem(STORAGE_KEY);
    },
    hasAutoOpened: () => {
      if (typeof window === "undefined") return false;
      return sessionStorage.getItem(STORAGE_KEY) === "1";
    },
    isRtl: locale === "ar",
    teaser: t("teaser"),
  };

  if (!mounted) {
    return null;
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return ctx;
}
