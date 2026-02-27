import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Gestor Financeiro — Calculadoras Financeiras para Portugueses",
    template: "%s | Gestor Financeiro",
  },
  description:
    "Ferramentas e calculadoras financeiras gratuitas para ajudar portugueses a gerir as suas finanças pessoais.",
  metadataBase: new URL("https://gestorfinanceiro.pt"),
  alternates: {
    canonical: "/",
    languages: {
      "pt-PT": "/",
      en: "/en",
    },
  },
  openGraph: {
    siteName: "Gestor Financeiro",
    locale: "pt_PT",
    alternateLocale: "en_GB",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="min-h-screen bg-neutral-50 font-sans antialiased text-neutral-800">
        {children}
      </body>
    </html>
  );
}
