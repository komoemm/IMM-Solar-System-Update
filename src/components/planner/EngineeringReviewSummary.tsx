import React, { useState } from "react";
import { PlannerScenario, ValidationIssue } from "../../types/planner";
import { validatePVStrings } from "../../utils/pvCalculations";
import { validateLoadSchedule, summarizeLoadSchedule } from "../../utils/loadCalculations";
import { validateBatterySpecs, calculateBatteryRuntime } from "../../utils/batteryCalculations";
import { validateGeneratorSpecs, calculateGeneratorScreening } from "../../utils/generatorCalculations";
import { runAllEngineeringUnitTests, TestSuiteResult } from "../../utils/__tests__/run-tests";
import { StatusBadge } from "./StatusBadge";

interface EngineeringReviewSummaryProps {
  scenario: PlannerScenario;
  onSelectStep: (stepId: string) => void;
  onResetToBaseline: () => void;
  onExportJson: () => void;
  onImportJson: (jsonStr: string) => void;
}

export const EngineeringReviewSummary: React.FC<EngineeringReviewSummaryProps> = ({
  scenario,
  onSelectStep,
  onResetToBaseline,
  onExportJson,
  onImportJson,
}) => {
  const [qaResults, setQaResults] = useState<TestSuiteResult[] | null>(null);

  const totalInverterKw = (scenario.inverterSpecs.quantity ?? 2) * (scenario.inverterSpecs.ratedAcPowerKw ?? 50);
  const loadSummary = summarizeLoadSchedule(scenario.loads, totalInverterKw);
  const batteryRuntime = calculateBatteryRuntime(scenario.batterySpecs, loadSummary.criticalRunningKw);
  const genScreening = calculateGeneratorScreening(scenario.gridAndGen, loadSummary.criticalRunningKw);

  const pvIssues = validatePVStrings(scenario);
  const loadIssues = validateLoadSchedule(scenario.loads, totalInverterKw);
  const batteryIssues = validateBatterySpecs(scenario.batterySpecs, loadSummary.criticalRunningKw);
  const genIssues = validateGeneratorSpecs(scenario.gridAndGen, loadSummary.criticalRunningKw);

  const allIssues: ValidationIssue[] = [...pvIssues, ...loadIssues, ...batteryIssues, ...genIssues];

  const blockingErrors = allIssues.filter((i) => i.severity === "error");
  const warnings = allIssues.filter((i) => i.severity === "warning");
  const engineerRequired = allIssues.filter((i) => i.severity === "engineer_required");

  const handleRunQa = () => {
    setQaResults(runAllEngineeringUnitTests());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) onImportJson(content);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-slate-100 p-6 rounded-xl border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">System Review & Governance</span>
            <h3 className="text-2xl font-black text-white mt-1">Engineering Review & Compliance Summary</h3>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Consolidated audit of all specification statuses, PV voltage margins, inverter load factors, generator protection rules, and automated calculations QA suite.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunQa}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              🧪 Run Calculations QA Test Suite
            </button>
            <button
              onClick={onExportJson}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              Export JSON
            </button>
            <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 cursor-pointer transition-colors">
              Import JSON
              <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
            </label>
            <button
              onClick={onResetToBaseline}
              className="px-3 py-2 bg-slate-800 hover:bg-rose-900 text-slate-200 hover:text-rose-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              Reset to Baseline
            </button>
          </div>
        </div>
      </div>

      {/* QA Test Suite Modal/Card if triggered */}
      {qaResults && (
        <div className="bg-slate-950 text-slate-100 p-6 rounded-xl border border-emerald-500/50 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-emerald-400 text-base flex items-center gap-2">
              <span>🧪 Calculations QA Test Suite Results</span>
            </h4>
            <button onClick={() => setQaResults(null)} className="text-xs text-slate-400 hover:text-white">
              Close QA Results
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {qaResults.map((suite) => (
              <div key={suite.suiteName} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-slate-200">{suite.suiteName}</strong>
                  <span className="text-xs font-extrabold text-emerald-400">
                    {suite.passedCount} / {suite.totalCount} Passed
                  </span>
                </div>
                <div className="space-y-1">
                  {suite.tests.map((t) => (
                    <div key={t.name} className="text-[11px] flex items-center justify-between p-1.5 bg-slate-950 rounded">
                      <span className="text-slate-300">{t.name}</span>
                      <span className={`font-bold ${t.passed ? "text-emerald-400" : "text-rose-400"}`}>
                        {t.passed ? "✓ PASS" : "❌ FAIL"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Blocking Errors</span>
          <div className={`text-2xl font-black mt-1 ${blockingErrors.length > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {blockingErrors.length}
          </div>
          <span className="text-xs text-slate-500 mt-0.5 block">Equipment risk / rule breaches</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Engineering Warnings</span>
          <div className={`text-2xl font-black mt-1 ${warnings.length > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {warnings.length}
          </div>
          <span className="text-xs text-slate-500 mt-0.5 block">Operational & capacity checks</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Engineer Sign-Off Actions</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {engineerRequired.length}
          </div>
          <span className="text-xs text-slate-500 mt-0.5 block">Confirmation required by M&E</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">System Baseline Status</span>
          <div className="mt-2">
            <StatusBadge status={scenario.isBaseline ? "CONFIRMED SPECIFICATION" : "USER INPUT"} size="md" />
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {scenario.isBaseline ? "120.70 kWp Verified Baseline" : "Modified Working Scenario"}
          </span>
        </div>
      </div>

      {/* System Parameter Audit Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            System Specification Audit Matrix
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Parameter Group</th>
                <th className="p-3">Specification / Value</th>
                <th className="p-3">Data Status</th>
                <th className="p-3">Engineering Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">PV Array Capacity</td>
                <td className="p-3">{((scenario.panelSpecs.quantity ?? 170) * (scenario.panelSpecs.wattage ?? 710) / 1000).toFixed(2)} kWp ({scenario.panelSpecs.quantity} × {scenario.panelSpecs.wattage}W)</td>
                <td className="p-3"><StatusBadge status={scenario.panelSpecs.status} /></td>
                <td className="p-3 text-slate-500"><button onClick={() => onSelectStep("pv")} className="hover:underline text-emerald-600">Review Strings</button></td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">Inverter Capacity</td>
                <td className="p-3">{scenario.inverterSpecs.quantity} × {scenario.inverterSpecs.ratedAcPowerKw} kW ({totalInverterKw} kW Total AC)</td>
                <td className="p-3"><StatusBadge status={scenario.inverterSpecs.status} /></td>
                <td className="p-3 text-slate-500"><button onClick={() => onSelectStep("inputs")} className="hover:underline text-emerald-600">Edit Inverter</button></td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">Critical Running Demand</td>
                <td className="p-3">{loadSummary.criticalRunningKw.toFixed(2)} kW ({loadSummary.inverterLoadingPercent.toFixed(1)}% Inverter Load)</td>
                <td className="p-3"><StatusBadge status="CALCULATED ESTIMATE" /></td>
                <td className="p-3 text-slate-500"><button onClick={() => onSelectStep("load")} className="hover:underline text-emerald-600">View Schedule</button></td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">Battery Storage Bank</td>
                <td className="p-3">{batteryRuntime.canCalculate ? `${batteryRuntime.totalNominalKwh?.toFixed(1)} kWh (${batteryRuntime.runtimeAvgHoursFormatted} Avg)` : "To Confirm"}</td>
                <td className="p-3"><StatusBadge status={scenario.batterySpecs.status} /></td>
                <td className="p-3 text-slate-500"><button onClick={() => onSelectStep("battery")} className="hover:underline text-emerald-600">Edit Battery</button></td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">Generator Infrastructure</td>
                <td className="p-3">{genScreening.selectedGenKva !== null ? `${genScreening.selectedGenKva} kVA (${genScreening.architecture})` : "To Confirm"}</td>
                <td className="p-3"><StatusBadge status={scenario.gridAndGen.status} /></td>
                <td className="p-3 text-slate-500"><button onClick={() => onSelectStep("generator")} className="hover:underline text-emerald-600">Edit Generator</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Engineering Sign-off Box */}
      <div className="p-6 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 space-y-3">
        <h4 className="font-bold text-amber-400 text-sm uppercase tracking-wider">
          M&E Professional Engineering Review Disclaimer
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          The calculation outputs, runtime estimates, and generator screening ratings provided by this explorer are preliminary conceptual planning calculations only. They do NOT constitute construction-approved engineering designs. Final procurement, electrical protection relay setting, and physical installation must be stamped and approved by a registered professional Electrical Engineer.
        </p>
      </div>
    </div>
  );
};
