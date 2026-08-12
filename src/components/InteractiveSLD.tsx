import React, { useState } from "react";

export type SituationKey = "sunny_grid" | "grid_outage" | "night_mode" | "generator";

interface EquipmentStat {
  value: string;
  subValue: string;
  statusText: string;
  statusTone: "emerald" | "amber" | "rose" | "blue" | "slate";
  glowColor: string;
}

interface SituationData {
  id: SituationKey;
  title: string;
  subtitle: string;
  description: string;
  activeRouteText: string;
  badge: string;
  stats: {
    pv: EquipmentStat;
    battery: EquipmentStat;
    inverter: EquipmentStat;
    grid: EquipmentStat;
    generator: EquipmentStat;
    loads: EquipmentStat;
  };
  flows: {
    pv_to_inv: { active: boolean; dir: "forward" | "reverse"; color: string; label: string };
    bat_to_inv: { active: boolean; dir: "forward" | "reverse"; color: string; label: string };
    inv_to_load: { active: boolean; dir: "forward" | "reverse"; color: string; label: string };
    grid_to_inv: { active: boolean; dir: "forward" | "reverse"; color: string; label: string };
    gen_to_inv: { active: boolean; dir: "forward" | "reverse"; color: string; label: string };
  };
}

const SITUATIONS: Record<SituationKey, SituationData> = {
  sunny_grid: {
    id: "sunny_grid",
    title: "1. Sunny + Grid Synced",
    subtitle: "Normal Daytime Operation",
    description:
      "Solar PV array generates 92.5 kW under strong sunlight. 74.5 kW directly powers factory critical loads via dual Solis 50 kW inverters, while 18.0 kW charges battery packs. The utility grid remains synchronized on standby.",
    activeRouteText: "Solar Array (92.5 kW) ➔ Solis Inverters ➔ Critical Loads (74.5 kW) + Battery Charge (18.0 kW)",
    badge: "Maximum Efficiency",
    stats: {
      pv: {
        value: "92.5 kW",
        subValue: "14 Strings / 170 Panels",
        statusText: "Active Generating",
        statusTone: "emerald",
        glowColor: "#10b981",
      },
      battery: {
        value: "-18.0 kW",
        subValue: "SoC: 78% (Charging)",
        statusText: "Charging Mode",
        statusTone: "blue",
        glowColor: "#3b82f6",
      },
      inverter: {
        value: "92.5 kW",
        subValue: "2x 50 kW (98.2% Eff)",
        statusText: "Dual MPPT Active",
        statusTone: "emerald",
        glowColor: "#10b981",
      },
      grid: {
        value: "0.0 kW",
        subValue: "400V 3-Phase Synced",
        statusText: "Grid Standby",
        statusTone: "blue",
        glowColor: "#3b82f6",
      },
      generator: {
        value: "0.0 kW",
        subValue: "125 kVA Diesel",
        statusText: "Standby Off",
        statusTone: "slate",
        glowColor: "#64748b",
      },
      loads: {
        value: "74.5 kW",
        subValue: "Factory ACDB Panel",
        statusText: "Solar Powered",
        statusTone: "emerald",
        glowColor: "#10b981",
      },
    },
    flows: {
      pv_to_inv: { active: true, dir: "forward", color: "#10b981", label: "92.5 kW Solar" },
      bat_to_inv: { active: true, dir: "reverse", color: "#3b82f6", label: "18.0 kW Charge" },
      inv_to_load: { active: true, dir: "forward", color: "#10b981", label: "74.5 kW Load" },
      grid_to_inv: { active: false, dir: "forward", color: "#334155", label: "0 kW Standby" },
      gen_to_inv: { active: false, dir: "forward", color: "#334155", label: "0 kW Off" },
    },
  },
  grid_outage: {
    id: "grid_outage",
    title: "2. Grid Outage (Islanded)",
    subtitle: "Emergency Microgrid Backup",
    description:
      "Utility grid power failed. Main motorized breaker trips open in <10ms. Solis inverters switch to islanded mode, combining 65.0 kW solar generation with +20.0 kW battery discharge to deliver 85.0 kW uninterrupted power.",
    activeRouteText: "Solar PV (65.0 kW) + Battery (+20.0 kW) ➔ Solis Inverters ➔ Islanded Factory Loads (85.0 kW)",
    badge: "Islanded Active",
    stats: {
      pv: {
        value: "65.0 kW",
        subValue: "Partially Shaded",
        statusText: "Solar Supplying",
        statusTone: "emerald",
        glowColor: "#10b981",
      },
      battery: {
        value: "+20.0 kW",
        subValue: "SoC: 64% (Discharging)",
        statusText: "Discharging",
        statusTone: "amber",
        glowColor: "#f59e0b",
      },
      inverter: {
        value: "85.0 kW",
        subValue: "Islanded UPS Mode",
        statusText: "<10ms Transfer",
        statusTone: "amber",
        glowColor: "#f59e0b",
      },
      grid: {
        value: "FAUT / 0 kW",
        subValue: "Grid Disconnected",
        statusText: "Grid Outage",
        statusTone: "rose",
        glowColor: "#f43f5e",
      },
      generator: {
        value: "0.0 kW",
        subValue: "Auto-Start Standby",
        statusText: "Ready Signal",
        statusTone: "slate",
        glowColor: "#64748b",
      },
      loads: {
        value: "85.0 kW",
        subValue: "Critical ACDB Panel",
        statusText: "Protected UPS",
        statusTone: "emerald",
        glowColor: "#10b981",
      },
    },
    flows: {
      pv_to_inv: { active: true, dir: "forward", color: "#10b981", label: "65.0 kW Solar" },
      bat_to_inv: { active: true, dir: "forward", color: "#f59e0b", label: "20.0 kW Discharge" },
      inv_to_load: { active: true, dir: "forward", color: "#10b981", label: "85.0 kW Load" },
      grid_to_inv: { active: false, dir: "forward", color: "#f43f5e", label: "Grid Disconnected" },
      gen_to_inv: { active: false, dir: "forward", color: "#334155", label: "0 kW Off" },
    },
  },
  night_mode: {
    id: "night_mode",
    title: "3. Night Mode",
    subtitle: "No Solar Generation",
    description:
      "Solar array output is 0.0 kW at night. Utility grid supplies 45.0 kW base load directly to factory critical loads through inverter bypass, while battery reserve is preserved at 85% SoC for potential night outages.",
    activeRouteText: "Utility Grid (45.0 kW) ➔ Solis Inverters ➔ Factory Night Base Loads (45.0 kW)",
    badge: "Grid Powered",
    stats: {
      pv: {
        value: "0.0 kW",
        subValue: "Night Time",
        statusText: "Array Idle",
        statusTone: "slate",
        glowColor: "#64748b",
      },
      battery: {
        value: "0.0 kW",
        subValue: "SoC: 85% (Reserved)",
        statusText: "Reserve Standby",
        statusTone: "blue",
        glowColor: "#3b82f6",
      },
      inverter: {
        value: "45.0 kW",
        subValue: "Grid Rectifying / Bypass",
        statusText: "Grid Direct",
        statusTone: "blue",
        glowColor: "#3b82f6",
      },
      grid: {
        value: "45.0 kW",
        subValue: "400V 3-Phase Utility",
        statusText: "Active Grid Supply",
        statusTone: "emerald",
        glowColor: "#10b981",
      },
      generator: {
        value: "0.0 kW",
        subValue: "125 kVA Diesel",
        statusText: "Standby Off",
        statusTone: "slate",
        glowColor: "#64748b",
      },
      loads: {
        value: "45.0 kW",
        subValue: "Night Base Load",
        statusText: "Grid Powered",
        statusTone: "emerald",
        glowColor: "#10b981",
      },
    },
    flows: {
      pv_to_inv: { active: false, dir: "forward", color: "#334155", label: "0 kW Night" },
      bat_to_inv: { active: false, dir: "forward", color: "#334155", label: "0 kW Reserve" },
      inv_to_load: { active: true, dir: "forward", color: "#10b981", label: "45.0 kW Load" },
      grid_to_inv: { active: true, dir: "forward", color: "#10b981", label: "45.0 kW Grid" },
      gen_to_inv: { active: false, dir: "forward", color: "#334155", label: "0 kW Off" },
    },
  },
  generator: {
    id: "generator",
    title: "4. Generator Backup",
    subtitle: "Extended Grid Outage",
    description:
      "Utility grid is unavailable and battery SoC dropped below 20%. Solis dry-contact relay auto-starts the 125 kVA Diesel Generator via ATS / GEN input, delivering 85.0 kW total to run 75.0 kW loads and charge batteries at 10.0 kW.",
    activeRouteText: "125 kVA Diesel Generator (85.0 kW) ➔ ATS / GEN Input ➔ Solis Inverters ➔ Loads (75.0 kW) + Bat Charge (10.0 kW)",
    badge: "Gen Auto-Started",
    stats: {
      pv: {
        value: "10.0 kW",
        subValue: "Heavy Cloud Cover",
        statusText: "Low Output",
        statusTone: "amber",
        glowColor: "#f59e0b",
      },
      battery: {
        value: "-10.0 kW",
        subValue: "SoC: 22% (Recovering)",
        statusText: "Gen Charging",
        statusTone: "emerald",
        glowColor: "#10b981",
      },
      inverter: {
        value: "85.0 kW",
        subValue: "Gen Synced & Regulated",
        statusText: "GEN Input Active",
        statusTone: "rose",
        glowColor: "#f43f5e",
      },
      grid: {
        value: "OUTAGE",
        subValue: "Grid Disconnected",
        statusText: "Grid Fault",
        statusTone: "rose",
        glowColor: "#f43f5e",
      },
      generator: {
        value: "85.0 kW",
        subValue: "125 kVA Diesel Running",
        statusText: "Gen Power Supply",
        statusTone: "rose",
        glowColor: "#f43f5e",
      },
      loads: {
        value: "75.0 kW",
        subValue: "Factory ACDB Panel",
        statusText: "Gen Powered",
        statusTone: "emerald",
        glowColor: "#10b981",
      },
    },
    flows: {
      pv_to_inv: { active: true, dir: "forward", color: "#f59e0b", label: "10.0 kW Solar" },
      bat_to_inv: { active: true, dir: "reverse", color: "#10b981", label: "10.0 kW Charge" },
      inv_to_load: { active: true, dir: "forward", color: "#10b981", label: "75.0 kW Load" },
      grid_to_inv: { active: false, dir: "forward", color: "#f43f5e", label: "Grid Offline" },
      gen_to_inv: { active: true, dir: "forward", color: "#f43f5e", label: "85.0 kW Diesel" },
    },
  },
};

interface EquipmentSpecDetail {
  id: string;
  title: string;
  category: string;
  badge: string;
  icon: string;
  summary: string;
  specs: { label: string; value: string; detail?: string }[];
  keyRules: string[];
}

const EQUIPMENT_SPECS: Record<string, EquipmentSpecDetail> = {
  pv: {
    id: "pv",
    title: "Solar PV Array (170 x 710W Modules)",
    category: "DC Generation Source",
    badge: "120.70 kWp STC Capacity",
    icon: "☀️",
    summary:
      "High-efficiency industrial solar PV array comprising 170 Trina Solar 710W N-type bifacial monocrystalline modules, split into 14 strings across two Solis 50 kW hybrid inverters.",
    specs: [
      { label: "Total Capacity", value: "120.70 kWp STC", detail: "170 x 710W Modules" },
      { label: "Module Model", value: "Trina Vertex TSM-DEG21C.20", detail: "Bifacial N-type Monocrystalline" },
      { label: "String Layout", value: "14 Strings Total", detail: "7 Strings per Solis Inverter" },
      { label: "Voc @ STC (25°C)", value: "45.8V / Panel", detail: "595.4V per 13-panel string" },
      { label: "Cold Voc (-10°C)", value: "658.2V Max String Voc", detail: "Safely below 1,000V DC limit" },
      { label: "MPPT Channels", value: "8 Channels Total", detail: "4 MPPTs per 50 kW Inverter" },
      { label: "Roof Footprint", value: "~530 m²", detail: "Factory Roof Installation" },
      { label: "Estimated Annual Yield", value: "178,500 kWh / Year", detail: "Specific yield 1,478 kWh/kWp" },
    ],
    keyRules: [
      "Keep string lengths strictly balanced between same-MPPT inputs.",
      "DC isolator switches must be rated for 1,000V DC / 32A per string.",
      "Type II DC Surge Protection Devices (SPD) required at combiner box.",
    ],
  },
  battery: {
    id: "battery",
    title: "High-Voltage LFP Battery Storage (BESS)",
    category: "Energy Storage System",
    badge: "200 kWh / 180 kWh Usable",
    icon: "🔋",
    summary:
      "Dual rack Lithium Iron Phosphate (LiFePO4) high-voltage battery storage system engineered for zero-down-time factory backup, load shifting, and solar self-consumption optimization.",
    specs: [
      { label: "Total Storage", value: "200.0 kWh", detail: "2 x 100 kWh Enclosures" },
      { label: "Usable Capacity", value: "180.0 kWh", detail: "90% Max Depth of Discharge (DoD)" },
      { label: "Battery Chemistry", value: "LiFePO4 (LFP)", detail: "High Thermal Stability Cells" },
      { label: "Nominal DC Voltage", value: "512.0V DC", detail: "Range: 448V – 576V DC" },
      { label: "Max Discharge Power", value: "100.0 kW Continuous", detail: "1C Max Discharge Rate" },
      { label: "Cycle Life Expectancy", value: ">6,000 Cycles", detail: "@ 80% DoD to 80% Capacity" },
      { label: "BMS Communication", value: "CANbus v2.0 Protocol", detail: "Real-time Cell Balancing & Temperature Monitoring" },
      { label: "Safety System", value: "Integrated Aerosol Fire Suppression", detail: "Liquid-Cooled Thermal Management" },
    ],
    keyRules: [
      "BMS communication must be active to allow hybrid inverter charge/discharge.",
      "Never discharge below 10% SoC to preserve cell health and long cycle life.",
      "Dedicated battery circuit breaker with shunt-trip required near battery racks.",
    ],
  },
  inverter: {
    id: "inverter",
    title: "Dual Solis S6-EH3P(29.9-50)K-H Hybrid Inverters",
    category: "Power Conversion System",
    badge: "100 kW Combined Output",
    icon: "⚡",
    summary:
      "Two 50 kW 3-phase hybrid energy storage inverters operating in parallel. Manages PV generation, battery charge/discharge, grid synchronization, and UPS backup transfer.",
    specs: [
      { label: "Nominal AC Power", value: "100.0 kW Total", detail: "2 x 50.0 kW 3-Phase Units" },
      { label: "Peak Overload Rating", value: "150.0 kW Peak", detail: "10-second motor start headroom" },
      { label: "Peak Conversion Eff.", value: "98.2%", detail: "97.7% Euro Efficiency" },
      { label: "MPPT Input Range", value: "150V – 850V DC", detail: "Max DC Input: 1,000V" },
      { label: "UPS Transfer Time", value: "<10ms Seamless Switch", detail: "Zero interruption for factory machinery" },
      { label: "Internal Protection", value: "DC Isolator + Type II SPDs", detail: "Integrated Arc Fault Circuit Interrupter (AFCI)" },
      { label: "Grid Standard Compliance", value: "IEEE 1547 / UL1741 / G99", detail: "Adjustable Power Factor & Anti-Islanding" },
      { label: "Parallel Operation", value: "CANbus Master-Slave Link", detail: "Equal load sharing between inverters" },
    ],
    keyRules: [
      "Master-Slave CAN cable required between inverters for synchronized AC output.",
      "Each inverter must have individual AC breaker and DC isolators.",
      "Verify grid code selection on Solis LCD display before initial commissioning.",
    ],
  },
  grid: {
    id: "grid",
    title: "3-Phase Utility Grid Connection & Main ACDB",
    category: "AC Utility Source",
    badge: "400V 3-Phase 50Hz",
    icon: "⌁",
    summary:
      "Main utility electrical service feeding the factory AC distribution board. Provides grid fallback, supplemental power during high load peaks, and absorbs excess solar when export is permitted.",
    specs: [
      { label: "Service Voltage", value: "400V / 230V 3-Phase", detail: "4-Wire L1, L2, L3, N + PE @ 50 Hz" },
      { label: "Main Breaker Size", value: "250A 3-Pole MCCB", detail: "36kA Interrupting Capacity" },
      { label: "Metering Unit", value: "Bi-Directional Smart Meter", detail: "RS485 Modbus RTU interface to Inverters" },
      { label: "Power Factor", value: ">0.98 Corrected", detail: "Compliant with utility power quality standards" },
      { label: "Anti-Islanding Protection", value: "Active & Passive Detection", detail: "Utility safety automatic trip on grid loss" },
      { label: "Export Limitation", value: "Configurable Zero Export", detail: "Prevents unauthorized feed-in to grid" },
    ],
    keyRules: [
      "Smart Meter CT clamps must be installed at the main utility point before any loads.",
      "Never bypass anti-islanding protection relays.",
      "Coordinate zero-export settings with local utility grid operator terms.",
    ],
  },
  generator: {
    id: "generator",
    title: "Backup Diesel Generator Set & ATS Switch",
    category: "Emergency Auxiliary Power",
    badge: "125 kVA / 100 kW Standby",
    icon: "⚙️",
    summary:
      "125 kVA automated diesel generator set connected via a 250A Automatic Transfer Switch (ATS) or dedicated Solis GEN port to provide continuous factory power during multi-day grid blackouts.",
    specs: [
      { label: "Standby Power Rating", value: "125 kVA / 100 kW", detail: "3-Phase 400V @ 1,500 RPM" },
      { label: "Fuel Tank Capacity", value: "400 Liters Diesel", detail: "~16 Hours continuous runtime @ 75% load" },
      { label: "Auto-Start Controller", value: "Dry-Contact Signal Relay", detail: "Triggers when battery SoC < 20% or on Grid Loss" },
      { label: "Transfer Mechanism", value: "250A 4-Pole Motorized ATS", detail: "Electrical & Mechanical Dual Interlock" },
      { label: "Frequency Stability", value: "<1% Electronic Governor", detail: "Clean power waveform for Solis inverter sync" },
      { label: "Integration Route", value: "Option A (ATS) or Option B (GEN)", detail: "Single route selected to prevent dual connection" },
    ],
    keyRules: [
      "Never connect generator through both ATS route and inverter GEN port simultaneously.",
      "Set generator auto-start voltage threshold above inverter shutoff limit.",
      "Perform monthly 30-minute load bank test to prevent wet stacking.",
    ],
  },
  loads: {
    id: "loads",
    title: "Factory Critical Load Distribution Center",
    category: "AC Demand Center",
    badge: "100 kW Peak Connected",
    icon: "🏭",
    summary:
      "Dedicated critical load AC distribution board (ACDB) feeding essential factory production lines, HVAC compressors, server rooms, and emergency lighting.",
    specs: [
      { label: "Peak Demand Capacity", value: "100.0 kW 3-Phase", detail: "Continuous Base Load: 45.0 – 85.0 kW" },
      { label: "Power Quality", value: "Pure Sine Wave (<2% THD)", detail: "Conditioned AC supplied by Solis Inverters" },
      { label: "Critical Sub-Circuits", value: "Assembly Lines, Servers, HVAC", detail: "Non-critical loads shed automatically on battery" },
      { label: "Circuit Protection", value: "Type B RCDs & RCBO Breakers", detail: "Individual branch fault isolation" },
      { label: "Manual Bypass Switch", value: "3-Position Maintenance Switch", detail: "Allows direct utility bypass for servicing" },
    ],
    keyRules: [
      "Ensure total peak surge from motor starts does not exceed 150 kW inverter limit.",
      "Keep non-essential high-power machinery on non-critical panel.",
      "Verify phase balance across L1, L2, and L3 within 10% discrepancy.",
    ],
  },
};

export const InteractiveSLD: React.FC = () => {
  const [activeSituationKey, setActiveSituationKey] = useState<SituationKey>("sunny_grid");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>("inverter");
  const [isAnimationPaused, setIsAnimationPaused] = useState<boolean>(false);

  const situation = SITUATIONS[activeSituationKey];
  const selectedSpec = selectedEquipmentId ? EQUIPMENT_SPECS[selectedEquipmentId] : null;

  return (
    <section className="section bg-slate-950 text-slate-100 p-4 sm:p-6 rounded-2xl border border-slate-900 shadow-2xl my-8" id="interactive-sld">
      {/* Component Style Block for SVG Keyframe Animations */}
      <style>{`
        @keyframes flowDash {
          0% { stroke-dashoffset: 28; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes flowDashReverse {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 28; }
        }
        @keyframes pulseRing {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.03); opacity: 1; }
        }
        .animate-flow-dash {
          stroke-dasharray: 8 6;
          animation: flowDash 1.2s linear infinite;
        }
        .animate-flow-dash-reverse {
          stroke-dasharray: 8 6;
          animation: flowDashReverse 1.2s linear infinite;
        }
        .animate-pulse-ring {
          animation: pulseRing 2.5s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Interactive Power Flow Diagram
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Solar Hybrid System Single Line Schematic
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time energy flow simulation across PV Array, Battery Storage, Solis Hybrid Inverters, Utility Grid, Generator, and Critical Loads.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setIsAnimationPaused(!isAnimationPaused)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <span>{isAnimationPaused ? "▶ Resume Motion" : "⏸ Pause Motion"}</span>
          </button>
          <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-mono font-semibold">
            {situation.badge}
          </span>
        </div>
      </div>

      {/* Operating Situation Tabs */}
      <div className="mt-6 flex flex-col gap-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Select Operating Situation
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" role="tablist" aria-label="Operating Situations">
          {(Object.keys(SITUATIONS) as SituationKey[]).map((key) => {
            const sit = SITUATIONS[key];
            const isActive = activeSituationKey === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSituationKey(key)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isActive
                    ? "bg-slate-900 border-emerald-500/80 shadow-lg ring-1 ring-emerald-500/50"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 text-slate-300"
                }`}
              >
                <div>
                  <span className={`text-xs font-extrabold block ${isActive ? "text-emerald-400" : "text-slate-200"}`}>
                    {sit.title}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{sit.subtitle}</span>
                </div>
                <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono text-emerald-400/90 font-semibold">
                    Loads: {sit.stats.loads.value}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400" : "bg-slate-600"}`}></span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Situation Description Callout */}
      <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <p className="text-slate-200 font-medium">{situation.description}</p>
          <p className="text-slate-400 font-mono text-[11px]">
            <span className="text-emerald-400 font-bold">Active Route: </span>
            {situation.activeRouteText}
          </p>
        </div>
        <div className="shrink-0 text-slate-400 text-[11px] font-medium bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          Click any equipment block below for detailed specs ℹ️
        </div>
      </div>

      {/* Main SVG Power Flow Diagram Workspace */}
      <div className="mt-6 relative rounded-2xl bg-slate-900/90 border border-slate-800/80 p-2 sm:p-4 overflow-x-auto shadow-inner">
        <svg viewBox="0 0 960 520" className="w-full h-auto min-w-[700px] select-none">
          <defs>
            {/* Custom Gradients */}
            <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="darkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
            </linearGradient>

            {/* Marker Arrows */}
            <marker id="arrowEmerald" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
            </marker>
            <marker id="arrowAmber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
            </marker>
            <marker id="arrowRose" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
            </marker>
            <marker id="arrowBlue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
            </marker>
          </defs>

          {/* BACKGROUND VECTOR CONNECTIONS */}
          {/* 1. PV -> Inverter */}
          <path d="M 280 100 H 325 V 170 H 370" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
          {/* 2. Battery -> Inverter */}
          <path d="M 280 280 H 325 V 240 H 370" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
          {/* 3. Inverter -> Loads */}
          <path d="M 590 205 H 680" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
          {/* 4. Grid -> Inverter */}
          <path d="M 330 390 V 335 H 430 V 280" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
          {/* 5. Generator -> Inverter */}
          <path d="M 630 390 V 335 H 530 V 280" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />

          {/* DYNAMIC ANIMATED FLOW OVERLAYS */}
          {/* 1. PV -> Inverter Flow */}
          {situation.flows.pv_to_inv.active && (
            <g>
              <path
                d="M 280 100 H 325 V 170 H 370"
                fill="none"
                stroke={situation.flows.pv_to_inv.color}
                strokeWidth="3.5"
                strokeLinecap="round"
                className={isAnimationPaused ? "" : "animate-flow-dash"}
                markerEnd="url(#arrowEmerald)"
              />
              <rect x="300" y="125" width="54" height="18" rx="4" fill="#0f172a" stroke={situation.flows.pv_to_inv.color} strokeWidth="1" />
              <text x="327" y="137" fill={situation.flows.pv_to_inv.color} fontSize="9" fontWeight="bold" textAnchor="middle">
                {situation.stats.pv.value}
              </text>
            </g>
          )}

          {/* 2. Battery <-> Inverter Flow */}
          {situation.flows.bat_to_inv.active && (
            <g>
              <path
                d="M 280 280 H 325 V 240 H 370"
                fill="none"
                stroke={situation.flows.bat_to_inv.color}
                strokeWidth="3.5"
                strokeLinecap="round"
                className={
                  isAnimationPaused
                    ? ""
                    : situation.flows.bat_to_inv.dir === "forward"
                    ? "animate-flow-dash"
                    : "animate-flow-dash-reverse"
                }
              />
              <rect x="300" y="248" width="56" height="18" rx="4" fill="#0f172a" stroke={situation.flows.bat_to_inv.color} strokeWidth="1" />
              <text x="328" y="260" fill={situation.flows.bat_to_inv.color} fontSize="9" fontWeight="bold" textAnchor="middle">
                {situation.stats.battery.value}
              </text>
            </g>
          )}

          {/* 3. Inverter -> Loads Flow */}
          {situation.flows.inv_to_load.active && (
            <g>
              <path
                d="M 590 205 H 680"
                fill="none"
                stroke={situation.flows.inv_to_load.color}
                strokeWidth="4"
                strokeLinecap="round"
                className={isAnimationPaused ? "" : "animate-flow-dash"}
                markerEnd="url(#arrowEmerald)"
              />
              <rect x="618" y="196" width="50" height="18" rx="4" fill="#0f172a" stroke={situation.flows.inv_to_load.color} strokeWidth="1" />
              <text x="643" y="208" fill={situation.flows.inv_to_load.color} fontSize="9" fontWeight="bold" textAnchor="middle">
                {situation.stats.loads.value}
              </text>
            </g>
          )}

          {/* 4. Grid <-> Inverter Flow */}
          {situation.flows.grid_to_inv.active ? (
            <g>
              <path
                d="M 330 390 V 335 H 430 V 280"
                fill="none"
                stroke={situation.flows.grid_to_inv.color}
                strokeWidth="3.5"
                strokeLinecap="round"
                className={isAnimationPaused ? "" : "animate-flow-dash"}
              />
              <rect x="365" y="326" width="60" height="18" rx="4" fill="#0f172a" stroke={situation.flows.grid_to_inv.color} strokeWidth="1" />
              <text x="395" y="338" fill={situation.flows.grid_to_inv.color} fontSize="9" fontWeight="bold" textAnchor="middle">
                {situation.stats.grid.value}
              </text>
            </g>
          ) : (
            <g>
              <path d="M 330 390 V 335 H 430 V 280" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            </g>
          )}

          {/* 5. Generator -> Inverter Flow */}
          {situation.flows.gen_to_inv.active ? (
            <g>
              <path
                d="M 630 390 V 335 H 530 V 280"
                fill="none"
                stroke={situation.flows.gen_to_inv.color}
                strokeWidth="3.5"
                strokeLinecap="round"
                className={isAnimationPaused ? "" : "animate-flow-dash"}
              />
              <rect x="545" y="326" width="70" height="18" rx="4" fill="#0f172a" stroke={situation.flows.gen_to_inv.color} strokeWidth="1" />
              <text x="580" y="338" fill={situation.flows.gen_to_inv.color} fontSize="9" fontWeight="bold" textAnchor="middle">
                {situation.stats.generator.value}
              </text>
            </g>
          ) : (
            <g>
              <path d="M 630 390 V 335 H 530 V 280" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            </g>
          )}

          {/* EQUIPMENT NODE BLOCK CARDS */}

          {/* 1. SOLAR ARRAY (PV) */}
          <g
            className="cursor-pointer group"
            onClick={() => setSelectedEquipmentId("pv")}
            aria-label="Solar Array Node"
          >
            <rect
              x="60"
              y="40"
              width="220"
              height="120"
              rx="12"
              fill="url(#darkGrad)"
              stroke={selectedEquipmentId === "pv" ? "#10b981" : situation.stats.pv.glowColor}
              strokeWidth={selectedEquipmentId === "pv" ? "2.5" : "1.5"}
              className="transition-all duration-300 group-hover:stroke-emerald-400"
              style={{ filter: `drop-shadow(0 0 12px ${situation.stats.pv.glowColor}33)` }}
            />
            {/* Status Indicator Glow Circle */}
            <circle cx="85" cy="65" r="5" fill={situation.stats.pv.glowColor} className="animate-pulse-ring" />
            <text x="98" y="68" fill="#f8fafc" fontSize="13" fontWeight="bold">
              Solar PV Array
            </text>
            <text x="85" y="86" fill="#94a3b8" fontSize="10">
              {situation.stats.pv.subValue}
            </text>
            {/* Large Numeric Stat Display */}
            <text x="85" y="118" fill={situation.stats.pv.glowColor} fontSize="22" fontWeight="extrabold">
              {situation.stats.pv.value}
            </text>
            {/* Status Tag Pill */}
            <rect x="85" y="128" width="105" height="18" rx="9" fill={situation.stats.pv.glowColor} fillOpacity="0.15" />
            <text x="137" y="140" fill={situation.stats.pv.glowColor} fontSize="9" fontWeight="bold" textAnchor="middle">
              {situation.stats.pv.statusText}
            </text>
          </g>

          {/* 2. BATTERY STORAGE */}
          <g
            className="cursor-pointer group"
            onClick={() => setSelectedEquipmentId("battery")}
            aria-label="Battery Storage Node"
          >
            <rect
              x="60"
              y="220"
              width="220"
              height="120"
              rx="12"
              fill="url(#darkGrad)"
              stroke={selectedEquipmentId === "battery" ? "#3b82f6" : situation.stats.battery.glowColor}
              strokeWidth={selectedEquipmentId === "battery" ? "2.5" : "1.5"}
              className="transition-all duration-300 group-hover:stroke-blue-400"
              style={{ filter: `drop-shadow(0 0 12px ${situation.stats.battery.glowColor}33)` }}
            />
            <circle cx="85" cy="245" r="5" fill={situation.stats.battery.glowColor} className="animate-pulse-ring" />
            <text x="98" y="248" fill="#f8fafc" fontSize="13" fontWeight="bold">
              Battery Storage (BESS)
            </text>
            <text x="85" y="266" fill="#94a3b8" fontSize="10">
              {situation.stats.battery.subValue}
            </text>
            <text x="85" y="298" fill={situation.stats.battery.glowColor} fontSize="22" fontWeight="extrabold">
              {situation.stats.battery.value}
            </text>
            <rect x="85" y="308" width="115" height="18" rx="9" fill={situation.stats.battery.glowColor} fillOpacity="0.15" />
            <text x="142" y="320" fill={situation.stats.battery.glowColor} fontSize="9" fontWeight="bold" textAnchor="middle">
              {situation.stats.battery.statusText}
            </text>
          </g>

          {/* 3. HYBRID INVERTERS (CENTER HUB) */}
          <g
            className="cursor-pointer group"
            onClick={() => setSelectedEquipmentId("inverter")}
            aria-label="Hybrid Inverters Node"
          >
            <rect
              x="370"
              y="130"
              width="220"
              height="150"
              rx="14"
              fill="url(#darkGrad)"
              stroke={selectedEquipmentId === "inverter" ? "#10b981" : situation.stats.inverter.glowColor}
              strokeWidth={selectedEquipmentId === "inverter" ? "3" : "2"}
              className="transition-all duration-300 group-hover:stroke-emerald-400"
              style={{ filter: `drop-shadow(0 0 16px ${situation.stats.inverter.glowColor}44)` }}
            />
            <circle cx="395" cy="158" r="6" fill={situation.stats.inverter.glowColor} className="animate-pulse-ring" />
            <text x="410" y="162" fill="#f8fafc" fontSize="14" fontWeight="extrabold">
              Hybrid Inverters
            </text>
            <text x="395" y="180" fill="#94a3b8" fontSize="10">
              {situation.stats.inverter.subValue}
            </text>

            <text x="395" y="215" fill={situation.stats.inverter.glowColor} fontSize="26" fontWeight="black">
              {situation.stats.inverter.value}
            </text>

            <rect x="395" y="232" width="130" height="20" rx="10" fill={situation.stats.inverter.glowColor} fillOpacity="0.15" />
            <text x="460" y="245" fill={situation.stats.inverter.glowColor} fontSize="9.5" fontWeight="bold" textAnchor="middle">
              {situation.stats.inverter.statusText}
            </text>

            <text x="395" y="266" fill="#64748b" fontSize="8.5" fontFamily="monospace">
              HUB: Solis S6-EH3P(50K) x2
            </text>
          </g>

          {/* 4. CRITICAL LOADS */}
          <g
            className="cursor-pointer group"
            onClick={() => setSelectedEquipmentId("loads")}
            aria-label="Critical Loads Node"
          >
            <rect
              x="680"
              y="130"
              width="220"
              height="150"
              rx="14"
              fill="url(#darkGrad)"
              stroke={selectedEquipmentId === "loads" ? "#10b981" : situation.stats.loads.glowColor}
              strokeWidth={selectedEquipmentId === "loads" ? "3" : "2"}
              className="transition-all duration-300 group-hover:stroke-emerald-400"
              style={{ filter: `drop-shadow(0 0 16px ${situation.stats.loads.glowColor}44)` }}
            />
            <circle cx="705" cy="158" r="6" fill={situation.stats.loads.glowColor} className="animate-pulse-ring" />
            <text x="720" y="162" fill="#f8fafc" fontSize="14" fontWeight="extrabold">
              Critical Loads Panel
            </text>
            <text x="705" y="180" fill="#94a3b8" fontSize="10">
              {situation.stats.loads.subValue}
            </text>

            <text x="705" y="215" fill={situation.stats.loads.glowColor} fontSize="26" fontWeight="black">
              {situation.stats.loads.value}
            </text>

            <rect x="705" y="232" width="120" height="20" rx="10" fill={situation.stats.loads.glowColor} fillOpacity="0.15" />
            <text x="765" y="245" fill={situation.stats.loads.glowColor} fontSize="9.5" fontWeight="bold" textAnchor="middle">
              {situation.stats.loads.statusText}
            </text>

            <text x="705" y="266" fill="#64748b" fontSize="8.5" fontFamily="monospace">
              Protected 3-Phase ACDB
            </text>
          </g>

          {/* 5. UTILITY GRID */}
          <g
            className="cursor-pointer group"
            onClick={() => setSelectedEquipmentId("grid")}
            aria-label="Utility Grid Node"
          >
            <rect
              x="220"
              y="390"
              width="220"
              height="100"
              rx="12"
              fill="url(#darkGrad)"
              stroke={selectedEquipmentId === "grid" ? "#3b82f6" : situation.stats.grid.glowColor}
              strokeWidth={selectedEquipmentId === "grid" ? "2.5" : "1.5"}
              className="transition-all duration-300 group-hover:stroke-blue-400"
              style={{ filter: `drop-shadow(0 0 12px ${situation.stats.grid.glowColor}33)` }}
            />
            <circle cx="245" cy="415" r="5" fill={situation.stats.grid.glowColor} className="animate-pulse-ring" />
            <text x="258" y="418" fill="#f8fafc" fontSize="13" fontWeight="bold">
              3-Phase Utility Grid
            </text>
            <text x="245" y="436" fill="#94a3b8" fontSize="10">
              {situation.stats.grid.subValue}
            </text>
            <text x="245" y="464" fill={situation.stats.grid.glowColor} fontSize="18" fontWeight="extrabold">
              {situation.stats.grid.value}
            </text>
            <rect x="245" y="472" width="110" height="16" rx="8" fill={situation.stats.grid.glowColor} fillOpacity="0.15" />
            <text x="300" y="483" fill={situation.stats.grid.glowColor} fontSize="8.5" fontWeight="bold" textAnchor="middle">
              {situation.stats.grid.statusText}
            </text>
          </g>

          {/* 6. GENERATOR */}
          <g
            className="cursor-pointer group"
            onClick={() => setSelectedEquipmentId("generator")}
            aria-label="Generator Node"
          >
            <rect
              x="520"
              y="390"
              width="220"
              height="100"
              rx="12"
              fill="url(#darkGrad)"
              stroke={selectedEquipmentId === "generator" ? "#f43f5e" : situation.stats.generator.glowColor}
              strokeWidth={selectedEquipmentId === "generator" ? "2.5" : "1.5"}
              className="transition-all duration-300 group-hover:stroke-rose-400"
              style={{ filter: `drop-shadow(0 0 12px ${situation.stats.generator.glowColor}33)` }}
            />
            <circle cx="545" cy="415" r="5" fill={situation.stats.generator.glowColor} className="animate-pulse-ring" />
            <text x="558" y="418" fill="#f8fafc" fontSize="13" fontWeight="bold">
              Backup Diesel Gen
            </text>
            <text x="545" y="436" fill="#94a3b8" fontSize="10">
              {situation.stats.generator.subValue}
            </text>
            <text x="545" y="464" fill={situation.stats.generator.glowColor} fontSize="18" fontWeight="extrabold">
              {situation.stats.generator.value}
            </text>
            <rect x="545" y="472" width="115" height="16" rx="8" fill={situation.stats.generator.glowColor} fillOpacity="0.15" />
            <text x="602" y="483" fill={situation.stats.generator.glowColor} fontSize="8.5" fontWeight="bold" textAnchor="middle">
              {situation.stats.generator.statusText}
            </text>
          </g>
        </svg>
      </div>

      {/* Real-time Summary Cards Row */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(["pv", "battery", "inverter", "grid", "generator", "loads"] as const).map((key) => {
          const stat = situation.stats[key];
          const isSelected = selectedEquipmentId === key;
          const labelMap: Record<string, string> = {
            pv: "Solar Array",
            battery: "Battery BESS",
            inverter: "Solis Inverters",
            grid: "Utility Grid",
            generator: "Backup Diesel",
            loads: "Critical Loads",
          };

          return (
            <button
              key={key}
              onClick={() => setSelectedEquipmentId(key)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-slate-900 border-emerald-500/80 ring-1 ring-emerald-500/50 shadow-md"
                  : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold">{labelMap[key]}</span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.glowColor }}></span>
              </div>
              <p className="text-base sm:text-lg font-black text-slate-100 mt-1" style={{ color: stat.glowColor }}>
                {stat.value}
              </p>
              <span className="text-[10px] text-slate-400 block truncate mt-0.5">{stat.statusText}</span>
            </button>
          );
        })}
      </div>

      {/* EQUIPMENT SPECIFICATION MODAL (MODAL DETAIL VIEW) */}
      {selectedSpec && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedEquipmentId(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 text-slate-100 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  {selectedSpec.icon}
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                    {selectedSpec.category}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-100">{selectedSpec.title}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEquipmentId(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                aria-label="Close specification modal"
              >
                ✕
              </button>
            </div>

            {/* Badge & Summary */}
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 text-xs font-mono font-bold rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
                {selectedSpec.badge}
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                {selectedSpec.summary}
              </p>
            </div>

            {/* Detailed Specs Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Specifications</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedSpec.specs.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide block">
                      {item.label}
                    </span>
                    <span className="text-sm font-extrabold text-emerald-400 font-mono block">{item.value}</span>
                    {item.detail && <span className="text-[11px] text-slate-400 block">{item.detail}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Key Engineering Rules */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Engineering & Safety Directives</h4>
              <ul className="space-y-1.5 text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 list-disc list-inside">
                {selectedSpec.keyRules.map((rule, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedEquipmentId(null)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md"
              >
                Close Specification Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
