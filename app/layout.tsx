import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { NavRail } from "@/components/NavRail";

export const metadata: Metadata = {
  title: "RAI1903 | Real Aviles Industrial",
  description: "Plataforma no oficial blanquiazul sobre el Real Aviles Industrial.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen industrial-grid">
          <Header />
          <NavRail />
          <main className="px-4 pb-10 pt-24 sm:px-6 lg:pl-72 lg:pr-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
