import React, { useState } from "react";
import { usePlannerScenario } from "../../hooks/usePlannerScenario";
import { SystemInputs } from "./SystemInputs";
import { PVStringValidator } from "./PVStringValidator";
import { ColdVocCalculator } from "./ColdVocCalculator";
import { LoadSchedule } from "./LoadSchedule";
import { BatteryRuntimeEstimator } from "./BatteryRuntimeEstimator";
import { GeneratorEstimator } from "./GeneratorEstimator";
import { EngineeringReviewSummary } from "./EngineeringReviewSummary";
import { PrintableReport } from "./PrintableReport";
import { StatusBadge } from "./StatusBadge";

export type StepId = "inputs" | "pv" | "coldvoc" | "load" | "battery" | "generator" | "review" | "report";

export const EngineeringPlannerContainer: React.FC = () => {
  const {
    workingScenario,
    setWorkingScenario,
    savedScenarios,
    resetToBaseline,
    saveWorkingScenario,
    loadScenario,
    duplicateScenario,
    exportScenarioJson,
    importScenarioJson,
  } = usePlannerScenario();

  const [activeStep, setActiveStep] = useState<StepId>("inputs");
  const [showPrintReport, setShowPrintReport] = useState<boolean>(false);

  if (showPrintReport) {
    return <PrintableReport scenario={workingScenario} onBack={() => setShowPrintReport(false)} />;
  }

  return (
    <div className="space-y-6">
      {/* Scenario Governance Bar */}
      <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Scenario:</span>
            <select
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-100 border border-slate-700 focus:ring-2 focus:ring-emerald-500"
              value={workingScenario.id}
              onChange={(e) => loadScenario(e.target.value)}
            >
              {savedScenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.isBaseline ? " (Verified Baseline)" : ""}
                </option>
              ))}
            </select>
          </div>

          <StatusBadge status={workingScenario.isBaseline ? "CONFIRMED SPECIFICATION" : "USER INPUT"} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const name = prompt("Enter scenario name:", workingScenario.name);
              if (name) saveWorkingScenario(name);
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            💾 Save Scenario
          </button>
          <button
            onClick={() => duplicateScenario(workingScenario.id)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            📋 Duplicate
          </button>
          <button
            onClick={resetToBaseline}
            className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            🔄 Reset to Baseline
          </button>
          <button
            onClick={exportScenarioJson}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            📥 Export JSON
          </button>
          <button
            onClick={() => setShowPrintReport(true)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            🖨️ Printable Report
          </button>
        </div>
      </div>

      {/* Navigation Step Tabs */}
      <nav className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800" aria-label="Planner steps">
        <button
          onClick={() => setActiveStep("inputs")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
            activeStep === "inputs"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          1. System Inputs
        </button>
        <button
          onClick={() => setActiveStep("pv")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
            activeStep === "pv"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          2. PV Topology Validator
        </button>
        <button
          onClick={() => setActiveStep("coldvoc")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
            activeStep === "coldvoc"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          2B. Cold Voc Calculator
        </button>
        <button
          onClick={() => setActiveStep("load")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
            activeStep === "load"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          3. Load Schedule
        </button>
        <button
          onClick={() => setActiveStep("battery")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
            activeStep === "battery"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          4. Battery Runtime
        </button>
        <button
          onClick={() => setActiveStep("generator")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
            activeStep === "generator"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          5. Generator Screening
        </button>
        <button
          onClick={() => setActiveStep("review")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
            activeStep === "review"
              ? "bg-slate-900 text-emerald-400 shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          6. Engineering Audit Summary
        </button>
      </nav>

      {/* Step Views */}
      {activeStep === "inputs" && <SystemInputs scenario={workingScenario} onChange={setWorkingScenario} />}
      {activeStep === "pv" && <PVStringValidator scenario={workingScenario} onChange={setWorkingScenario} />}
      {activeStep === "coldvoc" && <ColdVocCalculator scenario={workingScenario} onChange={setWorkingScenario} />}
      {activeStep === "load" && <LoadSchedule scenario={workingScenario} onChange={setWorkingScenario} />}
      {activeStep === "battery" && <BatteryRuntimeEstimator scenario={workingScenario} onChange={setWorkingScenario} />}
      {activeStep === "generator" && <GeneratorEstimator scenario={workingScenario} onChange={setWorkingScenario} />}
      {activeStep === "review" && (
        <EngineeringReviewSummary
          scenario={workingScenario}
          onSelectStep={(step) => setActiveStep(step as StepId)}
          onResetToBaseline={resetToBaseline}
          onExportJson={exportScenarioJson}
          onImportJson={(jsonStr) => {
            const res = importScenarioJson(jsonStr);
            alert(res.message);
          }}
        />
      )}
    </div>
  );
};
