import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import { paths } from "../../routes/paths";
import PermissionGuard from "../../components/auth/PermissionGuard";
import DailyPunchCard from "../../sections/attendance/components/DailyPunchCard";
import OrgSetupGuidanceWidget from "../../sections/dashboard/components/OrgSetupGuidanceWidget";
import CelebrationsKpiCard from "../../sections/dashboard/components/CelebrationsKpiCard";
import { usePermissions } from "../../hooks/usePermissions";
import type { RootState } from "../../store/rootReducer";

function DashboardView() {
  const navigate = useNavigate();
  const { role } = usePermissions();
  const user = useSelector((state: RootState) => state.auth.user);
  const lastLoginAt = user?.lastLoginAt;
  const lastLoginIp = user?.lastLoginIp;
  const lastLoginDevice = user?.lastLoginDevice;

  const lastLoginLabel = useMemo(() => {
    if (!lastLoginAt) return null;
    const date = new Date(lastLoginAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    let dayStr: string;
    if (diffDays === 0) dayStr = "Today";
    else if (diffDays === 1) dayStr = "Yesterday";
    else dayStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const device = lastLoginDevice
      ? lastLoginDevice.includes("Windows")
        ? "Windows"
        : lastLoginDevice.includes("Mac")
          ? "macOS"
          : lastLoginDevice.includes("Linux")
            ? "Linux"
            : "Unknown OS"
      : "";

    const browser = lastLoginDevice
      ? lastLoginDevice.includes("Chrome")
        ? "Chrome"
        : lastLoginDevice.includes("Firefox")
          ? "Firefox"
          : lastLoginDevice.includes("Safari") && !lastLoginDevice.includes("Chrome")
            ? "Safari"
            : ""
      : "";

    const parts = [`Last login: ${dayStr} ${timeStr}`];
    if (browser || device) {
      const via = [browser, device].filter(Boolean).join(", ");
      parts.push(`from ${via}`);
    }
    if (lastLoginIp) parts.push(`(${lastLoginIp})`);
    return parts.join(" ");
  }, [lastLoginAt, lastLoginIp, lastLoginDevice]);

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "#111827",
            fontSize: { xs: "1.25rem", sm: "1.65rem", md: "2.125rem" },
            lineHeight: { xs: 1.3, sm: 1.35, md: 1.4 },
            textAlign: "center",
            wordBreak: "break-word",
            px: { xs: 1, sm: 0 },
            mt: { xs: 3, sm: 0 },
          }}
        >
          Welcome to Dashboard 🎉
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1,
            mb: { xs: 2.5, sm: 3, md: 4 },
            textAlign: "center",
            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
            lineHeight: 1.5,
          }}
        >
          Use the sidebar to navigate to Departments.
        </Typography>

        {lastLoginLabel && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              justifyContent: "center",
              mb: 2.5,
            }}
          >
            <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
              {lastLoginLabel}
            </Typography>
          </Box>
        )}

        {/* Organization Setup Guidance Widget for Org Admin / HR Admin */}
        <OrgSetupGuidanceWidget />

        {/* Daily Punch Card Widget */}
        {role !== "ORG_ADMIN" && (
          <Box sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}>
            <DailyPunchCard />
          </Box>
        )}

        {/* Logged-in Employee My Branch Celebrations & Holidays Widget */}
        <Box sx={{ mb: { xs: 2.5, sm: 3, md: 4 }, width: { xs: "100%", md: "50%" } }}>
          <CelebrationsKpiCard />
        </Box>
        {/* Quick Action Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            gap: { xs: 2, sm: 3 },
          }}
        >
          {/* Card 1: Add Employee */}
          <PermissionGuard permission="employee.create">
            <Box
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 3,
                backgroundColor: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: "rgba(109, 93, 246, 0.1)",
                    color: "#6D5DF6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PersonAddOutlinedIcon />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#111827" }}>
                  Add Employee
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Add a new employee to your organization and send activation email.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate(paths.employees.create)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  backgroundColor: "#6D5DF6",
                  "&:hover": { backgroundColor: "#5B4BEA" },
                  mt: "auto",
                }}
              >
                Create Employee
              </Button>
            </Box>
          </PermissionGuard>

          {/* Card 2: All Employees */}
          <PermissionGuard permission="employee.read">
            <Box
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 3,
                backgroundColor: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: "rgba(109, 93, 246, 0.1)",
                    color: "#6D5DF6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FormatListBulletedOutlinedIcon />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#111827" }}>
                  All Employees
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                View, search, and manage all employee records in your organization.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate(paths.employees.list)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  backgroundColor: "#6D5DF6",
                  "&:hover": { backgroundColor: "#5B4BEA" },
                  mt: "auto",
                }}
              >
                View Employees
              </Button>
            </Box>
          </PermissionGuard>
        </Box>
      </Box>
    </DashboardLayout>
  );
}

export default DashboardView;