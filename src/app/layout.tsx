import type { Metadata } from "next";
import "./globals.css";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Travel Allergy Readiness Index Map",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <Dashboard />
        <main className="flex-1 flex">{children}</main>
      </body>
    </html>
  );
}
