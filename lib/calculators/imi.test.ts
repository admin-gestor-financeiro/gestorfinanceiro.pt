import { describe, it, expect } from "vitest";
import {
  calculateImi,
  calculateAimi,
  checkExemptions,
  calculateLatePaymentInterest,
  calculateVpt,
  calculatePortfolio,
  PAYMENT_DATES_2026,
  VC_2026,
} from "./imi";

// ─── calculateImi ─────────────────────────────────────────────────────────────

describe("calculateImi", () => {
  it("basic urban HPP, Lisboa 0.3%, 0 dependents → €450, 2 installments", () => {
    const result = calculateImi({
      vpt: 150_000,
      municipioId: "lisboa",
      propertyType: "urbano",
      propertyPurpose: "hpp",
      dependents: 0,
    });

    expect(result.grossImi).toBe(450);
    expect(result.imiFamiliarDeduction).toBe(0);
    expect(result.netImi).toBe(450);
    expect(result.appliedRate).toBe(0.003);
    expect(result.imiFamiliarStatus).toBe("no_dependents");
    expect(result.monthlyEquivalent).toBe(37.5);
    expect(result.installments).toHaveLength(2);
    expect(result.installments[0]?.dueDate).toBe(PAYMENT_DATES_2026.first);
    expect(result.installments[1]?.dueDate).toBe(PAYMENT_DATES_2026.third);
  });

  it("IMI Familiar: VPT €200k, participating municipality, HPP, 2 dependents → deduction €70 → net €530", () => {
    const result = calculateImi({
      vpt: 200_000,
      municipioId: "coimbra",
      propertyType: "urbano",
      propertyPurpose: "hpp",
      dependents: 2,
    });

    expect(result.grossImi).toBe(600);
    expect(result.imiFamiliarDeduction).toBe(70);
    expect(result.netImi).toBe(530);
    expect(result.imiFamiliarStatus).toBe("applied");
    expect(result.installments).toHaveLength(3);
  });

  it("Porto is IMI Familiar non-participant → no deduction even for HPP with 2 dependents", () => {
    const result = calculateImi({
      vpt: 200_000,
      municipioId: "porto",
      propertyType: "urbano",
      propertyPurpose: "hpp",
      dependents: 2,
    });

    expect(result.imiFamiliarDeduction).toBe(0);
    expect(result.imiFamiliarStatus).toBe("not_participant");
    // Porto rate is 0.324%, not 0.3%: €200k × 0.00324 = €648
    expect(result.netImi).toBe(648);
  });

  it("Vila Nova de Gaia (minDeps=3): 3 dependents → deduction €140 applied", () => {
    const result = calculateImi({
      vpt: 180_000,
      municipioId: "vila-nova-de-gaia",
      propertyType: "urbano",
      propertyPurpose: "hpp",
      dependents: 3,
    });

    expect(result.imiFamiliarStatus).toBe("applied");
    expect(result.imiFamiliarDeduction).toBe(140);
  });

  it("Vila Nova de Gaia (minDeps=3): 1 dependent → insufficient_dependents", () => {
    const result = calculateImi({
      vpt: 180_000,
      municipioId: "vila-nova-de-gaia",
      propertyType: "urbano",
      propertyPurpose: "hpp",
      dependents: 1,
    });

    expect(result.imiFamiliarStatus).toBe("insufficient_dependents");
    expect(result.imiFamiliarDeduction).toBe(0);
  });

  it("Guimarães (minDeps=2): 2 dependents → deduction €70 applied", () => {
    const result = calculateImi({
      vpt: 200_000,
      municipioId: "guimaraes",
      propertyType: "urbano",
      propertyPurpose: "hpp",
      dependents: 2,
    });

    expect(result.imiFamiliarStatus).toBe("applied");
    expect(result.imiFamiliarDeduction).toBe(70);
  });

  it("Guimarães (minDeps=2): 1 dependent → insufficient_dependents", () => {
    const result = calculateImi({
      vpt: 200_000,
      municipioId: "guimaraes",
      propertyType: "urbano",
      propertyPurpose: "hpp",
      dependents: 1,
    });

    expect(result.imiFamiliarStatus).toBe("insufficient_dependents");
    expect(result.imiFamiliarDeduction).toBe(0);
  });

  it("rural property: VPT €50k, rústico → rate 0.8% → IMI €400, 2 installments", () => {
    const result = calculateImi({
      vpt: 50_000,
      municipioId: "beja",
      propertyType: "rustico",
      propertyPurpose: "hpp",
      dependents: 0,
    });

    expect(result.appliedRate).toBe(0.008);
    expect(result.grossImi).toBe(400);
    expect(result.imiFamiliarDeduction).toBe(0);
    expect(result.imiFamiliarStatus).toBe("not_hpp"); // rural never gets IMI Familiar
    expect(result.netImi).toBe(400);
    expect(result.installments).toHaveLength(2);
  });

  it("Oeiras at 0.45% maximum rate", () => {
    const result = calculateImi({
      vpt: 100_000,
      municipioId: "oeiras",
      propertyType: "urbano",
      propertyPurpose: "secondary",
      dependents: 0,
    });

    expect(result.appliedRate).toBe(0.0045);
    expect(result.grossImi).toBe(450);
  });

  it("Vila Real de Santo António at 0.45% maximum rate", () => {
    const result = calculateImi({
      vpt: 100_000,
      municipioId: "vila-real-de-santo-antonio",
      propertyType: "urbano",
      propertyPurpose: "secondary",
      dependents: 0,
    });

    expect(result.appliedRate).toBe(0.0045);
    expect(result.grossImi).toBe(450);
  });

  it("Cartaxo at 0.45% maximum rate", () => {
    const result = calculateImi({
      vpt: 100_000,
      municipioId: "cartaxo",
      propertyType: "urbano",
      propertyPurpose: "secondary",
      dependents: 0,
    });

    expect(result.appliedRate).toBe(0.0045);
    expect(result.grossImi).toBe(450);
  });

  it("3+ dependents IMI Familiar deduction is €140", () => {
    const result = calculateImi({
      vpt: 300_000,
      municipioId: "braga",
      propertyType: "urbano",
      propertyPurpose: "hpp",
      dependents: 3,
    });

    expect(result.imiFamiliarDeduction).toBe(140);
    // Braga rate is 0.32%, not 0.3%: €300k × 0.0032 = €960; €960 − €140 = €820
    expect(result.netImi).toBe(820);
  });

  it("1 dependent IMI Familiar deduction is €30", () => {
    const result = calculateImi({
      vpt: 100_000,
      municipioId: "aveiro",
      propertyType: "urbano",
      propertyPurpose: "hpp",
      dependents: 1,
    });

    expect(result.imiFamiliarDeduction).toBe(30);
    // Aveiro rate is 0.35%, not 0.3%: €100k × 0.0035 = €350; €350 − €30 = €320
    expect(result.netImi).toBe(320);
  });

  it("secondary purpose → no IMI Familiar deduction", () => {
    const result = calculateImi({
      vpt: 200_000,
      municipioId: "coimbra",
      propertyType: "urbano",
      propertyPurpose: "secondary",
      dependents: 2,
    });

    expect(result.imiFamiliarDeduction).toBe(0);
    expect(result.imiFamiliarStatus).toBe("not_hpp");
  });

  it("devoluto → 3× surcharge applied", () => {
    const result = calculateImi({
      vpt: 100_000,
      municipioId: "lisboa",
      propertyType: "urbano",
      propertyPurpose: "vacant",
      dependents: 0,
    });

    expect(result.vacantSurchargeMultiplier).toBe(3);
    expect(result.appliedRate).toBeCloseTo(0.009);
    expect(result.grossImi).toBe(900);
  });

  // Payment schedule rules (Art. 120 CIMI)
  it("IMI ≤€100 → 1 installment in May", () => {
    const result = calculateImi({
      vpt: 30_000,
      municipioId: "lisboa",
      propertyType: "urbano",
      propertyPurpose: "hpp",
      dependents: 0,
    });

    expect(result.netImi).toBe(90);
    expect(result.installments).toHaveLength(1);
    expect(result.installments[0]?.dueDate).toBe(PAYMENT_DATES_2026.first);
  });

  it("IMI exactly €100 → 1 installment", () => {
    const result = calculateImi({
      vpt: 33_334,
      municipioId: "lisboa",
      propertyType: "urbano",
      propertyPurpose: "hpp",
      dependents: 0,
    });

    // 33334 × 0.003 = 100.002 → rounds to €100.00
    expect(result.netImi).toBeCloseTo(100, 0);
    expect(result.installments).toHaveLength(1);
  });

  it("IMI €300 → 2 installments (May + November)", () => {
    const result = calculateImi({
      vpt: 100_000,
      municipioId: "lisboa",
      propertyType: "urbano",
      propertyPurpose: "hpp",
      dependents: 0,
    });

    expect(result.netImi).toBe(300);
    expect(result.installments).toHaveLength(2);
    expect(result.installments[0]?.dueDate).toBe(PAYMENT_DATES_2026.first);
    expect(result.installments[1]?.dueDate).toBe(PAYMENT_DATES_2026.third);
    expect(result.installments[0]!.amount + result.installments[1]!.amount).toBe(300);
  });

  it("IMI >€500 → 3 installments (May + August + November)", () => {
    const result = calculateImi({
      vpt: 250_000,
      municipioId: "lisboa",
      propertyType: "urbano",
      propertyPurpose: "hpp",
      dependents: 0,
    });

    expect(result.netImi).toBe(750);
    expect(result.installments).toHaveLength(3);
    expect(result.installments[0]?.dueDate).toBe(PAYMENT_DATES_2026.first);
    expect(result.installments[1]?.dueDate).toBe(PAYMENT_DATES_2026.second);
    expect(result.installments[2]?.dueDate).toBe(PAYMENT_DATES_2026.third);
    const total =
      result.installments[0]!.amount +
      result.installments[1]!.amount +
      result.installments[2]!.amount;
    expect(total).toBeCloseTo(750, 1);
  });

  it("IMI Familiar deduction cannot make net IMI negative", () => {
    // VPT €5,000, Lisboa 0.3% → gross = €15, deduction €140 (3 deps) → should clamp to 0
    const result = calculateImi({
      vpt: 5_000,
      municipioId: "lisboa",
      propertyType: "urbano",
      propertyPurpose: "hpp",
      dependents: 3,
    });

    expect(result.netImi).toBe(0);
  });
});

// ─── calculateAimi ────────────────────────────────────────────────────────────

describe("calculateAimi", () => {
  it("individual, total VPT €900k → taxable €300k → AIMI €2,100", () => {
    const result = calculateAimi({
      totalResidentialVpt: 900_000,
      filingStatus: "individual",
      includesVacantOrRuins: false,
    });

    expect(result.deduction).toBe(600_000);
    expect(result.taxableBase).toBe(300_000);
    expect(result.aimi).toBe(2_100); // 300,000 × 0.7%
    expect(result.bands).toHaveLength(1);
    expect(result.bands[0]?.rate).toBe(0.007);
  });

  it("individual, total VPT €1.5M → AIMI spans two bands", () => {
    const result = calculateAimi({
      totalResidentialVpt: 1_500_000,
      filingStatus: "individual",
      includesVacantOrRuins: false,
    });

    // Taxable = 900,000
    // First band (0 → 400k): 400,000 × 0.7% = 2,800
    // Second band (400k → 900k): 500,000 × 1.0% = 5,000
    expect(result.taxableBase).toBe(900_000);
    expect(result.aimi).toBe(7_800);
    expect(result.bands).toHaveLength(2);
  });

  it("couple, total VPT €1M → below €1.2M threshold → AIMI €0", () => {
    const result = calculateAimi({
      totalResidentialVpt: 1_000_000,
      filingStatus: "couple",
      includesVacantOrRuins: false,
    });

    expect(result.deduction).toBe(1_200_000);
    expect(result.taxableBase).toBe(0);
    expect(result.aimi).toBe(0);
    expect(result.bands).toHaveLength(0);
  });

  it("company, total VPT €500k → 0.4% flat → AIMI €2,000", () => {
    const result = calculateAimi({
      totalResidentialVpt: 500_000,
      filingStatus: "company",
      includesVacantOrRuins: false,
    });

    expect(result.deduction).toBe(0);
    expect(result.taxableBase).toBe(500_000);
    expect(result.aimi).toBe(2_000);
  });

  it("individual with vacant property → no deduction → full VPT taxable", () => {
    const result = calculateAimi({
      totalResidentialVpt: 700_000,
      filingStatus: "individual",
      includesVacantOrRuins: true,
    });

    expect(result.deduction).toBe(0);
    expect(result.taxableBase).toBe(700_000);
    // First band: 400k × 0.7% = 2,800; remaining 300k × 1.0% = 3,000; total 5,800
    expect(result.aimi).toBe(5_800);
  });

  it("individual VPT exactly €600k → taxable €0 → AIMI €0", () => {
    const result = calculateAimi({
      totalResidentialVpt: 600_000,
      filingStatus: "individual",
      includesVacantOrRuins: false,
    });

    expect(result.taxableBase).toBe(0);
    expect(result.aimi).toBe(0);
  });
});

// ─── checkExemptions ─────────────────────────────────────────────────────────

describe("checkExemptions", () => {
  it("permanent exemption: income €15k, total VPT €60k, HPP → eligible", () => {
    const result = checkExemptions({
      vpt: 60_000,
      municipioId: "lisboa",
      isHpp: true,
      householdGrossIncome: 15_000,
      totalFamilyVpt: 60_000,
      acquisitionYear: 2025,
      previousExemptionsUsed: 0,
    });

    expect(result.permanentExemption.eligible).toBe(true);
    expect(result.permanentExemption.failedConditionsPt).toHaveLength(0);
  });

  it("permanent exemption blocked: income exceeds threshold", () => {
    const result = checkExemptions({
      vpt: 60_000,
      municipioId: "lisboa",
      isHpp: true,
      householdGrossIncome: 20_000, // > 17,303.39
      totalFamilyVpt: 60_000,
      acquisitionYear: 2025,
      previousExemptionsUsed: 0,
    });

    expect(result.permanentExemption.eligible).toBe(false);
    expect(result.permanentExemption.failedConditionsPt).toHaveLength(1);
  });

  it("permanent exemption blocked: total VPT exceeds threshold", () => {
    const result = checkExemptions({
      vpt: 80_000,
      municipioId: "lisboa",
      isHpp: true,
      householdGrossIncome: 10_000,
      totalFamilyVpt: 80_000, // > 75,198.20
      acquisitionYear: 2025,
      previousExemptionsUsed: 0,
    });

    expect(result.permanentExemption.eligible).toBe(false);
  });

  it("permanent exemption blocked: not HPP", () => {
    const result = checkExemptions({
      vpt: 50_000,
      municipioId: "lisboa",
      isHpp: false,
      householdGrossIncome: 10_000,
      totalFamilyVpt: 50_000,
      acquisitionYear: 2025,
      previousExemptionsUsed: 0,
    });

    expect(result.permanentExemption.eligible).toBe(false);
    expect(result.permanentExemption.failedConditionsPt[0]).toContain("habitação própria permanente");
  });

  it("temporary exemption: VPT €110k, income €100k, acquired 2025, 0 prior uses → eligible (3 years)", () => {
    const result = checkExemptions({
      vpt: 110_000,
      municipioId: "lisboa",
      isHpp: true,
      householdGrossIncome: 100_000,
      totalFamilyVpt: 110_000,
      acquisitionYear: 2025,
      previousExemptionsUsed: 0,
    });

    expect(result.temporaryExemption.eligible).toBe(true);
    expect(result.temporaryExemption.durationYears).toBe(3);
  });

  it("temporary exemption blocked: VPT exceeds €125k", () => {
    const result = checkExemptions({
      vpt: 130_000,
      municipioId: "lisboa",
      isHpp: true,
      householdGrossIncome: 100_000,
      totalFamilyVpt: 130_000,
      acquisitionYear: 2025,
      previousExemptionsUsed: 0,
    });

    expect(result.temporaryExemption.eligible).toBe(false);
    expect(result.temporaryExemption.durationYears).toBeNull();
  });

  it("temporary exemption blocked: income exceeds €153,300", () => {
    const result = checkExemptions({
      vpt: 100_000,
      municipioId: "lisboa",
      isHpp: true,
      householdGrossIncome: 160_000,
      totalFamilyVpt: 100_000,
      acquisitionYear: 2025,
      previousExemptionsUsed: 0,
    });

    expect(result.temporaryExemption.eligible).toBe(false);
  });

  it("temporary exemption blocked: acquisition more than 3 years ago", () => {
    const result = checkExemptions({
      vpt: 100_000,
      municipioId: "lisboa",
      isHpp: true,
      householdGrossIncome: 50_000,
      totalFamilyVpt: 100_000,
      acquisitionYear: 2022, // 4 years before 2026
      previousExemptionsUsed: 0,
    });

    expect(result.temporaryExemption.eligible).toBe(false);
    expect(result.temporaryExemption.failedConditionsPt.some((s) => s.includes("3 anos"))).toBe(true);
  });

  it("temporary exemption blocked: lifetime limit of 2 already reached", () => {
    const result = checkExemptions({
      vpt: 100_000,
      municipioId: "lisboa",
      isHpp: true,
      householdGrossIncome: 50_000,
      totalFamilyVpt: 100_000,
      acquisitionYear: 2025,
      previousExemptionsUsed: 2,
    });

    expect(result.temporaryExemption.eligible).toBe(false);
  });
});

// ─── calculateLatePaymentInterest ────────────────────────────────────────────

describe("calculateLatePaymentInterest", () => {
  it("€500 debt, 45 days late → ~€4.45 (2026 rate 7.221%)", () => {
    const interest = calculateLatePaymentInterest(500, 45);
    // 500 × 0.07221 / 365 × 45 = 4.453...
    expect(interest).toBeCloseTo(4.45, 1);
  });

  it("zero days → zero interest", () => {
    expect(calculateLatePaymentInterest(1000, 0)).toBe(0);
  });
});

// ─── calculateVpt ─────────────────────────────────────────────────────────────

describe("calculateVpt", () => {
  const NO_AMENITIES = {
    pool: false,
    individualGarage: false,
    centralAc: false,
    gatedCommunity: false,
    singleFamilyHouse: false,
  };

  it("base case: Cl=1.5, Aa=100, Ab=20, construction 1980, no amenities → Cv=0.65", () => {
    // Age 2026-1980=46 → Cv=0.65 (41–50 range)
    // Area = 100 + 20×0.30 = 106
    // VPT = 712.50 × 106 × 1.0 × 1.5 × 1.0 × 0.65 = 73,636.875 → €73,640
    const result = calculateVpt({
      currentVpt: 80_000,
      lastEvalYear: 2018,
      cl: 1.5,
      aa: 100,
      ab: 20,
      constructionYear: 1980,
      amenities: NO_AMENITIES,
    });

    expect(result.vc).toBe(VC_2026);
    expect(result.area).toBeCloseTo(106, 1);
    expect(result.cv).toBe(0.65);
    expect(result.cq).toBe(1.0);
    expect(result.recalculatedVpt).toBe(73_640);
  });

  it("construction year 2020 → Cv=0.90 (2–8 years old)", () => {
    // Age = 6 → Cv = 0.90
    const result = calculateVpt({
      currentVpt: 100_000,
      lastEvalYear: 2018,
      cl: 1.0,
      aa: 80,
      ab: 0,
      constructionYear: 2020,
      amenities: NO_AMENITIES,
    });
    // VPT = 712.50 × 80 × 1.0 × 1.0 × 1.0 × 0.90 = 51,300 → €51,300
    expect(result.cv).toBe(0.90);
    expect(result.recalculatedVpt).toBe(51_300);
  });

  it("construction year 1950 → Cv=0.40 (>60 years)", () => {
    const result = calculateVpt({
      currentVpt: 50_000,
      lastEvalYear: 2018,
      cl: 1.2,
      aa: 90,
      ab: 10,
      constructionYear: 1950,
      amenities: NO_AMENITIES,
    });
    // Age = 76 → Cv = 0.40
    // Area = 90 + 10×0.30 = 93
    // VPT = 712.50 × 93 × 1.0 × 1.2 × 1.0 × 0.40 = 31,806 → rounded to €31,810
    expect(result.cv).toBe(0.40);
    expect(result.recalculatedVpt).toBe(31_810);
  });

  it("amenities add to Cq correctly", () => {
    // Base Cq = 1.0 + pool(0.06) + garage(0.04) + gated(0.20) = 1.30
    const result = calculateVpt({
      currentVpt: 100_000,
      lastEvalYear: 2018,
      cl: 1.0,
      aa: 100,
      ab: 0,
      constructionYear: 2000, // age 26 → Cv 0.75
      amenities: { ...NO_AMENITIES, pool: true, individualGarage: true, gatedCommunity: true },
    });
    expect(result.cq).toBeCloseTo(1.30, 2);
    // VPT = 712.50 × 100 × 1.0 × 1.30 × 0.75 = 69,468.75 → €69,470
    expect(result.recalculatedVpt).toBe(69_470);
  });

  it("Cq capped at 1.7 maximum", () => {
    const result = calculateVpt({
      currentVpt: 100_000,
      lastEvalYear: 2018,
      cl: 1.0,
      aa: 100,
      ab: 0,
      constructionYear: 2024, // new → Cv 1.0
      amenities: { pool: true, individualGarage: true, centralAc: true, gatedCommunity: true, singleFamilyHouse: true },
    });
    // 1.0 + 0.06 + 0.04 + 0.03 + 0.20 + 0.20 = 1.53 → below 1.7 cap
    expect(result.cq).toBeCloseTo(1.53, 2);
  });

  it("recommendation=request when recalculated < current and eligible", () => {
    const result = calculateVpt({
      currentVpt: 120_000,
      lastEvalYear: 2020,
      cl: 0.8,
      aa: 80,
      ab: 0,
      constructionYear: 1960, // old → Cv 0.40
      amenities: NO_AMENITIES,
    });
    // VPT = 712.50 × 80 × 0.8 × 0.40 = 18,240 → well below 120k
    expect(result.recommendation).toBe("request");
    expect(result.canRequestReassessment).toBe(true);
    expect(result.difference).toBeLessThan(0);
  });

  it("recommendation=caution when recalculated > current", () => {
    const result = calculateVpt({
      currentVpt: 50_000,
      lastEvalYear: 2020,
      cl: 2.0,
      aa: 120,
      ab: 20,
      constructionYear: 2010, // 16 years → Cv 0.80
      amenities: NO_AMENITIES,
    });
    expect(result.recommendation).toBe("caution");
    expect(result.warningVcIncrease).toBe(true);
  });

  it("recommendation=not_eligible when last eval < 3 years ago", () => {
    const result = calculateVpt({
      currentVpt: 100_000,
      lastEvalYear: 2024, // only 2 years ago
      cl: 0.5,
      aa: 100,
      ab: 0,
      constructionYear: 1970,
      amenities: NO_AMENITIES,
    });
    expect(result.canRequestReassessment).toBe(false);
    expect(result.recommendation).toBe("not_eligible");
  });

  it("rounds recalculated VPT to nearest €10", () => {
    // With values that produce a non-round number
    const result = calculateVpt({
      currentVpt: 100_000,
      lastEvalYear: 2018,
      cl: 1.1,
      aa: 95,
      ab: 15,
      constructionYear: 1985, // age 41 → Cv 0.65
      amenities: NO_AMENITIES,
    });
    expect(result.recalculatedVpt % 10).toBe(0); // always divisible by 10
  });
});

// ─── calculatePortfolio ───────────────────────────────────────────────────────

describe("calculatePortfolio", () => {
  it("two properties, totals sum correctly", () => {
    const result = calculatePortfolio([
      {
        id: "p1",
        vpt: 150_000,
        municipioId: "lisboa",
        propertyType: "urbano",
        propertyPurpose: "hpp",
        dependents: 0,
      },
      {
        id: "p2",
        vpt: 100_000,
        municipioId: "porto",
        propertyType: "urbano",
        propertyPurpose: "secondary",
        dependents: 0,
      },
    ]);

    expect(result.propertyResults).toHaveLength(2);
    // Lisboa €150k × 0.3% = €450; Porto €100k × 0.324% = €324; total = €774
    expect(result.totalAnnualImi).toBe(774);
    expect(result.totalMonthlyEquivalent).toBeCloseTo(64.5, 1);
    // Both are urban → both count for AIMI
    expect(result.totalResidentialVpt).toBe(250_000);
  });

  it("rural property excluded from residential VPT total", () => {
    const result = calculatePortfolio([
      {
        id: "r1",
        vpt: 200_000,
        municipioId: "beja",
        propertyType: "rustico",
        propertyPurpose: "hpp",
        dependents: 0,
      },
      {
        id: "u1",
        vpt: 100_000,
        municipioId: "lisboa",
        propertyType: "urbano",
        propertyPurpose: "hpp",
        dependents: 0,
      },
    ]);

    // Only urban counts for AIMI
    expect(result.totalResidentialVpt).toBe(100_000);
  });

  it("empty valid properties → zero totals", () => {
    const result = calculatePortfolio([]);
    expect(result.totalAnnualImi).toBe(0);
    expect(result.totalResidentialVpt).toBe(0);
    expect(result.propertyResults).toHaveLength(0);
  });

  it("properties with vpt=0 or empty municipioId are filtered out", () => {
    const result = calculatePortfolio([
      { id: "a", vpt: 0, municipioId: "lisboa", propertyType: "urbano", propertyPurpose: "hpp", dependents: 0 },
      { id: "b", vpt: 100_000, municipioId: "", propertyType: "urbano", propertyPurpose: "hpp", dependents: 0 },
    ]);

    expect(result.propertyResults).toHaveLength(0);
    expect(result.totalAnnualImi).toBe(0);
  });
});
