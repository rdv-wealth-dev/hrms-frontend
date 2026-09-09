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
import { deleteDepartmentsByBranch } from "../../../api/department.api";
import { useToast } from "../../../components/toast";

interface DeleteBranchDepartmentsDialogProps {
  open: boolean;
  branchId: string;
  branchName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteBranchDepartmentsDialog({
  open,
  branchId,
  branchName,
  onClose,
  onSuccess,
}: DeleteBranchDepartmentsDialogProps) {
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
    if (!branchId) return;
    setSubmitting(true);
    setConflictError(null);

    try {
      const res = await deleteDepartmentsByBranch(branchId, force);
      if (res?.success) {
        const deptsCount = res?.data?.deletedDepartmentsCount ?? 0;
        const desigCount = res?.data?.deletedDesignationsCount ?? 0;
        showToast(
          `Successfully deleted ${deptsCount} department(s) and ${desigCount} designation(s).`,
          "success"
        );
        setConflictError(null);
        setSubmitting(false);
        onSuccess();
        onClose();
        return;
      } else {
        setConflictError(res?.message ?? "Failed to delete departments.");
      }
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ??
        err?.message ??
        "An unexpected error occurred while deleting departments.";
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
        {conflictError ? "Employee Conflict Warning" : "Delete Branch Departments"}
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
              Forcing deletion will soft-delete all departments and designations in this branch even with active assigned employees. Are you sure you want to proceed with <strong>Force Delete</strong>?
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            Are you sure you want to delete all departments and associated designations for <strong>{branchName || "this branch"}</strong>? This action cannot be undone.
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
            {submitting ? "Deleting..." : "Force Delete All"}
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
            {submitting ? "Deleting..." : "Delete Departments"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
