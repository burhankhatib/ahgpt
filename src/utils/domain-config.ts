/**
 * Domain Configuration Utility
 * Handles proper domain resolution and prevents subdomain issues
 */

export interface DomainConfig {
  main: string;
  api: string;
  clerk: string;
  widget: string;
}

// Get the current environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Default domain configuration
const DEFAULT_DOMAIN = 'alhayatgpt.com';
const DEFAULT_SUBDOMAIN = 'www';

/**
 * Get the proper domain configuration based on environment
 */
export function getDomainConfig(): DomainConfig {
  // In development, use localhost
  if (isDevelopment) {
    const port = process.env.PORT || '3000';
    return {
      main: `http://localhost:${port}`,
      api: `http://localhost:${port}`,
      clerk: `http://localhost:${port}`,
      widget: `http://localhost:${port}`,
    };
  }

  // In production, use the main domain for everything
  const mainDomain = process.env.NEXT_PUBLIC_DOMAIN || `${DEFAULT_SUBDOMAIN}.${DEFAULT_DOMAIN}`;
  const protocol = 'https://';
  
  return {
    main: `${protocol}${mainDomain}`,
    api: `${protocol}${mainDomain}`,
    clerk: `${protocol}${mainDomain}`,
    widget: `${protocol}${mainDomain}`,
  };
}

/**
 * Get the API endpoint URL
 */
export function getApiEndpoint(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use current origin
    return window.location.origin;
  }
  
  // Server-side: use configured domain
  return getDomainConfig().api;
}

/**
 * Get the Clerk configuration with proper domain
 */
export function getClerkConfig() {
  const config = getDomainConfig();
  
  return {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    domain: config.clerk.replace('https://', '').replace('http://', ''),
    signInUrl: `${config.main}/sign-in`,
    signUpUrl: `${config.main}/sign-up`,
    afterSignInUrl: `${config.main}/chat`,
    afterSignUpUrl: `${config.main}/chat`,
  };
}

/**
 * Validate and normalize URL to prevent subdomain issues
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Allow Clerk's required subdomains to work normally
    const clerkSubdomains = [
      'clerk.alhayatgpt.com',           // Frontend API
      'accounts.alhayatgpt.com',       // Account portal
      'clkmail.alhayatgpt.com',        // Email
      'clk._domainkey.alhayatgpt.com', // Domain key 1
      'clk2._domainkey.alhayatgpt.com' // Domain key 2
    ];
    
    // If this is a required Clerk subdomain, leave it alone
    if (clerkSubdomains.includes(urlObj.hostname)) {
      return urlObj.toString();
    }
    
    // Only redirect unknown/problematic subdomains to main domain
    if (urlObj.hostname.endsWith('.alhayatgpt.com') && 
        urlObj.hostname !== 'www.alhayatgpt.com' &&
        urlObj.hostname !== 'alhayatgpt.com') {
      urlObj.hostname = 'www.alhayatgpt.com';
    }
    
    return urlObj.toString();
  } catch (error) {
    console.error('Error normalizing URL:', error);
    return url;
  }
}

/**
 * Check if current domain is valid
 */
export function isValidDomain(): boolean {
  if (typeof window === 'undefined') return true; // Server-side is always valid
  
  const hostname = window.location.hostname;
  
  // Allow localhost in development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return true;
  }
  
  // Allow Clerk's required subdomains
  const clerkSubdomains = [
    'clerk.alhayatgpt.com',           // Frontend API
    'accounts.alhayatgpt.com',       // Account portal
    'clkmail.alhayatgpt.com',        // Email
    'clk._domainkey.alhayatgpt.com', // Domain key 1
    'clk2._domainkey.alhayatgpt.com' // Domain key 2
  ];
  
  if (clerkSubdomains.includes(hostname)) {
    return true;
  }
  
  // Allow main domains
  if (hostname === 'www.alhayatgpt.com' || hostname === 'alhayatgpt.com') {
    return true;
  }
  
  // Any other subdomain is problematic
  if (hostname.endsWith('.alhayatgpt.com')) {
    return false;
  }
  
  return true;
}

/**
 * Redirect to proper domain if necessary
 */
export function redirectToProperDomain(): void {
  if (typeof window === 'undefined') return;
  
  if (!isValidDomain()) {
    const properUrl = normalizeUrl(window.location.href);
    window.location.replace(properUrl);
  }
} 