
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from 'next/head';
import ClarityBlock from '../components/clarity';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Internal Portal - Programisto",
  description: "For Programistoj only :)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {



  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/50.png" type="image/png" sizes="any" />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClarityBlock projectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || ''} />
        {children}
      </body>
    </html >
  );
}
