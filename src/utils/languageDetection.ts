import { franc } from 'franc';

export type DetectedLanguage = 'en' | 'zh' | 'hi' | 'es' | 'ar' | 'fa' | 'fr' | 'bn' | 'pt' | 'ru' | 'id' | 'ur' | 'de' | 'ja' | 'tr' | 'ko' | 'vi' | 'te' | 'mr' | 'ta' | 'th' | 'he' | 'bal' | 'ms' | 'fi' | 'sv' | 'no' | 'da';

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
  
  // Persian/Farsi
  'fas': 'fa', // Persian
  'per': 'fa', // Persian (alternative code)
  'prs': 'fa', // Dari Persian (detected by franc for Persian text)
  
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

// Enhanced language-specific keyword patterns for short text detection
const LANGUAGE_KEYWORDS: Record<DetectedLanguage, RegExp[]> = {
  // English
  en: [
    /\b(the|and|you|that|have|for|not|with|this|but|his|from|they|she|her|been|than|its|who|did)\b/gi,
    /\b(what|your|when|him|my|me|will|if|no|do|would|my|so|about|out|many|then|them|these|so)\b/gi,
    /\b(how|can|could|should|would|will|going|get|got|make|take|come|go|see|know|think|want)\b/gi
  ],
  
  // Arabic
  ar: [
    /\b(في|من|إلى|على|عن|مع|هذا|هذه|ذلك|تلك|التي|الذي|كان|كانت|يكون|تكون|له|لها|لكم|لنا)\b/g,
    /\b(ما|كيف|أين|متى|لماذا|من|أي|هل|نعم|لا|شكرا|مرحبا|السلام|عليكم|وعليكم|السلام)\b/g,
    /\b(أريد|أحتاج|أحب|أعرف|أفهم|أستطيع|يمكن|يجب|سوف|قد|لقد|منذ|حتى|بعد|قبل)\b/g
  ],
  
  // Persian/Farsi
  fa: [
    /\b(در|از|به|با|را|این|آن|که|هست|است|بود|می|خواهد|باید|کرد|کند|برای|تا|یا)\b/g,
    /\b(چه|چگونه|کجا|کی|چرا|کیست|کدام|بله|خیر|متشکرم|سلام|درود|لطفا|ببخشید)\b/g,
    /\b(می‌خواهم|احتیاج|دوست|می‌دانم|می‌فهمم|می‌توانم|باید|می‌روم|هستم|می‌کنم|می‌گویم)\b/g
  ],
  
  // Hebrew
  he: [
    /\b(את|של|על|עם|אל|כל|זה|זו|הזה|הזאת|שהוא|שהיא|היה|הייתי|יהיה|תהיה|לו|לה|לכם|לנו)\b/g,
    /\b(מה|איך|איפה|מתי|למה|מי|איזה|האם|כן|לא|תודה|שלום|ברוך|הבא|טוב|רע)\b/g,
    /\b(רוצה|צריך|אוהב|יודע|מבין|יכול|אפשר|חייב|אני|אתה|את|הוא|היא|אנחנו|אתם|הם)\b/g
  ],
  
  // Spanish
  es: [
    /\b(el|la|de|que|y|a|en|un|es|se|no|te|lo|le|da|su|por|son|con|para|como|pero|bien|así)\b/gi,
    /\b(qué|cómo|dónde|cuándo|por qué|quién|cuál|sí|hola|gracias|por favor|perdón|disculpe)\b/gi,
    /\b(quiero|necesito|me gusta|sé|entiendo|puedo|puede|debe|voy|está|tengo|hago|digo)\b/gi
  ],
  
  // French
  fr: [
    /\b(le|de|et|à|un|il|être|et|en|avoir|que|pour|dans|ce|son|une|sur|avec|ne|se|pas|tout)\b/gi,
    /\b(qu'|quoi|comment|où|quand|pourquoi|qui|quel|oui|non|merci|bonjour|salut|s'il vous plaît)\b/gi,
    /\b(je veux|j'ai besoin|j'aime|je sais|je comprends|je peux|peut|doit|vais|suis|fais|dis)\b/gi
  ],
  
  // German
  de: [
    /\b(der|die|das|und|in|zu|den|von|ist|mit|für|auf|werden|aus|an|sich|auch|nach|bei|eine)\b/gi,
    /\b(was|wie|wo|wann|warum|wer|welche|ja|nein|danke|hallo|guten tag|bitte|entschuldigung)\b/gi,
    /\b(ich will|ich brauche|ich mag|ich weiß|ich verstehe|ich kann|kann|muss|gehe|bin|mache|sage)\b/gi
  ],
  
  // Chinese
  zh: [
    /[的|一|是|在|不|了|有|和|人|这|中|大|为|上|个|国|我|以|要|他|时|来|用|们|生|到|作|地|于]/g,
    /[什么|怎么|哪里|什么时候|为什么|谁|哪个|是的|不是|谢谢|你好|请|对不起]/g,
    /[我想|我需要|我喜欢|我知道|我明白|我可以|可以|必须|会|去|做|说]/g
  ],
  
  // Russian
  ru: [
    /\b(в|и|не|на|я|быть|то|он|оно|как|его|к|этот|она|до|вы|нет|от|за|что|эти|при|или)\b/gi,
    /\b(что|как|где|когда|почему|кто|какой|да|нет|спасибо|привет|пожалуйста|извините)\b/gi,
    /\b(я хочу|мне нужно|мне нравится|я знаю|я понимаю|я могу|можно|нужно|иду|делаю|говорю)\b/gi
  ],
  
  // Urdu
  ur: [
    /\b(میں|سے|کو|نے|کا|کی|کے|یہ|وہ|اس|ان|ہے|ہیں|تھا|تھی|گا|گی|ہوں|ہو|ہوگا)\b/g,
    /\b(کیا|کیسے|کہاں|کب|کیوں|کون|کونسا|ہاں|نہیں|شکریہ|السلام علیکم|آپ|مہربانی)\b/g,
    /\b(چاہتا|چاہیے|پسند|جانتا|سمجھتا|سکتا|ہے|جانا|کرنا|کہنا|دینا|لینا|آنا)\b/g
  ],
  
  // Japanese
  ja: [
    /[の|に|は|を|が|と|で|から|まで|より|へ|か|も|や|など|こと|もの|時|人|方|場合|中]/g,
    /[何|どう|どこ|いつ|なぜ|誰|どの|はい|いいえ|ありがとう|こんにちは|すみません|お願い]/g,
    /[したい|必要|好き|知って|分かって|できる|する|行く|来る|見る|言う|思う]/g
  ],
  
  // Korean
  ko: [
    /[이|가|을|를|에|에서|으로|와|과|의|도|만|까지|부터|보다|처럼|같이|하고|그리고]/g,
    /[무엇|어떻게|어디|언제|왜|누구|어느|네|아니오|감사|안녕|하세요|죄송|부탁]/g,
    /[하고|싶어|필요|좋아|알아|이해|할|수|있어|가다|오다|보다|말하다|생각하다]/g
  ],
  
  // Hindi
  hi: [
    /\b(में|से|को|ने|का|की|के|यह|वह|इस|उस|है|हैं|था|थी|गा|गी|हूं|हो|होगा)\b/g,
    /\b(क्या|कैसे|कहां|कब|क्यों|कौन|कौन सा|हां|नहीं|धन्यवाद|नमस्ते|कृपया|माफ करें)\b/g,
    /\b(चाहता|चाहिए|पसंद|जानता|समझता|सकता|करना|जाना|आना|देखना|कहना|सोचना)\b/g
  ],
  
  // Add more languages with minimal patterns for others
  // ... (keeping it concise for now, but can be expanded)
  pt: [/\b(o|a|de|que|e|do|da|em|um|para|com|não|uma|os|no|se|na|por|mais|as|dos|como)\b/gi],
  tr: [/\b(bir|bu|ve|için|ile|var|olan|da|de|den|den|gibi|kadar|çok|daha|en|mi|mı)\b/gi],
  vi: [/\b(của|và|có|được|trong|để|với|từ|về|theo|như|khi|nếu|đã|sẽ|rất|nhiều)\b/gi],
  th: [/[ใน|และ|ที่|เป็น|การ|ของ|มี|จะ|ได้|แล้ว|กับ|ให้|ไป|มา|ดี|ไม่|หรือ|เอา]/g],
  bn: [/\b(এবং|যে|একটি|এই|সে|তার|করা|হয়|দিয়ে|থেকে|জন্য|আছে|করেছে|বলেছেন)\b/g],
  te: [/[మరియు|ఒక|ఈ|ఆ|అతను|ఆమె|చేసిన|ఉంది|తో|నుండి|కోసం|ఉన్నాయి]/g],
  mr: [/\b(आणि|एक|हा|तो|ती|केले|आहे|सह|पासून|साठी|आहेत|म्हणाले)\b/g],
  ta: [/[மற்றும்|ஒரு|இந்த|அந்த|அவர்|அவள்|செய்த|உள்ளது|உடன்|இருந்து|க்காக]/g],
  fi: [/\b(ja|on|että|ei|se|olla|hän|kaikki|mutta|vain|niin|jos|kun|nyt|sitten|hyvin)\b/gi],
  sv: [/\b(och|i|att|det|som|på|de|av|för|är|den|till|en|om|så|men|han|har|hon|över)\b/gi],
  no: [/\b(og|i|å|det|som|på|de|av|for|er|den|til|en|om|så|men|han|har|hun|over)\b/gi],
  da: [/\b(og|i|at|det|som|på|de|af|for|er|den|til|en|om|så|men|han|har|hun|over)\b/gi],
  id: [/\b(dan|yang|di|untuk|dengan|dari|pada|atau|ini|itu|akan|adalah|telah|sudah)\b/gi],
  ms: [/\b(dan|yang|di|untuk|dengan|dari|pada|atau|ini|itu|akan|adalah|telah|sudah)\b/gi],
  bal: [/\b(u|ay|gon|ke|sara|ant|be|pa|na|wat|man|tu|ey|war|chi|day)\b/gi] // Balochi basic words
};

// Helper function to detect Urdu-specific patterns
function detectUrduPatterns(text: string): { isUrdu: boolean; confidence: number } {
  // Urdu-specific letters and patterns that are rare in Arabic
  const urduSpecificPatterns = [
    /[ٹڈڑںہے]/g, // Urdu-specific letters: ٹ ڈ ڑ ں ہ ے
    /کا\s|کی\s|کے\s/g, // Common Urdu particles
    /یہ\s|وہ\s|ان\s/g, // Common Urdu pronouns
    /ہے\s|ہیں\s|تھا\s|تھی\s/g, // Common Urdu verb forms
    /میں\s|سے\s|کو\s|نے\s/g, // Common Urdu postpositions
    /آپ\s|ہم\s|تم\s/g, // Common Urdu personal pronouns
  ];
  
  let urduMatches = 0;
  let totalMatches = 0;
  
  urduSpecificPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      urduMatches += matches.length;
      totalMatches += matches.length;
    }
  });
  
  // Check for Urdu-specific characters
  const urduChars = text.match(/[ٹڈڑںہے]/g);
  const urduCharCount = urduChars ? urduChars.length : 0;
  
  // Calculate confidence based on Urdu-specific features
  const textLength = text.length;
  const urduCharRatio = urduCharCount / textLength;
  const urduPatternRatio = urduMatches / Math.max(1, textLength / 10); // Normalize by text length
  
  const confidence = Math.min(1.0, (urduCharRatio * 2) + (urduPatternRatio * 0.5));
  const isUrdu = confidence > 0.1 || urduCharCount > 0; // Any Urdu-specific character is a strong indicator
  
  return { isUrdu, confidence };
}

// Enhanced keyword-based detection for short text
function detectByKeywords(text: string): { language: DetectedLanguage | null; confidence: number } {
  const cleanText = text.toLowerCase();
  const results: Array<{ language: DetectedLanguage; confidence: number }> = [];
  
  // Test each language's keywords
  Object.entries(LANGUAGE_KEYWORDS).forEach(([lang, patterns]) => {
    let matches = 0;
    let totalPatternLength = 0;
    
    patterns.forEach(pattern => {
      const patternMatches = cleanText.match(pattern);
      if (patternMatches) {
        matches += patternMatches.length;
        totalPatternLength += patternMatches.join('').length;
      }
    });
    
    if (matches > 0) {
      // Calculate confidence based on matches and text coverage
      const textLength = text.length;
      const coverage = totalPatternLength / textLength;
      const density = matches / Math.max(1, textLength / 10);
      
      const confidence = Math.min(0.9, (coverage * 0.6) + (density * 0.4));
      
      if (confidence > 0.1) {
        results.push({ language: lang as DetectedLanguage, confidence });
      }
    }
  });
  
  // Return the highest confidence match
  if (results.length > 0) {
    const best = results.sort((a, b) => b.confidence - a.confidence)[0];
    return { language: best.language, confidence: best.confidence };
  }
  
  return { language: null, confidence: 0 };
}

// Enhanced main detection function
export function detectLanguage(text: string): DetectedLanguage {
  if (!text || text.trim().length === 0) {
    return 'en';
  }

  // Clean the text
  const cleanText = text
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();

  const textLength = cleanText.length;

  // For very short text (1-5 characters), use script-based detection only
  if (textLength <= 5) {
    return detectByCharacters(cleanText);
  }

  // For short text (6-15 characters), combine script and keyword detection
  if (textLength <= 15) {
    const scriptResult = detectByCharacters(cleanText);
    if (scriptResult !== 'en') {
      return scriptResult; // Non-Latin scripts are reliable even for short text
    }
    
    // For Latin scripts, try keyword detection
    const keywordResult = detectByKeywords(cleanText);
    if (keywordResult.language && keywordResult.confidence > 0.3) {
      return keywordResult.language;
    }
    
    return 'en'; // Default for short Latin text
  }

  // For medium text (16-30 characters), use enhanced detection
  if (textLength <= 30) {
    // First check for Arabic script languages
    const arabicMatches = cleanText.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g);
    const arabicRatio = (arabicMatches || []).length / cleanText.length;
    
    if (arabicRatio > 0.2) { // Lower threshold for shorter text
      // Check for Urdu patterns first
      const urduPatterns = detectUrduPatterns(cleanText);
      if (urduPatterns.isUrdu && urduPatterns.confidence > 0.15) {
        return 'ur';
      }
      
      // Try Franc for Arabic script
      try {
        const detected = franc(cleanText);
        const mappedLanguage = LANGUAGE_MAPPING[detected];
        if (mappedLanguage && (mappedLanguage === 'ar' || mappedLanguage === 'fa' || mappedLanguage === 'ur' || mappedLanguage === 'bal')) {
          return mappedLanguage;
        }
      } catch (error) {
        console.warn('Franc detection failed for Arabic script:', error);
      }
      
      return 'ar'; // Default for Arabic script
    }
    
    // For non-Arabic scripts, try character-based detection first
    const characterResult = detectByCharacters(cleanText);
    if (characterResult !== 'en') {
      return characterResult;
    }
    
    // For Latin scripts, combine keyword and Franc detection
    const keywordResult = detectByKeywords(cleanText);
    if (keywordResult.language && keywordResult.confidence > 0.25) {
      return keywordResult.language;
    }
    
    // Try Franc as fallback
    try {
      const detected = franc(cleanText);
      const mappedLanguage = LANGUAGE_MAPPING[detected];
      if (mappedLanguage && detected !== 'und') {
        return mappedLanguage;
      }
    } catch (error) {
      console.warn('Language detection failed, falling back to keyword detection:', error);
    }
    
    return 'en';
  }

  // For longer text (31+ characters), use the original sophisticated approach
  // First check if it's Arabic script (includes Arabic, Urdu, Balochi)
  const arabicMatches = cleanText.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g);
  const arabicRatio = (arabicMatches || []).length / cleanText.length;
  
  // For Arabic script languages, prioritize franc detection for better accuracy
  if (arabicRatio > 0.3) {
    try {
      const detected = franc(cleanText);
      console.log(`🔍 [Enhanced Language Detection] Franc detected: ${detected} for text: ${cleanText.substring(0, 50)}...`);
      const mappedLanguage = LANGUAGE_MAPPING[detected];
      
      if (mappedLanguage && (mappedLanguage === 'ar' || mappedLanguage === 'fa' || mappedLanguage === 'ur' || mappedLanguage === 'bal')) {
        console.log(`✅ [Enhanced Language Detection] Successfully detected ${mappedLanguage} via Franc`);
        return mappedLanguage;
      }
      
      // If Franc detected something else, let's check for Urdu-specific patterns
      if (detected === 'und' || !mappedLanguage) {
        console.log(`🔍 [Enhanced Language Detection] Franc failed, checking for Urdu patterns...`);
        const urduPatterns = detectUrduPatterns(cleanText);
        if (urduPatterns.isUrdu) {
          console.log(`✅ [Enhanced Language Detection] Detected as Urdu via patterns (confidence: ${urduPatterns.confidence})`);
          return 'ur';
        }
      }
    } catch (error) {
      console.warn('Franc detection failed for Arabic script:', error);
    }
    
    // Enhanced fallback - check for Urdu patterns before defaulting to Arabic
    const urduPatterns = detectUrduPatterns(cleanText);
    if (urduPatterns.isUrdu) {
      console.log(`✅ [Enhanced Language Detection] Fallback detected Urdu via patterns`);
      return 'ur';
    }
    
    console.log(`⚠️ [Enhanced Language Detection] Defaulting to Arabic for Arabic script text`);
    return 'ar';
  }

  // For non-Arabic scripts, try character-based detection first
  const characterBasedResult = detectByCharacters(cleanText);
  if (characterBasedResult !== 'en') {
    return characterBasedResult;
  }

  // For Latin scripts, combine keyword detection with Franc
  const keywordResult = detectByKeywords(cleanText);
  
  // Try Franc for Latin scripts
  try {
    const detected = franc(cleanText);
    const mappedLanguage = LANGUAGE_MAPPING[detected];
    
    if (mappedLanguage && detected !== 'und') {
      // If both keyword and Franc agree, high confidence
      if (keywordResult.language === mappedLanguage && keywordResult.confidence > 0.3) {
        console.log(`✅ [Enhanced Language Detection] High confidence: ${mappedLanguage} (Keyword + Franc agreement)`);
        return mappedLanguage;
      }
      
      // If only Franc detected, use it for longer text
      if (textLength > 50) {
        return mappedLanguage;
      }
      
      // For medium text, prefer keyword detection if confident
      if (keywordResult.language && keywordResult.confidence > 0.4) {
        return keywordResult.language;
      }
      
      return mappedLanguage;
    }
  } catch (error) {
    console.warn('Language detection failed, falling back to keyword detection:', error);
  }

  // If Franc failed but keywords detected something, use keywords
  if (keywordResult.language && keywordResult.confidence > 0.3) {
    return keywordResult.language;
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
  return language === 'ar' || language === 'fa' || language === 'ur' || language === 'he' || language === 'bal';
}

export function hasRTLCharacters(text: string): boolean {
  return SCRIPT_RANGES.arabic.test(text) || SCRIPT_RANGES.hebrew.test(text);
}

// Enhanced conversation language detection
export function detectConversationLanguage(messages: Array<{ content: string; role: string }>): DetectedLanguage {
  if (!messages || messages.length === 0) {
    return 'en';
  }

  // Take the last 5 messages for better context (increased from 3)
  const recentMessages = messages.slice(-5);
  const languageCounts: Record<DetectedLanguage, number> = {
    en: 0, zh: 0, hi: 0, es: 0, ar: 0, fa: 0, fr: 0, bn: 0, pt: 0, ru: 0, id: 0,
    ur: 0, de: 0, ja: 0, tr: 0, ko: 0, vi: 0, te: 0, mr: 0, ta: 0, th: 0, he: 0,
    bal: 0, ms: 0, fi: 0, sv: 0, no: 0, da: 0
  };

  // Weight recent messages more heavily and consider message length
  for (let i = 0; i < recentMessages.length; i++) {
    const message = recentMessages[i];
    const detected = detectLanguage(message.content);
    
    // Give more weight to more recent messages and longer messages
    const recencyWeight = i === recentMessages.length - 1 ? 4 : (i === recentMessages.length - 2 ? 3 : (i === recentMessages.length - 3 ? 2 : 1));
    const lengthWeight = Math.min(2, message.content.length / 20); // Longer messages get more weight
    const finalWeight = recencyWeight * Math.max(1, lengthWeight);
    
    languageCounts[detected] += finalWeight;
  }

  // Return the most frequent language
  return Object.entries(languageCounts).reduce((a, b) => 
    languageCounts[a[0] as DetectedLanguage] > languageCounts[b[0] as DetectedLanguage] ? a : b
  )[0] as DetectedLanguage;
}

// Enhanced input language detection with better confidence handling
export function detectInputLanguage(text: string, minLength: number = 3): DetectedLanguage | null {
  if (!text || text.trim().length < minLength) {
    return null; // Not enough text to make a confident detection
  }

  const detected = detectLanguage(text);
  const textLength = text.trim().length;
  
  // For very short text (3-8 characters), only return non-English if we're very confident
  if (textLength < 8) {
    // For short text, only switch if we detect non-Latin scripts or strong keyword matches
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
    
    if (hasNonLatinScript) {
      return detected;
    }
    
    // For Latin scripts, check keyword confidence
    const keywordResult = detectByKeywords(text);
    if (keywordResult.language && keywordResult.confidence > 0.4) {
      return keywordResult.language;
    }
    
    return null; // Not confident enough for short Latin text
  }
  
  // For longer text, use the detection result
  return detected;
}

// Detect if there's a language switch in the conversation
export function detectLanguageSwitch(
  currentLanguage: DetectedLanguage,
  newMessage: string,
  recentMessages: Array<{ content: string; role: string }> = []
): { shouldSwitch: boolean; newLanguage: DetectedLanguage | null; confidence: number } {
  const detectedFromInput = detectInputLanguage(newMessage, 5); // Lowered minimum length
  
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
  } else {
    confidence += 0.2; // Some confidence for same script family
  }

  // Factor 2: Message length (longer messages = higher confidence)
  const messageLength = newMessage.trim().length;
  if (messageLength > 50) {
    confidence += 0.3;
  } else if (messageLength > 20) {
    confidence += 0.25;
  } else if (messageLength > 10) {
    confidence += 0.15;
  } else {
    confidence += 0.1;
  }

  // Factor 3: Keyword detection confidence
  const keywordResult = detectByKeywords(newMessage);
  if (keywordResult.language === detectedFromInput) {
    confidence += keywordResult.confidence * 0.2;
  }

  // Factor 4: Consistency with recent context
  if (recentMessages.length > 0) {
    const recentLanguages = recentMessages.slice(-2).map(msg => detectLanguage(msg.content));
    const matchesRecent = recentLanguages.some(lang => lang === detectedFromInput);
    if (matchesRecent) {
      confidence += 0.15;
    }
  }

  // Factor 5: Character script dominance
  const scriptDominance = calculateScriptDominance(newMessage, detectedFromInput);
  confidence += scriptDominance * 0.1;

  // Threshold for switching (0.4 = 40% confidence, lowered from 50% for better responsiveness)
  const shouldSwitch = confidence >= 0.4;

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
    ar: 'arabic', fa: 'arabic', ur: 'arabic', bal: 'arabic',
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