import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Chronos: Odyssey of the Silent Fleet",
  description: "Machines may fall silent. Their discoveries never do.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#120d0a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="base" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
