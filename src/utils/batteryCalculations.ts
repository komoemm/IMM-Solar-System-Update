import { BatterySpecsInput, ValidationIssue } from "../types/planner";

export interface BatteryRuntimeResult {
  canCalculate: boolean;
  errorMessage?: string;
  nominalVoltageV: number | null;
  bankAh: number | null;
  totalNominalKwh: number | null;
  usableKwh: number | null;
  deliveredKwh: number | null;
  runtimeAvgHours: number | null;
  runtimeAvgHoursFormatted: string;
  runtimePeakHours: number | null;
  runtimePeakHoursFormatted: string;
  runtimeNightHours: number | null;
  runtimeNightHoursFormatted: string;
  cRate: number | null;
}

export function formatHoursMinutes(hours: number | null): string {
  if (hours === null || isNaN(hours) || hours <= 0) return "0h 0m";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

export function calculateBatteryRuntime(
  battery: BatterySpecsInput,
  criticalRunningKw: number | null
): BatteryRuntimeResult {
  if (
    battery.moduleNominalVoltageV === null ||
    battery.moduleCapacityAh === null ||
    battery.modulesInSeries === null ||
    battery.parallelStrings === null ||
    battery.moduleNominalVoltageV <= 0 ||
    battery.moduleCapacityAh <= 0
  ) {
    return {
      canCalculate: false,
      errorMessage: "To Confirm — Battery specifications not yet selected or incomplete.",
      nominalVoltageV: null,
      bankAh: null,
      totalNominalKwh: null,
      usableKwh: null,
      deliveredKwh: null,
      runtimeAvgHours: null,
      runtimeAvgHoursFormatted: "—",
      runtimePeakHours: null,
      runtimePeakHoursFormatted: "—",
      runtimeNightHours: null,
      runtimeNightHoursFormatted: "—",
      cRate: null,
    };
  }

  const nominalVoltageV = battery.moduleNominalVoltageV * battery.modulesInSeries;
  const bankAh = battery.moduleCapacityAh * battery.parallelStrings;
  const totalNominalKwh = (nominalVoltageV * bankAh) / 1000;

  const dodPercent = battery.permittedDoDPercent ?? 80;
  const effPercent = battery.inverterEfficiencyPercent ?? 95;

  const usableKwh = totalNominalKwh * (dodPercent / 100);
  const deliveredKwh = usableKwh * (effPercent / 100);

  const avgKw = criticalRunningKw && criticalRunningKw > 0 ? criticalRunningKw : 20.0;
  const peakKw = avgKw * 1.35;
  const nightKw = avgKw * 0.5;

  const runtimeAvgHours = deliveredKwh / avgKw;
  const runtimePeakHours = deliveredKwh / peakKw;
  const runtimeNightHours = deliveredKwh / nightKw;

  const cRate = avgKw / totalNominalKwh;

  return {
    canCalculate: true,
    nominalVoltageV,
    bankAh,
    totalNominalKwh,
    usableKwh,
    deliveredKwh,
    runtimeAvgHours,
    runtimeAvgHoursFormatted: formatHoursMinutes(runtimeAvgHours),
    runtimePeakHours,
    runtimePeakHoursFormatted: formatHoursMinutes(runtimePeakHours),
    runtimeNightHours,
    runtimeNightHoursFormatted: formatHoursMinutes(runtimeNightHours),
    cRate,
  };
}

export function validateBatterySpecs(
  battery: BatterySpecsInput,
  criticalRunningKw: number
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const runtime = calculateBatteryRuntime(battery, criticalRunningKw);

  if (!runtime.canCalculate) {
    issues.push({
      id: "bat-missing-specs",
      step: "Battery Runtime",
      severity: "engineer_required",
      title: "Battery System Specifications To Confirm",
      description: "Battery voltage and capacity parameters are not fully specified. Select battery hardware model to confirm backup duration.",
    });
    return issues;
  }

  if (runtime.runtimeAvgHours !== null && runtime.runtimeAvgHours < 2.0) {
    issues.push({
      id: "bat-runtime-low",
      step: "Battery Runtime",
      severity: "warning",
      title: "Short Estimated Backup Duration",
      description: `Estimated battery runtime at critical demand is ${runtime.runtimeAvgHoursFormatted} (${runtime.deliveredKwh?.toFixed(1)} kWh delivered). Verify site emergency autonomy requirements.`,
    });
  }

  if (runtime.cRate !== null && runtime.cRate > 0.8) {
    issues.push({
      id: "bat-crate-high",
      step: "Battery Runtime",
      severity: "warning",
      title: "High Discharge C-Rate",
      description: `Discharge C-rate is estimated at ${runtime.cRate.toFixed(2)}C. High discharge rates increase cell heating, reduce usable voltage, and shorten battery cycle life.`,
    });
  }

  return issues;
}
