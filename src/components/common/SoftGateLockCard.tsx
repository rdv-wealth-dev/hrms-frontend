import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";

type SoftGateLockCardProps = {
  featureTitle?: string;
  message?: string;
  completionPct?: number;
};

export function SoftGateLockCard({
  featureTitle = "Feature Locked",
  message = "Complete your profile to unlock leave requests, payslip downloads, and secondary portal features.",
  completionPct = 45,
}: SoftGateLockCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        maxWidth: 540,
        mx: "auto",
        my: 4,
        p: { xs: 3, sm: 4 },
        borderRadius: 4,
        textAlign: "center",
        boxShadow: "0 20px 50px rgba(109, 93, 246, 0.12)",
        border: "1px solid #EEF2FF",
        background: "linear-gradient(180deg, #FFFFFF 0%, #F8F9FF 100%)",
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: "#FEF2F2",
          color: "#EF4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2.5,
          boxShadow: "0 8px 16px rgba(239, 68, 68, 0.15)",
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 32 }} />
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>
        {featureTitle}
      </Typography>

      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, lineHeight: 1.6, px: { sm: 2 } }}>
        {message}
      </Typography>

      <Box sx={{ mb: 3.5, backgroundColor: "background.paper", p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
            Profile Completion Progress
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
            {completionPct}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={completionPct}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "action.hover",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "primary.main",
              borderRadius: 4,
            },
          }}
        />
      </Box>

      <Button
        variant="contained"
        size="large"
        endIcon={<ArrowForwardIcon />}
        onClick={() => navigate("/onboarding")}
        sx={{
          width: "100%",
          py: 1.5,
          borderRadius: 3,
          fontWeight: 700,
          textTransform: "none",
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          boxShadow: "0 10px 20px rgba(109, 93, 246, 0.25)",
          "&:hover": {
            backgroundColor: "primary.dark",
          },
        }}
      >
        Complete Profile Now
      </Button>
    </Card>
  );
}

export default SoftGateLockCard;
