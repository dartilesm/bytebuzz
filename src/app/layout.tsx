import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ClientProviders } from "@/app/client-providers";
import { ThemeProvider } from "next-themes";
import "@/app/globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ByteBuzz",
  description:
    "ByteBuzz is a social platform for developers and tech enthusiasts to share code snippets, tech news, and programming memes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh`}
        suppressHydrationWarning
      >
        <Suspense>
          <ClerkProvider>
            <NuqsAdapter>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <ClientProviders>{children}</ClientProviders>
              </ThemeProvider>
            </NuqsAdapter>
          </ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}
