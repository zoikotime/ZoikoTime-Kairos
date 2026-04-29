import { create } from "zustand";
import {
  clearDraft,
  clearSession,
  loadDraft,
  loadPrefs,
  loadSession,
  saveDraft,
  savePrefs,
  saveSession,
} from "../services/desktop";

const defaultAssistantContext = {
  assistantName: "Koiris",
  productName: "ZoikoTime Desktop Application",
  assistantBadge: "AI WORK ASSISTANT",
  statusText: "Live knowledge base active",
  welcomeMessage:
    "Hey there! I'm Koiris, your ZoikoTime support assistant.\n\nI can help with attendance, activity tracking, screenshots, leave, pay, privacy, settings, and technical issues.\n\nWhat would you like help with today?",
  welcomeMessageHi:
    "Namaste! Main Koiris hoon, aapka ZoikoTime support assistant.\n\nMain attendance, activity tracking, screenshots, leave, pay, privacy, settings aur technical issues mein help kar sakta hoon.\n\nAaj main kis cheez mein help karun?",
  quickActions: [],
  defaultSuggestions: [],
  retentionHours: 24,
};

function getWelcomeContent(language, assistantContext = defaultAssistantContext) {
  return language === "hi"
    ? assistantContext.welcomeMessageHi || assistantContext.welcomeMessage
    : assistantContext.welcomeMessage;
}

function createWelcomeMessage(language, assistantContext = defaultAssistantContext) {
  return [
    {
      id: "welcome",
      role: "assistant",
      content: getWelcomeContent(language, assistantContext),
      timestamp: new Date().toISOString(),
    },
  ];
}

export const useStore = create((set, get) => ({
  user: null,
  sessionId: null,
  expiresAt: null,
  assistantContext: defaultAssistantContext,
  sessions: [],
  onboardingDraft: loadDraft(),
  messages: createWelcomeMessage("en", defaultAssistantContext),
  loading: false,
  hydrated: false,
  language: "en",
  theme: "dark",
  historyOpen: false,
  setLoading: (loading) => set({ loading }),
  setAssistantContext: (assistantContext) =>
    set((state) => ({
      assistantContext,
      messages:
        state.messages.length === 1 && state.messages[0].id === "welcome"
          ? createWelcomeMessage(state.language, assistantContext)
          : state.messages,
    })),
  setSessions: (sessions) => set({ sessions }),
  setSessionId: async (sessionId, expiresAt = null) => {
    const current = get();
    if (current.user) {
      await saveSession({
        user: current.user,
        sessionId,
        expiresAt: expiresAt || current.expiresAt,
      });
    }
    set({ sessionId, expiresAt: expiresAt || current.expiresAt });
  },
  setUserSession: async (payload) => {
    await saveSession(payload);
    saveDraft(payload.user);
    set({
      user: payload.user,
      sessionId: payload.sessionId,
      expiresAt: payload.expiresAt || null,
      onboardingDraft: payload.user,
      messages: createWelcomeMessage(get().language, get().assistantContext),
      hydrated: true,
    });
  },
  hydrateSession: async () => {
    if (get().hydrated) return;
    const session = await loadSession();
    const prefs = loadPrefs();
    const language = prefs?.language || "en";

    if (!session) {
      set({
        hydrated: true,
        language,
        theme: prefs?.theme || "dark",
        onboardingDraft: loadDraft(),
        messages: createWelcomeMessage(language, get().assistantContext),
      });
      return;
    }

    set({
      user: session.user,
      sessionId: session.sessionId,
      expiresAt: session.expiresAt || null,
      language,
      theme: prefs?.theme || "dark",
      onboardingDraft: loadDraft() || session.user,
      hydrated: true,
      messages: createWelcomeMessage(language, get().assistantContext),
    });
  },
  appendMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  replaceMessages: (messages) => set({ messages }),
  setLanguage: (language) => {
    savePrefs({
      language,
      theme: get().theme,
    });
    set((state) => ({
      language,
      messages:
        state.messages.length === 1 && state.messages[0].id === "welcome"
          ? createWelcomeMessage(language, state.assistantContext)
          : state.messages,
    }));
  },
  toggleTheme: () => {
    const nextTheme = get().theme === "dark" ? "light" : "dark";
    savePrefs({
      language: get().language,
      theme: nextTheme,
    });
    set({ theme: nextTheme });
  },
  saveOnboardingDraft: (draft) => {
    saveDraft(draft);
    set({ onboardingDraft: draft });
  },
  clearOnboardingDraft: () => {
    clearDraft();
    set({ onboardingDraft: null });
  },
  toggleHistory: () => set((state) => ({ historyOpen: !state.historyOpen })),
  closeHistory: () => set({ historyOpen: false }),
  logout: async () => {
    if (get().user) {
      saveDraft(get().user);
    }
    await clearSession();
    set({
      user: null,
      sessionId: null,
      expiresAt: null,
      messages: createWelcomeMessage(get().language, get().assistantContext),
      hydrated: true,
    });
  },
}));
