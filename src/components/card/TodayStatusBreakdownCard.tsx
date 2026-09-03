import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";

export interface StatusBreakdownData {
  onTime: number;
  late: number;
  wfh: number;
  absent: number;
  onLeave: number;
  totalWorkforce?: number;
  dateText?: string;
}

interface TodayStatusBreakdownCardProps {
  data: StatusBreakdownData;
}

export default function TodayStatusBreakdownCard({ data }: TodayStatusBreakdownCardProps) {
  const [showAiInsight, setShowAiInsight] = useState(true);
  const theme = useTheme();

  const total = data.totalWorkforce || (data.onTime + data.late + data.wfh + data.absent + data.onLeave) || 1;

  const items = [
    { label: "On Time", count: data.onTime, color: "#10B981" },
    { label: "Late", count: data.late, color: "#F59E0B" },
    { label: "WFH", count: data.wfh, color: theme.palette.primary.main },
    { label: "Absent", count: data.absent, color: "#EF4444" },
    { label: "On Leave", count: data.onLeave, color: "#8B5CF6" },
  ];

  return (
    <Card
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 3.5,
        backgroundColor: "background.paper",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justify: "space-between",
      }}
    >
      {/* Date Header */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", fontSize: "1rem" }}>
          {data.dateText || "Today – 17 Jun 2025"}
        </Typography>
      </Box>

      {/* Progress Breakdown Items */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
        {items.map((item) => {
          const percent = Math.min(100, Math.round((item.count / total) * 100));
          return (
            <Box key={item.label}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.825rem", fontWeight: 500 }}>
                  {item.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.825rem" }}>
                  {item.count}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={percent}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "action.hover",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: item.color,
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          );
        })}
      </Box>

      {/* Static AI Insight Widget */}
      {showAiInsight && (
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            backgroundColor: "primary.lighter",
            border: "1px solid",
            borderColor: "divider",
            position: "relative",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
              <AutoAwesomeIcon sx={{ color: "primary.main", fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "primary.main", fontSize: "0.825rem" }}>
                AI Insight
              </Typography>
              <Chip label="Coming Soon" size="small" sx={{ height: 16, fontSize: "8px", fontWeight: 700, backgroundColor: "background.paper", color: "primary.main" }} />
            </Box>
            <IconButton size="small" onClick={() => setShowAiInsight(false)} sx={{ p: 0.3, color: "primary.main" }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Typography variant="caption" component="p" sx={{ color: "text.primary", fontSize: "0.78rem", lineHeight: 1.45, mb: 1.5 }}>
            Attendance dip on Fridays averages 8.2% above weekly average. Consider flexible Friday policy.
          </Typography>

          {/* Action Chips */}
          <Box sx={{ display: "flex", gap: 1 }}>
            {["Explain", "Save", "Dismiss"].map((chipLabel) => (
              <Button
                key={chipLabel}
                onClick={chipLabel === "Dismiss" ? () => setShowAiInsight(false) : undefined}
                disabled={chipLabel !== "Dismiss"}
                size="small"
                sx={{
                  borderRadius: 2,
                  px: 1.2,
                  py: 0.3,
                  minWidth: 0,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  textTransform: "none",
                  color: "primary.main",
                  backgroundColor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  "&:hover": { backgroundColor: "action.hover" },
                  "&.Mui-disabled": {
                    backgroundColor: "action.disabledBackground",
                    color: "text.disabled",
                    borderColor: "divider",
                  }
                }}
              >
                {chipLabel}
              </Button>
            ))}
          </Box>
        </Box>
      )}
    </Card>
  );
}
