import { runPvTests } from "./pv.test";
import { runLoadTests } from "./load.test";
import { runBatteryAndGenTests } from "./batteryAndGen.test";

export interface TestSuiteResult {
  suiteName: string;
  tests: { name: string; passed: boolean; message: string }[];
  passedCount: number;
  totalCount: number;
}

export function runAllEngineeringUnitTests(): TestSuiteResult[] {
  const pvTests = runPvTests();
  const loadTests = runLoadTests();
  const batGenTests = runBatteryAndGenTests();

  return [
    {
      suiteName: "PV String & Cold Voc Calculations",
      tests: pvTests,
      passedCount: pvTests.filter((t) => t.passed).length,
      totalCount: pvTests.length,
    },
    {
      suiteName: "Load Schedule & Energy Analysis",
      tests: loadTests,
      passedCount: loadTests.filter((t) => t.passed).length,
      totalCount: loadTests.length,
    },
    {
      suiteName: "Battery Runtime & Generator Sizing",
      tests: batGenTests,
      passedCount: batGenTests.filter((t) => t.passed).length,
      totalCount: batGenTests.length,
    },
  ];
}
