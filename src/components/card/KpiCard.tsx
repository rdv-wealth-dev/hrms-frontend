import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

export interface KpiCardItem {
  id?: string;
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  iconBg?: string; // Background color of the icon container
  trend?: string;  // Optional trend indicator (e.g. "↑ +2 new")
}

interface KpiCardsGridProps {
  items: KpiCardItem[];
  mb?: number;
}

export function KpiCard({ title, value, subtext, icon, iconBg, trend }: KpiCardItem) {
  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: "16px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 120,
        height: "100%",
        boxSizing: "border-box",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
          transform: "translateY(-2px)",
          borderColor: "#CBD5E1",
        },
      }}
    >
      {/* Header Row: Title & Badge Icon */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: "#64748B",
            letterSpacing: "0.6px",
            fontSize: "11px",
            textTransform: "uppercase",
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "10px",
            backgroundColor: iconBg || "rgba(109, 93, 246, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Box>

      {/* Value & Subtext / Trend info */}
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "#0F172A",
            fontSize: "1.75rem",
            lineHeight: 1.1,
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          {trend && (
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: trend.includes("↑") || trend.includes("+") ? "#10B981" : "#EF4444",
                fontSize: "12px",
              }}
            >
              {trend}
            </Typography>
          )}
          {subtext && (
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500, fontSize: "13px" }}>
              {subtext}
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  );
}

export default function KpiCardsGrid({ items, mb = 4 }: KpiCardsGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: `repeat(${Math.min(items.length, 4)}, 1fr)`,
        },
        gap: 2.5,
        mb,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {items.map((item, idx) => (
        <KpiCard key={idx} {...item} />
      ))}
    </Box>
  );
}
