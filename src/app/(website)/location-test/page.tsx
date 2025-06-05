"use client";

import { useState, useEffect } from 'react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { getCountryFlag } from '@/utils/locationDetection';

export default function LocationTestPage() {
    const { location, isLoading, error, refetch } = useUserLocation();
    const [apiTest, setApiTest] = useState<any>(null);
    const [apiLoading, setApiLoading] = useState(false);

    const testLocationAPI = async () => {
        setApiLoading(true);
        try {
            const response = await fetch('/api/location');
            const data = await response.json();
            setApiTest(data);
        } catch (err) {
            setApiTest({ error: err instanceof Error ? err.message : 'Unknown error' });
        } finally {
            setApiLoading(false);
        }
    };

    useEffect(() => {
        testLocationAPI();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Location Detection Test</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hook Test */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">useUserLocation Hook</h2>

                        {isLoading && (
                            <div className="text-blue-600">Loading location...</div>
                        )}

                        {error && (
                            <div className="text-red-600">Error: {error}</div>
                        )}

                        {location && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{getCountryFlag(location.countryCode)}</span>
                                    <span className="font-medium">{location.country}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <div>Country Code: {location.countryCode}</div>
                                    <div>City: {location.city || 'N/A'}</div>
                                    <div>Region: {location.region || 'N/A'}</div>
                                    <div>Timezone: {location.timezone || 'N/A'}</div>
                                    <div>Detection Method: {location.detectionMethod || 'N/A'}</div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={refetch}
                            disabled={isLoading}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Refetch Location
                        </button>
                    </div>

                    {/* Direct API Test */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Direct API Test</h2>

                        {apiLoading && (
                            <div className="text-blue-600">Testing API...</div>
                        )}

                        {apiTest && (
                            <div className="space-y-2">
                                {apiTest.error ? (
                                    <div className="text-red-600">Error: {apiTest.error}</div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{getCountryFlag(apiTest.countryCode)}</span>
                                            <span className="font-medium">{apiTest.country}</span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <div>Country Code: {apiTest.countryCode}</div>
                                            <div>City: {apiTest.city || 'N/A'}</div>
                                            <div>Region: {apiTest.region || 'N/A'}</div>
                                            <div>Timezone: {apiTest.timezone || 'N/A'}</div>
                                            <div>IP: {apiTest.ip || 'N/A'}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <button
                            onClick={testLocationAPI}
                            disabled={apiLoading}
                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            Test API Again
                        </button>
                    </div>
                </div>

                {/* Raw Data Display */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Raw Data</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-medium mb-2">Hook Data:</h3>
                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                                {JSON.stringify({ location, isLoading, error }, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <h3 className="font-medium mb-2">API Data:</h3>
                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                                {JSON.stringify(apiTest, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 