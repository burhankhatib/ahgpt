import type { Metadata } from "next";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SanityLive } from "@/sanity/lib/live";
import { Roboto } from 'next/font/google';
import { getClerkConfig } from "@/utils/domain-config";

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "You can whitelist domain names and export analytics data.",
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
        <div className={roboto.className}>
          {children}
        </div>
        <SanityLive />
      </LanguageProvider>
    </ClerkProvider>
  );
}
