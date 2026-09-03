import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Typography from "@mui/material/Typography";
import { createCompanyEvent, type CreateEventRequest } from "../../../api/event.api";

interface CreateEventDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultDate?: string; // ISO date string (YYYY-MM-DD)
}

export default function CreateEventDialog({
  open,
  onClose,
  onSuccess,
  defaultDate,
}: CreateEventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setDate(defaultDate || new Date().toISOString().split("T")[0]);
      setTime("10:00");
      setError(null);
    }
  }, [open, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setSubmitting(true);
    setError(null);

    try {
      // Combine date and time to ISO format (UTC)
      const combinedDateTime = new Date(`${date}T${time}:00`);
      
      const payload: CreateEventRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        date: combinedDateTime.toISOString(),
      };

      const res = await createCompanyEvent(payload);
      if (res.succeeded) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Failed to create calendar event");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = title.trim() && date;

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      disableRestoreFocus
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
        <CalendarMonthIcon sx={{ color: "primary.main" }} />
        <Typography component="span" variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
          Create Calendar Event
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            disabled={submitting}
            placeholder="e.g. Extra Holiday, Meeting"
          />
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            required
            disabled={submitting}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            fullWidth
            required
            disabled={submitting}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            disabled={submitting}
            placeholder="Add some details about the event..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={onClose}
            disabled={submitting}
            sx={{ textTransform: "none", color: "#6B7280" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !isValid}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              backgroundColor: "primary.main",
              "&:hover": { backgroundColor: "primary.dark" },
            }}
          >
            {submitting ? "Creating..." : "Save Event"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
