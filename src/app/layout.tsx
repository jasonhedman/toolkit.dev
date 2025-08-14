import { Space_Grotesk } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "next-themes";

import { TRPCReactProvider } from "@/trpc/react";

import { Toaster } from "@/components/ui/sonner";

import { EnvProvider } from "@/contexts/env";

import { env } from "@/env";

import type { Metadata, Viewport } from "next";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Toolkit.dev",
  description: "The Playground for LLM Tool Developers",
  appleWebApp: {
    title: "Toolkit.dev",
    statusBarStyle: "black",
  },
  manifest: "/manifest.json",
  metadataBase: new URL(env.NEXTAUTH_URL || "http://localhost:3000"),
};

export const viewport: Viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <Analytics />
        <SpeedInsights />

        <TRPCReactProvider>
          <EnvProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </EnvProvider>
        </TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
