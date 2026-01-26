import "./globals.css";
import type { Metadata } from "next";
import {inter } from "./fonts";

export const metadata: Metadata = {
  title: "Laser Drift - Ship Selection Page",
  description: "Ship selection page",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    startupImage: [
    
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        {/* Iconos para iOS */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-title" content="Laser Drift" />

        {/* Meta tags adicionales para móvil */}
        {/* <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" /> */}
        {/* <script async src="https://assets.awwwards.com/assets/js/embed_ribbon.js"></script> */}
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
