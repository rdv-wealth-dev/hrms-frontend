import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";

export interface TrendBarData {
  date: string;       // e.g. "Jun 11"
  fullDate: string;   // e.g. "2025-06-11"
  count: number;      // e.g. 315
}

interface WeeklyTrendBarChartProps {
  data: TrendBarData[];
  maxScale?: number;
  onRegularizeClick?: () => void;
}

export default function WeeklyTrendBarChart({
  data,
  maxScale = 340,
  onRegularizeClick,
}: WeeklyTrendBarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<TrendBarData | null>(null);

  // Fallback to sample trend dates if data array is empty
  const chartItems = data.length > 0 ? data : [
    { date: "Jun 11", fullDate: "2025-06-11", count: 320 },
    { date: "Jun 12", fullDate: "2025-06-12", count: 300 },
    { date: "Jun 13", fullDate: "2025-06-13", count: 330 },
    { date: "Jun 14", fullDate: "2025-06-14", count: 0 },
    { date: "Jun 15", fullDate: "2025-06-15", count: 0 },
    { date: "Jun 16", fullDate: "2025-06-16", count: 325 },
    { date: "Jun 17", fullDate: "2025-06-17", count: 309 },
  ];

  const ticks = [340, 255, 170, 85, 0];

  return (
    <Card
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 3.5,
        backgroundColor: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.04)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justify: "space-between",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", fontSize: "1.05rem" }}>
          Weekly Attendance Trend
        </Typography>
        {onRegularizeClick && (
          <Button
            onClick={onRegularizeClick}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              color: "#6D5DF6",
              p: 0,
              "&:hover": { backgroundColor: "transparent", color: "#5B4BEA" },
            }}
          >
            Regularize Attendance
          </Button>
        )}
      </Box>

      {/* Chart Canvas Area */}
      <Box sx={{ position: "relative", width: "100%", pt: 1, pb: 1, height: 260, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        
        {/* Dotted Gridlines & Y-Axis Scale */}
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 28, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
          {ticks.map((tick) => (
            <Box key={tick} sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <Typography variant="caption" sx={{ color: "#9CA3AF", fontSize: 11, width: 28, fontWeight: 500 }}>
                {tick}
              </Typography>
              <Box
                sx={{
                  flexGrow: 1,
                  borderBottom: "1px stroke #E5E7EB",
                  borderStyle: "dashed",
                  borderColor: "rgba(0,0,0,0.08)",
                  ml: 1,
                }}
              />
            </Box>
          ))}
        </Box>

        {/* Bars Container */}
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: 36,
            right: 10,
            bottom: 30,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
            zIndex: 1,
          }}
        >
          {chartItems.map((item, idx) => {
            const heightPercent = Math.min(100, (item.count / maxScale) * 100);
            const isHovered = hoveredBar?.date === item.date;

            return (
              <Tooltip
                key={idx}
                title={`${item.date}: ${item.count} Present`}
                arrow
                placement="top"
              >
                <Box
                  onMouseEnter={() => setHoveredBar(item)}
                  onMouseLeave={() => setHoveredBar(null)}
                  sx={{
                    width: { xs: 10, sm: 14, md: 16 },
                    height: `${heightPercent}%`,
                    backgroundColor: isHovered ? "#DC2626" : "#EF4444",
                    borderRadius: "4px 4px 0 0",
                    transition: "all 0.25s ease",
                    cursor: "pointer",
                    boxShadow: isHovered ? "0 4px 12px rgba(239, 68, 68, 0.4)" : "none",
                    transform: isHovered ? "scaleY(1.03)" : "none",
                    transformOrigin: "bottom",
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>

        {/* X-Axis Date Labels */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 36,
            right: 10,
            display: "flex",
            justify: "space-around",
          }}
        >
          {chartItems.map((item, idx) => (
            <Typography
              key={idx}
              variant="caption"
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6B7280",
                textAlign: "center",
                width: 40,
              }}
            >
              {item.date}
            </Typography>
          ))}
        </Box>
      </Box>
    </Card>
  );
}
