import React from "react";
import { PlannerScenario } from "../../types/planner";
import { calculateBatteryRuntime, validateBatterySpecs } from "../../utils/batteryCalculations";
import { summarizeLoadSchedule } from "../../utils/loadCalculations";
import { StatusBadge } from "./StatusBadge";

interface BatteryRuntimeEstimatorProps {
  scenario: PlannerScenario;
  onChange: (updated: PlannerScenario) => void;
}

export const BatteryRuntimeEstimator: React.FC<BatteryRuntimeEstimatorProps> = ({ scenario, onChange }) => {
  const { batterySpecs, loads, inverterSpecs } = scenario;
  const totalInverterKw = (inverterSpecs.quantity ?? 2) * (inverterSpecs.ratedAcPowerKw ?? 50);
  const loadSummary = summarizeLoadSchedule(loads, totalInverterKw);

  const runtime = calculateBatteryRuntime(batterySpecs, loadSummary.criticalRunningKw);
  const validationIssues = validateBatterySpecs(batterySpecs, loadSummary.criticalRunningKw);

  const handleUpdateBattery = (field: keyof typeof batterySpecs, value: unknown) => {
    onChange({
      ...scenario,
      batterySpecs: { ...scenario.batterySpecs, [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 text-slate-100 p-5 rounded-xl border border-slate-700 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-emerald-400">Step 4: Battery Storage & Backup Runtime Estimator</h3>
            <p className="text-sm text-slate-300 mt-1">
              Screening tool for estimating emergency autonomy runtime based on critical load profile, depth of discharge, and inverter conversion efficiency.
            </p>
          </div>
          <StatusBadge status={runtime.canCalculate ? "CALCULATED ESTIMATE" : "TO CONFIRM"} size="md" />
        </div>
      </div>

      {/* Inputs Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">Battery Parameters & DoD Settings</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="bat-volts-inp" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Module Voltage (V)</label>
            <input
              id="bat-volts-inp"
              type="number"
              placeholder="e.g. 51.2"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={batterySpecs.moduleNominalVoltageV ?? ""}
              onChange={(e) => handleUpdateBattery("moduleNominalVoltageV", parseFloat(e.target.value) || null)}
            />
          </div>

          <div>
            <label htmlFor="bat-ah-inp" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Module Ah Capacity</label>
            <input
              id="bat-ah-inp"
              type="number"
              placeholder="e.g. 280"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={batterySpecs.moduleCapacityAh ?? ""}
              onChange={(e) => handleUpdateBattery("moduleCapacityAh", parseFloat(e.target.value) || null)}
            />
          </div>

          <div>
            <label htmlFor="bat-series-inp" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Modules in Series</label>
            <input
              id="bat-series-inp"
              type="number"
              placeholder="e.g. 10"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={batterySpecs.modulesInSeries ?? ""}
              onChange={(e) => handleUpdateBattery("modulesInSeries", parseInt(e.target.value) || null)}
            />
          </div>

          <div>
            <label htmlFor="bat-parallel-inp" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Parallel Strings</label>
            <input
              id="bat-parallel-inp"
              type="number"
              placeholder="e.g. 2"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={batterySpecs.parallelStrings ?? ""}
              onChange={(e) => handleUpdateBattery("parallelStrings", parseInt(e.target.value) || null)}
            />
          </div>

          <div>
            <label htmlFor="bat-dod-inp" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Permitted DoD (%)</label>
            <input
              id="bat-dod-inp"
              type="number"
              placeholder="e.g. 80"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={batterySpecs.permittedDoDPercent ?? ""}
              onChange={(e) => handleUpdateBattery("permittedDoDPercent", parseFloat(e.target.value) || 80)}
            />
          </div>

          <div>
            <label htmlFor="bat-eff-inp" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Inverter Efficiency (%)</label>
            <input
              id="bat-eff-inp"
              type="number"
              placeholder="e.g. 95"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={batterySpecs.inverterEfficiencyPercent ?? ""}
              onChange={(e) => handleUpdateBattery("inverterEfficiencyPercent", parseFloat(e.target.value) || 95)}
            />
          </div>

          <div>
            <label htmlFor="bat-critkw-inp" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Critical Running Load (kW)</label>
            <div className="text-sm font-bold text-amber-600 dark:text-amber-400 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {loadSummary.criticalRunningKw.toFixed(2)} kW (From Schedule)
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Output Cards */}
      {runtime.canCalculate ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Nominal Energy</span>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {runtime.totalNominalKwh?.toFixed(1)} kWh
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">
                {runtime.nominalVoltageV?.toFixed(1)} V DC | {runtime.bankAh} Ah
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Usable Battery Storage</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {runtime.usableKwh?.toFixed(1)} kWh
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">
                At {batterySpecs.permittedDoDPercent ?? 80}% Depth of Discharge
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Delivered AC Energy</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {runtime.deliveredKwh?.toFixed(1)} kWh
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">
                At {batterySpecs.inverterEfficiencyPercent ?? 95}% Inverter Efficiency
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Estimated Average Runtime</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {runtime.runtimeAvgHoursFormatted}
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">
                At {loadSummary.criticalRunningKw.toFixed(1)} kW average load
              </span>
            </div>
          </div>

          {/* 3 Loading Scenarios Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Runtime Screening Under Differing Load Scenarios
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500">Scenario A: Average Critical Load</span>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {runtime.runtimeAvgHoursFormatted}
                </div>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Load Demand: {loadSummary.criticalRunningKw.toFixed(1)} kW
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500">Scenario B: Peak Critical Demand</span>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {runtime.runtimePeakHoursFormatted}
                </div>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Peak Load (+35%): {(loadSummary.criticalRunningKw * 1.35).toFixed(1)} kW
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500">Scenario C: Night Essential Load</span>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {runtime.runtimeNightHoursFormatted}
                </div>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Night Load (50%): {(loadSummary.criticalRunningKw * 0.5).toFixed(1)} kW
                </span>
              </div>
            </div>
          </div>

          {/* Warnings & Engineering Disclaimers */}
          {validationIssues.length > 0 && (
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">Battery System Warnings</h4>
              {validationIssues.map((issue) => (
                <div key={issue.id} className="p-2.5 bg-slate-800 rounded-lg text-xs border border-slate-700">
                  <span className="font-bold text-amber-300 mr-2">{issue.title}:</span>
                  <span className="text-slate-300">{issue.description}</span>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <strong className="font-bold text-slate-800 dark:text-slate-200 block text-xs">Engineering Disclaimer:</strong>
            <p>
              Runtime estimations are preliminary screening calculations. Actual battery discharge duration varies based on ambient cell operating temperature, battery C-rate Peukert effect, BMS cell balancing limits, and cell aging state of health (SoH).
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-orange-950/80 text-orange-200 rounded-xl border border-orange-800 text-sm">
          <strong className="block font-bold text-orange-300 mb-1">To Confirm — Battery Specifications Incomplete</strong>
          <p>{runtime.errorMessage}</p>
        </div>
      )}
    </div>
  );
};
