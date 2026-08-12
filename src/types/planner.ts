export type DataStatus =
  | "CONFIRMED SPECIFICATION"
  | "USER INPUT"
  | "CALCULATED ESTIMATE"
  | "TO CONFIRM";

export interface ProjectInfo {
  projectName: string;
  siteName: string;
  preparedBy: string;
  revision: string;
  calculationDate: string;
  notes: string;
}

export interface PanelSpecsInput {
  manufacturer: string;
  model: string;
  quantity: number | null;
  wattage: number | null; // Watts
  vmp: number | null; // Volts
  voc: number | null; // Volts
  imp: number | null; // Amps
  isc: number | null; // Amps
  vocTempCoeff: number | null; // %/°C, e.g. -0.26
  minDesignTemp: number | null; // °C
  maxDesignTemp: number | null; // °C
  status: DataStatus;
}

export interface InverterSpecsInput {
  manufacturer: string;
  model: string;
  quantity: number | null;
  ratedAcPowerKw: number | null;
  maxPvInputVoltageV: number | null;
  mpptMinVoltageV: number | null;
  mpptMaxVoltageV: number | null;
  mpptCount: number | null;
  inputsPerMppt: number | null;
  maxCurrentPerMpptA: number | null;
  maxShortCircuitCurrentPerMpptA: number | null;
  status: DataStatus;
}

export interface BatterySpecsInput {
  manufacturer: string;
  model: string;
  moduleNominalVoltageV: number | null;
  moduleCapacityAh: number | null;
  modulesInSeries: number | null;
  parallelStrings: number | null;
  permittedDoDPercent: number | null;
  minReserveSocPercent: number | null;
  inverterEfficiencyPercent: number | null;
  maxBmsChargeCurrentA: number | null;
  maxBmsDischargeCurrentA: number | null;
  status: DataStatus;
}

export interface GridAndGeneratorInput {
  gridVoltageV: number | null;
  phaseConfig: "3-phase" | "1-phase" | "Unknown";
  frequencyHz: number | null;
  generatorRatedKva: number | null;
  generatorPowerFactor: number | null;
  generatorContinuousLimitPercent: number | null;
  generatorArchitecture:
    | "Not selected"
    | "ATS-fed inverter grid-input route"
    | "Dedicated Solis GEN-port route";
  status: DataStatus;
}

export interface PVStringInput {
  id: string;
  inverterId: number; // 1 or 2
  mpptIndex: number; // 1..4
  mpptInput: number; // 1 or 2
  panelModel: string;
  panelCount: number;
  orientationGroup: string;
  tiltGroup: string;
  shadingGroup: string;
}

export type LoadCategory =
  | "Lighting"
  | "HVAC"
  | "Motors & Pumps"
  | "IT & Security"
  | "Process Machinery"
  | "General Power"
  | "Other";

export type LoadPhase = "L1" | "L2" | "L3" | "Three-phase";

export type StartingMethod =
  | "Direct-on-line"
  | "Star-delta"
  | "Soft starter"
  | "VFD"
  | "Electronic load"
  | "Unknown";

export type PriorityLevel = "Essential" | "Important" | "Deferrable";

export interface LoadItem {
  id: string;
  name: string;
  category: LoadCategory;
  isCritical: boolean;
  phase: LoadPhase;
  quantity: number;
  ratedKw: number;
  powerFactor: number;
  efficiency: number;
  startingMultiplier: number;
  startingMethod: StartingMethod;
  dutyFactor: number;
  diversityFactor: number;
  operatingHoursPerDay: number;
  priority: PriorityLevel;
  notes: string;
}

export interface GeneratorEstimateInput {
  supportedLoadsOption: "Critical loads only" | "All factory loads" | "Custom selection";
  largestMotorStartingKw: number | null;
  simultaneousStartOption: "Sequential starting" | "Simultaneous DOL";
  desiredBatteryChargingKw: number | null;
  altitudeDeratingPercent: number | null;
  temperatureDeratingPercent: number | null;
  futureExpansionPercent: number | null;
}

export interface PlannerScenario {
  id: string;
  name: string;
  updatedAt: string;
  isBaseline: boolean;
  projectInfo: ProjectInfo;
  panelSpecs: PanelSpecsInput;
  inverterSpecs: InverterSpecsInput;
  batterySpecs: BatterySpecsInput;
  gridAndGen: GridAndGeneratorInput;
  pvStrings: PVStringInput[];
  loads: LoadItem[];
  generatorEstimates: GeneratorEstimateInput;
}

export type ValidationSeverity = "info" | "warning" | "error" | "engineer_required";

export interface ValidationIssue {
  id: string;
  step:
    | "System Inputs"
    | "PV Validation"
    | "Load Schedule"
    | "Battery Runtime"
    | "Generator Estimate"
    | "Review & Report";
  severity: ValidationSeverity;
  title: string;
  description: string;
  location?: string;
}
