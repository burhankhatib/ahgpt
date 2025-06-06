// Domain validation utility for SDK access control
import { getDomainAccessConfig, type DomainAccessConfig } from '@/sanity/lib/data/domainAccess';

export interface DomainValidationConfig {
    mode: 'whitelist' | 'blacklist' | 'disabled';
    whitelist: string[];
    blacklist: string[];
    allowedTesting?: boolean; // Allow localhost and development domains
}

// Default configuration - you can modify this as needed
const DEFAULT_CONFIG: DomainValidationConfig = {
    mode: 'blacklist', // Start with blacklist mode (block specific domains)
    whitelist: [
        'alhayatgpt.com',
        'www.alhayatgpt.com',
        'localhost',
        '127.0.0.1',
    ],
    blacklist: [
        'example-blocked-site.com',
        'spam-website.net',
        'unauthorized-domain.org',
    ],
    allowedTesting: true, // Allow development/testing domains
};

/**
 * Get the origin domain from a request
 * For widget requests, check the parentOrigin parameter first
 */
export function getOriginDomain(request: Request, requestBody?: any): string | null {
    // For widget requests, check parentOrigin from request body first
    if (requestBody?.isWidget && requestBody?.parentOrigin) {
        try {
            return new URL(requestBody.parentOrigin).hostname.toLowerCase();
        } catch {
            // If parentOrigin is invalid, continue to other methods
        }
    }

    // Check Origin header first (more reliable)
    const origin = request.headers.get('origin');
    if (origin) {
        try {
            return new URL(origin).hostname.toLowerCase();
        } catch {
            return null;
        }
    }

    // Fallback to Referer header
    const referer = request.headers.get('referer');
    if (referer) {
        try {
            return new URL(referer).hostname.toLowerCase();
        } catch {
            return null;
        }
    }

    return null;
}

/**
 * Check if a domain is allowed to use the SDK
 */
export function isDomainAllowed(domain: string | null, config: DomainValidationConfig = DEFAULT_CONFIG): boolean {
    // If domain validation is disabled, allow all
    if (config.mode === 'disabled') {
        return true;
    }

    // If no domain detected, block by default
    if (!domain) {
        return false;
    }

    // Normalize domain
    const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');

    // Check for development/testing domains
    if (config.allowedTesting) {
        const testingDomains = ['localhost', '127.0.0.1'];
        const isLocalDev = testingDomains.some(testDomain => normalizedDomain === testDomain);
        if (isLocalDev) {
            return true;
        }
    }

    // Whitelist mode: only allow explicitly listed domains
    if (config.mode === 'whitelist') {
        return config.whitelist.some(allowedDomain => {
            const normalizedAllowed = allowedDomain.toLowerCase().replace(/^www\./, '');
            return normalizedDomain === normalizedAllowed || normalizedDomain.endsWith(`.${normalizedAllowed}`);
        });
    }

    // Blacklist mode: block explicitly listed domains
    if (config.mode === 'blacklist') {
        const isBlocked = config.blacklist.some(blockedDomain => {
            const normalizedBlocked = blockedDomain.toLowerCase().replace(/^www\./, '');
            return normalizedDomain === normalizedBlocked || normalizedDomain.endsWith(`.${normalizedBlocked}`);
        });
        return !isBlocked;
    }

    return false;
}

/**
 * Get current domain validation configuration from Sanity
 */
export async function getDomainValidationConfig(): Promise<DomainValidationConfig> {
    try {
        // Load from Sanity
        console.log('Loading domain config from Sanity...');
        const savedConfig = await getDomainAccessConfig();
        console.log('Sanity config loaded:', savedConfig);
        
        if (savedConfig) {
            const config = {
                mode: savedConfig.mode,
                whitelist: savedConfig.whitelist,
                blacklist: savedConfig.blacklist,
                allowedTesting: savedConfig.allowedTesting,
            };
            console.log('Using Sanity config:', config);
            return config;
        }
    } catch (error) {
        console.error('Error loading domain config from Sanity:', error);
        console.log('Using default configuration');
    }

    // Fallback to default config
    console.log('Using default config:', DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
}

/**
 * Middleware function to validate domain access
 */
export async function validateDomainAccess(request: Request, requestBody?: any): Promise<{ allowed: boolean; domain: string | null; reason?: string }> {
    const config = await getDomainValidationConfig();
    const domain = getOriginDomain(request, requestBody);
    const allowed = isDomainAllowed(domain, config);

    // Debug logging
    console.log('=== DOMAIN VALIDATION CONFIG DEBUG ===');
    console.log('Config mode:', config.mode);
    console.log('Config whitelist:', config.whitelist);
    console.log('Config blacklist:', config.blacklist);
    console.log('Config allowedTesting:', config.allowedTesting);
    console.log('Detected domain:', domain);
    console.log('Domain allowed:', allowed);
    console.log('=== END CONFIG DEBUG ===');

    let reason: string | undefined;
    if (!allowed) {
        if (!domain) {
            reason = 'No origin domain detected';
        } else if (config.mode === 'whitelist') {
            reason = `Domain '${domain}' not in whitelist`;
        } else if (config.mode === 'blacklist') {
            reason = `Domain '${domain}' is blacklisted`;
        }
    }

    return { allowed, domain, reason };
}

/**
 * Create a standardized error response for blocked domains
 */
export function createDomainBlockedResponse(domain: string | null, reason?: string): Response {
    return new Response(
        JSON.stringify({
            error: 'Domain access denied',
            domain,
            reason,
            message: 'This domain is not authorized to use the AHGPT SDK. Please contact support if you believe this is an error.',
        }),
        {
            status: 403,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Allow CORS so the error message can be read
            },
        }
    );
} 