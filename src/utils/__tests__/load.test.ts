import { calculateLoadItem, summarizeLoadSchedule, validateLoadSchedule } from "../loadCalculations";
import { VERIFIED_BASELINE_SCENARIO } from "../../data/verifiedBaseline";

export function runLoadTests(): { name: string; passed: boolean; message: string }[] {
  const results: { name: string; passed: boolean; message: string }[] = [];

  // Test 1: Single load item running power and daily energy
  const item = VERIFIED_BASELINE_SCENARIO.loads[0]; // Office Lighting 12kW, duty 0.9, div 1.0, 10h
  const calc = calculateLoadItem(item);
  const expectedKw = 12.0 * 0.9 * 1.0; // 10.8 kW
  const expectedKwh = 10.8 * 10; // 108 kWh
  const pass1 = Math.abs(calc.runningKw - expectedKw) < 0.1 && Math.abs(calc.dailyKwh - expectedKwh) < 0.1;
  results.push({
    name: "Load item running kW and daily kWh formula",
    passed: pass1,
    message: pass1 ? `Calculated: ${calc.runningKw.toFixed(2)} kW, ${calc.dailyKwh.toFixed(1)} kWh` : `Failed, got ${calc.runningKw}`,
  });

  // Test 2: Baseline critical load summary
  const summary = summarizeLoadSchedule(VERIFIED_BASELINE_SCENARIO.loads, 100);
  const pass2 = summary.criticalRunningKw > 0 && summary.criticalDailyKwh > 0;
  results.push({
    name: "Baseline critical load schedule summary",
    passed: pass2,
    message: pass2 ? `Critical Running: ${summary.criticalRunningKw.toFixed(2)} kW, Daily: ${summary.criticalDailyKwh.toFixed(1)} kWh` : "Failed baseline load summary",
  });

  // Test 3: Inverter overload validation
  const overloadIssues = validateLoadSchedule(VERIFIED_BASELINE_SCENARIO.loads, 10); // set small inverter capacity 10kW
  const pass3 = overloadIssues.some((i) => i.id === "load-inv-overload");
  results.push({
    name: "Inverter overload validation issue triggered",
    passed: pass3,
    message: pass3 ? "Overload issue correctly triggered" : "Failed to trigger overload issue",
  });

  return results;
}
