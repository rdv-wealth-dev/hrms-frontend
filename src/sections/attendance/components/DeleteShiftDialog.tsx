import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

import { deleteShift } from "../../../api/attendance.api";
import type { Shift } from "../../../store/attendance/attendance.types";

interface DeleteShiftDialogProps {
  open: boolean;
  onClose: () => void;
  shift: Shift | null;
  onSuccess: () => Promise<void>;
  showSnackbar?: (
    msg: string,
    variant: "success" | "error" | "info" | "warning"
  ) => void;
}

export const DeleteShiftDialog: React.FC<DeleteShiftDialogProps> = ({
  open,
  onClose,
  shift,
  onSuccess,
  showSnackbar,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!shift?._id) return;

    if (shift?.isDefault) {
      setErrorMsg("Cannot delete the default shift. Set another shift as default first.");
      return;
    }

    setDeleting(true);
    setErrorMsg(null);

    try {
      const response = await deleteShift(shift._id);
      if (response?.succeeded || response?.data) {
        if (showSnackbar) {
          showSnackbar("Shift deleted successfully", "success");
        }
        await onSuccess();
        onClose();
      } else {
        setErrorMsg(response?.message || "Failed to delete shift");
      }
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || "Failed to delete shift"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!deleting) {
          setErrorMsg(null);
          onClose();
        }
      }}
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
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          justify: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DeleteOutlinedIcon sx={{ color: "#DC2626" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
            Delete Shift?
          </Typography>
        </Box>
        <IconButton
          onClick={() => {
            setErrorMsg(null);
            onClose();
          }}
          size="small"
          sx={{ color: "#9CA3AF" }}
          disabled={deleting}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>
            {errorMsg}
          </Alert>
        )}

        <Typography variant="body2" sx={{ color: "#4B5563" }}>
          Are you sure you want to delete the shift{" "}
          <strong>"{shift?.name || "Selected Shift"}"</strong>? This action cannot be
          undone.
        </Typography>

        {shift?.isDefault && !errorMsg && (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: "10px" }}>
            This shift is currently set as the organization default shift. Set another shift as default before deleting.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={() => {
            setErrorMsg(null);
            onClose();
          }}
          disabled={deleting}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={handleDelete}
          disabled={deleting || Boolean(shift?.isDefault)}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            backgroundColor: "#DC2626",
            "&:hover": { backgroundColor: "#B91C1C" },
            px: 3,
          }}
        >
          {deleting ? "Deleting..." : "Delete Shift"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteShiftDialog;
