import type { Metadata } from "next";
import "../../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ForceEnglish } from "@/contexts/ForceEnglish";




export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ForceEnglish>
        {children}
      </ForceEnglish>
    </ClerkProvider>
  );
}
