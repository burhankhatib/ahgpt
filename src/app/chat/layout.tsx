import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ChatProvider } from "@/contexts/ChatContext";
import { SanityLive } from "@/sanity/lib/live";
import ClientLayout from "@/components/ClientLayout";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <ChatProvider>
        <ClientLayout>
          {children}
        </ClientLayout>
        <SanityLive />
      </ChatProvider>
    </ClerkProvider>
  )
}
