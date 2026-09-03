import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import { deleteDepartment } from "../../../api/department.api";
import { useToast } from "../../../components/toast";
import type { Department } from "../../../auth/types";

interface DeleteSingleDepartmentDialogProps {
  open: boolean;
  department: Department | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteSingleDepartmentDialog({
  open,
  department,
  onClose,
  onSuccess,
}: DeleteSingleDepartmentDialogProps) {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const handleClose = () => {
    if (submitting) return;
    setConflictError(null);
    setSubmitting(false);
    onClose();
  };

  const handleDelete = async (force = false) => {
    if (!department?._id) return;
    setSubmitting(true);
    setConflictError(null);

    try {
      const res = await deleteDepartment(department._id, force);
      if (res?.success) {
        const desigCount = res?.data?.deletedDesignationsCount ?? 0;
        showToast(
          `Department "${department.name}" and ${desigCount} associated designation(s) deleted successfully.`,
          "success"
        );
        onSuccess();
        handleClose();
      } else {
        setConflictError(res?.message ?? "Failed to delete department.");
      }
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ??
        err?.message ??
        "An unexpected error occurred while deleting the department.";
      setConflictError(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          color: conflictError ? "error.main" : "text.primary",
          fontWeight: 700,
          fontSize: "1.1rem",
        }}
      >
        {conflictError ? (
          <WarningAmberRoundedIcon color="error" />
        ) : (
          <DeleteForeverOutlinedIcon sx={{ color: "error.main" }} />
        )}
        {conflictError ? "Employee Conflict Warning" : "Delete Department"}
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          borderTop: "1px solid",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 2.5,
        }}
      >
        {conflictError ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {conflictError}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Forcing deletion will soft-delete department <strong>"{department?.name}"</strong> and its associated designations even with active assigned employees. Are you sure you want to proceed with <strong>Force Delete</strong>?
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            Are you sure you want to delete department <strong>"{department?.name}"</strong>? This will also soft-delete all associated designations. This action cannot be undone.
          </Typography>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1.5,
          justifyContent: "flex-end",
          flexDirection: { xs: "column-reverse", sm: "row" },
        }}
      >
        <Button
          onClick={handleClose}
          disabled={submitting}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            color: "text.secondary",
            whiteSpace: "nowrap",
            px: 2.5,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Cancel
        </Button>
        {conflictError ? (
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(true)}
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <DeleteForeverOutlinedIcon />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 600,
              whiteSpace: "nowrap",
              px: 2.5,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {submitting ? "Deleting..." : "Force Delete"}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(false)}
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <DeleteForeverOutlinedIcon />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 600,
              whiteSpace: "nowrap",
              px: 2.5,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {submitting ? "Deleting..." : "Delete Department"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
