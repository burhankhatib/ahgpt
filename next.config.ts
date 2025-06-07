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
  
  // Add this section to modify the ESLint config
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  async headers() {
    return [
      {
        // Apply these headers to all routes in the app
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // This is a more modern header that replaces X-Frame-Options
          {
            key: 'Content-Security-Policy',
            // Default to deny framing, but allow specific widget routes below
            value: "frame-ancestors 'self'",
          },
        ],
      },
      {
        // Specifically allow the widget and any of its subpaths/query params to be framed
        source: '/widget/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *', // Allow any site to frame the widget
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM *', // Legacy browser support
          },
        ],
      },
      {
        // Allow all origins to access API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig;
