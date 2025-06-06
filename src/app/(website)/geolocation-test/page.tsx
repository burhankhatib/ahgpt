'use client';

import { useState } from 'react';
import { detectUserLocation, detectUserLocationEnhanced, VisitorApiData, getCountryFlag, clearLocationCache, getDebugInfo } from '@/utils/visitorApiDetection';

export default function VisitorApiTest() {
    const [locationData, setLocationData] = useState<VisitorApiData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<any>(null);

    const handleDetectLocation = async () => {
        setIsLoading(true);
        setError(null);

        console.log('🧪 Test Page: Starting location detection...');
        console.log('🔍 Debug Info Before Detection:', getDebugInfo());

        try {
            const data = await detectUserLocationEnhanced();
            setLocationData(data);

            if (!data) {
                setError('Location detection failed. Please check console for detailed error logs.');
                console.error('🧪 Test Page: No data returned from detectUserLocation');
            } else {
                console.log('🧪 Test Page: Location detection successful:', data);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('🧪 Test Page: Exception during location detection:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestVisitorApiPackage = async () => {
        console.log('🔧 Testing VisitorAPI package installation...');

        try {
            // Test if we can import the VisitorAPI package
            const VisitorAPI = await import('visitorapi');
            console.log('✅ VisitorAPI package imported successfully:', VisitorAPI);

            if (VisitorAPI.default) {
                console.log('✅ VisitorAPI.default function available');

                // Test call with current project ID
                const testProjectId = "tyepXV1WpxWiG6t1nFun";
                console.log('🧪 Testing with project ID:', testProjectId);

                VisitorAPI.default(
                    testProjectId,
                    (data) => {
                        console.log('✅ VisitorAPI test successful:', data);
                        alert('✅ VisitorAPI package is working! Check console for details.');
                    },
                    (error) => {
                        console.error('❌ VisitorAPI test failed:', error);
                        alert('❌ VisitorAPI call failed. Check console for error details.');
                    }
                );
            } else {
                console.error('❌ VisitorAPI.default is not available');
                alert('❌ VisitorAPI package structure issue');
            }
        } catch (error) {
            console.error('❌ Failed to import VisitorAPI package:', error);
            alert('❌ VisitorAPI package not found or import failed. Check console.');
        }
    };

    const handleTestOriginalVisitorApi = async () => {
        console.log('🔍 Testing original VisitorAPI only...');
        setIsLoading(true);
        setError(null);

        try {
            const data = await detectUserLocation();
            setLocationData(data);

            if (!data) {
                setError('Original VisitorAPI failed. Check console for details.');
                console.error('🧪 Original VisitorAPI returned null');
            } else {
                console.log('🧪 Original VisitorAPI successful:', data);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('🧪 Original VisitorAPI exception:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestAlternativeService = async () => {
        console.log('🌐 Testing alternative location services...');
        setIsLoading(true);

        try {
            // Test ipify for IP detection
            console.log('🔍 Testing ipify.org...');
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            console.log('✅ Current IP from ipify:', ipData);

            // Test ipapi.co for location
            console.log('🔍 Testing ipapi.co...');
            const locationResponse = await fetch('https://ipapi.co/json/');
            const locationApiData = await locationResponse.json();
            console.log('✅ Location from ipapi.co:', locationApiData);

            if (locationApiData.country_name) {
                const alternativeData: VisitorApiData = {
                    country: locationApiData.country_name,
                    countryCode: locationApiData.country_code || locationApiData.country,
                    city: locationApiData.city,
                    region: locationApiData.region,
                    ipAddress: locationApiData.ip,
                    timestamp: new Date().toISOString(),
                    detectionMethod: 'visitorapi', // Keep consistent
                    confidence: 'high'
                };

                setLocationData(alternativeData);
                console.log('✅ Alternative service successful:', alternativeData);
                alert('✅ Alternative location service worked! Check results below.');
            }
        } catch (error) {
            console.error('❌ Alternative services failed:', error);
            alert('❌ Alternative services also failed. Network issue?');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearCache = () => {
        console.log('🧪 Test Page: Clearing all location cache...');
        const clearedCount = clearLocationCache();
        alert(`Cleared ${clearedCount} cached location entries. Now try detecting location again.`);
        setLocationData(null);
        setError(null);
    };

    const handleShowDebugInfo = () => {
        const info = getDebugInfo();
        setDebugInfo(info);
        console.log('🧪 Test Page: Current debug info:', info);
    };

    const clearData = () => {
        setLocationData(null);
        setError(null);
        setDebugInfo(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                        🌍 VisitorAPI Location Detection Test
                    </h1>

                    <div className="text-center mb-8">
                        <p className="text-gray-600 mb-4">
                            Test the new VisitorAPI-based location detection system.
                            This uses IP geolocation to detect user location without requiring permissions,
                            providing city, country, and additional visitor information.
                        </p>

                        <div className="flex flex-wrap gap-3 justify-center">
                            <button
                                onClick={handleDetectLocation}
                                disabled={isLoading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? '📍 Detecting Location...' : '📍 Detect Location (Enhanced)'}
                            </button>

                            <button
                                onClick={handleTestOriginalVisitorApi}
                                disabled={isLoading}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                🔍 Test Original VisitorAPI Only
                            </button>

                            <button
                                onClick={handleTestVisitorApiPackage}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                🔧 Test VisitorAPI Package
                            </button>

                            <button
                                onClick={handleTestAlternativeService}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                🌐 Test Alternative Service
                            </button>

                            <button
                                onClick={handleClearCache}
                                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                            >
                                🗑️ Clear Cache
                            </button>

                            <button
                                onClick={handleShowDebugInfo}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                🔍 Show Debug Info
                            </button>

                            {(locationData || debugInfo) && (
                                <button
                                    onClick={clearData}
                                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                >
                                    🆕 Clear Display
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                                <span className="text-blue-700">Detecting location with VisitorAPI...</span>
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
                                        Make sure you have configured your VisitorAPI project ID in the code.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Debug Info Display */}
                    {debugInfo && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                            <h3 className="text-purple-800 font-semibold text-xl mb-4">
                                🔍 Debug Information
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="font-medium text-purple-700">Project ID:</div>
                                        <div className="font-mono text-purple-600">{debugInfo.projectId}</div>
                                    </div>
                                    <div>
                                        <div className="font-medium text-purple-700">Browser Language:</div>
                                        <div className="text-purple-600">{debugInfo.language}</div>
                                    </div>
                                    <div>
                                        <div className="font-medium text-purple-700">Timezone:</div>
                                        <div className="text-purple-600">{debugInfo.timezone}</div>
                                    </div>
                                    <div>
                                        <div className="font-medium text-purple-700">Timestamp:</div>
                                        <div className="text-purple-600">{new Date(debugInfo.timestamp).toLocaleString()}</div>
                                    </div>
                                </div>

                                <div>
                                    <div className="font-medium text-purple-700 mb-2">All Languages:</div>
                                    <div className="text-purple-600">{debugInfo.languages?.join(', ')}</div>
                                </div>

                                <div>
                                    <div className="font-medium text-purple-700 mb-2">User Agent:</div>
                                    <div className="text-purple-600 text-xs break-all">{debugInfo.userAgent}</div>
                                </div>

                                <div>
                                    <div className="font-medium text-purple-700 mb-2">Cached Location Data:</div>
                                    <div className="bg-purple-100 p-3 rounded text-xs overflow-auto">
                                        <pre>{JSON.stringify(debugInfo.cachedData, null, 2)}</pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {locationData && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">
                                    {getCountryFlag(locationData.countryCode)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-green-800 font-semibold text-xl mb-2">
                                        ✅ Location Detected Successfully!
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div>
                                                <span className="font-medium text-gray-700">Country:</span>
                                                <span className="ml-2 text-gray-900">{locationData.country}</span>
                                            </div>
                                            {locationData.city && (
                                                <div>
                                                    <span className="font-medium text-gray-700">City:</span>
                                                    <span className="ml-2 text-gray-900">{locationData.city}</span>
                                                </div>
                                            )}
                                            {locationData.region && (
                                                <div>
                                                    <span className="font-medium text-gray-700">Region:</span>
                                                    <span className="ml-2 text-gray-900">{locationData.region}</span>
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium text-gray-700">Detection Method:</span>
                                                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                                    🌐 {locationData.detectionMethod}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Confidence:</span>
                                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                                    {locationData.confidence}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm text-gray-600">
                                            {locationData.ipAddress && (
                                                <div>
                                                    <span className="font-medium">IP Address:</span>
                                                    <span className="ml-2 font-mono">{locationData.ipAddress}</span>
                                                </div>
                                            )}
                                            {locationData.cityLatLong && (
                                                <>
                                                    <div>
                                                        <span className="font-medium">Latitude:</span>
                                                        <span className="ml-2 font-mono">{locationData.cityLatLong.lat.toFixed(6)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Longitude:</span>
                                                        <span className="ml-2 font-mono">{locationData.cityLatLong.lng.toFixed(6)}</span>
                                                    </div>
                                                </>
                                            )}
                                            {locationData.browser && (
                                                <div>
                                                    <span className="font-medium">Browser:</span>
                                                    <span className="ml-2">{locationData.browser} {locationData.browserVersion}</span>
                                                </div>
                                            )}
                                            {locationData.os && (
                                                <div>
                                                    <span className="font-medium">OS:</span>
                                                    <span className="ml-2">{locationData.os} {locationData.osVersion}</span>
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium">Detected:</span>
                                                <span className="ml-2">{new Date(locationData.timestamp).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Information */}
                                    {(locationData.currencies || locationData.languages) && (
                                        <div className="mt-4 pt-4 border-t border-green-200">
                                            <h4 className="font-semibold text-green-800 mb-2">Additional Information:</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                {locationData.currencies && (
                                                    <div>
                                                        <span className="font-medium text-gray-700">Currencies:</span>
                                                        <span className="ml-2 text-gray-600">{locationData.currencies.join(', ')}</span>
                                                    </div>
                                                )}
                                                {locationData.languages && (
                                                    <div>
                                                        <span className="font-medium text-gray-700">Languages:</span>
                                                        <span className="ml-2 text-gray-600">{locationData.languages.join(', ')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Information Panel */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">How VisitorAPI Works</h3>
                        <div className="space-y-3 text-gray-600">
                            <div className="flex items-start gap-3">
                                <span className="text-blue-500 mt-1">1.</span>
                                <div>
                                    <strong>No Permission Required:</strong> Works automatically using IP geolocation
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-blue-500 mt-1">2.</span>
                                <div>
                                    <strong>IP Analysis:</strong> Analyzes visitor&apos;s IP address to determine location
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-blue-500 mt-1">3.</span>
                                <div>
                                    <strong>Rich Data:</strong> Provides country, city, region, currencies, languages, and device info
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-blue-500 mt-1">4.</span>
                                <div>
                                    <strong>High Accuracy:</strong> Uses comprehensive IP database for reliable location detection
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <span className="text-yellow-600 text-xl">💡</span>
                                <div className="text-yellow-800">
                                    <strong>Note:</strong> VisitorAPI requires a project ID and authorized domain setup.
                                    Visit <a href="https://visitorapi.com" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">VisitorAPI.com</a> to create a free account.
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <span className="text-green-600 text-xl">✅</span>
                                <div className="text-green-800">
                                    <strong>Benefits:</strong> No user permission required, works on all devices,
                                    provides additional visitor insights, more reliable than browser-based detection.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 