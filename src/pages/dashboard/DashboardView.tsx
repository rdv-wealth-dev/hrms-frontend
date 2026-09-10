import { useSelector } from "react-redux";
import Box from "@mui/material/Box";

import DailyPunchCard from "../../sections/attendance/components/DailyPunchCard";
import DashboardLayout from "../../sections/dashboard/DashboardLayout";
import CelebrationsKpiCard from "../../sections/dashboard/components/CelebrationsKpiCard";
import MyTeamsWidget from "../../sections/teams/components/MyTeamsWidget";
import { usePermissions } from "../../hooks/usePermissions";
import type { RootState } from "../../store/rootReducer";

function DashboardView() {
  const { role } = usePermissions();
  const user = useSelector((state: RootState) => state.auth.user);
  const organization = useSelector((state: RootState) => (state as any).organization?.organization);
  const lastLoginAt = user?.lastLoginAt;
  const lastLoginIp = user?.lastLoginIp;
  const lastLoginDevice = user?.lastLoginDevice;

  const companyName = organization?.companyName || user?.firstName || "Welcome";

  return (
    <>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* NEW Reference HR Dashboard Layout */}
        <DashboardLayout
          companyName={companyName}
          lastLoginAt={lastLoginAt}
          lastLoginIp={lastLoginIp}
          lastLoginDevice={lastLoginDevice}
        />

        {/* Daily Punch Card Widget */}
        {role !== "ORG_ADMIN" && (
          <Box sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}>
            <DailyPunchCard />
          </Box>
        )}

        {/* My Assigned Teams & Squads Widget (conditionally rendered only if employee belongs to a team) */}
        <MyTeamsWidget />

        {/* Logged-in Employee My Branch Celebrations & Holidays Widget */}
        <Box sx={{ mb: { xs: 2.5, sm: 3, md: 4 }, width: { xs: "100%", md: "50%" } }}>
          <CelebrationsKpiCard />
        </Box>
      </Box>
    </>
  );
}

export default DashboardView;