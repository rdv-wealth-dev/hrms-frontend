import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";

interface PeopleHubKpiCardsProps {
  totalEmployees?: number;
  newJoinersCount?: number;
  probationCount?: number;
  upcomingBirthdaysCount?: number;
}

export function PeopleHubKpiCards({
  totalEmployees = 332,
  newJoinersCount = 8,
  probationCount = 14,
  upcomingBirthdaysCount = 5,
}: PeopleHubKpiCardsProps) {
  const cards = [
    {
      title: "TOTAL EMPLOYEES",
      value: totalEmployees,
      subtitle: "As of today",
      icon: <PeopleOutlinedIcon sx={{ fontSize: 20 }} />,
      iconBg: "rgba(109, 93, 246, 0.1)",
      iconColor: "#6D5DF6",
    },
    {
      title: "NEW JOINERS",
      value: newJoinersCount,
      subtitle: "This month",
      trend: "↑ +2 vs last month",
      icon: <PersonAddOutlinedIcon sx={{ fontSize: 20 }} />,
      iconBg: "rgba(16, 185, 129, 0.1)",
      iconColor: "#10B981",
    },
    {
      title: "ON PROBATION",
      value: probationCount,
      subtitle: "Confirmation due soon",
      icon: <AccessTimeIcon sx={{ fontSize: 20 }} />,
      iconBg: "rgba(245, 158, 11, 0.1)",
      iconColor: "#F59E0B",
    },
    {
      title: "UPCOMING BIRTHDAYS",
      value: upcomingBirthdaysCount,
      subtitle: "In next 7 days",
      icon: <CakeOutlinedIcon sx={{ fontSize: 20 }} />,
      iconBg: "rgba(168, 85, 247, 0.1)",
      iconColor: "#A855F7",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        },
        gap: 2.5,
        mb: 3,
      }}
    >
      {cards.map((card) => (
        <Paper
          key={card.title}
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 120,
            transition: "all 0.2s ease",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              transform: "translateY(-2px)",
            },
          }}
        >
          {/* Header Row: Title & Badge Icon */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "#6B7280",
                letterSpacing: "0.5px",
                fontSize: "11px",
              }}
            >
              {card.title}
            </Typography>

            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: card.iconBg,
                color: card.iconColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {card.icon}
            </Box>
          </Box>

          {/* Metric Value & Subtitle */}
          <Box sx={{ mt: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#111827",
                fontSize: "1.85rem",
                lineHeight: 1.1,
              }}
            >
              {card.value}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: "#6B7280", fontSize: "12px" }}>
                {card.subtitle}
              </Typography>
              {card.trend && (
                <Typography
                  variant="caption"
                  sx={{ color: "#10B981", fontWeight: 700, fontSize: "12px" }}
                >
                  {card.trend}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

export default PeopleHubKpiCards;
