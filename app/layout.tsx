import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "RAI1903 | Real Aviles Industrial",
  description: "Plataforma no oficial blanquiazul sobre el Real Aviles Industrial.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen athletic-shell">
          <Header />
          <main className="mx-auto max-w-[1480px] px-4 pb-12 pt-28 sm:px-6 lg:px-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
