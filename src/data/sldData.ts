/**
 * Single Line Diagram (SLD) Nodes and Connections Data
 */

export type NodeCategory =
  | "pv"
  | "dc_prot"
  | "inverter"
  | "battery"
  | "bms"
  | "ac_prot"
  | "acdb"
  | "grid"
  | "generator"
  | "ats"
  | "bypass"
  | "bus";

export interface SLDNodeData {
  id: string;
  label: string;
  engineerLabel: string;
  beginnerLabel: string;
  category: NodeCategory;
  branch: "branch1" | "branch2" | "common" | "grid_gen";
  subtitle: string;
  simpleExplanation: string;
  engineeringPurpose: string;
  connectedFrom: string[];
  connectedTo: string[];
  protectionRequirement: string;
  toConfirmItems: string[];
  ratingProvisional: string;
}

export interface SLDConnectionData {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label: string;
  type: "solar_dc" | "battery_dc" | "grid_ac" | "gen_ac" | "inv_ac" | "bus_ac";
}

export const SLD_NODES: Record<string, SLDNodeData> = {
  pv_group1: {
    id: "pv_group1",
    label: "PV Array Group 1",
    engineerLabel: "PV Array Group 1 (85 Panels)",
    beginnerLabel: "Solar Panels - Group 1",
    category: "pv",
    branch: "branch1",
    subtitle: "7 Strings (6x12 + 1x13) • 60.35 kWp",
    simpleExplanation: "Converts sunlight into direct current (DC) electricity for Inverter 1.",
    engineeringPurpose: "7 PV strings connected to 4 MPPT inputs of Inverter 1 (Six 12-panel strings and one 13-panel string). Total 85 x 710W panels.",
    connectedFrom: ["Sunlight"],
    connectedTo: ["PV/DC Protection 1 (dc_prot1)"],
    protectionRequirement: "DC surge protection (Type II SPD), gPV string fuses, DC isolator.",
    toConfirmItems: [
      "Confirm all 85 panels are identical 710W modules",
      "Cold-temperature Voc must be calculated using the exact panel Voc temperature coefficient and the minimum design temperature.",
      "Manufacturer reference—verify the exact installed inverter model."
    ],
    ratingProvisional: "60.35 kWp total, Vmp ~484.8V-525.2V, Voc ~579.6V-627.9V",
  },

  pv_group2: {
    id: "pv_group2",
    label: "PV Array Group 2",
    engineerLabel: "PV Array Group 2 (85 Panels)",
    beginnerLabel: "Solar Panels - Group 2",
    category: "pv",
    branch: "branch2",
    subtitle: "7 Strings (6x12 + 1x13) • 60.35 kWp",
    simpleExplanation: "Converts sunlight into direct current (DC) electricity for Inverter 2.",
    engineeringPurpose: "7 PV strings connected to 4 MPPT inputs of Inverter 2 (Six 12-panel strings and one 13-panel string). Total 85 x 710W panels.",
    connectedFrom: ["Sunlight"],
    connectedTo: ["PV/DC Protection 2 (dc_prot2)"],
    protectionRequirement: "DC surge protection (Type II SPD), gPV string fuses, DC isolator.",
    toConfirmItems: [
      "Confirm all 85 panels are identical 710W modules",
      "Cold-temperature Voc must be calculated using the exact panel Voc temperature coefficient and the minimum design temperature.",
      "Manufacturer reference—verify the exact installed inverter model."
    ],
    ratingProvisional: "60.35 kWp total, Vmp ~484.8V-525.2V, Voc ~579.6V-627.9V",
  },

  dc_prot1: {
    id: "dc_prot1",
    label: "PV/DC Protection 1",
    engineerLabel: "DC Combiner / SPD / Isolator 1",
    beginnerLabel: "Solar DC Safety Switch 1",
    category: "dc_prot",
    branch: "branch1",
    subtitle: "DC Isolator & Type II Surge Arrester",
    simpleExplanation: "Provides emergency DC manual disconnect and lightning/surge protection for Inverter 1.",
    engineeringPurpose: "DC string isolation, gPV overcurrent fuses per string, and Type II DC Surge Protective Device (SPD) before entering Inverter 1 DC terminals.",
    connectedFrom: ["PV Array Group 1 (pv_group1)"],
    connectedTo: ["Inverter 1 DC Inputs (inv1)"],
    protectionRequirement: "1000V DC Isolator, gPV Fuses, 1000V DC Type II SPD. Ratings to be calculated.",
    toConfirmItems: ["Enclosure IP rating (IP65 required for outdoor installation)", "Fuse rating to be calculated based on Isc = 18.59A"],
    ratingProvisional: "Rating to be calculated",
  },

  dc_prot2: {
    id: "dc_prot2",
    label: "PV/DC Protection 2",
    engineerLabel: "DC Combiner / SPD / Isolator 2",
    beginnerLabel: "Solar DC Safety Switch 2",
    category: "dc_prot",
    branch: "branch2",
    subtitle: "DC Isolator & Type II Surge Arrester",
    simpleExplanation: "Provides emergency DC manual disconnect and lightning/surge protection for Inverter 2.",
    engineeringPurpose: "DC string isolation, gPV overcurrent fuses per string, and Type II DC Surge Protective Device (SPD) before entering Inverter 2 DC terminals.",
    connectedFrom: ["PV Array Group 2 (pv_group2)"],
    connectedTo: ["Inverter 2 DC Inputs (inv2)"],
    protectionRequirement: "1000V DC Isolator, gPV Fuses, 1000V DC Type II SPD. Ratings to be calculated.",
    toConfirmItems: ["Enclosure IP rating (IP65 required for outdoor installation)", "Fuse rating to be calculated based on Isc = 18.59A"],
    ratingProvisional: "Rating to be calculated",
  },

  inv1: {
    id: "inv1",
    label: "Hybrid Inverter 1",
    engineerLabel: "Inverter 1 (Solis 50 kW Hybrid)",
    beginnerLabel: "Main Inverter 1",
    category: "inverter",
    branch: "branch1",
    subtitle: "Solis S6-EH3P(29.9-50)K-H • 50 kW",
    simpleExplanation: "Converts solar DC and battery power into 3-phase AC power for the factory.",
    engineeringPurpose: "50 kW Three-Phase Hybrid Inverter with 4 MPPTs (8 string inputs), bi-directional high-voltage battery interface, and grid-forming off-grid capability.",
    connectedFrom: ["PV/DC Protection 1 (dc_prot1)", "Battery Breaker 1 (bat_brk1)"],
    connectedTo: ["Inverter 1 AC MCCB (mccb1)"],
    protectionRequirement: "Internal AC/DC overcurrent, islanding protection, reverse polarity, thermal protection.",
    toConfirmItems: [
      "Conceptual connection—manufacturer-approved parallel topology to confirm.",
      "Confirm parallel communication cable wiring between Inverter 1 and Inverter 2",
      "Confirm phase rotation and master-slave configuration"
    ],
    ratingProvisional: "50 kW AC Output / Manufacturer reference—verify the exact installed inverter model",
  },

  inv2: {
    id: "inv2",
    label: "Hybrid Inverter 2",
    engineerLabel: "Inverter 2 (Solis 50 kW Hybrid)",
    beginnerLabel: "Main Inverter 2",
    category: "inverter",
    branch: "branch2",
    subtitle: "Solis S6-EH3P(29.9-50)K-H • 50 kW",
    simpleExplanation: "Converts solar DC and battery power into 3-phase AC power for the factory.",
    engineeringPurpose: "50 kW Three-Phase Hybrid Inverter with 4 MPPTs (8 string inputs), bi-directional high-voltage battery interface, and grid-forming off-grid capability.",
    connectedFrom: ["PV/DC Protection 2 (dc_prot2)", "Battery Breaker 2 (bat_brk2)"],
    connectedTo: ["Inverter 2 AC MCCB (mccb2)"],
    protectionRequirement: "Internal AC/DC overcurrent, islanding protection, reverse polarity, thermal protection.",
    toConfirmItems: [
      "Conceptual connection—manufacturer-approved parallel topology to confirm.",
      "Confirm parallel communication cable wiring between Inverter 1 and Inverter 2",
      "Confirm phase rotation and master-slave configuration"
    ],
    ratingProvisional: "50 kW AC Output / Manufacturer reference—verify the exact installed inverter model",
  },

  bat_pack1: {
    id: "bat_pack1",
    label: "Battery Pack 1",
    engineerLabel: "High-Voltage Battery Pack 1—Configuration to Confirm",
    beginnerLabel: "High-Voltage Battery Pack 1—Configuration to Confirm",
    category: "battery",
    branch: "branch1",
    subtitle: "High-Voltage LiFePO4 • Configuration to Confirm",
    simpleExplanation: "Stores excess solar power and supplies factory critical loads during outages or at night.",
    engineeringPurpose: "High-voltage lithium iron phosphate (LFP) battery bank supplying energy storage for Inverter 1. Calculated example (e.g., 10 × 51.2 V modules = 512 V nominal, ~143.36 kWh per pack) is illustrative only. Usable energy cannot be calculated until series configuration, permitted depth of discharge, BMS limits and manufacturer compatibility are confirmed.",
    connectedFrom: ["BMS 1 (bms1)"],
    connectedTo: ["BMS 1 (bms1)", "Battery Breaker 1 (bat_brk1)"],
    protectionRequirement: "Internal cell-level overcharge/overdischarge, thermal management, aerosol fire suppression.",
    toConfirmItems: [
      "High-Voltage Battery Pack—Configuration to Confirm",
      "Usable energy cannot be calculated until series configuration, permitted depth of discharge, BMS limits and manufacturer compatibility are confirmed.",
      "Exact series cell configuration and pack nominal voltage",
      "Permitted depth of discharge (DoD) percentage setting"
    ],
    ratingProvisional: "Rating to be calculated / Configuration to confirm",
  },

  bms1: {
    id: "bms1",
    label: "Battery BMS 1",
    engineerLabel: "Master Battery Management System 1",
    beginnerLabel: "Battery Controller 1",
    category: "bms",
    branch: "branch1",
    subtitle: "CAN/RS485 Communication with Inverter 1",
    simpleExplanation: "Monitors battery health, voltage, temperature, and manages charging safety.",
    engineeringPurpose: "Master BMS overseeing cell balancing, state-of-charge (SoC) reporting, and real-time CAN bus telemetry to Solis Inverter 1.",
    connectedFrom: ["Battery Pack 1 (bat_pack1)"],
    connectedTo: ["Inverter 1 Comms Port (inv1)"],
    protectionRequirement: "Software & hardware over-voltage, over-current, and over-temperature safety cutoffs.",
    toConfirmItems: ["Confirm CAN/RS485 protocol compatibility between battery BMS and Solis S6 hybrid inverter"],
    ratingProvisional: "High-Voltage Master BMS (CAN protocol)",
  },

  bat_brk1: {
    id: "bat_brk1",
    label: "Battery Breaker 1",
    engineerLabel: "Battery Breaker 1 (DC MCCB)",
    beginnerLabel: "Battery Switch 1",
    category: "dc_prot",
    branch: "branch1",
    subtitle: "DC MCCB with Shunt Trip",
    simpleExplanation: "Provides high-capacity electrical isolation between Battery Pack 1 and Inverter 1.",
    engineeringPurpose: "High-breaking capacity DC MCCB protecting high-voltage battery DC cables against short circuits.",
    connectedFrom: ["Battery Pack 1 (bat_pack1)"],
    connectedTo: ["Inverter 1 Battery Port (inv1)"],
    protectionRequirement: "2-pole high-voltage DC MCCB with shunt trip. Rating to be calculated.",
    toConfirmItems: ["Rating to be calculated", "Breaking capacity to be confirmed"],
    ratingProvisional: "Rating to be calculated / Breaking capacity to be confirmed",
  },

  bat_pack2: {
    id: "bat_pack2",
    label: "Battery Pack 2",
    engineerLabel: "High-Voltage Battery Pack 2—Configuration to Confirm",
    beginnerLabel: "High-Voltage Battery Pack 2—Configuration to Confirm",
    category: "battery",
    branch: "branch2",
    subtitle: "High-Voltage LiFePO4 • Configuration to Confirm",
    simpleExplanation: "Stores excess solar power and supplies factory critical loads during outages or at night.",
    engineeringPurpose: "High-voltage lithium iron phosphate (LFP) battery bank supplying energy storage for Inverter 2. Calculated example (e.g., 10 × 51.2 V modules = 512 V nominal, ~143.36 kWh per pack) is illustrative only. Usable energy cannot be calculated until series configuration, permitted depth of discharge, BMS limits and manufacturer compatibility are confirmed.",
    connectedFrom: ["BMS 2 (bms2)"],
    connectedTo: ["BMS 2 (bms2)", "Battery Breaker 2 (bat_brk2)"],
    protectionRequirement: "Internal cell-level overcharge/overdischarge, thermal management, aerosol fire suppression.",
    toConfirmItems: [
      "High-Voltage Battery Pack—Configuration to Confirm",
      "Usable energy cannot be calculated until series configuration, permitted depth of discharge, BMS limits and manufacturer compatibility are confirmed.",
      "Exact series cell configuration and pack nominal voltage",
      "Permitted depth of discharge (DoD) percentage setting"
    ],
    ratingProvisional: "Rating to be calculated / Configuration to confirm",
  },

  bms2: {
    id: "bms2",
    label: "Battery BMS 2",
    engineerLabel: "Master Battery Management System 2",
    beginnerLabel: "Battery Controller 2",
    category: "bms",
    branch: "branch2",
    subtitle: "CAN/RS485 Communication with Inverter 2",
    simpleExplanation: "Monitors battery health, voltage, temperature, and manages charging safety.",
    engineeringPurpose: "Master BMS overseeing cell balancing, state-of-charge (SoC) reporting, and real-time CAN bus telemetry to Solis Inverter 2.",
    connectedFrom: ["Battery Pack 2 (bat_pack2)"],
    connectedTo: ["Inverter 2 Comms Port (inv2)"],
    protectionRequirement: "Software & hardware over-voltage, over-current, and over-temperature safety cutoffs.",
    toConfirmItems: ["Confirm CAN/RS485 protocol compatibility between battery BMS and Solis S6 hybrid inverter"],
    ratingProvisional: "High-Voltage Master BMS (CAN protocol)",
  },

  bat_brk2: {
    id: "bat_brk2",
    label: "Battery Breaker 2",
    engineerLabel: "Battery Breaker 2 (DC MCCB)",
    beginnerLabel: "Battery Switch 2",
    category: "dc_prot",
    branch: "branch2",
    subtitle: "DC MCCB with Shunt Trip",
    simpleExplanation: "Provides high-capacity electrical isolation between Battery Pack 2 and Inverter 2.",
    engineeringPurpose: "High-breaking capacity DC MCCB protecting high-voltage battery DC cables against short circuits.",
    connectedFrom: ["Battery Pack 2 (bat_pack2)"],
    connectedTo: ["Inverter 2 Battery Port (inv2)"],
    protectionRequirement: "2-pole high-voltage DC MCCB with shunt trip. Rating to be calculated.",
    toConfirmItems: ["Rating to be calculated", "Breaking capacity to be confirmed"],
    ratingProvisional: "Rating to be calculated / Breaking capacity to be confirmed",
  },

  mccb1: {
    id: "mccb1",
    label: "Inverter 1 AC MCCB",
    engineerLabel: "Inverter 1 AC Circuit Breaker",
    beginnerLabel: "Inverter 1 AC Output Switch",
    category: "ac_prot",
    branch: "branch1",
    subtitle: "AC MCCB—Pole configuration to confirm",
    simpleExplanation: "Protects the 3-phase AC output cabling from Inverter 1 to the Solar ACDB.",
    engineeringPurpose: "Dedicated AC circuit breaker for individual isolation and overcurrent protection of Inverter 1.",
    connectedFrom: ["Hybrid Inverter 1 (inv1)"],
    connectedTo: ["Solar ACDB (solar_acdb)"],
    protectionRequirement: "Thermal-magnetic / electronic overcurrent and short-circuit trip. Rating to be calculated.",
    toConfirmItems: ["Pole configuration to be confirmed based on neutral switching requirements"],
    ratingProvisional: "Rating to be calculated / Breaking capacity to be confirmed",
  },

  mccb2: {
    id: "mccb2",
    label: "Inverter 2 AC MCCB",
    engineerLabel: "Inverter 2 AC Circuit Breaker",
    beginnerLabel: "Inverter 2 AC Output Switch",
    category: "ac_prot",
    branch: "branch2",
    subtitle: "AC MCCB—Pole configuration to confirm",
    simpleExplanation: "Protects the 3-phase AC output cabling from Inverter 2 to the Solar ACDB.",
    engineeringPurpose: "Dedicated AC circuit breaker for individual isolation and overcurrent protection of Inverter 2.",
    connectedFrom: ["Hybrid Inverter 2 (inv2)"],
    connectedTo: ["Solar ACDB (solar_acdb)"],
    protectionRequirement: "Thermal-magnetic / electronic overcurrent and short-circuit trip. Rating to be calculated.",
    toConfirmItems: ["Pole configuration to be confirmed based on neutral switching requirements"],
    ratingProvisional: "Rating to be calculated / Breaking capacity to be confirmed",
  },

  solar_acdb: {
    id: "solar_acdb",
    label: "Solar ACDB",
    engineerLabel: "Solar AC Distribution Board (100 kW)",
    beginnerLabel: "Solar AC Panel",
    category: "acdb",
    branch: "common",
    subtitle: "Combines Inverter 1 & Inverter 2 AC Outputs",
    simpleExplanation: "The central AC panel that combines AC electricity from both inverters before feeding critical factory loads.",
    engineeringPurpose: "Busbar assembly paralleling the AC outputs of Inverter 1 and Inverter 2, housing main AC isolator, energy meter, and Type II AC Surge Protection.",
    connectedFrom: ["Inverter 1 AC MCCB (mccb1)", "Inverter 2 AC MCCB (mccb2)"],
    connectedTo: ["Critical Load Bus (crit_bus)"],
    protectionRequirement: "Main AC MCCB, Type II AC Surge Protection (SPD), digital multi-function meter. Rating to be calculated.",
    toConfirmItems: ["Total busbar rating to be calculated", "Verify CT placement for inverter energy monitoring"],
    ratingProvisional: "3-Phase AC Busbar Panel (Rating to be calculated)",
  },

  grid_supply: {
    id: "grid_supply",
    label: "Grid Utility Supply",
    engineerLabel: "Main Utility Grid Supply (3-Phase 400V)",
    beginnerLabel: "City Power Grid",
    category: "grid",
    branch: "grid_gen",
    subtitle: "3-Phase 400V / 50Hz Utility Connection",
    simpleExplanation: "External electricity power grid supplied by the utility company.",
    engineeringPurpose: "Primary AC voltage source supplying factory loads during non-solar hours and supplementing peak factory demand.",
    connectedFrom: ["Utility Power Line"],
    connectedTo: ["Grid Protection & Meter (grid_prot)"],
    protectionRequirement: "Utility main tariff meter, main incoming MCCB, over/under voltage relay.",
    toConfirmItems: ["Maximum allowed solar feed-in tariff / zero-export restriction settings"],
    ratingProvisional: "3-Phase 400V / 50Hz Utility Feeder",
  },

  grid_prot: {
    id: "grid_prot",
    label: "Grid Protection & Meter",
    engineerLabel: "Main Grid Protection MCCB & Energy Meter",
    beginnerLabel: "Grid Main Switch & Meter",
    category: "ac_prot",
    branch: "grid_gen",
    subtitle: "Main Tariff Meter & Grid MCCB",
    simpleExplanation: "Measures energy from the city grid and protects factory main wiring.",
    engineeringPurpose: "Main electrical service entrance equipped with 3-phase billing meter, main circuit breaker, and grid voltage/frequency monitoring.",
    connectedFrom: ["Grid Utility Supply (grid_supply)"],
    connectedTo: ["Automatic Transfer Switch (ats)"],
    protectionRequirement: "Main MCCB, AC Type II SPD, CTs for Solis smart meter grid limitation. Ratings to be calculated.",
    toConfirmItems: ["Verify CT cable distance to Solis inverter meter input"],
    ratingProvisional: "Main AC MCCB (Rating to be calculated / Breaking capacity to be confirmed)",
  },

  gen_supply: {
    id: "gen_supply",
    label: "Diesel Generator",
    engineerLabel: "Standby Diesel Generator Set",
    beginnerLabel: "Backup Generator",
    category: "generator",
    branch: "grid_gen",
    subtitle: "3-Phase Standby Power Set",
    simpleExplanation: "Backup diesel generator that starts during extended power outages.",
    engineeringPurpose: "Auxiliary power generation set providing backup electricity during prolonged utility grid outages.",
    connectedFrom: ["Diesel Fuel Supply"],
    connectedTo: ["Generator Protection (gen_prot)"],
    protectionRequirement: "Generator circuit breaker, AVR (Automatic Voltage Regulator), auto-start contactor.",
    toConfirmItems: [
      "Generator capacity to be confirmed from the load schedule",
      "ARCHITECTURE TO BE CONFIRMED: Option A (ATS route) vs Option B (Dedicated Solis GEN port)"
    ],
    ratingProvisional: "Standby Diesel Generator (Generator capacity to be confirmed from the load schedule)",
  },

  gen_prot: {
    id: "gen_prot",
    label: "Generator Protection",
    engineerLabel: "Generator Circuit Breaker & Contactor",
    beginnerLabel: "Generator Safety Switch",
    category: "ac_prot",
    branch: "grid_gen",
    subtitle: "Generator Main Output Breaker",
    simpleExplanation: "Protects the generator from overloads and ensures clean power output.",
    engineeringPurpose: "Overcurrent breaker and contactor controlling generator power delivery to the system.",
    connectedFrom: ["Diesel Generator (gen_supply)"],
    connectedTo: ["Automatic Transfer Switch (ats)"],
    protectionRequirement: "Generator MCCB, reverse power relay, frequency protection. Rating to be calculated.",
    toConfirmItems: ["Confirm auto-start dry contact signal cable route from inverter/ATS to generator controller"],
    ratingProvisional: "AC MCCB (Rating to be calculated)",
  },

  ats: {
    id: "ats",
    label: "ATS / Source Changeover",
    engineerLabel: "ATS / source changeover—pole configuration to confirm",
    beginnerLabel: "ATS / source changeover—pole configuration to confirm",
    category: "ats",
    branch: "common",
    subtitle: "ATS / source changeover—pole configuration to confirm",
    simpleExplanation: "Automatically selects between main grid power and generator power.",
    engineeringPurpose: "Motorized changeover switch selecting between primary Utility Grid and backup Generator power. ATS / source changeover—pole configuration to confirm.",
    connectedFrom: ["Grid Protection (grid_prot)", "Generator Protection (gen_prot)"],
    connectedTo: ["Normal Load Bus (norm_bus)", "Inverter Grid Input / Bypass Switch"],
    protectionRequirement: "Electrical & mechanical interlocking preventing simultaneous grid-generator connection. Pole configuration to be confirmed.",
    toConfirmItems: [
      "Pole configuration to be confirmed based on neutral switching requirements",
      "Neutral switching depends on site earthing arrangement, grid requirements, generator neutral arrangement, inverter operating mode, and responsible electrical-engineer approval",
      "Confirm ATS transition delay timing"
    ],
    ratingProvisional: "Changeover Switch (Rating to be calculated / Pole configuration to be confirmed)",
  },

  norm_bus: {
    id: "norm_bus",
    label: "Normal Load Bus",
    engineerLabel: "Normal / Non-Critical Load Distribution Bus",
    beginnerLabel: "Non-Critical Factory Loads",
    category: "bus",
    branch: "common",
    subtitle: "Non-Essential Heavy Factory Loads",
    simpleExplanation: "Powers heavy or non-essential factory machinery that turns off during outages to save power.",
    engineeringPurpose: "Distribution busbar feeding non-essential factory loads (high-power motors, heavy HVAC, external lighting) that do not require battery backup.",
    connectedFrom: ["Automatic Transfer Switch (ats)"],
    connectedTo: ["Non-Essential Machinery Breakers"],
    protectionRequirement: "Sub-feed MCBs / MCCBs for non-critical branch circuits. Ratings to be calculated.",
    toConfirmItems: ["Load schedule audit to confirm non-critical power consumption"],
    ratingProvisional: "AC Busbar (Rating to be calculated)",
  },

  bypass_switch: {
    id: "bypass_switch",
    label: "Maintenance Bypass",
    beginnerLabel: "Manual Service Bypass Switch",
    engineerLabel: "Interlocked Maintenance Bypass Switch",
    category: "bypass",
    branch: "common",
    subtitle: "Manual Mechanical Interlocked Bypass—Pole configuration to confirm",
    simpleExplanation: "Allows technicians to bypass solar and batteries to repair equipment without turning off factory power.",
    engineeringPurpose: "Key-interlocked or mechanically interlocked 3-position changeover switch allowing direct grid/ATS supply to Critical Load Bus during inverter servicing.",
    connectedFrom: ["ATS Output (ats)"],
    connectedTo: ["Critical Load Bus (crit_bus)"],
    protectionRequirement: "Mechanical interlock preventing backfeeding into isolated inverter outputs during maintenance. Pole configuration to be confirmed.",
    toConfirmItems: ["Confirm manual bypass switch lockable enclosure specs and pole configuration"],
    ratingProvisional: "Changeover Switch (Rating to be calculated / Pole configuration to be confirmed)",
  },

  crit_bus: {
    id: "crit_bus",
    label: "Critical Load Bus",
    engineerLabel: "Critical / Essential Load Distribution Bus",
    beginnerLabel: "Essential Factory Loads",
    category: "bus",
    branch: "common",
    subtitle: "Inverter Backup Bus for Essential Operations",
    simpleExplanation: "Powers vital factory equipment that must never lose power (computers, production lines, security).",
    engineeringPurpose: "Essential AC distribution bus bar energized continuously by Solar ACDB (or Maintenance Bypass during service). Combined inverter rating 100 kW.",
    connectedFrom: ["Solar ACDB (solar_acdb)", "Maintenance Bypass (bypass_switch)"],
    connectedTo: ["Factory Essential Circuits"],
    protectionRequirement: "Individual branch MCBs with RCD protection for sensitive loads.",
    toConfirmItems: ["Verify motor starting inrush currents do not exceed 100 kW total inverter peak overload limit"],
    ratingProvisional: "Essential AC Distribution Busbar (Rating to be calculated)",
  },
};

export const SLD_CONNECTIONS: SLDConnectionData[] = [
  // Branch 1 DC & AC
  { id: "pv1_to_dc1", fromNodeId: "pv_group1", toNodeId: "dc_prot1", label: "7 Strings DC (6x12+1x13)", type: "solar_dc" },
  { id: "dc1_to_inv1", fromNodeId: "dc_prot1", toNodeId: "inv1", label: "DC PV Inputs (60.35 kWp)", type: "solar_dc" },
  { id: "inv1_to_ac1", fromNodeId: "inv1", toNodeId: "mccb1", label: "3-Phase 400V AC Output", type: "inv_ac" },
  { id: "ac1_to_acdb", fromNodeId: "mccb1", toNodeId: "solar_acdb", label: "Inverter 1 AC Feed (50 kW)", type: "inv_ac" },
  { id: "bat1_to_bms1", fromNodeId: "bat_pack1", toNodeId: "bms1", label: "HV DC & Comms Telemetry", type: "battery_dc" },
  { id: "bms1_to_bat1", fromNodeId: "bms1", toNodeId: "bat_pack1", label: "Control & Balancing", type: "battery_dc" },
  { id: "bms1_to_brk1", fromNodeId: "bms1", toNodeId: "bat_brk1", label: "Emergency Shunt Trip", type: "battery_dc" },
  { id: "bat1_to_brk1", fromNodeId: "bat_pack1", toNodeId: "bat_brk1", label: "HV DC Power", type: "battery_dc" },
  { id: "brk1_to_inv1", fromNodeId: "bat_brk1", toNodeId: "inv1", label: "Bi-directional Battery DC", type: "battery_dc" },
  { id: "inv1_to_brk1", fromNodeId: "inv1", toNodeId: "bat_brk1", label: "DC Charge Current", type: "battery_dc" },

  // Branch 2 DC & AC
  { id: "pv2_to_dc2", fromNodeId: "pv_group2", toNodeId: "dc_prot2", label: "7 Strings DC (6x12+1x13)", type: "solar_dc" },
  { id: "dc2_to_inv2", fromNodeId: "dc_prot2", toNodeId: "inv2", label: "DC PV Inputs (60.35 kWp)", type: "solar_dc" },
  { id: "inv2_to_ac2", fromNodeId: "inv2", toNodeId: "mccb2", label: "3-Phase 400V AC Output", type: "inv_ac" },
  { id: "ac2_to_acdb", fromNodeId: "mccb2", toNodeId: "solar_acdb", label: "Inverter 2 AC Feed (50 kW)", type: "inv_ac" },
  { id: "bat2_to_bms2", fromNodeId: "bat_pack2", toNodeId: "bms2", label: "HV DC & Comms Telemetry", type: "battery_dc" },
  { id: "bms2_to_bat2", fromNodeId: "bms2", toNodeId: "bat_pack2", label: "Control & Balancing", type: "battery_dc" },
  { id: "bms2_to_brk2", fromNodeId: "bms2", toNodeId: "bat_brk2", label: "Emergency Shunt Trip", type: "battery_dc" },
  { id: "bat2_to_brk2", fromNodeId: "bat_pack2", toNodeId: "bat_brk2", label: "HV DC Power", type: "battery_dc" },
  { id: "brk2_to_inv2", fromNodeId: "bat_brk2", toNodeId: "inv2", label: "Bi-directional Battery DC", type: "battery_dc" },
  { id: "inv2_to_brk2", fromNodeId: "inv2", toNodeId: "bat_brk2", label: "DC Charge Current", type: "battery_dc" },

  // Common ACDB & Distribution
  { id: "acdb_to_crit", fromNodeId: "solar_acdb", toNodeId: "crit_bus", label: "Combined 100 kW AC Output", type: "inv_ac" },

  // Grid & Generator
  { id: "grid_to_prot", fromNodeId: "grid_supply", toNodeId: "grid_prot", label: "Utility 400V 3-Phase", type: "grid_ac" },
  { id: "grid_prot_to_ats", fromNodeId: "grid_prot", toNodeId: "ats", label: "Grid Preferred Input", type: "grid_ac" },
  { id: "gen_to_prot", fromNodeId: "gen_supply", toNodeId: "gen_prot", label: "Generator Power", type: "gen_ac" },
  { id: "gen_prot_to_ats", fromNodeId: "gen_prot", toNodeId: "ats", label: "Generator Standby Input", type: "gen_ac" },
  { id: "ats_to_norm", fromNodeId: "ats", toNodeId: "norm_bus", label: "Selected AC Power (Grid/Gen)", type: "bus_ac" },
  { id: "ats_to_inv1_grid", fromNodeId: "ats", toNodeId: "inv1", label: "Inverter 1 Grid Port (Grid/Gen)", type: "bus_ac" },
  { id: "ats_to_inv2_grid", fromNodeId: "ats", toNodeId: "inv2", label: "Inverter 2 Grid Port (Grid/Gen)", type: "bus_ac" },
  { id: "inv1_grid_to_acdb", fromNodeId: "inv1", toNodeId: "solar_acdb", label: "Conceptual Grid Feed-Through 1", type: "bus_ac" },
  { id: "inv2_grid_to_acdb", fromNodeId: "inv2", toNodeId: "solar_acdb", label: "Conceptual Grid Feed-Through 2", type: "bus_ac" },
  { id: "ats_to_bypass", fromNodeId: "ats", toNodeId: "bypass_switch", label: "Direct Utility Feed", type: "grid_ac" },
  { id: "bypass_to_crit", fromNodeId: "bypass_switch", toNodeId: "crit_bus", label: "Bypass Service Feed", type: "bus_ac" },
];
