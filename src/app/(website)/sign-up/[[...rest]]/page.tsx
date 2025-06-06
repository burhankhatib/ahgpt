'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser, SignUp } from '@clerk/nextjs';
import { useEffect, Suspense } from 'react';

function SignUpContent() {
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

    return <SignUp />;
}

export default function SignUpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignUpContent />
        </Suspense>
    );
} 