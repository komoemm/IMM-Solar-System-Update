import { calculateColdVocForPanel, summarizePVStrings, validatePVStrings } from "../pvCalculations";
import { VERIFIED_BASELINE_SCENARIO } from "../../data/verifiedBaseline";

export function runPvTests(): { name: string; passed: boolean; message: string }[] {
  const results: { name: string; passed: boolean; message: string }[] = [];

  // Test 1: Verified 12-panel string cold Voc
  const res12 = calculateColdVocForPanel(48.3, -0.26, 10, 1000, 12);
  const pass1 = res12.canCalculate && res12.stringVocCold !== null && Math.abs(res12.stringVocCold - 602.0) < 2.0;
  results.push({
    name: "Verified 12-panel string cold Voc at 10°C",
    passed: pass1,
    message: pass1 ? `Calculated: ${res12.stringVocCold?.toFixed(1)} V` : `Failed, got ${res12.stringVocCold}`,
  });

  // Test 2: Verified 13-panel string cold Voc
  const res13 = calculateColdVocForPanel(48.3, -0.26, 10, 1000, 13);
  const pass2 = res13.canCalculate && res13.stringVocCold !== null && Math.abs(res13.stringVocCold - 652.2) < 2.0;
  results.push({
    name: "Verified 13-panel string cold Voc at 10°C",
    passed: pass2,
    message: pass2 ? `Calculated: ${res13.stringVocCold?.toFixed(1)} V` : `Failed, got ${res13.stringVocCold}`,
  });

  // Test 3: Complete 170-panel baseline summary
  const summary = summarizePVStrings(VERIFIED_BASELINE_SCENARIO.pvStrings, 710);
  const pass3 = summary.assignedPanelQuantity === 170 && Math.abs(summary.totalCapacityKwp - 120.7) < 0.1;
  results.push({
    name: "Complete 170-panel baseline PV summary (120.70 kWp)",
    passed: pass3,
    message: pass3 ? `Panels: ${summary.assignedPanelQuantity}, Capacity: ${summary.totalCapacityKwp} kWp` : `Failed, got ${summary.assignedPanelQuantity} panels`,
  });

  // Test 4: Mixed string length warning detection
  const badScenario = JSON.parse(JSON.stringify(VERIFIED_BASELINE_SCENARIO));
  badScenario.pvStrings[1].panelCount = 13; // S1-02 becomes 13 panels while S1-01 is 12 panels on Inv1 MPPT 1
  const issuesBad = validatePVStrings(badScenario);
  const hasMismatchIssue = issuesBad.some((i) => i.id.includes("pv-mppt-len-mismatch"));
  results.push({
    name: "Mixed string length on same MPPT raises blocking error",
    passed: hasMismatchIssue,
    message: hasMismatchIssue ? "Detected string length mismatch error correctly" : "Failed to detect mismatch",
  });

  // Test 5: Cold Voc above inverter limit
  const extremeColdRes = calculateColdVocForPanel(48.3, -0.26, -40, 1000, 20); // 20 panels in extreme cold
  const pass5 = extremeColdRes.isOverLimit;
  results.push({
    name: "Cold Voc over limit detected",
    passed: pass5,
    message: pass5 ? `Over limit detected: ${extremeColdRes.stringVocCold?.toFixed(1)} V > 1000 V` : "Failed to detect over limit",
  });

  // Test 6: Missing temperature coefficient handling
  const missingCoeffRes = calculateColdVocForPanel(48.3, null, 10, 1000, 12);
  const pass6 = !missingCoeffRes.canCalculate && missingCoeffRes.errorMessage !== undefined;
  results.push({
    name: "Missing temperature coefficient handles safely",
    passed: pass6,
    message: pass6 ? "Safely returned cannot calculate status" : "Failed to handle missing coeff",
  });

  return results;
}
