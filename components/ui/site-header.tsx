"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

type SubNavItem = { label: string; href: string };

type NavItem = {
  label: string;
  href: string;
  children?: SubNavItem[];
};

type SiteHeaderProps = {
  locale?: "pt" | "en";
  className?: string;
};

const NAV_PT: NavItem[] = [
  {
    label: "Calculadoras",
    href: "/calculadoras",
    children: [
      { label: "Calculadora de Salário Líquido", href: "/calculadoras/salario-liquido" },
      { label: "Simulador de IMT e Imposto de Selo", href: "/calculadoras/simulador-imt" },
      { label: "Calculadora de Crédito Habitação", href: "/calculadoras/credito-habitacao" },
    ],
  },
];

const NAV_EN: NavItem[] = [
  {
    label: "Calculators",
    href: "/en/calculators",
    children: [
      { label: "Net Salary Calculator", href: "/en/calculators/net-salary" },
      { label: "IMT & Stamp Duty Simulator", href: "/en/calculators/imt-simulator" },
      { label: "Mortgage Calculator", href: "/en/calculators/mortgage-calculator" },
    ],
  },
];

// Explicit path map: PT path → EN path (and reverse lookup builds EN → PT).
// Add entries here whenever a new bilingual page is created.
const PATH_MAP: Record<string, string> = {
  "/": "/en",
  "/calculadoras": "/en/calculators",
  "/calculadoras/salario-liquido": "/en/calculators/net-salary",
  "/calculadoras/simulador-imt": "/en/calculators/imt-simulator",
  "/calculadoras/credito-habitacao": "/en/calculators/mortgage-calculator",
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
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Resolve the alternate-language href for the current page
  const altHref =
    locale === "en"
      ? (REVERSE_MAP[pathname] ?? "/")
      : (PATH_MAP[pathname] ?? "/en");
  const altLabel = locale === "en" ? "PT" : "EN";

  const closeMenu = useCallback(() => setOpenMenu(null), []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeMenu]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeMenu]);

  // Close dropdown on route change
  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

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
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600 text-sm font-bold text-white">
            GF
          </span>
          <span className="hidden font-semibold sm:block text-neutral-800">
            Gestor Financeiro
          </span>
        </Link>

        {/* Nav + language switcher */}
        <div className="flex items-center gap-1 sm:gap-4" ref={navRef}>
          <nav className="flex items-center gap-1">
            {nav.map((item) => {
              if (!item.children) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                  >
                    {item.label}
                  </Link>
                );
              }

              const isOpen = openMenu === item.href;

              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(item.href)}
                  onMouseLeave={closeMenu}
                >
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpenMenu(isOpen ? null : item.href)
                    }
                    className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                  >
                    {item.label}
                    <svg
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-150",
                        isOpen && "rotate-180"
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="absolute right-0 top-full z-40 pt-1">
                      <div
                        role="menu"
                        className="min-w-[230px] rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            role="menuitem"
                            onClick={closeMenu}
                            className="block px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-primary-600 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
