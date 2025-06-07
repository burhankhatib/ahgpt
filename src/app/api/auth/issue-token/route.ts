import { getAuth } from '@clerk/nextjs/server';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { validateDomainAccessServer, createDomainBlockedResponse } from '@/utils/domain-validation';

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  const { searchParams } = new URL(req.url);
  const redirect_url = searchParams.get('redirect_url');
  if (!userId || !redirect_url) return NextResponse.json({ error: 'Missing user or redirect_url' }, { status: 400 });

  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  return NextResponse.redirect(`${redirect_url}?token=${token}`);
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const body = await req.json();
    const { userId: bodyUserId, isWidget, parentOrigin } = body;

    // Validate domain access for widget requests
    if (isWidget) {
      const domainValidation = await validateDomainAccessServer(req, { isWidget, parentOrigin });
      
      console.log('=== AUTH TOKEN DOMAIN VALIDATION ===');
      console.log('Domain detected:', domainValidation.domain);
      console.log('Validation result:', domainValidation.allowed);
      console.log('Reason:', domainValidation.reason);
      console.log('=== END AUTH DEBUG ===');
      
      if (!domainValidation.allowed) {
        console.log(`Auth token blocked for domain: ${domainValidation.domain}, reason: ${domainValidation.reason}`);
        return createDomainBlockedResponse(domainValidation.domain, domainValidation.reason);
      }
    }

    // For widget requests, use the userId from the request body if provided
    const targetUserId = isWidget && bodyUserId ? bodyUserId : userId;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    const token = jwt.sign(
      { 
        userId: targetUserId, 
        isWidget: !!isWidget 
      }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '1h' }
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
} 