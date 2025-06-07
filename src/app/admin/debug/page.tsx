'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { detectLanguage } from '@/utils/languageDetection';

interface LocationData {
    country: string;
    countryCode: string;
    city?: string;
    region?: string;
    confidence?: 'high' | 'medium' | 'low';
    detectionMethod?: string;
    detectedAt?: string;
}

export default function DebugPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [locationData, setLocationData] = useState<LocationData | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [testText, setTestText] = useState('Hello, how are you today?');
    const [detectedLanguage, setDetectedLanguage] = useState<string>('');
    const [allStoredLocations, setAllStoredLocations] = useState<Record<string, any>>({});

    useEffect(() => {
        if (isLoaded && (!user || (user.emailAddresses[0]?.emailAddress !== 'burhank@gmail.com' && user.emailAddresses[0]?.emailAddress !== 'abuali7777@gmail.com'))) {
            router.push('/');
        }
    }, [isLoaded, user, router]);

    useEffect(() => {
        // Load all stored location data
        if (typeof window !== 'undefined') {
            const stored: Record<string, any> = {};
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('userLocation_')) {
                    try {
                        stored[key] = JSON.parse(localStorage.getItem(key) || '{}');
                    } catch (error) {
                        console.error('Error parsing stored location:', error);
                    }
                }
            });
            setAllStoredLocations(stored);
        }
    }, []);

    const detectCurrentLocation = async () => {
        setIsDetecting(true);
        try {
            console.log('🌍 [Debug] Starting browser location detection...');

            const { detectUserLocation } = await import('@/utils/browserLocationDetection');
            const result = await detectUserLocation();

            console.log('🌍 [Debug] Browser location result:', result);

            if (result) {
                setLocationData({
                    ...result,
                    countryCode: result.countryCode || 'UN' // Ensure countryCode is never undefined
                });

                // Store the result
                const userKey = user?.id || 'debug_user';
                const locationToStore = {
                    ...result,
                    detectedAt: new Date().toISOString(),
                    userKey: userKey,
                    source: 'debug'
                };

                console.log('💾 [Debug] Storing location data:', locationToStore);
                localStorage.setItem(`userLocation_${userKey}`, JSON.stringify(locationToStore));

                // Refresh stored locations
                const stored: Record<string, any> = {};
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('userLocation_')) {
                        try {
                            stored[key] = JSON.parse(localStorage.getItem(key) || '{}');
                        } catch (error) {
                            console.error('Error parsing stored location:', error);
                        }
                    }
                });
                setAllStoredLocations(stored);
            } else {
                console.error('❌ [Debug] Browser location detection returned null');
                setLocationData({ country: 'Detection Failed', countryCode: '', detectionMethod: 'failed' });
            }
        } catch (error) {
            console.error('❌ [Debug] Location detection error:', error);
            setLocationData({ country: 'Error', countryCode: '', detectionMethod: 'error' });
        } finally {
            setIsDetecting(false);
        }
    };

    const testLanguageDetection = () => {
        if (testText.trim()) {
            const detected = detectLanguage(testText);
            setDetectedLanguage(detected);
        }
    };

    const clearAllLocationData = () => {
        if (typeof window !== 'undefined') {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('userLocation_')) {
                    localStorage.removeItem(key);
                }
            });
            setAllStoredLocations({});
            setLocationData(null);
        }
    };

    if (!isLoaded || !user || (user.emailAddresses[0]?.emailAddress !== 'burhank@gmail.com' && user.emailAddresses[0]?.emailAddress !== 'abuali7777@gmail.com')) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug: Location & Language Detection</h1>

                {/* Location Detection Test */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">🌍 Location Detection Test</h2>

                    <button
                        onClick={detectCurrentLocation}
                        disabled={isDetecting}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
                    >
                        {isDetecting ? 'Detecting...' : 'Detect Current Location'}
                    </button>

                    {locationData && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h3 className="font-medium text-gray-900 mb-2">Current Detection Result:</h3>
                            <div className="space-y-1 text-sm">
                                <p><strong>Country:</strong> {locationData.country}</p>
                                <p><strong>Country Code:</strong> {locationData.countryCode}</p>
                                <p><strong>City:</strong> {locationData.city || 'N/A'}</p>
                                <p><strong>Region:</strong> {locationData.region || 'N/A'}</p>
                                <p><strong>Method:</strong> {locationData.detectionMethod || 'N/A'}</p>
                                <p><strong>Confidence:</strong> {locationData.confidence || 'N/A'}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Language Detection Test */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">🗣️ Language Detection Test (Franc)</h2>

                    <textarea
                        value={testText}
                        onChange={(e) => setTestText(e.target.value)}
                        placeholder="Enter text to detect language..."
                        className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                        rows={3}
                    />

                    <button
                        onClick={testLanguageDetection}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mb-4"
                    >
                        Detect Language
                    </button>

                    {detectedLanguage && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-2">Language Detection Result:</h3>
                            <p className="text-sm"><strong>Detected Language:</strong> {detectedLanguage}</p>
                        </div>
                    )}

                    <div className="mt-4 space-y-2">
                        <h3 className="font-medium text-gray-900">Test Examples:</h3>
                        <div className="space-y-1 text-sm">
                            <button
                                onClick={() => setTestText('مرحبا، كيف حالك اليوم؟ أتمنى أن تكون بخير.')}
                                className="block text-blue-600 hover:underline"
                            >
                                Arabic: مرحبا، كيف حالك اليوم؟
                            </button>
                            <button
                                onClick={() => setTestText('آپ کیسے ہیں؟ میں آپ سے ملکر خوش ہوں۔ یہ اردو میں لکھا گیا ہے۔')}
                                className="block text-blue-600 hover:underline"
                            >
                                Urdu: آپ کیسے ہیں؟ میں آپ سے ملکر خوش ہوں۔
                            </button>
                            <button
                                onClick={() => setTestText('שלום, איך אתה היום? אני מקווה שאתה בסדר.')}
                                className="block text-blue-600 hover:underline"
                            >
                                Hebrew: שלום, איך אתה היום?
                            </button>
                            <button
                                onClick={() => setTestText('سلام، امروز حال شما چطور است؟ امیدوارم خوب باشید.')}
                                className="block text-blue-600 hover:underline"
                            >
                                Persian: سلام، امروز حال شما چطور است؟
                            </button>
                            <button
                                onClick={() => setTestText('Hola, ¿cómo estás hoy? Espero que estés bien.')}
                                className="block text-blue-600 hover:underline"
                            >
                                Spanish: Hola, ¿cómo estás hoy?
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stored Location Data */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">💾 Stored Location Data</h2>
                        <button
                            onClick={clearAllLocationData}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                        >
                            Clear All
                        </button>
                    </div>

                    {Object.keys(allStoredLocations).length === 0 ? (
                        <p className="text-gray-500">No stored location data found.</p>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(allStoredLocations).map(([key, data]) => (
                                <div key={key} className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-2">{key}</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p><strong>Country:</strong> {data.country || 'N/A'}</p>
                                            <p><strong>City:</strong> {data.city || 'N/A'}</p>
                                            <p><strong>Method:</strong> {data.detectionMethod || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p><strong>Detected At:</strong> {data.detectedAt ? new Date(data.detectedAt).toLocaleString() : 'N/A'}</p>
                                            <p><strong>Source:</strong> {data.source || 'N/A'}</p>
                                            <p><strong>User Key:</strong> {data.userKey || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 rounded-lg p-6 mt-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-2">📋 Testing Instructions</h2>
                    <div className="text-blue-800 text-sm space-y-2">
                        <p><strong>1. Location Detection:</strong> Click &quot;Detect Current Location&quot; to test browser geolocation + IP fallback</p>
                        <p><strong>2. Language Detection:</strong> Enter text in different languages to test Franc library</p>
                        <p><strong>3. Check Dashboard:</strong> Visit the dashboard to see if the location data appears in &quot;Top Countries&quot;</p>
                        <p><strong>4. Test Widget:</strong> Try creating chats via widget to see if guest location data is collected</p>
                        <p><strong>5. Clear Data:</strong> Use &quot;Clear All&quot; to reset and test fresh detection</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 