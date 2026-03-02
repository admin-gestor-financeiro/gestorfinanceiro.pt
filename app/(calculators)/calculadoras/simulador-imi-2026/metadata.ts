import type { Metadata } from "next";
import {
  buildWebApplicationSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildGraphSchema,
} from "@/lib/seo/structured-data";

const PAGE_URL = "https://gestorfinanceiro.pt/calculadoras/simulador-imi-2026";

export const metadata: Metadata = {
  title: "Simulador de IMI 2026 — Calculadora Completa para Portugal",
  description:
    "Calcule o IMI 2026 para qualquer município de Portugal. Inclui AIMI, verificação de isenções (permanente e temporária) e calendário de pagamento. Taxas municipais atualizadas, IMI Familiar e taxa agravada para imóveis devolutos.",
  alternates: {
    canonical: "/calculadoras/simulador-imi-2026",
    languages: {
      "pt-PT": "/calculadoras/simulador-imi-2026",
      en: "/en/calculators/imi-calculator",
    },
  },
  openGraph: {
    title: "Simulador de IMI 2026 — Calculadora Completa para Portugal",
    description:
      "Calcule o IMI 2026, AIMI e verifique se tem direito a isenção. Todos os 308 municípios, IMI Familiar e calendário de pagamento.",
    url: PAGE_URL,
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Simulador de IMI 2026 — Calculadora Completa para Portugal",
    description:
      "Calcule o IMI 2026, AIMI e verifique se tem direito a isenção. Todos os 308 municípios de Portugal.",
  },
};

export const structuredData = buildGraphSchema([
  buildWebApplicationSchema({
    name: "Simulador de IMI 2026",
    description:
      "Calculadora de IMI gratuita para Portugal com todos os 308 municípios, AIMI, verificação de isenção permanente e temporária, calendário de pagamento e taxa agravada para imóveis devolutos. Atualizado para 2026.",
    url: PAGE_URL,
  }),
  buildBreadcrumbSchema([
    { name: "Início", url: "https://gestorfinanceiro.pt" },
    { name: "Calculadoras", url: "https://gestorfinanceiro.pt/calculadoras" },
    { name: "Simulador de IMI 2026", url: PAGE_URL },
  ]),
  buildFaqSchema([
    {
      question: "Como se calcula o IMI em Portugal?",
      answer:
        "O IMI (Imposto Municipal sobre Imóveis) calcula-se multiplicando o Valor Patrimonial Tributário (VPT) do imóvel pela taxa municipal aplicável. Para imóveis urbanos, a taxa varia entre 0,3% e 0,45% (definida por cada município). Para imóveis rústicos é de 0,8%. Em habitação própria permanente, pode ainda aplicar-se a dedução IMI Familiar (€30, €70 ou €140 consoante o número de dependentes).",
    },
    {
      question: "Onde encontro o VPT do meu imóvel?",
      answer:
        "O VPT (Valor Patrimonial Tributário) consta na caderneta predial do imóvel, disponível no Portal das Finanças (portaldasfinancas.gov.pt) na secção «Consultar» → «Património». Também aparece na nota de liquidação do IMI que a AT envia anualmente.",
    },
    {
      question: "Quando se paga o IMI em 2026?",
      answer:
        "O IMI 2026 é pago conforme o montante anual: até €100, numa prestação em maio; entre €100,01 e €500, em duas prestações (maio e novembro); acima de €500, em três prestações (maio, agosto e novembro). Os prazos exatos em 2026 são 31 de maio, 31 de agosto e 30 de novembro.",
    },
    {
      question: "O que é a isenção de IMI e quem tem direito?",
      answer:
        "Existem dois tipos de isenção: a isenção permanente (Art. 11-A CIMI) para agregados com rendimento bruto ≤ €17.303 e VPT total ≤ €75.198, em habitação própria permanente; e a isenção temporária (Art. 46 EBF) para habitação própria permanente com VPT ≤ €125.000 e rendimento ≤ €153.300, válida por 3 anos (até 5 em municípios aderentes). A isenção temporária não é automática — deve ser solicitada no Portal das Finanças no prazo de 60 dias após a aquisição.",
    },
    {
      question: "O que é o AIMI e quem paga?",
      answer:
        "O AIMI (Adicional ao IMI) é um imposto que incide sobre o VPT total de imóveis urbanos residenciais e terrenos para construção. Particulares pagam AIMI quando o VPT total excede €600.000 (ou €1.200.000 para casais), com taxas de 0,7% a 1,5% em escalões progressivos. Empresas pagam 0,4% sobre o total sem dedução. O AIMI é pago anualmente em setembro.",
    },
    {
      question: "O que é o IMI Familiar?",
      answer:
        "O IMI Familiar é uma dedução ao IMI para habitação própria permanente, aplicada por municípios que aderiram voluntariamente: €30 por 1 dependente, €70 por 2 dependentes e €140 por 3 ou mais dependentes. Cerca de 274 dos 308 municípios participam em 2026. Municípios que não participam incluem Porto e Vila Nova de Gaia.",
    },
    {
      question: "Qual a taxa de IMI para imóveis devolutos?",
      answer:
        "Imóveis classificados como devolutos (vagos) estão sujeitos a uma taxa agravada de 3 vezes a taxa base municipal em todo o país. Em zonas de pressão urbanística, a taxa pode atingir 6 vezes a taxa base, aumentando 10% por cada ano adicional, até ao máximo de 12 vezes.",
    },
  ]),
]);
