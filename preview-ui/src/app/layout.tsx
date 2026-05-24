import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LexFlow — Regulatory Knowledge Platform",
  description:
    "Navegação e inspeção semântica de regras regulatórias SBVR",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="h-screen overflow-hidden">{children}</body>
    </html>
  );
}
