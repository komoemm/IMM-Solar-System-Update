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
            <span className="text-xs font-bold text-slate-300">Scenario:</span>
            <select
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-100 border border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              value={workingScenario.id}
              onChange={(e) => loadScenario(e.target.value)}
            >
              {savedScenarios.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-800 text-slate-100">
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
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            💾 Save Scenario
          </button>
          <button
            onClick={() => duplicateScenario(workingScenario.id)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          >
            📋 Duplicate
          </button>
          <button
            onClick={resetToBaseline}
            className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/80 text-slate-200 hover:text-white font-medium text-xs rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
          >
            🔄 Reset to Baseline
          </button>
          <button
            onClick={exportScenarioJson}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          >
            📥 Export JSON
          </button>
          <button
            onClick={() => setShowPrintReport(true)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            🖨️ Printable Report
          </button>
        </div>
      </div>

      {/* Navigation Step Tabs */}
      <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-slate-800" aria-label="Planner steps">
        <button
          onClick={() => setActiveStep("inputs")}
          className={`px-3.5 py-2 text-xs rounded-lg whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            activeStep === "inputs"
              ? "bg-emerald-600 text-white font-semibold shadow-xs"
              : "bg-slate-900 text-slate-200 font-medium hover:bg-slate-700 hover:text-white border border-slate-700/80"
          }`}
        >
          1. System Inputs
        </button>
        <button
          onClick={() => setActiveStep("pv")}
          className={`px-3.5 py-2 text-xs rounded-lg whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            activeStep === "pv"
              ? "bg-emerald-600 text-white font-semibold shadow-xs"
              : "bg-slate-900 text-slate-200 font-medium hover:bg-slate-700 hover:text-white border border-slate-700/80"
          }`}
        >
          2. PV Topology Validator
        </button>
        <button
          onClick={() => setActiveStep("coldvoc")}
          className={`px-3.5 py-2 text-xs rounded-lg whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            activeStep === "coldvoc"
              ? "bg-emerald-600 text-white font-semibold shadow-xs"
              : "bg-slate-900 text-slate-200 font-medium hover:bg-slate-700 hover:text-white border border-slate-700/80"
          }`}
        >
          2B. Cold Voc Calculator
        </button>
        <button
          onClick={() => setActiveStep("load")}
          className={`px-3.5 py-2 text-xs rounded-lg whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            activeStep === "load"
              ? "bg-emerald-600 text-white font-semibold shadow-xs"
              : "bg-slate-900 text-slate-200 font-medium hover:bg-slate-700 hover:text-white border border-slate-700/80"
          }`}
        >
          3. Load Schedule
        </button>
        <button
          onClick={() => setActiveStep("battery")}
          className={`px-3.5 py-2 text-xs rounded-lg whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            activeStep === "battery"
              ? "bg-emerald-600 text-white font-semibold shadow-xs"
              : "bg-slate-900 text-slate-200 font-medium hover:bg-slate-700 hover:text-white border border-slate-700/80"
          }`}
        >
          4. Battery Runtime
        </button>
        <button
          onClick={() => setActiveStep("generator")}
          className={`px-3.5 py-2 text-xs rounded-lg whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            activeStep === "generator"
              ? "bg-emerald-600 text-white font-semibold shadow-xs"
              : "bg-slate-900 text-slate-200 font-medium hover:bg-slate-700 hover:text-white border border-slate-700/80"
          }`}
        >
          5. Generator Screening
        </button>
        <button
          onClick={() => setActiveStep("review")}
          className={`px-3.5 py-2 text-xs rounded-lg whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            activeStep === "review"
              ? "bg-slate-900 text-emerald-400 font-semibold border border-emerald-500/50 shadow-xs"
              : "bg-slate-900 text-slate-200 font-medium hover:bg-slate-700 hover:text-white border border-slate-700/80"
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
