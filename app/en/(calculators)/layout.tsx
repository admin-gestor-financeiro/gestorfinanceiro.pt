import { SiteLayout } from "@/components/ui/site-layout";

export default function EnCalculatorsLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayout locale="en">{children}</SiteLayout>;
}
