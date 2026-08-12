import React from "react";
import { DataStatus } from "../../types/planner";

interface StatusBadgeProps {
  status: DataStatus;
  size?: "sm" | "md";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "sm", className = "" }) => {
  let badgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-300";
  let icon = "✓";

  if (status === "USER INPUT") {
    badgeStyle = "bg-sky-100 text-sky-800 border-sky-300";
    icon = "✎";
  } else if (status === "CALCULATED ESTIMATE") {
    badgeStyle = "bg-amber-100 text-amber-900 border-amber-300";
    icon = "≈";
  } else if (status === "TO CONFIRM") {
    badgeStyle = "bg-orange-100 text-orange-900 border-orange-300 border-dashed";
    icon = "⚠";
  }

  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5 rounded-md" : "text-sm px-2.5 py-1 rounded-md";

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold border ${badgeStyle} ${sizeClasses} ${className}`}
      title={`Data Status: ${status}`}
      role="status"
    >
      <span aria-hidden="true">{icon}</span>
      <span>{status}</span>
    </span>
  );
};
