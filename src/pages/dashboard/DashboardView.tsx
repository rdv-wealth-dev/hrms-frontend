import { useSelector } from "react-redux";
import Box from "@mui/material/Box";

import DailyPunchCard from "../../sections/attendance/components/DailyPunchCard";
import DashboardLayout from "../../sections/dashboard/DashboardLayout";
import OrgSetupGuidanceWidget from "../../sections/dashboard/components/OrgSetupGuidanceWidget";
import CelebrationsKpiCard from "../../sections/dashboard/components/CelebrationsKpiCard";
import MyTeamsWidget from "../../sections/teams/components/MyTeamsWidget";
import { usePermissions } from "../../hooks/usePermissions";
import type { RootState } from "../../store/rootReducer";

function DashboardView() {
  const { role } = usePermissions();
  const user = useSelector((state: RootState) => state.auth.user);
  const lastLoginAt = user?.lastLoginAt;
  const lastLoginIp = user?.lastLoginIp;
  const lastLoginDevice = user?.lastLoginDevice;

  const userName = user?.firstName || user?.fullName || "Alex";

  return (
    <>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* NEW Reference HR Dashboard Layout */}
        <DashboardLayout
          userName={userName}
          lastLoginAt={lastLoginAt}
          lastLoginIp={lastLoginIp}
          lastLoginDevice={lastLoginDevice}
        />

        {/* Organization Setup Guidance Widget for Org Admin / HR Admin */}
        <OrgSetupGuidanceWidget />

        {/* Daily Punch Card Widget */}
        {role !== "ORG_ADMIN" && (
          <Box sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}>
            <DailyPunchCard />
          </Box>
        )}

        {/* My Assigned Teams & Squads Widget */}
        <Box sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}>
          <MyTeamsWidget />
        </Box>

        {/* Logged-in Employee My Branch Celebrations & Holidays Widget */}
        <Box sx={{ mb: { xs: 2.5, sm: 3, md: 4 }, width: { xs: "100%", md: "50%" } }}>
          <CelebrationsKpiCard />
        </Box>
      </Box>
    </>
  );
}

export default DashboardView;