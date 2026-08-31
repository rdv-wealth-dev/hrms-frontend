import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import CustomAvatar from "@/components/avatar/CustomAvatar";
import StatusChip from "@/components/common/StatusChip";
import { paths } from "@/routes/paths";
import { DASHBOARD_MOCK_DATA } from "../mock/dashboard-data";

export function RecentEmployeesTable() {
  const navigate = useNavigate();
  const employees = DASHBOARD_MOCK_DATA.recentEmployees;

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", fontSize: "1.05rem" }}>
            Recent Employees
          </Typography>
          <Box
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: "12px",
              backgroundColor: "#DCFCE7",
              color: "#166534",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            {employees.length} New
          </Box>
        </Box>

        <Button
          size="small"
          onClick={() => navigate(paths.employees.directory)}
          endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: "14px !important" }} />}
          sx={{
            textTransform: "none",
            color: "#6D5DF6",
            fontWeight: 600,
            fontSize: "0.8rem",
            p: 0,
            "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
          }}
        >
          View Directory
        </Button>
      </Box>

      {/* Clean Interactive List Feed */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, my: 0.5 }}>
        {employees.map((row) => (
          <Box
            key={row.id}
            onClick={() => navigate(paths.employees.directory)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1.5,
              borderRadius: 2.5,
              backgroundColor: "#F9FAFB",
              border: "1px solid rgba(0,0,0,0.03)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#F3F4F6",
                borderColor: "rgba(0,0,0,0.06)",
                transform: "translateY(-1px)",
              },
            }}
          >
            {/* Employee Avatar & Info */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
              <CustomAvatar name={row.name} size={36} fontSize="0.8rem" />
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: "#111827",
                      fontSize: "0.85rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 500 }}>
                    ({row.employeeId})
                  </Typography>
                </Box>

                <Typography variant="caption" sx={{ color: "#4B5563", fontSize: "0.75rem", display: "block" }}>
                  {row.designation} • <span style={{ color: "#6B7280" }}>Joined {row.joinDate}</span>
                </Typography>
              </Box>
            </Box>

            {/* Status Chip */}
            <Box sx={{ flexShrink: 0, ml: 1 }}>
              <StatusChip status={row.status} size="small" />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Footer Link to Employee Directory */}
      <Box sx={{ pt: 2, mt: 1, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
          Manage all team profiles and organization hierarchy in{" "}
          <span
            onClick={() => navigate(paths.employees.directory)}
            style={{ color: "#6D5DF6", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
          >
            Employee Directory
          </span>
        </Typography>
      </Box>
    </Card>
  );
}

export default RecentEmployeesTable;
