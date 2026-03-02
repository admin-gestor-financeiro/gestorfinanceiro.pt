"use client";

import { useMemo } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Calendar, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculateImi,
  calculateAimi,
  checkExemptions,
  calculateVpt,
  calculatePortfolio,
  PROPERTY_TYPE_OPTIONS,
  PROPERTY_PURPOSE_OPTIONS,
  FILING_STATUS_OPTIONS,
  type ImiResult,
  type AimiResult,
  type ExemptionResult,
  type VptResult,
  type PortfolioResult,
  type ImiPropertyType,
  type ImiPropertyPurpose,
} from "@/lib/calculators/imi";
import { DISTRITOS, getMunicipio, getMunicipiosByDistrito } from "@/lib/data/imi-municipalities";
import { useImiParams, type PortfolioPropertyState } from "@/lib/hooks/use-imi-params";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PillToggle } from "@/components/ui/pill-toggle";
import { Collapsible } from "@/components/ui/collapsible";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// ─── Types ────────────────────────────────────────────────────────────────────

type Locale = "pt" | "en";

// ─── Strings ──────────────────────────────────────────────────────────────────

const STRINGS = {
  pt: {
    title: "Simulador de IMI 2026",
    subtitle: "Calcule o IMI, AIMI e verifique se tem direito a isenção · Portugal",
    // Core form
    formTitle: "Dados do Imóvel",
    vptLabel: "VPT — Valor Patrimonial Tributário (€)",
    vptHint: "Indicado na caderneta predial do imóvel",
    vptPlaceholder: "Ex: 150 000",
    vptHowTitle: "Como encontro o VPT?",
    vptHowSteps: [
      "Aceda a portaldasfinancas.gov.pt e inicie sessão (NIF + senha ou Chave Móvel Digital).",
      "No menu lateral, clique em Imóveis → Consultar → Caderneta Predial.",
      "Selecione o imóvel pretendido na lista.",
      "O VPT aparece na caderneta predial como «Valor Patrimonial Tributário».",
      "Nota: o VPT é atualizado periodicamente. Use sempre o valor mais recente.",
    ],
    distritoLabel: "Distrito",
    distritoPlaceholder: "Selecione o distrito",
    municipioLabel: "Município (Concelho)",
    municipioPlaceholder: "Selecione o município",
    frequesiaLabel: "Freguesia",
    frequesiaPlaceholder: "Selecione a freguesia",
    propertyTypeLabel: "Tipo de Imóvel",
    propertyPurposeLabel: "Finalidade",
    dependentsLabel: "Dependentes (para IMI Familiar)",
    dependentsHint: "Só aplicável em habitação própria permanente em municípios aderentes",
    // Results
    resultsTitle: "Resultado IMI",
    annualImi: "IMI Anual",
    monthlyEquiv: "Equivalente mensal",
    formula: "Fórmula",
    rateContext: (name: string, rate: string) => `${name} aplica taxa de ${rate}`,
    imiFamiliarApplied: (amount: string) => `Dedução IMI Familiar aplicada: ${amount}`,
    imiFamiliarNotParticipant: "Este município não aderiu ao IMI Familiar",
    imiFamiliarNotHpp: "IMI Familiar apenas para habitação própria permanente",
    imiFamiliarNoDeps: "Sem dependentes — sem dedução",
    imiFamiliarInsufficientDeps: "Nº de dependentes insuficiente para este município",
    paymentTitle: "Calendário de Pagamento 2026",
    vacantAlert: (mult: number) => `Imóvel devoluto: taxa agravada ${mult}× a taxa base`,
    emptyState: "Introduza o VPT e selecione o município para calcular o IMI.",
    // AIMI
    aimiTitle: "AIMI — Adicional ao IMI",
    aimiDesc: "Aplicável a quem detém imóveis urbanos residenciais e terrenos para construção com VPT total superior a €600 000 (ou €1 200 000 para casais).",
    aimiTotalVptLabel: "VPT total de todos os imóveis residenciais (€)",
    aimiTotalVptHint: "Inclua todos os imóveis urbanos residenciais e terrenos para construção que possui",
    aimiFilingStatusLabel: "Situação fiscal",
    aimiVacantLabel: "Inclui imóveis devolutos ou em ruínas",
    aimiVacantHint: "Imóveis nesta situação não beneficiam da dedução",
    aimiResult: "AIMI a pagar",
    aimiDeduction: "Dedução",
    aimiTaxableBase: "Base tributável",
    aimiPaymentNote: (month: string) => `Pagamento em ${month}`,
    aimiZero: "VPT total abaixo do limite de isenção — não há AIMI a pagar",
    // Exemption
    exemptionTitle: "Verificar Isenção de IMI",
    exemptionDesc: "Verifique se tem direito a isenção permanente (baixo rendimento) ou temporária (primeira habitação adquirida).",
    incomeLabel: "Rendimento bruto anual do agregado familiar (€)",
    incomeHint: "Rendimento bruto total de todos os membros do agregado",
    familyVptLabel: "VPT total de todos os imóveis do agregado (€)",
    familyVptHint: "Soma dos VPT de todos os imóveis detidos pelo agregado familiar",
    acqYearLabel: "Ano de aquisição do imóvel",
    prevExLabel: "N.º de isenções temporárias já utilizadas (máx. 2)",
    permanentTitle: "Isenção Permanente (Art. 11-A CIMI)",
    temporaryTitle: "Isenção Temporária (Art. 46 EBF)",
    eligible: "Tem direito à isenção",
    notEligible: "Não cumpre os requisitos",
    temporaryDuration: (years: number) => `Isenção por ${years} anos`,
    temporaryNote: "Nota: alguns municípios (Lei 56/2023) estendem para 5 anos. Confirme junto ao seu município.",
    disclaimer: "Simulação de carácter informativo baseada nas tabelas de IMI 2026. Taxas municipais verificadas na pesquisa de mercado realizada em fevereiro de 2026 — confirme sempre no Portal das Finanças. Consulte um profissional antes de tomar decisões.",
    // VPT Reassessment section
    vptSectionTitle: "Simulador de Reavaliação do VPT",
    vptSectionDesc: "Estime o VPT que o seu imóvel teria se fosse avaliado em 2026. Se o valor for inferior ao atual, pode pedir uma reavaliação gratuitamente no Portal das Finanças.",
    vptEvalYearLabel: "Ano da última avaliação fiscal",
    vptClLabel: "Coeficiente de localização (Cl)",
    vptClHint: "Indicado na caderneta predial — entre 0,40 e 3,50",
    vptAaLabel: "Área bruta privativa (Aa) em m²",
    vptAbLabel: "Área bruta dependente (Ab) em m²",
    vptAbHint: "Garagens, arrumos, varandas fechadas, etc.",
    vptConstructionYearLabel: "Ano de construção",
    vptAmenitiesLabel: "Características do imóvel",
    vptPool: "Piscina",
    vptGarageLabel: "Garagem individual",
    vptAcLabel: "Ar condicionado central",
    vptGatedLabel: "Condomínio fechado",
    vptSingleFamilyLabel: "Moradia unifamiliar",
    // VPT Result
    vptResultTitle: "Estimativa de Reavaliação do VPT",
    vptCurrentLabel: "VPT atual",
    vptNewLabel: "VPT estimado (2026)",
    vptDiffLabel: "Diferença",
    vptImiChangeLabel: "Impacto anual no IMI",
    vptRecommendRequest: "Pode beneficiar de uma reavaliação — o VPT estimado é inferior ao atual.",
    vptRecommendCaution: "Atenção: a reavaliação pode aumentar o seu VPT e, consequentemente, o IMI.",
    vptNotEligible: "Não pode solicitar reavaliação — a última avaliação foi há menos de 3 anos.",
    vptVcWarning: "Nota: o Vc aumentou 7,14% em 2026 (€665 → €712,50), o que pode inflacionar a estimativa.",
    // Portfolio
    portfolioTitle: "Portfólio de Imóveis",
    portfolioDesc: "Calcule o IMI agregado de vários imóveis e o VPT residencial total para efeitos de AIMI.",
    addProperty: "Adicionar imóvel",
    removeProperty: "Remover",
    propertyN: (n: number) => `Imóvel ${n}`,
    portfolioTotal: "Total IMI anual",
    portfolioMonthly: "Equivalente mensal",
    portfolioResVpt: "VPT residencial total (base AIMI)",
    portfolioEmpty: "Adicione pelo menos um imóvel com VPT e município.",
  },
  en: {
    title: "IMI 2026 Simulator",
    subtitle: "Calculate IMI, AIMI and check exemption eligibility · Portugal",
    formTitle: "Property Details",
    vptLabel: "VPT — Tax Rateable Value (€)",
    vptHint: "Listed on your property's caderneta predial",
    vptPlaceholder: "e.g. 150 000",
    vptHowTitle: "How do I find the VPT?",
    vptHowSteps: [
      "Go to portaldasfinancas.gov.pt and log in (NIF + password or Chave Móvel Digital).",
      "In the side menu, click Imóveis → Consultar → Caderneta Predial.",
      "Select the property from the list.",
      "The VPT is shown on the caderneta predial as «Valor Patrimonial Tributário».",
      "Note: the VPT is updated periodically. Always use the most recent value.",
    ],
    distritoLabel: "District",
    distritoPlaceholder: "Select district",
    municipioLabel: "Municipality",
    municipioPlaceholder: "Select municipality",
    frequesiaLabel: "Parish",
    frequesiaPlaceholder: "Select parish",
    propertyTypeLabel: "Property Type",
    propertyPurposeLabel: "Property Purpose",
    dependentsLabel: "Dependents (for IMI Familiar)",
    dependentsHint: "Only applicable for primary residences in participating municipalities",
    resultsTitle: "IMI Result",
    annualImi: "Annual IMI",
    monthlyEquiv: "Monthly equivalent",
    formula: "Formula",
    rateContext: (name: string, rate: string) => `${name} applies a rate of ${rate}`,
    imiFamiliarApplied: (amount: string) => `IMI Familiar deduction applied: ${amount}`,
    imiFamiliarNotParticipant: "This municipality does not participate in IMI Familiar",
    imiFamiliarNotHpp: "IMI Familiar only applies to primary permanent residences",
    imiFamiliarNoDeps: "No dependents — no deduction",
    imiFamiliarInsufficientDeps: "Not enough dependents for this municipality's minimum",
    paymentTitle: "2026 Payment Schedule",
    vacantAlert: (mult: number) => `Vacant property: rate increased ${mult}× the base rate`,
    emptyState: "Enter the VPT and select a municipality to calculate IMI.",
    aimiTitle: "AIMI — Additional IMI",
    aimiDesc: "Applies to owners of residential urban properties and construction land with total VPT above €600,000 (or €1,200,000 for couples).",
    aimiTotalVptLabel: "Total VPT of all residential properties (€)",
    aimiTotalVptHint: "Include all residential urban properties and construction land you own",
    aimiFilingStatusLabel: "Filing status",
    aimiVacantLabel: "Includes vacant or ruined properties",
    aimiVacantHint: "Such properties do not benefit from the deduction",
    aimiResult: "AIMI due",
    aimiDeduction: "Deduction",
    aimiTaxableBase: "Taxable base",
    aimiPaymentNote: (month: string) => `Payment due: ${month}`,
    aimiZero: "Total VPT below the threshold — no AIMI due",
    exemptionTitle: "Check IMI Exemption",
    exemptionDesc: "Check if you qualify for a permanent exemption (low income) or temporary exemption (first home acquisition).",
    incomeLabel: "Household gross annual income (€)",
    incomeHint: "Total gross income of all household members",
    familyVptLabel: "Total VPT of all household properties (€)",
    familyVptHint: "Sum of VPT of all properties owned by the household",
    acqYearLabel: "Year of property acquisition",
    prevExLabel: "Previous temporary exemptions used (max 2)",
    permanentTitle: "Permanent Exemption (Art. 11-A CIMI)",
    temporaryTitle: "Temporary Exemption (Art. 46 EBF)",
    eligible: "You qualify for this exemption",
    notEligible: "You do not meet the requirements",
    temporaryDuration: (years: number) => `Exemption for ${years} years`,
    temporaryNote: "Note: some municipalities (Lei 56/2023) extend the period to 5 years. Check with your municipality.",
    disclaimer: "For informational purposes only, based on 2026 IMI tables. Municipal rates verified in market research conducted February 2026 — always confirm at Portal das Finanças. Consult a professional before making decisions.",
    // VPT Reassessment section
    vptSectionTitle: "VPT Reassessment Simulator",
    vptSectionDesc: "Estimate what your property VPT would be under 2026 coefficients. If lower than current, you can apply for a free reassessment at Portal das Finanças.",
    vptEvalYearLabel: "Year of last fiscal evaluation",
    vptClLabel: "Location coefficient (Cl)",
    vptClHint: "Shown on the caderneta predial — between 0.40 and 3.50",
    vptAaLabel: "Private gross area (Aa) in m²",
    vptAbLabel: "Dependent gross area (Ab) in m²",
    vptAbHint: "Garages, storage rooms, enclosed terraces, etc.",
    vptConstructionYearLabel: "Year of construction",
    vptAmenitiesLabel: "Property characteristics",
    vptPool: "Swimming pool",
    vptGarageLabel: "Individual garage",
    vptAcLabel: "Central air conditioning",
    vptGatedLabel: "Gated community",
    vptSingleFamilyLabel: "Single-family house",
    // VPT Result
    vptResultTitle: "VPT Reassessment Estimate",
    vptCurrentLabel: "Current VPT",
    vptNewLabel: "Estimated VPT (2026)",
    vptDiffLabel: "Difference",
    vptImiChangeLabel: "Annual IMI impact",
    vptRecommendRequest: "You may benefit from a reassessment — estimated VPT is lower than current.",
    vptRecommendCaution: "Caution: reassessment may increase your VPT and IMI.",
    vptNotEligible: "Reassessment not available yet — last evaluation was less than 3 years ago.",
    vptVcWarning: "Note: Vc increased 7.14% in 2026 (€665 → €712.50), which may inflate the estimate.",
    // Portfolio
    portfolioTitle: "Property Portfolio",
    portfolioDesc: "Calculate aggregate IMI for multiple properties and total residential VPT for AIMI purposes.",
    addProperty: "Add property",
    removeProperty: "Remove",
    propertyN: (n: number) => `Property ${n}`,
    portfolioTotal: "Total annual IMI",
    portfolioMonthly: "Monthly equivalent",
    portfolioResVpt: "Total residential VPT (AIMI base)",
    portfolioEmpty: "Add at least one property with VPT and municipality.",
  },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatEuro(value: number): string {
  return value.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}

function formatPercent(value: number, decimals = 2): string {
  return (value * 100).toLocaleString("pt-PT", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) + "\u00a0%";
}

function parseNumericInput(raw: string): number {
  const cleaned = raw.replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function formatDatePt(iso: string): string {
  const [year, month, day] = iso.split("-");
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const m = parseInt(month ?? "1", 10) - 1;
  return `${day} ${months[m]} ${year}`;
}

function formatDateEn(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ImiFamiliarBadge({
  status,
  deduction,
  s,
}: {
  status: ImiResult["imiFamiliarStatus"];
  deduction: number;
  s: (typeof STRINGS)["pt"] | (typeof STRINGS)["en"];
}) {
  if (status === "applied") {
    return (
      <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        {s.imiFamiliarApplied(formatEuro(deduction))}
      </div>
    );
  }
  const msgs: Record<ImiResult["imiFamiliarStatus"], string> = {
    applied:                "",
    not_participant:        s.imiFamiliarNotParticipant,
    not_hpp:                s.imiFamiliarNotHpp,
    no_dependents:          s.imiFamiliarNoDeps,
    insufficient_dependents: s.imiFamiliarInsufficientDeps,
  };
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-3 py-1.5 text-xs text-neutral-500">
      <XCircle className="h-3.5 w-3.5 shrink-0" />
      {msgs[status]}
    </div>
  );
}

function PaymentTable({
  installments,
  locale,
}: {
  installments: ImiResult["installments"];
  locale: Locale;
}) {
  if (installments.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200">
      <table className="w-full text-sm">
        <tbody>
          {installments.map((inst) => (
            <tr key={inst.dueDate} className="border-b border-neutral-100 last:border-0">
              <td className="py-2 pl-3 text-neutral-600">
                {locale === "pt" ? inst.label : inst.labelEn}
              </td>
              <td className="py-2 pr-3 text-right font-medium text-neutral-900">
                {formatEuro(inst.amount)}
              </td>
              <td className="py-2 pr-3 text-right text-neutral-400">
                <span className="flex items-center justify-end gap-1">
                  <Calendar className="h-3 w-3" />
                  {locale === "pt" ? formatDatePt(inst.dueDate) : formatDateEn(inst.dueDate)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AimiResultCard({
  result,
  s,
}: {
  result: AimiResult;
  s: (typeof STRINGS)["pt"] | (typeof STRINGS)["en"];
}) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="mb-3 text-sm font-semibold text-amber-900">{s.aimiTitle}</p>
      {result.aimi === 0 ? (
        <p className="text-sm text-amber-700">{s.aimiZero}</p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-amber-700">{s.aimiResult}</span>
            <span className="text-xl font-bold text-amber-900">{formatEuro(result.aimi)}</span>
          </div>
          <div className="space-y-1 text-xs text-amber-700">
            <div className="flex justify-between">
              <span>{s.aimiDeduction}</span>
              <span>− {formatEuro(result.deduction)}</span>
            </div>
            <div className="flex justify-between">
              <span>{s.aimiTaxableBase}</span>
              <span>{formatEuro(result.taxableBase)}</span>
            </div>
          </div>
          {result.bands.length > 0 && (
            <div className="mt-2 space-y-1 border-t border-amber-200 pt-2">
              {result.bands.map((band, i) => (
                <div key={i} className="flex justify-between text-xs text-amber-700">
                  <span>{formatPercent(band.rate)}</span>
                  <span>{formatEuro(band.tax)}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-amber-600">
            {s.aimiPaymentNote(result.paymentMonth)}
          </p>
        </div>
      )}
    </div>
  );
}

function ExemptionCard({
  result,
  s,
}: {
  result: ExemptionResult;
  s: (typeof STRINGS)["pt"] | (typeof STRINGS)["en"];
}) {
  const perm = result.permanentExemption;
  const temp = result.temporaryExemption;

  return (
    <div className="space-y-3">
      {/* Permanent */}
      <div className={cn(
        "rounded-lg border p-3",
        perm.eligible ? "border-emerald-200 bg-emerald-50" : "border-neutral-200 bg-neutral-50"
      )}>
        <div className="flex items-center gap-2 mb-1">
          {perm.eligible
            ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            : <XCircle className="h-4 w-4 text-neutral-400" />
          }
          <p className="text-sm font-medium text-neutral-800">{s.permanentTitle}</p>
        </div>
        {perm.eligible ? (
          <p className="text-xs text-emerald-700">{s.eligible}</p>
        ) : (
          <ul className="mt-1 space-y-0.5">
            {(s === STRINGS.pt ? perm.failedConditionsPt : perm.failedConditionsEn).map((cond, i) => (
              <li key={i} className="text-xs text-neutral-500">• {cond}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Temporary */}
      <div className={cn(
        "rounded-lg border p-3",
        temp.eligible ? "border-emerald-200 bg-emerald-50" : "border-neutral-200 bg-neutral-50"
      )}>
        <div className="flex items-center gap-2 mb-1">
          {temp.eligible
            ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            : <XCircle className="h-4 w-4 text-neutral-400" />
          }
          <p className="text-sm font-medium text-neutral-800">{s.temporaryTitle}</p>
        </div>
        {temp.eligible && temp.durationYears !== null ? (
          <div>
            <p className="text-xs text-emerald-700">{s.temporaryDuration(temp.durationYears)}</p>
            <p className="mt-1 text-xs text-emerald-600">{s.temporaryNote}</p>
          </div>
        ) : (
          <ul className="mt-1 space-y-0.5">
            {(s === STRINGS.pt ? temp.failedConditionsPt : temp.failedConditionsEn).map((cond, i) => (
              <li key={i} className="text-xs text-neutral-500">• {cond}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function VptResultCard({
  result,
  s,
}: {
  result: VptResult;
  s: (typeof STRINGS)["pt"] | (typeof STRINGS)["en"];
}) {
  const isIncrease = result.difference > 0;
  const borderBg =
    result.recommendation === "request"
      ? "border-emerald-200 bg-emerald-50"
      : result.recommendation === "caution"
      ? "border-amber-200 bg-amber-50"
      : "border-neutral-200 bg-neutral-50";
  const titleColor =
    result.recommendation === "request"
      ? "text-emerald-900"
      : result.recommendation === "caution"
      ? "text-amber-900"
      : "text-neutral-700";
  const descColor =
    result.recommendation === "request"
      ? "text-emerald-700"
      : result.recommendation === "caution"
      ? "text-amber-700"
      : "text-neutral-500";

  return (
    <div className={cn("rounded-lg border p-4 space-y-3", borderBg)}>
      <p className={cn("text-sm font-semibold", titleColor)}>{s.vptResultTitle}</p>
      <p className={cn("text-xs", descColor)}>
        {result.recommendation === "request" && s.vptRecommendRequest}
        {result.recommendation === "caution" && s.vptRecommendCaution}
        {result.recommendation === "not_eligible" && s.vptNotEligible}
      </p>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-neutral-500">{s.vptCurrentLabel}</span>
          <span className="font-medium text-neutral-800">{formatEuro(result.currentVpt)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-neutral-500">{s.vptNewLabel}</span>
          <span className="font-medium text-neutral-800">{formatEuro(result.recalculatedVpt)}</span>
        </div>
        <div className="flex justify-between text-xs border-t border-black/10 pt-1.5">
          <span className="text-neutral-500">{s.vptDiffLabel}</span>
          <span className={cn("font-semibold", isIncrease ? "text-red-600" : "text-emerald-700")}>
            {result.difference >= 0 ? "+" : ""}
            {formatEuro(result.difference)}
          </span>
        </div>
        {result.annualImiChange !== 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-neutral-500">{s.vptImiChangeLabel}</span>
            <span className={cn("font-medium", result.annualImiChange > 0 ? "text-red-600" : "text-emerald-700")}>
              {result.annualImiChange >= 0 ? "+" : ""}
              {formatEuro(result.annualImiChange)}/ano
            </span>
          </div>
        )}
      </div>
      <div className="border-t border-black/10 pt-2 font-mono text-[10px] text-neutral-400">
        Vc {result.vc} × A {result.area.toFixed(1)}m² × Cl {result.cl.toFixed(2)} × Cq{" "}
        {result.cq.toFixed(2)} × Cv {result.cv.toFixed(2)}
      </div>
      {result.warningVcIncrease && (
        <div className="flex items-start gap-1.5 text-xs text-amber-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{s.vptVcWarning}</span>
        </div>
      )}
    </div>
  );
}

function PortfolioSummaryCard({
  result,
  s,
}: {
  result: PortfolioResult;
  s: (typeof STRINGS)["pt"] | (typeof STRINGS)["en"];
}) {
  return (
    <Card>
      <CardHeader>{s.portfolioTitle}</CardHeader>
      <CardBody className="space-y-3">
        <div className="space-y-1.5">
          {result.propertyResults.map((pr, i) => (
            <div key={pr.id} className="flex justify-between text-sm">
              <span className="text-neutral-600">{s.propertyN(i + 1)}</span>
              <span className="font-medium text-neutral-900">{formatEuro(pr.imiResult.netImi)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2 border-t border-neutral-200 pt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-neutral-700">{s.portfolioTotal}</span>
            <span className="text-2xl font-bold text-primary-900">
              {formatEuro(result.totalAnnualImi)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-neutral-500">
            <span>{s.portfolioMonthly}</span>
            <span>{formatEuro(result.totalMonthlyEquivalent)}/mês</span>
          </div>
          {result.totalResidentialVpt > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-neutral-500">{s.portfolioResVpt}</span>
              <span
                className={cn(
                  "font-medium",
                  result.totalResidentialVpt >= 600_000
                    ? "font-semibold text-amber-700"
                    : "text-neutral-700",
                )}
              >
                {formatEuro(result.totalResidentialVpt)}
              </span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ImiCalculator({ locale }: { locale: Locale }) {
  const s = STRINGS[locale];
  const [state, setState] = useImiParams();

  const municipioOptions = useMemo(() => {
    if (!state.distrito) return [];
    return getMunicipiosByDistrito(state.distrito);
  }, [state.distrito]);

  // Per-parish rate options — only populated for Espinho and Gondomar
  const selectedMunicipio = useMemo(
    () => (state.municipioId ? getMunicipio(state.municipioId) : undefined),
    [state.municipioId],
  );
  const frequesiaOptions = selectedMunicipio?.taxasFreguesia ?? [];

  const vpt = parseNumericInput(state.vptInput);
  const hasVpt = vpt > 0 && state.municipioId !== "";

  // Resolve per-parish rate override when applicable
  const selectedFreguesia = frequesiaOptions.find((f) => f.id === state.frequesiaId);
  const overrideRate = selectedFreguesia?.rate;

  // Core IMI result
  const imiResult = useMemo<ImiResult | null>(() => {
    if (!hasVpt) return null;
    return calculateImi({
      vpt,
      municipioId: state.municipioId,
      propertyType: state.propertyType,
      propertyPurpose: state.propertyPurpose,
      dependents: state.dependents,
      overrideRate,
    });
  }, [hasVpt, vpt, state.municipioId, state.propertyType, state.propertyPurpose, state.dependents, overrideRate]);

  // AIMI result
  const aimiVpt = parseNumericInput(state.aimiTotalVptInput) || vpt;
  const aimiResult = useMemo<AimiResult | null>(() => {
    if (!state.showAimiSection || aimiVpt <= 0) return null;
    return calculateAimi({
      totalResidentialVpt: aimiVpt,
      filingStatus: state.aimiFilingStatus,
      includesVacantOrRuins: state.aimiIncludesVacant,
    });
  }, [state.showAimiSection, aimiVpt, state.aimiFilingStatus, state.aimiIncludesVacant]);

  // Exemption result
  const householdIncome = parseNumericInput(state.householdIncomeInput);
  const familyVpt = parseNumericInput(state.totalFamilyVptInput) || vpt;
  const exemptionResult = useMemo<ExemptionResult | null>(() => {
    if (!state.showExemptionSection || !hasVpt) return null;
    return checkExemptions({
      vpt,
      municipioId: state.municipioId,
      isHpp: state.propertyPurpose === "hpp",
      householdGrossIncome: householdIncome,
      totalFamilyVpt: familyVpt,
      acquisitionYear: state.acquisitionYear,
      previousExemptionsUsed: state.previousExemptionsUsed,
    });
  }, [state.showExemptionSection, hasVpt, vpt, state.municipioId, state.propertyPurpose, householdIncome, familyVpt, state.acquisitionYear, state.previousExemptionsUsed]);

  // Auto-open AIMI section when VPT is high enough
  const shouldAutoOpenAimi = vpt >= 600_000 && !state.showAimiSection;

  // VPT reassessment
  const vptCl = parseNumericInput(state.vptClInput);
  const vptAa = parseNumericInput(state.vptAaInput);
  const vptAb = parseNumericInput(state.vptAbInput);
  const hasVptInputs = vptCl > 0 && vptAa > 0;

  const vptResult = useMemo<VptResult | null>(() => {
    if (!state.showVptSection || !hasVpt || !hasVptInputs) return null;
    return calculateVpt({
      currentVpt: vpt,
      lastEvalYear: state.vptLastEvalYear,
      cl: vptCl,
      aa: vptAa,
      ab: vptAb,
      constructionYear: state.vptConstructionYear,
      amenities: {
        pool:              state.vptPool,
        individualGarage:  state.vptGarage,
        centralAc:         state.vptAc,
        gatedCommunity:    state.vptGated,
        singleFamilyHouse: state.vptSingleFamily,
      },
      municipioRate: getMunicipio(state.municipioId)?.rate,
    });
  }, [state.showVptSection, hasVpt, hasVptInputs, vpt, state.vptLastEvalYear, vptCl, vptAa, vptAb, state.vptConstructionYear, state.vptPool, state.vptGarage, state.vptAc, state.vptGated, state.vptSingleFamily, state.municipioId]);

  // Portfolio
  const portfolioResult = useMemo<PortfolioResult | null>(() => {
    if (!state.showPortfolioSection || state.portfolioProperties.length === 0) return null;
    const properties = state.portfolioProperties
      .filter((p) => p.vptInput !== "" && p.municipioId !== "")
      .map((p) => ({
        id:              p.id,
        vpt:             parseNumericInput(p.vptInput),
        municipioId:     p.municipioId,
        propertyType:    p.propertyType,
        propertyPurpose: p.propertyPurpose,
        dependents:      p.dependents,
      }));
    if (properties.length === 0) return null;
    return calculatePortfolio(properties);
  }, [state.showPortfolioSection, state.portfolioProperties]);

  function updatePortfolioProperty(idx: number, updates: Partial<PortfolioPropertyState>) {
    const updated = state.portfolioProperties.map((p, i) =>
      i === idx ? { ...p, ...updates } : p,
    );
    setState({ ...state, portfolioProperties: updated, showPortfolioSection: true });
  }

  function addPortfolioProperty() {
    if (state.portfolioProperties.length >= 10) return;
    const newProp: PortfolioPropertyState = {
      id:              Math.random().toString(36).slice(2),
      vptInput:        "",
      distrito:        "",
      municipioId:     "",
      propertyType:    "urbano",
      propertyPurpose: "hpp",
      dependents:      0,
    };
    setState({
      ...state,
      portfolioProperties: [...state.portfolioProperties, newProp],
      showPortfolioSection: true,
    });
  }

  function removePortfolioProperty(idx: number) {
    setState({
      ...state,
      portfolioProperties: state.portfolioProperties.filter((_, i) => i !== idx),
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{s.title}</h1>
        <p className="mt-1 text-sm text-neutral-500">{s.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Left: Form ─────────────────────────────────────────────────── */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>{s.formTitle}</CardHeader>
            <CardBody className="space-y-4">
              {/* VPT */}
              <div className="space-y-1.5">
                <Input
                  label={s.vptLabel}
                  hint={s.vptHint}
                  placeholder={s.vptPlaceholder}
                  inputMode="numeric"
                  value={state.vptInput}
                  onChange={(e) =>
                    setState({ ...state, vptInput: e.target.value })
                  }
                />
                <Collapsible
                  trigger={
                    <span className="text-xs text-blue-600 hover:text-blue-700">
                      {s.vptHowTitle}
                    </span>
                  }
                  triggerClassName="py-0.5"
                  contentClassName="mt-1.5 rounded-md bg-blue-50 px-3 py-2.5"
                >
                  <ol className="list-decimal space-y-1 pl-4 text-xs text-blue-800">
                    {s.vptHowSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </Collapsible>
              </div>

              {/* Distrito */}
              <Select
                label={s.distritoLabel}
                value={state.distrito}
                onChange={(e) =>
                  setState({ ...state, distrito: e.target.value, municipioId: "", frequesiaId: "" })
                }
                options={[
                  { value: "", label: s.distritoPlaceholder },
                  ...DISTRITOS.map((d) => ({ value: d, label: d })),
                ]}
              />

              {/* Município */}
              <Select
                label={s.municipioLabel}
                value={state.municipioId}
                onChange={(e) =>
                  setState({ ...state, municipioId: e.target.value, frequesiaId: "" })
                }
                disabled={!state.distrito}
                options={[
                  { value: "", label: s.municipioPlaceholder },
                  ...municipioOptions.map((m) => ({ value: m.id, label: m.name })),
                ]}
              />

              {/* Freguesia — only shown for municipalities with per-parish rates */}
              {frequesiaOptions.length > 0 && (
                <Select
                  label={s.frequesiaLabel}
                  value={state.frequesiaId}
                  onChange={(e) => setState({ ...state, frequesiaId: e.target.value })}
                  options={[
                    { value: "", label: s.frequesiaPlaceholder },
                    ...frequesiaOptions.map((f) => ({ value: f.id, label: f.name })),
                  ]}
                />
              )}

              {/* Property type */}
              <div>
                <p className="mb-1.5 text-sm font-medium text-neutral-700">{s.propertyTypeLabel}</p>
                <PillToggle
                  options={PROPERTY_TYPE_OPTIONS.map((o) => ({
                    value: o.value,
                    label: locale === "pt" ? o.labelPt : o.labelEn,
                  }))}
                  value={state.propertyType}
                  onChange={(v) =>
                    setState({ ...state, propertyType: v as typeof state.propertyType })
                  }
                />
              </div>

              {/* Property purpose */}
              <div>
                <p className="mb-1.5 text-sm font-medium text-neutral-700">{s.propertyPurposeLabel}</p>
                <PillToggle
                  options={PROPERTY_PURPOSE_OPTIONS.map((o) => ({
                    value: o.value,
                    label: locale === "pt" ? o.labelPt : o.labelEn,
                  }))}
                  value={state.propertyPurpose}
                  onChange={(v) =>
                    setState({ ...state, propertyPurpose: v as typeof state.propertyPurpose })
                  }
                />
              </div>

              {/* Dependents — show only for HPP */}
              {state.propertyPurpose === "hpp" && (
                <Select
                  label={s.dependentsLabel}
                  hint={s.dependentsHint}
                  value={String(state.dependents)}
                  onChange={(e) =>
                    setState({
                      ...state,
                      dependents: parseInt(e.target.value, 10) as typeof state.dependents,
                    })
                  }
                  options={[
                    { value: "0", label: "0" },
                    { value: "1", label: "1" },
                    { value: "2", label: "2" },
                    { value: "3", label: "3+" },
                  ]}
                />
              )}
            </CardBody>
          </Card>

          {/* ── Exemption checker ───────────────────────────────────────── */}
          <Card>
            <Collapsible
              defaultOpen={state.showExemptionSection}
              trigger={
                <div className="flex items-center gap-2 px-4 py-3">
                  <span className="text-sm font-semibold text-neutral-800">{s.exemptionTitle}</span>
                </div>
              }
              triggerClassName="w-full"
              contentClassName="px-4 pb-4 space-y-4"
              className="divide-y divide-neutral-100"
            >
              <p className="text-xs text-neutral-500 pt-2">{s.exemptionDesc}</p>
              <div className="pt-3 space-y-4">
                <Input
                  label={s.incomeLabel}
                  hint={s.incomeHint}
                  inputMode="numeric"
                  placeholder="0"
                  value={state.householdIncomeInput}
                  onChange={(e) =>
                    setState({ ...state, householdIncomeInput: e.target.value, showExemptionSection: true })
                  }
                />
                <Input
                  label={s.familyVptLabel}
                  hint={s.familyVptHint}
                  inputMode="numeric"
                  placeholder="0"
                  value={state.totalFamilyVptInput}
                  onChange={(e) =>
                    setState({ ...state, totalFamilyVptInput: e.target.value, showExemptionSection: true })
                  }
                />
                <Select
                  label={s.acqYearLabel}
                  value={String(state.acquisitionYear)}
                  onChange={(e) =>
                    setState({
                      ...state,
                      acquisitionYear: parseInt(e.target.value, 10),
                      showExemptionSection: true,
                    })
                  }
                  options={Array.from({ length: 7 }, (_, i) => {
                    const y = 2026 - i;
                    return { value: String(y), label: String(y) };
                  })}
                />
                <Select
                  label={s.prevExLabel}
                  value={String(state.previousExemptionsUsed)}
                  onChange={(e) =>
                    setState({
                      ...state,
                      previousExemptionsUsed: parseInt(e.target.value, 10) as 0 | 1 | 2,
                      showExemptionSection: true,
                    })
                  }
                  options={[
                    { value: "0", label: "0" },
                    { value: "1", label: "1" },
                    { value: "2", label: "2" },
                  ]}
                />
              </div>
            </Collapsible>
          </Card>

          {/* ── AIMI section ─────────────────────────────────────────────── */}
          <Card>
            <Collapsible
              defaultOpen={state.showAimiSection || shouldAutoOpenAimi}
              trigger={
                <div className="flex items-center gap-2 px-4 py-3">
                  <span className="text-sm font-semibold text-neutral-800">{s.aimiTitle}</span>
                  {vpt >= 600_000 && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      {locale === "pt" ? "Aplicável" : "Applicable"}
                    </span>
                  )}
                </div>
              }
              triggerClassName="w-full"
              contentClassName="px-4 pb-4 space-y-4"
              className="divide-y divide-neutral-100"
            >
              <p className="text-xs text-neutral-500 pt-2">{s.aimiDesc}</p>
              <div className="pt-3 space-y-4">
                <Input
                  label={s.aimiTotalVptLabel}
                  hint={s.aimiTotalVptHint}
                  inputMode="numeric"
                  placeholder="0"
                  value={state.aimiTotalVptInput}
                  onChange={(e) =>
                    setState({ ...state, aimiTotalVptInput: e.target.value, showAimiSection: true })
                  }
                />
                <div>
                  <p className="mb-1.5 text-sm font-medium text-neutral-700">{s.aimiFilingStatusLabel}</p>
                  <PillToggle
                    options={FILING_STATUS_OPTIONS.map((o) => ({
                      value: o.value,
                      label: locale === "pt" ? o.labelPt : o.labelEn,
                    }))}
                    value={state.aimiFilingStatus}
                    onChange={(v) =>
                      setState({ ...state, aimiFilingStatus: v as typeof state.aimiFilingStatus, showAimiSection: true })
                    }
                  />
                </div>
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    checked={state.aimiIncludesVacant}
                    onChange={(e) =>
                      setState({ ...state, aimiIncludesVacant: e.target.checked, showAimiSection: true })
                    }
                  />
                  <div>
                    <p className="text-sm font-medium text-neutral-700">{s.aimiVacantLabel}</p>
                    <p className="text-xs text-neutral-500">{s.aimiVacantHint}</p>
                  </div>
                </label>
              </div>
            </Collapsible>
          </Card>
          {/* ── VPT Reassessment section ──────────────────────────────────── */}
          <Card>
            <Collapsible
              defaultOpen={state.showVptSection}
              trigger={
                <div className="flex items-center gap-2 px-4 py-3">
                  <span className="text-sm font-semibold text-neutral-800">{s.vptSectionTitle}</span>
                </div>
              }
              triggerClassName="w-full"
              contentClassName="px-4 pb-4 space-y-4"
              className="divide-y divide-neutral-100"
            >
              <p className="pt-2 text-xs text-neutral-500">{s.vptSectionDesc}</p>
              <div className="space-y-4 pt-3">
                <Select
                  label={s.vptEvalYearLabel}
                  value={String(state.vptLastEvalYear)}
                  onChange={(e) =>
                    setState({ ...state, vptLastEvalYear: parseInt(e.target.value, 10), showVptSection: true })
                  }
                  options={Array.from({ length: 27 }, (_, i) => {
                    const y = 2026 - i;
                    return { value: String(y), label: String(y) };
                  })}
                />
                <Input
                  label={s.vptClLabel}
                  hint={s.vptClHint}
                  inputMode="decimal"
                  placeholder="1.00"
                  value={state.vptClInput}
                  onChange={(e) =>
                    setState({ ...state, vptClInput: e.target.value, showVptSection: true })
                  }
                />
                <Input
                  label={s.vptAaLabel}
                  inputMode="numeric"
                  placeholder="100"
                  value={state.vptAaInput}
                  onChange={(e) =>
                    setState({ ...state, vptAaInput: e.target.value, showVptSection: true })
                  }
                />
                <Input
                  label={s.vptAbLabel}
                  hint={s.vptAbHint}
                  inputMode="numeric"
                  placeholder="0"
                  value={state.vptAbInput}
                  onChange={(e) =>
                    setState({ ...state, vptAbInput: e.target.value, showVptSection: true })
                  }
                />
                <Select
                  label={s.vptConstructionYearLabel}
                  value={String(state.vptConstructionYear)}
                  onChange={(e) =>
                    setState({ ...state, vptConstructionYear: parseInt(e.target.value, 10), showVptSection: true })
                  }
                  options={Array.from({ length: 127 }, (_, i) => {
                    const y = 2026 - i;
                    return { value: String(y), label: String(y) };
                  })}
                />
                <div>
                  <p className="mb-2 text-sm font-medium text-neutral-700">{s.vptAmenitiesLabel}</p>
                  <div className="space-y-2">
                    {(
                      [
                        { checked: state.vptPool,         setField: (v: boolean) => setState({ ...state, vptPool:         v, showVptSection: true }), label: s.vptPool },
                        { checked: state.vptGarage,       setField: (v: boolean) => setState({ ...state, vptGarage:       v, showVptSection: true }), label: s.vptGarageLabel },
                        { checked: state.vptAc,           setField: (v: boolean) => setState({ ...state, vptAc:           v, showVptSection: true }), label: s.vptAcLabel },
                        { checked: state.vptGated,        setField: (v: boolean) => setState({ ...state, vptGated:        v, showVptSection: true }), label: s.vptGatedLabel },
                        { checked: state.vptSingleFamily, setField: (v: boolean) => setState({ ...state, vptSingleFamily: v, showVptSection: true }), label: s.vptSingleFamilyLabel },
                      ] as const
                    ).map(({ checked, setField, label }) => (
                      <label key={label} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          checked={checked}
                          onChange={(e) => setField(e.target.checked)}
                        />
                        <span className="text-sm text-neutral-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Collapsible>
          </Card>

          {/* ── Portfolio section ──────────────────────────────────────────── */}
          <Card>
            <Collapsible
              defaultOpen={state.showPortfolioSection}
              trigger={
                <div className="flex items-center gap-2 px-4 py-3">
                  <span className="text-sm font-semibold text-neutral-800">{s.portfolioTitle}</span>
                  {state.portfolioProperties.length > 0 && (
                    <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700">
                      {state.portfolioProperties.length}
                    </span>
                  )}
                </div>
              }
              triggerClassName="w-full"
              contentClassName="px-4 pb-4 space-y-4"
              className="divide-y divide-neutral-100"
            >
              <p className="pt-2 text-xs text-neutral-500">{s.portfolioDesc}</p>
              <div className="space-y-4 pt-3">
                {state.portfolioProperties.map((prop, idx) => (
                  <div key={prop.id} className="space-y-3 rounded-lg border border-neutral-200 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-700">
                        {s.propertyN(idx + 1)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePortfolioProperty(idx)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {s.removeProperty}
                      </button>
                    </div>
                    <Input
                      label={s.vptLabel}
                      inputMode="numeric"
                      placeholder={s.vptPlaceholder}
                      value={prop.vptInput}
                      onChange={(e) => updatePortfolioProperty(idx, { vptInput: e.target.value })}
                    />
                    <Select
                      label={s.distritoLabel}
                      value={prop.distrito}
                      onChange={(e) =>
                        updatePortfolioProperty(idx, { distrito: e.target.value, municipioId: "" })
                      }
                      options={[
                        { value: "", label: s.distritoPlaceholder },
                        ...DISTRITOS.map((d) => ({ value: d, label: d })),
                      ]}
                    />
                    <Select
                      label={s.municipioLabel}
                      value={prop.municipioId}
                      disabled={!prop.distrito}
                      onChange={(e) => updatePortfolioProperty(idx, { municipioId: e.target.value })}
                      options={[
                        { value: "", label: s.municipioPlaceholder },
                        ...(prop.distrito ? getMunicipiosByDistrito(prop.distrito) : []).map((m) => ({
                          value: m.id,
                          label: m.name,
                        })),
                      ]}
                    />
                    <div>
                      <p className="mb-1.5 text-sm font-medium text-neutral-700">{s.propertyTypeLabel}</p>
                      <PillToggle
                        options={PROPERTY_TYPE_OPTIONS.map((o) => ({
                          value: o.value,
                          label: locale === "pt" ? o.labelPt : o.labelEn,
                        }))}
                        value={prop.propertyType}
                        onChange={(v) =>
                          updatePortfolioProperty(idx, { propertyType: v as ImiPropertyType })
                        }
                      />
                    </div>
                    <div>
                      <p className="mb-1.5 text-sm font-medium text-neutral-700">{s.propertyPurposeLabel}</p>
                      <PillToggle
                        options={PROPERTY_PURPOSE_OPTIONS.map((o) => ({
                          value: o.value,
                          label: locale === "pt" ? o.labelPt : o.labelEn,
                        }))}
                        value={prop.propertyPurpose}
                        onChange={(v) =>
                          updatePortfolioProperty(idx, { propertyPurpose: v as ImiPropertyPurpose })
                        }
                      />
                    </div>
                    {prop.propertyPurpose === "hpp" && (
                      <Select
                        label={s.dependentsLabel}
                        value={String(prop.dependents)}
                        onChange={(e) =>
                          updatePortfolioProperty(idx, {
                            dependents: parseInt(e.target.value, 10) as 0 | 1 | 2 | 3,
                          })
                        }
                        options={[
                          { value: "0", label: "0" },
                          { value: "1", label: "1" },
                          { value: "2", label: "2" },
                          { value: "3", label: "3+" },
                        ]}
                      />
                    )}
                  </div>
                ))}

                {state.portfolioProperties.length === 0 && (
                  <p className="text-center text-xs text-neutral-400">{s.portfolioEmpty}</p>
                )}

                {state.portfolioProperties.length < 10 && (
                  <button
                    type="button"
                    onClick={addPortfolioProperty}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-neutral-300 py-2.5 text-sm text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700"
                  >
                    <Plus className="h-4 w-4" />
                    {s.addProperty}
                  </button>
                )}
              </div>
            </Collapsible>
          </Card>
        </div>

        {/* ── Right: Results ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          {!hasVpt ? (
            <Card>
              <CardBody>
                <p className="text-center text-sm text-neutral-400">{s.emptyState}</p>
              </CardBody>
            </Card>
          ) : imiResult ? (
            <>
              {/* ── Primary IMI result ── */}
              <Card>
                <CardHeader>{s.resultsTitle}</CardHeader>
                <CardBody className="space-y-4">
                  {/* Vacant alert */}
                  {imiResult.vacantSurchargeMultiplier > 1 && (
                    <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      {s.vacantAlert(imiResult.vacantSurchargeMultiplier)}
                    </div>
                  )}

                  {/* Hero: annual IMI */}
                  <div className="rounded-xl bg-primary-50 px-5 py-4">
                    <p className="text-xs font-medium text-primary-700 uppercase tracking-wide">
                      {s.annualImi}
                    </p>
                    <p className="mt-1 text-4xl font-bold text-primary-900">
                      {formatEuro(imiResult.netImi)}
                    </p>
                    <p className="mt-1 text-sm text-primary-600">
                      {s.monthlyEquiv}: {formatEuro(imiResult.monthlyEquivalent)}/mês
                    </p>
                  </div>

                  {/* Formula row */}
                  <div className="rounded-lg bg-neutral-50 px-4 py-3 text-xs text-neutral-500">
                    <span className="font-medium text-neutral-700">{s.formula}: </span>
                    {formatEuro(vpt)} × {formatPercent(imiResult.appliedRate)}
                    {imiResult.imiFamiliarDeduction > 0 && (
                      <> − {formatEuro(imiResult.imiFamiliarDeduction)}</>
                    )}
                    {" = "}
                    <span className="font-semibold text-neutral-900">{formatEuro(imiResult.netImi)}</span>
                  </div>

                  {/* Rate context */}
                  <p className="text-xs text-neutral-400">
                    {s.rateContext(imiResult.municipioName, formatPercent(imiResult.appliedRate / (imiResult.vacantSurchargeMultiplier > 1 ? imiResult.vacantSurchargeMultiplier : 1)))}
                  </p>

                  {/* IMI Familiar badge */}
                  <ImiFamiliarBadge
                    status={imiResult.imiFamiliarStatus}
                    deduction={imiResult.imiFamiliarDeduction}
                    s={s}
                  />

                  {/* Payment schedule */}
                  <div>
                    <p className="mb-2 text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                      {s.paymentTitle}
                    </p>
                    <PaymentTable installments={imiResult.installments} locale={locale} />
                  </div>
                </CardBody>
              </Card>

              {/* ── AIMI result ── */}
              {aimiResult && (
                <AimiResultCard result={aimiResult} s={s} />
              )}

              {/* ── Exemption result ── */}
              {exemptionResult && (
                <Card>
                  <CardHeader>{s.exemptionTitle}</CardHeader>
                  <CardBody>
                    <ExemptionCard result={exemptionResult} s={s} />
                  </CardBody>
                </Card>
              )}

              {/* ── VPT reassessment result ── */}
              {vptResult && (
                <VptResultCard result={vptResult} s={s} />
              )}

              {/* ── Disclaimer ── */}
              <p className="text-xs text-neutral-400 leading-relaxed">{s.disclaimer}</p>
            </>
          ) : null}

          {/* ── Portfolio result (shown independently of main VPT form) ── */}
          {portfolioResult && (
            <PortfolioSummaryCard result={portfolioResult} s={s} />
          )}
        </div>
      </div>
    </div>
  );
}
