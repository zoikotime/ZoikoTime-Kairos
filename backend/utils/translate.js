// translator.js
// Place this in: backend/utils/translator.js  (or wherever your utils live)
// No npm install needed — uses native fetch (Node 18+)
// Node 16 or below? Run: npm install node-fetch
//   then add at top: const fetch = require('node-fetch');

// ─── CONFIG ───────────────────────────────────────────────
const LINGVA_INSTANCES = [
  "https://lingva.ml",
  "https://translate.igna.wtf",
  "https://translate.plausibility.cloud",
];

const MYMEMORY_EMAIL = "your@email.com"; // free 50K chars/day fallback
const TIMEOUT_MS     = 5000;
const MAX_CHUNK      = 900;

// ─── MAIN EXPORT — use this everywhere ────────────────────
async function translateToEnglish(text) {
  if (!text || !text.trim()) return { translated: text, lang: "unknown" };

  const clean = text.trim();
  const chunks = splitIntoChunks(clean, MAX_CHUNK);

  try {
    const results = await Promise.all(chunks.map(c => lingva(c)));
    const combinedTranslation = results.map(r => r.translated).join(" ").trim();
    const detectedLanguage = resolveLanguageName(
      results[0].lang,
      clean,
      combinedTranslation,
    );
    const skipped =
      detectedLanguage.toLowerCase() === "english" ||
      normalizeForCompare(combinedTranslation) === normalizeForCompare(clean);

    return {
      translated: combinedTranslation || clean,
      lang: detectedLanguage,
      source: "lingva",
      skipped,
    };
  } catch {
    try {
      const results = await Promise.all(chunks.map(c => myMemory(c)));
      const combinedTranslation = results.map(r => r.translated).join(" ").trim();
      const detectedLanguage = resolveLanguageName(
        results[0].lang,
        clean,
        combinedTranslation,
      );
      const skipped =
        detectedLanguage.toLowerCase() === "english" ||
        normalizeForCompare(combinedTranslation) === normalizeForCompare(clean);

      return {
        translated: combinedTranslation || clean,
        lang: detectedLanguage,
        source: "mymemory",
        skipped,
      };
    } catch (err) {
      console.error("[translator] both APIs failed:", err.message);
      return { translated: clean, lang: "unknown", error: err.message };
    }
  }
}

// ─── USE CASE 1: Support Email ─────────────────────────────
async function processSupportEmail(rawEmailBody) {
  const result = await translateToEnglish(rawEmailBody);
  return {
    originalBody:  rawEmailBody,
    englishBody:   result.translated,
    sourceLang:    result.lang,
    wasTranslated: !result.skipped,
  };
}

// ─── USE CASE 2: Prompt dedup before Supabase insert ──────
async function normalizePrompt(rawPrompt) {
  const result = await translateToEnglish(rawPrompt);
  return {
    originalText:   rawPrompt,
    normalizedText: result.translated.trim().toLowerCase(),
    originalLang:   result.lang,
  };
}

async function translateTranscriptMessages(messages = []) {
  return Promise.all(
    messages.map(async (message) => {
      if (message.role !== "user") {
        return {
          ...message,
          translatedContent: message.content || "",
          detectedLanguage: "English",
          wasTranslated: false,
        };
      }

      const translation = await processSupportEmail(message.content || "");
      return {
        ...message,
        translatedContent: translation.englishBody || message.content || "",
        detectedLanguage: translation.sourceLang || "unknown",
        wasTranslated: Boolean(translation.wasTranslated),
      };
    }),
  );
}

// ─── INTERNAL: Lingva ─────────────────────────────────────
async function lingva(text) {
  const encoded = encodeURIComponent(text);
  for (const base of LINGVA_INSTANCES) {
    try {
      const res  = await fetchWithTimeout(`${base}/api/v1/auto/en/${encoded}`, TIMEOUT_MS);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.error) continue;
      return {
        translated: data.translation,
        lang: data.info?.detectedLanguage?.name || "unknown",
      };
    } catch { continue; }
  }
  throw new Error("All Lingva instances failed");
}

// ─── INTERNAL: MyMemory fallback ──────────────────────────
async function myMemory(text) {
  const url  = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|en&de=${MYMEMORY_EMAIL}`;
  const res  = await fetchWithTimeout(url, TIMEOUT_MS);
  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error(data.responseDetails);
  const detectedLanguage =
    data.responseData?.detectedLanguage ||
    data.matches?.find((item) => item?.segment)?.source ||
    data.matches?.[0]?.source ||
    "unknown";
  return {
    translated: data.responseData.translatedText,
    lang: detectedLanguage,
  };
}

// ─── INTERNAL: split long text ────────────────────────────
function splitIntoChunks(text, maxLen) {
  if (text.length <= maxLen) return [text];
  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
  const chunks = [];
  let current  = "";
  for (const s of sentences) {
    if ((current + s).length > maxLen && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function normalizeForCompare(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveLanguageName(rawLanguage, originalText = "", translatedText = "") {
  const normalized = normalizeLanguageLabel(rawLanguage);
  if (normalized !== "unknown") return normalized;

  if (normalizeForCompare(originalText) === normalizeForCompare(translatedText)) {
    return "English";
  }

  return guessLanguageFromText(originalText);
}

function normalizeLanguageLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "unknown";

  const lowered = raw.toLowerCase();
  const mapping = {
    en: "English",
    eng: "English",
    english: "English",
    es: "Spanish",
    spa: "Spanish",
    spanish: "Spanish",
    hi: "Hindi",
    hin: "Hindi",
    hindi: "Hindi",
    fr: "French",
    fre: "French",
    fra: "French",
    french: "French",
    de: "German",
    deu: "German",
    ger: "German",
    german: "German",
    it: "Italian",
    ita: "Italian",
    italian: "Italian",
    pt: "Portuguese",
    por: "Portuguese",
    portuguese: "Portuguese",
  };

  return mapping[lowered] || toTitleCase(raw);
}

function guessLanguageFromText(value = "") {
  const text = ` ${normalizeForCompare(value)} `;
  const languagePatterns = [
    { name: "Telugu", pattern: /[\u0C00-\u0C7F]/u },
    { name: "Tamil", pattern: /[\u0B80-\u0BFF]/u },
    { name: "Kannada", pattern: /[\u0C80-\u0CFF]/u },
    { name: "Malayalam", pattern: /[\u0D00-\u0D7F]/u },
    { name: "Bengali", pattern: /[\u0980-\u09FF]/u },
    { name: "Gujarati", pattern: /[\u0A80-\u0AFF]/u },
    { name: "Punjabi", pattern: /[\u0A00-\u0A7F]/u },
    { name: "Marathi", pattern: /[\u0900-\u097F]/u },
    { name: "Hindi", pattern: /[\u0900-\u097f]/u },
    { name: "Spanish", pattern: /\b(el|la|los|las|pero|hola|gracias|vida|oportunidades|correo|problema)\b/ },
    { name: "French", pattern: /\b(le|la|les|bonjour|merci|probleme|courriel|vous|est)\b/ },
    { name: "Portuguese", pattern: /\b(ola|obrigado|voce|problema|email|nao|para|com)\b/ },
    { name: "German", pattern: /\b(und|hallo|danke|problem|ich|nicht|bitte|ist)\b/ },
    { name: "Italian", pattern: /\b(ciao|grazie|problema|email|non|perche|ciao|sono)\b/ },
  ];

  for (const language of languagePatterns) {
    if (language.pattern.test(text) || language.pattern.test(value)) {
      return language.name;
    }
  }

  return "Unknown";
}

function toTitleCase(value = "") {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

// ─── INTERNAL: fetch with timeout ─────────────────────────
function fetchWithTimeout(url, ms) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

module.exports = {
  translateToEnglish,
  processSupportEmail,
  normalizePrompt,
  translateTranscriptMessages,
  detectLanguageFromText: guessLanguageFromText,
};
