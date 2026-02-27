import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/en",
    languages: {
      "en": "/en",
      "pt-PT": "/",
    },
  },
  openGraph: {
    locale: "en_GB",
    alternateLocale: "pt_PT",
  },
};

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
