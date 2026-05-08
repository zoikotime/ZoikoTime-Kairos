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

function splitIntoChunks(text, maxLen) {
  if (text.length <= maxLen) return [text];
  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
  const chunks = [];
  let current = "";
  for (const s of sentences) {
    if ((current + s).length > maxLen && current) {
      chunks.push(current.trim());
      current = s;
    } else current += s;
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

function toTitleCase(value = "") {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

function isLikelyEnglishText(value = "") {
  const clean = String(value || "").trim();
  if (!clean) return false;
  const nonAscii = (clean.match(/[^\x00-\x7F]/g) || []).length;
  return 1 - nonAscii / clean.length > 0.95;
}

function fetchWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

function normalizeLanguageLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "unknown";
  const lowered = raw.toLowerCase();
  const mapping = {
    af: "Afrikaans",
    afrikaans: "Afrikaans",
    sq: "Albanian",
    albanian: "Albanian",
    am: "Amharic",
    amharic: "Amharic",
    en: "English",
    eng: "English",
    english: "English",
    ar: "Arabic",
    arabic: "Arabic",
    hy: "Armenian",
    armenian: "Armenian",
    az: "Azerbaijani",
    azerbaijani: "Azerbaijani",
    eu: "Basque",
    basque: "Basque",
    be: "Belarusian",
    belarusian: "Belarusian",
    bn: "Bengali",
    bengali: "Bengali",
    bs: "Bosnian",
    bosnian: "Bosnian",
    bg: "Bulgarian",
    bulgarian: "Bulgarian",
    ca: "Catalan",
    catalan: "Catalan",
    "zh-cn": "Chinese (Simplified)",
    "zh-hans": "Chinese (Simplified)",
    "zh-tw": "Chinese (Traditional)",
    "zh-hant": "Chinese (Traditional)",
    zh: "Chinese",
    chinese: "Chinese",
    hr: "Croatian",
    croatian: "Croatian",
    cs: "Czech",
    czech: "Czech",
    da: "Danish",
    danish: "Danish",
    nl: "Dutch",
    dutch: "Dutch",
    et: "Estonian",
    estonian: "Estonian",
    fi: "Finnish",
    finnish: "Finnish",
    fr: "French",
    french: "French",
    gl: "Galician",
    galician: "Galician",
    ka: "Georgian",
    georgian: "Georgian",
    de: "German",
    german: "German",
    el: "Greek",
    greek: "Greek",
    gu: "Gujarati",
    gujarati: "Gujarati",
    ht: "Haitian Creole",
    "haitian creole": "Haitian Creole",
    ha: "Hausa",
    hausa: "Hausa",
    he: "Hebrew",
    iw: "Hebrew",
    hebrew: "Hebrew",
    hi: "Hindi",
    hindi: "Hindi",
    hu: "Hungarian",
    hungarian: "Hungarian",
    is: "Icelandic",
    icelandic: "Icelandic",
    ig: "Igbo",
    igbo: "Igbo",
    id: "Indonesian",
    indonesian: "Indonesian",
    ga: "Irish",
    irish: "Irish",
    it: "Italian",
    italian: "Italian",
    ja: "Japanese",
    japanese: "Japanese",
    kn: "Kannada",
    kannada: "Kannada",
    kk: "Kazakh",
    kazakh: "Kazakh",
    km: "Khmer",
    khmer: "Khmer",
    ko: "Korean",
    korean: "Korean",
    ku: "Kurdish",
    kurdish: "Kurdish",
    ky: "Kyrgyz",
    kyrgyz: "Kyrgyz",
    lo: "Lao",
    lao: "Lao",
    lv: "Latvian",
    latvian: "Latvian",
    lt: "Lithuanian",
    lithuanian: "Lithuanian",
    lb: "Luxembourgish",
    luxembourgish: "Luxembourgish",
    mk: "Macedonian",
    macedonian: "Macedonian",
    mg: "Malagasy",
    malagasy: "Malagasy",
    ms: "Malay",
    malay: "Malay",
    ml: "Malayalam",
    malayalam: "Malayalam",
    mt: "Maltese",
    maltese: "Maltese",
    mi: "Maori",
    maori: "Maori",
    mr: "Marathi",
    marathi: "Marathi",
    mn: "Mongolian",
    mongolian: "Mongolian",
    my: "Myanmar (Burmese)",
    "myanmar (burmese)": "Myanmar (Burmese)",
    ne: "Nepali",
    nepali: "Nepali",
    no: "Norwegian",
    norwegian: "Norwegian",
    ps: "Pashto",
    pashto: "Pashto",
    fa: "Persian",
    persian: "Persian",
    pl: "Polish",
    polish: "Polish",
    pt: "Portuguese",
    portuguese: "Portuguese",
    pa: "Punjabi",
    punjabi: "Punjabi",
    ro: "Romanian",
    romanian: "Romanian",
    ru: "Russian",
    russian: "Russian",
    sm: "Samoan",
    samoan: "Samoan",
    sr: "Serbian",
    serbian: "Serbian",
    si: "Sinhala",
    sinhala: "Sinhala",
    sk: "Slovak",
    slovak: "Slovak",
    sl: "Slovenian",
    slovenian: "Slovenian",
    so: "Somali",
    somali: "Somali",
    uk: "Ukrainian",
    ukrainian: "Ukrainian",
    es: "Spanish",
    spanish: "Spanish",
    su: "Sundanese",
    sundanese: "Sundanese",
    sw: "Swahili",
    swahili: "Swahili",
    sv: "Swedish",
    swedish: "Swedish",
    tl: "Tagalog (Filipino)",
    fil: "Tagalog (Filipino)",
    tagalog: "Tagalog (Filipino)",
    tg: "Tajik",
    tajik: "Tajik",
    ta: "Tamil",
    tamil: "Tamil",
    tt: "Tatar",
    tatar: "Tatar",
    te: "Telugu",
    telugu: "Telugu",
    th: "Thai",
    thai: "Thai",
    tr: "Turkish",
    turkish: "Turkish",
    tk: "Turkmen",
    turkmen: "Turkmen",
    ur: "Urdu",
    urdu: "Urdu",
    ug: "Uyghur",
    uyghur: "Uyghur",
    uz: "Uzbek",
    uzbek: "Uzbek",
    vi: "Vietnamese",
    vietnamese: "Vietnamese",
    cy: "Welsh",
    welsh: "Welsh",
    xh: "Xhosa",
    xhosa: "Xhosa",
    yi: "Yiddish",
    yiddish: "Yiddish",
    yo: "Yoruba",
    yoruba: "Yoruba",
    zu: "Zulu",
    zulu: "Zulu",
  };
  if (mapping[lowered]) return mapping[lowered];
  if (lowered === "unknown" || lowered === "auto") return "Unknown";
  return toTitleCase(raw);
}

function getLangCode(langName = "") {
  return LANG_NAME_TO_CODE[langName.toLowerCase()] || "unknown";
}

// ─── LANGUAGE DETECTION ──────────────────────────────────────────────────────
function guessLanguageFromText(value = "") {
  // ── 1. Non-Latin / unique scripts (order = most specific first) ───────────
  const scriptPatterns = [
    { name: "Korean", pattern: /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/u },
    { name: "Japanese", pattern: /[\u3040-\u30FF]/u },
    { name: "Chinese", pattern: /[\u4E00-\u9FFF]/u },
    { name: "Thai", pattern: /[\u0E00-\u0E7F]/u },
    { name: "Lao", pattern: /[\u0E80-\u0EFF]/u },
    { name: "Khmer", pattern: /[\u1780-\u17FF]/u },
    { name: "Myanmar (Burmese)", pattern: /[\u1000-\u109F]/u },
    { name: "Sinhala", pattern: /[\u0D80-\u0DFF]/u },
    { name: "Georgian", pattern: /[\u10A0-\u10FF]/u },
    { name: "Armenian", pattern: /[\u0530-\u058F]/u },
    { name: "Amharic", pattern: /[\u1200-\u137F]/u },
    { name: "Hebrew", pattern: /[\u05D0-\u05FF]/u },
    // Arabic-family — most specific first
    { name: "Pashto", pattern: /[\u067E\u0686\u0698\u06AF]/u },
    { name: "Uyghur", pattern: /[\u06BE\u06C6\u06C7\u06C8\u06D0]/u },
    { name: "Urdu", pattern: /[\u06C1\u06BE\u0679\u0688\u0691\u06BA]/u },
    { name: "Arabic", pattern: /[\u0600-\u06FF]/u },
    // Indic
    { name: "Telugu", pattern: /[\u0C00-\u0C7F]/u },
    { name: "Tamil", pattern: /[\u0B80-\u0BFF]/u },
    { name: "Kannada", pattern: /[\u0C80-\u0CFF]/u },
    { name: "Malayalam", pattern: /[\u0D00-\u0D7F]/u },
    { name: "Bengali", pattern: /[\u0980-\u09FF]/u },
    { name: "Gujarati", pattern: /[\u0A80-\u0AFF]/u },
    { name: "Punjabi", pattern: /[\u0A00-\u0A7F]/u },
    { name: "Hindi", pattern: /[\u0900-\u097F]/u },
    // Cyrillic — specific chars first, generic Russian last
    { name: "Kazakh", pattern: /[ҒғҚқҢңҰұҮүҺһӘәІі]/u },
    { name: "Kyrgyz", pattern: /[ҢңҮүӨө]/u },
    { name: "Tajik", pattern: /[ҒғҲҳҶҷӢӣҚқ]/u },
    { name: "Mongolian", pattern: /[\u04E8\u04E9\u04AE\u04AF\u04AA\u04AB]/u },
    {
      name: "Ukrainian",
      pattern: /[\u0404\u0406\u0407\u0454\u0456\u0457\u0490\u0491]/u,
    },
    { name: "Serbian", pattern: /[\u0402\u0452\u040B\u045B\u040F\u045F]/u },
    // Russian is the Cyrillic catch-all — but we run keyword checks inside it
    { name: "Russian", pattern: /[\u0400-\u04FF]/u },
  ];

  for (const { name, pattern } of scriptPatterns) {
    if (pattern.test(value)) {
      // Cyrillic catch-all: refine with keywords before returning "Russian"
      if (name === "Russian") {
        if (/дзякуй|прывітанне|дапамогу|беларус/iu.test(value))
          return "Belarusian";
        if (/благодарам|многу|македон/iu.test(value)) return "Macedonian";
        if (/благодар[яе]|вашата|здравейте/iu.test(value)) return "Bulgarian";
        if (/сайн байна|баярлалаа|тусалсанд|монгол/iu.test(value))
          return "Mongolian";
        if (/барои|кӯмаки|ташаккури|точик/iu.test(value)) return "Tajik";
        return "Russian";
      }
      return name;
    }
  }

  // ── 2. Latin-script patterns ──────────────────────────────────────────────
  // CRITICAL ordering rule:
  //   - Vietnamese comes LAST because its diacritics (á à ó etc.) overlap
  //     with Spanish, Catalan, Irish, and many other languages.
  //   - Use unique chars OR multi-word phrases to avoid false matches.
  const lower = value.toLowerCase();

  const latinPatterns = [
    // African ─────────────────────────────────────────────────────────────────
    {
      name: "Zulu",
      pattern:
        /\b(sawubona|sanibonani|ngiyabonga|ngiyaxolisa|ngicela|bafowethu|niyaphila|sikhona|yebo|kakhulu|kanjani)\b/,
    },
    {
      name: "Xhosa",
      pattern:
        /\b(molo|unjani|ndicela|uxolo|enkosi|ncedo|andiqondi|namhlanje)\b/,
    },
    {
      name: "Swahili",
      pattern:
        /\b(habari|asante|karibu|tafadhali|ninafurahi|jambo|msaada|ninakushukuru)\b/,
    },
    {
      name: "Yoruba",
      // ẹ ọ ṣ are Yoruba-specific — safest signal
      pattern: /[ẹọṣṢẸỌ]|\b(káàbọ|ṣéun|dúpẹ|rárá)\b/,
    },
    {
      name: "Hausa",
      // ɓ ɗ ƙ unique to Hausa
      pattern: /[ɓɗƙ]|\b(sannu|nagode|don allah|ina kwana|yaya labari)\b/,
    },
    {
      name: "Igbo",
      pattern: /\b(kedu|daalụ|enyemaka|nke ukwuu)\b/,
    },
    {
      name: "Somali",
      pattern: /\b(salaam|mahadsanid|waa maxay|anigu|laakiin|sidee|xagee)\b/,
    },

    // SE Asian ─────────────────────────────────────────────────────────────────
    {
      name: "Tagalog (Filipino)",
      pattern:
        /\b(kamusta|maraming salamat|magandang|naghihintay|inyong|ninyo)\b/,
    },
    {
      // "awak" and "mahu" distinguish Malay from Indonesian
      name: "Malay",
      pattern:
        /\b(awak|mahu pergi|boleh tolong|selamat pagi.*awak|terima kasih.*awak)\b/,
    },
    {
      name: "Indonesian",
      pattern:
        /\b(terima kasih|selamat pagi|bagaimana kabar|saya sedang|banyak atas bantuan)\b/,
    },
    {
      name: "Sundanese",
      pattern: /\b(hatur nuhun|sumuhun|nyaéta|abdi jeung|kumaha)\b/,
    },
    {
      name: "Samoan",
      pattern: /\b(talofa|fa'afetai|ioe|leai)\b/,
    },

    // Pacific / Celtic ─────────────────────────────────────────────────────────
    {
      // Maori: use multi-word keywords only — macron vowels clash with Latvian/Lithuanian
      name: "Maori",
      pattern: /\b(kia ora|ngā mihi|āe|kāo|tēnei|pēhea)\b/,
    },
    {
      name: "Welsh",
      pattern: /\b(diolch|heddiw|sut ydych|croeso|mae'n|cymraeg)\b/,
    },
    {
      name: "Irish",
      pattern: /\b(dia duit|go raibh maith agat|conas atá|táim|gaeilge)\b/,
    },
    {
      name: "Basque",
      pattern: /\b(kaixo|eskerrik asko|nola|euskara)\b/,
    },

    // Turkic ──────────────────────────────────────────────────────────────────
    {
      // ə is unique to Azerbaijani among Turkic languages
      name: "Azerbaijani",
      pattern: /[əƏ]|\b(köməyiniz|təşəkkür|necəsiniz|bəli|xeyr)\b/,
    },
    {
      // ʻ (U+02BB) is the Uzbek apostrophe for oʻ/gʻ
      name: "Uzbek",
      pattern:
        /[ʻʼ]|\b(rahmat|iltimos|yaxshimisiz|bera olamanmi|salom.*yordam)\b/,
    },
    {
      // ý is distinct to Turkmen
      name: "Turkmen",
      pattern: /[ýÝ]|\b(sagbol|nähili|nirede|şu gün)\b/,
    },
    {
      // Turkish last among Turkic; ş ğ ı after Azerbaijani (ə) and Uzbek (ʻ) are checked
      name: "Turkish",
      pattern: /[şğı]|\b(merhaba|teşekkür|ederim|nasılsınız|bugün)\b/,
    },

    // Romance ──────────────────────────────────────────────────────────────────
    {
      // ñ is the cleanest Spanish-only signal
      name: "Spanish",
      pattern: /[ñ]|\b(muchas gracias|buenos días|cómo estás|necesito ayuda)\b/,
    },
    {
      // ã õ are Portuguese-only among Romance
      name: "Portuguese",
      pattern:
        /[ãõ]|\b(obrigado|obrigada|você|preciso de|bom dia|muito obrigado)\b/,
    },
    {
      // œ æ à â are strong French signals
      name: "French",
      pattern:
        /[àâæœ]|\b(bonjour|merci beaucoup|s'il vous plaît|comment allez|j'ai besoin)\b/,
    },
    {
      name: "Catalan",
      pattern: /\b(gràcies|moltes gràcies|com estàs avui|català)\b/,
    },
    {
      name: "Galician",
      pattern: /\b(grazas|moitas grazas|pola túa|galego)\b/,
    },
    {
      name: "Italian",
      pattern: /\b(grazie mille|buongiorno|come stai|arrivederci|italiano)\b/,
    },
    {
      // ș ț are Romanian-specific (the cedilla variants ş ţ also accepted)
      name: "Romanian",
      pattern: /[șțȘȚşţŞŢ]|\b(mulțumesc|bună ziua|ce mai faci|vă rog)\b/,
    },

    // Germanic ─────────────────────────────────────────────────────────────────
    {
      // ß is unique to German
      name: "German",
      pattern:
        /[ß]|\b(vielen dank|wie geht es|guten tag|ich brauche|danke schön)\b/,
    },
    {
      name: "Dutch",
      pattern: /\b(hartelijk bedankt|hoe gaat het|goedemorgen|dank u wel)\b/,
    },
    {
      name: "Afrikaans",
      pattern: /\b(baie dankie|goeiemôre|asseblief|kan jy.*help|afrikaans)\b/,
    },
    {
      name: "Swedish",
      pattern: /\b(tack så mycket|hur mår du|förlåt|svenska|välkommen)\b/,
    },
    {
      name: "Norwegian",
      pattern:
        /\b(tusen takk|hvordan har du det|beklager|norsk|vær så snill)\b/,
    },
    {
      name: "Danish",
      pattern: /\b(mange tak|hvordan har du det|undskyld|dansk|vær venlig)\b/,
    },
    {
      // þ ð are unique to Icelandic
      name: "Icelandic",
      pattern: /[þðÞÐ]|\b(kærar þakkir|hvernig hefurðu|íslenska)\b/,
    },
    {
      name: "Luxembourgish",
      pattern: /\b(moien|wéi geet|lëtzebuergesch)\b/,
    },

    // Slavic (Latin) ───────────────────────────────────────────────────────────
    {
      // ł ą ę ś ź ć ń are strong Polish signals
      name: "Polish",
      pattern: /[łŁąęśźćń]|\b(dziękuję|proszę|dzień dobry|potrzebuję pomocy)\b/,
    },
    {
      // ř is almost unique to Czech
      name: "Czech",
      pattern: /[řŘ]|\b(děkuji|dobrý den|potřebuji|mnohokrát)\b/,
    },
    {
      // ľ ĺ ŕ unique to Slovak
      name: "Slovak",
      pattern: /[ľĽĺŕ]|\b(ďakujem|veľmi pekne|ako sa máte)\b/,
    },
    {
      name: "Slovenian",
      pattern: /\b(najlepša hvala|kako ste danes|slovenščina|živjo)\b/,
    },
    {
      // đ Đ are strong Croatian signals
      name: "Croatian",
      pattern: /[đĐ]|\b(puno hvala|kako ste danas|hvala lijepa|hrvatski)\b/,
    },
    {
      name: "Bosnian",
      pattern: /\b(hvala puno|kako ste|bosanski|zdravo puno hvala)\b/,
    },
    {
      // ë Ë are Albanian-specific in Latin
      name: "Albanian",
      pattern: /[ëË]|\b(faleminderit|përshëndetje|shumë mirë|shqip)\b/,
    },

    // Baltic ───────────────────────────────────────────────────────────────────
    {
      // ģ ķ ļ ņ unique to Latvian
      name: "Latvian",
      pattern: /[ģĢķĶļĻņŅ]|\b(liels paldies|kā jums šodien|latviski)\b/,
    },
    {
      // ė į ų unique to Lithuanian
      name: "Lithuanian",
      pattern: /[ėĖįĮųŲ]|\b(labai ačiū|kaip jums sekasi|lietuviškai)\b/,
    },

    // Other European ───────────────────────────────────────────────────────────
    {
      // Finnish shares ä ö with German/Swedish — rely on keywords
      name: "Finnish",
      pattern: /\b(kiitos paljon|miten voit|tänään|suomeksi|anteeksi)\b/,
    },
    {
      // õ is unique to Estonian
      name: "Estonian",
      pattern: /[õÕ]|\b(suur tänu|kuidas teil|eesti keeles)\b/,
    },
    {
      // ő ű unique to Hungarian
      name: "Hungarian",
      pattern: /[őŐűŰ]|\b(nagyon köszönöm|hogy vagy|kérem|magyarul)\b/,
    },
    {
      // ħ ġ ċ ż unique to Maltese
      name: "Maltese",
      pattern: /[ħĦġĠċĊżŻ]|\b(grazzi|merħba|kif int|malti)\b/,
    },
    {
      name: "Haitian Creole",
      pattern: /\b(bonjou|mèsi|kijan ou ye|souple|kreyòl)\b/,
    },

    // Vietnamese LAST — its diacritics include á à ó etc. which appear in
    // Spanish, Catalan, Irish, French, and many other languages.
    // We use ơ/ư (vowels with horn) which are Vietnamese-only.
    {
      name: "Vietnamese",
      pattern: /[ơớờởỡợưứừửữự]|\b(xin chào|cảm ơn|bạn khỏe|tiếng việt)\b/,
    },

    // English fallback
    {
      name: "English",
      pattern:
        /^[\x00-\x7F]+$|\b(hello|thank you|please|how are you|good morning|i need help)\b/,
    },
  ];

  for (const { name, pattern } of latinPatterns) {
    if (pattern.test(lower)) return name;
  }

  return "Unknown";
}

// ─── KEY FIX: run our detector FIRST; only fall back to API label if unknown ─
function resolveLanguageName(rawLang, originalText = "", translatedText = "") {
  // 1. Our script/keyword detector is more reliable than API labels
  const guessed = guessLanguageFromText(originalText);
  if (guessed.toLowerCase() !== "unknown") return guessed;

  // 2. Only use API label when our detection genuinely fails
  const normalized = normalizeLanguageLabel(rawLang);
  if (normalized.toLowerCase() !== "unknown") return normalized;

  // 3. Pure ASCII + unchanged translation → English
  if (
    normalizeForCompare(originalText) === normalizeForCompare(translatedText) &&
    isLikelyEnglishText(originalText)
  )
    return "English";

  return "Unknown";
}

async function normalizePrompt(rawPrompt) {
  const result = await translateToEnglish(rawPrompt);
  return {
    originalText: rawPrompt,
    normalizedText: result.translated.trim().toLowerCase(),
    originalLang: result.lang,
  };
}

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

async function translateReplyToUser(englishReply, targetLangCode) {
  if (
    !targetLangCode ||
    targetLangCode === "unknown" ||
    targetLangCode === "en"
  )
    return { translated: englishReply, lang: "English", langCode: "en" };
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
    if (data.responseStatus === 200)
      return {
        translated: data.responseData.translatedText,
        lang: targetLangCode,
        langCode: targetLangCode,
        source: "mymemory",
      };
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

async function translateTranscriptMessages(messages = []) {
  return Promise.all(
    messages.map(async (message) => {
      if (message.role !== "user")
        return {
          ...message,
          translatedContent: message.content || "",
          detectedLanguage: "English",
          detectedLangCode: "en",
          wasTranslated: false,
        };
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

module.exports = {
  translateToEnglish,
  processSupportEmail,
  normalizePrompt,
  translateReplyToUser,
  translateTranscriptMessages,
  getLangCode,
  detectLanguageFromText: guessLanguageFromText,
  _resolveLanguageName: resolveLanguageName,
  _detailedGuess: (text) => ({
    result: guessLanguageFromText(text),
    ranked: [],
  }),
};
