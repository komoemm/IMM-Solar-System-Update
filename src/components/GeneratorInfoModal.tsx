import React from "react";
import { useModalAccessibility } from "../hooks/useModalAccessibility";

interface GeneratorInfoModalProps {
  onClose: () => void;
}

export const GeneratorInfoModal: React.FC<GeneratorInfoModalProps> = ({ onClose }) => {
  const modalRef = useModalAccessibility(onClose);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="gen-modal-title">
      <div className="modal-content gen-modal" ref={modalRef} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-kicker">Architecture to be Confirmed</span>
            <h2 id="gen-modal-title">Generator Integration Architecture Options</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close generator integration details">
            ✕
          </button>
        </div>

        <div className="gen-warning-banner">
          <span className="alert-icon">⚡</span>
          <div>
            <strong>CRITICAL GENERATOR SAFETY WARNING</strong>
            <p>
              Do NOT connect a single diesel generator through two live routes simultaneously! Connecting the generator output to both the ATS grid input AND the inverter GEN port created an unsafe dual-feed loop. One architecture must be chosen and approved by Solis and the lead electrical engineer.
            </p>
          </div>
        </div>

        <div className="options-comparison-grid">
          <div className="option-card">
            <span className="option-badge">OPTION A</span>
            <h3>ATS-Fed Inverter Grid-Input Route</h3>
            <p className="option-desc">
              The generator connects directly to the standby input of the main Automatic Transfer Switch (ATS).
            </p>
            <ul className="option-bullets">
              <li><b>How it works:</b> During an outage, the ATS switches from Grid to Generator. Power feeds Normal Factory Loads and enters the Inverter Grid Port.</li>
              <li><b>Pros:</b> Simple switching, powers both non-critical loads and charges batteries via standard inverter AC input.</li>
              <li><b>Cons:</b> Requires generator frequency/voltage stability to prevent inverter grid disconnection.</li>
            </ul>
          </div>

          <div className="option-card">
            <span className="option-badge accent">OPTION B</span>
            <h3>Dedicated Solis GEN-Port Route</h3>
            <p className="option-desc">
              The generator connects directly to the auxiliary GEN port on the Solis S6 hybrid inverter.
            </p>
            <ul className="option-bullets">
              <li><b>How it works:</b> Inverter manages generator start/stop via dry contacts. Generator feeds battery charging and critical load backup directly through inverter hardware.</li>
              <li><b>Pros:</b> Intelligent generator charge current limiting; prevents generator stall/overload.</li>
              <li><b>Cons:</b> Normal/non-critical loads remain offline unless fed via separate contactor logic.</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="primary-button" onClick={onClose}>
            Understand Generator Safety & Close
          </button>
        </div>
      </div>
    </div>
  );
};
