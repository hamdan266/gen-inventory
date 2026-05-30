import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retail ERP",
  description: "Enterprise Retail Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FFFBF0] text-black">{children}</body>
    </html>
  );
}
