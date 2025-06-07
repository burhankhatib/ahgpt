import { UserLocation } from '@/types/chat';

export interface LocationDetectionResult {
    location: UserLocation | null;
    error?: string;
}

export async function detectUserLocation(): Promise<LocationDetectionResult> {
    // First try browser geolocation if available
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    { timeout: 10000 }
                );
            });

            const { latitude, longitude } = position.coords;
            return {
                location: {
                    latitude,
                    longitude,
                    source: 'geolocation'
                }
            };
        } catch (error) {
            console.warn('Geolocation denied, falling back to IP detection');
        }
    }

    // Fallback to IP-based location detection
    try {
        const response = await fetch('https://ipwho.is/');
        const data = await response.json();

        if (data.success) {
            return {
                location: {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    city: data.city,
                    region: data.region,
                    country: data.country,
                    timezone: data.timezone?.id,
                    ip: data.ip,
                    source: 'ip'
                }
            };
        } else {
            return {
                location: null,
                error: 'Failed to get location from IP'
            };
        }
    } catch (error) {
        return {
            location: null,
            error: 'Error fetching IP location'
        };
    }
}

// Server-side IP detection (for when geolocation isn't available)
export async function detectLocationFromIP(ip?: string): Promise<LocationDetectionResult> {
    try {
        const url = ip ? `https://ipwho.is/${ip}` : 'https://ipwho.is/';
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            return {
                location: {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    city: data.city,
                    region: data.region,
                    country: data.country,
                    timezone: data.timezone?.id,
                    ip: data.ip,
                    source: 'ip'
                }
            };
        } else {
            return {
                location: null,
                error: 'Failed to detect location from IP'
            };
        }
    } catch (error) {
        return {
            location: null,
            error: 'Error fetching location from IP'
        };
    }
} 