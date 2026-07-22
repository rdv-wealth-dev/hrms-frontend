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

// Helper to get card properties matching screenshot
function getCardMeta(index: number) {
  const tagsList = [
    ["High Performer"],
    ["Remote"],
    [],
    ["Probation"],
    ["High Performer", "Remote"],
    ["Leadership"],
    [],
    ["Remote"],
    ["Notice Period"],
    [],
  ];

  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const tags = tagsList[index % tagsList.length];

  return { color, tags };
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
        const meta = getCardMeta(index);

        const desigName =
          typeof emp.designationId === "object"
            ? (emp.designationId as any)?.name
            : "Software Engineer";

        const deptName =
          typeof emp.departmentId === "object"
            ? (emp.departmentId as any)?.name
            : "Engineering";

        const isProbation = emp.status === "PROBATION" || (index % 5 === 3);
        const isNotice = index % 5 === 8;

        let statusLabel = "Active";
        let statusBg = "rgba(220, 252, 231, 0.9)";
        let statusColor = "#15803D";

        if (isNotice) {
          statusLabel = "Notice";
          statusBg = "rgba(254, 226, 226, 0.9)";
          statusColor = "#B91C1C";
        } else if (isProbation) {
          statusLabel = "Probation";
          statusBg = "rgba(254, 243, 199, 0.9)";
          statusColor = "#B45309";
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
              sx={{
                width: 52,
                height: 52,
                backgroundColor: meta.color,
                fontSize: "16px",
                fontWeight: 800,
                color: "#FFFFFF",
                mb: 2,
                boxShadow: `0 4px 14px ${meta.color}40`,
              }}
            >
              {initials}
            </Avatar>

            {/* Name */}
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
                mb: 1.8,
              }}
            >
              {deptName}
            </Typography>

            {/* Status Pill Badge */}
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
                mb: meta.tags.length > 0 ? 1 : 0,
              }}
            />

            {/* Bottom Tags */}
            {meta.tags.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: 0.8,
                  mt: 0.5,
                }}
              >
                {meta.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "11px",
                      fontWeight: 600,
                      backgroundColor: "#EEF2FF",
                      color: "#4F46E5",
                      borderRadius: "10px",
                      px: 0.5,
                    }}
                  />
                ))}
              </Box>
            )}
          </Paper>
        );
      })}
    </Box>
  );
}

export default EmployeeDirectoryCardGrid;
