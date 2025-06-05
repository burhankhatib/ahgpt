'use client';

import { useState } from 'react';
import { detectUserGeolocation, GeolocationData, getCountryFlag } from '@/utils/geolocationDetection';

export default function GeolocationTest() {
    const [geolocationData, setGeolocationData] = useState<GeolocationData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDetectLocation = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await detectUserGeolocation();
            setGeolocationData(data);

            if (!data) {
                setError('Location detection failed or was denied');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const clearData = () => {
        setGeolocationData(null);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                        🌍 HTML5 Geolocation API Test
                    </h1>

                    <div className="text-center mb-8">
                        <p className="text-gray-600 mb-4">
                            Test the new HTML5 Geolocation-based location detection system.
                            This uses your device&apos;s GPS/location services to get accurate coordinates
                            and maps them to countries and cities.
                        </p>

                        <div className="space-x-4">
                            <button
                                onClick={handleDetectLocation}
                                disabled={isLoading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? '📍 Detecting Location...' : '📍 Detect My Location'}
                            </button>

                            {geolocationData && (
                                <button
                                    onClick={clearData}
                                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                >
                                    🗑️ Clear Data
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                                <span className="text-blue-700">Requesting location permission and detecting...</span>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                            <div className="flex items-center">
                                <span className="text-red-500 text-xl mr-3">❌</span>
                                <div>
                                    <h3 className="text-red-800 font-semibold">Location Detection Failed</h3>
                                    <p className="text-red-600">{error}</p>
                                    <p className="text-red-500 text-sm mt-2">
                                        Make sure you allow location access when prompted and are using HTTPS.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {geolocationData && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">
                                    {getCountryFlag(geolocationData.countryCode)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-green-800 font-semibold text-xl mb-2">
                                        ✅ Location Detected Successfully!
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div>
                                                <span className="font-medium text-gray-700">Country:</span>
                                                <span className="ml-2 text-gray-900">{geolocationData.country}</span>
                                            </div>
                                            {geolocationData.city && (
                                                <div>
                                                    <span className="font-medium text-gray-700">City:</span>
                                                    <span className="ml-2 text-gray-900">{geolocationData.city}</span>
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium text-gray-700">Detection Method:</span>
                                                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                                    📍 {geolocationData.detectionMethod}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Confidence:</span>
                                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                                    {geolocationData.confidence}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">Latitude:</span>
                                                <span className="ml-2 font-mono">{geolocationData.latitude.toFixed(6)}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Longitude:</span>
                                                <span className="ml-2 font-mono">{geolocationData.longitude.toFixed(6)}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Accuracy:</span>
                                                <span className="ml-2">±{Math.round(geolocationData.accuracy)}m</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Detected:</span>
                                                <span className="ml-2">{new Date(geolocationData.timestamp).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Information Panel */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">How It Works</h3>
                        <div className="space-y-3 text-gray-600">
                            <div className="flex items-start gap-3">
                                <span className="text-blue-500 mt-1">1.</span>
                                <div>
                                    <strong>Permission Request:</strong> Browser asks for location access permission
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-blue-500 mt-1">2.</span>
                                <div>
                                    <strong>GPS/Network Location:</strong> Device provides latitude/longitude coordinates
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-blue-500 mt-1">3.</span>
                                <div>
                                    <strong>Coordinate Mapping:</strong> Coordinates are mapped to countries and cities using bounding boxes
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-blue-500 mt-1">4.</span>
                                <div>
                                    <strong>Local Storage:</strong> Location data is stored locally for dashboard display
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <span className="text-yellow-600 text-xl">💡</span>
                                <div className="text-yellow-800">
                                    <strong>Note:</strong> Location detection requires HTTPS and user permission.
                                    If denied, the dashboard will fall back to other detection methods.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 