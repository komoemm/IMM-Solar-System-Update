import { useState } from "react";
import { PlannerScenario } from "../../types/planner";
import { calculateColdVocForPanel } from "../../utils/pvCalculations";
import { StatusBadge } from "./StatusBadge";

interface ColdVocCalculatorProps {
  scenario: PlannerScenario;
  onChange: (updated: PlannerScenario) => void;
}

export const ColdVocCalculator: React.FC<ColdVocCalculatorProps> = ({ scenario, onChange }) => {
  const { panelSpecs, inverterSpecs, pvStrings } = scenario;
  const [selectedStringId, setSelectedStringId] = useState<string>(pvStrings[0]?.id || "S1-01");

  const selectedString = pvStrings.find((s) => s.id === selectedStringId) || pvStrings[0];
  const stringPanelCount = selectedString ? selectedString.panelCount : 12;

  const result = calculateColdVocForPanel(
    panelSpecs.voc,
    panelSpecs.vocTempCoeff,
    panelSpecs.minDesignTemp,
    inverterSpecs.maxPvInputVoltageV,
    stringPanelCount
  );

  const handleUpdateCoeff = (valStr: string) => {
    const val = valStr === "" ? null : parseFloat(valStr);
    onChange({
      ...scenario,
      panelSpecs: { ...scenario.panelSpecs, vocTempCoeff: val },
    });
  };

  const handleUpdateMinTemp = (valStr: string) => {
    const val = valStr === "" ? null : parseFloat(valStr);
    onChange({
      ...scenario,
      panelSpecs: { ...scenario.panelSpecs, minDesignTemp: val },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 text-slate-100 p-5 rounded-xl border border-slate-700 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-emerald-400">Step 2B: Cold-Temperature Voc Voltage Calculator</h3>
            <p className="text-sm text-slate-300 mt-1">
              Standard engineering calculation for maximum open-circuit voltage at minimum site design temperature to prevent inverter DC overvoltage damage.
            </p>
          </div>
          <StatusBadge status={result.canCalculate ? "CALCULATED ESTIMATE" : "TO CONFIRM"} size="md" />
        </div>
      </div>

      {/* Input Parameters Box */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xs space-y-4">
        <h4 className="font-bold text-slate-100 text-base">Calculation Inputs & String Selection</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="voc-string-sel" className="block text-xs font-semibold text-slate-300 mb-1">
              Select PV String to Evaluate
            </label>
            <select
              id="voc-string-sel"
              className="w-full px-3 py-2 text-sm bg-slate-800 text-slate-100 border border-slate-600 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              value={selectedStringId}
              onChange={(e) => setSelectedStringId(e.target.value)}
            >
              {pvStrings.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-800 text-slate-100">
                  String {s.id} ({s.panelCount} panels, Inverter {s.inverterId}, MPPT {s.mpptIndex})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="voc-panel-stc" className="block text-xs font-semibold text-slate-300 mb-1">
              Module Voc at STC (25°C)
            </label>
            <div className="text-sm font-bold text-slate-100 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg">
              {panelSpecs.voc !== null ? `${panelSpecs.voc} V DC` : "Not specified"}
            </div>
          </div>

          <div>
            <label htmlFor="voc-temp-coeff" className="block text-xs font-semibold text-slate-300 mb-1">
              Voc Temperature Coeff (%/°C)
            </label>
            <input
              id="voc-temp-coeff"
              type="number"
              step="0.01"
              placeholder="e.g. -0.26"
              className="w-full px-3 py-2 text-sm bg-slate-800 text-slate-100 border border-slate-600 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-slate-400"
              value={panelSpecs.vocTempCoeff ?? ""}
              onChange={(e) => handleUpdateCoeff(e.target.value)}
            />
            {result.coeffDecimal !== null && (
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Decimal factor: {result.coeffDecimal.toFixed(4)} /°C
              </span>
            )}
          </div>

          <div>
            <label htmlFor="voc-min-temp" className="block text-xs font-semibold text-slate-300 mb-1">
              Minimum Site Design Temp (°C)
            </label>
            <input
              id="voc-min-temp"
              type="number"
              placeholder="e.g. 10"
              className="w-full px-3 py-2 text-sm bg-slate-800 text-slate-100 border border-slate-600 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-slate-400"
              value={panelSpecs.minDesignTemp ?? ""}
              onChange={(e) => handleUpdateMinTemp(e.target.value)}
            />
            {result.deltaT !== null && (
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Delta: ΔT = 25 - ({panelSpecs.minDesignTemp}) = {result.deltaT}°C
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Formula & Calculation Result Banner */}
      {result.canCalculate ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">STC String Voc (25°C)</span>
              <div className="text-xl font-bold text-slate-100 mt-1">
                {((panelSpecs.voc ?? 0) * stringPanelCount).toFixed(1)} V DC
              </div>
              <span className="text-xs text-slate-400 mt-0.5 block">
                {stringPanelCount} panels × {panelSpecs.voc} V
              </span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">
                Calculated Cold Voc ({panelSpecs.minDesignTemp}°C)
              </span>
              <div
                className={`text-xl font-black mt-1 ${
                  result.isOverLimit
                    ? "text-rose-400"
                    : result.isLowHeadroom
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {result.stringVocCold?.toFixed(1)} V DC
              </div>
              <span className="text-xs text-slate-400 mt-0.5 block">
                Module Voc_cold = {result.panelVocCold?.toFixed(2)} V
              </span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Inverter Max Voltage Limit</span>
              <div className="text-xl font-bold text-slate-100 mt-1">
                {inverterSpecs.maxPvInputVoltageV ?? 1000} V DC
              </div>
              <span className="text-xs text-slate-400 mt-0.5 block">{inverterSpecs.model}</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Voltage Headroom</span>
              <div
                className={`text-xl font-bold mt-1 ${
                  result.isOverLimit ? "text-rose-400" : result.isLowHeadroom ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {result.headroomV?.toFixed(1)} V ({result.headroomPercent?.toFixed(1)}%)
              </div>
              <span className="text-xs text-slate-400 mt-0.5 block">Margin below max limit</span>
            </div>
          </div>

          {/* Status Warning Banner */}
          {result.isOverLimit && (
            <div className="p-4 bg-rose-950 text-rose-100 rounded-xl border border-rose-800 text-sm">
              <strong className="block text-base font-bold text-white mb-1">
                ❌ BLOCKING ERROR: Cold-Weather Voltage Limit Exceeded!
              </strong>
              <p>
                Calculated cold Voc ({result.stringVocCold?.toFixed(1)} V) exceeds the inverter maximum limit of{" "}
                {inverterSpecs.maxPvInputVoltageV} V DC. Reduce string panel count immediately to prevent inverter failure.
              </p>
            </div>
          )}

          {result.isLowHeadroom && !result.isOverLimit && (
            <div className="p-4 bg-amber-950 text-amber-100 rounded-xl border border-amber-800 text-sm">
              <strong className="block text-base font-bold text-white mb-1">
                🔍 ENGINEERING REVIEW REQUIRED: Low Voltage Headroom
              </strong>
              <p>
                Remaining voltage headroom is small ({result.headroomV?.toFixed(1)} V / {result.headroomPercent?.toFixed(1)}%).
                Confirm historical minimum temperature records and local grid standards before design sign-off.
              </p>
            </div>
          )}

          {!result.isOverLimit && !result.isLowHeadroom && (
            <div className="p-4 bg-emerald-950 text-emerald-200 rounded-xl border border-emerald-800 text-xs">
              <strong className="block text-sm font-bold text-emerald-300 mb-1">✓ Adequate Cold Voc Voltage Headroom</strong>
              <p>
                Calculated cold Voc of {result.stringVocCold?.toFixed(1)} V at {panelSpecs.minDesignTemp}°C leaves{" "}
                {result.headroomV?.toFixed(1)} V headroom ({result.headroomPercent?.toFixed(1)}%) below the{" "}
                {inverterSpecs.maxPvInputVoltageV} V DC maximum limit.
              </p>
            </div>
          )}

          {/* Formula Reference Card */}
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-slate-200 block text-xs">Standard Reference Formula:</span>
            <code className="text-emerald-300">
              Voc_cold = Voc_STC × [1 + |coeff_decimal| × (25 − T_min)] = {panelSpecs.voc} × [1 + {result.coeffDecimal?.toFixed(4)} × (25 − {panelSpecs.minDesignTemp})] = {result.panelVocCold?.toFixed(2)} V
            </code>
            <p className="pt-1 text-[11px] text-slate-400">
              Note: Cold temperature Voc calculations are screening estimates based on entered parameters. Local electrical codes and manufacturer sign-off govern final compliance.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-orange-950/80 text-orange-200 rounded-xl border border-orange-800 text-sm">
          <strong className="block font-bold text-orange-300 mb-1">⚠️ Input Required for Cold Voc Calculation</strong>
          <p>{result.errorMessage}</p>
        </div>
      )}
    </div>
  );
};
