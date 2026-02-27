import { SiteHeader } from "@/components/ui/site-header";
import { SiteFooter } from "@/components/ui/site-footer";
import { cn } from "@/lib/utils";

type SiteLayoutProps = {
  children: React.ReactNode;
  locale?: "pt" | "en";
  className?: string;
};

/**
 * Full-page shell: sticky header + scrollable main + footer.
 * Use this in every route group layout (calculators, content, etc).
 */
export function SiteLayout({ children, locale = "pt", className }: SiteLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={locale} />
      <main className={cn("flex-1", className)}>{children}</main>
      <SiteFooter locale={locale} />
    </div>
  );
}
