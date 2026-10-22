import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Outfit, Source_Sans_3 } from "next/font/google";
import { ChatWidget } from "@/components/ChatWidget";
import { SiteBackground } from "@/components/SiteBackground";
import { Footer } from "@/components/Footer";
import { Interactions } from "@/components/Interactions";
import { Nav } from "@/components/Nav";
import "./globals.css";

const display = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Ultimate GSM — Phone Repair Specialist",
    template: "%s · Ultimate GSM",
  },
  description:
    "We fix it. You love it. Ultimate GSM repairs screens, batteries, water damage, charging faults, and board-level issues, with a curated Oraimo store."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.motion='reduce'}catch(e){}",
          }}
        />
        <SiteBackground />
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Nav />
        <Interactions />
        {children}
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
