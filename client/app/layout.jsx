import { Geist, Geist_Mono } from "next/font/google";
import Web3Provider from "./components/Web3Provider";
import SiteLayout from "./components/SiteLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata = {
  title: {
    template: "%s | LinkFolio",
    default: "LinkFolio",
    absolute: "LinkFolio"
  },
  description:
    "Create and own your digital identity as a soulbound NFT with on-chain metadata.",
  keywords: "LinkFolio, profiles, social media, blockchain, portfolio"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Web3Provider>
          <SiteLayout>{children}</SiteLayout>
        </Web3Provider>
      </body>
    </html>
  );
}
