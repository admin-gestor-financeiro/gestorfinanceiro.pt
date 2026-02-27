import { SiteLayout } from "@/components/ui/site-layout";

export default function EnContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout locale="en">{children}</SiteLayout>;
}
