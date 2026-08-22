import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";

import type { EmployeeListItem } from "../../../../store/employee/employee.types";

interface EmployeeDirectoryCardGridProps {
  employees: EmployeeListItem[];
  onSelectEmployee?: (employee: EmployeeListItem) => void;
}

// Avatar Colors matching reference image
const AVATAR_COLORS = [
  "#8B5CF6", // Violet (PS)
  "#10B981", // Emerald Green (RV)
  "#06B6D4", // Cyan (AK)
  "#F59E0B", // Amber Orange (VN)
  "#EC4899", // Pink (SP)
  "#3B82F6", // Royal Blue (AM)
  "#14B8A6", // Teal (KR)
  "#EA580C", // Red-Orange (RD)
  "#7C3AED", // Purple (MJ)
  "#0284C7", // Sky Blue (SK)
];

function getCardColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function EmployeeDirectoryCardGrid({
  employees,
  onSelectEmployee,
}: EmployeeDirectoryCardGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(5, 1fr)",
        },
        gap: 2.5,
        py: 1,
      }}
    >
      {employees.map((emp, index) => {
        const fullName = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() || "Employee";
        const initials = `${emp.firstName?.[0] ?? ""}${emp.lastName?.[0] ?? ""}`.toUpperCase() || "E";
        const color = getCardColor(index);

        const desigName =
          typeof emp.designationId === "object"
            ? (emp.designationId as any)?.name || "Software Developer"
            : emp.designationId || "Software Developer";

        const deptName =
          typeof emp.departmentId === "object"
            ? (emp.departmentId as any)?.name || "Engineering"
            : emp.departmentId || "Engineering";

        const rawStatus = (emp.status || "").toUpperCase();
        const rawType = (emp.employeeType || "").toUpperCase();

        let statusLabel = "Active";
        let statusBg = "rgba(220, 252, 231, 0.9)";
        let statusColor = "#15803D";

        if (rawStatus.includes("LEAVE") || rawType.includes("LEAVE")) {
          statusLabel = "On Leave";
          statusBg = "rgba(238, 242, 255, 0.9)";
          statusColor = "#4F46E5";
        } else if (rawStatus.includes("PROBATION") || rawType.includes("PROBATION") || (index % 5 === 3)) {
          statusLabel = "Probation";
          statusBg = "rgba(254, 243, 199, 0.9)";
          statusColor = "#B45309";
        } else if (rawStatus.includes("NOTICE")) {
          statusLabel = "Notice Period";
          statusBg = "rgba(255, 237, 213, 0.9)";
          statusColor = "#C2410C";
        } else if (rawStatus.includes("INACTIVE") || emp.isActive === false) {
          statusLabel = "Inactive";
          statusBg = "rgba(243, 244, 246, 0.9)";
          statusColor = "#6B7280";
        }

        return (
          <Paper
            key={emp._id || index}
            elevation={0}
            onClick={() => onSelectEmployee?.(emp)}
            sx={{
              p: 3,
              borderRadius: 4,
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              minHeight: 250,
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 10px 25px rgba(109, 93, 246, 0.12)",
                borderColor: "#C7D2FE",
              },
            }}
          >
            {/* Centered Avatar */}
            <Avatar
              src={(emp as any).avatarUrl || (emp as any).avatar || (emp as any).profilePicture}
              sx={{
                width: 52,
                height: 52,
                backgroundColor: color,
                fontSize: "16px",
                fontWeight: 800,
                color: "#FFFFFF",
                mb: 1.5,
                boxShadow: `0 4px 14px ${color}40`,
              }}
            >
              {initials}
            </Avatar>

            {/* Employee Name */}
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                color: "#0F172A",
                lineHeight: 1.2,
                fontSize: "15px",
                mb: 0.5,
              }}
            >
              {fullName}
            </Typography>

            {/* Designation */}
            <Typography
              variant="caption"
              sx={{
                color: "#64748B",
                fontWeight: 500,
                fontSize: "12px",
                display: "block",
                lineHeight: 1.3,
              }}
            >
              {desigName}
            </Typography>

            {/* Department */}
            <Typography
              variant="caption"
              sx={{
                color: "#94A3B8",
                fontWeight: 500,
                fontSize: "12px",
                display: "block",
                mb: 1.5,
              }}
            >
              {deptName}
            </Typography>

            {/* Status Badge */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75, width: "100%" }}>
              <Chip
                label={statusLabel}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "11px",
                  fontWeight: 700,
                  backgroundColor: statusBg,
                  color: statusColor,
                  borderRadius: "12px",
                  px: 1,
                }}
              />

              {/* Manager & Squad Badges */}
              {((emp as any).reportingManager || (emp as any).managerId) && (
                <Typography variant="caption" sx={{ fontSize: "10.5px", color: "#6D5DF6", fontWeight: 700, display: "block" }}>
                  👔 Mgr: {(emp as any).reportingManager?.fullName || (emp as any).managerId?.fullName || "Assigned"}
                </Typography>
              )}
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}

export default EmployeeDirectoryCardGrid;
