import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OmniChat AI — Universal Context-Aware Intelligence",
  description: "Production-ready AI Chatbot platform with universal SDK and semantic knowledge retrieval.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black antialiased shadow-2xl`}>
        {children}
      </body>
    </html>
  );
}
