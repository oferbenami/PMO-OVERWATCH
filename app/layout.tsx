import "@/styles/globals.css";
import type { Metadata } from "next";
import { TopNav } from "@/components/top-nav";

export const metadata: Metadata = {
  title: "PMO-OVERWATCH",
  description: "Construction & Renovation PMO Oversight"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body dir="rtl">
        <TopNav />
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
