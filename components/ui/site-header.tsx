"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
};

type SiteHeaderProps = {
  locale?: "pt" | "en";
  className?: string;
};

const NAV_PT: NavItem[] = [
  { label: "Calculadoras", href: "/calculadoras" },
];

const NAV_EN: NavItem[] = [
  { label: "Calculators", href: "/en/calculators" },
];

// Explicit path map: PT path → EN path (and reverse lookup builds EN → PT).
// Add entries here whenever a new bilingual page is created.
const PATH_MAP: Record<string, string> = {
  "/": "/en",
  "/calculadoras": "/en/calculators",
  "/calculadoras/salario-liquido": "/en/calculators/net-salary",
  "/sobre": "/en/about",
  "/contacto": "/en/contact",
};

const REVERSE_MAP = Object.fromEntries(
  Object.entries(PATH_MAP).map(([pt, en]) => [en, pt])
);

export function SiteHeader({ locale = "pt", className }: SiteHeaderProps) {
  const pathname = usePathname();
  const nav = locale === "en" ? NAV_EN : NAV_PT;
  const homeHref = locale === "en" ? "/en" : "/";

  // Resolve the alternate-language href for the current page
  const altHref =
    locale === "en"
      ? (REVERSE_MAP[pathname] ?? "/")
      : (PATH_MAP[pathname] ?? "/en");
  const altLabel = locale === "en" ? "PT" : "EN";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-neutral-200 bg-white",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href={homeHref}
          className="flex items-center gap-2 text-primary-700 hover:text-primary-600 transition-colors"
        >
          {/* Simple monogram mark */}
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600 text-sm font-bold text-white">
            GF
          </span>
          <span className="hidden font-semibold sm:block text-neutral-800">
            Gestor Financeiro
          </span>
        </Link>

        {/* Nav + language switcher */}
        <div className="flex items-center gap-1 sm:gap-4">
          <nav className="flex items-center gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="h-4 w-px bg-neutral-200" aria-hidden />

          <Link
            href={altHref}
            className="rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
          >
            {altLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
