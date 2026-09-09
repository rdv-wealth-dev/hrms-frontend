import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";

import TextInput from "../../../components/input/TextInput";
import type { EmergencyContact } from "../../../api/employee.api";

interface EmergencyContactDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (contact: EmergencyContact) => Promise<void>;
  submitting: boolean;
  error: string | null;
}

const EMPTY: EmergencyContact = { name: "", relationship: "", phone: "" };

export default function EmergencyContactDialog({
  open,
  onClose,
  onSave,
  submitting,
  error,
}: EmergencyContactDialogProps) {
  const [form, setForm] = useState<EmergencyContact>(EMPTY);

  // Reset form each time the dialog opens
  useEffect(() => {
    if (open) setForm(EMPTY);
  }, [open]);

  const isValid = form.name.trim() && form.relationship.trim() && form.phone.trim();

  const handleChange = (field: keyof EmergencyContact) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = field === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value;
      setForm((prev) => ({ ...prev, [field]: val }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    await onSave({ name: form.name.trim(), relationship: form.relationship.trim(), phone: form.phone.trim() });
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
            backgroundColor: "rgba(15, 23, 42, 0.4)",
          },
        },
        paper: { sx: { borderRadius: "16px", p: 1 } },
      }}
    >
      <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
          Add Emergency Contact
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "#9CA3AF" }} disabled={submitting}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 2 }}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: "10px" }}>
              {error}
            </Alert>
          )}
          <TextInput
            label="Full Name"
            value={form.name}
            onChange={handleChange("name")}
            required
            disabled={submitting}
            placeholder="e.g. Anita Nair"
          />
          <TextInput
            label="Relationship"
            value={form.relationship}
            onChange={handleChange("relationship")}
            required
            disabled={submitting}
            placeholder="e.g. Mother, Father, Spouse"
          />
          <TextInput
            label="Phone Number"
            type="tel"
            value={form.phone}
            onChange={handleChange("phone")}
            required
            disabled={submitting}
            placeholder="e.g. 9876500001"
            maxLength={10}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={onClose}
            disabled={submitting}
            color="inherit"
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
              backgroundColor: "primary.main",
              "&:hover": { backgroundColor: "primary.dark" },
              px: 3,
            }}
          >
            {submitting ? "Saving..." : "Save Contact"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
