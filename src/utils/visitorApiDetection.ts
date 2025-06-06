// VisitorAPI-based location detection utility
// Based on the article: https://dev.to/chaoming/how-to-detect-user-location-and-auto-fill-forms-in-react-with-visitorapi-4l3k

export interface VisitorApiData {
    country: string;
    countryCode: string;
    city?: string;
    region?: string;
    ipAddress?: string;
    currencies?: string[];
    languages?: string[];
    cityLatLong?: { lat: number; lng: number };
    browser?: string;
    browserVersion?: string;
    os?: string;
    osVersion?: string;
    timestamp: string;
    detectionMethod: 'visitorapi';
    confidence: 'high';
}

// Country flag utility (moved from geolocationDetection.ts)
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

// Enhanced debugging utility
const debugLog = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔍 VisitorAPI Debug: ${message}`, data || '');
};

// Check for cached IP to detect potential IP changes (VPN switching)
const getCurrentIP = async (): Promise<string | null> => {
    try {
        debugLog('Fetching current IP address for comparison...');
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        debugLog('Current IP address:', data.ip);
        return data.ip;
    } catch (error) {
        debugLog('Failed to fetch current IP:', error);
        return null;
    }
};

// Check if cached data is still valid (IP hasn't changed)
const isCacheValid = async (cachedData: any): Promise<boolean> => {
    if (!cachedData || !cachedData.ipAddress) {
        debugLog('No cached IP address found, cache invalid');
        return false;
    }

    const currentIP = await getCurrentIP();
    if (!currentIP) {
        debugLog('Could not determine current IP, assuming cache is valid');
        return true; // If we can't check, assume it's valid to avoid unnecessary requests
    }

    const isValid = cachedData.ipAddress === currentIP;
    debugLog('Cache validation result:', {
        cachedIP: cachedData.ipAddress,
        currentIP: currentIP,
        isValid: isValid
    });

    return isValid;
};

// Main VisitorAPI detection function
export const detectUserLocationWithVisitorApi = (projectId: string): Promise<VisitorApiData | null> => {
    return new Promise((resolve) => {
        debugLog('Starting VisitorAPI location detection...', {
            projectId: projectId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer || 'none'
        });

        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
            debugLog('Not in browser environment, returning null');
            resolve(null);
            return;
        }

        // Dynamic import to avoid SSR issues
        import('visitorapi').then((VisitorAPI) => {
            debugLog('VisitorAPI module loaded successfully');

            // Set up timeout for the API call
            const timeout = setTimeout(() => {
                debugLog('VisitorAPI call timed out after 15 seconds');
                resolve(null);
            }, 15000);

            // Call VisitorAPI with the project ID
            VisitorAPI.default(
                projectId,
                (data) => {
                    clearTimeout(timeout);
                    debugLog('✅ VisitorAPI response received successfully:', {
                        rawData: data,
                        keys: Object.keys(data),
                        ipAddress: data.ipAddress,
                        country: data.countryName,
                        city: data.city
                    });

                    try {
                        // Transform the response to match our interface
                        const visitorApiData: VisitorApiData = {
                            country: data.countryName || 'Unknown',
                            countryCode: data.countryCode || '',
                            city: data.city || undefined,
                            region: data.region || undefined,
                            ipAddress: data.ipAddress || undefined,
                            currencies: data.currencies || undefined,
                            languages: data.languages || undefined,
                            cityLatLong: data.cityLatLong ? {
                                lat: parseFloat(data.cityLatLong.split(',')[0]?.trim() || '0'),
                                lng: parseFloat(data.cityLatLong.split(',')[1]?.trim() || '0')
                            } : undefined,
                            browser: data.browser || undefined,
                            browserVersion: data.browserVersion || undefined,
                            os: data.os || undefined,
                            osVersion: data.osVersion || undefined,
                            timestamp: new Date().toISOString(),
                            detectionMethod: 'visitorapi',
                            confidence: 'high'
                        };

                        debugLog('✅ VisitorAPI location detection complete:', {
                            finalData: visitorApiData,
                            detectionSuccess: visitorApiData.country !== 'Unknown'
                        });

                        resolve(visitorApiData);
                    } catch (transformError) {
                        debugLog('❌ Error transforming VisitorAPI response:', transformError);
                        resolve(null);
                    }
                },
                (error: any) => {
                    clearTimeout(timeout);
                    debugLog('❌ VisitorAPI error callback triggered:', {
                        error: error,
                        errorType: typeof error,
                        errorMessage: error?.message || 'Unknown error',
                        projectId: projectId
                    });
                    resolve(null);
                }
            );
        }).catch((error) => {
            debugLog('❌ Failed to load VisitorAPI module:', {
                error: error,
                errorMessage: error?.message || 'Import failed',
                stack: error?.stack
            });
            resolve(null);
        });
    });
};

// Default project ID - you'll need to replace this with your actual project ID
// Create a free project at VisitorAPI to get your project ID
const DEFAULT_PROJECT_ID = "tyepXV1WpxWiG6t1nFun"; // Replace with your actual project ID

// Enhanced convenience function with cache validation
export const detectUserLocation = async (): Promise<VisitorApiData | null> => {
    debugLog('Starting enhanced location detection with cache validation...');
    
    // Check for any existing cached data first
    const existingCache = localStorage.getItem('userLocation');
    if (existingCache) {
        try {
            const parsed = JSON.parse(existingCache);
            debugLog('Found existing cached location data:', parsed);
            
            // Check if cache is still valid (IP hasn't changed)
            const cacheValid = await isCacheValid(parsed);
            if (cacheValid) {
                const cacheAge = (Date.now() - new Date(parsed.timestamp).getTime()) / (1000 * 60 * 60);
                if (cacheAge < 24) {
                    debugLog('Using valid cached data (age: ' + cacheAge.toFixed(1) + ' hours)');
                    return parsed;
                }
            } else {
                debugLog('Cache invalid due to IP change, clearing and detecting fresh location...');
                localStorage.removeItem('userLocation');
            }
        } catch (error) {
            debugLog('Error parsing cached data, clearing cache:', error);
            localStorage.removeItem('userLocation');
        }
    }

    // Proceed with fresh detection
    return detectUserLocationWithVisitorApi(DEFAULT_PROJECT_ID);
};

// Function to watch user location (simplified - VisitorAPI doesn't need continuous watching)
export const watchUserLocation = (
    onLocationUpdate: (data: VisitorApiData) => void,
    onError: (error: string) => void,
    projectId?: string
): Promise<void> => {
    debugLog('Starting location watching with VisitorAPI...', { projectId: projectId || DEFAULT_PROJECT_ID });
    
    const actualProjectId = projectId || DEFAULT_PROJECT_ID;

    return detectUserLocationWithVisitorApi(actualProjectId)
        .then((data) => {
            if (data) {
                debugLog('Location watching successful, calling update callback');
                onLocationUpdate(data);
            } else {
                const errorMsg = 'Failed to detect location with VisitorAPI';
                debugLog('Location watching failed: ' + errorMsg);
                onError(errorMsg);
            }
        })
        .catch((error) => {
            const errorMsg = error.message || 'Unknown error occurred';
            debugLog('Location watching error: ' + errorMsg, error);
            onError(errorMsg);
        });
};

// Utility function to clear all location cache (for debugging)
export const clearLocationCache = () => {
    debugLog('Clearing all location cache data...');
    
    // Clear all possible cache keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('userLocation')) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        debugLog('Removed cache key: ' + key);
    });
    
    debugLog('Cache clearing complete. Removed ' + keysToRemove.length + ' keys');
    return keysToRemove.length;
};

// Debug function to get all cached location data
export const getDebugInfo = () => {
    const debugInfo = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cachedData: {} as any,
        projectId: DEFAULT_PROJECT_ID
    };

    // Collect all cached location data
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('userLocation')) {
            try {
                debugInfo.cachedData[key] = JSON.parse(localStorage.getItem(key) || '{}');
            } catch (error) {
                debugInfo.cachedData[key] = 'Invalid JSON';
            }
        }
    }

    debugLog('Debug info collected:', debugInfo);
    return debugInfo;
};

// Fallback location detection using alternative services
export const detectLocationWithFallback = async (): Promise<VisitorApiData | null> => {
    debugLog('Starting fallback location detection...');
    
    try {
        // Try ipapi.co first (more reliable, includes city)
        debugLog('Trying ipapi.co service...');
        const response = await fetch('https://ipapi.co/json/', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`ipapi.co failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        debugLog('ipapi.co response:', data);
        
        if (data.country_name && data.country_name !== 'Unknown') {
            const fallbackData: VisitorApiData = {
                country: data.country_name,
                countryCode: data.country_code || data.country,
                city: data.city || undefined,
                region: data.region || data.region_code || undefined,
                ipAddress: data.ip || undefined,
                currencies: data.currency ? [data.currency] : undefined,
                languages: data.languages ? data.languages.split(',').map((l: string) => l.trim()) : undefined,
                cityLatLong: (data.latitude && data.longitude) ? {
                    lat: parseFloat(data.latitude),
                    lng: parseFloat(data.longitude)
                } : undefined,
                timestamp: new Date().toISOString(),
                detectionMethod: 'visitorapi', // Keep consistent for compatibility
                confidence: 'high'
            };
            
            debugLog('✅ Fallback location detection successful:', fallbackData);
            return fallbackData;
        }
    } catch (error) {
        debugLog('❌ ipapi.co failed, trying ip-api.com:', error);
        
        try {
            // Fallback to ip-api.com
            const response2 = await fetch('http://ip-api.com/json/', {
                method: 'GET'
            });
            
            if (!response2.ok) {
                throw new Error(`ip-api.com failed with status: ${response2.status}`);
            }
            
            const data2 = await response2.json();
            debugLog('ip-api.com response:', data2);
            
            if (data2.country && data2.status === 'success') {
                const fallbackData2: VisitorApiData = {
                    country: data2.country,
                    countryCode: data2.countryCode,
                    city: data2.city || undefined,
                    region: data2.regionName || data2.region || undefined,
                    ipAddress: data2.query || undefined,
                    cityLatLong: (data2.lat && data2.lon) ? {
                        lat: parseFloat(data2.lat),
                        lng: parseFloat(data2.lon)
                    } : undefined,
                    timestamp: new Date().toISOString(),
                    detectionMethod: 'visitorapi', // Keep consistent
                    confidence: 'high'
                };
                
                debugLog('✅ Secondary fallback successful:', fallbackData2);
                return fallbackData2;
            }
        } catch (error2) {
            debugLog('❌ All fallback services failed:', error2);
        }
    }
    
    debugLog('❌ All location detection methods failed');
    return null;
};

// Enhanced main detection function that tries VisitorAPI first, then fallback
export const detectUserLocationEnhanced = async (): Promise<VisitorApiData | null> => {
    debugLog('Starting enhanced location detection with automatic fallback...');
    
    try {
        // First try VisitorAPI
        debugLog('Trying VisitorAPI first...');
        const visitorApiResult = await detectUserLocationWithVisitorApi(DEFAULT_PROJECT_ID);
        
        if (visitorApiResult && visitorApiResult.country !== 'Unknown') {
            debugLog('✅ VisitorAPI successful, using result');
            return visitorApiResult;
        } else {
            debugLog('⚠️ VisitorAPI failed or returned unknown location, trying fallback...');
        }
    } catch (error) {
        debugLog('❌ VisitorAPI threw error, trying fallback:', error);
    }
    
    // If VisitorAPI fails, try fallback services
    debugLog('Using fallback location services...');
    return await detectLocationWithFallback();
}; 