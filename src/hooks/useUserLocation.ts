import { useState, useEffect } from 'react';
import { LocationData } from '@/utils/locationDetection';

interface UseUserLocationResult {
    location: LocationData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useUserLocation = (): UseUserLocationResult => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const detectLocation = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/location');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const locationData: LocationData = await response.json();
            
            // If API returned 'Unknown' country, try browser-based fallback
            if (locationData.country === 'Unknown') {
                console.log('API returned unknown location, trying browser fallback...');
                const browserLocation = await detectBrowserLocation();
                if (browserLocation) {
                    const mergedLocation = { ...locationData, ...browserLocation };
                    setLocation(mergedLocation);
                    localStorage.setItem('userLocation', JSON.stringify(mergedLocation));
                    return;
                }
            }
            
            setLocation(locationData);
            
            // Store in localStorage for caching
            localStorage.setItem('userLocation', JSON.stringify(locationData));
            
        } catch (err) {
            console.error('API location detection failed:', err);
            
            // Try browser-based fallback
            try {
                const browserLocation = await detectBrowserLocation();
                if (browserLocation) {
                    setLocation(browserLocation);
                    localStorage.setItem('userLocation', JSON.stringify(browserLocation));
                    return;
                }
            } catch (browserErr) {
                console.error('Browser location detection failed:', browserErr);
            }
            
            // Final fallback: set unknown location
            const fallbackLocation: LocationData = {
                country: 'Unknown',
                countryCode: '',
                city: undefined,
                region: undefined,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
            };
            
            setLocation(fallbackLocation);
            setError('Could not detect location, using fallback');
        } finally {
            setIsLoading(false);
        }
    };

    const detectBrowserLocation = async (): Promise<LocationData | null> => {
        try {
            // Use timezone to guess country
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            console.log('Browser timezone:', timezone);
            
            // Import timezone utilities
            const { getCountryFromTimezone } = await import('@/utils/locationDetection');
            const countryData = getCountryFromTimezone(timezone);
            
            if (countryData.country !== 'Unknown') {
                return {
                    country: countryData.country,
                    countryCode: countryData.countryCode,
                    city: undefined,
                    region: undefined,
                    timezone: timezone
                };
            }
        } catch (error) {
            console.error('Browser timezone detection failed:', error);
        }
        
        return null;
    };

    const refetch = async () => {
        await detectLocation();
    };

    useEffect(() => {
        // Check if location is cached in localStorage
        const cachedLocation = localStorage.getItem('userLocation');
        
        if (cachedLocation) {
            try {
                const parsedLocation: LocationData = JSON.parse(cachedLocation);
                setLocation(parsedLocation);
                return; // Don't fetch if we have cached data
            } catch (err) {
                console.error('Error parsing cached location:', err);
                localStorage.removeItem('userLocation');
            }
        }

        // Fetch location if not cached
        detectLocation();
    }, []);

    return {
        location,
        isLoading,
        error,
        refetch
    };
}; 