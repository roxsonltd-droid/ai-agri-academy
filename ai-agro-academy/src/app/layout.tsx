import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { AppProviders } from "@/app/providers";
import { AmbientBackground } from "@/components/ambient-background";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | AI Agro Academy",
    default: "AI Agro Academy | AI operating system for learning",
  },
  description:
    "Първата AI-движена платформа за агрономия в България. Интерактивни лаборатории, AI преподаватели и експертно съдържание за модерно земеделие.",
  keywords: ["агрономия", "земеделие", "AI обучение", "агро академия", "селско стопанство", "курсове", "AgriNexus"],
  authors: [{ name: "AgriNexus Team" }],
  creator: "AgriNexus",
  openGraph: {
    title: "AI Agro Academy · AI operating system for learning",
    description:
      "Първата AI-движена платформа за агрономия в България. Учи по-умно с изкуствен интелект.",
    url: "https://agro-academy-frontend-dzjv.onrender.com",
    siteName: "AI Agro Academy",
    locale: "bg_BG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agro Academy | Модерно Земеделие",
    description: "AI operating system for learning — платформа за умно обучение в агрономията.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="bg"
        className={`${inter.variable} h-full antialiased`}
      >
        <body className="cinematic-ui relative flex min-h-full flex-col bg-background font-sans text-foreground selection:bg-primary/25 selection:text-foreground">
          <AmbientBackground />
          <div className="relative z-10 flex min-h-full flex-1 flex-col">
            <AppProviders>
              <Navbar />
              <main className="flex-1 pt-[5.25rem] sm:pt-24">
                {children}
              </main>
            </AppProviders>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
