import React from "react";
import { StringSpec, PANEL_STC_SPECS } from "../data/systemConfig";
import { useModalAccessibility } from "../hooks/useModalAccessibility";

interface PVStringModalProps {
  stringSpec: StringSpec;
  onClose: () => void;
}

export const PVStringModal: React.FC<PVStringModalProps> = ({ stringSpec, onClose }) => {
  const modalRef = useModalAccessibility(onClose);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="string-modal-title">
      <div className="modal-content string-modal" ref={modalRef} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-kicker">PV String Identification</span>
            <h2 id="string-modal-title">
              String {stringSpec.id} Specifications
            </h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close string details">
            ✕
          </button>
        </div>

        <div className="stc-badge-banner">
          <span className="stc-pill">STC REFERENCE VALUES (25°C, 1000 W/m²)</span>
          <p>These values represent Standard Test Conditions. Cold weather increases Voc voltage.</p>
        </div>

        <div className="string-metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Panel Count</span>
            <b className="metric-value">{stringSpec.panelCount} Panels</b>
            <small>710 W Tier-1 N-Type</small>
          </div>

          <div className="metric-card">
            <span className="metric-label">String Capacity</span>
            <b className="metric-value">{stringSpec.capacityKwp} kWp</b>
            <small>{stringSpec.panelCount} × 710 W</small>
          </div>

          <div className="metric-card">
            <span className="metric-label">Approx. Vmp (STC)</span>
            <b className="metric-value">{stringSpec.vmpStc} V</b>
            <small>{stringSpec.panelCount} × 40.4 V</small>
          </div>

          <div className="metric-card highlight">
            <span className="metric-label">Approx. Voc (STC)</span>
            <b className="metric-value">{stringSpec.vocStc} V</b>
            <small>{stringSpec.panelCount} × 48.3 V</small>
          </div>
        </div>

        <div className="temp-warning-box">
          <span className="warning-icon">🌡️</span>
          <div>
            <strong>Temperature-Correction Warning</strong>
            <p>
              Cold-temperature Voc must be calculated using the exact panel Voc temperature coefficient and the minimum design temperature. Manufacturer reference—verify the exact installed inverter model (Solis hybrid inverter 1000 V DC maximum limit).
            </p>
          </div>
        </div>

        <div className="single-panel-ref">
          <h3>Single 710 W Panel STC Reference Specs:</h3>
          <div className="specs-table">
            <div><span>Model:</span> <b>{PANEL_STC_SPECS.model}</b></div>
            <div><span>Rated Power (Pmax):</span> <b>{PANEL_STC_SPECS.wattage} W</b></div>
            <div><span>Voltage at Pmax (Vmp):</span> <b>{PANEL_STC_SPECS.vmp} V</b></div>
            <div><span>Open-Circuit Voltage (Voc):</span> <b>{PANEL_STC_SPECS.voc} V</b></div>
            <div><span>Current at Pmax (Imp):</span> <b>{PANEL_STC_SPECS.imp} A</b></div>
            <div><span>Short-Circuit Current (Isc):</span> <b>{PANEL_STC_SPECS.isc} A</b></div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="primary-button" onClick={onClose}>
            Close String Details
          </button>
        </div>
      </div>
    </div>
  );
};
