import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientSessionProvider from "@/components/providers/SessionProvider";
import { auth } from "@/auth";
import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

import NextTopLoader from 'nextjs-toploader';

// Lazy load non-critical components for better performance
const CommandMenu = dynamic(() => import("@/components/layout/CommandMenu").then(mod => ({ default: mod.CommandMenu })));


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap', // Prevent font blocking
  preload: true,
});

export const metadata: Metadata = {
  title: {
    template: "%s | Rudratic HR",
    default: "Rudratic Technologies HR Management System"
  },
  description: "Enterprise-grade HR Platform by Rudratic Technologies",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({
  // Root Layout wrapping everything
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased h-full min-h-screen bg-white text-slate-900 font-sans`}
      >
          <NextTopLoader 
            color="#4f46e5"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #4f46e5,0 0 5px #4f46e5"
          />
          <ClientSessionProvider session={session}>
            <CommandMenu />
            {children}
            <Toaster />
            <SonnerToaster richColors position="top-right" />
          </ClientSessionProvider>
      </body>
    </html>
  );
}
