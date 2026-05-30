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
  title: "AI Agro Academy | AI operating system for learning",
  description:
    "An AI operating system for learning — изкуствен интелект, лаборатории и експертно съдържание за модерно земеделие.",
  openGraph: {
    title: "AI Agro Academy · AI operating system for learning",
    description:
      "An AI operating system for learning — платформа за умно обучение в агрономията.",
    locale: "bg_BG",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
  );
}
