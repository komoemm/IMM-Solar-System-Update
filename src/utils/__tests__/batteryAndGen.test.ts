import { calculateBatteryRuntime, formatHoursMinutes } from "../batteryCalculations";
import { calculateGeneratorScreening } from "../generatorCalculations";
import { VERIFIED_BASELINE_SCENARIO } from "../../data/verifiedBaseline";

export function runBatteryAndGenTests(): { name: string; passed: boolean; message: string }[] {
  const results: { name: string; passed: boolean; message: string }[] = [];

  // Test 1: Battery runtime formula format
  const formatted = formatHoursMinutes(2.5);
  const pass1 = formatted === "2h 30m";
  results.push({
    name: "Hours & minutes formatter test",
    passed: pass1,
    message: pass1 ? `Formatted 2.5h to ${formatted}` : `Failed, got ${formatted}`,
  });

  // Test 2: Baseline battery runtime calculation
  const runtime = calculateBatteryRuntime(VERIFIED_BASELINE_SCENARIO.batterySpecs, 20.0);
  const pass2 = runtime.canCalculate && runtime.totalNominalKwh !== null && runtime.totalNominalKwh > 100;
  results.push({
    name: "Baseline battery capacity calculation (>100 kWh)",
    passed: pass2,
    message: pass2 ? `Nominal Capacity: ${runtime.totalNominalKwh?.toFixed(1)} kWh` : "Failed battery capacity calculation",
  });

  // Test 3: Generator screening kVA formula
  const gridGen = VERIFIED_BASELINE_SCENARIO.gridAndGen;
  const genResult = calculateGeneratorScreening(gridGen, 25.0, 15.0); // 25kW load + 15kW charge = 40kW total
  // 40kW / (0.8 * 0.8) = 40 / 0.64 = 62.5 kVA
  const pass3 = Math.abs(genResult.recommendedWithChargingKva - 62.5) < 1.0;
  results.push({
    name: "Generator kVA screening formula for 40kW total demand",
    passed: pass3,
    message: pass3 ? `Calculated kVA: ${genResult.recommendedWithChargingKva.toFixed(1)} kVA` : `Failed, got ${genResult.recommendedWithChargingKva}`,
  });

  return results;
}
