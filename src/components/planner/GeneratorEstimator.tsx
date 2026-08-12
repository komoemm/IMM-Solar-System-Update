import React, { useState } from "react";
import { PlannerScenario } from "../../types/planner";
import { calculateGeneratorScreening, validateGeneratorSpecs } from "../../utils/generatorCalculations";
import { summarizeLoadSchedule } from "../../utils/loadCalculations";
import { StatusBadge } from "./StatusBadge";

interface GeneratorEstimatorProps {
  scenario: PlannerScenario;
  onChange: (updated: PlannerScenario) => void;
}

export const GeneratorEstimator: React.FC<GeneratorEstimatorProps> = ({ scenario, onChange }) => {
  const { gridAndGen, loads, inverterSpecs } = scenario;
  const totalInverterKw = (inverterSpecs.quantity ?? 2) * (inverterSpecs.ratedAcPowerKw ?? 50);
  const loadSummary = summarizeLoadSchedule(loads, totalInverterKw);

  const [simultaneousChargeKw, setSimultaneousChargeKw] = useState<number>(15.0);

  const res = calculateGeneratorScreening(gridAndGen, loadSummary.criticalRunningKw, simultaneousChargeKw);
  const validationIssues = validateGeneratorSpecs(gridAndGen, loadSummary.criticalRunningKw);

  const handleUpdateGridGen = (field: keyof typeof gridAndGen, value: unknown) => {
    onChange({
      ...scenario,
      gridAndGen: { ...scenario.gridAndGen, [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 text-slate-100 p-5 rounded-xl border border-slate-700 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-emerald-400">Step 5: Generator Capacity Screening Estimator</h3>
            <p className="text-sm text-slate-300 mt-1">
              Screening tool for sizing standby diesel generators, integration architecture, simultaneous battery charging allowances, and anti-backfeed relay controls.
            </p>
          </div>
          <StatusBadge status={gridAndGen.generatorRatedKva !== null ? "CALCULATED ESTIMATE" : "TO CONFIRM"} size="md" />
        </div>
      </div>

      {/* Integration Architecture Selector */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xs space-y-4">
        <h4 className="font-bold text-slate-100 text-base">
          1. Generator Integration Architecture Route
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              gridAndGen.generatorArchitecture === "Not selected"
                ? "border-amber-500 bg-amber-950/40"
                : "border-slate-700 bg-slate-800 hover:bg-slate-700"
            }`}
          >
            <input
              type="radio"
              name="gen-arch"
              className="sr-only"
              checked={gridAndGen.generatorArchitecture === "Not selected"}
              onChange={() => handleUpdateGridGen("generatorArchitecture", "Not selected")}
            />
            <strong className="block text-sm font-bold text-slate-100 mb-1">
              To Confirm / Not Selected
            </strong>
            <p className="text-xs text-slate-400">
              Architecture route pending M&E engineer site survey and utility grid connection agreement.
            </p>
          </label>

          <label
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              gridAndGen.generatorArchitecture === "ATS-fed inverter grid-input route"
                ? "border-emerald-500 bg-emerald-950/40"
                : "border-slate-700 bg-slate-800 hover:bg-slate-700"
            }`}
          >
            <input
              type="radio"
              name="gen-arch"
              className="sr-only"
              checked={gridAndGen.generatorArchitecture === "ATS-fed inverter grid-input route"}
              onChange={() => handleUpdateGridGen("generatorArchitecture", "ATS-fed inverter grid-input route")}
            />
            <strong className="block text-sm font-bold text-slate-100 mb-1">
              Option A: Common ATS Grid-Input Route
            </strong>
            <p className="text-xs text-slate-400">
              Generator connects to Main ATS supplying the inverter AC Grid port. Simple installation, requires fast anti-backfeed shutdown.
            </p>
          </label>

          <label
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              gridAndGen.generatorArchitecture === "Dedicated Solis GEN-port route"
                ? "border-emerald-500 bg-emerald-950/40"
                : "border-slate-700 bg-slate-800 hover:bg-slate-700"
            }`}
          >
            <input
              type="radio"
              name="gen-arch"
              className="sr-only"
              checked={gridAndGen.generatorArchitecture === "Dedicated Solis GEN-port route"}
              onChange={() => handleUpdateGridGen("generatorArchitecture", "Dedicated Solis GEN-port route")}
            />
            <strong className="block text-sm font-bold text-slate-100 mb-1">
              Option B: Solis Hybrid Dedicated GEN-Port Route
            </strong>
            <p className="text-xs text-slate-400">
              Generator wired directly to inverter dedicated GEN terminals. Inverter controls auto generator start contact & charge power limit.
            </p>
          </label>
        </div>
      </div>

      {/* Generator Specs Form */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xs space-y-4">
        <h4 className="font-bold text-slate-100 text-base">
          2. Generator Parameters & Charging Assumptions
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="gen-kva-inp" className="block text-xs font-semibold text-slate-300 mb-1">
              Generator Rated kVA (Blank if unknown)
            </label>
            <input
              id="gen-kva-inp"
              type="number"
              placeholder="e.g. 150 or leave blank"
              className="w-full px-3 py-2 text-sm bg-slate-800 text-slate-100 border border-slate-600 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-slate-400"
              value={gridAndGen.generatorRatedKva ?? ""}
              onChange={(e) => handleUpdateGridGen("generatorRatedKva", parseFloat(e.target.value) || null)}
            />
          </div>

          <div>
            <label htmlFor="gen-pf-inp" className="block text-xs font-semibold text-slate-300 mb-1">
              Power Factor (cos φ)
            </label>
            <input
              id="gen-pf-inp"
              type="number"
              step="0.05"
              placeholder="e.g. 0.8"
              className="w-full px-3 py-2 text-sm bg-slate-800 text-slate-100 border border-slate-600 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-slate-400"
              value={gridAndGen.generatorPowerFactor ?? ""}
              onChange={(e) => handleUpdateGridGen("generatorPowerFactor", parseFloat(e.target.value) || 0.8)}
            />
          </div>

          <div>
            <label htmlFor="gen-limit-inp" className="block text-xs font-semibold text-slate-300 mb-1">
              Continuous Loading Limit (%)
            </label>
            <input
              id="gen-limit-inp"
              type="number"
              placeholder="e.g. 80"
              className="w-full px-3 py-2 text-sm bg-slate-800 text-slate-100 border border-slate-600 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-slate-400"
              value={gridAndGen.generatorContinuousLimitPercent ?? ""}
              onChange={(e) => handleUpdateGridGen("generatorContinuousLimitPercent", parseFloat(e.target.value) || 80)}
            />
          </div>

          <div>
            <label htmlFor="gen-chgkw-inp" className="block text-xs font-semibold text-slate-300 mb-1">
              Simultaneous Battery Charging (kW)
            </label>
            <input
              id="gen-chgkw-inp"
              type="number"
              placeholder="e.g. 15"
              className="w-full px-3 py-2 text-sm bg-slate-800 text-slate-100 border border-slate-600 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-slate-400"
              value={simultaneousChargeKw}
              onChange={(e) => setSimultaneousChargeKw(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* Output Results Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Min Rating (Critical Load Only)</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {res.recommendedMinKva.toFixed(0)} kVA
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Covers {loadSummary.criticalRunningKw.toFixed(1)} kW load at {res.loadingLimitPercent}% limit
          </span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Min Rating (Load + Battery Charge)</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {res.recommendedWithChargingKva.toFixed(0)} kVA
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Covers {res.totalRequiredKw.toFixed(1)} kW total demand
          </span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Selected Generator Status</span>
          <div
            className={`text-2xl font-black mt-1 ${
              res.selectedGenKva === null
                ? "text-slate-400"
                : res.isOverloaded
                ? "text-rose-400"
                : "text-emerald-400"
            }`}
          >
            {res.selectedGenKva !== null ? `${res.selectedGenKva} kVA` : "To Confirm"}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            {res.selectedGenAvailableKw !== null
              ? `Available: ${res.selectedGenAvailableKw.toFixed(1)} kW (${res.loadingLimitPercent}% limit)`
              : "No generator specified"}
          </span>
        </div>
      </div>

      {/* Protection & Engineering Warnings Box */}
      <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 space-y-3">
        <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
          <span>⚠️ Mandatory Generator Protection Engineering Requirements</span>
        </h4>
        <div className="space-y-2 text-xs">
          {validationIssues.map((issue) => (
            <div key={issue.id} className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <strong className="text-amber-300 font-bold block mb-1">{issue.title}:</strong>
              <p className="text-slate-300">{issue.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
