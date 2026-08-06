import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import SoftGateLockCard from "../../components/common/SoftGateLockCard";
import { useOnboardingStatus } from "../../hooks/useOnboardingStatus";

export function PayrollPage() {
  const { phase, completionPct, isProfileComplete } = useOnboardingStatus();

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
            Payroll & Payslips
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
            Access salary breakdown, tax forms, and monthly payslip downloads
          </Typography>
        </Box>

        {phase === "RESTRICTED" && !isProfileComplete ? (
          <SoftGateLockCard
            featureTitle="Payslip Downloads Locked"
            message="Your payslips and salary breakdown downloads are currently locked until your onboarding profile is complete."
            completionPct={completionPct}
          />
        ) : (
          <Box sx={{ p: 4, textAlign: "center", backgroundColor: "#FFFFFF", borderRadius: 4, border: "1px solid #E5E7EB" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#374151" }}>
              Payslips & Salary Structure
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mt: 1 }}>
              No published payslips found for the current billing cycle.
            </Typography>
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}

export default PayrollPage;
