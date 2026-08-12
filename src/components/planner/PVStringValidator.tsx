import React, { useState } from "react";
import { PlannerScenario, PVStringInput } from "../../types/planner";
import { summarizePVStrings, validatePVStrings } from "../../utils/pvCalculations";
import { StatusBadge } from "./StatusBadge";

interface PVStringValidatorProps {
  scenario: PlannerScenario;
  onChange: (updated: PlannerScenario) => void;
}

export const PVStringValidator: React.FC<PVStringValidatorProps> = ({ scenario, onChange }) => {
  const [editingStringId, setEditingStringId] = useState<string | null>(null);

  const summary = summarizePVStrings(scenario.pvStrings, scenario.panelSpecs.wattage);
  const validationIssues = validatePVStrings(scenario);

  const handleUpdateString = (id: string, field: keyof PVStringInput, value: unknown) => {
    const updatedStrings = scenario.pvStrings.map((s) => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      return s;
    });
    onChange({ ...scenario, pvStrings: updatedStrings });
  };

  const handleAddString = () => {
    const nextNum = scenario.pvStrings.length + 1;
    const newString: PVStringInput = {
      id: `S1-${nextNum.toString().padStart(2, "0")}`,
      inverterId: 1,
      mpptIndex: 1,
      mpptInput: 1,
      panelModel: scenario.panelSpecs.model || "Tier-1 N-Type (710W)",
      panelCount: 12,
      orientationGroup: "Roof South",
      tiltGroup: "15 deg",
      shadingGroup: "Unshaded",
    };
    onChange({ ...scenario, pvStrings: [...scenario.pvStrings, newString] });
    setEditingStringId(newString.id);
  };

  const handleDeleteString = (id: string) => {
    if (confirm(`Remove PV string ${id}?`)) {
      onChange({ ...scenario, pvStrings: scenario.pvStrings.filter((s) => s.id !== id) });
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "String ID",
      "Inverter ID",
      "MPPT Index",
      "MPPT Input",
      "Panel Model",
      "Panel Quantity",
      "Orientation",
      "Tilt",
      "Shading",
      "Calculated kWp",
    ];
    const rows = scenario.pvStrings.map((s) => [
      s.id,
      s.inverterId,
      s.mpptIndex,
      s.mpptInput,
      `"${s.panelModel}"`,
      s.panelCount,
      `"${s.orientationGroup}"`,
      `"${s.tiltGroup}"`,
      `"${s.shadingGroup}"`,
      (((s.panelCount * (scenario.panelSpecs.wattage ?? 710))) / 1000).toFixed(2),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${scenario.projectInfo.projectName || "pv"}_strings.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-800 text-slate-100 p-5 rounded-xl border border-slate-700 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-emerald-400">Step 2: PV String Topology & Validation</h3>
            <p className="text-sm text-slate-300 mt-1">
              Verify string counts, MPPT assignments, parallel balancing rules, and operating parameters against inverter specifications.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg border border-slate-600 transition-colors"
            >
              Export Strings CSV
            </button>
            <button
              onClick={handleAddString}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              + Add String
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Total PV Capacity</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {summary.totalCapacityKwp.toFixed(2)} kWp
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {summary.assignedPanelQuantity} / {scenario.panelSpecs.quantity ?? "Unspecified"} Panels Assigned
          </span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Inverter 1 Allocation</span>
          <div className="text-xl font-bold text-slate-100 mt-1">
            {summary.inverterSummaries.find((i) => i.inverterId === 1)?.capacityKwp.toFixed(2) || "0.00"} kWp
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {summary.inverterSummaries.find((i) => i.inverterId === 1)?.panelCount || 0} panels across{" "}
            {summary.inverterSummaries.find((i) => i.inverterId === 1)?.stringCount || 0} strings
          </span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Inverter 2 Allocation</span>
          <div className="text-xl font-bold text-slate-100 mt-1">
            {summary.inverterSummaries.find((i) => i.inverterId === 2)?.capacityKwp.toFixed(2) || "0.00"} kWp
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {summary.inverterSummaries.find((i) => i.inverterId === 2)?.panelCount || 0} panels across{" "}
            {summary.inverterSummaries.find((i) => i.inverterId === 2)?.stringCount || 0} strings
          </span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Validation Status</span>
          <div className="mt-2 flex items-center gap-2">
            {validationIssues.filter((i) => i.severity === "error").length > 0 ? (
              <span className="px-2.5 py-1 text-xs font-bold bg-rose-950 text-rose-200 rounded-md border border-rose-800">
                ❌ {validationIssues.filter((i) => i.severity === "error").length} Blocking Error(s)
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-950 text-emerald-200 rounded-md border border-emerald-800">
                ✓ No Blocking Errors
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Validation Issues Alert Box */}
      {validationIssues.length > 0 && (
        <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 shadow-md space-y-3">
          <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
            <span>⚠️ PV Topology & Safety Validation Findings</span>
            <span className="text-xs bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-medium">
              {validationIssues.length} rule(s) triggered
            </span>
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {validationIssues.map((issue) => {
              let badgeBg = "bg-sky-950 text-sky-300 border-sky-800";
              let prefix = "ℹ INFO";
              if (issue.severity === "warning") {
                badgeBg = "bg-amber-950 text-amber-300 border-amber-800";
                prefix = "⚠️ WARNING";
              } else if (issue.severity === "engineer_required") {
                badgeBg = "bg-purple-950 text-purple-300 border-purple-800";
                prefix = "🔍 ENGINEER CONFIRMATION REQUIRED";
              } else if (issue.severity === "error") {
                badgeBg = "bg-rose-950 text-rose-200 border-rose-800 font-bold";
                prefix = "❌ BLOCKING ERROR";
              }

              return (
                <div key={issue.id} className="p-3 bg-slate-800/90 rounded-lg border border-slate-700 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${badgeBg}`}>{prefix}</span>
                    <span className="font-bold text-slate-200">{issue.title}</span>
                  </div>
                  <p className="text-slate-300">{issue.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strings Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-200">
            Active String Configurations ({scenario.pvStrings.length} strings)
          </h4>
          <span className="text-xs text-slate-400">
            Reference Panel Rating: {scenario.panelSpecs.wattage ?? 710} W | Vmp: {scenario.panelSpecs.vmp ?? 40.4} V | Voc: {scenario.panelSpecs.voc ?? 48.3} V
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-300 font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3">String ID</th>
                <th className="p-3">Inverter</th>
                <th className="p-3">MPPT</th>
                <th className="p-3">Input</th>
                <th className="p-3">Panels</th>
                <th className="p-3">Capacity</th>
                <th className="p-3">STC Vmp</th>
                <th className="p-3">STC Voc</th>
                <th className="p-3">Orientation</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {scenario.pvStrings.map((str) => {
                const kwp = ((str.panelCount * (scenario.panelSpecs.wattage ?? 710))) / 1000;
                const vmp = str.panelCount * (scenario.panelSpecs.vmp ?? 40.4);
                const voc = str.panelCount * (scenario.panelSpecs.voc ?? 48.3);
                const isEditing = editingStringId === str.id;

                return (
                  <tr key={str.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-emerald-400">
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-20 px-2 py-1 border rounded-md bg-slate-800 text-slate-100 border-slate-600 focus:border-emerald-500 focus:outline-none"
                          value={str.id}
                          onChange={(e) => handleUpdateString(str.id, "id", e.target.value)}
                        />
                      ) : (
                        str.id
                      )}
                    </td>
                    <td className="p-3">
                      <select
                        className="px-2 py-1 border rounded-md text-xs bg-slate-800 text-slate-100 border-slate-600 focus:border-emerald-500 focus:outline-none"
                        value={str.inverterId}
                        onChange={(e) => handleUpdateString(str.id, "inverterId", parseInt(e.target.value))}
                      >
                        <option value={1} className="bg-slate-800 text-slate-100">Inv 1</option>
                        <option value={2} className="bg-slate-800 text-slate-100">Inv 2</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <select
                        className="px-2 py-1 border rounded-md text-xs bg-slate-800 text-slate-100 border-slate-600 focus:border-emerald-500 focus:outline-none"
                        value={str.mpptIndex}
                        onChange={(e) => handleUpdateString(str.id, "mpptIndex", parseInt(e.target.value))}
                      >
                        <option value={1} className="bg-slate-800 text-slate-100">MPPT 1</option>
                        <option value={2} className="bg-slate-800 text-slate-100">MPPT 2</option>
                        <option value={3} className="bg-slate-800 text-slate-100">MPPT 3</option>
                        <option value={4} className="bg-slate-800 text-slate-100">MPPT 4</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <select
                        className="px-2 py-1 border rounded-md text-xs bg-slate-800 text-slate-100 border-slate-600 focus:border-emerald-500 focus:outline-none"
                        value={str.mpptInput}
                        onChange={(e) => handleUpdateString(str.id, "mpptInput", parseInt(e.target.value))}
                      >
                        <option value={1} className="bg-slate-800 text-slate-100">Input 1</option>
                        <option value={2} className="bg-slate-800 text-slate-100">Input 2</option>
                      </select>
                    </td>
                    <td className="p-3 font-semibold">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        className="w-16 px-2 py-1 border rounded-md text-xs bg-slate-800 text-slate-100 border-slate-600 focus:border-emerald-500 focus:outline-none font-semibold"
                        value={str.panelCount}
                        onChange={(e) => handleUpdateString(str.id, "panelCount", parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-3 font-semibold text-slate-200">{kwp.toFixed(2)} kWp</td>
                    <td className="p-3 text-slate-300">{vmp.toFixed(1)} V</td>
                    <td className="p-3 text-slate-300">{voc.toFixed(1)} V</td>
                    <td className="p-3 text-slate-300">
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-24 px-2 py-1 border rounded-md bg-slate-800 text-slate-100 border-slate-600 focus:border-emerald-500 focus:outline-none"
                          value={str.orientationGroup}
                          onChange={(e) => handleUpdateString(str.id, "orientationGroup", e.target.value)}
                        />
                      ) : (
                        str.orientationGroup
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingStringId(isEditing ? null : str.id)}
                          className="text-xs text-slate-300 hover:text-emerald-400 underline font-medium transition-colors"
                        >
                          {isEditing ? "Done" : "Edit"}
                        </button>
                        <button
                          onClick={() => handleDeleteString(str.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 underline font-medium transition-colors"
                        >
                          Remove
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
