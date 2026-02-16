import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import SocketProvider from "./components/SocketProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://runcor.io"),
  title: "RunCor | Universal Device Autonomy Network",
  description: "The operating system for machine-to-machine commerce. Turn your GPU, CNC, or Drone into an autonomous entity that works while you sleep.",
  keywords: ["autonomous devices", "machine-to-machine commerce", "GPU servers", "CNC machines", "drones", "edge computing", "IoT"],
  authors: [{ name: "RunCor" }],
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
      { url: "/runcor-logo-512px.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.png",
    apple: "/runcor-logo-512px.png",
  },
  openGraph: {
    title: "RunCor | Universal Device Autonomy Network",
    description: "The operating system for machine-to-machine commerce. Turn your GPU, CNC, or Drone into an autonomous entity that works while you sleep.",
    url: "https://runcor.io",
    siteName: "RunCor",
    images: [
      {
        url: "/runcor-logo-512px.png",
        width: 512,
        height: 512,
        alt: "RunCor Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RunCor | Universal Device Autonomy Network",
    description: "The operating system for machine-to-machine commerce.",
    images: ["/runcor-logo-512px.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="selection:bg-white selection:text-black">
        <AuthProvider>
          <SocketProvider>{children}</SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

