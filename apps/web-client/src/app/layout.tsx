import type { Metadata } from "next";
import { Cormorant_Garamond, Inter,  } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/nav-bar";

const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alnubras",
  description: "The Art of the Future",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorantGaramond.variable} ${inter.variable} antialiased `}
      >
        <NavBar />
        <div>
          {children}
        </div>
      </body>
    </html>
  );
}
