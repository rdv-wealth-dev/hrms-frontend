import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { DASHBOARD_MOCK_DATA } from "../mock/dashboard-data";

export function RecruitmentPipelineFunnel() {
  const { stages, metrics } = DASHBOARD_MOCK_DATA.recruitmentPipeline;
  const maxCount = stages[0]?.count || 1;

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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", fontSize: "1.05rem" }}>
          Recruitment Pipeline
        </Typography>
        <Button size="small" sx={{ textTransform: "none", color: "#6D5DF6", fontWeight: 600 }}>
          View All Jobs ({metrics.totalOpenJobs})
        </Button>
      </Box>

      {/* Funnel Stage Horizontal Bars */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, my: 1 }}>
        {stages.map((stg, idx) => {
          const widthPct = Math.max(25, (stg.count / maxCount) * 100);
          const bgColors = ["#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"];
          return (
            <Box key={stg.id} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography variant="caption" sx={{ width: 68, fontWeight: 600, color: "#4B5563", fontSize: "0.75rem" }}>
                {stg.stage}
              </Typography>

              <Box sx={{ flexGrow: 1, position: "relative", height: 26, display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: `${widthPct}%`,
                    height: "100%",
                    borderRadius: 1.5,
                    backgroundColor: bgColors[idx % bgColors.length],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 1.25,
                    transition: "width 0.3s ease",
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#FFFFFF", fontSize: "0.75rem" }}>
                    {stg.count}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "rgba(255,255,255,0.85)", fontSize: "0.7rem" }}>
                    {stg.conversionPct}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Metrics Row */}
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
            Time to Hire
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827" }}>
              {metrics.timeToHire}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", color: "#10B981" }}>
              <TrendingUpIcon sx={{ fontSize: 13 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 10 }}>
                {metrics.timeToHireTrend}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            Time to Fill
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827" }}>
              {metrics.timeToFill}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", color: "#10B981" }}>
              <TrendingUpIcon sx={{ fontSize: 13 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 10 }}>
                {metrics.timeToFillTrend}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            Offer Acceptance
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827" }}>
              {metrics.offerAcceptance}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", color: "#10B981" }}>
              <TrendingUpIcon sx={{ fontSize: 13 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 10 }}>
                {metrics.offerAcceptanceTrend}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

export default RecruitmentPipelineFunnel;
