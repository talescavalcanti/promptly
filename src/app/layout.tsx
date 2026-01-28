import type { Metadata } from "next";
import "./globals.css";
import { Header } from "./components/Header/Header";

export const metadata: Metadata = {
  title: "Promptly - Gerador de Prompts Profissional",
  description: "Transforme ideias em prompts técnicos para IA.",
};

import { FloatingUsage } from "./components/FloatingUsage/FloatingUsage";
import { ScrollReveal } from "./components/ScrollReveal/ScrollReveal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&family=Lora:ital,wght@0,400..700;1,400..700&family=Merriweather:wght@300;400;700;900&family=Montserrat:wght@100..900&family=Nunito:wght@400;600;700&family=Open+Sans:wght@300..800&family=Oswald:wght@200..700&family=Playfair+Display:wght@400..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100..900&family=Roboto:wght@100;300;400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Header />
        <FloatingUsage />
        {children}
      </body>
    </html>
  );
}
