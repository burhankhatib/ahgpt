"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import AdminMenu from '@/components/AdminMenu';

export default function DomainsAdminPage() {
    const [config, setConfig] = useState({
        mode: 'blacklist' as 'whitelist' | 'blacklist' | 'disabled',
        whitelist: ['alhayatgpt.com', 'www.alhayatgpt.com', 'localhost', '127.0.0.1'],
        blacklist: ['example-blocked-site.com', 'spam-website.net', 'unauthorized-domain.org'],
        allowedTesting: true,
    });

    const [newDomain, setNewDomain] = useState('');
    const [testDomain, setTestDomain] = useState('');
    const [testResult, setTestResult] = useState<{ allowed: boolean; reason?: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');



    // Load configuration on component mount
    useEffect(() => {
        loadConfiguration();
    }, []);

    const loadConfiguration = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/domains');
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setConfig(result.data);
                } else {
                    console.error('Failed to load configuration:', result.error);
                }
            } else {
                console.error('Failed to load configuration');
            }
        } catch (error) {
            console.error('Error loading configuration:', error);
        } finally {
            setLoading(false);
        }
    };

    // Real domain testing using the same logic as the server
    const testDomainAccess = () => {
        if (!testDomain.trim()) {
            setTestResult({ allowed: false, reason: 'Please enter a domain to test' });
            return;
        }

        const normalizedDomain = testDomain.toLowerCase().replace(/^www\./, '');

        if (config.mode === 'disabled') {
            setTestResult({ allowed: true, reason: 'Domain validation is disabled' });
            return;
        }

        if (config.allowedTesting && (normalizedDomain === 'localhost' || normalizedDomain === '127.0.0.1')) {
            setTestResult({ allowed: true, reason: 'Testing/development domain allowed' });
            return;
        }

        if (config.mode === 'whitelist') {
            const isWhitelisted = config.whitelist.some(domain => {
                const normalizedAllowed = domain.toLowerCase().replace(/^www\./, '');
                return normalizedDomain === normalizedAllowed || normalizedDomain.endsWith(`.${normalizedAllowed}`);
            });
            setTestResult({
                allowed: isWhitelisted,
                reason: isWhitelisted ? 'Domain is whitelisted' : 'Domain not in whitelist'
            });
        } else if (config.mode === 'blacklist') {
            const isBlacklisted = config.blacklist.some(domain => {
                const normalizedBlocked = domain.toLowerCase().replace(/^www\./, '');
                return normalizedDomain === normalizedBlocked || normalizedDomain.endsWith(`.${normalizedBlocked}`);
            });
            setTestResult({
                allowed: !isBlacklisted,
                reason: isBlacklisted ? 'Domain is blacklisted' : 'Domain allowed (not blacklisted)'
            });
        }
    };

    const addDomain = async (listType: 'whitelist' | 'blacklist') => {
        if (!newDomain.trim()) return;

        // Clean the domain input - remove protocol, www, and paths
        let cleanDomain = newDomain.toLowerCase().trim();

        // Remove protocol (http://, https://)
        cleanDomain = cleanDomain.replace(/^https?:\/\//, '');

        // Remove www. prefix
        cleanDomain = cleanDomain.replace(/^www\./, '');

        // Remove any path, query parameters, or fragments
        cleanDomain = cleanDomain.split('/')[0].split('?')[0].split('#')[0];

        // Validate it's a proper domain
        if (!cleanDomain || cleanDomain.includes(' ') || !cleanDomain.includes('.')) {
            alert('Please enter a valid domain name (e.g., example.com)');
            return;
        }

        const domain = cleanDomain;

        try {
            const response = await fetch('/api/admin/domains', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, listType }),
            });

            if (response.ok) {
                const data = await response.json();
                setConfig(data.config);
                setNewDomain('');
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            } else {
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        } catch (error) {
            console.error('Error adding domain:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    const removeDomain = async (listType: 'whitelist' | 'blacklist', domain: string) => {
        try {
            const response = await fetch(`/api/admin/domains?domain=${encodeURIComponent(domain)}&listType=${listType}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                const data = await response.json();
                setConfig(data.config);
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            } else {
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        } catch (error) {
            console.error('Error removing domain:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    const saveConfiguration = async () => {
        setSaveStatus('saving');

        try {
            const response = await fetch('/api/admin/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            if (response.ok) {
                const data = await response.json();
                setConfig(data.config);
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        } catch (error) {
            console.error('Error saving configuration:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };


    const { user, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && (!user || (user.emailAddresses[0]?.emailAddress !== 'burhank@gmail.com' && user.emailAddresses[0]?.emailAddress !== 'abuali7777@gmail.com'))) {
            router.push('/');
        }
    }, [isLoaded, user, router]);

    if (!isLoaded || !user || (user.emailAddresses[0]?.emailAddress !== 'burhank@gmail.com' && user.emailAddresses[0]?.emailAddress !== 'abuali7777@gmail.com')) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-left" dir="ltr">
            <AdminMenu />

            <div className="max-w-4xl mx-auto mt-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">SDK Domain Management</h1>
                    <p className="text-gray-600">Control which domains can access your AHGPT SDK</p>
                    {loading && (
                        <div className="mt-4 text-blue-600 text-sm">
                            Loading configuration...
                        </div>
                    )}
                </div>

                <div className="grid gap-8">
                    {/* Configuration Mode */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Control Mode</h2>
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="mode"
                                        value="disabled"
                                        checked={config.mode === 'disabled'}
                                        onChange={(e) => setConfig(prev => ({ ...prev, mode: e.target.value as any }))}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Disabled (Allow All)</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="mode"
                                        value="whitelist"
                                        checked={config.mode === 'whitelist'}
                                        onChange={(e) => setConfig(prev => ({ ...prev, mode: e.target.value as any }))}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Whitelist (Only Allow Listed)</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="mode"
                                        value="blacklist"
                                        checked={config.mode === 'blacklist'}
                                        onChange={(e) => setConfig(prev => ({ ...prev, mode: e.target.value as any }))}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Blacklist (Block Listed Only)</span>
                                </label>
                            </div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={config.allowedTesting}
                                    onChange={(e) => setConfig(prev => ({ ...prev, allowedTesting: e.target.checked }))}
                                    className="mr-2"
                                />
                                <span className="text-sm">Allow testing domains (localhost, 127.0.0.1)</span>
                            </label>
                        </div>
                    </Card>

                    {/* Domain Testing */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Domain Access</h2>
                        <div className="flex gap-4 mb-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Enter domain to test (e.g., example.com)"
                                    value={testDomain}
                                    onChange={(e) => setTestDomain(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && testDomainAccess()}
                                />
                            </div>
                            <Button onClick={testDomainAccess}>Test Access</Button>
                        </div>
                        {testResult && (
                            <div className={`p-3 rounded-lg ${testResult.allowed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                <div className={`flex items-center ${testResult.allowed ? 'text-green-800' : 'text-red-800'}`}>
                                    {testResult.allowed ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                                    <span className="font-medium">
                                        {testResult.allowed ? 'Access Allowed' : 'Access Denied'}
                                    </span>
                                </div>
                                {testResult.reason && (
                                    <p className={`text-sm mt-1 ${testResult.allowed ? 'text-green-600' : 'text-red-600'}`}>
                                        {testResult.reason}
                                    </p>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* Whitelist Management */}
                    {(config.mode === 'whitelist' || config.mode === 'blacklist') && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Whitelist ({config.whitelist.length} domains)
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add domain (e.g., example.com or https://example.com/page)"
                                            value={newDomain}
                                            onChange={(e) => setNewDomain(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addDomain('whitelist')}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            URLs will be automatically cleaned to domain only
                                        </p>
                                        <Button onClick={() => addDomain('whitelist')} size="sm">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {config.whitelist.map((domain, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                                                <span className="text-sm text-green-800">{domain}</span>
                                                <Button
                                                    onClick={() => removeDomain('whitelist', domain)}
                                                    size="sm"
                                                    variant="destructive"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Blacklist ({config.blacklist.length} domains)
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add domain (e.g., example.com or https://example.com/page)"
                                            value={newDomain}
                                            onChange={(e) => setNewDomain(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addDomain('blacklist')}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            URLs will be automatically cleaned to domain only
                                        </p>
                                        <Button onClick={() => addDomain('blacklist')} size="sm">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {config.blacklist.map((domain, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                                                <span className="text-sm text-red-800">{domain}</span>
                                                <Button
                                                    onClick={() => removeDomain('blacklist', domain)}
                                                    size="sm"
                                                    variant="destructive"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Save Configuration */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Current Configuration</h3>
                                <p className="text-sm text-gray-600">
                                    Mode: <span className="font-medium">{config.mode}</span> |
                                    Testing: <span className="font-medium">{config.allowedTesting ? 'Enabled' : 'Disabled'}</span>
                                </p>
                            </div>
                            <Button
                                onClick={saveConfiguration}
                                disabled={saveStatus === 'saving'}
                                className={`${saveStatus === 'saved'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : saveStatus === 'error'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {saveStatus === 'saving' && 'Saving...'}
                                {saveStatus === 'saved' && '✓ Saved!'}
                                {saveStatus === 'error' && '✗ Error'}
                                {saveStatus === 'idle' && 'Save Configuration'}
                            </Button>
                        </div>
                    </Card>

                    {/* Instructions */}
                    <Card className="p-6 bg-blue-50">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">Implementation Instructions</h3>
                        <div className="text-sm text-blue-800 space-y-2">
                            <p><strong>✅ Real-time Domain Management:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Changes are saved automatically to the server</li>
                                <li>Configuration takes effect immediately</li>
                                <li>No need to restart the application</li>
                                <li>Changes persist across server restarts</li>
                            </ul>
                            <p className="mt-3"><strong>🧪 Test blocking:</strong> Add a domain like &quot;test-blocked.com&quot; to blacklist and test it above.</p>
                            <p className="mt-2"><strong>📁 Config file:</strong> Settings are stored in <code>data/domain-config.json</code></p>
                        </div>
                    </Card>
                </div>
            </div>
        </div >
    );
} 