import Box from "@mui/material/Box";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";

import KpiCardsGrid from "@/components/card/KpiCard";
import { DASHBOARD_MOCK_DATA } from "../mock/dashboard-data";

export function KpiSummaryCards() {
  const kpiItemsWithIcons = DASHBOARD_MOCK_DATA.kpis.map((item) => {
    if (item.id === "total-employees") {
      return {
        ...item,
        icon: <PeopleAltOutlinedIcon sx={{ color: "#3B82F6" }} />,
        iconBg: "rgba(59, 130, 246, 0.15)",
      };
    }
    if (item.id === "new-joiners") {
      return {
        ...item,
        icon: <PersonAddOutlinedIcon sx={{ color: "#A855F7" }} />,
        iconBg: "rgba(168, 85, 247, 0.15)",
      };
    }
    return item;
  });

  return (
    <Box sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}>
      <KpiCardsGrid items={kpiItemsWithIcons} mb={0} />
    </Box>
  );
}

export default KpiSummaryCards;
