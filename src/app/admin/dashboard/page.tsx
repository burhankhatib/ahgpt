'use client';

import AdminMenu from '@/components/AdminMenu';
import AllChats from '@/components/AllChats';
import StatsDashboard from '@/components/StatsDashboard';
import { ChatProvider } from '@/contexts/ChatContext';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ViewMode = 'stats' | 'chats';
type Direction = 'ltr' | 'rtl';

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('stats');
  const [direction, setDirection] = useState<Direction>('ltr');

  useEffect(() => {
    if (isLoaded && (!user || (user.emailAddresses[0]?.emailAddress !== 'burhank@gmail.com' && user.emailAddresses[0]?.emailAddress !== 'abuali7777@gmail.com'))) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user || (user.emailAddresses[0]?.emailAddress !== 'burhank@gmail.com' && user.emailAddresses[0]?.emailAddress !== 'abuali7777@gmail.com')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-left" dir="ltr">
      <AdminMenu />
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
              <h1 className="text-xl font-semibold text-gray-900">Al Hayat GPT Dashboard</h1>
              <nav className={`flex ${direction === 'rtl' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                <button
                  onClick={() => setViewMode('stats')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'stats'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  📊 Analytics
                </button>
                <button
                  onClick={() => setViewMode('chats')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'chats'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  💬 All Chats
                </button>
              </nav>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Direction:</span>
              <button
                onClick={() => setDirection(direction === 'ltr' ? 'rtl' : 'ltr')}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${direction === 'rtl' ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${direction === 'rtl' ? 'translate-x-9' : 'translate-x-1'
                    }`}
                />
              </button>
              <div className="flex items-center gap-2 text-sm">
                <span className={`font-medium ${direction === 'ltr' ? 'text-blue-600' : 'text-gray-500'}`}>
                  🔤 LTR
                </span>
                <span className={`font-medium ${direction === 'rtl' ? 'text-blue-600' : 'text-gray-500'}`}>
                  🔄 RTL
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <ChatProvider>
        {viewMode === 'stats' ? <StatsDashboard /> : <AllChats />}
      </ChatProvider>
    </div>
  );
}
