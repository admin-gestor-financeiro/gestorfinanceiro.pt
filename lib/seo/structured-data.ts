/**
 * Structured data (JSON-LD) builders for Schema.org types.
 * Add new builder functions here as new page types are created.
 */

const SITE_URL = "https://gestorfinanceiro.pt";
const SITE_NAME = "Gestor Financeiro";

// ─── Types ────────────────────────────────────────────────────────────────────

type WithContext<T> = T & { "@context": "https://schema.org" };

type BreadcrumbItem = {
  name: string;
  url: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type CalculatorStructuredDataArgs = {
  name: string;
  description: string;
  url: string;
  locale: "pt" | "en";
  breadcrumbs: BreadcrumbItem[];
  faqItems?: FaqItem[];
};

// ─── Builders ────────────────────────────────────────────────────────────────

export function buildWebApplicationSchema(
  args: Pick<CalculatorStructuredDataArgs, "name" | "description" | "url">
): WithContext<object> {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: args.name,
    description: args.description,
    url: args.url,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function buildBreadcrumbSchema(
  items: BreadcrumbItem[]
): WithContext<object> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFaqSchema(items: FaqItem[]): WithContext<object> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildOrganizationSchema(): WithContext<object> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Ferramentas e calculadoras financeiras gratuitas para portugueses.",
    inLanguage: ["pt-PT", "en"],
  };
}

/** Combine multiple JSON-LD objects into a single @graph array */
export function buildGraphSchema(schemas: object[]): object {
  return {
    "@context": "https://schema.org",
    "@graph": schemas.map((s) => {
      // Strip individual @context keys — the graph provides one
      const { "@context": _ctx, ...rest } = s as Record<string, unknown>;
      return rest;
    }),
  };
}
