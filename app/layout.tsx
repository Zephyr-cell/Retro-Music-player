import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { manrope } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Haryana Roadways Radio",
  description: "haryana roadways radio is a free online radio station that plays haryana roadways songs and music.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0f1a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
