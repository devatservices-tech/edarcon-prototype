import { useCallback, useEffect, useMemo, useRef, useState } from "react";import {
  CHAT_SERVICES,
  type ChatMessage,
  type ChatStep,
  type Lead,
  type ServiceConfig,
  matchService,
  normalizeText,
  STORAGE_KEY,
  TYPING_DELAY_MS,
  MAX_FAILS_BEFORE_SKIP,
  upsertLead,
} from "@/data/chatFlow";
import { cleanPhone } from "@/lib/chatValidation";
import {
  nameSchema,
  emailSchema,
  phoneSchema,
  detailsSchema,
} from "@/lib/chatValidation";
import { createPublicRFQ } from "@/lib/admin/rfq-public";

interface UseChatFlowProps {
  t: (
    key: string,
    opts?: Record<string, string | number>
  ) => string | string[] | undefined;
  locale: string;
}

export function useChatFlow({ t, locale }: UseChatFlowProps) {
  const SPLIT = "|||";
  const splitList = (val: string | string[] | undefined): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return val.split(SPLIT).filter(Boolean);
    return [];
  };

  const services = useMemo(
    () =>
      CHAT_SERVICES.map((svc) => ({
        ...svc,
        title: (t(`services.${svc.id}.title`) as string) || svc.id,
        highlights: splitList(t(`services.${svc.id}.highlights`)),
        keywordsEn: splitList(t(`services.${svc.id}.keywords.en`)),
        keywordsAr: splitList(t(`services.${svc.id}.keywords.ar`)),
      })),
    [t]
  );

  const [step, setStep] = useState<ChatStep>("greeting");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceConfig | null>(
    null
  );
  const [lead, setLead] = useState<Partial<Lead>>({});
  const [topicsViewed, setTopicsViewed] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [leadSaved, setLeadSaved] = useState(false);
  const [failCount, setFailCount] = useState(0);

  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRestoring = useRef(true);

  const inputType =
    step === "askEmail"
      ? "email"
      : step === "askPhone"
        ? "tel"
        : "text";
  const disabled = isTyping || step === "ended";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          step?: ChatStep;
          messages?: ChatMessage[];
          selectedServiceId?: string;
          lead?: Partial<Lead>;
          topicsViewed?: string[];
        };
        if (parsed.step) setStep(parsed.step);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.selectedServiceId) {
          setSelectedService(
            services.find((s) => s.id === parsed.selectedServiceId) ?? null
          );
        }
        if (parsed.lead) setLead(parsed.lead);
        if (parsed.topicsViewed) setTopicsViewed(parsed.topicsViewed);
      }
    } catch {
      // ignore corrupt storage
    }
    isRestoring.current = false;
  }, [services]);

  useEffect(() => {
    if (isRestoring.current || typeof window === "undefined") return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          step,
          messages,
          selectedServiceId: selectedService?.id,
          lead,
          topicsViewed,
        })
      );
    } catch {
      // ignore quota errors
    }
  }, [step, messages, selectedService, lead, topicsViewed]);

  // Clear typing timer on unmount to avoid state updates after unmount
  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  // Re-resolve selectedService title when translations change (language switch)
  useEffect(() => {
    if (selectedService) {
      const updated = services.find((s) => s.id === selectedService.id);
      if (updated && updated.title !== selectedService.title) {
        setSelectedService(updated);
      }
    }
  }, [services, selectedService]);

  const clearTyping = useCallback(() => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    setIsTyping(false);
  }, []);

  const addMessage = useCallback(
    (message: Omit<ChatMessage, "id" | "timestamp">) => {
      const next: ChatMessage = {
        ...message,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, next]);
      if (!isOpen) setUnread((n) => n + 1);
      return next;
    },
    [isOpen]
  );

  const markRead = useCallback(() => {
    setUnread(0);
  }, []);

  const reply = useCallback(
    (text: string, type: ChatMessage["type"] = "text", service?: ServiceConfig) => {
      clearTyping();
      setIsTyping(true);
      typingTimer.current = setTimeout(() => {
        setIsTyping(false);
        addMessage({ sender: "bot", text, type, service });
      }, TYPING_DELAY_MS);
    },
    [clearTyping, addMessage]
  );

  const showConfirmation = useCallback(() => {
    const name = lead.name;
    const svc = selectedService;
    if (!svc) return;
    clearTyping();
    setIsTyping(true);
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      const confirmationText =
        (t("confirmation", { name: name ?? "", service: svc.title }) as string) ||
        "";
      addMessage({ sender: "bot", text: confirmationText, type: "text" });
      addMessage({ sender: "bot", text: "", type: "serviceCard", service: svc });
      addMessage({ sender: "bot", text: "", type: "options" });
    }, TYPING_DELAY_MS);
  }, [clearTyping, addMessage, t, lead.name, selectedService]);

  const buildLeadRecord = useCallback((): Lead => {
    const svc = selectedService;
    if (!svc) {
      throw new Error("No service selected");
    }
    return {
      id: crypto.randomUUID(),
      name: lead.name ?? "",
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      service: svc.title,
      serviceSlug: svc.slug,
      details: lead.details ?? "",
      topicsViewed: [...topicsViewed],
      locale,
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      createdAt: new Date().toISOString(),
    };
  }, [lead, selectedService, topicsViewed, locale]);

  const persistLead = useCallback(async () => {
    if (
      step !== "confirmation" ||
      leadSaved ||
      !lead.name ||
      !lead.email ||
      !lead.phone ||
      !selectedService
    ) {
      return;
    }

    try {
      const leadRecord = buildLeadRecord();
      upsertLead(leadRecord);

      try {
        const isAr = locale === "ar";
        await createPublicRFQ({
          name: lead.name ?? "",
          email: lead.email ?? "",
          phone: lead.phone ?? "",
          company: "",
          service: selectedService?.title ?? "General Enquiry",
          source: "chatbot",
          language: (isAr ? "ar" : "en") as "en" | "ar",
          message: isAr
            ? { en: "", ar: lead.details ?? "" }
            : { en: lead.details ?? "", ar: "" },
        });
      } catch {
        // RFQ creation is best-effort; lead remains in localStorage.
      }
    } catch {
      // ignore
    }

    const payload = {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      service: selectedService.title,
      details: lead.details ?? "",
      locale,
      timestamp: new Date().toISOString(),
    };

    const body = JSON.stringify(payload);
    if (body.length <= 10 * 1024) {
      fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }).catch(() => {
        // fail silently; lead remains in localStorage
      });
    }

    setLeadSaved(true);
  }, [step, lead, selectedService, locale, leadSaved, buildLeadRecord, upsertLead]);

  useEffect(() => {
    persistLead();
  }, [persistLead]);

  const lastClickRef = useRef(0);

  const addTopic = useCallback((id: string) => {
    setTopicsViewed((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const selectService = useCallback(
    (id: string) => {
      const now = Date.now();
      if (now - lastClickRef.current < 300) return; // debounce rapid double-clicks
      lastClickRef.current = now;

      const svc = services.find((s) => s.id === id);
      if (!svc) return;
      addTopic(svc.id);
      setSelectedService(svc);
      setLeadSaved(false);
      addMessage({ sender: "user", text: svc.title, type: "text" });

      const hasContact = Boolean(
        lead.name && lead.email && lead.phone
      );
      if (hasContact) {
        setStep("askDetails");
        setFailCount(0);
        reply((t("askDetails") as string) || "");
      } else {
        setStep("askName");
        setFailCount(0);
        reply((t("askName") as string) || "");
      }
    },
    [services, lead, addMessage, reply, t, addTopic]
  );

  const sendMessage = useCallback(
    (text: string) => {
      if (disabled || !text.trim()) return;
      const trimmed = text.trim();

      if (normalizeText(trimmed) === "restart") {
        restart();
        return;
      }

      addMessage({ sender: "user", text: trimmed, type: "text" });

      switch (step) {
        case "greeting": {
          const svc = matchService(trimmed, services, locale);
          if (svc) {
            selectService(svc.id);
          } else {
            setFailCount((c) => c + 1);
            reply((t("noMatch") as string) || "");
          }
          break;
        }
        case "askName": {
          const parsed = nameSchema.safeParse(trimmed);
          if (!parsed.success) {
            setFailCount((c) => c + 1);
            reply(
              (t("validation.nameInvalid") as string) ||
                "Please enter a valid name."
            );
            break;
          }
          setLead((prev) => ({ ...prev, name: parsed.data }));
          setStep("askEmail");
          setFailCount(0);
          reply(
            (t("askEmail", { name: parsed.data }) as string) ||
              "Thank you. What is your email address?"
          );
          break;
        }
        case "askEmail": {
          const parsed = emailSchema.safeParse(trimmed);
          if (!parsed.success) {
            setFailCount((c) => c + 1);
            reply((t("emailInvalid") as string) || "");
            break;
          }
          setLead((prev) => ({ ...prev, email: parsed.data }));
          setStep("askPhone");
          setFailCount(0);
          reply((t("askPhone") as string) || "");
          break;
        }
        case "askPhone": {
          const parsed = phoneSchema.safeParse(trimmed);
          if (!parsed.success) {
            setFailCount((c) => c + 1);
            reply((t("phoneInvalid") as string) || "");
            break;
          }
          setLead((prev) => ({ ...prev, phone: cleanPhone(parsed.data) }));
          setStep("askDetails");
          setFailCount(0);
          reply((t("askDetails") as string) || "");
          break;
        }
        case "askDetails": {
          const parsed = detailsSchema.safeParse(trimmed);
          if (!parsed.success) {
            setFailCount((c) => c + 1);
            reply(
              (t("validation.detailsTooLong") as string) ||
                "Details are too long."
            );
            break;
          }
          setLead((prev) => ({ ...prev, details: parsed.data }));
          setStep("confirmation");
          setFailCount(0);
          showConfirmation();
          break;
        }
        default:
          break;
      }
    },
    [
      disabled,
      step,
      services,
      locale,
      t,
      selectService,
      nameSchema,
      emailSchema,
      phoneSchema,
      detailsSchema,
      showConfirmation,
      addMessage,
      reply,
      cleanPhone,
    ]
  );

  const skipDetails = useCallback(() => {
    if (step !== "askDetails") return;
    setLead((prev) => ({ ...prev, details: "" }));
    setStep("confirmation");
    setFailCount(0);
    showConfirmation();
  }, [step, showConfirmation]);

  const offerSkipForStep = useCallback((): boolean => {
    if (failCount < MAX_FAILS_BEFORE_SKIP) return false;
    return step === "askName" || step === "askEmail" || step === "askPhone" || step === "askDetails";
  }, [failCount, step]);

  const isCurrentStepOptional = useCallback((): boolean => {
    return step === "askDetails";
  }, [step]);

  const goToContact = useCallback(() => {
    if (typeof window !== "undefined" && selectedService) {
      window.location.href = `/contact?service=${encodeURIComponent(selectedService.slug)}`;
    }
  }, [selectedService]);

  const restart = useCallback(() => {
    clearTyping();
    setStep("greeting");
    setSelectedService(null);
    setLead({});
    setMessages([]);
    setTopicsViewed([]);
    setIsTyping(false);
    setLeadSaved(false);
    setFailCount(0);
    reply((t("greeting") as string) || "");
  }, [clearTyping, reply, t]);

  const endChat = useCallback(() => {
    clearTyping();
    setStep("ended");
    addMessage({
      sender: "bot",
      text: (t("endThankYou") as string) || "Thank you for chatting with Edarcon!",
      type: "text",
    });
  }, [clearTyping, addMessage, t]);

  useEffect(() => {
    if (isRestoring.current || messages.length > 0) return;
    reply((t("greeting") as string) || "");
  }, []);

  return {
    services,
    step,
    messages,
    isOpen,
    setIsOpen,
    markRead,
    selectedService,
    lead,
    isTyping,
    inputType,
    disabled,
    unread,
    leadSaved,
    failCount,
    offerSkipForStep,
    isCurrentStepOptional,
    goToContact,
    topicsViewed,
    selectService,
    sendMessage,
    skipDetails,
    restart,
    endChat,
  };
}
