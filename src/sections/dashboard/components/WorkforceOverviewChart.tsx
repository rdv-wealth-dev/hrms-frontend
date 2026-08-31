import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { DASHBOARD_MOCK_DATA, type WorkforceOverviewPoint } from "../mock/dashboard-data";

type TimeframeOption = "6M" | "12M" | "YTD";

interface Point {
  x: number;
  y: number;
}

// Smooth Bezier Curve generator (Catmull-Rom spline to cubic Bezier conversion)
function getSmoothPath(pts: Point[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

  let path = `M ${pts[0].x} ${pts[0].y}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? i : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return path;
}

export function WorkforceOverviewChart() {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("6M");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = DASHBOARD_MOCK_DATA.workforceOverview[timeframe];
  const { avgHeadcount, netGrowthText, totalExits } = DASHBOARD_MOCK_DATA.workforceOverview;

  // ViewBox bounds: width 560, height 220
  const svgWidth = 560;
  const svgHeight = 220;

  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 40;

  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const maxVal = 1400;
  const minVal = 0;

  const yTicks = [1400, 1200, 1000, 800, 600, 400, 200, 0];

  // Calculate coordinates for all 3 data series
  const headcountPts: Point[] = [];
  const newHiresPts: Point[] = [];
  const exitsPts: Point[] = [];

  data.forEach((d, idx) => {
    const x = paddingLeft + (idx / (data.length - 1)) * plotWidth;
    const yHeadcount = paddingTop + plotHeight - ((d.headcount - minVal) / (maxVal - minVal)) * plotHeight;
    const yNewHires = paddingTop + plotHeight - ((d.newHires - minVal) / (maxVal - minVal)) * plotHeight;
    const yExits = paddingTop + plotHeight - ((d.exits - minVal) / (maxVal - minVal)) * plotHeight;

    headcountPts.push({ x, y: yHeadcount });
    newHiresPts.push({ x, y: yNewHires });
    exitsPts.push({ x, y: yExits });
  });

  const pathHeadcount = getSmoothPath(headcountPts);
  const pathNewHires = getSmoothPath(newHiresPts);
  const pathExits = getSmoothPath(exitsPts);

  const hoveredData = hoveredIndex !== null ? data[hoveredIndex] : null;

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
      {/* Header & Controls */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", fontSize: "1.05rem" }}>
              Workforce Overview
            </Typography>
            <Tooltip title="Tracks total headcount, new hires, and exits over time." arrow>
              <InfoOutlinedIcon sx={{ fontSize: 16, color: "#9CA3AF", cursor: "pointer" }} />
            </Tooltip>
          </Box>

          {/* Legend */}
          <Box sx={{ display: "flex", gap: 2, mt: 0.75 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <Box sx={{ width: 16, height: 2, backgroundColor: "#3B82F6", borderRadius: 1 }} />
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#3B82F6", ml: -1.2 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#4B5563", fontSize: "0.75rem" }}>
                Headcount
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <Box sx={{ width: 16, height: 2, backgroundColor: "#10B981", borderRadius: 1 }} />
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10B981", ml: -1.2 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#4B5563", fontSize: "0.75rem" }}>
                New Hires
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <Box sx={{ width: 16, height: 2, backgroundColor: "#EF4444", borderRadius: 1 }} />
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#EF4444", ml: -1.2 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#4B5563", fontSize: "0.75rem" }}>
                Exits
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Timeframe selector pills */}
        <ButtonGroup size="small" variant="outlined" sx={{ borderRadius: 2 }}>
          {(["6M", "12M", "YTD"] as TimeframeOption[]).map((tf) => (
            <Button
              key={tf}
              onClick={() => {
                setTimeframe(tf);
                setHoveredIndex(null);
              }}
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                px: 1.25,
                py: 0.25,
                textTransform: "none",
                backgroundColor: timeframe === tf ? "#3B82F6" : "transparent",
                color: timeframe === tf ? "#FFFFFF" : "#6B7280",
                borderColor: "rgba(0,0,0,0.12)",
                "&:hover": {
                  backgroundColor: timeframe === tf ? "#2563EB" : "rgba(0,0,0,0.04)",
                },
              }}
            >
              {tf}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* SVG Canvas Plot Area */}
      <Box sx={{ position: "relative", width: "100%", height: 220, my: 0.5 }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          style={{ overflow: "visible" }}
        >
          {/* Dashed Y-Axis Gridlines & Y-Axis Labels */}
          {yTicks.map((val) => {
            const y = paddingTop + plotHeight - ((val - minVal) / (maxVal - minVal)) * plotHeight;
            return (
              <g key={val}>
                <text
                  x={paddingLeft - 10}
                  y={y + 3}
                  textAnchor="end"
                  fill="#9CA3AF"
                  fontSize="11px"
                  fontWeight="500"
                >
                  {val.toLocaleString()}
                </text>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Smooth Curved Spline Paths */}
          <path d={pathHeadcount} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
          <path d={pathNewHires} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
          <path d={pathExits} fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />

          {/* X-Axis Month Labels & Interactive Vertical Hover Guide */}
          {data.map((d: WorkforceOverviewPoint, idx: number) => {
            const x = headcountPts[idx].x;
            const isHovered = hoveredIndex === idx;

            return (
              <g key={d.month}>
                {/* Vertical hover guide line */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + plotHeight}
                    stroke="#94A3B8"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                  />
                )}

                {/* X-Axis Month Text */}
                <text
                  x={x}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  fill={isHovered ? "#111827" : "#6B7280"}
                  fontSize="11px"
                  fontWeight={isHovered ? "700" : "500"}
                >
                  {d.month}
                </text>

                {/* Headcount Dot Marker */}
                <circle
                  cx={x}
                  cy={headcountPts[idx].y}
                  r={isHovered ? "5.5" : "4"}
                  fill="#3B82F6"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  style={{ transition: "all 0.2s ease" }}
                />

                {/* New Hires Dot Marker */}
                <circle
                  cx={x}
                  cy={newHiresPts[idx].y}
                  r={isHovered ? "5.5" : "4"}
                  fill="#10B981"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  style={{ transition: "all 0.2s ease" }}
                />

                {/* Exits Dot Marker */}
                <circle
                  cx={x}
                  cy={exitsPts[idx].y}
                  r={isHovered ? "5.5" : "4"}
                  fill="#EF4444"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  style={{ transition: "all 0.2s ease" }}
                />

                {/* Transparent Interactive Hover Target Zone */}
                <rect
                  x={x - (plotWidth / (data.length - 1)) / 2}
                  y={paddingTop}
                  width={plotWidth / (data.length - 1)}
                  height={plotHeight}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredData && (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              right: 15,
              backgroundColor: "rgba(17, 24, 39, 0.9)",
              color: "#FFFFFF",
              px: 1.5,
              py: 0.75,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, display: "block", color: "#F3F4F6", mb: 0.2 }}>
              {hoveredData.month}
            </Typography>
            <Typography variant="caption" sx={{ display: "block", color: "#60A5FA", fontSize: 11 }}>
              Headcount: <strong>{hoveredData.headcount}</strong>
            </Typography>
            <Typography variant="caption" sx={{ display: "block", color: "#34D399", fontSize: 11 }}>
              New Hires: <strong>{hoveredData.newHires}</strong>
            </Typography>
            <Typography variant="caption" sx={{ display: "block", color: "#F87171", fontSize: 11 }}>
              Exits: <strong>{hoveredData.exits}</strong>
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer Metrics Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pt: 2,
          mt: 2,
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            Avg Headcount
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827" }}>
            {avgHeadcount.toLocaleString()}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            Net Growth (This Month)
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#10B981" }}>
            {netGrowthText}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            Total Exits (This Month)
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#EF4444" }}>
            {totalExits}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

export default WorkforceOverviewChart;
