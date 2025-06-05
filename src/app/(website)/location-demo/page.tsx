'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { detectLocationBrowserOnly, getCountryFlag } from '@/utils/locationDetection';

export default function LocationDemo() {
    const { location, isLoading, error } = useUserLocation();
    const [browserLocation, setBrowserLocation] = useState<any>(null);
    const [testResults, setTestResults] = useState<any[]>([]);

    useEffect(() => {
        // Test browser-only detection
        const browserResult = detectLocationBrowserOnly();
        setBrowserLocation(browserResult);

        // Run multiple tests
        const tests = [
            {
                name: 'Browser Language Detection',
                data: {
                    language: navigator.language,
                    languages: navigator.languages,
                    locale: Intl.DateTimeFormat().resolvedOptions().locale
                }
            },
            {
                name: 'Browser Timezone Detection',
                data: {
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    offset: new Date().getTimezoneOffset()
                }
            },
            {
                name: 'Combined Browser Detection',
                data: browserResult
            }
        ];

        setTestResults(tests);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        🌍 Location Detection Demo
                    </h1>
                    <p className="text-lg text-gray-600">
                        Experience our revolutionary browser-only location detection system
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                        <h2 className="text-lg font-semibold text-green-800 mb-2">✅ Problem Solved!</h2>
                        <p className="text-green-700">
                            <strong>Before:</strong> All users showed the same location (admin&apos;s location)<br />
                            <strong>Now:</strong> Each user gets their location detected from their own browser<br />
                            <strong>Iranian Users:</strong> Persian/Farsi speakers now correctly show Iran 🇮🇷 instead of Palestine
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Current Location */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">📍 Current Location</h2>

                        {isLoading && (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-gray-600">Detecting location...</span>
                            </div>
                        )}

                        {error && (
                            <div className="text-red-600 bg-red-50 p-3 rounded-md">
                                Error: {error}
                            </div>
                        )}

                        {location && (
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <span className="text-3xl">{getCountryFlag(location.countryCode)}</span>
                                    <div>
                                        <div className="font-semibold text-lg">{location.country}</div>
                                        {location.city && (
                                            <div className="text-gray-600">{location.city}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-sm text-gray-500 space-y-1">
                                    <div>Detection Method: {location.detectionMethod || 'browser-only'}</div>
                                    <div>Confidence: {location.confidence || 'medium'}</div>
                                    {location.timezone && <div>Timezone: {location.timezone}</div>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Browser-Only Detection */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">🖥️ Browser-Only Detection</h2>

                        {browserLocation && (
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <span className="text-3xl">{getCountryFlag(browserLocation.countryCode)}</span>
                                    <div>
                                        <div className="font-semibold text-lg">{browserLocation.country}</div>
                                        {browserLocation.city && (
                                            <div className="text-gray-600">{browserLocation.city}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-sm text-gray-500 space-y-1">
                                    <div>Method: {browserLocation.detectionMethod}</div>
                                    <div>Confidence: {browserLocation.confidence}</div>
                                    <div>Timezone: {browserLocation.timezone}</div>
                                </div>

                                {browserLocation.browserInfo && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded">
                                        <div className="text-xs text-gray-600">
                                            <div>Primary Language: {browserLocation.browserInfo.language}</div>
                                            <div>All Languages: {browserLocation.browserInfo.languages.join(', ')}</div>
                                            <div>Locale: {browserLocation.browserInfo.locale}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Test Results */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">🧪 Detection Tests</h2>

                        <div className="space-y-4">
                            {testResults.map((test, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-2">{test.name}</h3>
                                    <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                                        {JSON.stringify(test.data, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance Info */}
                    <div className="lg:col-span-2 bg-green-50 border border-green-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-green-800 mb-4">⚡ Performance Benefits</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="text-center p-3 bg-white rounded-lg">
                                <div className="text-2xl mb-2">🚀</div>
                                <div className="font-medium">Instant Detection</div>
                                <div className="text-gray-600">No network requests</div>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg">
                                <div className="text-2xl mb-2">♾️</div>
                                <div className="font-medium">No Rate Limits</div>
                                <div className="text-gray-600">Unlimited requests</div>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg">
                                <div className="text-2xl mb-2">🔒</div>
                                <div className="font-medium">Privacy Friendly</div>
                                <div className="text-gray-600">No IP data sent</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 