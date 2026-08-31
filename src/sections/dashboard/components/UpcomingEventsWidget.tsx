import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import FestivalOutlinedIcon from "@mui/icons-material/FestivalOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

import { DASHBOARD_MOCK_DATA, type UpcomingEventItem } from "../mock/dashboard-data";

const EVENT_ICON_CONFIG: Record<
  UpcomingEventItem["type"],
  { icon: React.ReactNode; color: string; bg: string }
> = {
  birthday: {
    icon: <CakeOutlinedIcon sx={{ fontSize: 18 }} />,
    color: "#EC4899",
    bg: "rgba(236, 72, 153, 0.1)",
  },
  anniversary: {
    icon: <WorkspacePremiumOutlinedIcon sx={{ fontSize: 18 }} />,
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.1)",
  },
  holiday: {
    icon: <FestivalOutlinedIcon sx={{ fontSize: 18 }} />,
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.1)",
  },
  interview: {
    icon: <BusinessCenterOutlinedIcon sx={{ fontSize: 18 }} />,
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.1)",
  },
  event: {
    icon: <GroupsOutlinedIcon sx={{ fontSize: 18 }} />,
    color: "#8B5CF6",
    bg: "rgba(139, 92, 246, 0.1)",
  },
};

export function UpcomingEventsWidget() {
  const events = DASHBOARD_MOCK_DATA.upcomingEvents;

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
          Upcoming Events
        </Typography>
      </Box>

      {/* Events List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {events.map((evt) => {
          const config = EVENT_ICON_CONFIG[evt.type];
          return (
            <Box
              key={evt.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.25,
                borderRadius: 2.5,
                backgroundColor: "#F9FAFB",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#F3F4F6",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    backgroundColor: config.bg,
                    color: config.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {config.icon}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827", fontSize: "0.8125rem" }}>
                    {evt.personName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                    {evt.title}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="caption" sx={{ fontWeight: 700, color: "#4B5563", fontSize: "0.75rem" }}>
                {evt.date}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}

export default UpcomingEventsWidget;
