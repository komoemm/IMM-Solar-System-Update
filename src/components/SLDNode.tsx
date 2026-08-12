import React from "react";
import { SLDNodeData } from "../data/sldData";

interface SLDNodeProps {
  node: SLDNodeData;
  isEngineerMode: boolean;
  isActive: boolean;
  isSelected: boolean;
  showAllLabels: boolean;
  onClick: () => void;
}

export const SLDNode: React.FC<SLDNodeProps> = ({
  node,
  isEngineerMode,
  isActive,
  isSelected,
  showAllLabels,
  onClick,
}) => {
  const displayTitle = isEngineerMode ? node.engineerLabel : node.beginnerLabel;

  return (
    <button
      type="button"
      className={`sld-node-card category-${node.category} branch-${node.branch} ${
        isActive ? "active-node" : "inactive-node"
      } ${isSelected ? "selected-node" : ""}`}
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`Select ${displayTitle}`}
      tabIndex={0}
    >
      <div className="node-card-header">
        <span className={`node-type-badge category-${node.category}`}>
          {node.category.toUpperCase().replace("_", " ")}
        </span>
        {isEngineerMode && node.toConfirmItems.length > 0 && (
          <span className="to-confirm-badge" title={`${node.toConfirmItems.length} items to confirm`}>
            To Confirm ({node.toConfirmItems.length})
          </span>
        )}
      </div>

      <div className="node-card-title">
        <strong>{displayTitle}</strong>
        <small>{node.subtitle}</small>
      </div>

      {(showAllLabels || isEngineerMode) && (
        <div className="node-card-meta">
          <span className="provisional-tag">{node.ratingProvisional}</span>
        </div>
      )}

      {isSelected && <span className="selection-indicator">✓ Selected</span>}
    </button>
  );
};
