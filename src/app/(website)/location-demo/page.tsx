'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { getCountryFlag } from '@/utils/visitorApiDetection';

export default function LocationDemo() {
    const { location, isLoading, error } = useUserLocation();
    const [testResults, setTestResults] = useState<any[]>([]);

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        // Run multiple tests for browser capabilities
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
                name: 'Screen Information',
                data: {
                    width: window.screen.width,
                    height: window.screen.height,
                    pixelRatio: window.devicePixelRatio
                }
            }
        ];

        setTestResults(tests);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        🌍 VisitorAPI Location Demo
                    </h1>
                    <p className="text-lg text-gray-600">
                        Experience our new VisitorAPI-based location detection system
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                        <h2 className="text-lg font-semibold text-green-800 mb-2">✅ VisitorAPI Benefits!</h2>
                        <p className="text-green-700">
                            <strong>No Permissions:</strong> Works automatically without user prompts<br />
                            <strong>High Accuracy:</strong> IP-based location detection with city-level precision<br />
                            <strong>Rich Data:</strong> Additional visitor information (browser, OS, etc.)<br />
                            <strong>Better UX:</strong> Instant detection, no waiting for GPS or user interaction
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Current Location with VisitorAPI */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">📍 VisitorAPI Location</h2>

                        {isLoading && (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-gray-600">Detecting location with VisitorAPI...</span>
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
                                        {location.region && (
                                            <div className="text-gray-500 text-sm">{location.region}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-sm text-gray-500 space-y-1">
                                    <div>Detection Method: {location.detectionMethod}</div>
                                    <div>Confidence: {location.confidence}</div>
                                    {location.ipAddress && <div>IP Address: {location.ipAddress}</div>}
                                </div>

                                {/* Additional VisitorAPI Data */}
                                {(location.browser || location.os || location.currencies || location.languages) && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded">
                                        <div className="text-xs text-blue-800 space-y-1">
                                            {location.browser && (
                                                <div>Browser: {location.browser} {location.browserVersion}</div>
                                            )}
                                            {location.os && (
                                                <div>OS: {location.os} {location.osVersion}</div>
                                            )}
                                            {location.currencies && (
                                                <div>Currencies: {location.currencies.join(', ')}</div>
                                            )}
                                            {location.languages && (
                                                <div>Languages: {location.languages.join(', ')}</div>
                                            )}
                                            {location.cityLatLong && (
                                                <div>Coordinates: {location.cityLatLong.lat.toFixed(4)}, {location.cityLatLong.lng.toFixed(4)}</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Browser Capabilities */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">🖥️ Browser Capabilities</h2>

                        <div className="space-y-3">
                            {typeof window !== 'undefined' && (
                                <>
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-700">Language Settings:</div>
                                        <div className="text-gray-600">Primary: {navigator.language}</div>
                                        <div className="text-gray-600">Locale: {Intl.DateTimeFormat().resolvedOptions().locale}</div>
                                    </div>

                                    <div className="text-sm">
                                        <div className="font-medium text-gray-700">Timezone:</div>
                                        <div className="text-gray-600">{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
                                        <div className="text-gray-600">Offset: {new Date().getTimezoneOffset()} minutes</div>
                                    </div>

                                    <div className="text-sm">
                                        <div className="font-medium text-gray-700">Screen:</div>
                                        <div className="text-gray-600">{window.screen.width} × {window.screen.height}</div>
                                        <div className="text-gray-600">Pixel Ratio: {window.devicePixelRatio}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Test Results */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">🧪 Browser Detection Tests</h2>

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

                    {/* VisitorAPI Benefits */}
                    <div className="lg:col-span-2 bg-green-50 border border-green-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-green-800 mb-4">⚡ VisitorAPI Advantages</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center p-3 bg-white rounded-lg">
                                <div className="text-2xl mb-2">🚀</div>
                                <div className="font-medium">No Permissions</div>
                                <div className="text-gray-600">Works automatically</div>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg">
                                <div className="text-2xl mb-2">🎯</div>
                                <div className="font-medium">High Accuracy</div>
                                <div className="text-gray-600">IP-based detection</div>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg">
                                <div className="text-2xl mb-2">📊</div>
                                <div className="font-medium">Rich Data</div>
                                <div className="text-gray-600">Browser, OS, more</div>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg">
                                <div className="text-2xl mb-2">⚡</div>
                                <div className="font-medium">Fast</div>
                                <div className="text-gray-600">Instant results</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 