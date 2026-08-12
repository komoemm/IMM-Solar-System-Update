import React from "react";
import { PlannerScenario } from "../../types/planner";
import { summarizePVStrings, validatePVStrings } from "../../utils/pvCalculations";
import { summarizeLoadSchedule } from "../../utils/loadCalculations";
import { calculateBatteryRuntime } from "../../utils/batteryCalculations";
import { calculateGeneratorScreening } from "../../utils/generatorCalculations";

interface PrintableReportProps {
  scenario: PlannerScenario;
  onBack: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ scenario, onBack }) => {
  const totalInverterKw = (scenario.inverterSpecs.quantity ?? 2) * (scenario.inverterSpecs.ratedAcPowerKw ?? 50);
  const pvSummary = summarizePVStrings(scenario.pvStrings, scenario.panelSpecs.wattage);
  const loadSummary = summarizeLoadSchedule(scenario.loads, totalInverterKw);
  const batteryRuntime = calculateBatteryRuntime(scenario.batterySpecs, loadSummary.criticalRunningKw);
  const genScreening = calculateGeneratorScreening(scenario.gridAndGen, loadSummary.criticalRunningKw);
  const pvIssues = validatePVStrings(scenario);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 print:p-0 print:bg-white text-slate-900">
      {/* Screen Controls (Hidden during print) */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors"
        >
          ← Return to Interactive Explorer
        </button>
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-extrabold rounded-lg hover:bg-emerald-500 shadow-md transition-colors"
        >
          🖨️ Print / Save PDF Conceptual Report
        </button>
      </div>

      {/* Report Canvas */}
      <div className="max-w-5xl mx-auto bg-white p-8 sm:p-12 border border-slate-300 print:border-none print:shadow-none shadow-xl text-slate-900 space-y-8">
        {/* Report Header */}
        <div className="border-b-2 border-slate-900 pb-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
                ENGINEERING CONCEPTUAL DESIGN REPORT
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
                SOLAR HYBRID SYSTEM CONCEPTUAL PLANNING & SIZING REPORT
              </h1>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div className="font-bold text-slate-900 text-sm">Doc Ref: HYB-ENG-2026-R1</div>
              <div>Date: {scenario.projectInfo.calculationDate || new Date().toISOString().split("T")[0]}</div>
              <div>Revision: {scenario.projectInfo.revision || "Rev A"}</div>
            </div>
          </div>

          {/* Banner */}
          <div className="mt-4 p-3 bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold text-center rounded">
            ⚠️ PRELIMINARY CONCEPTUAL PLANNING REPORT — NOT FOR CONSTRUCTION PROCUREMENT
          </div>
        </div>

        {/* Section 1: Project Metadata */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
            1. Project & Engineering Identification
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Project Name:</span>
              <strong className="text-slate-900">{scenario.projectInfo.projectName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Site Designation:</span>
              <strong className="text-slate-900">{scenario.projectInfo.siteName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Prepared By:</span>
              <strong className="text-slate-900">{scenario.projectInfo.preparedBy}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Calculation Date:</span>
              <strong className="text-slate-900">{scenario.projectInfo.calculationDate}</strong>
            </div>
          </div>
        </section>

        {/* Section 2: Executive System Summary */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
            2. Executive System Specification Summary
          </h2>
          <table className="w-full text-left text-xs border border-slate-300 border-collapse">
            <thead className="bg-slate-100 font-bold border-b border-slate-300">
              <tr>
                <th className="p-2 border-r border-slate-300">Subsystem</th>
                <th className="p-2 border-r border-slate-300">Specified Parameters</th>
                <th className="p-2 border-r border-slate-300">Calculated Key Metric</th>
                <th className="p-2">Data Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2 border-r border-slate-300 font-bold">PV Solar Array</td>
                <td className="p-2 border-r border-slate-300">{scenario.panelSpecs.quantity} × {scenario.panelSpecs.wattage}W ({scenario.panelSpecs.model})</td>
                <td className="p-2 border-r border-slate-300 font-bold text-emerald-700">{pvSummary.totalCapacityKwp.toFixed(2)} kWp STC</td>
                <td className="p-2">{scenario.panelSpecs.status}</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-300 font-bold">Hybrid Inverters</td>
                <td className="p-2 border-r border-slate-300">{scenario.inverterSpecs.quantity} × {scenario.inverterSpecs.ratedAcPowerKw}kW ({scenario.inverterSpecs.model})</td>
                <td className="p-2 border-r border-slate-300 font-bold text-emerald-700">{totalInverterKw} kW AC Capacity</td>
                <td className="p-2">{scenario.inverterSpecs.status}</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-300 font-bold">Critical Load Demand</td>
                <td className="p-2 border-r border-slate-300">{scenario.loads.filter((l) => l.isCritical).length} Critical Circuit Load Items</td>
                <td className="p-2 border-r border-slate-300 font-bold text-amber-700">{loadSummary.criticalRunningKw.toFixed(2)} kW ({loadSummary.inverterLoadingPercent.toFixed(1)}% Inverter Load)</td>
                <td className="p-2">CALCULATED ESTIMATE</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-300 font-bold">Battery Backup Storage</td>
                <td className="p-2 border-r border-slate-300">{batteryRuntime.canCalculate ? `${batteryRuntime.totalNominalKwh?.toFixed(1)} kWh Nominal` : "To Confirm"}</td>
                <td className="p-2 border-r border-slate-300 font-bold text-emerald-700">{batteryRuntime.canCalculate ? `${batteryRuntime.runtimeAvgHoursFormatted} Runtime` : "To Confirm"}</td>
                <td className="p-2">{scenario.batterySpecs.status}</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-300 font-bold">Standby Generator</td>
                <td className="p-2 border-r border-slate-300">{genScreening.selectedGenKva ? `${genScreening.selectedGenKva} kVA` : "To Confirm"} ({genScreening.architecture})</td>
                <td className="p-2 border-r border-slate-300 font-bold text-emerald-700">Min {genScreening.recommendedWithChargingKva.toFixed(0)} kVA Required</td>
                <td className="p-2">{scenario.gridAndGen.status}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Section 3: PV String Topology Breakdown */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
            3. PV String Array Topology ({scenario.pvStrings.length} Active Strings)
          </h2>
          <table className="w-full text-left text-[11px] border border-slate-300 border-collapse">
            <thead className="bg-slate-100 font-bold border-b border-slate-300">
              <tr>
                <th className="p-1.5 border-r border-slate-300">String ID</th>
                <th className="p-1.5 border-r border-slate-300">Inverter</th>
                <th className="p-1.5 border-r border-slate-300">MPPT</th>
                <th className="p-1.5 border-r border-slate-300">Panels</th>
                <th className="p-1.5 border-r border-slate-300">Capacity</th>
                <th className="p-1.5 border-r border-slate-300">STC Vmp</th>
                <th className="p-1.5 border-r border-slate-300">Cold Voc ({scenario.panelSpecs.minDesignTemp || 10}°C)</th>
                <th className="p-1.5">Orientation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {scenario.pvStrings.map((str) => {
                const kwp = (str.panelCount * (scenario.panelSpecs.wattage ?? 710)) / 1000;
                const vmp = str.panelCount * (scenario.panelSpecs.vmp ?? 40.4);
                const vocCold = str.panelCount * (scenario.panelSpecs.voc ?? 48.3) * (1 + (Math.abs(scenario.panelSpecs.vocTempCoeff ?? -0.26) / 100) * (25 - (scenario.panelSpecs.minDesignTemp ?? 10)));

                return (
                  <tr key={str.id}>
                    <td className="p-1.5 border-r border-slate-300 font-bold text-emerald-800">{str.id}</td>
                    <td className="p-1.5 border-r border-slate-300">Inv {str.inverterId}</td>
                    <td className="p-1.5 border-r border-slate-300">MPPT {str.mpptIndex}-{str.mpptInput}</td>
                    <td className="p-1.5 border-r border-slate-300 font-bold">{str.panelCount}</td>
                    <td className="p-1.5 border-r border-slate-300">{kwp.toFixed(2)} kWp</td>
                    <td className="p-1.5 border-r border-slate-300">{vmp.toFixed(1)} V</td>
                    <td className="p-1.5 border-r border-slate-300 font-semibold text-slate-800">{vocCold.toFixed(1)} V</td>
                    <td className="p-1.5">{str.orientationGroup}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pvIssues.length > 0 && (
            <div className="p-2.5 bg-slate-50 border border-slate-300 text-[11px] rounded space-y-1">
              <strong className="font-bold text-amber-800">PV Validation Notes:</strong>
              {pvIssues.map((issue) => (
                <div key={issue.id} className="text-slate-700">• {issue.title}: {issue.description}</div>
              ))}
            </div>
          )}
        </section>

        {/* Section 4: Critical Load & Runtime Screening */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
            4. Emergency Autonomy & Battery Runtime Screening
          </h2>
          <div className="grid grid-cols-3 gap-4 text-xs p-3 bg-slate-50 border border-slate-300 rounded">
            <div>
              <span className="text-slate-500 block">Scenario A (Avg Load):</span>
              <strong className="text-slate-900 text-sm">{batteryRuntime.runtimeAvgHoursFormatted}</strong>
              <span className="text-[10px] text-slate-500 block">At {loadSummary.criticalRunningKw.toFixed(1)} kW</span>
            </div>
            <div>
              <span className="text-slate-500 block">Scenario B (Peak Load +35%):</span>
              <strong className="text-slate-900 text-sm">{batteryRuntime.runtimePeakHoursFormatted}</strong>
              <span className="text-[10px] text-slate-500 block">At {(loadSummary.criticalRunningKw * 1.35).toFixed(1)} kW</span>
            </div>
            <div>
              <span className="text-slate-500 block">Scenario C (Night Essential Load):</span>
              <strong className="text-slate-900 text-sm">{batteryRuntime.runtimeNightHoursFormatted}</strong>
              <span className="text-[10px] text-slate-500 block">At {(loadSummary.criticalRunningKw * 0.5).toFixed(1)} kW</span>
            </div>
          </div>
        </section>

        {/* Section 5: Professional Engineering Sign-Off Block */}
        <section className="pt-6 border-t-2 border-slate-900 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            5. Professional M&E Engineering Review & Sign-Off Block
          </h2>

          <div className="grid grid-cols-2 gap-8 text-xs pt-4">
            <div className="space-y-4">
              <div className="border-b border-slate-400 pb-1">
                <span className="text-slate-500 block">Lead Electrical Engineer Signature:</span>
                <div className="h-10"></div>
              </div>
              <div>
                <span className="text-slate-500 block">Engineers Registration No.:</span>
                <strong className="text-slate-900">PE-ENG-________</strong>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-b border-slate-400 pb-1">
                <span className="text-slate-500 block">M&E Consulting Firm Stamp & Approval:</span>
                <div className="h-10"></div>
              </div>
              <div>
                <span className="text-slate-500 block">Approval Date:</span>
                <strong className="text-slate-900">____ / ____ / 2026</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
