import type { Metadata } from "next";
import "./globals.css";
import { MobileNavProvider } from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: "ETI Dashboard",
  description: "Electrical Training Institute - chatbot and content dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="lg:h-full">
      <body className="antialiased lg:h-full">
        <MobileNavProvider>{children}</MobileNavProvider>
      </body>
    </html>
  );
}
