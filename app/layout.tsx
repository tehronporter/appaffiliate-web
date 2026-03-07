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
  description: "AppAffiliate admin workspace built with Next.js App Router.",
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
