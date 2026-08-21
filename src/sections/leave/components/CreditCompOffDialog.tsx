import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Chip from "@mui/material/Chip";

import { creditCompOff } from "../../../api/leave.api";

interface CreditCompOffDialogProps {
  open: boolean;
  employeeId: string;
  employeeName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const inputFieldSx = {
  "& .MuiOutlinedInput-root": {
    height: 44,
    borderRadius: "12px",
    backgroundColor: "#F8FAFC",
    fontSize: "14px",
    color: "#0F172A",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused": {
      backgroundColor: "#FFFFFF",
      "& fieldset": { borderColor: "#6D5DF6", borderWidth: "2px" },
    },
  },
  "& .MuiOutlinedInput-input": {
    height: 44,
    py: 0,
    px: "14px",
    fontSize: "14px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#475569",
    opacity: 1,
    fontSize: "13.5px",
    fontWeight: 500,
  },
  "& .MuiSelect-select": {
    height: "44px !important",
    minHeight: "44px !important",
    py: "0 !important",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
  },
};

export default function CreditCompOffDialog({
  open,
  employeeId,
  employeeName,
  onClose,
  onSuccess,
}: CreditCompOffDialogProps) {
  const [workDate, setWorkDate] = useState("");
  const [sourceType, setSourceType] = useState<"PUBLIC_HOLIDAY" | "WEEKEND_WORK">("PUBLIC_HOLIDAY");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setWorkDate("");
      setSourceType("PUBLIC_HOLIDAY");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!workDate || !sourceType) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await creditCompOff({
        employeeId,
        workDate,
        sourceType,
      });

      if (response.succeeded) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || "Failed to credit comp-off");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to credit comp-off");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(15, 23, 42, 0.45)",
          },
        },
        paper: {
          sx: {
            borderRadius: "20px",
            p: 3,
            backgroundColor: "#FFFFFF",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid #E2E8F0",
          },
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          p: 0,
          mb: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#0F172A" }}>
          Credit Comp-Off Balance
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          disabled={submitting}
          sx={{
            color: "#64748B",
            borderRadius: "10px",
            "&:hover": { backgroundColor: "#F1F5F9", color: "#0F172A" },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, pr: 2, mr: -1, display: "flex", flexDirection: "column", gap: 2 }}>
        {error && <Alert severity="error" sx={{ borderRadius: "10px" }}>{error}</Alert>}

        <Box sx={{ p: 2, borderRadius: "12px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
          <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px", mb: 0.5 }}>
            Employee Profile
          </Typography>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
            {employeeName}
          </Typography>
        </Box>

        {/* Work Date */}
        <Box>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", mb: 0.8 }}>
            Work Date
          </Typography>
          <TextField
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            fullWidth
            size="small"
            required
            disabled={submitting}
            sx={inputFieldSx}
          />
        </Box>

        {/* Earned Source Format Pills */}
        <Box>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", mb: 1 }}>
            Earned Source
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label="Public Holiday"
              onClick={() => setSourceType("PUBLIC_HOLIDAY")}
              clickable
              disabled={submitting}
              sx={{
                height: 38,
                borderRadius: "10px",
                px: 1.5,
                fontSize: "13px",
                fontWeight: sourceType === "PUBLIC_HOLIDAY" ? 600 : 500,
                backgroundColor: sourceType === "PUBLIC_HOLIDAY" ? "#EEF2FF" : "#FFFFFF",
                color: sourceType === "PUBLIC_HOLIDAY" ? "#6D5DF6" : "#475569",
                border: sourceType === "PUBLIC_HOLIDAY" ? "1.5px solid #6D5DF6" : "1px solid #CBD5E1",
                boxShadow: sourceType === "PUBLIC_HOLIDAY" ? "0 2px 6px rgba(109, 93, 246, 0.15)" : "none",
                transition: "all 0.15s ease",
                "&:hover": {
                  backgroundColor: sourceType === "PUBLIC_HOLIDAY" ? "#E0E7FF" : "#F8FAFC",
                  borderColor: sourceType === "PUBLIC_HOLIDAY" ? "#6D5DF6" : "#94A3B8",
                },
              }}
            />
            <Chip
              label="Weekend Work"
              onClick={() => setSourceType("WEEKEND_WORK")}
              clickable
              disabled={submitting}
              sx={{
                height: 38,
                borderRadius: "10px",
                px: 1.5,
                fontSize: "13px",
                fontWeight: sourceType === "WEEKEND_WORK" ? 600 : 500,
                backgroundColor: sourceType === "WEEKEND_WORK" ? "#EEF2FF" : "#FFFFFF",
                color: sourceType === "WEEKEND_WORK" ? "#6D5DF6" : "#475569",
                border: sourceType === "WEEKEND_WORK" ? "1.5px solid #6D5DF6" : "1px solid #CBD5E1",
                boxShadow: sourceType === "WEEKEND_WORK" ? "0 2px 6px rgba(109, 93, 246, 0.15)" : "none",
                transition: "all 0.15s ease",
                "&:hover": {
                  backgroundColor: sourceType === "WEEKEND_WORK" ? "#E0E7FF" : "#F8FAFC",
                  borderColor: sourceType === "WEEKEND_WORK" ? "#6D5DF6" : "#94A3B8",
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 0, mt: 3, display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{
            height: 44,
            borderRadius: "12px",
            px: 2.5,
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "none",
            backgroundColor: "#F1F5F9",
            color: "#475569",
            "&:hover": { backgroundColor: "#E2E8F0", color: "#0F172A" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !workDate || !sourceType}
          variant="contained"
          sx={{
            height: 44,
            borderRadius: "12px",
            px: 3,
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "none",
            backgroundColor: "#6D5DF6",
            boxShadow: "0 4px 12px rgba(109, 93, 246, 0.25)",
            "&:hover": { backgroundColor: "#5B4EB3" },
          }}
        >
          {submitting ? <CircularProgress size={18} color="inherit" /> : "Credit Comp-Off"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
