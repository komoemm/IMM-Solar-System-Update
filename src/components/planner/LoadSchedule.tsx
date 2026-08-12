import React, { useState } from "react";
import { PlannerScenario, LoadItem, LoadCategory, LoadPhase, StartingMethod, PriorityLevel } from "../../types/planner";
import { calculateLoadItem, summarizeLoadSchedule, validateLoadSchedule } from "../../utils/loadCalculations";
import { StatusBadge } from "./StatusBadge";

interface LoadScheduleProps {
  scenario: PlannerScenario;
  onChange: (updated: PlannerScenario) => void;
}

export const LoadSchedule: React.FC<LoadScheduleProps> = ({ scenario, onChange }) => {
  const [filterMode, setFilterMode] = useState<"ALL" | "CRITICAL" | "NON_CRITICAL">("ALL");
  const [csvError, setCsvError] = useState<string | null>(null);

  const totalInverterKw = (scenario.inverterSpecs.quantity ?? 2) * (scenario.inverterSpecs.ratedAcPowerKw ?? 50);
  const summary = summarizeLoadSchedule(scenario.loads, totalInverterKw);
  const validationIssues = validateLoadSchedule(scenario.loads, totalInverterKw);

  const filteredLoads = scenario.loads.filter((item) => {
    if (filterMode === "CRITICAL") return item.isCritical;
    if (filterMode === "NON_CRITICAL") return !item.isCritical;
    return true;
  });

  const handleUpdateItem = (id: string, field: keyof LoadItem, value: unknown) => {
    const updated = scenario.loads.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange({ ...scenario, loads: updated });
  };

  const handleAddItem = () => {
    const nextNum = scenario.loads.length + 1;
    const newItem: LoadItem = {
      id: `LOAD-${nextNum.toString().padStart(2, "0")}`,
      name: "New Electrical Load",
      category: "General Power",
      isCritical: true,
      phase: "Three-phase",
      quantity: 1,
      ratedKw: 5.0,
      powerFactor: 0.85,
      efficiency: 0.9,
      startingMultiplier: 1.0,
      startingMethod: "Direct-on-line",
      dutyFactor: 0.8,
      diversityFactor: 0.9,
      operatingHoursPerDay: 8,
      priority: "Important",
      notes: "Newly added load item",
    };
    onChange({ ...scenario, loads: [...scenario.loads, newItem] });
  };

  const handleDuplicateItem = (item: LoadItem) => {
    const copy: LoadItem = {
      ...item,
      id: `LOAD-${Date.now().toString().slice(-4)}`,
      name: `${item.name} (Copy)`,
    };
    onChange({ ...scenario, loads: [...scenario.loads, copy] });
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`Remove load item "${name}" from schedule?`)) {
      onChange({ ...scenario, loads: scenario.loads.filter((item) => item.id !== id) });
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "Load ID",
      "Name",
      "Category",
      "Critical",
      "Phase",
      "Quantity",
      "Rated kW",
      "Power Factor",
      "Efficiency",
      "Starting Multiplier",
      "Starting Method",
      "Duty Factor",
      "Diversity Factor",
      "Hours/Day",
      "Priority",
      "Connected kW",
      "Running kW",
      "Running kVA",
      "Daily kWh",
      "Notes",
    ];

    const rows = scenario.loads.map((item) => {
      const calc = calculateLoadItem(item);
      return [
        item.id,
        `"${item.name}"`,
        `"${item.category}"`,
        item.isCritical ? "YES" : "NO",
        item.phase,
        item.quantity,
        item.ratedKw,
        item.powerFactor,
        item.efficiency,
        item.startingMultiplier,
        `"${item.startingMethod}"`,
        item.dutyFactor,
        item.diversityFactor,
        item.operatingHoursPerDay,
        item.priority,
        calc.connectedKw.toFixed(2),
        calc.runningKw.toFixed(2),
        calc.runningKva.toFixed(2),
        calc.dailyKwh.toFixed(2),
        `"${item.notes}"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${scenario.projectInfo.projectName || "load"}_schedule.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setCsvError("CSV file must contain a header row and at least one data row.");
          return;
        }

        const importedLoads: LoadItem[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.replace(/^"|"$/g, "").trim());
          if (cols.length < 5) continue;

          importedLoads.push({
            id: cols[0] || `CSV-${i}`,
            name: cols[1] || `Load ${i}`,
            category: (cols[2] as LoadCategory) || "General Power",
            isCritical: cols[3]?.toUpperCase() === "YES" || cols[3]?.toUpperCase() === "TRUE",
            phase: (cols[4] as LoadPhase) || "Three-phase",
            quantity: parseFloat(cols[5]) || 1,
            ratedKw: parseFloat(cols[6]) || 1.0,
            powerFactor: parseFloat(cols[7]) || 0.85,
            efficiency: parseFloat(cols[8]) || 0.9,
            startingMultiplier: parseFloat(cols[9]) || 1.0,
            startingMethod: (cols[10] as StartingMethod) || "Direct-on-line",
            dutyFactor: parseFloat(cols[11]) || 0.8,
            diversityFactor: parseFloat(cols[12]) || 0.9,
            operatingHoursPerDay: parseFloat(cols[13]) || 8,
            priority: (cols[14] as PriorityLevel) || "Important",
            notes: cols[19] || "Imported from CSV",
          });
        }

        if (importedLoads.length === 0) {
          setCsvError("No valid load items parsed from CSV file.");
          return;
        }

        onChange({ ...scenario, loads: importedLoads });
        alert(`Successfully imported ${importedLoads.length} load items from CSV!`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error reading CSV file.";
        setCsvError(msg);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 text-slate-100 p-5 rounded-xl border border-slate-700 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-emerald-400">Step 3: Load Schedule & Energy Analysis</h3>
            <p className="text-sm text-slate-300 mt-1">
              Detailed critical and non-critical load schedule calculation for sizing inverter backup capacity, phase balance, and battery runtime.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg border border-slate-600 cursor-pointer transition-colors">
              Import CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleImportCsv} />
            </label>
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg border border-slate-600 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={handleAddItem}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              + Add Load
            </button>
          </div>
        </div>
      </div>

      {csvError && (
        <div className="p-3 bg-rose-900/90 text-rose-100 rounded-lg text-xs font-medium border border-rose-700">
          ❌ CSV Import Error: {csvError}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Critical Running Demand</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {summary.criticalRunningKw.toFixed(2)} kW
          </div>
          <span className="text-xs text-slate-500 mt-0.5 block">
            {summary.criticalRunningKva.toFixed(2)} kVA | {summary.criticalDailyKwh.toFixed(1)} kWh/day
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Inverter Loading Level</span>
          <div
            className={`text-2xl font-black mt-1 ${
              summary.inverterLoadingPercent > 100
                ? "text-rose-600"
                : summary.inverterLoadingPercent > 85
                ? "text-amber-600"
                : "text-emerald-600"
            }`}
          >
            {summary.inverterLoadingPercent.toFixed(1)}%
          </div>
          <span className="text-xs text-slate-500 mt-0.5 block">
            {summary.criticalRunningKw.toFixed(1)} kW of {totalInverterKw} kW Inverter Output
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Phase Power Imbalance</span>
          <div
            className={`text-xl font-bold mt-1 ${
              summary.phaseImbalancePercent > 20 ? "text-amber-600" : "text-emerald-600"
            }`}
          >
            {summary.phaseImbalancePercent.toFixed(1)}%
          </div>
          <span className="text-xs text-slate-500 mt-0.5 block">
            L1: {summary.phaseL1Kw.toFixed(1)}kW | L2: {summary.phaseL2Kw.toFixed(1)}kW | L3: {summary.phaseL3Kw.toFixed(1)}kW
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Plant Connected Load</span>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {summary.totalConnectedKw.toFixed(2)} kW
          </div>
          <span className="text-xs text-slate-500 mt-0.5 block">
            Running Total (Incl. Non-Critical): {summary.totalRunningKw.toFixed(1)} kW
          </span>
        </div>
      </div>

      {/* Validation Warnings */}
      {validationIssues.length > 0 && (
        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 space-y-2">
          <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">Load Schedule Validation Warnings</h4>
          {validationIssues.map((issue) => (
            <div key={issue.id} className="p-2.5 bg-slate-800 rounded-lg text-xs border border-slate-700">
              <span className="font-bold text-amber-300 mr-2">{issue.title}:</span>
              <span className="text-slate-300">{issue.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <span className="text-xs font-bold text-slate-500">Filter View:</span>
        <button
          onClick={() => setFilterMode("ALL")}
          className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
            filterMode === "ALL" ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          }`}
        >
          All Loads ({scenario.loads.length})
        </button>
        <button
          onClick={() => setFilterMode("CRITICAL")}
          className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
            filterMode === "CRITICAL" ? "bg-amber-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          }`}
        >
          Critical Backup Loads ({scenario.loads.filter((l) => l.isCritical).length})
        </button>
        <button
          onClick={() => setFilterMode("NON_CRITICAL")}
          className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
            filterMode === "NON_CRITICAL" ? "bg-slate-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          }`}
        >
          Non-Critical Loads ({scenario.loads.filter((l) => !l.isCritical).length})
        </button>
      </div>

      {/* Load Schedule Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-2.5">ID & Name</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5">Critical</th>
                <th className="p-2.5">Phase</th>
                <th className="p-2.5">Qty × kW</th>
                <th className="p-2.5">PF</th>
                <th className="p-2.5">Duty/Div</th>
                <th className="p-2.5">Hours</th>
                <th className="p-2.5">Running kW</th>
                <th className="p-2.5">Daily kWh</th>
                <th className="p-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLoads.map((item) => {
                const calc = calculateLoadItem(item);

                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 min-w-[160px]">
                      <input
                        type="text"
                        className="w-full px-1.5 py-1 text-xs border rounded dark:bg-slate-800 dark:text-slate-100 font-bold"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                      />
                      <span className="text-[10px] text-slate-400 block">{item.id}</span>
                    </td>
                    <td className="p-2.5">
                      <select
                        className="px-1.5 py-1 border rounded text-xs dark:bg-slate-800 dark:text-slate-100"
                        value={item.category}
                        onChange={(e) => handleUpdateItem(item.id, "category", e.target.value as LoadCategory)}
                      >
                        <option value="Lighting">Lighting</option>
                        <option value="HVAC">HVAC</option>
                        <option value="Motors & Pumps">Motors & Pumps</option>
                        <option value="IT & Security">IT & Security</option>
                        <option value="Process Machinery">Process Machinery</option>
                        <option value="General Power">General Power</option>
                        <option value="Other">Other</option>
                      </select>
                    </td>
                    <td className="p-2.5">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                        checked={item.isCritical}
                        onChange={(e) => handleUpdateItem(item.id, "isCritical", e.target.checked)}
                      />
                    </td>
                    <td className="p-2.5">
                      <select
                        className="px-1.5 py-1 border rounded text-xs dark:bg-slate-800 dark:text-slate-100"
                        value={item.phase}
                        onChange={(e) => handleUpdateItem(item.id, "phase", e.target.value as LoadPhase)}
                      >
                        <option value="Three-phase">3-Phase</option>
                        <option value="L1">L1</option>
                        <option value="L2">L2</option>
                        <option value="L3">L3</option>
                      </select>
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <input
                        type="number"
                        className="w-10 px-1 py-0.5 border rounded text-xs dark:bg-slate-800"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                      />
                      <span className="mx-1">×</span>
                      <input
                        type="number"
                        step="0.5"
                        className="w-14 px-1 py-0.5 border rounded text-xs dark:bg-slate-800"
                        value={item.ratedKw}
                        onChange={(e) => handleUpdateItem(item.id, "ratedKw", parseFloat(e.target.value) || 0)}
                      />
                      <span className="ml-1 text-[10px] text-slate-400">kW</span>
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        step="0.05"
                        min="0.5"
                        max="1.0"
                        className="w-12 px-1 py-0.5 border rounded text-xs dark:bg-slate-800"
                        value={item.powerFactor}
                        onChange={(e) => handleUpdateItem(item.id, "powerFactor", parseFloat(e.target.value) || 0.85)}
                      />
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.05"
                        className="w-12 px-1 py-0.5 border rounded text-xs dark:bg-slate-800"
                        value={item.dutyFactor}
                        onChange={(e) => handleUpdateItem(item.id, "dutyFactor", parseFloat(e.target.value) || 0.8)}
                      />
                      <span className="mx-0.5">/</span>
                      <input
                        type="number"
                        step="0.05"
                        className="w-12 px-1 py-0.5 border rounded text-xs dark:bg-slate-800"
                        value={item.diversityFactor}
                        onChange={(e) => handleUpdateItem(item.id, "diversityFactor", parseFloat(e.target.value) || 0.9)}
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        step="1"
                        max="24"
                        className="w-12 px-1 py-0.5 border rounded text-xs dark:bg-slate-800"
                        value={item.operatingHoursPerDay}
                        onChange={(e) => handleUpdateItem(item.id, "operatingHoursPerDay", parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-2.5 font-bold text-amber-600 dark:text-amber-400">
                      {calc.runningKw.toFixed(2)} kW
                    </td>
                    <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">
                      {calc.dailyKwh.toFixed(1)} kWh
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDuplicateItem(item)}
                          className="text-slate-500 hover:text-emerald-600 text-[11px] font-medium underline"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="text-rose-600 hover:text-rose-800 text-[11px] font-medium underline"
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
