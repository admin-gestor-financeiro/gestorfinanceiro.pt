import type { Metadata } from "next";
import {
  buildWebApplicationSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildGraphSchema,
} from "@/lib/seo/structured-data";

const PAGE_URL = "https://gestorfinanceiro.pt/calculadoras/credito-habitacao";

export const metadata: Metadata = {
  title: "Calculadora de Crédito Habitação 2026 — Simulador de Prestação e Custos",
  description:
    "Simule a prestação mensal do seu crédito habitação, calcule IMT, Imposto de Selo e todos os custos de aquisição. Inclui taxa de esforço, análise de sensibilidade ao Euribor e plano de amortização. Gratuito e atualizado para 2026.",
  alternates: {
    canonical: "/calculadoras/credito-habitacao",
    languages: {
      "pt-PT": "/calculadoras/credito-habitacao",
      en: "/en/calculators/mortgage-calculator",
    },
  },
  openGraph: {
    title: "Calculadora de Crédito Habitação 2026 — Prestação, IMT e Custos de Aquisição",
    description:
      "Calcule a sua prestação mensal, IMT, Imposto de Selo e taxa de esforço numa única ferramenta. Inclui análise de sensibilidade ao Euribor e plano de amortização.",
    url: PAGE_URL,
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Calculadora de Crédito Habitação 2026 — Portugal",
    description:
      "Simule prestação, IMT, custos de aquisição e taxa de esforço do seu crédito habitação. Gratuito.",
  },
};

export const structuredData = buildGraphSchema([
  buildWebApplicationSchema({
    name: "Calculadora de Crédito Habitação 2026",
    description:
      "Simulador gratuito de crédito habitação para Portugal. Calcula prestação mensal (amortização francesa), IMT, Imposto de Selo, custos de aquisição, taxa de esforço (DSTI) e análise de sensibilidade ao Euribor. Dados atualizados para 2026.",
    url: PAGE_URL,
  }),
  buildBreadcrumbSchema([
    { name: "Início", url: "https://gestorfinanceiro.pt" },
    { name: "Calculadoras", url: "https://gestorfinanceiro.pt/calculadoras" },
    { name: "Calculadora de Crédito Habitação", url: PAGE_URL },
  ]),
  buildFaqSchema([
    {
      question: "Como se calcula a prestação mensal do crédito habitação?",
      answer:
        "A prestação é calculada pela fórmula de amortização francesa (prestação constante): M = P × [r × (1+r)^n] / [(1+r)^n − 1], onde P é o capital em dívida, r é a taxa mensal (TAN ÷ 12) e n é o número total de prestações. A TAN é a soma do Euribor com o spread acordado com o banco.",
    },
    {
      question: "Quais são os custos de aquisição de um imóvel em Portugal?",
      answer:
        "Os principais custos são: IMT (Imposto Municipal sobre Transmissões), Imposto de Selo sobre a compra (0,8%), Imposto de Selo sobre o crédito (0,6%), registo e notário (aprox. €700–€1.000), avaliação bancária (aprox. €230–€286) e comissão de instrução do banco (aprox. €200–€725).",
    },
    {
      question: "O que é o IMT Jovem?",
      answer:
        "O IMT Jovem é uma isenção de IMT e Imposto de Selo para compradores com 35 anos ou menos na aquisição da primeira habitação própria e permanente, introduzida pelo Decreto-Lei n.º 48-A/2024. Em 2026, a isenção total aplica-se a imóveis até €330.539 no Continente.",
    },
    {
      question: "O que é a taxa de esforço (DSTI)?",
      answer:
        "A taxa de esforço (Debt Service-to-Income) mede a percentagem do rendimento mensal líquido comprometida com encargos de crédito. O Banco de Portugal recomenda um limite máximo de 50%, com um buffer de stress de +1,5 p.p. para créditos com prazo superior a 10 anos.",
    },
    {
      question: "Como funciona a indexação ao Euribor?",
      answer:
        "Nos créditos habitação a taxa variável, a TAN é composta pelo Euribor (indexante) e pelo spread (margem do banco). O Euribor revisa-se periodicamente (3, 6 ou 12 meses), alterando o valor da prestação. A calculadora inclui cenários de sensibilidade para subidas de 1, 2 e 3 pontos percentuais.",
    },
  ]),
]);
