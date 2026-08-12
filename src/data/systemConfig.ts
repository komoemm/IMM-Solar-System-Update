/**
 * System Engineering Specifications & Reference Values
 * System: 120.70 kWp Solar Hybrid System (170 Panels, 2 x 50 kW Inverters, 2 Battery Packs)
 */

export interface PanelSpecs {
  model: string;
  wattage: number; // Watts
  vmp: number; // Volts at Pmax
  voc: number; // Volts open circuit
  imp: number; // Amps at Pmax
  isc: number; // Amps short circuit
}

export interface StringSpec {
  id: string; // e.g. "S1-01"
  inverterId: 1 | 2;
  mpptIndex: 1 | 2 | 3 | 4;
  panelCount: 12 | 13;
  panelWattage: number;
  capacityKwp: number;
  vmpStc: number;
  vocStc: number;
}

export const PANEL_STC_SPECS: PanelSpecs = {
  model: "Tier-1 Monocrystalline N-Type (710W)",
  wattage: 710,
  vmp: 40.4,
  voc: 48.3,
  imp: 17.58,
  isc: 18.59,
};

// String calculations based on 710W panel reference values
export const STRING_TYPES = {
  TWELVE_PANEL: {
    panelCount: 12,
    capacityKwp: 8.52, // 12 * 0.71 kW
    vmpStc: 484.8,    // 12 * 40.4 V
    vocStc: 579.6,    // 12 * 48.3 V
  },
  THIRTEEN_PANEL: {
    panelCount: 13,
    capacityKwp: 9.23, // 13 * 0.71 kW
    vmpStc: 525.2,    // 13 * 40.4 V
    vocStc: 627.9,    // 13 * 48.3 V
  },
};

export const SYSTEM_TOTALS = {
  totalPanels: 170,
  panelRatingW: 710,
  totalPvCapacityKwp: 120.70,
  totalStrings: 14,
  inverterCount: 2,
  inverterModel: "Solis S6-EH3P(29.9-50)K-H (50 kW Three-Phase Hybrid)",
  inverterRatingKw: 50,
  totalInverterCapacityKw: 100,
  panelsPerInverter: 85,
  pvCapacityPerInverterKwp: 60.35,
  batteryPacksCount: 2,
  batteryEstimatedNominalVoltageV: 512,
  batteryEstimatedCapacityKwh: 286.72,
};

// Generating full 14-string database
export const ALL_PV_STRINGS: StringSpec[] = [
  // Inverter 1 strings (7 strings)
  { id: "S1-01", inverterId: 1, mpptIndex: 1, panelCount: 12, panelWattage: 710, capacityKwp: 8.52, vmpStc: 484.8, vocStc: 579.6 },
  { id: "S1-02", inverterId: 1, mpptIndex: 1, panelCount: 12, panelWattage: 710, capacityKwp: 8.52, vmpStc: 484.8, vocStc: 579.6 },
  { id: "S1-03", inverterId: 1, mpptIndex: 2, panelCount: 12, panelWattage: 710, capacityKwp: 8.52, vmpStc: 484.8, vocStc: 579.6 },
  { id: "S1-04", inverterId: 1, mpptIndex: 2, panelCount: 12, panelWattage: 710, capacityKwp: 8.52, vmpStc: 484.8, vocStc: 579.6 },
  { id: "S1-05", inverterId: 1, mpptIndex: 3, panelCount: 12, panelWattage: 710, capacityKwp: 8.52, vmpStc: 484.8, vocStc: 579.6 },
  { id: "S1-06", inverterId: 1, mpptIndex: 3, panelCount: 12, panelWattage: 710, capacityKwp: 8.52, vmpStc: 484.8, vocStc: 579.6 },
  { id: "S1-07", inverterId: 1, mpptIndex: 4, panelCount: 13, panelWattage: 710, capacityKwp: 9.23, vmpStc: 525.2, vocStc: 627.9 },

  // Inverter 2 strings (7 strings)
  { id: "S2-01", inverterId: 2, mpptIndex: 1, panelCount: 12, panelWattage: 710, capacityKwp: 8.52, vmpStc: 484.8, vocStc: 579.6 },
  { id: "S2-02", inverterId: 2, mpptIndex: 1, panelCount: 12, panelWattage: 710, capacityKwp: 8.52, vmpStc: 484.8, vocStc: 579.6 },
  { id: "S2-03", inverterId: 2, mpptIndex: 2, panelCount: 12, panelWattage: 710, capacityKwp: 8.52, vmpStc: 484.8, vocStc: 579.6 },
  { id: "S2-04", inverterId: 2, mpptIndex: 2, panelCount: 12, panelWattage: 710, capacityKwp: 8.52, vmpStc: 484.8, vocStc: 579.6 },
  { id: "S2-05", inverterId: 2, mpptIndex: 3, panelCount: 12, panelWattage: 710, capacityKwp: 8.52, vmpStc: 484.8, vocStc: 579.6 },
  { id: "S2-06", inverterId: 2, mpptIndex: 3, panelCount: 12, panelWattage: 710, capacityKwp: 8.52, vmpStc: 484.8, vocStc: 579.6 },
  { id: "S2-07", inverterId: 2, mpptIndex: 4, panelCount: 13, panelWattage: 710, capacityKwp: 9.23, vmpStc: 525.2, vocStc: 627.9 },
];

export interface MpptConfig {
  mpptNumber: number;
  inputA: string; // String ID
  inputB: string; // String ID or "Spare Input"
  isBalanced: boolean;
  notes: string;
}

export const INVERTER_MPPT_MAP: Record<number, MpptConfig[]> = {
  1: [
    { mpptNumber: 1, inputA: "S1-01 (12 panels)", inputB: "S1-02 (12 panels)", isBalanced: true, notes: "Two identical 12-panel strings in parallel" },
    { mpptNumber: 2, inputA: "S1-03 (12 panels)", inputB: "S1-04 (12 panels)", isBalanced: true, notes: "Two identical 12-panel strings in parallel" },
    { mpptNumber: 3, inputA: "S1-05 (12 panels)", inputB: "S1-06 (12 panels)", isBalanced: true, notes: "Two identical 12-panel strings in parallel" },
    { mpptNumber: 4, inputA: "S1-07 (13 panels)", inputB: "Spare Input (Unused)", isBalanced: true, notes: "Single 13-panel string on dedicated MPPT (Never mix with 12-panel string!)" },
  ],
  2: [
    { mpptNumber: 1, inputA: "S2-01 (12 panels)", inputB: "S2-02 (12 panels)", isBalanced: true, notes: "Two identical 12-panel strings in parallel" },
    { mpptNumber: 2, inputA: "S2-03 (12 panels)", inputB: "S2-04 (12 panels)", isBalanced: true, notes: "Two identical 12-panel strings in parallel" },
    { mpptNumber: 3, inputA: "S2-05 (12 panels)", inputB: "S2-06 (12 panels)", isBalanced: true, notes: "Two identical 12-panel strings in parallel" },
    { mpptNumber: 4, inputA: "S2-07 (13 panels)", inputB: "Spare Input (Unused)", isBalanced: true, notes: "Single 13-panel string on dedicated MPPT (Never mix with 12-panel string!)" },
  ],
};

export const ENGINEERING_WARNINGS = [
  {
    title: "Conceptual Learning Diagram Notice",
    description: "This schematic is a educational logic diagram and does NOT constitute a certified, stamped electrical construction SLD.",
    level: "warning",
  },
  {
    title: "Temperature-Corrected PV Voc Verification",
    description: "STC Voc (579.6 V for 12-panel, 627.9 V for 13-panel) increases in cold ambient temperatures. Maximum cold-temperature string Voc must be calculated against Solis 1000 V DC limit.",
    level: "danger",
  },
  {
    title: "MPPT Parallel String Balance Rule",
    description: "Do NOT connect a 12-panel string and a 13-panel string in parallel on the same MPPT. Parallel inputs must have identical string voltages to prevent severe current mismatch and panel heating.",
    level: "danger",
  },
  {
    title: "Dual Generator Integration Safety",
    description: "The diesel generator must NEVER be fed into both the ATS grid port and the Solis inverter GEN port at the same time without approved interlocks and Solis commissioning.",
    level: "danger",
  },
  {
    title: "Inverter Parallel Communication & Phase Sync",
    description: "Operating two Solis 50 kW hybrid inverters in parallel requires dedicated RS485/CAN parallel communication lines, master-slave configuration, and AC phase synchronization.",
    level: "warning",
  },
  {
    title: "Battery BMS & DC Protection Confirmation",
    description: "High-voltage battery pack series module count, BMS protocol compatibility with Solis S6, and DC isolator/breaker breaking capacity (kA) require M&E sign-off.",
    level: "warning",
  },
  {
    title: "Earthing & Neutral Switching Alignment",
    description: "System earthing (TN-S/TN-C-S) and 4-pole switching requirements for off-grid backup transition must conform to local electrical utility safety codes.",
    level: "warning",
  },
];
