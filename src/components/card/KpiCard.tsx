import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

export type KpiCardVariant = "green" | "purple" | "amber" | "rose" | "blue";

export interface KpiCardItem {
  id?: string;
  title: string;
  value: string | number;
  subtext?: string;
  icon?: ReactNode;
  iconBg?: string;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
  progress?: number; // 0-100 percentage for circular progress ring
  progressColor?: string;
  variant?: KpiCardVariant;
  size?: "small" | "medium";
  onClick?: () => void;
}

interface KpiCardsGridProps {
  items: KpiCardItem[];
  mb?: number;
}

const VARIANT_CONFIGS: Record<
  KpiCardVariant,
  {
    bgGradient: string;
    border: string;
    shapeGradStart: string;
    shapeGradEnd: string;
  }
> = {
  green: {
    bgGradient: "linear-gradient(135deg, #FCFDFD 0%, #F5FAF6 100%)",
    border: "1px solid #E5F4E9",
    shapeGradStart: "rgba(16, 185, 129, 0.18)",
    shapeGradEnd: "rgba(52, 211, 153, 0.04)",
  },
  purple: {
    bgGradient: "linear-gradient(135deg, #FDFCFE 0%, #F8F5FD 100%)",
    border: "1px solid #EFE6F8",
    shapeGradStart: "rgba(168, 85, 247, 0.18)",
    shapeGradEnd: "rgba(192, 132, 252, 0.04)",
  },
  amber: {
    bgGradient: "linear-gradient(135deg, #FFFEFD 0%, #FFF9F2 100%)",
    border: "1px solid #F8ECE0",
    shapeGradStart: "rgba(245, 158, 11, 0.20)",
    shapeGradEnd: "rgba(251, 191, 36, 0.04)",
  },
  rose: {
    bgGradient: "linear-gradient(135deg, #FFFCFD 0%, #FFF5F6 100%)",
    border: "1px solid #FCE4E8",
    shapeGradStart: "rgba(244, 63, 94, 0.18)",
    shapeGradEnd: "rgba(251, 113, 133, 0.04)",
  },
  blue: {
    bgGradient: "linear-gradient(135deg, #FCFDFE 0%, #F4F8FD 100%)",
    border: "1px solid #E2EDF8",
    shapeGradStart: "rgba(59, 130, 246, 0.18)",
    shapeGradEnd: "rgba(96, 165, 250, 0.04)",
  },
};

export function KpiCard({
  title,
  value,
  subtext,
  icon,
  iconBg,
  trend,
  trendType,
  progress,
  progressColor = "#10B981",
  variant = "green",
  size = "medium",
  onClick,
}: KpiCardItem) {
  const isSmall = size === "small";
  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.green;
  const gradientId = `kpi-wedge-${variant}-${title.replace(/[^a-zA-Z0-9]/g, "")}`;

  // Infer trend type if not explicitly provided
  const resolvedTrendType =
    trendType ||
    (trend
      ? trend.includes("+") || trend.includes("↑") || trend.includes("↗") || (trend.includes("%") && !trend.includes("-"))
        ? "positive"
        : trend.includes("-") || trend.includes("↓") || trend.includes("↘")
          ? "negative"
          : "neutral"
      : undefined);

  return (
    <Card
      onClick={onClick}
      sx={{
        p: isSmall ? { xs: 2, sm: 2.25 } : { xs: 2.5, sm: 3 },
        borderRadius: isSmall ? "18px" : "20px",
        background: config.bgGradient,
        border: config.border,
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: isSmall ? 125 : 140,
        height: "100%",
        boxSizing: "border-box",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          boxShadow: "0 10px 25px -4px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.03)",
          transform: "translateY(-3px)",
        },
      }}
    >
      {/* Decorative Right Diagonal Rounded Wedge Shape */}
      <Box
        component="svg"
        viewBox="0 0 400 150"
        preserveAspectRatio="none"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={config.shapeGradStart} />
            <stop offset="100%" stopColor={config.shapeGradEnd} />
          </linearGradient>
        </defs>
        <path
          d="M 330,0 L 300,32 C 285,46 285,58 300,72 L 400,102 L 400,0 Z"
          fill={`url(#${gradientId})`}
        />
      </Box>

      {/* Foreground Content Stack */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        {/* 1. Header Row: Title & (Icon Badge or Circular Progress Ring) */}
        <Box sx={{ display: "flex", alignItems: isSmall ? "flex-start" : "center", justifyContent: "space-between", gap: 1, mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "#64748B",
              letterSpacing: "0.5px",
              fontSize: "11px",
              textTransform: "uppercase",
              lineHeight: 1.3,
              flex: 1,
              minWidth: 0,
            }}
          >
            {title}
          </Typography>

          {progress !== undefined ? (
            <Box
              sx={{
                position: "relative",
                display: "inline-flex",
                width: isSmall ? 32 : 40,
                height: isSmall ? 32 : 40,
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                mr: isSmall ? { xs: -1.25, sm: -1.5 } : 0,
                mt: isSmall ? 0.5 : 0,
              }}
            >
              {/* Background Track Ring */}
              <CircularProgress
                variant="determinate"
                value={100}
                size={isSmall ? 32 : 40}
                thickness={4}
                sx={{
                  color: "rgba(0, 0, 0, 0.06)",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              />
              {/* Active Progress Ring */}
              <CircularProgress
                variant="determinate"
                value={Math.min(Math.max(progress, 0), 100)}
                size={isSmall ? 32 : 40}
                thickness={4}
                sx={{
                  color: progressColor,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
                }}
              />
              {/* Centered Percentage Text */}
              <Typography
                sx={{
                  fontSize: isSmall ? "8px" : "10.5px",
                  fontWeight: 700,
                  color: "#0F172A",
                  textAlign: "center",
                  lineHeight: 1,
                  zIndex: 1,
                }}
              >
                {progress}%
              </Typography>
            </Box>
          ) : (
            icon && (
              <Box
                sx={{
                  width: isSmall ? 22 : 26,
                  height: isSmall ? 22 : 26,
                  borderRadius: isSmall ? "6px" : "7px",
                  backgroundColor: iconBg || "rgba(255, 255, 255, 0.85)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  mr: isSmall ? { xs: -1.25, sm: -1.5 } : 0,
                  mt: isSmall ? 0.5 : 0,
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                  "& svg": {
                    fontSize: isSmall ? "12px !important" : "14px !important",
                  },
                }}
              >
                {icon}
              </Box>
            )
          )}
        </Box>

        {/* 2. Middle Row: Large Primary Value */}
        <Box sx={{ my: 0.5 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "#0F172A",
              fontSize: { xs: "1.75rem", sm: "2rem" },
              lineHeight: 1.15,
              letterSpacing: "-0.5px",
            }}
          >
            {value}
          </Typography>
        </Box>

        {/* 3. Footer Row: Subtext (Left) & Trend Pill (Right) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 1.5,
            gap: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#64748B",
              fontWeight: 500,
              fontSize: "12px",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {subtext || ""}
          </Typography>

          {trend && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.4,
                flexShrink: 0,
                ...(resolvedTrendType === "positive" && {
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  color: "#16A34A",
                  px: 0.9,
                  py: 0.25,
                  borderRadius: "12px",
                }),
                ...(resolvedTrendType === "negative" && {
                  backgroundColor: "rgba(239, 68, 68, 0.12)",
                  color: "#EF4444",
                  px: 0.9,
                  py: 0.25,
                  borderRadius: "12px",
                }),
                ...(resolvedTrendType === "neutral" && {
                  color: "#94A3B8",
                  px: 0,
                  py: 0,
                }),
              }}
            >
              {resolvedTrendType === "positive" && (
                <TrendingUpIcon sx={{ fontSize: 13, color: "#16A34A" }} />
              )}
              {resolvedTrendType === "negative" && (
                <TrendingDownIcon sx={{ fontSize: 13, color: "#EF4444" }} />
              )}
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: resolvedTrendType === "neutral" ? "10px" : "11px",
                  letterSpacing: resolvedTrendType === "neutral" ? "0.5px" : "normal",
                  textTransform: resolvedTrendType === "neutral" ? "uppercase" : "none",
                  lineHeight: 1,
                }}
              >
                {trend.replace(/^[↗↑↘↓]/, "").trim()}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
}

const DEFAULT_PALETTE: KpiCardVariant[] = ["green", "purple", "amber", "rose"];

export default function KpiCardsGrid({ items, mb = 3 }: KpiCardsGridProps) {
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
      {items.map((item, idx) => {
        const assignedVariant = item.variant || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
        return <KpiCard key={item.id || idx} variant={assignedVariant} {...item} />;
      })}
    </Box>
  );
}
