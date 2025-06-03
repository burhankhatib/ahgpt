import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://www.alhayatgpt.com',
  },
  
  // Enable better error handling
  poweredByHeader: false,
  
  // Fix domain and redirect issues
  async redirects() {
    return [
      // Only redirect unknown subdomains, not Clerk's required ones
      {
        source: '/:path*',
        destination: 'https://www.alhayatgpt.com/:path*',
        permanent: false,
        has: [
          {
            type: 'host',
            value: '(?!clerk|accounts|clkmail|clk\\.|clk2\\.|www\\.|^alhayatgpt\\.com$).*\\.alhayatgpt\\.com',
          },
        ],
      },
    ];
  },
  
  async headers() {
    return [
      // Allow widget iframe embedding from any origin
      {
        source: '/widget/:path*',
        headers: [
          // Remove X-Frame-Options for widget routes to allow embedding
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;",
          },
        ],
      },
      // Restrict other routes to same origin
      {
        source: '/((?!widget).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
