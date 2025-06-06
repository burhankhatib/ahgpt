'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, SignIn, useUser } from '@clerk/nextjs';
import { useEffect, Suspense } from 'react';

function SignInContent() {
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect_url = searchParams.get('redirect_url');

    useEffect(() => {
        if (isSignedIn && user) {
            if (redirect_url) {
                // Regular redirect flow only - popup authentication removed
                window.location.href = `/api/auth/issue-token?redirect_url=${encodeURIComponent(redirect_url)}`;
            }
        }
    }, [isSignedIn, user, redirect_url]);

    return <SignIn />;
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignInContent />
        </Suspense>
    );
} 