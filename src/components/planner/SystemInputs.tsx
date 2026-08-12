import React from "react";
import { PlannerScenario, DataStatus } from "../../types/planner";
import { StatusBadge } from "./StatusBadge";

interface SystemInputsProps {
  scenario: PlannerScenario;
  onChange: (updated: PlannerScenario) => void;
}

export const SystemInputs: React.FC<SystemInputsProps> = ({ scenario, onChange }) => {
  const updateProject = (field: keyof typeof scenario.projectInfo, value: string) => {
    onChange({
      ...scenario,
      projectInfo: { ...scenario.projectInfo, [field]: value },
    });
  };

  const updatePanel = (field: keyof typeof scenario.panelSpecs, value: unknown) => {
    onChange({
      ...scenario,
      panelSpecs: { ...scenario.panelSpecs, [field]: value },
    });
  };

  const updateInverter = (field: keyof typeof scenario.inverterSpecs, value: unknown) => {
    onChange({
      ...scenario,
      inverterSpecs: { ...scenario.inverterSpecs, [field]: value },
    });
  };

  const updateBattery = (field: keyof typeof scenario.batterySpecs, value: unknown) => {
    onChange({
      ...scenario,
      batterySpecs: { ...scenario.batterySpecs, [field]: value },
    });
  };

  const updateGridGen = (field: keyof typeof scenario.gridAndGen, value: unknown) => {
    onChange({
      ...scenario,
      gridAndGen: { ...scenario.gridAndGen, [field]: value },
    });
  };

  const handleNumChange = (
    valueStr: string,
    callback: (num: number | null) => void,
    allowNegative = false
  ) => {
    if (valueStr.trim() === "") {
      callback(null);
      return;
    }
    const val = parseFloat(valueStr);
    if (isNaN(val)) return;
    if (!allowNegative && val < 0) return;
    callback(val);
  };

  return (
    <div className="space-y-8">
      {/* Introduction Header */}
      <div className="bg-slate-800 text-slate-100 p-5 rounded-xl border border-slate-700 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-emerald-400">Step 1: System Input Parameters</h3>
            <p className="text-sm text-slate-300 mt-1">
              Configure nameplate data, electrical limits, panel parameters, and battery/generator assumptions for your working scenario.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Baseline Status:</span>
            <StatusBadge status={scenario.isBaseline ? "CONFIRMED SPECIFICATION" : "USER INPUT"} size="md" />
          </div>
        </div>
      </div>

      {/* Group 1: Project Information */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">1. Project & Engineering Metadata</h4>
          <StatusBadge status="USER INPUT" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="proj-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Project Name <span className="text-rose-5-00">*</span>
            </label>
            <input
              id="proj-name"
              type="text"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
              value={scenario.projectInfo.projectName}
              onChange={(e) => updateProject("projectName", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="proj-site" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Site Location / Designation
            </label>
            <input
              id="proj-site"
              type="text"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
              value={scenario.projectInfo.siteName}
              onChange={(e) => updateProject("siteName", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="proj-author" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Prepared By (Engineer/Designer)
            </label>
            <input
              id="proj-author"
              type="text"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
              value={scenario.projectInfo.preparedBy}
              onChange={(e) => updateProject("preparedBy", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="proj-rev" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Revision Identifier
            </label>
            <input
              id="proj-rev"
              type="text"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
              value={scenario.projectInfo.revision}
              onChange={(e) => updateProject("revision", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="proj-date" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Calculation Date
            </label>
            <input
              id="proj-date"
              type="date"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
              value={scenario.projectInfo.calculationDate}
              onChange={(e) => updateProject("calculationDate", e.target.value)}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label htmlFor="proj-notes" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Engineering Notes & Scope Description
            </label>
            <textarea
              id="proj-notes"
              rows={2}
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
              value={scenario.projectInfo.notes}
              onChange={(e) => updateProject("notes", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Group 2: PV Panel Specifications */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">2. PV Module Specifications (STC)</h4>
            <StatusBadge status={scenario.panelSpecs.status} />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="panel-status" className="text-xs font-medium text-slate-500">Source Status:</label>
            <select
              id="panel-status"
              className="text-xs px-2 py-1 border rounded-md dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.panelSpecs.status}
              onChange={(e) => updatePanel("status", e.target.value as DataStatus)}
            >
              <option value="CONFIRMED SPECIFICATION">CONFIRMED SPECIFICATION</option>
              <option value="USER INPUT">USER INPUT</option>
              <option value="TO CONFIRM">TO CONFIRM</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="panel-mfr" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Manufacturer</label>
            <input
              id="panel-mfr"
              type="text"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.panelSpecs.manufacturer}
              onChange={(e) => updatePanel("manufacturer", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="panel-model" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Model Name</label>
            <input
              id="panel-model"
              type="text"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.panelSpecs.model}
              onChange={(e) => updatePanel("model", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="panel-qty" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Panel Quantity</label>
            <input
              id="panel-qty"
              type="number"
              placeholder="e.g. 170"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.panelSpecs.quantity ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updatePanel("quantity", val))}
            />
          </div>
          <div>
            <label htmlFor="panel-watt" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rated Power Pmax (W)</label>
            <input
              id="panel-watt"
              type="number"
              step="1"
              placeholder="e.g. 710"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.panelSpecs.wattage ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updatePanel("wattage", val))}
            />
          </div>
          <div>
            <label htmlFor="panel-vmp" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Voltage Vmp at STC (V)</label>
            <input
              id="panel-vmp"
              type="number"
              step="0.1"
              placeholder="e.g. 40.4"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.panelSpecs.vmp ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updatePanel("vmp", val))}
            />
          </div>
          <div>
            <label htmlFor="panel-voc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Open Circuit Voltage Voc (V)</label>
            <input
              id="panel-voc"
              type="number"
              step="0.1"
              placeholder="e.g. 48.3"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.panelSpecs.voc ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updatePanel("voc", val))}
            />
          </div>
          <div>
            <label htmlFor="panel-imp" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Imp at STC (A)</label>
            <input
              id="panel-imp"
              type="number"
              step="0.01"
              placeholder="e.g. 17.58"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.panelSpecs.imp ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updatePanel("imp", val))}
            />
          </div>
          <div>
            <label htmlFor="panel-isc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Circuit Current Isc (A)</label>
            <input
              id="panel-isc"
              type="number"
              step="0.01"
              placeholder="e.g. 18.59"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.panelSpecs.isc ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updatePanel("isc", val))}
            />
          </div>
          <div>
            <label htmlFor="panel-coeff" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Voc Temp Coeff (%/°C)
            </label>
            <input
              id="panel-coeff"
              type="number"
              step="0.01"
              placeholder="e.g. -0.26"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.panelSpecs.vocTempCoeff ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updatePanel("vocTempCoeff", val), true)}
            />
            <p className="text-[10px] text-slate-500 mt-0.5">Negative coefficient, e.g. -0.26</p>
          </div>
          <div>
            <label htmlFor="panel-mintemp" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Min Design Temp (°C)</label>
            <input
              id="panel-mintemp"
              type="number"
              placeholder="e.g. 10"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.panelSpecs.minDesignTemp ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updatePanel("minDesignTemp", val), true)}
            />
          </div>
          <div>
            <label htmlFor="panel-maxtemp" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Design Temp (°C)</label>
            <input
              id="panel-maxtemp"
              type="number"
              placeholder="e.g. 45"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.panelSpecs.maxDesignTemp ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updatePanel("maxDesignTemp", val), true)}
            />
          </div>
        </div>
      </section>

      {/* Group 3: Inverter Specifications */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">3. Hybrid Inverter Parameters</h4>
            <StatusBadge status={scenario.inverterSpecs.status} />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="inv-status" className="text-xs font-medium text-slate-500">Source Status:</label>
            <select
              id="inv-status"
              className="text-xs px-2 py-1 border rounded-md dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.inverterSpecs.status}
              onChange={(e) => updateInverter("status", e.target.value as DataStatus)}
            >
              <option value="CONFIRMED SPECIFICATION">CONFIRMED SPECIFICATION</option>
              <option value="USER INPUT">USER INPUT</option>
              <option value="TO CONFIRM">TO CONFIRM</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="inv-mfr" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Inverter Manufacturer</label>
            <input
              id="inv-mfr"
              type="text"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.inverterSpecs.manufacturer}
              onChange={(e) => updateInverter("manufacturer", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="inv-model" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Model Name</label>
            <input
              id="inv-model"
              type="text"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.inverterSpecs.model}
              onChange={(e) => updateInverter("model", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="inv-qty" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Inverter Units</label>
            <input
              id="inv-qty"
              type="number"
              placeholder="e.g. 2"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.inverterSpecs.quantity ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateInverter("quantity", val))}
            />
          </div>
          <div>
            <label htmlFor="inv-pkw" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rated AC Power per Unit (kW)</label>
            <input
              id="inv-pkw"
              type="number"
              placeholder="e.g. 50"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.inverterSpecs.ratedAcPowerKw ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateInverter("ratedAcPowerKw", val))}
            />
          </div>
          <div>
            <label htmlFor="inv-vmax" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Max PV Input Voltage (V DC)</label>
            <input
              id="inv-vmax"
              type="number"
              placeholder="e.g. 1000"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.inverterSpecs.maxPvInputVoltageV ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateInverter("maxPvInputVoltageV", val))}
            />
          </div>
          <div>
            <label htmlFor="inv-mpptmin" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">MPPT Min Voltage (V)</label>
            <input
              id="inv-mpptmin"
              type="number"
              placeholder="e.g. 150"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.inverterSpecs.mpptMinVoltageV ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateInverter("mpptMinVoltageV", val))}
            />
          </div>
          <div>
            <label htmlFor="inv-mpptmax" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">MPPT Max Voltage (V)</label>
            <input
              id="inv-mpptmax"
              type="number"
              placeholder="e.g. 850"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.inverterSpecs.mpptMaxVoltageV ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateInverter("mpptMaxVoltageV", val))}
            />
          </div>
          <div>
            <label htmlFor="inv-mpptcnt" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">MPPT Trackers per Unit</label>
            <input
              id="inv-mpptcnt"
              type="number"
              placeholder="e.g. 4"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.inverterSpecs.mpptCount ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateInverter("mpptCount", val))}
            />
          </div>
          <div>
            <label htmlFor="inv-inpmppt" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">String Inputs per MPPT</label>
            <input
              id="inv-inpmppt"
              type="number"
              placeholder="e.g. 2"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.inverterSpecs.inputsPerMppt ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateInverter("inputsPerMppt", val))}
            />
          </div>
          <div>
            <label htmlFor="inv-imax" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Operating Current per MPPT (A)</label>
            <input
              id="inv-imax"
              type="number"
              placeholder="e.g. 32"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.inverterSpecs.maxCurrentPerMpptA ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateInverter("maxCurrentPerMpptA", val))}
            />
          </div>
          <div>
            <label htmlFor="inv-iscmax" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Short-Circuit Current per MPPT (A)</label>
            <input
              id="inv-iscmax"
              type="number"
              placeholder="e.g. 48"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.inverterSpecs.maxShortCircuitCurrentPerMpptA ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateInverter("maxShortCircuitCurrentPerMpptA", val))}
            />
          </div>
        </div>
      </section>

      {/* Group 4: Battery Storage System */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">4. Battery Storage Specifications</h4>
            <StatusBadge status={scenario.batterySpecs.status} />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="bat-status" className="text-xs font-medium text-slate-500">Source Status:</label>
            <select
              id="bat-status"
              className="text-xs px-2 py-1 border rounded-md dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.batterySpecs.status}
              onChange={(e) => updateBattery("status", e.target.value as DataStatus)}
            >
              <option value="TO CONFIRM">TO CONFIRM</option>
              <option value="USER INPUT">USER INPUT</option>
              <option value="CONFIRMED SPECIFICATION">CONFIRMED SPECIFICATION</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="bat-mfr" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Battery Manufacturer</label>
            <input
              id="bat-mfr"
              type="text"
              placeholder="e.g. To Confirm"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.batterySpecs.manufacturer}
              onChange={(e) => updateBattery("manufacturer", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="bat-model" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Model / Chemistry</label>
            <input
              id="bat-model"
              type="text"
              placeholder="e.g. High-Voltage LFP Pack"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.batterySpecs.model}
              onChange={(e) => updateBattery("model", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="bat-volts" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Module Nominal Voltage (V)</label>
            <input
              id="bat-volts"
              type="number"
              placeholder="e.g. 51.2 or blank if unknown"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.batterySpecs.moduleNominalVoltageV ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateBattery("moduleNominalVoltageV", val))}
            />
          </div>
          <div>
            <label htmlFor="bat-ah" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Module Capacity (Ah)</label>
            <input
              id="bat-ah"
              type="number"
              placeholder="e.g. 280 or blank if unknown"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.batterySpecs.moduleCapacityAh ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateBattery("moduleCapacityAh", val))}
            />
          </div>
          <div>
            <label htmlFor="bat-series" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Modules in Series per Pack</label>
            <input
              id="bat-series"
              type="number"
              placeholder="e.g. 10"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.batterySpecs.modulesInSeries ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateBattery("modulesInSeries", val))}
            />
          </div>
          <div>
            <label htmlFor="bat-parallel" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Parallel Battery Strings</label>
            <input
              id="bat-parallel"
              type="number"
              placeholder="e.g. 2"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.batterySpecs.parallelStrings ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateBattery("parallelStrings", val))}
            />
          </div>
          <div>
            <label htmlFor="bat-dod" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Permitted Depth of Discharge (%)</label>
            <input
              id="bat-dod"
              type="number"
              placeholder="e.g. 80"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.batterySpecs.permittedDoDPercent ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateBattery("permittedDoDPercent", val))}
            />
          </div>
          <div>
            <label htmlFor="bat-res" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Min Reserve State of Charge (%)</label>
            <input
              id="bat-res"
              type="number"
              placeholder="e.g. 20"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.batterySpecs.minReserveSocPercent ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateBattery("minReserveSocPercent", val))}
            />
          </div>
          <div>
            <label htmlFor="bat-eff" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Inverter Efficiency Assumption (%)</label>
            <input
              id="bat-eff"
              type="number"
              placeholder="e.g. 95"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.batterySpecs.inverterEfficiencyPercent ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateBattery("inverterEfficiencyPercent", val))}
            />
          </div>
          <div>
            <label htmlFor="bat-chg" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Max BMS Charge Current (A)</label>
            <input
              id="bat-chg"
              type="number"
              placeholder="e.g. 100"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.batterySpecs.maxBmsChargeCurrentA ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateBattery("maxBmsChargeCurrentA", val))}
            />
          </div>
          <div>
            <label htmlFor="bat-dis" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Max BMS Discharge Current (A)</label>
            <input
              id="bat-dis"
              type="number"
              placeholder="e.g. 100"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.batterySpecs.maxBmsDischargeCurrentA ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateBattery("maxBmsDischargeCurrentA", val))}
            />
          </div>
        </div>
      </section>

      {/* Group 5: Grid & Diesel Generator */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">5. Grid & Generator Infrastructure</h4>
            <StatusBadge status={scenario.gridAndGen.status} />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="grid-status" className="text-xs font-medium text-slate-500">Source Status:</label>
            <select
              id="grid-status"
              className="text-xs px-2 py-1 border rounded-md dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.gridAndGen.status}
              onChange={(e) => updateGridGen("status", e.target.value as DataStatus)}
            >
              <option value="TO CONFIRM">TO CONFIRM</option>
              <option value="USER INPUT">USER INPUT</option>
              <option value="CONFIRMED SPECIFICATION">CONFIRMED SPECIFICATION</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="grid-volts" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Grid Nominal Voltage (V AC)</label>
            <input
              id="grid-volts"
              type="number"
              placeholder="e.g. 400"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.gridAndGen.gridVoltageV ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateGridGen("gridVoltageV", val))}
            />
          </div>
          <div>
            <label htmlFor="grid-phase" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phase Configuration</label>
            <select
              id="grid-phase"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.gridAndGen.phaseConfig}
              onChange={(e) => updateGridGen("phaseConfig", e.target.value)}
            >
              <option value="3-phase">3-Phase (400V L-L)</option>
              <option value="1-phase">1-Phase (230V L-N)</option>
              <option value="Unknown">Unknown / To Confirm</option>
            </select>
          </div>
          <div>
            <label htmlFor="grid-freq" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Frequency (Hz)</label>
            <input
              id="grid-freq"
              type="number"
              placeholder="e.g. 50"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.gridAndGen.frequencyHz ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateGridGen("frequencyHz", val))}
            />
          </div>
          <div>
            <label htmlFor="gen-kva" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Generator Rated kVA (Blank if unknown)</label>
            <input
              id="gen-kva"
              type="number"
              placeholder="e.g. 150 or leave blank"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.gridAndGen.generatorRatedKva ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateGridGen("generatorRatedKva", val))}
            />
          </div>
          <div>
            <label htmlFor="gen-pf" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Generator Power Factor (cos φ)</label>
            <input
              id="gen-pf"
              type="number"
              step="0.05"
              placeholder="e.g. 0.8"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.gridAndGen.generatorPowerFactor ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateGridGen("generatorPowerFactor", val))}
            />
          </div>
          <div>
            <label htmlFor="gen-cont" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Generator Continuous Loading Limit (%)</label>
            <input
              id="gen-cont"
              type="number"
              placeholder="e.g. 80"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              value={scenario.gridAndGen.generatorContinuousLimitPercent ?? ""}
              onChange={(e) => handleNumChange(e.target.value, (val) => updateGridGen("generatorContinuousLimitPercent", val))}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label htmlFor="gen-arch" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Generator Integration Architecture Selection
            </label>
            <select
              id="gen-arch"
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 font-medium"
              value={scenario.gridAndGen.generatorArchitecture}
              onChange={(e) => updateGridGen("generatorArchitecture", e.target.value)}
            >
              <option value="Not selected">Not selected — Architecture to confirm before design approval</option>
              <option value="ATS-fed inverter grid-input route">Option A: ATS-Fed Inverter Grid Input Route (Common Grid / Gen ATS)</option>
              <option value="Dedicated Solis GEN-port route">Option B: Dedicated Solis Hybrid Inverter GEN-Port Route</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
};
