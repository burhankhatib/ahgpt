import { useState, useEffect } from 'react';
import { VisitorApiData, detectUserLocation } from '@/utils/visitorApiDetection';

interface UseUserLocationResult {
    location: VisitorApiData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useUserLocation = (): UseUserLocationResult => {
    const [location, setLocation] = useState<VisitorApiData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const detectLocationWithVisitorApi = async () => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('🌍 Detecting location with VisitorAPI...');
            const locationData = await detectUserLocation();
            
            if (locationData && locationData.country !== 'Unknown') {
                setLocation(locationData);
                // Store in localStorage for caching
                localStorage.setItem('userLocation', JSON.stringify(locationData));
                console.log('✅ VisitorAPI location detected:', locationData);
            } else {
                // Fallback to browser timezone detection
                const fallbackLocation = await detectBrowserFallback();
                if (fallbackLocation) {
                    setLocation(fallbackLocation);
                    localStorage.setItem('userLocation', JSON.stringify(fallbackLocation));
                } else {
                    setError('Could not detect location with VisitorAPI');
                }
            }
        } catch (err) {
            console.error('VisitorAPI location detection failed:', err);
            
            // Try browser-based fallback
            try {
                const fallbackLocation = await detectBrowserFallback();
                if (fallbackLocation) {
                    setLocation(fallbackLocation);
                    localStorage.setItem('userLocation', JSON.stringify(fallbackLocation));
                } else {
                    setError('Location detection failed');
                }
            } catch (browserErr) {
                console.error('Browser fallback failed:', browserErr);
                setError('All location detection methods failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const detectBrowserFallback = async (): Promise<VisitorApiData | null> => {
        try {
            // Use timezone to guess country as fallback
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            console.log('Browser timezone fallback:', timezone);
            
            // Import timezone utilities from the old location detection
            const { getCountryFromTimezone } = await import('@/utils/locationDetection');
            const countryData = getCountryFromTimezone(timezone);
            
            if (countryData.country !== 'Unknown') {
                // Convert to VisitorApiData format
                const fallbackData: VisitorApiData = {
                    country: countryData.country,
                    countryCode: countryData.countryCode,
                    city: undefined,
                    region: undefined,
                    timestamp: new Date().toISOString(),
                    detectionMethod: 'visitorapi', // Keep consistent
                    confidence: 'high'
                };
                
                return fallbackData;
            }
        } catch (error) {
            console.error('Browser timezone fallback failed:', error);
        }
        
        return null;
    };

    const refetch = async () => {
        await detectLocationWithVisitorApi();
    };

    useEffect(() => {
        // Check if location is cached in localStorage
        const cachedLocation = localStorage.getItem('userLocation');
        
        if (cachedLocation) {
            try {
                const parsedLocation: VisitorApiData = JSON.parse(cachedLocation);
                // Check if cached data is recent (less than 24 hours old)
                const cachedTime = new Date(parsedLocation.timestamp);
                const now = new Date();
                const hoursSinceCache = (now.getTime() - cachedTime.getTime()) / (1000 * 60 * 60);
                
                if (hoursSinceCache < 24) {
                    setLocation(parsedLocation);
                    return; // Don't fetch if we have recent cached data
                } else {
                    // Remove old cache
                    localStorage.removeItem('userLocation');
                }
            } catch (err) {
                console.error('Error parsing cached location:', err);
                localStorage.removeItem('userLocation');
            }
        }

        // Fetch location if not cached or cache is old
        detectLocationWithVisitorApi();
    }, []);

    return {
        location,
        isLoading,
        error,
        refetch
    };
}; 