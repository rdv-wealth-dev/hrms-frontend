import React from "react";
import { Chip, type ChipProps, type SxProps, type Theme } from "@mui/material";

interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  borderColor?: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  // Positive / Success states
  APPROVED: { label: "Approved", color: "#166534", bg: "#DCFCE7", borderColor: "#BBF7D0" },
  ACTIVE: { label: "Active", color: "#166534", bg: "#DCFCE7", borderColor: "#BBF7D0" },
  PRESENT: { label: "Present", color: "#166534", bg: "#DCFCE7", borderColor: "#BBF7D0" },
  COMPLETED: { label: "Completed", color: "#166534", bg: "#DCFCE7", borderColor: "#BBF7D0" },
  VERIFIED: { label: "Verified", color: "#166534", bg: "#DCFCE7", borderColor: "#BBF7D0" },

  // Warning / Pending states
  PENDING: { label: "Pending", color: "#92400E", bg: "#FEF3C7", borderColor: "#FDE68A" },
  IN_REVIEW: { label: "In Review", color: "#92400E", bg: "#FEF3C7", borderColor: "#FDE68A" },
  PROCESSING: { label: "Processing", color: "#92400E", bg: "#FEF3C7", borderColor: "#FDE68A" },
  SUBMITTED: { label: "Submitted", color: "#92400E", bg: "#FEF3C7", borderColor: "#FDE68A" },

  // Negative / Danger states
  REJECTED: { label: "Rejected", color: "#991B1B", bg: "#FEE2E2", borderColor: "#FCA5A5" },
  ABSENT: { label: "Absent", color: "#991B1B", bg: "#FEE2E2", borderColor: "#FCA5A5" },
  INACTIVE: { label: "Inactive", color: "#991B1B", bg: "#FEE2E2", borderColor: "#FCA5A5" },
  CANCELLED: { label: "Cancelled", color: "#991B1B", bg: "#FEE2E2", borderColor: "#FCA5A5" },
  TERMINATED: { label: "Terminated", color: "#991B1B", bg: "#FEE2E2", borderColor: "#FCA5A5" },

  // Info / Partial states
  HALF_DAY: { label: "Half Day", color: "#0369A1", bg: "#E0F2FE", borderColor: "#BAE6FD" },
  LATE: { label: "Late", color: "#C2410C", bg: "#FFEDD5", borderColor: "#FED7AA" },
  EARLY_LEAVE: { label: "Early Leave", color: "#C2410C", bg: "#FFEDD5", borderColor: "#FED7AA" },
};

// Fallback configuration for unknown statuses using theme-aware variables
const FALLBACK_CONFIG: StatusConfig = {
  label: "Unknown",
  color: "text.secondary",
  bg: "action.hover",
  borderColor: "divider",
};

export interface StatusChipProps extends Omit<ChipProps, "color"> {
  status?: string;
  label?: string;
  size?: "small" | "medium";
  variant?: "filled" | "outlined";
  sx?: SxProps<Theme>;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status = "",
  label,
  size = "small",
  variant = "filled",
  sx,
  ...rest
}) => {
  const normalizedStatus = (status || "").toUpperCase();
  const config = STATUS_MAP[normalizedStatus] || {
    ...FALLBACK_CONFIG,
    label: status ? status.replace(/_/g, " ") : FALLBACK_CONFIG.label,
  };

  const chipLabel = label ?? config.label;

  return (
    <Chip
      {...rest}
      label={chipLabel}
      size={size}
      variant={variant}
      sx={{
        fontWeight: 600,
        fontSize: size === "small" ? "0.75rem" : "0.875rem",
        color: config.color,
        backgroundColor: variant === "filled" ? config.bg : "transparent",
        borderColor: config.borderColor || config.color,
        textTransform: "capitalize",
        ...sx,
      }}
    />
  );
};

export default StatusChip;
