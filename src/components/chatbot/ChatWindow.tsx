"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, RefreshCw, Send } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useChat } from "@/context/ChatContext";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { QuickReplies } from "./QuickReplies";
import { ServiceCard } from "./ServiceCard";
import { cn } from "@/lib/utils";
import { useAdminData, usePublished, useOrdered, useTranslatable } from "@/lib/admin/data-provider";

const reduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ChatWindow() {
  const t = useTranslations("chatbot");
  const {
    step,
    messages,
    setIsOpen,
    selectedService,
    lead,
    isTyping,
    inputType,
    disabled,
    selectService,
    sendMessage,
    skipDetails,
    restart,
    offerSkipForStep,
    isCurrentStepOptional,
    goToContact,
    isRtl,
  } = useChat();
  const { services, loading } = useAdminData();

  const published = usePublished(services ?? []);
  const ordered = useOrdered(published);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [userScrolled, setUserScrolled] = useState(false);

  // Input direction: email/tel always LTR, free text follows UI direction
  const inputDir =
    inputType === "email" || inputType === "tel" ? "ltr" : isRtl ? "rtl" : "ltr";

  useEffect(() => {
    if (userScrolled) return;
    const end = document.getElementById("chat-scroll-anchor");
    const container = containerRef.current;
    if (!end || !container) return;
    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    if (nearBottom || messages.length === 0) {
      end.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isTyping, userScrolled]);

  const onScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setUserScrolled(!nearBottom);
  };

  const handleSend = () => {
    if (!inputValue.trim() || disabled) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const optionButtons = selectedService
    ? [
        { labelKey: "downloadPdf", action: "pdf" },
        { labelKey: "downloadCatalog", action: "catalog" },
        { labelKey: "talkWhatsApp", action: "whatsapp" },
        { labelKey: "requestQuote", action: "quote" },
      ]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={reduced ? { duration: 0 } : { duration: 0.2 }}
      ref={containerRef}
      className={cn(
        "fixed z-[60] flex flex-col border border-border bg-background shadow-2xl",
        // mobile: full-screen sheet
        "inset-0 rounded-none sm:inset-auto",
        // desktop: floating card
        "sm:bottom-6 sm:start-6 sm:w-[380px] sm:h-[560px] sm:rounded-2xl sm:border"
      )}
    >
      <div className={cn(
        "flex-shrink-0 bg-[var(--brand-blue)]/90 p-4 backdrop-blur-md",
        // only bottom border + top rounding on desktop
        "sm:border-b sm:border-border/30 sm:rounded-t-2xl"
      )}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo_mark.png"
            alt="Edarcon logo"
            width={28}
            height={28}
            className="rounded-md"
            priority
          />
          <div className="flex flex-col leading-tight">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-white">{t("title")}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-ping" />
            </div>
            <span className="text-[10px] text-white/80">{t("online")}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            onClick={restart}
            aria-label="Restart chat"
            className={cn(
              "w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors",
              isRtl ? "rotate-180" : ""
            )}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
            className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto p-3 space-y-3 sm:p-4",
          "pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
        )}
        onScroll={onScroll}
        aria-live="polite"
        aria-label="Chat messages"
      >
        <div id="chat-scroll-anchor" />
        {messages.map((msg) => {
          if (msg.type === "text") {
            return (
              <MessageBubble
                key={msg.id}
                sender={msg.sender}
                text={msg.text}
              />
            );
          }
          if (msg.type === "serviceCard" && msg.service) {
            const svc = msg.service;
            return (
              <div key={msg.id} className="w-full">
                <ServiceCard
                  service={svc}
                  onDownloadPdf={() => {
                    if (typeof window !== "undefined")
                      window.open(svc.pdf, "_blank");
                  }}
                  onDownloadCatalog={() => {
                    if (typeof window !== "undefined")
                      window.open("/pdf/FI40 Flange Facing Machine 2023.pdf", "_blank");
                  }}
                  onWhatsApp={() => {
                    const name = lead.name ?? "";
                    const text = `Hello Edarcon, I'm ${name} and I'm interested in ${svc.title}.`;
                    if (typeof window !== "undefined") {
                      window.open(
                        `https://wa.me/966559021988?text=${encodeURIComponent(text)}`,
                        "_blank"
                      );
                    }
                  }}
                  onQuote={() => {
                    if (typeof window !== "undefined") {
                      window.location.href = `/contact?service=${encodeURIComponent(svc.title)}`;
                    }
                  }}
                />
              </div>
            );
          }
          if (msg.type === "options") {
            return (
              <div key={msg.id} className="w-full flex flex-wrap gap-2">
                {optionButtons.map((item) => {
                  const handle = () => {
                    if (item.action === "pdf" && selectedService) {
                      if (typeof window !== "undefined")
                        window.open(selectedService.pdf, "_blank");
                    } else if (item.action === "catalog") {
                      if (typeof window !== "undefined")
                        window.open("/pdf/FI40 Flange Facing Machine 2023.pdf", "_blank");
                    } else if (item.action === "whatsapp") {
                      const name = lead.name ?? "";
                      const svc = selectedService?.title ?? "";
                      const text = `Hello Edarcon, I'm ${name} and I'm interested in ${svc}.`;
                      if (typeof window !== "undefined") {
                        window.open(
                          `https://wa.me/966559021988?text=${encodeURIComponent(text)}`,
                          "_blank"
                        );
                      }
                    } else if (item.action === "quote" && selectedService) {
                      if (typeof window !== "undefined") {
                        window.location.href = `/contact?service=${encodeURIComponent(selectedService.title)}`;
                      }
                    }
                  };
  const inputDir =
    inputType === "email" || inputType === "tel" ? "ltr" : isRtl ? "rtl" : "ltr";

  return (
                    <button
                      key={item.action}
                      onClick={handle}
                      className="px-4 py-2 rounded-xl border border-[var(--brand-orange)]/50 bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] text-sm font-medium hover:bg-[var(--brand-orange)]/20 active:scale-95 transition-all"
                    >
                      {t(item.labelKey)}
                    </button>
                  );
                })}
              </div>
            );
          }
          return null;
        })}
        {isTyping && (
          <div className="w-full">
            <TypingIndicator />
          </div>
        )}
      </div>

      <div className={cn(
        "flex-shrink-0 border-t border-border/30 p-3 bg-background/80 backdrop-blur",
        "sm:border-t sm:p-3",
        "pb-[env(safe-area-inset-bottom)] px-[env(safe-area-inset-left)] px-[env(safe-area-inset-right)]"
      )}
      >
        <div className="flex items-end gap-2">
          <input
            ref={inputRef}
            dir={inputDir}
            type={inputType}
            inputMode={
              inputType === "email"
                ? "email"
                : inputType === "tel"
                  ? "tel"
                  : "text"
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              inputType === "email"
                ? "name@company.com"
                : inputType === "tel"
                  ? "+966 55 902 1988"
                  : "Type a message…"
            }
            className={cn(
              "flex-1 rounded-xl border border-input px-3.5 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring",
              disabled ? "bg-muted/50 cursor-not-allowed" : ""
            )}
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={disabled || !inputValue.trim()}
            aria-label="Send message"
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-bold transition-all active:scale-95",
              isRtl ? "rotate-180" : "",
              disabled || !inputValue.trim()
                ? "bg-muted/40 text-muted-foreground cursor-not-allowed"
                : "bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue-dark)]"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {step === "greeting" && (
          <QuickReplies
            items={ordered.map((svc) => ({
              label: svc.name.en,
              value: svc.slug,
            }))}
            onSelect={(value) => selectService(value)}
            disabled={disabled}
          />
        )}
        {offerSkipForStep() ? (
          <div className="mt-2 flex gap-2 justify-end">
            {isCurrentStepOptional() ? (
              <button
                onClick={skipDetails}
                aria-label="Skip details"
                className="text-xs text-[var(--brand-blue)] underline underline-offset-2 hover:text-[var(--brand-blue-dark)]"
              >
                {t("skip")}
              </button>
            ) : (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  goToContact();
                }}
                aria-label="Contact us instead"
                className="text-xs text-[var(--brand-orange)] underline underline-offset-2 hover:text-[var(--brand-orange-dark)]"
              >
                {t("contactInstead")}
              </a>
            )}
          </div>
        ) : step === "askDetails" ? (
          <div className="mt-2 flex justify-end">
            <button
              onClick={skipDetails}
              aria-label="Skip details"
              className="text-xs text-[var(--brand-blue)] underline underline-offset-2 hover:text-[var(--brand-blue-dark)]"
            >
              {t("skip")}
            </button>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
