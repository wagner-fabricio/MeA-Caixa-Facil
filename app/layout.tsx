import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "M&A Caixa Fácil - Controle do caixa sem complicação",
  description: "Registre entradas e saídas falando ou digitando. O Caixa Fácil mostra tudo — sem planilhas, sem dor de cabeça.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#00D4FF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
