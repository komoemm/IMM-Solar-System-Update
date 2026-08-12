import React from "react";
import { SLDNodeData } from "../data/sldData";

interface ComponentDetailsProps {
  node: SLDNodeData | null;
  onOpenMPPT?: (inverterId: 1 | 2) => void;
  onClose?: () => void;
}

export const ComponentDetails: React.FC<ComponentDetailsProps> = ({
  node,
  onOpenMPPT,
  onClose,
}) => {
  if (!node) {
    return (
      <div className="sld-details-empty">
        <p>💡 Click any node or equipment block in the diagram to inspect its engineering parameters, protection rules, and connectivity.</p>
      </div>
    );
  }

  const isInverter = node.id === "inv1" || node.id === "inv2";
  const inverterId = node.id === "inv1" ? 1 : node.id === "inv2" ? 2 : null;

  return (
    <div className="component-details-panel" aria-live="polite">
      <div className="panel-top-bar">
        <div>
          <span className={`category-pill category-${node.category}`}>
            {node.category.toUpperCase().replace("_", " ")}
          </span>
          <h3>{node.engineerLabel}</h3>
          <p className="panel-subtitle">{node.subtitle}</p>
        </div>
        {onClose && (
          <button className="close-panel-btn" onClick={onClose} aria-label="Close component detail drawer">
            ✕
          </button>
        )}
      </div>

      <div className="panel-sections-grid">
        <div className="panel-block">
          <h4>Simple Explanation</h4>
          <p className="copy-text">{node.simpleExplanation}</p>
        </div>

        <div className="panel-block">
          <h4>Engineering Purpose</h4>
          <p className="copy-text highlight-bg">{node.engineeringPurpose}</p>
        </div>

        <div className="panel-block">
          <h4>Connectivity</h4>
          <div className="connectivity-list">
            <div>
              <span className="conn-label">Connected From:</span>
              <ul>
                {node.connectedFrom.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="conn-label">Connected To:</span>
              <ul>
                {node.connectedTo.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="panel-block">
          <h4>Protection Requirement</h4>
          <p className="copy-text warning-border">{node.protectionRequirement}</p>
        </div>

        <div className="panel-block">
          <h4>Provisional Rating</h4>
          <span className="rating-badge">{node.ratingProvisional}</span>
        </div>

        <div className="panel-block full-width">
          <h4>
            <span className="confirm-icon">📋</span> Items Requiring Engineer Confirmation ("To Confirm")
          </h4>
          {node.toConfirmItems.length > 0 ? (
            <ul className="to-confirm-list">
              {node.toConfirmItems.map((item, idx) => (
                <li key={idx}>
                  <span className="badge-confirm">To Confirm</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-items">Standard design specs - no special pending items.</p>
          )}
        </div>
      </div>

      {isInverter && inverterId && onOpenMPPT && (
        <div className="panel-action-bar">
          <button
            type="button"
            className="primary-button"
            onClick={() => onOpenMPPT(inverterId)}
          >
            Expand Inverter {inverterId} MPPT Allocation Map 🔍
          </button>
        </div>
      )}
    </div>
  );
};
