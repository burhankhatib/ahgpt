// HTML5 Geolocation-based location detection utility
// Based on W3Schools HTML Geolocation API: https://www.w3schools.com/html/html5_geolocation.asp

export interface GeolocationData {
    country: string;
    countryCode: string;
    city?: string;
    region?: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
    detectionMethod: 'geolocation';
    confidence: 'high';
}

// Coordinate-based country detection (no external APIs needed)
const coordinateToCountry = (lat: number, lng: number): { country: string; countryCode: string; region?: string } => {
    // Simplified coordinate-to-country mapping
    // This uses bounding boxes for major countries
    const countryBounds = [
        // Middle East & Iran
        { 
            country: 'Iran', 
            countryCode: 'IR',
            bounds: { north: 39.8, south: 25.0, east: 63.3, west: 44.0 }
        },
        {
            country: 'Israel',
            countryCode: 'IL', 
            bounds: { north: 33.4, south: 29.5, east: 35.9, west: 34.3 }
        },
        {
            country: 'Palestine',
            countryCode: 'PS',
            bounds: { north: 32.55, south: 31.22, east: 35.57, west: 34.22 }
        },
        {
            country: 'Turkey',
            countryCode: 'TR',
            bounds: { north: 42.1, south: 35.8, east: 44.8, west: 25.7 }
        },
        {
            country: 'Saudi Arabia',
            countryCode: 'SA',
            bounds: { north: 32.2, south: 16.0, east: 55.7, west: 34.5 }
        },
        {
            country: 'United Arab Emirates',
            countryCode: 'AE',
            bounds: { north: 26.1, south: 22.6, east: 56.4, west: 51.0 }
        },
        {
            country: 'Jordan',
            countryCode: 'JO',
            bounds: { north: 33.4, south: 29.2, east: 39.3, west: 34.9 }
        },
        {
            country: 'Lebanon',
            countryCode: 'LB',
            bounds: { north: 34.7, south: 33.1, east: 36.6, west: 35.1 }
        },
        {
            country: 'Syria',
            countryCode: 'SY',
            bounds: { north: 37.3, south: 32.3, east: 42.4, west: 35.7 }
        },
        {
            country: 'Iraq',
            countryCode: 'IQ',
            bounds: { north: 37.4, south: 29.1, east: 48.8, west: 38.8 }
        },

        // Europe
        {
            country: 'Germany',
            countryCode: 'DE',
            bounds: { north: 55.1, south: 47.3, east: 15.0, west: 5.9 }
        },
        {
            country: 'France',
            countryCode: 'FR',
            bounds: { north: 51.1, south: 41.3, east: 9.6, west: -5.1 }
        },
        {
            country: 'United Kingdom',
            countryCode: 'GB',
            bounds: { north: 60.9, south: 49.9, east: 1.8, west: -8.6 }
        },
        {
            country: 'Spain',
            countryCode: 'ES',
            bounds: { north: 43.8, south: 27.6, east: 4.3, west: -18.2 }
        },
        {
            country: 'Italy',
            countryCode: 'IT',
            bounds: { north: 47.1, south: 35.5, east: 18.5, west: 6.6 }
        },
        {
            country: 'Netherlands',
            countryCode: 'NL',
            bounds: { north: 53.6, south: 50.7, east: 7.2, west: 3.4 }
        },
        {
            country: 'Sweden',
            countryCode: 'SE',
            bounds: { north: 69.1, south: 55.3, east: 24.2, west: 11.1 }
        },
        {
            country: 'Norway',
            countryCode: 'NO',
            bounds: { north: 71.2, south: 57.9, east: 31.3, west: 4.6 }
        },
        {
            country: 'Finland',
            countryCode: 'FI',
            bounds: { north: 70.1, south: 59.8, east: 31.6, west: 20.5 }
        },
        {
            country: 'Denmark',
            countryCode: 'DK',
            bounds: { north: 57.8, south: 54.6, east: 15.2, west: 8.1 }
        },
        {
            country: 'Poland',
            countryCode: 'PL',
            bounds: { north: 54.8, south: 49.0, east: 24.1, west: 14.1 }
        },
        {
            country: 'Russia',
            countryCode: 'RU',
            bounds: { north: 81.9, south: 41.2, east: -169.0, west: 19.6 }
        },
        {
            country: 'Ukraine',
            countryCode: 'UA',
            bounds: { north: 52.4, south: 44.4, east: 40.2, west: 22.1 }
        },

        // Asia
        {
            country: 'China',
            countryCode: 'CN',
            bounds: { north: 53.6, south: 15.8, east: 134.8, west: 73.4 }
        },
        {
            country: 'Japan',
            countryCode: 'JP',
            bounds: { north: 45.5, south: 24.0, east: 153.0, west: 123.0 }
        },
        {
            country: 'South Korea',
            countryCode: 'KR',
            bounds: { north: 38.6, south: 33.2, east: 130.9, west: 124.6 }
        },
        {
            country: 'India',
            countryCode: 'IN',
            bounds: { north: 37.1, south: 6.8, east: 97.4, west: 68.1 }
        },
        {
            country: 'Thailand',
            countryCode: 'TH',
            bounds: { north: 20.5, south: 5.6, east: 105.6, west: 97.3 }
        },
        {
            country: 'Vietnam',
            countryCode: 'VN',
            bounds: { north: 23.4, south: 8.2, east: 109.5, west: 102.1 }
        },
        {
            country: 'Indonesia',
            countryCode: 'ID',
            bounds: { north: 6.2, south: -11.0, east: 141.0, west: 95.0 }
        },

        // North America
        {
            country: 'United States',
            countryCode: 'US',
            bounds: { north: 71.4, south: 18.9, east: -66.9, west: -179.1 }
        },
        {
            country: 'Canada',
            countryCode: 'CA',
            bounds: { north: 83.1, south: 41.7, east: -52.6, west: -141.0 }
        },
        {
            country: 'Mexico',
            countryCode: 'MX',
            bounds: { north: 32.7, south: 14.5, east: -86.7, west: -118.4 }
        },

        // South America
        {
            country: 'Brazil',
            countryCode: 'BR',
            bounds: { north: 5.3, south: -33.7, east: -28.8, west: -73.9 }
        },
        {
            country: 'Argentina',
            countryCode: 'AR',
            bounds: { north: -21.8, south: -55.1, east: -53.6, west: -73.6 }
        },

        // Africa
        {
            country: 'Egypt',
            countryCode: 'EG',
            bounds: { north: 31.7, south: 22.0, east: 37.0, west: 25.0 }
        },
        {
            country: 'South Africa',
            countryCode: 'ZA',
            bounds: { north: -22.1, south: -47.0, east: 38.2, west: 16.5 }
        },

        // Oceania
        {
            country: 'Australia',
            countryCode: 'AU',
            bounds: { north: -9.2, south: -54.8, east: 159.1, west: 112.9 }
        },
        {
            country: 'New Zealand',
            countryCode: 'NZ',
            bounds: { north: -29.4, south: -52.6, east: -175.8, west: 165.9 }
        }
    ];

    // Check each country's bounds
    for (const country of countryBounds) {
        const { bounds } = country;
        if (lat >= bounds.south && lat <= bounds.north && 
            lng >= bounds.west && lng <= bounds.east) {
            return {
                country: country.country,
                countryCode: country.countryCode
            };
        }
    }

    // Default fallback
    return { country: 'Unknown', countryCode: '' };
};

// Get city name based on coordinates (simplified mapping for major cities)
const coordinateToCity = (lat: number, lng: number, country: string): string => {
    const majorCities = [
        // Iran
        { name: 'Tehran', country: 'Iran', lat: 35.7, lng: 51.4, radius: 1.0 },
        { name: 'Isfahan', country: 'Iran', lat: 32.7, lng: 51.7, radius: 0.5 },
        { name: 'Mashhad', country: 'Iran', lat: 36.3, lng: 59.6, radius: 0.5 },
        { name: 'Shiraz', country: 'Iran', lat: 29.6, lng: 52.5, radius: 0.5 },

        // Israel
        { name: 'Tel Aviv', country: 'Israel', lat: 32.1, lng: 34.8, radius: 0.3 },
        { name: 'Jerusalem', country: 'Israel', lat: 31.8, lng: 35.2, radius: 0.3 },
        { name: 'Haifa', country: 'Israel', lat: 32.8, lng: 35.0, radius: 0.3 },

        // Palestine
        { name: 'Ramallah', country: 'Palestine', lat: 31.9, lng: 35.2, radius: 0.2 },
        { name: 'Gaza', country: 'Palestine', lat: 31.5, lng: 34.5, radius: 0.2 },

        // Major world cities
        { name: 'Tokyo', country: 'Japan', lat: 35.7, lng: 139.7, radius: 1.0 },
        { name: 'Seoul', country: 'South Korea', lat: 37.6, lng: 127.0, radius: 0.8 },
        { name: 'Beijing', country: 'China', lat: 39.9, lng: 116.4, radius: 1.0 },
        { name: 'New York', country: 'United States', lat: 40.7, lng: -74.0, radius: 1.0 },
        { name: 'London', country: 'United Kingdom', lat: 51.5, lng: -0.1, radius: 1.0 },
        { name: 'Paris', country: 'France', lat: 48.9, lng: 2.4, radius: 1.0 },
        { name: 'Berlin', country: 'Germany', lat: 52.5, lng: 13.4, radius: 0.8 },
        { name: 'Rome', country: 'Italy', lat: 41.9, lng: 12.5, radius: 0.8 },
        { name: 'Madrid', country: 'Spain', lat: 40.4, lng: -3.7, radius: 0.8 },
        { name: 'Amsterdam', country: 'Netherlands', lat: 52.4, lng: 4.9, radius: 0.5 },
        { name: 'Stockholm', country: 'Sweden', lat: 59.3, lng: 18.1, radius: 0.5 },
        { name: 'Moscow', country: 'Russia', lat: 55.8, lng: 37.6, radius: 1.0 },
        { name: 'Istanbul', country: 'Turkey', lat: 41.0, lng: 28.9, radius: 1.0 },
        { name: 'Dubai', country: 'United Arab Emirates', lat: 25.3, lng: 55.3, radius: 0.5 },
        { name: 'Mumbai', country: 'India', lat: 19.1, lng: 72.9, radius: 1.0 },
        { name: 'Bangkok', country: 'Thailand', lat: 13.8, lng: 100.5, radius: 0.8 },
        { name: 'Sydney', country: 'Australia', lat: -33.9, lng: 151.2, radius: 1.0 }
    ];

    // Find closest city in the same country
    const citiesInCountry = majorCities.filter(city => city.country === country);
    
    for (const city of citiesInCountry) {
        const distance = Math.sqrt(
            Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
        );
        
        if (distance <= city.radius) {
            return city.name;
        }
    }

    return ''; // No city found
};

// Main geolocation detection function
export const detectUserGeolocation = (): Promise<GeolocationData | null> => {
    return new Promise((resolve) => {
        console.log('🌍 Starting HTML5 Geolocation detection...');

        // Check if geolocation is supported
        if (!navigator.geolocation) {
            console.log('❌ Geolocation is not supported by this browser');
            resolve(null);
            return;
        }

        // Geolocation options
        const options = {
            enableHighAccuracy: true, // Use GPS if available
            timeout: 10000, // 10 second timeout
            maximumAge: 300000 // Accept 5-minute old cached position
        };

        // Success callback
        const successCallback = (position: GeolocationPosition) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log(`📍 Geolocation success: ${latitude}, ${longitude} (±${accuracy}m)`);

            // Convert coordinates to country and city
            const locationInfo = coordinateToCountry(latitude, longitude);
            const city = coordinateToCity(latitude, longitude, locationInfo.country);

            const geolocationData: GeolocationData = {
                country: locationInfo.country,
                countryCode: locationInfo.countryCode,
                city: city || undefined,
                latitude,
                longitude,
                accuracy,
                timestamp: new Date().toISOString(),
                detectionMethod: 'geolocation',
                confidence: 'high'
            };

            console.log('✅ Geolocation detection complete:', geolocationData);
            resolve(geolocationData);
        };

        // Error callback
        const errorCallback = (error: GeolocationPositionError) => {
            let errorMessage = '';
            
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'User denied the request for Geolocation';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'The request to get user location timed out';
                    break;
                default:
                    errorMessage = 'An unknown error occurred';
                    break;
            }

            console.log(`❌ Geolocation error: ${errorMessage}`);
            resolve(null);
        };

        // Request user location
        navigator.geolocation.getCurrentPosition(
            successCallback,
            errorCallback,
            options
        );
    });
};

// Function to watch user location (for real-time tracking)
export const watchUserGeolocation = (
    onLocationUpdate: (data: GeolocationData) => void,
    onError: (error: string) => void
): number | null => {
    console.log('🔄 Starting location watching...');

    if (!navigator.geolocation) {
        onError('Geolocation is not supported by this browser');
        return null;
    }

    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000 // 1 minute cache
    };

    const successCallback = (position: GeolocationPosition) => {
        const { latitude, longitude, accuracy } = position.coords;
        const locationInfo = coordinateToCountry(latitude, longitude);
        const city = coordinateToCity(latitude, longitude, locationInfo.country);

        const geolocationData: GeolocationData = {
            country: locationInfo.country,
            countryCode: locationInfo.countryCode,
            city: city || undefined,
            latitude,
            longitude,
            accuracy,
            timestamp: new Date().toISOString(),
            detectionMethod: 'geolocation',
            confidence: 'high'
        };

        onLocationUpdate(geolocationData);
    };

    const errorCallback = (error: GeolocationPositionError) => {
        let errorMessage = '';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'User denied the request for Geolocation';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable';
                break;
            case error.TIMEOUT:
                errorMessage = 'The request to get user location timed out';
                break;
            default:
                errorMessage = 'An unknown error occurred';
                break;
        }
        onError(errorMessage);
    };

    return navigator.geolocation.watchPosition(
        successCallback,
        errorCallback,
        options
    );
};

// Helper function to get country flag from country code
export const getCountryFlag = (countryCode: string): string => {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    
    const flags: Record<string, string> = {
        'IR': '🇮🇷', 'IL': '🇮🇱', 'PS': '🇵🇸', 'TR': '🇹🇷', 'SA': '🇸🇦', 'AE': '🇦🇪',
        'JO': '🇯🇴', 'LB': '🇱🇧', 'SY': '🇸🇾', 'IQ': '🇮🇶', 'DE': '🇩🇪', 'FR': '🇫🇷',
        'GB': '🇬🇧', 'ES': '🇪🇸', 'IT': '🇮🇹', 'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴',
        'FI': '🇫🇮', 'DK': '🇩🇰', 'PL': '🇵🇱', 'RU': '🇷🇺', 'UA': '🇺🇦', 'CN': '🇨🇳',
        'JP': '🇯🇵', 'KR': '🇰🇷', 'IN': '🇮🇳', 'TH': '🇹🇭', 'VN': '🇻🇳', 'ID': '🇮🇩',
        'US': '🇺🇸', 'CA': '🇨🇦', 'MX': '🇲🇽', 'BR': '🇧🇷', 'AR': '🇦🇷', 'EG': '🇪🇬',
        'ZA': '🇿🇦', 'AU': '🇦🇺', 'NZ': '🇳🇿'
    };
    
    return flags[countryCode.toUpperCase()] || '🌍';
}; 