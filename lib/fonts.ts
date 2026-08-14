import { Bebas_Neue, Kalam, Space_Mono } from "next/font/google";

export const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-bebas-neue",
});

export const kalam = Kalam({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
  variable: "--font-kalam",
});

export const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono",
});
