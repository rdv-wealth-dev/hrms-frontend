import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
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
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
      slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
        Add Emergency Contact
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Full Name"
            value={form.name}
            onChange={handleChange("name")}
            fullWidth
            required
            disabled={submitting}
            placeholder="e.g. Anita Nair"
          />
          <TextField
            label="Relationship"
            value={form.relationship}
            onChange={handleChange("relationship")}
            fullWidth
            required
            disabled={submitting}
            placeholder="e.g. Mother, Father, Spouse"
          />
          <TextField
            label="Phone Number"
            value={form.phone}
            onChange={handleChange("phone")}
            fullWidth
            required
            disabled={submitting}
            placeholder="e.g. 9876500001"
            slotProps={{ htmlInput: { maxLength: 10 } }}
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
              backgroundColor: "#6D5DF6",
              "&:hover": { backgroundColor: "#5B4CE5" },
            }}
          >
            {submitting ? "Saving..." : "Save Contact"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
