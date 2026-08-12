import React from "react";
import { INVERTER_MPPT_MAP, ALL_PV_STRINGS, StringSpec } from "../data/systemConfig";
import { useModalAccessibility } from "../hooks/useModalAccessibility";

interface MPPTExplorerProps {
  inverterId: 1 | 2;
  onClose: () => void;
  onSelectString: (stringSpec: StringSpec) => void;
}

export const MPPTExplorer: React.FC<MPPTExplorerProps> = ({
  inverterId,
  onClose,
  onSelectString,
}) => {
  const modalRef = useModalAccessibility(onClose);
  const mppts = INVERTER_MPPT_MAP[inverterId];
  const inverterStrings = ALL_PV_STRINGS.filter((s) => s.inverterId === inverterId);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="mppt-modal-title">
      <div className="modal-content mppt-modal" ref={modalRef} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-kicker">Solis 50 kW Hybrid Inverter Architecture</span>
            <h2 id="mppt-modal-title">Inverter {inverterId} MPPT & String Allocation Map</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close MPPT map">
            ✕
          </button>
        </div>

        <div className="mppt-summary-banner">
          <div className="banner-metric">
            <b>85</b>
            <span>Total Panels</span>
          </div>
          <div className="banner-metric">
            <b>60.35 kWp</b>
            <span>PV Array Capacity</span>
          </div>
          <div className="banner-metric">
            <b>7</b>
            <span>Active PV Strings</span>
          </div>
          <div className="banner-metric">
            <b>4</b>
            <span>Independent MPPTs</span>
          </div>
        </div>

        <div className="engineering-rule-box">
          <span className="rule-icon">⚠️</span>
          <div>
            <strong>Strict Engineering Requirement</strong>
            <p>
              Do NOT connect a 12-panel string and a 13-panel string in parallel on the same MPPT. Parallel string inputs must have identical Vmp voltages (484.8 V) to prevent severe power loss and circulating currents.
            </p>
          </div>
        </div>

        <div className="mppt-grid-container">
          {mppts.map((mppt) => (
            <div key={mppt.mpptNumber} className={`mppt-card ${mppt.mpptNumber === 4 ? "single-string" : ""}`}>
              <div className="mppt-card-header">
                <h3>MPPT {mppt.mpptNumber}</h3>
                <span className="mppt-status">{mppt.mpptNumber === 4 ? "Dedicated Single String" : "Parallel Dual Inputs"}</span>
              </div>

              <div className="mppt-inputs-list">
                <div className="input-row">
                  <span className="input-label">Input A:</span>
                  <span className="input-value">{mppt.inputA}</span>
                </div>
                <div className="input-row">
                  <span className="input-label">Input B:</span>
                  <span className={`input-value ${mppt.inputB.includes("Spare") ? "spare" : ""}`}>
                    {mppt.inputB}
                  </span>
                </div>
              </div>

              <p className="mppt-notes">{mppt.notes}</p>
            </div>
          ))}
        </div>

        <div className="string-buttons-section">
          <h3>Click any PV String to view panel & voltage specs:</h3>
          <div className="string-pills-list">
            {inverterStrings.map((str) => (
              <button
                key={str.id}
                type="button"
                className={`string-pill ${str.panelCount === 13 ? "highlight-13" : ""}`}
                onClick={() => onSelectString(str)}
              >
                <span>{str.id}</span>
                <b>{str.panelCount} Panels</b>
                <small>({str.capacityKwp} kWp)</small>
              </button>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="primary-button" onClick={onClose}>
            Close MPPT Map
          </button>
        </div>
      </div>
    </div>
  );
};
