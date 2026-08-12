import { GridAndGeneratorInput, ValidationIssue } from "../types/planner";

export interface GeneratorScreeningResult {
  canCalculate: boolean;
  errorMessage?: string;
  criticalLoadKw: number;
  simultaneousChargeKw: number;
  totalRequiredKw: number;
  generatorPf: number;
  loadingLimitPercent: number;
  recommendedMinKva: number;
  recommendedWithChargingKva: number;
  selectedGenKva: number | null;
  selectedGenAvailableKw: number | null;
  loadingRatioPercent: number | null;
  isOverloaded: boolean;
  architecture: string;
}

export function calculateGeneratorScreening(
  gridGen: GridAndGeneratorInput,
  criticalLoadKw: number,
  simultaneousChargeKw = 15.0
): GeneratorScreeningResult {
  const pf = gridGen.generatorPowerFactor ?? 0.8;
  const limitPercent = gridGen.generatorContinuousLimitPercent ?? 80;

  const totalRequiredKw = criticalLoadKw + simultaneousChargeKw;

  // Minimum kVA for critical load only
  const recommendedMinKva = criticalLoadKw / (pf * (limitPercent / 100));

  // Minimum kVA with simultaneous battery charging
  const recommendedWithChargingKva = totalRequiredKw / (pf * (limitPercent / 100));

  const selectedGenKva = gridGen.generatorRatedKva;
  let selectedGenAvailableKw: number | null = null;
  let loadingRatioPercent: number | null = null;
  let isOverloaded = false;

  if (selectedGenKva !== null && selectedGenKva > 0) {
    selectedGenAvailableKw = selectedGenKva * pf * (limitPercent / 100);
    loadingRatioPercent = (criticalLoadKw / (selectedGenKva * pf)) * 100;
    isOverloaded = criticalLoadKw > selectedGenAvailableKw;
  }

  return {
    canCalculate: true,
    criticalLoadKw,
    simultaneousChargeKw,
    totalRequiredKw,
    generatorPf: pf,
    loadingLimitPercent: limitPercent,
    recommendedMinKva,
    recommendedWithChargingKva,
    selectedGenKva,
    selectedGenAvailableKw,
    loadingRatioPercent,
    isOverloaded,
    architecture: gridGen.generatorArchitecture,
  };
}

export function validateGeneratorSpecs(
  gridGen: GridAndGeneratorInput,
  criticalLoadKw: number
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const res = calculateGeneratorScreening(gridGen, criticalLoadKw);

  if (gridGen.generatorArchitecture === "Not selected") {
    issues.push({
      id: "gen-arch-not-selected",
      step: "Generator Estimate",
      severity: "engineer_required",
      title: "Generator Integration Architecture Not Selected",
      description: "Select whether the generator connects via ATS grid-input route or dedicated Solis GEN-port route to complete protection and control screening.",
    });
  }

  if (res.selectedGenKva === null) {
    issues.push({
      id: "gen-kva-null",
      step: "Generator Estimate",
      severity: "info",
      title: "Generator Capacity To Confirm",
      description: `Recommended minimum generator rating for ${criticalLoadKw.toFixed(1)} kW critical load is ${res.recommendedMinKva.toFixed(0)} kVA (or ${res.recommendedWithChargingKva.toFixed(0)} kVA with 15kW battery charging).`,
    });
  } else if (res.isOverloaded) {
    issues.push({
      id: "gen-overloaded",
      step: "Generator Estimate",
      severity: "error",
      title: "Generator Capacity Insufficient for Critical Load",
      description: `Critical load demand (${criticalLoadKw.toFixed(1)} kW) exceeds continuous derated rating of selected ${res.selectedGenKva} kVA generator (${res.selectedGenAvailableKw?.toFixed(1)} kW limit at ${res.loadingLimitPercent}% load factor).`,
    });
  }

  // Mandatory engineering warnings for generator protection
  issues.push({
    id: "gen-reverse-power-warning",
    step: "Generator Estimate",
    severity: "engineer_required",
    title: "Mandatory Engineering Screening: Reverse Power & Frequency Control",
    description: "Diesel generators must be protected against reverse power flow during sudden PV generation surges or load shed events. Verify anti-backfeed relaying and frequency-shift power control.",
  });

  return issues;
}
