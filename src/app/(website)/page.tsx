'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to chat page
    router.push('/chat');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-white text-2xl font-bold">AI</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-3">
          AHGPT
        </h1>
        <p className="text-gray-600">
          Redirecting to chat...
        </p>
      </div>
    </div>
  );
}
