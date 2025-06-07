// Location detection utility based on UserLocation.tsx component
// Uses browser geolocation with ipwho.is fallback

export interface LocationData {
    latitude?: number;
    longitude?: number;
    city?: string;
    region?: string;
    country: string;
    countryCode?: string;
    timezone?: string;
    ip?: string;
    source: "geolocation" | "ip" | "unknown";
    detectionMethod: 'browser-geolocation';
    confidence: 'high' | 'medium' | 'low';
    detectedAt: string;
}

// Main location detection function - same logic as UserLocation.tsx
export const detectUserLocation = (): Promise<LocationData | null> => {
    return new Promise((resolve) => {
        console.log('🌍 Starting browser-based location detection...');

        const getLocationFromBrowser = () => {
            if (!navigator.geolocation) {
                console.warn('❌ Geolocation not supported by browser');
                getLocationFromIP();
                return;
            }

            console.log('📍 Requesting browser geolocation permission...');
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    console.log('✅ Browser geolocation successful');
                    const { latitude, longitude, accuracy } = position.coords;
                    
                    const locationData: LocationData = {
                        latitude,
                        longitude,
                        country: 'Unknown', // Will be enriched if needed
                        source: "geolocation",
                        detectionMethod: 'browser-geolocation',
                        confidence: accuracy && accuracy < 100 ? 'high' : 'medium',
                        detectedAt: new Date().toISOString()
                    };

                    console.log('📍 Browser geolocation data:', locationData);
                    resolve(locationData);
                },
                async (error) => {
                    console.warn('⚠️ Geolocation denied/failed, falling back to IP...', error.message);
                    getLocationFromIP();
                },
                { 
                    timeout: 10000,
                    enableHighAccuracy: true,
                    maximumAge: 300000 // 5 minutes
                }
            );
        };

        const getLocationFromIP = async () => {
            try {
                console.log('🌐 Fetching location from IP using ipwho.is...');
                const response = await fetch("https://ipwho.is/");
                const data = await response.json();

                console.log('🌐 IP location response:', data);

                if (data.success) {
                    const locationData: LocationData = {
                        latitude: data.latitude,
                        longitude: data.longitude,
                        city: data.city,
                        region: data.region,
                        country: data.country,
                        countryCode: data.country_code,
                        timezone: data.timezone?.id,
                        ip: data.ip,
                        source: "ip",
                        detectionMethod: 'browser-geolocation',
                        confidence: 'medium',
                        detectedAt: new Date().toISOString()
                    };

                    console.log('✅ IP location detection successful:', locationData);
                    resolve(locationData);
                } else {
                    console.error('❌ IP location API failed:', data);
                    resolve({
                        country: 'Unknown',
                        source: "unknown",
                        detectionMethod: 'browser-geolocation',
                        confidence: 'low',
                        detectedAt: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error('❌ Error fetching IP location:', error);
                resolve({
                    country: 'Unknown',
                    source: "unknown",
                    detectionMethod: 'browser-geolocation',
                    confidence: 'low',
                    detectedAt: new Date().toISOString()
                });
            }
        };

        // Start with browser geolocation
        getLocationFromBrowser();
    });
};

// Country flag utility
export const getCountryFlag = (countryCode: string): string => {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    
    const flags: Record<string, string> = {
        'US': '🇺🇸', 'CA': '🇨🇦', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷',
        'IT': '🇮🇹', 'ES': '🇪🇸', 'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴',
        'FI': '🇫🇮', 'DK': '🇩🇰', 'PL': '🇵🇱', 'RU': '🇷🇺', 'UA': '🇺🇦',
        'CN': '🇨🇳', 'JP': '🇯🇵', 'KR': '🇰🇷', 'IN': '🇮🇳', 'TH': '🇹🇭',
        'VN': '🇻🇳', 'ID': '🇮🇩', 'MX': '🇲🇽', 'BR': '🇧🇷', 'AR': '🇦🇷',
        'EG': '🇪🇬', 'ZA': '🇿🇦', 'AU': '🇦🇺', 'NZ': '🇳🇿',
        // Middle East
        'IR': '🇮🇷', 'IL': '🇮🇱', 'PS': '🇵🇸', 'TR': '🇹🇷', 'SA': '🇸🇦',
        'AE': '🇦🇪', 'JO': '🇯🇴', 'LB': '🇱🇧', 'SY': '🇸🇾', 'IQ': '🇮🇶',
        'KW': '🇰🇼', 'QA': '🇶🇦', 'BH': '🇧🇭', 'OM': '🇴🇲', 'YE': '🇾🇪'
    };
    
    return flags[countryCode.toUpperCase()] || '🌍';
};

// Utility function to clear location cache
export const clearLocationCache = () => {
    console.log('🧹 Clearing location cache...');
    
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('userLocation')) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed cache key: ${key}`);
    });
    
    console.log(`✅ Cache clearing complete. Removed ${keysToRemove.length} keys`);
    return keysToRemove.length;
}; 