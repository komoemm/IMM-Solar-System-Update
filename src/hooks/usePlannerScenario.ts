import { useState, useEffect, useCallback } from "react";
import { PlannerScenario } from "../types/planner";
import { VERIFIED_BASELINE_SCENARIO } from "../data/verifiedBaseline";

const STORAGE_KEY_WORKING = "solar_planner_working_scenario_v1";
const STORAGE_KEY_SAVED = "solar_planner_saved_scenarios_v1";

export interface ScenarioImportResult {
  success: boolean;
  message: string;
}

export function usePlannerScenario() {
  const [workingScenario, setWorkingScenario] = useState<PlannerScenario>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WORKING);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object" && parsed.id && parsed.projectInfo) {
          return parsed as PlannerScenario;
        }
      }
    } catch {
      // Fallback on parse error
    }
    return JSON.parse(JSON.stringify(VERIFIED_BASELINE_SCENARIO));
  });

  const [savedScenarios, setSavedScenarios] = useState<PlannerScenario[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SAVED);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed as PlannerScenario[];
        }
      }
    } catch {
      // Fallback
    }
    return [JSON.parse(JSON.stringify(VERIFIED_BASELINE_SCENARIO))];
  });

  // Auto-persist working scenario to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WORKING, JSON.stringify(workingScenario));
    } catch (e) {
      console.warn("Failed to save working scenario to localStorage", e);
    }
  }, [workingScenario]);

  // Auto-persist saved scenarios list
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(savedScenarios));
    } catch (e) {
      console.warn("Failed to save scenario list to localStorage", e);
    }
  }, [savedScenarios]);

  const resetToBaseline = useCallback(() => {
    const fresh = JSON.parse(JSON.stringify(VERIFIED_BASELINE_SCENARIO));
    fresh.updatedAt = new Date().toISOString().split("T")[0];
    setWorkingScenario(fresh);
  }, []);

  const saveWorkingScenario = useCallback((customName?: string) => {
    setWorkingScenario((current) => {
      const now = new Date().toISOString().split("T")[0];
      const updatedName = customName || current.name;
      const updated = {
        ...current,
        name: updatedName,
        updatedAt: now,
        isBaseline: false,
      };

      setSavedScenarios((prev) => {
        const existingIndex = prev.findIndex((s) => s.id === updated.id);
        if (existingIndex >= 0) {
          const list = [...prev];
          list[existingIndex] = updated;
          return list;
        } else {
          return [...prev, updated];
        }
      });

      return updated;
    });
  }, []);

  const loadScenario = useCallback((id: string) => {
    if (id === VERIFIED_BASELINE_SCENARIO.id) {
      resetToBaseline();
      return;
    }
    const found = savedScenarios.find((s) => s.id === id);
    if (found) {
      setWorkingScenario(JSON.parse(JSON.stringify(found)));
    }
  }, [savedScenarios, resetToBaseline]);

  const duplicateScenario = useCallback((id: string) => {
    const source = id === VERIFIED_BASELINE_SCENARIO.id
      ? VERIFIED_BASELINE_SCENARIO
      : savedScenarios.find((s) => s.id === id) || workingScenario;

    const copy: PlannerScenario = JSON.parse(JSON.stringify(source));
    copy.id = `scenario-${Date.now()}`;
    copy.name = `${source.name} (Copy)`;
    copy.updatedAt = new Date().toISOString().split("T")[0];
    copy.isBaseline = false;

    setSavedScenarios((prev) => [...prev, copy]);
    setWorkingScenario(copy);
  }, [savedScenarios, workingScenario]);

  const deleteSavedScenario = useCallback((id: string) => {
    if (id === VERIFIED_BASELINE_SCENARIO.id) return;
    setSavedScenarios((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const renameScenario = useCallback((id: string, newName: string) => {
    if (!newName.trim() || id === VERIFIED_BASELINE_SCENARIO.id) return;
    setSavedScenarios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName.trim(), updatedAt: new Date().toISOString().split("T")[0] } : s))
    );
    setWorkingScenario((current) =>
      current.id === id ? { ...current, name: newName.trim(), updatedAt: new Date().toISOString().split("T")[0] } : current
    );
  }, []);

  const exportScenarioJson = useCallback(() => {
    const dataStr = JSON.stringify(workingScenario, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (workingScenario.name || "scenario").toLowerCase().replace(/[^a-z0-9]/g, "_");
    link.href = url;
    link.download = `${safeName}_planning_scenario.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [workingScenario]);

  const importScenarioJson = useCallback((jsonStr: string): ScenarioImportResult => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== "object") {
        return { success: false, message: "Invalid JSON format: root is not an object." };
      }
      if (!parsed.projectInfo || !parsed.panelSpecs || !parsed.inverterSpecs) {
        return { success: false, message: "Missing required scenario schema fields (projectInfo, panelSpecs, or inverterSpecs)." };
      }
      if (!Array.isArray(parsed.pvStrings) || !Array.isArray(parsed.loads)) {
        return { success: false, message: "Invalid schema: pvStrings and loads must be arrays." };
      }

      const importedScenario: PlannerScenario = {
        ...JSON.parse(JSON.stringify(VERIFIED_BASELINE_SCENARIO)),
        ...parsed,
        id: `imported-${Date.now()}`,
        name: parsed.name ? `${parsed.name} (Imported)` : "Imported Planning Scenario",
        updatedAt: new Date().toISOString().split("T")[0],
        isBaseline: false,
      };

      setWorkingScenario(importedScenario);
      setSavedScenarios((prev) => [...prev, importedScenario]);
      return { success: true, message: "Scenario imported and loaded successfully!" };
    } catch (e: unknown) {
      const errMessage = e instanceof Error ? e.message : "Unknown error parsing JSON file.";
      return { success: false, message: `JSON Import Error: ${errMessage}` };
    }
  }, []);

  return {
    workingScenario,
    setWorkingScenario,
    savedScenarios,
    resetToBaseline,
    saveWorkingScenario,
    loadScenario,
    duplicateScenario,
    deleteSavedScenario,
    renameScenario,
    exportScenarioJson,
    importScenarioJson,
  };
}
