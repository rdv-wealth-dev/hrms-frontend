import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";

import { creditCompOff } from "../../../api/leave.api";

interface CreditCompOffDialogProps {
  open: boolean;
  employeeId: string;
  employeeName: string;
  onClose: () => void;
  onSuccess: () => void;
}

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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Credit Comp-Off Balance</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}>
            Employee Name
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 700, color: "#111827" }}>
            {employeeName}
          </Typography>
        </Box>

        <TextField
          label="Work Date"
          type="date"
          value={workDate}
          onChange={(e) => setWorkDate(e.target.value)}
          fullWidth
          size="small"
          required
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          select
          label="Earned Source"
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value as any)}
          fullWidth
          size="small"
          required
        >
          <MenuItem value="PUBLIC_HOLIDAY">Public Holiday</MenuItem>
          <MenuItem value="WEEKEND_WORK">Weekend Work</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={submitting} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !workDate || !sourceType}
          variant="contained"
          sx={{
            backgroundColor: "#6D5DF6",
            "&:hover": { backgroundColor: "#5B4EE4" },
            fontWeight: 600,
            px: 3,
          }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : "Credit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
