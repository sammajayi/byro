// app/layout.tsx
import "@coinbase/onchainkit/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./onchain/providers";
import AuthProvider from "./privy/AuthProvider";
import Navigation from "../components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Byro Africa",
  description: "Where Every Events Begins",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-pink-50 to-blue-50 min-h-screen`}
      >
        <AuthProvider>
          <Providers>
            <Navigation />
            <main className="py-6">{children}</main>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
