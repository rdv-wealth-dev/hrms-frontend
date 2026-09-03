import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
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
  maxScale,
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

  // Dynamically compute scale maximum from actual data
  const maxCount = Math.max(...chartItems.map((d) => d.count), 0);
  const effectiveMax = maxScale ?? (maxCount <= 5 ? 5 : maxCount <= 10 ? 10 : maxCount <= 50 ? 50 : maxCount <= 100 ? 100 : Math.ceil(maxCount / 50) * 50);

  const ticks = [
    effectiveMax,
    Math.round(effectiveMax * 0.75),
    Math.round(effectiveMax * 0.5),
    Math.round(effectiveMax * 0.25),
    0,
  ];

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
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", fontSize: "1.05rem" }}>
          Weekly Attendance Trend
        </Typography>
      </Box>

      {/* Chart Canvas Area */}
      <Box sx={{ position: "relative", width: "100%", pt: 1, pb: 1, height: 260, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        
        {/* Dotted Gridlines & Y-Axis Scale */}
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 28, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
          {ticks.map((tick, index) => (
            <Box key={`${tick}-${index}`} sx={{ display: "flex", alignItems: "center", width: "100%" }}>
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

        {/* Combined Bars and Date Labels Columns Container */}
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: 36,
            right: 10,
            bottom: 0,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "flex-end",
            zIndex: 1,
          }}
        >
          {chartItems.map((item, idx) => {
            const heightPercent = item.count > 0 ? Math.max(8, Math.min(100, (item.count / effectiveMax) * 100)) : 0;
            const isHovered = hoveredBar?.date === item.date;

            return (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                  justifyContent: "flex-end",
                  width: { xs: 32, sm: 44 },
                }}
              >
                {/* Bar */}
                <Tooltip
                  title={`${item.date}: ${
                    item.count === 0
                      ? new Date(item.fullDate).getDay() === 0
                        ? "0 Present (Sunday - Week Off)"
                        : new Date(item.fullDate).getDay() === 6
                        ? "0 Present (Saturday - Week Off)"
                        : "0 Present"
                      : `${item.count} Present`
                  }`}
                  arrow
                  placement="top"
                >

                  <Box
                    onMouseEnter={() => setHoveredBar(item)}
                    onMouseLeave={() => setHoveredBar(null)}
                    sx={{
                      width: { xs: 12, sm: 16, md: 18 },
                      height: `${heightPercent}%`,
                      minHeight: item.count > 0 ? "10px" : "0px",
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

                {/* Date Label under Bar */}
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: isHovered ? "text.primary" : "text.secondary",
                    textAlign: "center",
                    mt: 1,
                    height: 20,
                    lineHeight: "20px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.date}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Card>
  );
}
