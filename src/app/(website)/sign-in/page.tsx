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
    const widget_auth = searchParams.get('widget');
    const return_to = searchParams.get('return_to');

    useEffect(() => {
        if (isSignedIn && user) {
            if (widget_auth === 'true') {
                // Widget popup authentication flow
                try {
                    // Generate a token for the widget
                    fetch('/api/auth/issue-token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId: user.id,
                            isWidget: true
                        })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.token) {
                                // Send success message to parent window
                                if (window.opener && !window.opener.closed) {
                                    window.opener.postMessage({
                                        type: 'AUTH_SUCCESS',
                                        token: data.token,
                                        user: {
                                            id: user.id,
                                            firstName: user.firstName,
                                            lastName: user.lastName,
                                            email: user.emailAddresses?.[0]?.emailAddress
                                        }
                                    }, '*');
                                    window.close();
                                } else {
                                    // Fallback: redirect with token
                                    const returnUrl = return_to || window.location.origin;
                                    window.location.href = `${returnUrl}?token=${data.token}`;
                                }
                            }
                        })
                        .catch(error => {
                            console.error('Token generation error:', error);
                            if (window.opener && !window.opener.closed) {
                                window.opener.postMessage({
                                    type: 'AUTH_ERROR',
                                    error: 'Failed to generate authentication token'
                                }, '*');
                                window.close();
                            }
                        });
                } catch (error) {
                    console.error('Widget auth error:', error);
                    if (window.opener && !window.opener.closed) {
                        window.opener.postMessage({
                            type: 'AUTH_ERROR',
                            error: 'Authentication failed'
                        }, '*');
                        window.close();
                    }
                }
            } else if (redirect_url) {
                // Regular redirect flow
                window.location.href = `/api/auth/issue-token?redirect_url=${encodeURIComponent(redirect_url)}`;
            }
        }
    }, [isSignedIn, user, redirect_url, widget_auth, return_to]);

    // Special styling for widget popup
    if (widget_auth === 'true') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Sign in to Al Hayat GPT
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Continue your conversation with saved chat history
                        </p>
                    </div>
                    <SignIn
                        appearance={{
                            elements: {
                                rootBox: "mx-auto",
                                card: "shadow-lg"
                            }
                        }}
                    />
                </div>
            </div>
        );
    }

    return <SignIn />;
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignInContent />
        </Suspense>
    );
} 