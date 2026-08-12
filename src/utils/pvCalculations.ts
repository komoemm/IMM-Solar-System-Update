import { PlannerScenario, PVStringInput, ValidationIssue } from "../types/planner";

export interface ColdVocResult {
  canCalculate: boolean;
  errorMessage?: string;
  panelVocCold: number | null;
  stringVocCold: number | null;
  inverterMaxVoltageV: number | null;
  headroomV: number | null;
  headroomPercent: number | null;
  isOverLimit: boolean;
  isLowHeadroom: boolean; // < 50V or < 5%
  coeffDecimal: number | null;
  deltaT: number | null;
}

export function calculateColdVocForPanel(
  panelVocStc: number | null,
  vocTempCoeffPercent: number | null, // e.g. -0.26 (%/°C)
  minDesignTempC: number | null,
  inverterMaxVoltageV: number | null,
  stringPanelCount = 1
): ColdVocResult {
  if (
    panelVocStc === null ||
    vocTempCoeffPercent === null ||
    minDesignTempC === null ||
    panelVocStc <= 0
  ) {
    return {
      canCalculate: false,
      errorMessage: "Cannot calculate—input required (panel Voc, temperature coefficient, and minimum design temperature).",
      panelVocCold: null,
      stringVocCold: null,
      inverterMaxVoltageV,
      headroomV: null,
      headroomPercent: null,
      isOverLimit: false,
      isLowHeadroom: false,
      coeffDecimal: null,
      deltaT: null,
    };
  }

  // Convert %/°C to absolute decimal factor (e.g., -0.26% = -0.0026)
  const coeffDecimal = Math.abs(vocTempCoeffPercent) / 100;
  const deltaT = 25 - minDesignTempC; // e.g., 25 - 10 = 15°C colder
  const tempFactor = 1 + coeffDecimal * deltaT;

  const panelVocCold = panelVocStc * tempFactor;
  const stringVocCold = panelVocCold * stringPanelCount;

  if (inverterMaxVoltageV === null || inverterMaxVoltageV <= 0) {
    return {
      canCalculate: true,
      panelVocCold,
      stringVocCold,
      inverterMaxVoltageV: null,
      headroomV: null,
      headroomPercent: null,
      isOverLimit: false,
      isLowHeadroom: false,
      coeffDecimal,
      deltaT,
    };
  }

  const headroomV = inverterMaxVoltageV - stringVocCold;
  const headroomPercent = (headroomV / inverterMaxVoltageV) * 100;
  const isOverLimit = headroomV < 0;
  const isLowHeadroom = !isOverLimit && (headroomV < 50 || headroomPercent < 5.0);

  return {
    canCalculate: true,
    panelVocCold,
    stringVocCold,
    inverterMaxVoltageV,
    headroomV,
    headroomPercent,
    isOverLimit,
    isLowHeadroom,
    coeffDecimal,
    deltaT,
  };
}

export interface PVScenarioSummary {
  totalPanelQuantity: number;
  assignedPanelQuantity: number;
  totalCapacityKwp: number;
  inverterSummaries: Array<{
    inverterId: number;
    stringCount: number;
    panelCount: number;
    capacityKwp: number;
  }>;
}

export function summarizePVStrings(
  pvStrings: PVStringInput[],
  panelWattageW: number | null
): PVScenarioSummary {
  const panelWattage = panelWattageW ?? 710;
  let assignedPanelQuantity = 0;
  let totalCapacityKwp = 0;

  const invMap = new Map<number, { stringCount: number; panelCount: number; capacityKwp: number }>();

  pvStrings.forEach((str) => {
    assignedPanelQuantity += str.panelCount;
    const stringKwp = (str.panelCount * panelWattage) / 1000;
    totalCapacityKwp += stringKwp;

    const existing = invMap.get(str.inverterId) || { stringCount: 0, panelCount: 0, capacityKwp: 0 };
    invMap.set(str.inverterId, {
      stringCount: existing.stringCount + 1,
      panelCount: existing.panelCount + str.panelCount,
      capacityKwp: existing.capacityKwp + stringKwp,
    });
  });

  const inverterSummaries = Array.from(invMap.entries()).map(([inverterId, val]) => ({
    inverterId,
    ...val,
  }));

  return {
    totalPanelQuantity: assignedPanelQuantity,
    assignedPanelQuantity,
    totalCapacityKwp,
    inverterSummaries,
  };
}

export function validatePVStrings(scenario: PlannerScenario): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { panelSpecs, inverterSpecs, pvStrings } = scenario;

  // 1. Panel quantity match
  const assignedPanels = pvStrings.reduce((sum, s) => sum + s.panelCount, 0);
  if (panelSpecs.quantity !== null && assignedPanels !== panelSpecs.quantity) {
    issues.push({
      id: "pv-qty-mismatch",
      step: "PV Validation",
      severity: "warning",
      title: "PV String Panel Count Mismatch",
      description: `Total panel quantity in specification is ${panelSpecs.quantity}, but assigned string panel total is ${assignedPanels}.`,
    });
  }

  // Group strings by (inverterId, mpptIndex)
  const mpptGroups = new Map<string, PVStringInput[]>();
  pvStrings.forEach((s) => {
    const key = `Inv${s.inverterId}-MPPT${s.mpptIndex}`;
    const list = mpptGroups.get(key) || [];
    list.push(s);
    mpptGroups.set(key, list);
  });

  const inputsPerMppt = inverterSpecs.inputsPerMppt ?? 2;
  const panelWatt = panelSpecs.wattage ?? 710;
  const panelVmp = panelSpecs.vmp ?? 40.4;
  const panelVoc = panelSpecs.voc ?? 48.3;
  const panelImp = panelSpecs.imp ?? 17.58;
  const panelIsc = panelSpecs.isc ?? 18.59;

  // 2. MPPT Level Validations
  mpptGroups.forEach((stringsOnMppt, key) => {
    if (stringsOnMppt.length > inputsPerMppt) {
      issues.push({
        id: `pv-mppt-overload-${key}`,
        step: "PV Validation",
        severity: "error",
        title: `Too Many Strings on ${key}`,
        description: `${key} has ${stringsOnMppt.length} strings assigned, exceeding maximum allowed inputs per MPPT (${inputsPerMppt}).`,
        location: key,
      });
    }

    if (stringsOnMppt.length > 1) {
      // Parallel string length check
      const firstCount = stringsOnMppt[0].panelCount;
      const lengthMismatch = stringsOnMppt.some((s) => s.panelCount !== firstCount);
      if (lengthMismatch) {
        issues.push({
          id: `pv-mppt-len-mismatch-${key}`,
          step: "PV Validation",
          severity: "error",
          title: `Parallel String Length Mismatch on ${key}`,
          description: `Parallel strings on ${key} have different panel counts (${stringsOnMppt.map((s) => `${s.id}:${s.panelCount}p`).join(", ")}). Parallel strings MUST have identical panel counts to prevent high circulating currents.`,
          location: key,
        });
      }

      // Parallel string model check
      const firstModel = stringsOnMppt[0].panelModel;
      const modelMismatch = stringsOnMppt.some((s) => s.panelModel !== firstModel);
      if (modelMismatch) {
        issues.push({
          id: `pv-mppt-model-mismatch-${key}`,
          step: "PV Validation",
          severity: "warning",
          title: `Different Panel Models Connected in Parallel on ${key}`,
          description: `Parallel strings on ${key} use different module models. Verify Vmp and temperature response match.`,
          location: key,
        });
      }

      // Orientation / Shading check
      const firstOrient = stringsOnMppt[0].orientationGroup;
      const firstShade = stringsOnMppt[0].shadingGroup;
      const orientMismatch = stringsOnMppt.some(
        (s) => s.orientationGroup !== firstOrient || s.shadingGroup !== firstShade
      );
      if (orientMismatch) {
        issues.push({
          id: `pv-mppt-orient-mismatch-${key}`,
          step: "PV Validation",
          severity: "warning",
          title: `Mismatched Orientation or Shading on ${key}`,
          description: `Parallel strings on ${key} have differing orientations or shading profiles, which may cause MPPT mismatch loss.`,
          location: key,
        });
      }
    }

    // Operating Current and Short Circuit Current on MPPT
    const totalImp = stringsOnMppt.length * panelImp;
    const totalIsc = stringsOnMppt.length * panelIsc;

    if (inverterSpecs.maxCurrentPerMpptA !== null && totalImp > inverterSpecs.maxCurrentPerMpptA) {
      issues.push({
        id: `pv-mppt-imp-exceeded-${key}`,
        step: "PV Validation",
        severity: "warning",
        title: `MPPT Operating Current Limit Exceeded on ${key}`,
        description: `Combined string operating current is ${totalImp.toFixed(2)} A, exceeding MPPT rated maximum current of ${inverterSpecs.maxCurrentPerMpptA} A. Inverter clipping will occur.`,
        location: key,
      });
    }

    if (
      inverterSpecs.maxShortCircuitCurrentPerMpptA !== null &&
      totalIsc > inverterSpecs.maxShortCircuitCurrentPerMpptA
    ) {
      issues.push({
        id: `pv-mppt-isc-exceeded-${key}`,
        step: "PV Validation",
        severity: "error",
        title: `MPPT Max Short-Circuit Current Exceeded on ${key}`,
        description: `Combined string short-circuit current is ${totalIsc.toFixed(2)} A, exceeding MPPT absolute max short-circuit rating of ${inverterSpecs.maxShortCircuitCurrentPerMpptA} A. Inverter warranty/safety breach risk!`,
        location: key,
      });
    }

    // Voltage Range Checks (STC)
    stringsOnMppt.forEach((str) => {
      const stringVmp = str.panelCount * panelVmp;
      if (
        inverterSpecs.mpptMinVoltageV !== null &&
        inverterSpecs.mpptMaxVoltageV !== null &&
        (stringVmp < inverterSpecs.mpptMinVoltageV || stringVmp > inverterSpecs.mpptMaxVoltageV)
      ) {
        issues.push({
          id: `pv-vmp-range-${str.id}`,
          step: "PV Validation",
          severity: "warning",
          title: `String ${str.id} Vmp Outside Recommended MPPT Range`,
          description: `String ${str.id} STC Vmp (${stringVmp.toFixed(1)} V) is outside inverter MPPT tracking range (${inverterSpecs.mpptMinVoltageV} V – ${inverterSpecs.mpptMaxVoltageV} V).`,
          location: str.id,
        });
      }

      // Cold Voc Check
      const coldResult = calculateColdVocForPanel(
        panelVoc,
        panelSpecs.vocTempCoeff,
        panelSpecs.minDesignTemp,
        inverterSpecs.maxPvInputVoltageV,
        str.panelCount
      );

      if (coldResult.canCalculate && coldResult.isOverLimit) {
        issues.push({
          id: `pv-cold-voc-over-${str.id}`,
          step: "PV Validation",
          severity: "error",
          title: `BLOCKING ERROR: String ${str.id} Cold Voc Exceeds Inverter Limit`,
          description: `String ${str.id} cold-weather Voc (${coldResult.stringVocCold?.toFixed(1)} V at ${panelSpecs.minDesignTemp}°C) exceeds inverter maximum limit of ${inverterSpecs.maxPvInputVoltageV} V DC. Permanent equipment damage risk!`,
          location: str.id,
        });
      } else if (coldResult.canCalculate && coldResult.isLowHeadroom) {
        issues.push({
          id: `pv-cold-voc-low-${str.id}`,
          step: "PV Validation",
          severity: "engineer_required",
          title: `Engineering Review: Low Voltage Headroom on String ${str.id}`,
          description: `String ${str.id} cold Voc (${coldResult.stringVocCold?.toFixed(1)} V) leaves small headroom (${coldResult.headroomV?.toFixed(1)} V / ${coldResult.headroomPercent?.toFixed(1)}%) below ${inverterSpecs.maxPvInputVoltageV} V DC. Verify site record lowest temperature.`,
          location: str.id,
        });
      }
    });
  });

  // DC/AC Ratio Check
  const totalPvKwp = (assignedPanels * panelWatt) / 1000;
  const totalInverterAcKw = (inverterSpecs.quantity ?? 0) * (inverterSpecs.ratedAcPowerKw ?? 0);
  if (totalInverterAcKw > 0) {
    const dcAcRatio = totalPvKwp / totalInverterAcKw;
    if (dcAcRatio > 1.35) {
      issues.push({
        id: "pv-dc-ac-high",
        step: "PV Validation",
        severity: "info",
        title: "High DC/AC Overload Ratio",
        description: `System DC/AC ratio is ${dcAcRatio.toFixed(2)} (${totalPvKwp.toFixed(2)} kWp DC / ${totalInverterAcKw} kW AC). Ensure inverter thermal derating specs support peak clipping.`,
      });
    } else if (dcAcRatio < 0.75) {
      issues.push({
        id: "pv-dc-ac-low",
        step: "PV Validation",
        severity: "info",
        title: "Low DC/AC Array Ratio",
        description: `System DC/AC ratio is ${dcAcRatio.toFixed(2)}. Inverter capacity may be underutilized.`,
      });
    }
  }

  return issues;
}
