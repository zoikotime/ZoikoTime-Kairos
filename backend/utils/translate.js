// translate.js
// Handles: user → English (for support) + stores originalLang code
// So support can reply back in the user's language

const LINGVA_INSTANCES = [
  "https://lingva.ml",
  "https://translate.igna.wtf",
  "https://translate.plausibility.cloud",
];

const MYMEMORY_EMAIL = "your@email.com";
const TIMEOUT_MS = 5000;
const MAX_CHUNK = 900;

// ─── LANGUAGE MAP: name → code ────────────────────────────────────────────────
const LANG_NAME_TO_CODE = {
  afrikaans: "af",
  albanian: "sq",
  amharic: "am",
  arabic: "ar",
  armenian: "hy",
  azerbaijani: "az",
  basque: "eu",
  belarusian: "be",
  bengali: "bn",
  bosnian: "bs",
  bulgarian: "bg",
  catalan: "ca",
  "chinese (simplified)": "zh-cn",
  "chinese (traditional)": "zh-tw",
  chinese: "zh",
  croatian: "hr",
  czech: "cs",
  danish: "da",
  dutch: "nl",
  english: "en",
  estonian: "et",
  finnish: "fi",
  french: "fr",
  galician: "gl",
  georgian: "ka",
  german: "de",
  greek: "el",
  gujarati: "gu",
  "haitian creole": "ht",
  hausa: "ha",
  hebrew: "he",
  hindi: "hi",
  hungarian: "hu",
  icelandic: "is",
  igbo: "ig",
  indonesian: "id",
  irish: "ga",
  italian: "it",
  japanese: "ja",
  kannada: "kn",
  kazakh: "kk",
  khmer: "km",
  korean: "ko",
  kurdish: "ku",
  kyrgyz: "ky",
  lao: "lo",
  latvian: "lv",
  lithuanian: "lt",
  luxembourgish: "lb",
  macedonian: "mk",
  malagasy: "mg",
  malay: "ms",
  malayalam: "ml",
  maltese: "mt",
  maori: "mi",
  marathi: "mr",
  mongolian: "mn",
  "myanmar (burmese)": "my",
  burmese: "my",
  nepali: "ne",
  norwegian: "no",
  pashto: "ps",
  persian: "fa",
  polish: "pl",
  portuguese: "pt",
  punjabi: "pa",
  romanian: "ro",
  russian: "ru",
  samoan: "sm",
  serbian: "sr",
  sinhala: "si",
  slovak: "sk",
  slovenian: "sl",
  somali: "so",
  spanish: "es",
  sundanese: "su",
  swahili: "sw",
  swedish: "sv",
  "tagalog (filipino)": "tl",
  tagalog: "tl",
  filipino: "tl",
  tajik: "tg",
  tamil: "ta",
  tatar: "tt",
  telugu: "te",
  thai: "th",
  turkish: "tr",
  turkmen: "tk",
  ukrainian: "uk",
  urdu: "ur",
  uyghur: "ug",
  uzbek: "uz",
  vietnamese: "vi",
  welsh: "cy",
  xhosa: "xh",
  yiddish: "yi",
  yoruba: "yo",
  zulu: "zu",
};

// ─── SPLIT TEXT INTO CHUNKS ───────────────────────────────────────────────────
function splitIntoChunks(text, maxLen) {
  if (text.length <= maxLen) return [text];
  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
  const chunks = [];
  let current = "";
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

// ─── NORMALIZE TEXT FOR COMPARISON ───────────────────────────────────────────
function normalizeForCompare(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── TITLE CASE ───────────────────────────────────────────────────────────────
function toTitleCase(value = "") {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

// ─── IS LIKELY ENGLISH ────────────────────────────────────────────────────────
function isLikelyEnglishText(value = "") {
  const clean = String(value || "").trim();
  if (!clean) return false;
  const nonAscii = (clean.match(/[^\x00-\x7F]/g) || []).length;
  const asciiRatio = 1 - nonAscii / clean.length;
  return asciiRatio > 0.95;
}

// ─── FETCH WITH TIMEOUT ───────────────────────────────────────────────────────
function fetchWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

// ─── NORMALIZE LANGUAGE LABEL ─────────────────────────────────────────────────
function normalizeLanguageLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "unknown";

  const lowered = raw.toLowerCase();
  const mapping = {
    af: "Afrikaans",
    afr: "Afrikaans",
    afrikaans: "Afrikaans",
    sq: "Albanian",
    alb: "Albanian",
    sqi: "Albanian",
    albanian: "Albanian",
    am: "Amharic",
    amh: "Amharic",
    amharic: "Amharic",
    en: "English",
    eng: "English",
    english: "English",
    ar: "Arabic",
    ara: "Arabic",
    arabic: "Arabic",
    hy: "Armenian",
    arm: "Armenian",
    hye: "Armenian",
    armenian: "Armenian",
    az: "Azerbaijani",
    aze: "Azerbaijani",
    azerbaijani: "Azerbaijani",
    eu: "Basque",
    eus: "Basque",
    baq: "Basque",
    basque: "Basque",
    be: "Belarusian",
    bel: "Belarusian",
    belarusian: "Belarusian",
    bn: "Bengali",
    ben: "Bengali",
    bengali: "Bengali",
    bs: "Bosnian",
    bos: "Bosnian",
    bosnian: "Bosnian",
    bg: "Bulgarian",
    bul: "Bulgarian",
    bulgarian: "Bulgarian",
    ca: "Catalan",
    cat: "Catalan",
    catalan: "Catalan",
    "zh-cn": "Chinese (Simplified)",
    "zh-hans": "Chinese (Simplified)",
    "zh-tw": "Chinese (Traditional)",
    "zh-hant": "Chinese (Traditional)",
    zh: "Chinese",
    zho: "Chinese",
    chi: "Chinese",
    chinese: "Chinese",
    hr: "Croatian",
    hrv: "Croatian",
    croatian: "Croatian",
    cs: "Czech",
    ces: "Czech",
    cze: "Czech",
    czech: "Czech",
    da: "Danish",
    dan: "Danish",
    danish: "Danish",
    nl: "Dutch",
    nld: "Dutch",
    dut: "Dutch",
    dutch: "Dutch",
    et: "Estonian",
    est: "Estonian",
    estonian: "Estonian",
    fi: "Finnish",
    fin: "Finnish",
    finnish: "Finnish",
    fr: "French",
    fre: "French",
    fra: "French",
    french: "French",
    gl: "Galician",
    glg: "Galician",
    galician: "Galician",
    ka: "Georgian",
    kat: "Georgian",
    geo: "Georgian",
    georgian: "Georgian",
    de: "German",
    deu: "German",
    ger: "German",
    german: "German",
    el: "Greek",
    ell: "Greek",
    gre: "Greek",
    greek: "Greek",
    gu: "Gujarati",
    guj: "Gujarati",
    gujarati: "Gujarati",
    ht: "Haitian Creole",
    hat: "Haitian Creole",
    "haitian creole": "Haitian Creole",
    ha: "Hausa",
    hau: "Hausa",
    hausa: "Hausa",
    he: "Hebrew",
    heb: "Hebrew",
    iw: "Hebrew",
    hebrew: "Hebrew",
    hi: "Hindi",
    hin: "Hindi",
    hindi: "Hindi",
    hu: "Hungarian",
    hun: "Hungarian",
    hungarian: "Hungarian",
    is: "Icelandic",
    isl: "Icelandic",
    ice: "Icelandic",
    icelandic: "Icelandic",
    ig: "Igbo",
    ibo: "Igbo",
    igbo: "Igbo",
    id: "Indonesian",
    ind: "Indonesian",
    indonesian: "Indonesian",
    ga: "Irish",
    gle: "Irish",
    irish: "Irish",
    it: "Italian",
    ita: "Italian",
    italian: "Italian",
    ja: "Japanese",
    jpn: "Japanese",
    japanese: "Japanese",
    kn: "Kannada",
    kan: "Kannada",
    kannada: "Kannada",
    kk: "Kazakh",
    kaz: "Kazakh",
    kazakh: "Kazakh",
    km: "Khmer",
    khm: "Khmer",
    khmer: "Khmer",
    ko: "Korean",
    kor: "Korean",
    korean: "Korean",
    ku: "Kurdish",
    kur: "Kurdish",
    kurdish: "Kurdish",
    ky: "Kyrgyz",
    kir: "Kyrgyz",
    kyrgyz: "Kyrgyz",
    lo: "Lao",
    lao: "Lao",
    lv: "Latvian",
    lav: "Latvian",
    latvian: "Latvian",
    lt: "Lithuanian",
    lit: "Lithuanian",
    lithuanian: "Lithuanian",
    lb: "Luxembourgish",
    ltz: "Luxembourgish",
    luxembourgish: "Luxembourgish",
    mk: "Macedonian",
    mkd: "Macedonian",
    mac: "Macedonian",
    macedonian: "Macedonian",
    mg: "Malagasy",
    mlg: "Malagasy",
    malagasy: "Malagasy",
    ms: "Malay",
    msa: "Malay",
    may: "Malay",
    malay: "Malay",
    ml: "Malayalam",
    mal: "Malayalam",
    malayalam: "Malayalam",
    mt: "Maltese",
    mlt: "Maltese",
    maltese: "Maltese",
    mi: "Maori",
    mri: "Maori",
    mao: "Maori",
    maori: "Maori",
    mr: "Marathi",
    mar: "Marathi",
    marathi: "Marathi",
    mn: "Mongolian",
    mon: "Mongolian",
    mongolian: "Mongolian",
    my: "Myanmar (Burmese)",
    mya: "Myanmar (Burmese)",
    bur: "Myanmar (Burmese)",
    ne: "Nepali",
    nep: "Nepali",
    nepali: "Nepali",
    no: "Norwegian",
    nor: "Norwegian",
    norwegian: "Norwegian",
    ps: "Pashto",
    pus: "Pashto",
    pashto: "Pashto",
    fa: "Persian",
    fas: "Persian",
    per: "Persian",
    persian: "Persian",
    pl: "Polish",
    pol: "Polish",
    polish: "Polish",
    pt: "Portuguese",
    por: "Portuguese",
    portuguese: "Portuguese",
    pa: "Punjabi",
    pan: "Punjabi",
    punjabi: "Punjabi",
    ro: "Romanian",
    ron: "Romanian",
    rum: "Romanian",
    romanian: "Romanian",
    ru: "Russian",
    rus: "Russian",
    russian: "Russian",
    sm: "Samoan",
    smo: "Samoan",
    samoan: "Samoan",
    sr: "Serbian",
    srp: "Serbian",
    serbian: "Serbian",
    si: "Sinhala",
    sin: "Sinhala",
    sinhala: "Sinhala",
    sk: "Slovak",
    slk: "Slovak",
    slo: "Slovak",
    slovak: "Slovak",
    sl: "Slovenian",
    slv: "Slovenian",
    slovenian: "Slovenian",
    so: "Somali",
    som: "Somali",
    somali: "Somali",
    uk: "Ukrainian",
    ukr: "Ukrainian",
    ukrainian: "Ukrainian",
    es: "Spanish",
    spa: "Spanish",
    spanish: "Spanish",
    su: "Sundanese",
    sun: "Sundanese",
    sundanese: "Sundanese",
    sw: "Swahili",
    swh: "Swahili",
    swahili: "Swahili",
    sv: "Swedish",
    swe: "Swedish",
    swedish: "Swedish",
    tl: "Tagalog (Filipino)",
    fil: "Tagalog (Filipino)",
    tagalog: "Tagalog (Filipino)",
    tg: "Tajik",
    tgk: "Tajik",
    tajik: "Tajik",
    ta: "Tamil",
    tam: "Tamil",
    tamil: "Tamil",
    tt: "Tatar",
    tat: "Tatar",
    tatar: "Tatar",
    te: "Telugu",
    tel: "Telugu",
    telugu: "Telugu",
    th: "Thai",
    tha: "Thai",
    thai: "Thai",
    tr: "Turkish",
    tur: "Turkish",
    turkish: "Turkish",
    tk: "Turkmen",
    tuk: "Turkmen",
    turkmen: "Turkmen",
    ur: "Urdu",
    urd: "Urdu",
    urdu: "Urdu",
    ug: "Uyghur",
    uig: "Uyghur",
    uyghur: "Uyghur",
    uz: "Uzbek",
    uzb: "Uzbek",
    uzbek: "Uzbek",
    vi: "Vietnamese",
    vie: "Vietnamese",
    vietnamese: "Vietnamese",
    cy: "Welsh",
    cym: "Welsh",
    wel: "Welsh",
    welsh: "Welsh",
    xh: "Xhosa",
    xho: "Xhosa",
    xhosa: "Xhosa",
    yi: "Yiddish",
    yid: "Yiddish",
    yiddish: "Yiddish",
    yo: "Yoruba",
    yor: "Yoruba",
    yoruba: "Yoruba",
    zu: "Zulu",
    zul: "Zulu",
    zulu: "Zulu",
  };

  if (mapping[lowered]) return mapping[lowered];
  if (lowered === "unknown" || lowered === "auto") return "Unknown";
  return toTitleCase(raw);
}

// ─── GET LANG CODE from language name ────────────────────────────────────────
function getLangCode(langName = "") {
  return LANG_NAME_TO_CODE[langName.toLowerCase()] || "unknown";
}

// ─── NORMALIZE PROMPT (for dedup before Supabase insert) ─────────────────────
async function normalizePrompt(rawPrompt) {
  const result = await translateToEnglish(rawPrompt);
  return {
    originalText: rawPrompt,
    normalizedText: result.translated.trim().toLowerCase(),
    originalLang: result.lang,
  };
}

// ─── MAIN: Translate user message → English ───────────────────────────────────
async function translateToEnglish(text) {
  if (!text || !text.trim())
    return { translated: text, lang: "Unknown", langCode: "unknown" };

  const clean = text.trim();
  const chunks = splitIntoChunks(clean, MAX_CHUNK);

  try {
    const results = await Promise.all(chunks.map((c) => lingva(c)));
    return buildResult(results, clean, "lingva");
  } catch {
    try {
      const results = await Promise.all(chunks.map((c) => myMemory(c)));
      return buildResult(results, clean, "mymemory");
    } catch (err) {
      console.error("[translator] both APIs failed:", err.message);
      return {
        translated: clean,
        lang: "Unknown",
        langCode: "unknown",
        error: err.message,
      };
    }
  }
}

function buildResult(results, originalText, source) {
  const combinedTranslation = results
    .map((r) => r.translated)
    .join(" ")
    .trim();
  const rawLang = results[0].lang;
  const detectedLanguage = resolveLanguageName(
    rawLang,
    originalText,
    combinedTranslation,
  );
  const langCode = getLangCode(detectedLanguage);
  const skipped =
    detectedLanguage.toLowerCase() === "english" ||
    normalizeForCompare(combinedTranslation) ===
      normalizeForCompare(originalText);

  return {
    translated: combinedTranslation || originalText,
    lang: detectedLanguage,
    langCode,
    source,
    skipped,
  };
}

// ─── SUPPORT EMAIL: user → support (English) ─────────────────────────────────
async function processSupportEmail(rawEmailBody) {
  const result = await translateToEnglish(rawEmailBody);
  return {
    originalBody: rawEmailBody,
    englishBody: result.translated,
    sourceLang: result.lang,
    sourceLangCode: result.langCode,
    wasTranslated: !result.skipped,
  };
}

// ─── REPLY: translate support reply → user's original language ───────────────
async function translateReplyToUser(englishReply, targetLangCode) {
  if (
    !targetLangCode ||
    targetLangCode === "unknown" ||
    targetLangCode === "en"
  ) {
    return { translated: englishReply, lang: "English", langCode: "en" };
  }

  const encoded = encodeURIComponent(englishReply);

  for (const base of LINGVA_INSTANCES) {
    try {
      const res = await fetchWithTimeout(
        `${base}/api/v1/en/${targetLangCode}/${encoded}`,
        TIMEOUT_MS,
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (data.error) continue;
      return {
        translated: data.translation,
        lang: data.info?.detectedLanguage?.name || targetLangCode,
        langCode: targetLangCode,
        source: "lingva",
      };
    } catch {
      continue;
    }
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|${targetLangCode}&de=${MYMEMORY_EMAIL}`;
    const res = await fetchWithTimeout(url, TIMEOUT_MS);
    const data = await res.json();
    if (data.responseStatus === 200) {
      return {
        translated: data.responseData.translatedText,
        lang: targetLangCode,
        langCode: targetLangCode,
        source: "mymemory",
      };
    }
  } catch (err) {
    console.error("[translator] reply translation failed:", err.message);
  }

  return {
    translated: englishReply,
    lang: "English",
    langCode: "en",
    error: "translation failed",
  };
}

// ─── TRANSCRIPT: translate all user messages → English ───────────────────────
async function translateTranscriptMessages(messages = []) {
  return Promise.all(
    messages.map(async (message) => {
      if (message.role !== "user") {
        return {
          ...message,
          translatedContent: message.content || "",
          detectedLanguage: "English",
          detectedLangCode: "en",
          wasTranslated: false,
        };
      }

      const translation = await processSupportEmail(message.content || "");
      return {
        ...message,
        translatedContent: translation.englishBody || message.content || "",
        detectedLanguage: translation.sourceLang || "Unknown",
        detectedLangCode: translation.sourceLangCode || "unknown",
        wasTranslated: Boolean(translation.wasTranslated),
      };
    }),
  );
}

// ─── INTERNAL: Lingva ────────────────────────────────────────────────────────
async function lingva(text) {
  const encoded = encodeURIComponent(text);
  for (const base of LINGVA_INSTANCES) {
    try {
      const res = await fetchWithTimeout(
        `${base}/api/v1/auto/en/${encoded}`,
        TIMEOUT_MS,
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (data.error) continue;
      return {
        translated: data.translation,
        lang: data.info?.detectedLanguage?.name || "unknown",
      };
    } catch {
      continue;
    }
  }
  throw new Error("All Lingva instances failed");
}

// ─── INTERNAL: MyMemory ──────────────────────────────────────────────────────
async function myMemory(text) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|en&de=${MYMEMORY_EMAIL}`;
  const res = await fetchWithTimeout(url, TIMEOUT_MS);
  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error(data.responseDetails);
  const detectedLanguage =
    data.responseData?.detectedLanguage ||
    data.matches?.find((i) => i?.segment)?.source ||
    "unknown";
  return {
    translated: data.responseData.translatedText,
    lang: detectedLanguage,
  };
}

// ─── LANGUAGE DETECTION ──────────────────────────────────────────────────────
function guessLanguageFromText(value = "") {
  const scriptPatterns = [
    { name: "Korean", pattern: /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/u },
    { name: "Japanese", pattern: /[\u3040-\u30FF]/u },
    { name: "Chinese", pattern: /[\u4E00-\u9FFF]/u },
    { name: "Thai", pattern: /[\u0E00-\u0E7F]/u },
    { name: "Arabic", pattern: /[\u0600-\u06FF]/u },
    { name: "Hebrew", pattern: /[\u05D0-\u05FF]/u },
    { name: "Georgian", pattern: /[\u10A0-\u10FF]/u },
    { name: "Armenian", pattern: /[\u0530-\u058F]/u },
    { name: "Khmer", pattern: /[\u1780-\u17FF]/u },
    { name: "Lao", pattern: /[\u0E80-\u0EFF]/u },
    { name: "Myanmar (Burmese)", pattern: /[\u1000-\u109F]/u },
    { name: "Sinhala", pattern: /[\u0D80-\u0DFF]/u },
    { name: "Ethiopian", pattern: /[\u1200-\u137F]/u },
    { name: "Mongolian", pattern: /[\u04E8\u04E9\u04AE\u04AF\u04AA\u04AB]/u },
    {
      name: "Ukrainian",
      pattern: /[\u0404\u0406\u0407\u0454\u0456\u0457\u0490\u0491]/u,
    },
    { name: "Bulgarian", pattern: /\b(и|е|на|да|се|не|за|от|че|са)\b/u },
    { name: "Serbian", pattern: /[\u0402\u0452\u040B\u045B\u040F\u045F]/u },
    { name: "Russian", pattern: /[\u0400-\u04FF]/u },
    { name: "Telugu", pattern: /[\u0C00-\u0C7F]/u },
    { name: "Tamil", pattern: /[\u0B80-\u0BFF]/u },
    { name: "Kannada", pattern: /[\u0C80-\u0CFF]/u },
    { name: "Malayalam", pattern: /[\u0D00-\u0D7F]/u },
    { name: "Bengali", pattern: /[\u0980-\u09FF]/u },
    { name: "Gujarati", pattern: /[\u0A80-\u0AFF]/u },
    { name: "Punjabi", pattern: /[\u0A00-\u0A7F]/u },
    { name: "Hindi", pattern: /[\u0900-\u097F]/u },
  ];

  for (const lang of scriptPatterns) {
    if (lang.pattern.test(value)) return lang.name;
  }

  const lower = value.toLowerCase();

  const latinPatterns = [
    {
      name: "Spanish",
      pattern:
        /[ñáéíóúü]|\b(hola|gracias|por favor|buenos|estoy|tengo|quiero|cómo|dónde|qué|pero|también|cuando|porque|esto|para)\b/,
    },
    {
      name: "Portuguese",
      pattern:
        /[ãõçáéíóú]|\b(olá|obrigado|obrigada|você|não|também|porque|para|com|como|isso|mais|mas|uma|por)\b/,
    },
    {
      name: "French",
      pattern:
        /[àâæçèéêëîïôœùûü]|\b(bonjour|merci|oui|non|je|tu|il|nous|vous|ils|est|sont|avec|dans|pour|que|une|les|des)\b/,
    },
    {
      name: "German",
      pattern:
        /[äöüßÄÖÜ]|\b(hallo|danke|bitte|ich|sie|wir|nicht|haben|sein|wird|mit|und|der|die|das|ein|eine|für)\b/,
    },
    {
      name: "Italian",
      pattern:
        /\b(ciao|grazie|prego|buongiorno|sono|stai|come|dove|perché|quando|questo|quella|anche|però|molto|bene)\b/,
    },
    {
      name: "Dutch",
      pattern:
        /[ĳ]|\b(hallo|dank|bedankt|ik|jij|wij|niet|voor|met|een|zijn|hebben|wordt|maar|ook|kan|dit|dat)\b/,
    },
    {
      name: "Polish",
      pattern:
        /[ąćęłńóśźż]|\b(cześć|dziękuję|proszę|nie|tak|jest|mam|czy|jak|gdzie|co|ale|lub|dla|się)\b/,
    },
    {
      name: "Romanian",
      pattern:
        /[ăâîșț]|\b(bună|mulțumesc|da|nu|este|sunt|că|și|sau|pentru|mai|cum|unde|când)\b/,
    },
    {
      name: "Czech",
      pattern:
        /[áčďéěíňóřšťúůýž]|\b(ahoj|děkuji|prosím|ano|ne|je|jsem|nebo|ale|jak|kde|co|pro|když)\b/,
    },
    {
      name: "Slovak",
      pattern:
        /[áäčďéíľĺňóôŕšťúýž]|\b(ahoj|ďakujem|prosím|áno|nie|je|som|alebo|ako|kde|čo|pre|keď)\b/,
    },
    {
      name: "Hungarian",
      pattern:
        /[áéíóöőúüű]|\b(szia|köszönöm|kérem|igen|nem|van|vagy|egy|és|de|hogy|nem|mint|már)\b/,
    },
    {
      name: "Swedish",
      pattern:
        /[åäö]|\b(hej|tack|förlåt|ja|nej|är|har|inte|för|med|att|det|som|kan|men|och)\b/,
    },
    {
      name: "Norwegian",
      pattern:
        /[æøå]|\b(hei|takk|beklager|ja|nei|er|har|ikke|for|med|at|det|som|kan|men|og)\b/,
    },
    {
      name: "Danish",
      pattern:
        /[æøå]|\b(hej|tak|undskyld|ja|nej|er|har|ikke|for|med|at|det|som|kan|men|og)\b/,
    },
    {
      name: "Finnish",
      pattern:
        /[äö]|\b(hei|kiitos|anteeksi|kyllä|ei|on|olen|tai|ja|mutta|mitä|missä|kun|jos|että)\b/,
    },
    {
      name: "Turkish",
      pattern:
        /[çğışöü]|\b(merhaba|teşekkür|evet|hayır|bu|bir|ve|ile|için|ama|çok|nasıl|nerede|ne)\b/,
    },
    {
      name: "Indonesian",
      pattern:
        /\b(halo|terima kasih|ya|tidak|adalah|saya|anda|dengan|untuk|dan|tapi|bagaimana|apa|ini)\b/,
    },
    {
      name: "Malay",
      pattern:
        /\b(hello|terima kasih|ya|tidak|ialah|saya|anda|dengan|untuk|dan|tetapi|bagaimana|mana|apa|ini)\b/,
    },
    {
      name: "Tagalog (Filipino)",
      pattern:
        /\b(kamusta|salamat|oo|hindi|ang|ng|sa|at|na|ay|para|kung|pero|kaya|ako|ikaw)\b/,
    },
    {
      name: "Swahili",
      pattern:
        /\b(habari|asante|ndiyo|hapana|ni|wa|ya|na|kwa|au|lakini|jinsi|wapi|nini|hii)\b/,
    },
    {
      name: "Vietnamese",
      pattern:
        /[ắằẳẵặấầẩẫậáàảãạđêếềểễệéèẻẽẹíìỉĩịôốồổỗộơớờởỡợóòỏõọưứừửữựúùủũụýỳỷỹỵ]/,
    },
    {
      name: "Afrikaans",
      pattern:
        /\b(hallo|dankie|asseblief|ja|nee|is|het|nie|vir|met|en|maar|hoe|waar|wat|hierdie)\b/,
    },
    {
      name: "Welsh",
      pattern:
        /\b(helo|diolch|ie|na|mae|yn|ac|ond|am|gyda|sut|ble|beth|hwn|hon)\b/,
    },
    {
      name: "Latvian",
      pattern:
        /[āčēģīķļņšūž]|\b(sveiki|paldies|jā|nē|ir|esmu|vai|un|bet|kā|kur|kas|šis|šī)\b/,
    },
    {
      name: "Lithuanian",
      pattern:
        /[ąčęėįšųūž]|\b(labas|ačiū|taip|ne|yra|esu|ar|ir|bet|kaip|kur|kas|šis|ši)\b/,
    },
    {
      name: "Slovenian",
      pattern:
        /[čšž]|\b(živjo|hvala|ja|ne|je|sem|ali|in|ampak|kako|kje|kaj|ta|to)\b/,
    },
    {
      name: "Croatian",
      pattern:
        /[čćđšž]|\b(bok|hvala|da|ne|je|jesam|ili|i|ali|kako|gdje|što|ovaj|ova)\b/,
    },
    {
      name: "Estonian",
      pattern:
        /[äöõü]|\b(tere|tänan|jah|ei|on|olen|või|ja|aga|kuidas|kus|mis|see)\b/,
    },
    {
      name: "Icelandic",
      pattern:
        /[áðéíóúýþæö]|\b(halló|takk|já|nei|er|eru|og|en|eða|hvernig|hvar|hvað|þetta)\b/,
    },
    {
      name: "Albanian",
      pattern:
        /[çëÇË]|\b(përshëndetje|faleminderit|po|jo|është|jam|dhe|por|si|ku|çfarë|ky|kjo)\b/,
    },
    {
      name: "Catalan",
      pattern:
        /[àèéíïóòúüç]|\b(hola|gràcies|sí|no|és|soc|i|però|com|on|què|aquest|aquesta)\b/,
    },
    {
      name: "Basque",
      pattern:
        /\b(kaixo|eskerrik asko|bai|ez|da|dut|eta|baina|nola|non|zer|hau|hori)\b/,
    },
    {
      name: "Galician",
      pattern:
        /[áéíóúüñ]|\b(ola|grazas|si|non|é|son|e|pero|como|onde|que|este|esta)\b/,
    },
    {
      name: "Maltese",
      pattern:
        /[ċġħż]|\b(merħba|grazzi|iva|le|hu|jien|u|iżda|kif|fejn|xi|dan|din)\b/,
    },
    {
      name: "Irish",
      pattern:
        /[áéíóú]|\b(dia duit|go raibh maith agat|tá|níl|agus|ach|cén|cá|cad|seo|sin)\b/,
    },
    {
      name: "Luxembourgish",
      pattern:
        /[äëéê]|\b(moien|merci|jo|nee|ass|sinn|an|mee|wéi|wou|wat|dësen|dës)\b/,
    },
    {
      name: "Bosnian",
      pattern:
        /[čćđšž]|\b(zdravo|hvala|da|ne|je|jesam|ili|i|ali|kako|gdje|što)\b/,
    },
    {
      name: "Macedonian",
      pattern: /\b(здраво|благодарам|да|не|е|сум|и|но|како|каде|што|овој)\b/,
    },
    {
      name: "Zulu",
      pattern:
        /\b(sawubona|ngiyabonga|yebo|cha|yi|ngi|na|kodwa|kanjani|kuphi|yini|le)\b/,
    },
    {
      name: "Uzbek",
      pattern:
        /[oʻgʻ]|\b(salom|rahmat|ha|bu|men|va|lekin|qanday|qayerda|nima|shu)\b/,
    },
    {
      name: "Azerbaijani",
      pattern:
        /[çəğıöşü]|\b(salam|təşəkkür|bəli|xeyr|bu|mən|və|amma|necə|harada|nə)\b/,
    },
    {
      name: "Hausa",
      pattern: /[ɓɗƙ]|\b(sannu|nagode|eh|ne|ce|da|amma|yaya|ina|me|wannan)\b/,
    },
    {
      name: "Somali",
      pattern:
        /\b(salaam|mahadsanid|haa|maya|waa|anigu|iyo|laakiin|sidee|xagee|maxaa|kani)\b/,
    },
    {
      name: "Samoan",
      pattern: /\b(talofa|fa'afetai|ioe|leai|o|ua|ma|ae|sei|fea|lenei)\b/,
    },
    {
      name: "Maori",
      pattern:
        /[āēīōū]|\b(kia ora|ngā mihi|āe|kāo|ko|he|me|engari|pēhea|hea|aha|tēnei)\b/,
    },
    {
      name: "Yoruba",
      pattern:
        /[ẹọṣ]|\b(ẹ káàbọ|ẹ ṣéun|bẹ̀ẹ̀|rárá|ni|mi|àti|ṣùgbọ́n|báwo|níbo|kí ni|èyí)\b/,
    },
    {
      name: "Sundanese",
      pattern:
        /\b(hatur nuhun|sumuhun|henteu|nyaéta|abdi|jeung|tapi|kumaha|dimana|naon|ieu)\b/,
    },
    {
      name: "Tajik",
      pattern: /\b(салом|ташаккур|ҳа|не|ин|ман|ва|аммо|чӣ тавр|куҷо|чӣ)\b/,
    },
    { name: "Pashto", pattern: /[\u06A9\u06AF\u067E\u0686\u0698\u0648\u06CC]/ },
    { name: "Kazakh", pattern: /[ҒғҚқҢңҰұҮүҺһӘәІі]/ },
    { name: "Kyrgyz", pattern: /[ҢңҮүӨөЙй]/ },
    { name: "Tatar", pattern: /[ҖжңЄєҮүҺһ]/ },
    {
      name: "Turkmen",
      pattern:
        /[çöşüý]|\b(salam|sagbol|hawa|ýok|bu|men|we|ýöne|nähili|nirede|näme|şu)\b/,
    },
    { name: "Uyghur", pattern: /[\u06BE\u06C6\u06C7\u06C8\u06D0]/ },
  ];

  for (const lang of latinPatterns) {
    if (lang.pattern.test(lower)) return lang.name;
  }

  return "Unknown";
}

function resolveLanguageName(rawLang, originalText = "", translatedText = "") {
  const normalized = normalizeLanguageLabel(rawLang);
  if (normalized.toLowerCase() !== "unknown") return normalized;

  const guessed = guessLanguageFromText(originalText);
  if (guessed.toLowerCase() !== "unknown") return guessed;

  if (
    normalizeForCompare(originalText) === normalizeForCompare(translatedText) &&
    isLikelyEnglishText(originalText)
  )
    return "English";

  return "Unknown";
}

// ─── EXPORTS ──────────────────────────────────────────────────────────────────
module.exports = {
  translateToEnglish,
  processSupportEmail,
  normalizePrompt,
  translateReplyToUser,
  translateTranscriptMessages,
  getLangCode,
  detectLanguageFromText: guessLanguageFromText,
};
