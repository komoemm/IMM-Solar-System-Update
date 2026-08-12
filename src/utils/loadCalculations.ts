import { LoadItem, ValidationIssue } from "../types/planner";

export interface LoadItemCalculations {
  connectedKw: number;
  runningKw: number;
  runningKva: number;
  dailyKwh: number;
  startingKva: number;
}

export interface LoadScheduleSummary {
  totalConnectedKw: number;
  totalRunningKw: number;
  totalRunningKva: number;
  totalDailyKwh: number;

  criticalRunningKw: number;
  criticalRunningKva: number;
  criticalDailyKwh: number;

  nonCriticalRunningKw: number;

  phaseL1Kw: number;
  phaseL2Kw: number;
  phaseL3Kw: number;
  phaseImbalancePercent: number; // (max - min) / avg * 100

  largestMotorLoad: LoadItem | null;
  largestMotorStartingKva: number;

  inverterLoadingPercent: number; // criticalRunningKw / totalInverterKw * 100
  remainingInverterKw: number;
}

export function calculateLoadItem(item: LoadItem): LoadItemCalculations {
  const connectedKw = Math.max(0, item.quantity) * Math.max(0, item.ratedKw);
  const runningKw = connectedKw * Math.max(0, item.dutyFactor) * Math.max(0, item.diversityFactor);
  const pf = item.powerFactor > 0 ? item.powerFactor : 0.85;
  const runningKva = runningKw / pf;
  const dailyKwh = runningKw * Math.max(0, item.operatingHoursPerDay);
  const startingKva = runningKva * Math.max(1.0, item.startingMultiplier);

  return {
    connectedKw,
    runningKw,
    runningKva,
    dailyKwh,
    startingKva,
  };
}

export function summarizeLoadSchedule(
  loads: LoadItem[],
  totalInverterCapacityKw = 100
): LoadScheduleSummary {
  let totalConnectedKw = 0;
  let totalRunningKw = 0;
  let totalRunningKva = 0;
  let totalDailyKwh = 0;

  let criticalRunningKw = 0;
  let criticalRunningKva = 0;
  let criticalDailyKwh = 0;

  let nonCriticalRunningKw = 0;

  let phaseL1Kw = 0;
  let phaseL2Kw = 0;
  let phaseL3Kw = 0;

  let largestMotorLoad: LoadItem | null = null;
  let largestMotorStartingKva = 0;

  loads.forEach((item) => {
    const calc = calculateLoadItem(item);

    totalConnectedKw += calc.connectedKw;
    totalRunningKw += calc.runningKw;
    totalRunningKva += calc.runningKva;
    totalDailyKwh += calc.dailyKwh;

    if (item.isCritical) {
      criticalRunningKw += calc.runningKw;
      criticalRunningKva += calc.runningKva;
      criticalDailyKwh += calc.dailyKwh;
    } else {
      nonCriticalRunningKw += calc.runningKw;
    }

    // Phase distribution
    if (item.phase === "L1") {
      phaseL1Kw += calc.runningKw;
    } else if (item.phase === "L2") {
      phaseL2Kw += calc.runningKw;
    } else if (item.phase === "L3") {
      phaseL3Kw += calc.runningKw;
    } else if (item.phase === "Three-phase") {
      phaseL1Kw += calc.runningKw / 3;
      phaseL2Kw += calc.runningKw / 3;
      phaseL3Kw += calc.runningKw / 3;
    }

    // Track largest motor / load
    if (item.category === "Motors & Pumps" || item.category === "Process Machinery" || item.category === "HVAC") {
      if (!largestMotorLoad || calc.startingKva > largestMotorStartingKva) {
        largestMotorLoad = item;
        largestMotorStartingKva = calc.startingKva;
      }
    }
  });

  // Phase Imbalance calculation
  const phases = [phaseL1Kw, phaseL2Kw, phaseL3Kw];
  const maxP = Math.max(...phases);
  const minP = Math.min(...phases);
  const avgP = (phaseL1Kw + phaseL2Kw + phaseL3Kw) / 3;
  const phaseImbalancePercent = avgP > 0 ? ((maxP - minP) / avgP) * 100 : 0;

  const inverterLoadingPercent = totalInverterCapacityKw > 0 ? (criticalRunningKw / totalInverterCapacityKw) * 100 : 0;
  const remainingInverterKw = Math.max(0, totalInverterCapacityKw - criticalRunningKw);

  return {
    totalConnectedKw,
    totalRunningKw,
    totalRunningKva,
    totalDailyKwh,
    criticalRunningKw,
    criticalRunningKva,
    criticalDailyKwh,
    nonCriticalRunningKw,
    phaseL1Kw,
    phaseL2Kw,
    phaseL3Kw,
    phaseImbalancePercent,
    largestMotorLoad,
    largestMotorStartingKva,
    inverterLoadingPercent,
    remainingInverterKw,
  };
}

export function validateLoadSchedule(
  loads: LoadItem[],
  totalInverterCapacityKw = 100
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const summary = summarizeLoadSchedule(loads, totalInverterCapacityKw);

  if (loads.length === 0) {
    issues.push({
      id: "load-empty",
      step: "Load Schedule",
      severity: "warning",
      title: "Load Schedule Empty",
      description: "No load items defined in schedule. Add factory or critical loads to perform capacity and runtime analysis.",
    });
    return issues;
  }

  // Critical load exceeding inverter output
  if (summary.criticalRunningKw > totalInverterCapacityKw) {
    issues.push({
      id: "load-inv-overload",
      step: "Load Schedule",
      severity: "error",
      title: "Critical Load Exceeds Total Inverter Capacity",
      description: `Critical running demand (${summary.criticalRunningKw.toFixed(1)} kW) exceeds total combined inverter output (${totalInverterCapacityKw} kW). Backup system will trip on overload during grid failure!`,
    });
  } else if (summary.inverterLoadingPercent > 85) {
    issues.push({
      id: "load-inv-high",
      step: "Load Schedule",
      severity: "warning",
      title: "High Inverter Loading Level",
      description: `Critical load consumes ${summary.inverterLoadingPercent.toFixed(1)}% of total inverter capacity (${summary.criticalRunningKw.toFixed(1)} kW / ${totalInverterCapacityKw} kW). High operating temperature derating risk.`,
    });
  }

  // Phase imbalance check
  if (summary.phaseImbalancePercent > 20) {
    issues.push({
      id: "load-phase-imbalance",
      step: "Load Schedule",
      severity: "warning",
      title: "Single-Phase Load Imbalance Detected",
      description: `Phase power distribution imbalance is ${summary.phaseImbalancePercent.toFixed(1)}% (L1: ${summary.phaseL1Kw.toFixed(1)}kW, L2: ${summary.phaseL2Kw.toFixed(1)}kW, L3: ${summary.phaseL3Kw.toFixed(1)}kW). Rebalance single-phase loads across phases to prevent neutral currents and inverter phase-voltage unbalance.`,
    });
  }

  // Motor starting warning
  if (summary.largestMotorStartingKva > totalInverterCapacityKw * 1.5) {
    issues.push({
      id: "load-motor-start-high",
      step: "Load Schedule",
      severity: "engineer_required",
      title: "Transient Motor Starting Demand Review",
      description: `Largest motor starting demand is estimated at ${summary.largestMotorStartingKva.toFixed(1)} kVA. Ensure inverter surge rating and VFD soft-start controls are verified by M&E engineers.`,
    });
  }

  return issues;
}
