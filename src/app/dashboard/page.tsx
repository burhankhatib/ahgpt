'use client';

import AllChats from '@/components/AllChats';
import { ChatProvider } from '@/contexts/ChatContext';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && (!user || (user.emailAddresses[0]?.emailAddress !== 'burhank@gmail.com' && user.emailAddresses[0]?.emailAddress !== 'abuali7777@gmail.com'))) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user || (user.emailAddresses[0]?.emailAddress !== 'burhank@gmail.com' && user.emailAddresses[0]?.emailAddress !== 'abuali7777@gmail.com')) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <ChatProvider>
        <AllChats />
      </ChatProvider>
    </div>
  );
}
