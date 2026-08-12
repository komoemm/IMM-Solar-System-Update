import React, { useState, useMemo } from "react";
import { SLD_NODES, SLD_CONNECTIONS, SLDNodeData, NodeCategory } from "../data/sldData";
import { OPERATING_SCENARIOS, ScenarioKey } from "../data/scenarios";
import { ALL_PV_STRINGS, StringSpec, ENGINEERING_WARNINGS } from "../data/systemConfig";
import { SLDNode } from "./SLDNode";
import { ComponentDetails } from "./ComponentDetails";
import { MPPTExplorer } from "./MPPTExplorer";
import { PVStringModal } from "./PVStringModal";
import { GeneratorInfoModal } from "./GeneratorInfoModal";

export const InteractiveSLD: React.FC = () => {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>("sunny_grid");
  const [isEngineerMode, setIsEngineerMode] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("inv1");
  const [showAllLabels, setShowAllLabels] = useState<boolean>(false);
  const [isAnimationPaused, setIsAnimationPaused] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Modals state
  const [activeMpptInverter, setActiveMpptInverter] = useState<1 | 2 | null>(null);
  const [selectedPVString, setSelectedPVString] = useState<StringSpec | null>(null);
  const [showGenModal, setShowGenModal] = useState<boolean>(false);
  const [showWarnings, setShowWarnings] = useState<boolean>(false);

  const scenario = OPERATING_SCENARIOS[scenarioKey];
  const selectedNode = selectedNodeId ? SLD_NODES[selectedNodeId] || null : null;

  // Active routes helper
  const activeRouteSet = useMemo(() => new Set(scenario.activeRoutes), [scenario]);
  const activeNodeSet = useMemo(() => new Set(scenario.activeNodes), [scenario]);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(130, Math.max(70, prev + delta)));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  return (
    <section className="section sld-interactive-section" id="interactive-sld">
      {/* Section Header */}
      <div className="section-heading">
        <div>
          <p className="kicker">
            <span /> Interactive Engineering SLD
          </p>
          <h2>Factory Single Line Diagram (120.70 kWp Solar PV + 100 kW Hybrid Inverter System)</h2>
        </div>
        <p>
          Conceptual schematic detailing Branch 1 (PV1 / Bat1 / Inv1) and Branch 2 (PV2 / Bat2 / Inv2), protection devices, Solar ACDB, ATS, Generator, Maintenance Bypass, and Load distribution.
        </p>
      </div>

      {/* Generator Integration Architecture Warning Banner */}
      <div className="gen-architecture-strip">
        <div className="strip-info">
          <span className="strip-badge">TO BE CONFIRMED</span>
          <div>
            <strong>Generator Integration – Architecture to be Confirmed</strong>
            <p>Select either Option A (ATS route) or Option B (Dedicated Solis GEN port). Never connect both simultaneously.</p>
          </div>
        </div>
        <button
          type="button"
          className="gen-info-btn"
          onClick={() => setShowGenModal(true)}
        >
          Option A vs B Details ℹ️
        </button>
      </div>

      {/* Main Control Toolbar */}
      <div className="sld-toolbar">
        {/* View Mode Toggle */}
        <div className="view-mode-selector" role="radiogroup" aria-label="SLD View Detail Level">
          <button
            type="button"
            className={!isEngineerMode ? "active-mode" : ""}
            onClick={() => setIsEngineerMode(false)}
            aria-checked={!isEngineerMode}
            role="radio"
          >
            Beginner View
          </button>
          <button
            type="button"
            className={isEngineerMode ? "active-mode" : ""}
            onClick={() => setIsEngineerMode(true)}
            aria-checked={isEngineerMode}
            role="radio"
          >
            Engineer View
          </button>
        </div>

        {/* Toolbar Utility Buttons */}
        <div className="toolbar-utilities">
          <button
            type="button"
            className={`tool-btn ${showAllLabels ? "active" : ""}`}
            onClick={() => setShowAllLabels(!showAllLabels)}
            title="Toggle additional component ratings"
          >
            🏷️ Labels: {showAllLabels ? "ON" : "OFF"}
          </button>

          <button
            type="button"
            className={`tool-btn ${isAnimationPaused ? "active" : ""}`}
            onClick={() => setIsAnimationPaused(!isAnimationPaused)}
            title="Pause power flow pulse animations"
          >
            {isAnimationPaused ? "▶️ Resume Motion" : "⏸️ Pause Motion"}
          </button>

          <div className="zoom-controls">
            <button type="button" onClick={() => handleZoom(-10)} title="Zoom out">
              −
            </button>
            <span>{zoomLevel}%</span>
            <button type="button" onClick={() => handleZoom(10)} title="Zoom in">
              +
            </button>
            <button type="button" onClick={handleResetZoom} title="Reset zoom">
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Operating Scenario Selector Tabs */}
      <div className="scenario-tabs-container">
        <span className="tabs-label">Operating Situation:</span>
        <div className="scenario-tabs-list" role="tablist" aria-label="Operating Scenarios">
          {(Object.keys(OPERATING_SCENARIOS) as ScenarioKey[]).map((key) => {
            const sc = OPERATING_SCENARIOS[key];
            const isSelected = scenarioKey === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`scenario-tab ${isSelected ? "selected" : ""}`}
                onClick={() => setScenarioKey(key)}
              >
                <span className="tab-name">{sc.label}</span>
                <small className="tab-badge">{sc.badge}</small>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenario Summary Banner */}
      <div className="scenario-readout-banner">
        <div className="readout-title">
          <span className="status-dot active" />
          <div>
            <h3>{scenario.title}</h3>
            <p>{isEngineerMode ? scenario.engineerDescription : scenario.beginnerDescription}</p>
          </div>
        </div>
        <div className="readout-route">
          <span>Active Energy Path:</span>
          <b>{scenario.flowSummary}</b>
        </div>
      </div>

      {/* Interactive Canvas Workspace */}
      <div className={`sld-workspace ${isAnimationPaused ? "animation-paused" : ""}`}>
        <div className="sld-canvas-scroll-wrapper">
          <div
            className="sld-diagram-canvas"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top left" }}
          >
            {/* BRANCH 1: INVERTER 1 & BATTERY PACK 1 */}
            <div className="diagram-branch-group branch-1-group">
              <div className="branch-label-header">
                <span>INVERTER 1 BRANCH (60.35 kWp Solar + High-Voltage Battery)</span>
              </div>

              <div className="branch-nodes-row">
                {/* PV Array 1 */}
                <SLDNode
                  node={SLD_NODES.pv_group1}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("pv_group1")}
                  isSelected={selectedNodeId === "pv_group1"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("pv_group1")}
                />

                <div className={`connection-arrow-line ${activeRouteSet.has("pv1_to_dc1") ? "active solar-dc" : ""}`}>
                  <span>Solar DC</span>
                </div>

                {/* DC Protection 1 */}
                <SLDNode
                  node={SLD_NODES.dc_prot1}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("dc_prot1")}
                  isSelected={selectedNodeId === "dc_prot1"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("dc_prot1")}
                />

                <div className={`connection-arrow-line ${activeRouteSet.has("dc1_to_inv1") ? "active solar-dc" : ""}`}>
                  <span>60.35 kWp</span>
                </div>

                {/* Hybrid Inverter 1 */}
                <div className="inverter-wrapper-node">
                  <SLDNode
                    node={SLD_NODES.inv1}
                    isEngineerMode={isEngineerMode}
                    isActive={activeNodeSet.has("inv1")}
                    isSelected={selectedNodeId === "inv1"}
                    showAllLabels={showAllLabels}
                    onClick={() => setSelectedNodeId("inv1")}
                  />
                  <button
                    type="button"
                    className="quick-mppt-btn"
                    onClick={() => setActiveMpptInverter(1)}
                  >
                    View MPPTs 🔍
                  </button>
                </div>

                <div className={`connection-arrow-line ${activeRouteSet.has("inv1_to_ac1") ? "active inv-ac" : ""}`}>
                  <span>50 kW AC</span>
                </div>

                {/* AC MCCB 1 */}
                <SLDNode
                  node={SLD_NODES.mccb1}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("mccb1")}
                  isSelected={selectedNodeId === "mccb1"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("mccb1")}
                />
              </div>

              {/* Battery Stack 1 */}
              <div className="battery-sub-branch">
                <SLDNode
                  node={SLD_NODES.bat_pack1}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("bat_pack1")}
                  isSelected={selectedNodeId === "bat_pack1"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("bat_pack1")}
                />

                <SLDNode
                  node={SLD_NODES.bms1}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("bms1")}
                  isSelected={selectedNodeId === "bms1"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("bms1")}
                />

                <SLDNode
                  node={SLD_NODES.bat_brk1}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("bat_brk1")}
                  isSelected={selectedNodeId === "bat_brk1"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("bat_brk1")}
                />

                <div className={`connection-arrow-line ${activeRouteSet.has("brk1_to_inv1") || activeRouteSet.has("inv1_to_brk1") ? "active battery-dc" : ""}`}>
                  <span>HV DC</span>
                </div>
              </div>
            </div>

            {/* BRANCH 2: INVERTER 2 & BATTERY PACK 2 */}
            <div className="diagram-branch-group branch-2-group">
              <div className="branch-label-header">
                <span>INVERTER 2 BRANCH (60.35 kWp Solar + High-Voltage Battery)</span>
              </div>

              <div className="branch-nodes-row">
                {/* PV Array 2 */}
                <SLDNode
                  node={SLD_NODES.pv_group2}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("pv_group2")}
                  isSelected={selectedNodeId === "pv_group2"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("pv_group2")}
                />

                <div className={`connection-arrow-line ${activeRouteSet.has("pv2_to_dc2") ? "active solar-dc" : ""}`}>
                  <span>Solar DC</span>
                </div>

                {/* DC Protection 2 */}
                <SLDNode
                  node={SLD_NODES.dc_prot2}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("dc_prot2")}
                  isSelected={selectedNodeId === "dc_prot2"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("dc_prot2")}
                />

                <div className={`connection-arrow-line ${activeRouteSet.has("dc2_to_inv2") ? "active solar-dc" : ""}`}>
                  <span>60.35 kWp</span>
                </div>

                {/* Hybrid Inverter 2 */}
                <div className="inverter-wrapper-node">
                  <SLDNode
                    node={SLD_NODES.inv2}
                    isEngineerMode={isEngineerMode}
                    isActive={activeNodeSet.has("inv2")}
                    isSelected={selectedNodeId === "inv2"}
                    showAllLabels={showAllLabels}
                    onClick={() => setSelectedNodeId("inv2")}
                  />
                  <button
                    type="button"
                    className="quick-mppt-btn"
                    onClick={() => setActiveMpptInverter(2)}
                  >
                    View MPPTs 🔍
                  </button>
                </div>

                <div className={`connection-arrow-line ${activeRouteSet.has("inv2_to_ac2") ? "active inv-ac" : ""}`}>
                  <span>50 kW AC</span>
                </div>

                {/* AC MCCB 2 */}
                <SLDNode
                  node={SLD_NODES.mccb2}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("mccb2")}
                  isSelected={selectedNodeId === "mccb2"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("mccb2")}
                />
              </div>

              {/* Battery Stack 2 */}
              <div className="battery-sub-branch">
                <SLDNode
                  node={SLD_NODES.bat_pack2}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("bat_pack2")}
                  isSelected={selectedNodeId === "bat_pack2"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("bat_pack2")}
                />

                <SLDNode
                  node={SLD_NODES.bms2}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("bms2")}
                  isSelected={selectedNodeId === "bms2"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("bms2")}
                />

                <SLDNode
                  node={SLD_NODES.bat_brk2}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("bat_brk2")}
                  isSelected={selectedNodeId === "bat_brk2"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("bat_brk2")}
                />

                <div className={`connection-arrow-line ${activeRouteSet.has("brk2_to_inv2") || activeRouteSet.has("inv2_to_brk2") ? "active battery-dc" : ""}`}>
                  <span>HV DC</span>
                </div>
              </div>
            </div>

            {/* CENTRAL AC DISTRIBUTION (SOLAR ACDB) */}
            <div className="diagram-central-hub">
              <div className="branch-label-header">
                <span>CENTRAL AC POWER HUB (SOLAR ACDB)</span>
              </div>
              <SLDNode
                node={SLD_NODES.solar_acdb}
                isEngineerMode={isEngineerMode}
                isActive={activeNodeSet.has("solar_acdb")}
                isSelected={selectedNodeId === "solar_acdb"}
                showAllLabels={showAllLabels}
                onClick={() => setSelectedNodeId("solar_acdb")}
              />
            </div>

            {/* EXTERNAL SOURCES (GRID & GENERATOR & ATS) */}
            <div className="diagram-external-section">
              <div className="branch-label-header">
                <span>EXTERNAL POWER SOURCES & AUTOMATIC TRANSFER SWITCH</span>
              </div>
              <div className="external-nodes-row">
                <SLDNode
                  node={SLD_NODES.grid_supply}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("grid_supply")}
                  isSelected={selectedNodeId === "grid_supply"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("grid_supply")}
                />

                <SLDNode
                  node={SLD_NODES.grid_prot}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("grid_prot")}
                  isSelected={selectedNodeId === "grid_prot"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("grid_prot")}
                />

                <div className={`connection-arrow-line ${activeRouteSet.has("grid_prot_to_ats") ? "active grid-ac" : ""}`}>
                  <span>Grid AC</span>
                </div>

                <SLDNode
                  node={SLD_NODES.ats}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("ats")}
                  isSelected={selectedNodeId === "ats"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("ats")}
                />

                <div className={`connection-arrow-line ${activeRouteSet.has("gen_prot_to_ats") ? "active gen-ac" : ""}`}>
                  <span>Generator AC</span>
                </div>

                <SLDNode
                  node={SLD_NODES.gen_prot}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("gen_prot")}
                  isSelected={selectedNodeId === "gen_prot"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("gen_prot")}
                />

                <SLDNode
                  node={SLD_NODES.gen_supply}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("gen_supply")}
                  isSelected={selectedNodeId === "gen_supply"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("gen_supply")}
                />
              </div>
            </div>

            {/* FACTORY LOAD DISTRIBUTION & BYPASS */}
            <div className="diagram-loads-section">
              <div className="branch-label-header">
                <span>FACTORY LOAD BUSES & MAINTENANCE BYPASS</span>
              </div>
              <div className="loads-nodes-row">
                <SLDNode
                  node={SLD_NODES.norm_bus}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("norm_bus")}
                  isSelected={selectedNodeId === "norm_bus"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("norm_bus")}
                />

                <SLDNode
                  node={SLD_NODES.bypass_switch}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("bypass_switch")}
                  isSelected={selectedNodeId === "bypass_switch"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("bypass_switch")}
                />

                <SLDNode
                  node={SLD_NODES.crit_bus}
                  isEngineerMode={isEngineerMode}
                  isActive={activeNodeSet.has("crit_bus")}
                  isSelected={selectedNodeId === "crit_bus"}
                  showAllLabels={showAllLabels}
                  onClick={() => setSelectedNodeId("crit_bus")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Legend Panel */}
        <div className="sld-legend-bar">
          <span className="legend-title">SLD Route Legend:</span>
          <div className="legend-items">
            <span className="legend-item solar-dc">
              <i /> Solar DC
            </span>
            <span className="legend-item battery-dc">
              <i /> Battery DC
            </span>
            <span className="legend-item grid-ac">
              <i /> Grid AC
            </span>
            <span className="legend-item gen-ac">
              <i /> Generator AC
            </span>
            <span className="legend-item inv-ac">
              <i /> Inverter AC
            </span>
            <span className="legend-item inactive">
              <i /> Inactive Line
            </span>
          </div>
        </div>
      </div>

      {/* Component Details Panel */}
      <ComponentDetails
        node={selectedNode}
        onOpenMPPT={(invId) => setActiveMpptInverter(invId)}
      />

      {/* Quick String Inspection Accordion Section */}
      <div className="pv-strings-quick-accordion">
        <div className="accordion-head">
          <div>
            <h3>Inspect Individual PV Strings (14 Strings Total)</h3>
            <p>Click any string below to view calculated Vmp, Voc, capacity, and temperature-correction warnings.</p>
          </div>
        </div>
        <div className="strings-pills-grid">
          {ALL_PV_STRINGS.map((str) => (
            <button
              key={str.id}
              type="button"
              className={`string-card-pill ${str.panelCount === 13 ? "highlight-13" : ""}`}
              onClick={() => setSelectedPVString(str)}
            >
              <div className="pill-top">
                <b>{str.id}</b>
                <span className="pill-panels">{str.panelCount} Panels</span>
              </div>
              <div className="pill-bottom">
                <span>{str.capacityKwp} kWp</span>
                <span>Voc: {str.vocStc}V</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Collapsible Engineering Warnings Section */}
      <div className="engineering-warnings-section">
        <button
          type="button"
          className="warnings-toggle-head"
          onClick={() => setShowWarnings(!showWarnings)}
          aria-expanded={showWarnings}
        >
          <div>
            <span>⚠️</span>
            <h3>Important Engineering Review Warnings & Design Safety Checklist</h3>
          </div>
          <b>{showWarnings ? "Collapse ▲" : "Expand Review Warnings ▼"}</b>
        </button>

        {showWarnings && (
          <div className="warnings-grid">
            {ENGINEERING_WARNINGS.map((warn, i) => (
              <div key={i} className={`warning-card level-${warn.level}`}>
                <h4>
                  <span className="warn-icon">{warn.level === "danger" ? "🛑" : "⚠️"}</span>
                  {warn.title}
                </h4>
                <p>{warn.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      {activeMpptInverter && (
        <MPPTExplorer
          inverterId={activeMpptInverter}
          onClose={() => setActiveMpptInverter(null)}
          onSelectString={(str) => {
            setActiveMpptInverter(null);
            setSelectedPVString(str);
          }}
        />
      )}

      {selectedPVString && (
        <PVStringModal
          stringSpec={selectedPVString}
          onClose={() => setSelectedPVString(null)}
        />
      )}

      {showGenModal && (
        <GeneratorInfoModal onClose={() => setShowGenModal(false)} />
      )}
    </section>
  );
};
