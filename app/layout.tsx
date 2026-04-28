import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PMO-OVERWATCH",
  description: "Construction & Renovation PMO Oversight"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body dir="rtl">{children}</body>
    </html>
  );
}
