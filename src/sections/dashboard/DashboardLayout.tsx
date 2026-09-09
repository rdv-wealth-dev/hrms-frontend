import Box from "@mui/material/Box";
import OrgSetupGuidanceWidget from "./components/OrgSetupGuidanceWidget";
import DashboardHeader from "./components/DashboardHeader";
import KpiSummaryCards from "./components/KpiSummaryCards";
import AiWorkforceInsights from "./components/AiWorkforceInsights";
import WorkforceOverviewChart from "./components/WorkforceOverviewChart";
import DepartmentDistributionChart from "./components/DepartmentDistributionChart";
import LeaveRequestsTable from "./components/LeaveRequestsTable";
import RecruitmentPipelineFunnel from "./components/RecruitmentPipelineFunnel";
import RecentEmployeesTable from "./components/RecentEmployeesTable";
import UpcomingEventsWidget from "./components/UpcomingEventsWidget";

interface DashboardLayoutProps {
  userName?: string;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  lastLoginDevice?: string | null;
}

export function DashboardLayout({
  userName,
  lastLoginAt,
  lastLoginIp,
  lastLoginDevice,
}: DashboardLayoutProps) {
  return (
    <Box sx={{ width: "100%", boxSizing: "border-box" }}>
      {/* 1. Header & Greeting */}
      <DashboardHeader userName={userName} lastLoginAt={lastLoginAt} lastLoginIp={lastLoginIp} lastLoginDevice={lastLoginDevice} />

      <OrgSetupGuidanceWidget />

      {/* 2. KPI Summary Cards */}
      <KpiSummaryCards />

      {/* 3. AI Workforce Insights (4 Cards) */}
      <AiWorkforceInsights />

      {/* 4. Row 3: Main Charts (Workforce Overview & Department Distribution) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
          },
          gap: { xs: 2.5, sm: 3 },
          mb: { xs: 2.5, sm: 3, md: 4 },
        }}
      >
        <WorkforceOverviewChart />
        <DepartmentDistributionChart />
      </Box>

      {/* 5. Row 4: Data Grids & Funnels (Leave Requests, Recruitment Pipeline, Recent Employees) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "repeat(3, 1fr)",
          },
          gap: { xs: 2.5, sm: 3 },
          mb: { xs: 2.5, sm: 3, md: 4 },
        }}
      >
        <LeaveRequestsTable />
        <RecruitmentPipelineFunnel />
        <RecentEmployeesTable />
      </Box>

      {/* 6. Row 5: Upcoming Events Widget */}
      <Box sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}>
        <UpcomingEventsWidget />
      </Box>
    </Box>
  );
}

export default DashboardLayout;
