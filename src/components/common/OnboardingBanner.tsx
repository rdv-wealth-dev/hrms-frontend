import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import { useOnboardingStatus, type OnboardingPhase } from "../../hooks/useOnboardingStatus";

export function OnboardingBanner() {
  const navigate = useNavigate();
  const { phase, completionPct, isProfileComplete, loading } = useOnboardingStatus();

  if (loading || isProfileComplete || phase === "COMPLETE") {
    return null;
  }

  const getPhaseConfig = (p: OnboardingPhase) => {
    switch (p) {
      case "GRACE":
        return {
          bgColor: "#EFF6FF",
          borderColor: "#BFDBFE",
          textColor: "#1E40AF",
          icon: <InfoOutlinedIcon sx={{ color: "#3B82F6", fontSize: 20 }} />,
          message: "Welcome! Your profile is Incomplete. Please complete your onboarding soon.",
          buttonColor: "#2563EB",
          buttonHover: "#1D4ED8",
        };
      case "NUDGE":
        return {
          bgColor: "#FFFBEB",
          borderColor: "#FDE68A",
          textColor: "#92400E",
          icon: <WarningAmberOutlinedIcon sx={{ color: "#F59E0B", fontSize: 20 }} />,
          message: `⚠️ Profile ${completionPct}% complete. Please finish your onboarding by today to maintain full access.`,
          buttonColor: "#D97706",
          buttonHover: "#B45309",
        };
      case "RESTRICTED":
        return {
          bgColor: "#FEF2F2",
          borderColor: "#FECACA",
          textColor: "#991B1B",
          icon: <LockOutlinedIcon sx={{ color: "#EF4444", fontSize: 20 }} />,
          message: `🔴 Profile incomplete (${completionPct}%). Leave requests & payslip downloads are currently locked.`,
          buttonColor: "#DC2626",
          buttonHover: "#B91C1C",
        };
      default:
        return null;
    }
  };

  const config = getPhaseConfig(phase);
  if (!config) return null;

  return (
    <Box
      sx={{
        backgroundColor: config.bgColor,
        borderBottom: `1px solid ${config.borderColor}`,
        px: { xs: 2, sm: 3, md: 4 },
        py: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: { xs: "100%", sm: "auto" } }}>
        {config.icon}
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: config.textColor, fontSize: "0.875rem" }}>
            {config.message}
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        size="small"
        endIcon={<ArrowForwardIcon fontSize="small" />}
        onClick={() => navigate("/onboarding")}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 2,
          backgroundColor: config.buttonColor,
          "&:hover": { backgroundColor: config.buttonHover },
          whiteSpace: "nowrap",
          px: 2,
          py: 0.75,
        }}
      >
        Complete Profile
      </Button>
    </Box>
  );
}

export default OnboardingBanner;
