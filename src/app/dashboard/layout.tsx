import type { Metadata } from "next";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SanityLive } from "@/sanity/lib/live";
import { Cairo } from 'next/font/google';
import { getClerkConfig } from "@/utils/domain-config";

const cairo = Cairo({
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: "Al Hayat GPT",
  description: "The first and most advanced Christian AI chatbot in the world!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkConfig = getClerkConfig();

  return (
    <ClerkProvider
      publishableKey={clerkConfig.publishableKey}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#3b82f6',
        },
      }}
      signInUrl={clerkConfig.signInUrl}
      signUpUrl={clerkConfig.signUpUrl}
      afterSignInUrl={clerkConfig.afterSignInUrl}
      afterSignUpUrl={clerkConfig.afterSignUpUrl}
    >
      <LanguageProvider>
        <div className={cairo.className}>
          {children}
        </div>
        <SanityLive />
      </LanguageProvider>
    </ClerkProvider>
  );
}
