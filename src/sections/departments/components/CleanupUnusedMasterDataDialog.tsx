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
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import {
  cleanupUnusedDepartments,
  type CleanupUnusedMasterDataResponse,
} from "../../../api/department.api";
import { useToast } from "../../../components/toast";

export interface CleanupUnusedMasterDataDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (data?: CleanupUnusedMasterDataResponse["data"]) => void;
}

export default function CleanupUnusedMasterDataDialog({
  open,
  onClose,
  onSuccess,
}: CleanupUnusedMasterDataDialogProps) {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (submitting) return;
    setError(null);
    onClose();
  };

  const handleCleanup = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await cleanupUnusedDepartments();

      if (res?.succeeded) {
        const deptsCleaned = res?.data?.departmentsCleaned ?? 0;
        const desigsCleaned = res?.data?.designationsCleaned ?? 0;
        const activeDepts = res?.data?.activeDepartmentsInUse ?? 0;
        const activeDesigs = res?.data?.activeDesignationsInUse ?? 0;

        showToast(
          res?.message ||
            `Cleanup complete! Removed ${deptsCleaned} department(s) and ${desigsCleaned} designation(s). ${activeDepts} department(s) and ${activeDesigs} designation(s) retained.`,
          "success"
        );

        onSuccess?.(res?.data);
        handleClose();
      } else {
        const failureMsg =
          res?.message || "Failed to complete master data cleanup.";
        setError(failureMsg);
        showToast(failureMsg, "error");
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err?.message ||
        "An unexpected error occurred while cleaning up master data.";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3.5,
            p: { xs: 1, sm: 1.5 },
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
          },
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              backgroundColor: "warning.lighter",
              color: "warning.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DeleteSweepOutlinedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 750, color: "text.primary", lineHeight: 1.2 }}>
              Clean Up Unused Master Data
            </Typography>
            <Typography variant="caption" color="text.secondary">
              1-Click cleanup for empty departments & designations
            </Typography>
          </Box>
        </Box>

        <IconButton
          size="small"
          onClick={handleClose}
          disabled={submitting}
          sx={{ color: "text.secondary" }}
          aria-label="close"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Dialog Body Content */}
      <DialogContent sx={{ py: 1.5 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.primary" sx={{ mb: 2, lineHeight: 1.6 }}>
          This administrative action purges all unassigned departments and designations
          across your organization that currently have <strong>0 assigned employees</strong>.
        </Typography>

        {/* Informational Guidance Box */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2.5,
            backgroundColor: "background.neutral",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}>
            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 18, color: "success.main", mt: 0.2, flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary">
              <strong>Safe & Non-Destructive</strong>: Departments and designations with active employees will <em>not</em> be removed.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}>
            <InfoOutlinedIcon sx={{ fontSize: 18, color: "primary.main", mt: 0.2, flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary">
              <strong>Unclutters UI</strong>: Removes old default seeded records so dropdowns only show what your team actually uses.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* Dialog Action Buttons */}
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: 1.5,
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClose}
          disabled={submitting}
          sx={{
            height: 40,
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "10px",
            borderColor: "divider",
            color: "text.secondary",
            width: { xs: "100%", sm: "auto" },
            "&:hover": { borderColor: "text.secondary" },
          }}
        >
          Cancel
        </Button>

        <Button
          fullWidth
          variant="contained"
          color="warning"
          onClick={handleCleanup}
          disabled={submitting}
          startIcon={
            submitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <DeleteSweepOutlinedIcon />
            )
          }
          sx={{
            height: 40,
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "10px",
            px: 2.5,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {submitting ? "Cleaning Up..." : "Confirm & Clean Up"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
