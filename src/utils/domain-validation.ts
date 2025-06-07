/**
 * Domain Validation Utility for Sanity Integration
 * Validates domains against admin-configured whitelist/blacklist in Sanity
 */
import { getDomainAccessConfig, type DomainAccessConfig } from '@/sanity/lib/data/domainAccess';

export interface DomainValidationResult {
  allowed: boolean;
  reason: string;
}

/**
 * Normalize domain for comparison
 */
function normalizeDomain(domain: string): string {
  try {
    // Handle domains with protocols and paths
    if (domain.includes('://')) {
      domain = new URL(domain).hostname;
    }
  } catch (e) {
    // Ignore invalid URLs, proceed with original string
  }
  return domain.toLowerCase().replace(/^www\./, '');
}

/**
 * Check if domain matches against a list (with subdomain support)
 */
function domainMatches(testDomain: string, targetDomain: string): boolean {
  const normalizedTest = normalizeDomain(testDomain);
  const normalizedTarget = normalizeDomain(targetDomain);
  
  return normalizedTest === normalizedTarget || 
         normalizedTest.endsWith(`.${normalizedTarget}`);
}

/**
 * Main domain validation function using Sanity database
 */
export async function validateDomainAccess(domain?: string): Promise<DomainValidationResult> {
  try {
    const targetDomain = domain || (typeof window !== 'undefined' ? window.location.hostname : '');
    
    if (!targetDomain) {
      // MARKETING: Allow by default even if no domain detected
      return { allowed: true, reason: 'No domain provided - allowing by default for marketing' };
    }

    const config = await getDomainAccessConfig();
    
    // MARKETING: If no config or disabled, allow everything
    if (!config || config.mode === 'disabled') {
      return { allowed: true, reason: 'Domain validation disabled - allowing for marketing' };
    }

    const normalizedDomain = normalizeDomain(targetDomain);

    // Always allow localhost for development
    if (config.allowedTesting && (normalizedDomain === 'localhost' || normalizedDomain === '127.0.0.1')) {
      return { allowed: true, reason: 'Development domain allowed' };
    }

    if (config.mode === 'whitelist') {
      const isWhitelisted = config.whitelist.some(whitelistedDomain => 
        domainMatches(targetDomain, whitelistedDomain)
      );
      return {
        allowed: isWhitelisted,
        reason: isWhitelisted ? 'Domain whitelisted' : 'Domain not in whitelist'
      };
    }

    if (config.mode === 'blacklist') {
      const isBlacklisted = config.blacklist.some(blacklistedDomain => 
        domainMatches(targetDomain, blacklistedDomain)
      );
      if (isBlacklisted) {
        return { allowed: false, reason: 'Domain is in blacklist' };
      }
      return { allowed: true, reason: 'Domain not in blacklist - allowed for marketing' };
    }

    // MARKETING: Default to allow
    return { allowed: true, reason: 'Default allow for marketing purposes' };

  } catch (error) {
    console.error('[Domain Validation] Error:', error);
    // MARKETING: On any error, allow by default
    return { allowed: true, reason: 'Validation error - allowing by default for marketing' };
  }
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

/**
 * Extract domain from request headers for server-side validation
 */
function getOriginDomain(request: Request, requestBody?: any): string | null {
  if (requestBody?.isWidget && requestBody?.parentOrigin) {
    try {
      return new URL(requestBody.parentOrigin).hostname;
    } catch {
      // Fallback for when parentOrigin is just a hostname
      return requestBody.parentOrigin;
    }
  }

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).hostname;
    } catch {
      return origin;
    }
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).hostname;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Server-side domain validation for API routes
 */
export async function validateDomainAccessServer(request: Request, requestBody?: any): Promise<{ allowed: boolean; domain: string | null; reason?: string }> {
  try {
    const domain = getOriginDomain(request, requestBody);
    const result = await validateDomainAccess(domain || undefined);

    return {
      allowed: result.allowed,
      domain,
      reason: result.reason
    };
  } catch (error) {
    console.error('Error in server domain validation:', error);
    return {
      allowed: true,
      domain: getOriginDomain(request, requestBody),
      reason: 'Domain validation error (allowed by default)'
    };
  }
} 