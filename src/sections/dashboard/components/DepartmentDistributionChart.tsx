import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import { DASHBOARD_MOCK_DATA } from "../mock/dashboard-data";

export function DepartmentDistributionChart() {
  const items = DASHBOARD_MOCK_DATA.departmentDistribution;
  const maxCount = Math.max(...items.map((i) => i.count), 1);

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
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", fontSize: "1.05rem" }}>
          Department Distribution
        </Typography>
      </Box>

      {/* Horizontal Bar Items */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
        {items.map((dept) => {
          const barWidthPercent = (dept.count / maxCount) * 100;
          return (
            <Box key={dept.name}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8125rem", color: "#374151" }}>
                  {dept.name}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8125rem", color: "#111827" }}>
                  {dept.count}
                </Typography>
              </Box>

              {/* Progress Bar Container */}
              <Box
                sx={{
                  width: "100%",
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#F3F4F6",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${barWidthPercent}%`,
                    height: "100%",
                    borderRadius: 4,
                    backgroundColor: "#3B82F6",
                    transition: "width 0.4s ease",
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Bottom Link */}
      <Box sx={{ pt: 2, mt: 1, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <Button
          size="small"
          endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: "14px !important" }} />}
          sx={{
            p: 0,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.8rem",
            color: "#6D5DF6",
            "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
          }}
        >
          View Full Report
        </Button>
      </Box>
    </Card>
  );
}

export default DepartmentDistributionChart;
