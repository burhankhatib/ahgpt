"use client";

import { useState, useEffect } from 'react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { getCountryFlag } from '@/utils/visitorApiDetection';

export default function LocationTestPage() {
    const { location, isLoading, error, refetch } = useUserLocation();
    const [directTest, setDirectTest] = useState<any>(null);
    const [directLoading, setDirectLoading] = useState(false);

    const testDirectVisitorAPI = async () => {
        setDirectLoading(true);
        try {
            // Import and test VisitorAPI directly
            const { detectUserLocation } = await import('@/utils/visitorApiDetection');
            const data = await detectUserLocation();
            setDirectTest(data);
        } catch (err) {
            setDirectTest({ error: err instanceof Error ? err.message : 'Unknown error' });
        } finally {
            setDirectLoading(false);
        }
    };

    useEffect(() => {
        testDirectVisitorAPI();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">VisitorAPI Location Test</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hook Test */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">useUserLocation Hook</h2>

                        {isLoading && (
                            <div className="text-blue-600">Loading location with VisitorAPI...</div>
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
                                    <div>Detection Method: {location.detectionMethod}</div>
                                    <div>Confidence: {location.confidence}</div>
                                    {location.ipAddress && <div>IP Address: {location.ipAddress}</div>}
                                    {location.browser && <div>Browser: {location.browser} {location.browserVersion}</div>}
                                    {location.os && <div>OS: {location.os} {location.osVersion}</div>}
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

                    {/* Direct VisitorAPI Test */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Direct VisitorAPI Test</h2>

                        {directLoading && (
                            <div className="text-blue-600">Testing VisitorAPI directly...</div>
                        )}

                        {directTest && (
                            <div className="space-y-2">
                                {directTest.error ? (
                                    <div className="text-red-600">Error: {directTest.error}</div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{getCountryFlag(directTest.countryCode)}</span>
                                            <span className="font-medium">{directTest.country}</span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <div>Country Code: {directTest.countryCode}</div>
                                            <div>City: {directTest.city || 'N/A'}</div>
                                            <div>Region: {directTest.region || 'N/A'}</div>
                                            <div>Detection Method: {directTest.detectionMethod}</div>
                                            <div>Confidence: {directTest.confidence}</div>
                                            {directTest.ipAddress && <div>IP: {directTest.ipAddress}</div>}
                                            {directTest.currencies && directTest.currencies.length > 0 && (
                                                <div>Currencies: {directTest.currencies.join(', ')}</div>
                                            )}
                                            {directTest.languages && directTest.languages.length > 0 && (
                                                <div>Languages: {directTest.languages.join(', ')}</div>
                                            )}
                                            {directTest.cityLatLong && (
                                                <div>Coordinates: {directTest.cityLatLong.lat.toFixed(4)}, {directTest.cityLatLong.lng.toFixed(4)}</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <button
                            onClick={testDirectVisitorAPI}
                            disabled={directLoading}
                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            Test VisitorAPI Again
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
                            <h3 className="font-medium mb-2">Direct VisitorAPI Data:</h3>
                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                                {JSON.stringify(directTest, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-blue-800 mb-4">VisitorAPI Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <h3 className="font-medium text-blue-900 mb-2">✅ No Permissions Required</h3>
                            <p className="text-blue-700">Works automatically using IP geolocation, no user prompts needed.</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-blue-900 mb-2">🎯 High Accuracy</h3>
                            <p className="text-blue-700">Provides city-level location accuracy in most cases.</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-blue-900 mb-2">📊 Rich Data</h3>
                            <p className="text-blue-700">Additional visitor information including browser, OS, currencies, and languages.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 