import { franc } from 'franc';

export type DetectedLanguage = 'en' | 'zh' | 'hi' | 'es' | 'ar' | 'fr' | 'bn' | 'pt' | 'ru' | 'id' | 'ur' | 'de' | 'ja' | 'tr' | 'ko' | 'vi' | 'te' | 'mr' | 'ta' | 'th' | 'he' | 'bal' | 'ms' | 'fi' | 'sv' | 'no' | 'da';

// Language codes mapping for franc detection
const LANGUAGE_MAPPING: Record<string, DetectedLanguage> = {
  // English
  'eng': 'en',
  
  // Chinese
  'cmn': 'zh', // Mandarin
  'zho': 'zh', // Chinese
  'yue': 'zh', // Cantonese
  'wuu': 'zh', // Wu Chinese
  
  // Hindi
  'hin': 'hi',
  
  // Spanish
  'spa': 'es',
  
  // Arabic
  'ara': 'ar',
  'arb': 'ar', // Standard Arabic
  'arz': 'ar', // Egyptian Arabic
  'apc': 'ar', // Levantine Arabic
  
  // French
  'fra': 'fr',
  'fre': 'fr',
  
  // Bengali
  'ben': 'bn',
  
  // Portuguese
  'por': 'pt',
  
  // Russian
  'rus': 'ru',
  
  // Indonesian
  'ind': 'id',
  
  // Urdu
  'urd': 'ur',
  
  // German
  'deu': 'de',
  'ger': 'de',
  
  // Japanese
  'jpn': 'ja',
  
  // Turkish
  'tur': 'tr',
  
  // Korean
  'kor': 'ko',
  
  // Vietnamese
  'vie': 'vi',
  
  // Telugu
  'tel': 'te',
  
  // Marathi
  'mar': 'mr',
  
  // Tamil
  'tam': 'ta',
  
  // Thai
  'tha': 'th',
  
  // Hebrew
  'heb': 'he',
  
  // Balochi
  'bal': 'bal',
  
  // Malay
  'msa': 'ms',
  'may': 'ms',
  
  // Finnish
  'fin': 'fi',
  
  // Swedish
  'swe': 'sv',
  
  // Norwegian
  'nor': 'no',
  'nob': 'no', // Norwegian Bokmål
  'nno': 'no', // Norwegian Nynorsk
  
  // Danish
  'dan': 'da',
  
  // Fallback
  'und': 'en', // Undetermined - default to English
};

// Character ranges for different scripts
const SCRIPT_RANGES = {
  // Arabic script (Arabic, Urdu, Balochi)
  arabic: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/,
  
  // Hebrew script
  hebrew: /[\u0590-\u05FF]/,
  
  // Chinese script (Simplified and Traditional)
  chinese: /[\u4E00-\u9FFF\u3400-\u4DBF]/,
  
  // Devanagari script (Hindi, Marathi)
  devanagari: /[\u0900-\u097F]/,
  
  // Bengali script
  bengali: /[\u0980-\u09FF]/,
  
  // Cyrillic script (Russian)
  cyrillic: /[\u0400-\u04FF]/,
  
  // Japanese scripts (Hiragana, Katakana, Kanji)
  japanese: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/,
  
  // Korean script (Hangul)
  korean: /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/,
  
  // Thai script
  thai: /[\u0E00-\u0E7F]/,
  
  // Telugu script
  telugu: /[\u0C00-\u0C7F]/,
  
  // Tamil script
  tamil: /[\u0B80-\u0BFF]/,
  
  // Vietnamese (Latin with diacritics)
  vietnamese: /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i,
  
  // Latin script (English, Spanish, French, Portuguese, German, Indonesian, Turkish)
  latin: /[a-zA-Z]/,
};

export function detectLanguage(text: string): DetectedLanguage {
  if (!text || text.trim().length === 0) {
    return 'en';
  }

  // Clean the text
  const cleanText = text
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();

  // First, try character-based detection for non-Latin scripts
  const characterBasedResult = detectByCharacters(cleanText);
  if (characterBasedResult !== 'en') {
    return characterBasedResult;
  }

  // For Latin scripts, use franc for more accurate detection
  if (cleanText.length >= 10) {
    try {
      const detected = franc(cleanText);
      const mappedLanguage = LANGUAGE_MAPPING[detected];
      
      if (mappedLanguage) {
        return mappedLanguage;
      }
    } catch (error) {
      console.warn('Language detection failed, falling back to character detection:', error);
    }
  }

  // Final fallback to character-based detection
  return detectByCharacters(cleanText);
}

function detectByCharacters(text: string): DetectedLanguage {
  const scriptCounts = {
    arabic: 0,
    hebrew: 0,
    chinese: 0,
    devanagari: 0,
    bengali: 0,
    cyrillic: 0,
    japanese: 0,
    korean: 0,
    thai: 0,
    telugu: 0,
    tamil: 0,
    vietnamese: 0,
    latin: 0,
  };

  let totalChars = 0;

  // Count characters by script
  for (const char of text) {
    if (SCRIPT_RANGES.arabic.test(char)) {
      scriptCounts.arabic++;
      totalChars++;
    } else if (SCRIPT_RANGES.hebrew.test(char)) {
      scriptCounts.hebrew++;
      totalChars++;
    } else if (SCRIPT_RANGES.chinese.test(char)) {
      scriptCounts.chinese++;
      totalChars++;
    } else if (SCRIPT_RANGES.devanagari.test(char)) {
      scriptCounts.devanagari++;
      totalChars++;
    } else if (SCRIPT_RANGES.bengali.test(char)) {
      scriptCounts.bengali++;
      totalChars++;
    } else if (SCRIPT_RANGES.cyrillic.test(char)) {
      scriptCounts.cyrillic++;
      totalChars++;
    } else if (SCRIPT_RANGES.japanese.test(char)) {
      scriptCounts.japanese++;
      totalChars++;
    } else if (SCRIPT_RANGES.korean.test(char)) {
      scriptCounts.korean++;
      totalChars++;
    } else if (SCRIPT_RANGES.thai.test(char)) {
      scriptCounts.thai++;
      totalChars++;
    } else if (SCRIPT_RANGES.telugu.test(char)) {
      scriptCounts.telugu++;
      totalChars++;
    } else if (SCRIPT_RANGES.tamil.test(char)) {
      scriptCounts.tamil++;
      totalChars++;
    } else if (SCRIPT_RANGES.vietnamese.test(char)) {
      scriptCounts.vietnamese++;
      totalChars++;
    } else if (SCRIPT_RANGES.latin.test(char)) {
      scriptCounts.latin++;
      totalChars++;
    }
  }

  if (totalChars === 0) {
    return 'en';
  }

  // Calculate ratios and determine language
  const threshold = 0.3; // 30% threshold for script detection

  if (scriptCounts.arabic / totalChars > threshold) return 'ar';
  if (scriptCounts.hebrew / totalChars > threshold) return 'he';
  if (scriptCounts.chinese / totalChars > threshold) return 'zh';
  if (scriptCounts.devanagari / totalChars > threshold) return 'hi'; // Could also be Marathi
  if (scriptCounts.bengali / totalChars > threshold) return 'bn';
  if (scriptCounts.cyrillic / totalChars > threshold) return 'ru';
  if (scriptCounts.japanese / totalChars > threshold) return 'ja';
  if (scriptCounts.korean / totalChars > threshold) return 'ko';
  if (scriptCounts.thai / totalChars > threshold) return 'th';
  if (scriptCounts.telugu / totalChars > threshold) return 'te';
  if (scriptCounts.tamil / totalChars > threshold) return 'ta';
  if (scriptCounts.vietnamese / totalChars > threshold) return 'vi';

  // Default to English for Latin scripts
  return 'en';
}

export function isRTL(language: DetectedLanguage): boolean {
  return language === 'ar' || language === 'ur' || language === 'he' || language === 'bal';
}

export function hasRTLCharacters(text: string): boolean {
  return SCRIPT_RANGES.arabic.test(text) || SCRIPT_RANGES.hebrew.test(text);
}

// Detect the primary language of a conversation based on recent messages
export function detectConversationLanguage(messages: Array<{ content: string; role: string }>): DetectedLanguage {
  if (!messages || messages.length === 0) {
    return 'en';
  }

  // Take the last 3 messages for detection (more recent context, more responsive)
  const recentMessages = messages.slice(-3);
  const languageCounts: Record<DetectedLanguage, number> = {
    en: 0, zh: 0, hi: 0, es: 0, ar: 0, fr: 0, bn: 0, pt: 0, ru: 0, id: 0,
    ur: 0, de: 0, ja: 0, tr: 0, ko: 0, vi: 0, te: 0, mr: 0, ta: 0, th: 0, he: 0,
    bal: 0, ms: 0, fi: 0, sv: 0, no: 0, da: 0
  };

  // Weight recent messages more heavily
  for (let i = 0; i < recentMessages.length; i++) {
    const message = recentMessages[i];
    const detected = detectLanguage(message.content);
    
    // Give more weight to more recent messages
    const weight = i === recentMessages.length - 1 ? 3 : (i === recentMessages.length - 2 ? 2 : 1);
    languageCounts[detected] += weight;
  }

  // Return the most frequent language
  return Object.entries(languageCounts).reduce((a, b) => 
    languageCounts[a[0] as DetectedLanguage] > languageCounts[b[0] as DetectedLanguage] ? a : b
  )[0] as DetectedLanguage;
}

// Detect language from current input with minimum confidence threshold
export function detectInputLanguage(text: string, minLength: number = 5): DetectedLanguage | null {
  if (!text || text.trim().length < minLength) {
    return null; // Not enough text to make a confident detection
  }

  const detected = detectLanguage(text);
  
  // For very short text, only return non-English if we're very confident
  if (text.trim().length < 15) {
    // For short text, only switch if we detect non-Latin scripts
    const hasNonLatinScript = 
      SCRIPT_RANGES.arabic.test(text) ||
      SCRIPT_RANGES.hebrew.test(text) ||
      SCRIPT_RANGES.chinese.test(text) ||
      SCRIPT_RANGES.devanagari.test(text) ||
      SCRIPT_RANGES.bengali.test(text) ||
      SCRIPT_RANGES.cyrillic.test(text) ||
      SCRIPT_RANGES.japanese.test(text) ||
      SCRIPT_RANGES.korean.test(text) ||
      SCRIPT_RANGES.thai.test(text) ||
      SCRIPT_RANGES.telugu.test(text) ||
      SCRIPT_RANGES.tamil.test(text);
    
    return hasNonLatinScript ? detected : null;
  }
  
  return detected;
}

// Detect if there's a language switch in the conversation
export function detectLanguageSwitch(
  currentLanguage: DetectedLanguage,
  newMessage: string,
  recentMessages: Array<{ content: string; role: string }> = []
): { shouldSwitch: boolean; newLanguage: DetectedLanguage | null; confidence: number } {
  const detectedFromInput = detectInputLanguage(newMessage, 8);
  
  if (!detectedFromInput || detectedFromInput === currentLanguage) {
    return { shouldSwitch: false, newLanguage: null, confidence: 0 };
  }

  // Calculate confidence based on various factors
  let confidence = 0;

  // Factor 1: Script difference (high confidence for different scripts)
  const currentIsRTL = isRTL(currentLanguage);
  const detectedIsRTL = isRTL(detectedFromInput);
  if (currentIsRTL !== detectedIsRTL) {
    confidence += 0.4; // High confidence for RTL/LTR switch
  }

  // Factor 2: Message length (longer messages = higher confidence)
  const messageLength = newMessage.trim().length;
  if (messageLength > 30) {
    confidence += 0.3;
  } else if (messageLength > 15) {
    confidence += 0.2;
  } else {
    confidence += 0.1;
  }

  // Factor 3: Consistency with recent context
  if (recentMessages.length > 0) {
    const recentLanguages = recentMessages.slice(-2).map(msg => detectLanguage(msg.content));
    const matchesRecent = recentLanguages.some(lang => lang === detectedFromInput);
    if (matchesRecent) {
      confidence += 0.2;
    }
  }

  // Factor 4: Character script dominance
  const scriptDominance = calculateScriptDominance(newMessage, detectedFromInput);
  confidence += scriptDominance * 0.1;

  // Threshold for switching (0.5 = 50% confidence)
  const shouldSwitch = confidence >= 0.5;

  return {
    shouldSwitch,
    newLanguage: shouldSwitch ? detectedFromInput : null,
    confidence
  };
}

// Calculate how dominant the detected script is in the text
function calculateScriptDominance(text: string, language: DetectedLanguage): number {
  const scriptCounts = {
    arabic: 0,
    hebrew: 0,
    chinese: 0,
    devanagari: 0,
    bengali: 0,
    cyrillic: 0,
    japanese: 0,
    korean: 0,
    thai: 0,
    telugu: 0,
    tamil: 0,
    vietnamese: 0,
    latin: 0,
  };

  let totalChars = 0;

  for (const char of text) {
    if (SCRIPT_RANGES.arabic.test(char)) {
      scriptCounts.arabic++;
      totalChars++;
    } else if (SCRIPT_RANGES.hebrew.test(char)) {
      scriptCounts.hebrew++;
      totalChars++;
    } else if (SCRIPT_RANGES.chinese.test(char)) {
      scriptCounts.chinese++;
      totalChars++;
    } else if (SCRIPT_RANGES.devanagari.test(char)) {
      scriptCounts.devanagari++;
      totalChars++;
    } else if (SCRIPT_RANGES.bengali.test(char)) {
      scriptCounts.bengali++;
      totalChars++;
    } else if (SCRIPT_RANGES.cyrillic.test(char)) {
      scriptCounts.cyrillic++;
      totalChars++;
    } else if (SCRIPT_RANGES.japanese.test(char)) {
      scriptCounts.japanese++;
      totalChars++;
    } else if (SCRIPT_RANGES.korean.test(char)) {
      scriptCounts.korean++;
      totalChars++;
    } else if (SCRIPT_RANGES.thai.test(char)) {
      scriptCounts.thai++;
      totalChars++;
    } else if (SCRIPT_RANGES.telugu.test(char)) {
      scriptCounts.telugu++;
      totalChars++;
    } else if (SCRIPT_RANGES.tamil.test(char)) {
      scriptCounts.tamil++;
      totalChars++;
    } else if (SCRIPT_RANGES.vietnamese.test(char)) {
      scriptCounts.vietnamese++;
      totalChars++;
    } else if (SCRIPT_RANGES.latin.test(char)) {
      scriptCounts.latin++;
      totalChars++;
    }
  }

  if (totalChars === 0) return 0;

  // Map language to script and return dominance ratio
  const scriptMap: Record<DetectedLanguage, keyof typeof scriptCounts> = {
    ar: 'arabic', ur: 'arabic', bal: 'arabic',
    he: 'hebrew',
    zh: 'chinese',
    hi: 'devanagari', mr: 'devanagari',
    bn: 'bengali',
    ru: 'cyrillic',
    ja: 'japanese',
    ko: 'korean',
    th: 'thai',
    te: 'telugu',
    ta: 'tamil',
    vi: 'vietnamese',
    // Latin script languages
    en: 'latin', es: 'latin', fr: 'latin', pt: 'latin', de: 'latin',
    id: 'latin', tr: 'latin', ms: 'latin', fi: 'latin', sv: 'latin',
    no: 'latin', da: 'latin'
  };

  const expectedScript = scriptMap[language];
  return expectedScript ? scriptCounts[expectedScript] / totalChars : 0;
} 