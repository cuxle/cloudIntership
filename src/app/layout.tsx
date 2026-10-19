import type { Metadata } from "next";
import { IBM_Plex_Mono, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { ProgressProvider } from "@/lib/progress";
import "./globals.css";

const sans = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-app-sans",
  display: "swap",
  preload: false,
});

const serif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-app-serif",
  display: "swap",
  preload: false,
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-app-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "模课 · 大模型应用开发",
    template: "%s",
  },
  description: "八节互动课：调用大模型、约束输出、做检索，以及让模型使用工具。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-CN"
      className={`${sans.variable} ${serif.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ProgressProvider>
          <SiteHeader />
          {children}
        </ProgressProvider>
      </body>
    </html>
  );
}
