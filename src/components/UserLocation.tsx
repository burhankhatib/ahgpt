"use client";

import React, { useEffect, useState } from "react";

interface UserLocation {
    latitude?: number;
    longitude?: number;
    city?: string;
    region?: string;
    country?: string;
    timezone?: string;
    ip?: string;
    source: "geolocation" | "ip" | "unknown";
}

export default function UserLocation() {
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getLocationFromBrowser = () => {
            if (!navigator.geolocation) {
                setError("Geolocation not supported.");
                return false;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude, source: "geolocation" });

                    // Optional: Enrich with IP API using coordinates if needed
                },
                async (err) => {
                    console.warn("Geolocation denied, falling back to IP...");
                    await getLocationFromIP(); // fallback
                },
                { timeout: 10000 }
            );
        };

        const getLocationFromIP = async () => {
            try {
                const res = await fetch("https://ipwho.is/");
                const data = await res.json();

                if (data.success) {
                    setLocation({
                        latitude: data.latitude,
                        longitude: data.longitude,
                        city: data.city,
                        region: data.region,
                        country: data.country,
                        timezone: data.timezone?.id,
                        ip: data.ip,
                        source: "ip",
                    });
                } else {
                    setError("Failed to get location from IP.");
                }
            } catch (err) {
                setError("Error fetching IP location.");
            }
        };

        getLocationFromBrowser();
    }, []);

    if (error) {
        return <div className="text-red-600">Error: {error}</div>;
    }

    if (!location) {
        return <div className="text-gray-500">Detecting location...</div>;
    }

    return (
        <div className="p-4 border rounded-md shadow-md max-w-md mx-auto mt-4">
            <h2 className="text-xl font-bold mb-2">User Location Info</h2>
            <ul className="text-sm space-y-1">
                {location.latitude && <li>Latitude: {location.latitude}</li>}
                {location.longitude && <li>Longitude: {location.longitude}</li>}
                {location.city && <li>City: {location.city}</li>}
                {location.region && <li>Region: {location.region}</li>}
                {location.country && <li>Country: {location.country}</li>}
                {location.timezone && <li>Timezone: {location.timezone}</li>}
                {location.ip && <li>IP Address: {location.ip}</li>}
                <li>Source: {location.source}</li>
            </ul>
        </div>
    );
}
