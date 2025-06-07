"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { detectLanguage, detectConversationLanguage, isRTL, detectLanguageSwitch } from '@/utils/languageDetection';

type Language = 'en' | 'zh' | 'hi' | 'es' | 'ar' | 'fa' | 'fr' | 'bn' | 'pt' | 'ru' | 'id' | 'ur' | 'de' | 'ja' | 'tr' | 'ko' | 'vi' | 'te' | 'mr' | 'ta' | 'th' | 'he' | 'bal' | 'ms' | 'fi' | 'sv' | 'no' | 'da';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    isRTL: boolean;
    toggleLanguage: () => void;
    detectAndSetLanguage: (text: string) => void;
    detectConversationLanguage: (messages: Array<{ content: string; role: string }>) => void;
    getFontClass: () => string;
    getFontSize: () => string;
    autoDetect: boolean;
    setAutoDetect: (enabled: boolean) => void;
    mounted: boolean;
    getPlaceholderText: () => string;
    detectInputLanguageChange: (text: string, recentMessages?: Array<{ content: string; role: string }>) => void;
    checkLanguageSwitch: (text: string, recentMessages?: Array<{ content: string; role: string }>) => { shouldSwitch: boolean; newLanguage: Language | null; confidence: number };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'preferred_language';
const AUTO_DETECT_KEY = 'auto_detect_language';

// Font configurations for different languages
const FONT_CONFIG = {
    // Latin script languages - Inter (modern, highly legible)
    en: { fontClass: 'font-inter', fontSize: 'text-base' },
    es: { fontClass: 'font-inter', fontSize: 'text-base' },
    fr: { fontClass: 'font-inter', fontSize: 'text-base' },
    pt: { fontClass: 'font-inter', fontSize: 'text-base' },
    de: { fontClass: 'font-inter', fontSize: 'text-base' },
    id: { fontClass: 'font-inter', fontSize: 'text-base' },
    tr: { fontClass: 'font-inter', fontSize: 'text-base' },
    vi: { fontClass: 'font-inter', fontSize: 'text-base' }, // Vietnamese with diacritics

    // Cyrillic script - Source Sans Pro (excellent Cyrillic support)
    ru: { fontClass: 'font-source-sans-pro', fontSize: 'text-base' },

    // Arabic script languages - Noto Naskh Arabic (traditional, highly readable)
    ar: { fontClass: 'font-noto-naskh-arabic', fontSize: 'text-lg' },
    fa: { fontClass: 'font-noto-naskh-arabic', fontSize: 'text-lg' }, // Persian uses Arabic script
    ur: { fontClass: 'font-noto-naskh-arabic', fontSize: 'text-lg' },

    // Hebrew script - Noto Sans Hebrew (modern, clean Hebrew typography)
    he: { fontClass: 'font-noto-sans-hebrew', fontSize: 'text-lg' },

    // Balochi - Arabic script (uses Noto Naskh Arabic)
    bal: { fontClass: 'font-noto-naskh-arabic', fontSize: 'text-lg' },

    // Chinese - Noto Sans SC (comprehensive CJK support)
    zh: { fontClass: 'font-noto-sans-sc', fontSize: 'text-base' },

    // Devanagari script - Noto Sans Devanagari (excellent for Hindi/Marathi)
    hi: { fontClass: 'font-noto-sans-devanagari', fontSize: 'text-base' },
    mr: { fontClass: 'font-noto-sans-devanagari', fontSize: 'text-base' },

    // Bengali script - Noto Sans Bengali
    bn: { fontClass: 'font-noto-sans-bengali', fontSize: 'text-base' },

    // Japanese - Noto Sans JP (optimized for Japanese)
    ja: { fontClass: 'font-noto-sans-jp', fontSize: 'text-base' },

    // Korean - Noto Sans KR (optimized for Korean)
    ko: { fontClass: 'font-noto-sans-kr', fontSize: 'text-base' },

    // Thai - Noto Sans Thai
    th: { fontClass: 'font-noto-sans-thai', fontSize: 'text-base' },

    // Telugu - Noto Sans Telugu
    te: { fontClass: 'font-noto-sans-telugu', fontSize: 'text-base' },

    // Tamil - Noto Sans Tamil
    ta: { fontClass: 'font-noto-sans-tamil', fontSize: 'text-base' },

    // Malay - Inter (excellent Latin script support)
    ms: { fontClass: 'font-inter', fontSize: 'text-base' },

    // Nordic languages - Inter (excellent for Nordic languages with special characters)
    fi: { fontClass: 'font-inter', fontSize: 'text-base' }, // Finnish
    sv: { fontClass: 'font-inter', fontSize: 'text-base' }, // Swedish
    no: { fontClass: 'font-inter', fontSize: 'text-base' }, // Norwegian
    da: { fontClass: 'font-inter', fontSize: 'text-base' }, // Danish
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [language, setLanguageState] = useState<Language>('en'); // Always start with 'en' for SSR
    const [autoDetect, setAutoDetectState] = useState<boolean>(true); // Always start with true for SSR

    const isRTLDirection = isRTL(language);

    // Handle client-side hydration
    useEffect(() => {
        setMounted(true);

        // Load saved preferences after hydration
        const savedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language;
        const savedAutoDetect = localStorage.getItem(AUTO_DETECT_KEY);

        if (savedLanguage && savedLanguage !== language) {
            setLanguageState(savedLanguage);
        }

        if (savedAutoDetect !== null) {
            const autoDetectValue = savedAutoDetect === 'true';
            if (autoDetectValue !== autoDetect) {
                setAutoDetectState(autoDetectValue);
            }
        }
    }, []);

    // Update document attributes when language changes
    useEffect(() => {
        if (!mounted) return; // Don't run on server or before hydration

        // Update localStorage
        localStorage.setItem(LANGUAGE_KEY, language);

        // Update the document's dir attribute
        document.documentElement.dir = isRTLDirection ? 'rtl' : 'ltr';

        // Update the document's lang attribute
        document.documentElement.lang = language;

        // Update body classes for font and direction
        const body = document.body;

        // Remove existing font classes
        body.classList.remove(
            'font-roboto', 'font-cairo', 'font-noto-sans-sc',
            'font-noto-sans-devanagari', 'font-noto-sans-bengali',
            'font-noto-sans-jp', 'font-noto-sans-kr', 'font-noto-sans-thai',
            'font-noto-sans-telugu', 'font-noto-sans-tamil',
            'font-inter', 'font-source-sans-pro', 'font-noto-naskh-arabic',
            'font-noto-sans-hebrew'
        );

        // Add appropriate font class
        body.classList.add(FONT_CONFIG[language].fontClass);

        // Update CSS custom properties for dynamic styling
        const fontFamily = getFontFamilyVariable(language);
        document.documentElement.style.setProperty('--current-font-family', fontFamily);
        document.documentElement.style.setProperty('--current-font-size', FONT_CONFIG[language].fontSize);
    }, [language, isRTLDirection, mounted]);

    // Update auto-detect setting
    useEffect(() => {
        if (!mounted) return; // Don't run on server or before hydration
        localStorage.setItem(AUTO_DETECT_KEY, autoDetect.toString());
    }, [autoDetect, mounted]);

    const getFontFamilyVariable = (lang: Language): string => {
        const fontMap: Record<string, string> = {
            'font-roboto': 'var(--font-roboto)',
            'font-cairo': 'var(--font-cairo)',
            'font-inter': 'var(--font-inter)',
            'font-source-sans-pro': 'var(--font-source-sans-pro)',
            'font-noto-naskh-arabic': 'var(--font-noto-naskh-arabic)',
            'font-noto-sans-hebrew': 'var(--font-noto-sans-hebrew)',
            'font-noto-sans-sc': 'var(--font-noto-sans-sc)',
            'font-noto-sans-devanagari': 'var(--font-noto-sans-devanagari)',
            'font-noto-sans-bengali': 'var(--font-noto-sans-bengali)',
            'font-noto-sans-jp': 'var(--font-noto-sans-jp)',
            'font-noto-sans-kr': 'var(--font-noto-sans-kr)',
            'font-noto-sans-thai': 'var(--font-noto-sans-thai)',
            'font-noto-sans-telugu': 'var(--font-noto-sans-telugu)',
            'font-noto-sans-tamil': 'var(--font-noto-sans-tamil)',
        };
        return fontMap[FONT_CONFIG[lang].fontClass] || 'var(--font-inter)';
    };

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
    }, []);

    const setAutoDetect = useCallback((enabled: boolean) => {
        setAutoDetectState(enabled);
    }, []);

    const toggleLanguage = useCallback(() => {
        setLanguageState(prevLang => {
            // Cycle through the most common languages
            const commonLanguages: Language[] = ['en', 'zh', 'hi', 'es', 'ar', 'he', 'fr', 'sv', 'fi', 'no', 'da'];
            const currentIndex = commonLanguages.indexOf(prevLang);
            const nextIndex = (currentIndex + 1) % commonLanguages.length;
            return commonLanguages[nextIndex];
        });
    }, []);

    const detectAndSetLanguage = useCallback((text: string) => {
        if (!autoDetect || !text.trim()) return;

        const detected = detectLanguage(text);
        if (detected !== language) {
            console.log(`Language detected: ${detected}, switching from ${language}`);
            setLanguageState(detected);
        }
    }, [autoDetect, language]);

    const detectConversationLanguageAndSet = useCallback((messages: Array<{ content: string; role: string }>) => {
        if (!autoDetect || !messages.length) return;

        const detected = detectConversationLanguage(messages);
        if (detected !== language) {
            console.log(`Conversation language detected: ${detected}, switching from ${language}`);
            setLanguageState(detected);
        }
    }, [autoDetect, language]);

    const getFontClass = useCallback(() => {
        return FONT_CONFIG[language].fontClass;
    }, [language]);

    const getFontSize = useCallback(() => {
        return FONT_CONFIG[language].fontSize;
    }, [language]);

    const getPlaceholderText = useCallback(() => {
        const placeholders: Record<Language, string> = {
            // Latin script languages
            en: 'Type your message...',
            es: 'Escribe tu mensaje...',
            fr: 'Tapez votre message...',
            pt: 'Digite sua mensagem...',
            de: 'Geben Sie Ihre Nachricht ein...',
            id: 'Ketik pesan Anda...',
            tr: 'Mesajınızı yazın...',
            vi: 'Nhập tin nhắn của bạn...',
            ms: 'Taip mesej anda...',
            fi: 'Kirjoita viestisi...',
            sv: 'Skriv ditt meddelande...',
            no: 'Skriv meldingen din...',
            da: 'Skriv din besked...',

            // Cyrillic script
            ru: 'Введите ваше сообщение...',

            // Arabic script languages (RTL)
            ar: 'اكتب رسالتك...',
            fa: 'پیام خود را تایپ کنید...', // Persian
            ur: 'اپنا پیغام ٹائپ کریں...',
            bal: 'اپنا پیغام ٹائپ کریں...',

            // Hebrew script (RTL)
            he: 'הקלד את ההודעה שלך...',

            // Chinese script
            zh: '输入您的消息...',

            // Devanagari script
            hi: 'अपना संदेश टाइप करें...',
            mr: 'तुमचा संदेश टाइप करा...',

            // Bengali script
            bn: 'আপনার বার্তা টাইপ করুন...',

            // Japanese script
            ja: 'メッセージを入力してください...',

            // Korean script
            ko: '메시지를 입력하세요...',

            // Thai script
            th: 'พิมพ์ข้อความของคุณ...',

            // Telugu script
            te: 'మీ సందేశాన్ని టైప్ చేయండి...',

            // Tamil script
            ta: 'உங்கள் செய்தியை தட்டச்சு செய்யுங்கள்...',
        };

        return placeholders[language] || placeholders.en;
    }, [language]);

    const detectInputLanguageChange = useCallback((text: string, recentMessages?: Array<{ content: string; role: string }>) => {
        if (!autoDetect || !text.trim()) return;

        const switchResult = detectLanguageSwitch(language, text, recentMessages || []);
        if (switchResult.shouldSwitch && switchResult.newLanguage) {
            console.log(`Language switch detected: ${switchResult.newLanguage}, confidence: ${switchResult.confidence}, switching from ${language}`);
            setLanguageState(switchResult.newLanguage);
        }
    }, [autoDetect, language]);

    const checkLanguageSwitch = useCallback((text: string, recentMessages?: Array<{ content: string; role: string }>) => {
        if (!autoDetect || !text.trim()) return { shouldSwitch: false, newLanguage: null, confidence: 0 };

        const switchResult = detectLanguageSwitch(language, text, recentMessages || []);
        return {
            shouldSwitch: switchResult.shouldSwitch,
            newLanguage: switchResult.newLanguage,
            confidence: switchResult.confidence
        };
    }, [autoDetect, language]);

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            isRTL: isRTLDirection,
            toggleLanguage,
            detectAndSetLanguage,
            detectConversationLanguage: detectConversationLanguageAndSet,
            getFontClass,
            getFontSize,
            autoDetect,
            setAutoDetect,
            mounted,
            getPlaceholderText,
            detectInputLanguageChange,
            checkLanguageSwitch
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
} 