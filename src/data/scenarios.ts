/**
 * Operating Scenarios Configuration
 */

export type ScenarioKey =
  | "sunny_grid"
  | "surplus_charging"
  | "grid_outage"
  | "night_grid"
  | "generator_backup"
  | "maintenance_bypass";

export interface OperatingScenario {
  key: ScenarioKey;
  label: string;
  badge: string;
  title: string;
  beginnerDescription: string;
  engineerDescription: string;
  activeRoutes: string[]; // List of connection IDs that are energized in this scenario
  activeNodes: string[]; // List of node IDs that are active
  flowSummary: string;
  gridStatus: "connected" | "disconnected" | "bypassed";
  generatorStatus: "off" | "running_active" | "standby";
  solarStatus: "generating_normal" | "generating_high" | "off";
  batteryStatus: "floating_idle" | "charging" | "discharging" | "reserved";
}

export const OPERATING_SCENARIOS: Record<ScenarioKey, OperatingScenario> = {
  sunny_grid: {
    key: "sunny_grid",
    label: "Sunny + Grid",
    badge: "Normal Daytime",
    title: "Solar Direct Power with Grid Cushion",
    beginnerDescription:
      "Solar panels convert sunlight into electricity. Inverter 1 and Inverter 2 convert DC to AC to power factory critical loads first. The grid stays connected as a backup cushion.",
    engineerDescription:
      "PV Array Groups 1 & 2 generate DC power. Inverters 1 & 2 invert DC to AC, outputting via separate AC MCCBs to the Solar ACDB. Solar ACDB feeds the Critical Load Bus. Grid supplies Normal/Non-Critical loads through the ATS.",
    activeRoutes: [
      "pv1_to_dc1", "dc1_to_inv1", "inv1_to_ac1", "ac1_to_acdb",
      "pv2_to_dc2", "dc2_to_inv2", "inv2_to_ac2", "ac2_to_acdb",
      "acdb_to_crit",
      "grid_to_prot", "grid_prot_to_ats", "ats_to_norm"
    ],
    activeNodes: [
      "pv_group1", "dc_prot1", "inv1", "mccb1",
      "pv_group2", "dc_prot2", "inv2", "mccb2",
      "solar_acdb", "crit_bus",
      "grid_supply", "grid_prot", "ats", "norm_bus"
    ],
    flowSummary: "PV (120 kWp) → Inverters → Solar ACDB → Critical Loads; Grid → ATS → Non-Critical Loads",
    gridStatus: "connected",
    generatorStatus: "off",
    solarStatus: "generating_normal",
    batteryStatus: "floating_idle",
  },

  surplus_charging: {
    key: "surplus_charging",
    label: "Solar Surplus / Charging",
    badge: "Peak Solar Production",
    title: "Solar Powers Factory & Recharges Batteries",
    beginnerDescription:
      "Bright midday sunlight produces excess solar energy beyond factory needs. Inverter 1 charges Battery Pack 1 and Inverter 2 charges Battery Pack 2 while powering critical loads.",
    engineerDescription:
      "Total PV yield exceeds critical load demand. Bi-directional DC-DC chargers inside Inverters 1 & 2 route excess DC energy through Battery Breakers 1 & 2 into Battery Packs 1 & 2 under BMS regulation.",
    activeRoutes: [
      "pv1_to_dc1", "dc1_to_inv1", "inv1_to_ac1", "ac1_to_acdb", "inv1_to_brk1", "brk1_to_bms1", "bms1_to_bat1",
      "pv2_to_dc2", "dc2_to_inv2", "inv2_to_ac2", "ac2_to_acdb", "inv2_to_brk2", "brk2_to_bms2", "bms2_to_bat2",
      "acdb_to_crit",
      "grid_to_prot", "grid_prot_to_ats", "ats_to_norm"
    ],
    activeNodes: [
      "pv_group1", "dc_prot1", "inv1", "mccb1", "bat_brk1", "bms1", "bat_pack1",
      "pv_group2", "dc_prot2", "inv2", "mccb2", "bat_brk2", "bms2", "bat_pack2",
      "solar_acdb", "crit_bus",
      "grid_supply", "grid_prot", "ats", "norm_bus"
    ],
    flowSummary: "PV → Inverters → Critical Loads + Simultaneous DC Battery Charging (Pack 1 & 2)",
    gridStatus: "connected",
    generatorStatus: "off",
    solarStatus: "generating_high",
    batteryStatus: "charging",
  },

  grid_outage: {
    key: "grid_outage",
    label: "Grid Outage",
    badge: "Islanded Backup",
    title: "Solar & Batteries Support Critical Loads Seamlessly",
    beginnerDescription:
      "The main utility grid fails. The inverters automatically disconnect from the grid within milliseconds (islanding) and supply critical factory loads from solar and batteries. Non-critical loads go offline.",
    engineerDescription:
      "Anti-islanding trips grid input. Inverters transition to standalone voltage source mode. Battery Packs 1 & 2 discharge DC power to supplement PV array generation. Critical Load Bus remains energized.",
    activeRoutes: [
      "pv1_to_dc1", "dc1_to_inv1", "inv1_to_ac1", "ac1_to_acdb", "bat1_to_bms1", "bms1_to_brk1", "brk1_to_inv1",
      "pv2_to_dc2", "dc2_to_inv2", "inv2_to_ac2", "ac2_to_acdb", "bat2_to_bms2", "bms2_to_brk2", "brk2_to_inv2",
      "acdb_to_crit"
    ],
    activeNodes: [
      "pv_group1", "dc_prot1", "inv1", "mccb1", "bat_pack1", "bms1", "bat_brk1",
      "pv_group2", "dc_prot2", "inv2", "mccb2", "bat_pack2", "bms2", "bat_brk2",
      "solar_acdb", "crit_bus"
    ],
    flowSummary: "PV + Battery Discharge (Pack 1 & 2) → Inverters → Solar ACDB → Critical Loads (Grid Offline)",
    gridStatus: "disconnected",
    generatorStatus: "standby",
    solarStatus: "generating_normal",
    batteryStatus: "discharging",
  },

  night_grid: {
    key: "night_grid",
    label: "Night + Grid",
    badge: "No Solar Generation",
    title: "Grid Supplies Factory while Battery Reserve is Preserved",
    beginnerDescription:
      "At night, solar panels produce no energy. The grid supplies factory loads. Battery packs remain in reserve in case a grid outage occurs overnight.",
    engineerDescription:
      "Zero PV generation. Grid feeds Normal Loads via ATS. Grid power also passes through the inverters to power Critical Loads while maintaining Battery Pack state-of-charge at safety reserve limits.",
    activeRoutes: [
      "grid_to_prot", "grid_prot_to_ats", "ats_to_norm",
      "ats_to_inv_grid", "inv_grid_to_acdb", "acdb_to_crit"
    ],
    activeNodes: [
      "grid_supply", "grid_prot", "ats", "norm_bus",
      "inv1", "inv2", "solar_acdb", "crit_bus",
      "bat_pack1", "bat_pack2"
    ],
    flowSummary: "Grid → ATS → Non-Critical Loads & Grid → Inverters → Solar ACDB → Critical Loads",
    gridStatus: "connected",
    generatorStatus: "off",
    solarStatus: "off",
    batteryStatus: "reserved",
  },

  generator_backup: {
    key: "generator_backup",
    label: "Generator Backup",
    badge: "Extended Outage",
    title: "Diesel Generator Powers Factory via Single Approved Route",
    beginnerDescription:
      "During a prolonged grid outage with low batteries, the diesel generator starts. Energy flows through the single approved switching route to run critical loads and safely recharge batteries.",
    engineerDescription:
      "Generator starts automatically. Generator ATS route energizes the AC bus. Inverters synchronize to generator frequency/voltage, powering Critical Loads and controlling battery charge current to avoid overloading the generator.",
    activeRoutes: [
      "gen_to_prot", "gen_prot_to_ats", "ats_to_norm", "ats_to_inv_grid",
      "inv_grid_to_acdb", "acdb_to_crit",
      "inv1_to_brk1", "brk1_to_bms1", "bms1_to_bat1",
      "inv2_to_brk2", "brk2_to_bms2", "bms2_to_bat2"
    ],
    activeNodes: [
      "gen_supply", "gen_prot", "ats", "norm_bus",
      "inv1", "mccb1", "inv2", "mccb2", "solar_acdb", "crit_bus",
      "bat_brk1", "bms1", "bat_pack1", "bat_brk2", "bms2", "bat_pack2"
    ],
    flowSummary: "Generator → ATS → Non-Critical Loads & Inverters → Critical Loads + Battery Recharge",
    gridStatus: "disconnected",
    generatorStatus: "running_active",
    solarStatus: "off",
    batteryStatus: "charging",
  },

  maintenance_bypass: {
    key: "maintenance_bypass",
    label: "Maintenance Bypass",
    badge: "Service Mode",
    title: "Direct Grid Power during Inverter/Solar Servicing",
    beginnerDescription:
      "Technicians engage the mechanical interlocked changeover switch to directly connect the grid to critical loads. This completely isolates solar inverters and batteries for safe maintenance.",
    engineerDescription:
      "Interlocked maintenance bypass switch isolates the Solar ACDB and Hybrid Inverter outputs while switching the Critical Load Bus directly to Utility Grid / ATS supply. Solar & Battery systems can be safely de-energized.",
    activeRoutes: [
      "grid_to_prot", "grid_prot_to_ats", "ats_to_norm",
      "ats_to_bypass", "bypass_to_crit"
    ],
    activeNodes: [
      "grid_supply", "grid_prot", "ats", "norm_bus",
      "bypass_switch", "crit_bus"
    ],
    flowSummary: "Grid → ATS → Maintenance Bypass Switch → Critical Load Bus (Inverters & Batteries Isolated)",
    gridStatus: "bypassed",
    generatorStatus: "off",
    solarStatus: "off",
    batteryStatus: "floating_idle",
  },
};
