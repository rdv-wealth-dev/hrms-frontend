import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import { DASHBOARD_MOCK_DATA, type AiInsightItem } from "../mock/dashboard-data";

const CATEGORY_CONFIG: Record<
  AiInsightItem["category"],
  { icon: React.ReactNode; color: string; bg: string }
> = {
  attrition: {
    icon: <ShowChartOutlinedIcon sx={{ fontSize: 20 }} />,
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.1)",
  },
  attendance: {
    icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 20 }} />,
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.1)",
  },
  onboarding: {
    icon: <AccessTimeOutlinedIcon sx={{ fontSize: 20 }} />,
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.1)",
  },
  retention: {
    icon: <TrendingUpOutlinedIcon sx={{ fontSize: 20 }} />,
    color: "#8B5CF6",
    bg: "rgba(139, 92, 246, 0.1)",
  },
};

export function AiWorkforceInsights() {
  return (
    <Box sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeOutlinedIcon sx={{ color: "#6D5DF6", fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", fontSize: "1.1rem" }}>
            AI Workforce Insights
          </Typography>
        </Box>
        <Button
          size="small"
          sx={{ textTransform: "none", color: "#6D5DF6", fontWeight: 600 }}
        >
          View All Insights
        </Button>
      </Box>

      {/* Grid of 4 Insight Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
        }}
      >
        {DASHBOARD_MOCK_DATA.insights.map((item) => {
          const config = CATEGORY_CONFIG[item.category];
          return (
            <Card
              key={item.id}
              sx={{
                p: 2.5,
                borderRadius: 3,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    backgroundColor: config.bg,
                    color: config.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1.5,
                  }}
                >
                  {config.icon}
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827", mb: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem", lineHeight: 1.45 }}>
                  {item.description}
                </Typography>
              </Box>

              <Button
                size="small"
                endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: "14px !important" }} />}
                sx={{
                  mt: 2,
                  p: 0,
                  justifyContent: "flex-start",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  color: "#6D5DF6",
                  "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
                }}
              >
                {item.actionLabel}
              </Button>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}

export default AiWorkforceInsights;
