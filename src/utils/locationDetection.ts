// Enhanced location data interface
export interface LocationData {
    country: string;
    countryCode: string;
    city?: string;
    region?: string;
    timezone?: string;
    detectionMethod?: 'browser-only';
    confidence?: 'high' | 'medium' | 'low';
    browserInfo?: {
        language: string;
        languages: string[];
        locale: string;
        timezone: string;
    };
}

// Helper function to get country flag emoji from country code
export const getCountryFlag = (countryCode: string): string => {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    
    const flags: Record<string, string> = {
        'AD': '🇦🇩', 'AE': '🇦🇪', 'AF': '🇦🇫', 'AG': '🇦🇬', 'AI': '🇦🇮', 'AL': '🇦🇱', 'AM': '🇦🇲', 'AO': '🇦🇴',
        'AQ': '🇦🇶', 'AR': '🇦🇷', 'AS': '🇦🇸', 'AT': '🇦🇹', 'AU': '🇦🇺', 'AW': '🇦🇼', 'AX': '🇦🇽', 'AZ': '🇦🇿',
        'BA': '🇧🇦', 'BB': '🇧🇧', 'BD': '🇧🇩', 'BE': '🇧🇪', 'BF': '🇧🇫', 'BG': '🇧🇬', 'BH': '🇧🇭', 'BI': '🇧🇮',
        'BJ': '🇧🇯', 'BL': '🇧🇱', 'BM': '🇧🇲', 'BN': '🇧🇳', 'BO': '🇧🇴', 'BQ': '🇧🇶', 'BR': '🇧🇷', 'BS': '🇧🇸',
        'BT': '🇧🇹', 'BV': '🇧🇻', 'BW': '🇧🇼', 'BY': '🇧🇾', 'BZ': '🇧🇿', 'CA': '🇨🇦', 'CC': '🇨🇨', 'CD': '🇨🇩',
        'CF': '🇨🇫', 'CG': '🇨🇬', 'CH': '🇨🇭', 'CI': '🇨🇮', 'CK': '🇨🇰', 'CL': '🇨🇱', 'CM': '🇨🇲', 'CN': '🇨🇳',
        'CO': '🇨🇴', 'CR': '🇨🇷', 'CU': '🇨🇺', 'CV': '🇨🇻', 'CW': '🇨🇼', 'CX': '🇨🇽', 'CY': '🇨🇾', 'CZ': '🇨🇿',
        'DE': '🇩🇪', 'DJ': '🇩🇯', 'DK': '🇩🇰', 'DM': '🇩🇲', 'DO': '🇩🇴', 'DZ': '🇩🇿', 'EC': '🇪🇨', 'EE': '🇪🇪',
        'EG': '🇪🇬', 'EH': '🇪🇭', 'ER': '🇪🇷', 'ES': '🇪🇸', 'ET': '🇪🇹', 'FI': '🇫🇮', 'FJ': '🇫🇯', 'FK': '🇫🇰',
        'FM': '🇫🇲', 'FO': '🇫🇴', 'FR': '🇫🇷', 'GA': '🇬🇦', 'GB': '🇬🇧', 'GD': '🇬🇩', 'GE': '🇬🇪', 'GF': '🇬🇫',
        'GG': '🇬🇬', 'GH': '🇬🇭', 'GI': '🇬🇮', 'GL': '🇬🇱', 'GM': '🇬🇲', 'GN': '🇬🇳', 'GP': '🇬🇵', 'GQ': '🇬🇶',
        'GR': '🇬🇷', 'GS': '🇬🇸', 'GT': '🇬🇹', 'GU': '🇬🇺', 'GW': '🇬🇼', 'GY': '🇬🇾', 'HK': '🇭🇰', 'HM': '🇭🇲',
        'HN': '🇭🇳', 'HR': '🇭🇷', 'HT': '🇭🇹', 'HU': '🇭🇺', 'ID': '🇮🇩', 'IE': '🇮🇪', 'IL': '🇮🇱', 'IM': '🇮🇲',
        'IN': '🇮🇳', 'IO': '🇮🇴', 'IQ': '🇮🇶', 'IR': '🇮🇷', 'IS': '🇮🇸', 'IT': '🇮🇹', 'JE': '🇯🇪', 'JM': '🇯🇲',
        'JO': '🇯🇴', 'JP': '🇯🇵', 'KE': '🇰🇪', 'KG': '🇰🇬', 'KH': '🇰🇭', 'KI': '🇰🇮', 'KM': '🇰🇲', 'KN': '🇰🇳',
        'KP': '🇰🇵', 'KR': '🇰🇷', 'KW': '🇰🇼', 'KY': '🇰🇾', 'KZ': '🇰🇿', 'LA': '🇱🇦', 'LB': '🇱🇧', 'LC': '🇱🇨',
        'LI': '🇱🇮', 'LK': '🇱🇰', 'LR': '🇱🇷', 'LS': '🇱🇸', 'LT': '🇱🇹', 'LU': '🇱🇺', 'LV': '🇱🇻', 'LY': '🇱🇾',
        'MA': '🇲🇦', 'MC': '🇲🇨', 'MD': '🇲🇩', 'ME': '🇲🇪', 'MF': '🇲🇫', 'MG': '🇲🇬', 'MH': '🇲🇭', 'MK': '🇲🇰',
        'ML': '🇲🇱', 'MM': '🇲🇲', 'MN': '🇲🇳', 'MO': '🇲🇴', 'MP': '🇲🇵', 'MQ': '🇲🇶', 'MR': '🇲🇷', 'MS': '🇲🇸',
        'MT': '🇲🇹', 'MU': '🇲🇺', 'MV': '🇲🇻', 'MW': '🇲🇼', 'MX': '🇲🇽', 'MY': '🇲🇾', 'MZ': '🇲🇿', 'NA': '🇳🇦',
        'NC': '🇳🇨', 'NE': '🇳🇪', 'NF': '🇳🇫', 'NG': '🇳🇬', 'NI': '🇳🇮', 'NL': '🇳🇱', 'NO': '🇳🇴', 'NP': '🇳🇵',
        'NR': '🇳🇷', 'NU': '🇳🇺', 'NZ': '🇳🇿', 'OM': '🇴🇲', 'PA': '🇵🇦', 'PE': '🇵🇪', 'PF': '🇵🇫', 'PG': '🇵🇬',
        'PH': '🇵🇭', 'PK': '🇵🇰', 'PL': '🇵🇱', 'PM': '🇵🇲', 'PN': '🇵🇳', 'PR': '🇵🇷', 'PS': '🇵🇸', 'PT': '🇵🇹',
        'PW': '🇵🇼', 'PY': '🇵🇾', 'QA': '🇶🇦', 'RE': '🇷🇪', 'RO': '🇷🇴', 'RS': '🇷🇸', 'RU': '🇷🇺', 'RW': '🇷🇼',
        'SA': '🇸🇦', 'SB': '🇸🇧', 'SC': '🇸🇨', 'SD': '🇸🇩', 'SE': '🇸🇪', 'SG': '🇸🇬', 'SH': '🇸🇭', 'SI': '🇸🇮',
        'SJ': '🇸🇯', 'SK': '🇸🇰', 'SL': '🇸🇱', 'SM': '🇸🇲', 'SN': '🇸🇳', 'SO': '🇸🇴', 'SR': '🇸🇷', 'SS': '🇸🇸',
        'ST': '🇸🇹', 'SV': '🇸🇻', 'SX': '🇸🇽', 'SY': '🇸🇾', 'SZ': '🇸🇿', 'TC': '🇹🇨', 'TD': '🇹🇩', 'TF': '🇹🇫',
        'TG': '🇹🇬', 'TH': '🇹🇭', 'TJ': '🇹🇯', 'TK': '🇹🇰', 'TL': '🇹🇱', 'TM': '🇹🇲', 'TN': '🇹🇳', 'TO': '🇹🇴',
        'TR': '🇹🇷', 'TT': '🇹🇹', 'TV': '🇹🇻', 'TW': '🇹🇼', 'TZ': '🇹🇿', 'UA': '🇺🇦', 'UG': '🇺🇬', 'UM': '🇺🇲',
        'US': '🇺🇸', 'UY': '🇺🇾', 'UZ': '🇺🇿', 'VA': '🇻🇦', 'VC': '🇻🇨', 'VE': '🇻🇪', 'VG': '🇻🇬', 'VI': '🇻🇮',
        'VN': '🇻🇳', 'VU': '🇻🇺', 'WF': '🇼🇫', 'WS': '🇼🇸', 'YE': '🇾🇪', 'YT': '🇾🇹', 'ZA': '🇿🇦', 'ZM': '🇿🇲', 'ZW': '🇿🇼'
    };
    
    return flags[countryCode.toUpperCase()] || '🌍';
};

// Legacy timezone mapping for fallback compatibility
export const getCountryFromTimezone = (timezone: string): { country: string; countryCode: string } => {
    const timezoneMap: Record<string, { country: string; countryCode: string }> = {
        // Asia/Middle East
        'Asia/Tehran': { country: 'Iran', countryCode: 'IR' },
        'Asia/Dubai': { country: 'United Arab Emirates', countryCode: 'AE' },
        'Asia/Riyadh': { country: 'Saudi Arabia', countryCode: 'SA' },
        'Asia/Kuwait': { country: 'Kuwait', countryCode: 'KW' },
        'Asia/Qatar': { country: 'Qatar', countryCode: 'QA' },
        'Asia/Bahrain': { country: 'Bahrain', countryCode: 'BH' },
        'Asia/Muscat': { country: 'Oman', countryCode: 'OM' },
        'Asia/Baghdad': { country: 'Iraq', countryCode: 'IQ' },
        'Asia/Damascus': { country: 'Syria', countryCode: 'SY' },
        'Asia/Beirut': { country: 'Lebanon', countryCode: 'LB' },
        'Asia/Amman': { country: 'Jordan', countryCode: 'JO' },
        'Asia/Jerusalem': { country: 'Israel', countryCode: 'IL' },
        'Asia/Gaza': { country: 'Palestine', countryCode: 'PS' },
        'Asia/Hebron': { country: 'Palestine', countryCode: 'PS' },
        
        // Major world cities
        'America/New_York': { country: 'United States', countryCode: 'US' },
        'America/Los_Angeles': { country: 'United States', countryCode: 'US' },
        'America/Chicago': { country: 'United States', countryCode: 'US' },
        'America/Denver': { country: 'United States', countryCode: 'US' },
        'Europe/London': { country: 'United Kingdom', countryCode: 'GB' },
        'Europe/Paris': { country: 'France', countryCode: 'FR' },
        'Europe/Berlin': { country: 'Germany', countryCode: 'DE' },
        'Europe/Rome': { country: 'Italy', countryCode: 'IT' },
        'Europe/Madrid': { country: 'Spain', countryCode: 'ES' },
        'Asia/Tokyo': { country: 'Japan', countryCode: 'JP' },
        'Asia/Shanghai': { country: 'China', countryCode: 'CN' },
        'Asia/Hong_Kong': { country: 'Hong Kong', countryCode: 'HK' },
        'Asia/Singapore': { country: 'Singapore', countryCode: 'SG' },
        'Asia/Seoul': { country: 'South Korea', countryCode: 'KR' },
        'Asia/Bangkok': { country: 'Thailand', countryCode: 'TH' },
        'Australia/Sydney': { country: 'Australia', countryCode: 'AU' },
        'Australia/Melbourne': { country: 'Australia', countryCode: 'AU' },
        'Pacific/Auckland': { country: 'New Zealand', countryCode: 'NZ' }
    };
    
    const result = timezoneMap[timezone];
    return result || { country: 'Unknown', countryCode: '' };
};

// Get city information from timezone
const getCityFromTimezone = (timezone: string): { city?: string; region?: string } => {
    const timezoneMap: Record<string, { city: string; region?: string }> = {
        // Major cities with unique timezones
        'Asia/Tehran': { city: 'Tehran', region: 'Tehran Province' },
        'Asia/Dubai': { city: 'Dubai', region: 'Dubai' },
        'Asia/Riyadh': { city: 'Riyadh', region: 'Riyadh Province' },
        'Asia/Kuwait': { city: 'Kuwait City', region: 'Al Asimah' },
        'Asia/Qatar': { city: 'Doha', region: 'Ad Dawhah' },
        'Asia/Bahrain': { city: 'Manama', region: 'Capital' },
        'Asia/Muscat': { city: 'Muscat', region: 'Muscat' },
        'Asia/Baghdad': { city: 'Baghdad', region: 'Baghdad' },
        'Asia/Damascus': { city: 'Damascus', region: 'Damascus' },
        'Asia/Beirut': { city: 'Beirut', region: 'Beirut' },
        'Asia/Amman': { city: 'Amman', region: 'Amman' },
        'Asia/Jerusalem': { city: 'Jerusalem', region: 'Jerusalem' },
        'Asia/Gaza': { city: 'Gaza', region: 'Gaza Strip' },
        'Asia/Hebron': { city: 'Hebron', region: 'West Bank' },
        'Africa/Cairo': { city: 'Cairo', region: 'Cairo' },
        'Africa/Casablanca': { city: 'Casablanca', region: 'Casablanca-Settat' },
        'Africa/Tunis': { city: 'Tunis', region: 'Tunis' },
        'Africa/Algiers': { city: 'Algiers', region: 'Algiers' },
        'Africa/Tripoli': { city: 'Tripoli', region: 'Tripoli' },
        'Europe/London': { city: 'London', region: 'England' },
        'Europe/Paris': { city: 'Paris', region: 'Île-de-France' },
        'Europe/Berlin': { city: 'Berlin', region: 'Berlin' },
        'Europe/Rome': { city: 'Rome', region: 'Lazio' },
        'Europe/Madrid': { city: 'Madrid', region: 'Community of Madrid' },
        'America/New_York': { city: 'New York', region: 'New York' },
        'America/Los_Angeles': { city: 'Los Angeles', region: 'California' },
        'America/Chicago': { city: 'Chicago', region: 'Illinois' },
        'America/Denver': { city: 'Denver', region: 'Colorado' },
        'Asia/Tokyo': { city: 'Tokyo', region: 'Tokyo' },
        'Asia/Shanghai': { city: 'Shanghai', region: 'Shanghai' },
        'Asia/Hong_Kong': { city: 'Hong Kong', region: 'Hong Kong' },
        'Asia/Singapore': { city: 'Singapore', region: 'Singapore' },
        'Asia/Seoul': { city: 'Seoul', region: 'Seoul' },
        'Asia/Bangkok': { city: 'Bangkok', region: 'Bangkok' },
        'Asia/Ho_Chi_Minh': { city: 'Ho Chi Minh City', region: 'Ho Chi Minh' },
        'Asia/Jakarta': { city: 'Jakarta', region: 'Jakarta' },
        'Asia/Manila': { city: 'Manila', region: 'Metro Manila' },
        'Asia/Karachi': { city: 'Karachi', region: 'Sindh' },
        'Asia/Kolkata': { city: 'Kolkata', region: 'West Bengal' },
        'Asia/Dhaka': { city: 'Dhaka', region: 'Dhaka' },
        'Australia/Sydney': { city: 'Sydney', region: 'New South Wales' },
        'Australia/Melbourne': { city: 'Melbourne', region: 'Victoria' },
        'Pacific/Auckland': { city: 'Auckland', region: 'Auckland' }
    };
    
    return timezoneMap[timezone] || {};
};

// Enhanced language to country mapping
const getCountryFromLanguage = (primaryLanguage: string, allLanguages: string[]): {
    country: string;
    countryCode: string;
    confidence: 'high' | 'medium' | 'low';
} => {
    // Language-country mapping with confidence levels
    const languageMap: Record<string, { country: string; countryCode: string; confidence: 'high' | 'medium' | 'low' }> = {
        // High confidence - unique languages
        'fa': { country: 'Iran', countryCode: 'IR', confidence: 'high' },
        'fa-IR': { country: 'Iran', countryCode: 'IR', confidence: 'high' },
        'persian': { country: 'Iran', countryCode: 'IR', confidence: 'high' },
        'he': { country: 'Israel', countryCode: 'IL', confidence: 'high' },
        'he-IL': { country: 'Israel', countryCode: 'IL', confidence: 'high' },
        'ja': { country: 'Japan', countryCode: 'JP', confidence: 'high' },
        'ja-JP': { country: 'Japan', countryCode: 'JP', confidence: 'high' },
        'ko': { country: 'South Korea', countryCode: 'KR', confidence: 'high' },
        'ko-KR': { country: 'South Korea', countryCode: 'KR', confidence: 'high' },
        'th': { country: 'Thailand', countryCode: 'TH', confidence: 'high' },
        'th-TH': { country: 'Thailand', countryCode: 'TH', confidence: 'high' },
        'vi': { country: 'Vietnam', countryCode: 'VN', confidence: 'high' },
        'vi-VN': { country: 'Vietnam', countryCode: 'VN', confidence: 'high' },
        'tr': { country: 'Turkey', countryCode: 'TR', confidence: 'high' },
        'tr-TR': { country: 'Turkey', countryCode: 'TR', confidence: 'high' },
        'sw': { country: 'Kenya', countryCode: 'KE', confidence: 'medium' },
        'sw-KE': { country: 'Kenya', countryCode: 'KE', confidence: 'high' },
        'hi': { country: 'India', countryCode: 'IN', confidence: 'medium' },
        'hi-IN': { country: 'India', countryCode: 'IN', confidence: 'high' },
        'zh-CN': { country: 'China', countryCode: 'CN', confidence: 'high' },
        'zh-TW': { country: 'Taiwan', countryCode: 'TW', confidence: 'high' },
        'zh-HK': { country: 'Hong Kong', countryCode: 'HK', confidence: 'high' },
        'ru': { country: 'Russia', countryCode: 'RU', confidence: 'medium' },
        'ru-RU': { country: 'Russia', countryCode: 'RU', confidence: 'high' },
        'uk': { country: 'Ukraine', countryCode: 'UA', confidence: 'high' },
        'uk-UA': { country: 'Ukraine', countryCode: 'UA', confidence: 'high' },
        
        // Medium confidence - regional languages
        'ar-SA': { country: 'Saudi Arabia', countryCode: 'SA', confidence: 'high' },
        'ar-EG': { country: 'Egypt', countryCode: 'EG', confidence: 'high' },
        'ar-AE': { country: 'United Arab Emirates', countryCode: 'AE', confidence: 'high' },
        'ar-PS': { country: 'Palestine', countryCode: 'PS', confidence: 'high' },
        'ar-JO': { country: 'Jordan', countryCode: 'JO', confidence: 'high' },
        'ar-LB': { country: 'Lebanon', countryCode: 'LB', confidence: 'high' },
        'ar-SY': { country: 'Syria', countryCode: 'SY', confidence: 'high' },
        'ar-IQ': { country: 'Iraq', countryCode: 'IQ', confidence: 'high' },
        'ar-KW': { country: 'Kuwait', countryCode: 'KW', confidence: 'high' },
        'ar-QA': { country: 'Qatar', countryCode: 'QA', confidence: 'high' },
        'ar-BH': { country: 'Bahrain', countryCode: 'BH', confidence: 'high' },
        'ar-OM': { country: 'Oman', countryCode: 'OM', confidence: 'high' },
        'ar-YE': { country: 'Yemen', countryCode: 'YE', confidence: 'high' },
        'ar-MA': { country: 'Morocco', countryCode: 'MA', confidence: 'high' },
        'ar-DZ': { country: 'Algeria', countryCode: 'DZ', confidence: 'high' },
        'ar-TN': { country: 'Tunisia', countryCode: 'TN', confidence: 'high' },
        'ar-LY': { country: 'Libya', countryCode: 'LY', confidence: 'high' },
        'ar-SD': { country: 'Sudan', countryCode: 'SD', confidence: 'high' },
        
        // English variants
        'en-US': { country: 'United States', countryCode: 'US', confidence: 'high' },
        'en-GB': { country: 'United Kingdom', countryCode: 'GB', confidence: 'high' },
        'en-CA': { country: 'Canada', countryCode: 'CA', confidence: 'high' },
        'en-AU': { country: 'Australia', countryCode: 'AU', confidence: 'high' },
        'en-NZ': { country: 'New Zealand', countryCode: 'NZ', confidence: 'high' },
        'en-ZA': { country: 'South Africa', countryCode: 'ZA', confidence: 'high' },
        'en-IN': { country: 'India', countryCode: 'IN', confidence: 'high' },
        
        // Generic fallbacks (low confidence)
        'ar': { country: 'Saudi Arabia', countryCode: 'SA', confidence: 'low' },
        'en': { country: 'United States', countryCode: 'US', confidence: 'low' },
        'es': { country: 'Spain', countryCode: 'ES', confidence: 'low' },
        'fr': { country: 'France', countryCode: 'FR', confidence: 'low' },
        'de': { country: 'Germany', countryCode: 'DE', confidence: 'low' },
        'it': { country: 'Italy', countryCode: 'IT', confidence: 'low' },
        'pt': { country: 'Portugal', countryCode: 'PT', confidence: 'low' },
        'nl': { country: 'Netherlands', countryCode: 'NL', confidence: 'low' },
        'sv': { country: 'Sweden', countryCode: 'SE', confidence: 'low' },
        'da': { country: 'Denmark', countryCode: 'DK', confidence: 'low' },
        'no': { country: 'Norway', countryCode: 'NO', confidence: 'low' },
        'fi': { country: 'Finland', countryCode: 'FI', confidence: 'low' },
        'pl': { country: 'Poland', countryCode: 'PL', confidence: 'low' },
        'cs': { country: 'Czech Republic', countryCode: 'CZ', confidence: 'low' },
        'sk': { country: 'Slovakia', countryCode: 'SK', confidence: 'low' },
        'hu': { country: 'Hungary', countryCode: 'HU', confidence: 'low' },
        'ro': { country: 'Romania', countryCode: 'RO', confidence: 'low' },
        'bg': { country: 'Bulgaria', countryCode: 'BG', confidence: 'low' },
        'hr': { country: 'Croatia', countryCode: 'HR', confidence: 'low' },
        'sr': { country: 'Serbia', countryCode: 'RS', confidence: 'low' },
        'sl': { country: 'Slovenia', countryCode: 'SI', confidence: 'low' },
        'et': { country: 'Estonia', countryCode: 'EE', confidence: 'low' },
        'lv': { country: 'Latvia', countryCode: 'LV', confidence: 'low' },
        'lt': { country: 'Lithuania', countryCode: 'LT', confidence: 'low' }
    };
    
    // Check primary language first (exact match)
    const primaryMatch = languageMap[primaryLanguage.toLowerCase()];
    if (primaryMatch) {
        console.log(`🎯 Found exact match for primary language ${primaryLanguage}:`, primaryMatch);
        return primaryMatch;
    }
    
    // Check all languages for best match
    for (const lang of allLanguages) {
        const match = languageMap[lang.toLowerCase()];
        if (match && match.confidence === 'high') {
            console.log(`🎯 Found high-confidence match for language ${lang}:`, match);
            return match;
        }
    }
    
    // Check language codes (first two characters)
    const primaryLangCode = primaryLanguage.substring(0, 2).toLowerCase();
    const codeMatch = languageMap[primaryLangCode];
    if (codeMatch) {
        console.log(`🎯 Found language code match for ${primaryLangCode}:`, codeMatch);
        return codeMatch;
    }
    
    console.log('❌ No language-based country detection possible');
    return { country: 'Unknown', countryCode: '', confidence: 'low' };
};

// Browser-only location detection - NO EXTERNAL APIs
export const detectLocationBrowserOnly = (): LocationData => {
    console.log('🌍 Starting browser-only location detection...');
    
    try {
        // Get timezone information
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log('⏰ Detected timezone:', timezone);
        
        // Get language preferences
        const primaryLanguage = navigator.language;
        const allLanguages = Array.from(navigator.languages || [primaryLanguage]);
        console.log('🗣️ Language preferences:', { primary: primaryLanguage, all: allLanguages });
        
        // Get locale information
        const locale = Intl.DateTimeFormat().resolvedOptions().locale;
        console.log('🌐 Detected locale:', locale);
        
        // Analyze timezone to country mapping with language hints
        const timezoneCountry = getCountryFromTimezone(timezone);
        console.log('🗺️ Timezone-based country:', timezoneCountry);
        
        // Analyze language to get country hints
        const languageHints = getCountryFromLanguage(primaryLanguage, allLanguages);
        console.log('🔤 Language-based hints:', languageHints);
        
        // Combine signals to make best guess
        let finalCountry = timezoneCountry.country;
        let finalCountryCode = timezoneCountry.countryCode;
        let confidence: 'high' | 'medium' | 'low' = 'medium';
        
        // If language provides stronger signal, use it
        if (languageHints.country !== 'Unknown' && languageHints.confidence === 'high') {
            finalCountry = languageHints.country;
            finalCountryCode = languageHints.countryCode;
            confidence = 'high';
            console.log('✅ Using language-based detection (high confidence)');
        } else if (timezoneCountry.country !== 'Unknown') {
            console.log('✅ Using timezone-based detection');
            confidence = 'medium';
        } else if (languageHints.country !== 'Unknown') {
            finalCountry = languageHints.country;
            finalCountryCode = languageHints.countryCode;
            confidence = languageHints.confidence;
            console.log('✅ Using language-based detection (fallback)');
        }
        
        // Try to get city from timezone
        const cityInfo = getCityFromTimezone(timezone);
        
        const result: LocationData = {
            country: finalCountry,
            countryCode: finalCountryCode,
            city: cityInfo.city,
            region: cityInfo.region,
            timezone,
            detectionMethod: 'browser-only',
            confidence,
            browserInfo: {
                language: primaryLanguage,
                languages: allLanguages,
                locale,
                timezone
            }
        };
        
        console.log('🎯 Final browser-only location result:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Error in browser-only location detection:', error);
        return {
            country: 'Unknown',
            countryCode: '',
            detectionMethod: 'browser-only',
            confidence: 'low'
        };
    }
};

// Main detection function - now uses only browser-only detection
export const detectUserLocation = async (): Promise<LocationData | null> => {
    console.log('🌍 Starting location detection (browser-only)...');
    
    // Use browser-only detection
    const location = detectLocationBrowserOnly();
    
    if (location.country !== 'Unknown') {
        console.log('✅ Location detected successfully:', location);
        return location;
    }
    
    console.log('❌ Location detection failed');
    return null;
}; 