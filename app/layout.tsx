import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AuthSessionSync } from "@/components/auth/auth-session-sync";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AppAffiliate",
    template: "%s | AppAffiliate",
  },
  description:
    "AppAffiliate helps iOS app teams grow through creators without risky upfront influencer fees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-background text-ink antialiased`}>
        <AuthSessionSync />
        {children}
      </body>
    </html>
  );
}
