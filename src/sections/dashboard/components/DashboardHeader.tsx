import { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

interface DashboardHeaderProps {
  userName?: string;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  lastLoginDevice?: string | null;
}

export function DashboardHeader({
  userName = "Alex",
  lastLoginAt,
  lastLoginIp,
  lastLoginDevice,
}: DashboardHeaderProps) {
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
    <Box sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: "text.primary",
          fontSize: { xs: "1.35rem", sm: "1.75rem", md: "2.125rem" },
          lineHeight: 1.3,
        }}
      >
        Good morning, {userName} 👋
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mt: 0.5,
          fontSize: { xs: "0.8125rem", sm: "0.875rem" },
        }}
      >
        Here&apos;s what&apos;s happening with your workforce today.
      </Typography>

      {lastLoginLabel && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 1.5,
          }}
        >
          <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
            {lastLoginLabel}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default DashboardHeader;
