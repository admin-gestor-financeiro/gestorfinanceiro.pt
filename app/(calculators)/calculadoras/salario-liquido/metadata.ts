import type { Metadata } from "next";
import {
  buildWebApplicationSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildGraphSchema,
} from "@/lib/seo/structured-data";

const PAGE_URL = "https://gestorfinanceiro.pt/calculadoras/salario-liquido";

export const metadata: Metadata = {
  title: "Calculadora de Salário Líquido 2026 — Portugal",
  description:
    "Calcule o seu salário líquido a partir do salário bruto. Inclui descontos de Segurança Social (11%) e Retenção na Fonte IRS 2026 para Portugal Continental, Madeira e Açores. Gratuito e atualizado.",
  alternates: {
    canonical: "/calculadoras/salario-liquido",
    languages: {
      "pt-PT": "/calculadoras/salario-liquido",
      en: "/en/calculators/net-salary",
    },
  },
  openGraph: {
    title: "Calculadora de Salário Líquido 2026 — Portugal",
    description:
      "Calcule o seu salário líquido em segundos. Inclui IRS, Segurança Social e subsídio de alimentação.",
    url: PAGE_URL,
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Calculadora de Salário Líquido 2026 — Portugal",
    description:
      "Calcule o seu salário líquido em segundos. Inclui IRS, Segurança Social e subsídio de alimentação.",
  },
};

export const structuredData = buildGraphSchema([
  buildWebApplicationSchema({
    name: "Calculadora de Salário Líquido 2026",
    description:
      "Calculadora gratuita de salário líquido para Portugal. Calcula descontos de IRS e Segurança Social com base nos escalões de 2026.",
    url: PAGE_URL,
  }),
  buildBreadcrumbSchema([
    { name: "Início", url: "https://gestorfinanceiro.pt" },
    { name: "Calculadoras", url: "https://gestorfinanceiro.pt/calculadoras" },
    { name: "Calculadora de Salário Líquido", url: PAGE_URL },
  ]),
  buildFaqSchema([
    {
      question: "Como se calcula o salário líquido em Portugal?",
      answer:
        "O salário líquido obtém-se subtraindo ao salário bruto os descontos obrigatórios: Segurança Social (11% para o trabalhador) e a Retenção na Fonte de IRS (variável conforme escalão de rendimento, estado civil e número de dependentes).",
    },
    {
      question: "Qual é a taxa de Segurança Social do trabalhador em 2026?",
      answer:
        "A taxa contributiva do trabalhador por conta de outrem para a Segurança Social é de 11% do salário bruto em 2026.",
    },
    {
      question: "O subsídio de alimentação é sujeito a IRS?",
      answer:
        "O subsídio de alimentação pago em dinheiro está isento de IRS até 6,00 €/dia. Se pago em cartão ou vale refeição, a isenção sobe para 9,60 €/dia. O valor que exceda estes limites é tributado como rendimento.",
    },
    {
      question: "O que é o quociente conjugal?",
      answer:
        'Para casais em que apenas um dos cônjuges tem rendimentos ("único titular"), o rendimento coletável é dividido por 2 antes de aplicar os escalões de IRS, e o imposto resultante é multiplicado por 2. Isto resulta geralmente numa menor retenção mensal.',
    },
  ]),
]);
