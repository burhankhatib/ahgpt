import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/studio(.*)',  // Sanity Studio
  '/admin(.*)',   // Admin routes
  '/instructions(.*)',   // Admin routes
  '/admin/dashboard(.*)',   // Admin routes
  '/admin/domains(.*)',   // Admin routes
]);

// Define public routes that should always be accessible
const isPublicRoute = createRouteMatcher([
  '/',
  '/chat(.*)',
  '/widget(.*)',
  '/api(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const { nextUrl } = request;
  
  // Allow Clerk's required subdomains to work normally
  const clerkSubdomains = [
    'clerk.alhayatgpt.com',           // Frontend API
    'accounts.alhayatgpt.com',       // Account portal
    'clkmail.alhayatgpt.com',        // Email
    'clk._domainkey.alhayatgpt.com', // Domain key 1
    'clk2._domainkey.alhayatgpt.com' // Domain key 2
  ];
  
  // If this is a required Clerk subdomain, let it work normally
  if (clerkSubdomains.includes(nextUrl.hostname)) {
    return NextResponse.next();
  }
  
  // Only redirect problematic/unknown subdomains to main domain
  if (nextUrl.hostname.endsWith('.alhayatgpt.com') && 
      nextUrl.hostname !== 'www.alhayatgpt.com' &&
      nextUrl.hostname !== 'alhayatgpt.com') {
    // This is an unknown subdomain, redirect to main domain
    const url = nextUrl.clone();
    url.hostname = 'www.alhayatgpt.com';
    return NextResponse.redirect(url);
  }
  
  // Protect studio routes
  if (isProtectedRoute(request)) {
    const authObject = await auth();
    if (!authObject.userId) {
      // Redirect to sign-in if not authenticated
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  // Allow all public routes
  return NextResponse.next();
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}