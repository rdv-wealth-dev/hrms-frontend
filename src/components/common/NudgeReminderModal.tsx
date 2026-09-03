import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";

type NudgeReminderModalProps = {
  open: boolean;
  onClose: () => void;
  completionPct?: number;
};

export function NudgeReminderModal({
  open,
  onClose,
  completionPct = 45,
}: NudgeReminderModalProps) {
  const navigate = useNavigate();

  const handleGoToOnboarding = () => {
    onClose();
    navigate("/onboarding");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
    >
      <DialogTitle sx={{ textAlign: "center", pt: 3, pb: 1 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: "#FFFBEB",
            color: "#D97706",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 1.5,
          }}
        >
          <WarningAmberOutlinedIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
          Onboarding Reminder
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center", px: 3, py: 1 }}>
        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
          Your check-in was successfully recorded! However, your profile is currently{" "}
          <strong>{completionPct}% complete</strong>. Please complete your onboarding steps soon to avoid feature locks.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, flexDirection: "column", gap: 1 }}>
        <Button
          variant="contained"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          onClick={handleGoToOnboarding}
          sx={{
            py: 1.2,
            borderRadius: 2.5,
            fontWeight: 700,
            textTransform: "none",
            backgroundColor: "primary.main",
            "&:hover": { backgroundColor: "primary.dark" },
          }}
        >
          Complete Profile Now
        </Button>
        <Button
          fullWidth
          onClick={onClose}
          sx={{ textTransform: "none", color: "text.secondary", fontWeight: 500 }}
        >
          Remind Me Later
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NudgeReminderModal;
