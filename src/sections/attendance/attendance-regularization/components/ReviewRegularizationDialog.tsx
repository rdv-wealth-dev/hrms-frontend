import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";

import type { RegularizationRequest } from "../../../../store/attendance/attendance.types";
import { reviewRegularizationRequest } from "../../../../api/attendance.api";
import TextInput from "../../../../components/input/TextInput";

type Props = {
  open: boolean;
  request: RegularizationRequest | null;
  employeeName: string;
  employeeCode: string;
  onClose: () => void;
  onSuccess: () => void;
};

function ReviewRegularizationDialog({
  open,
  request,
  employeeName,
  employeeCode,
  onClose,
  onSuccess,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState("");

  const handleReview = async (status: "APPROVED" | "REJECTED") => {
    if (!request?._id) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await reviewRegularizationRequest(request._id, {
        status,
        reviewComments: reviewComments.trim() || undefined,
      });

      if (response.succeeded) {
        onSuccess();
        handleClose();
      } else {
        setError(response.message || "Failed to submit review");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong while submitting review"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setReviewComments("");
    setError(null);
    onClose();
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    return isNaN(date.getTime())
      ? "—"
      : date.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    return isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString(undefined, {
          dateStyle: "medium",
        });
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="review-regularization-title"
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(15, 23, 42, 0.4)",
          },
        },
        paper: {
          sx: {
            borderRadius: "16px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            p: 0.5,
          },
        },
      }}
    >
      <DialogTitle
        id="review-regularization-title"
        component="div"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pt: 2.5,
          px: 3,
          pb: 1,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: "#111827" }}>
          Review Regularization Request
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          disabled={submitting}
          sx={{ color: "#9CA3AF", "&:hover": { color: "#4B5563", backgroundColor: "#F3F4F6" } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 2, px: 3 }}>
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Request Details */}
        <Box sx={{ backgroundColor: "#F8FAFC", p: 2.5, borderRadius: "12px", border: "1px solid #E2E8F0" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155", mb: 2 }}>
            Employee & Attendance Details
          </Typography>

          <Grid container spacing={2}>
            <Grid size={6}>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>
                Employee
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>
                {employeeName} ({employeeCode})
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>
                Attendance Date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>
                {formatDate(request?.attendanceDate)}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>
                Requested Check In
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#10B981" }}>
                {formatTime(request?.requestedCheckIn)}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>
                Requested Check Out
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#10B981" }}>
                {formatTime(request?.requestedCheckOut)}
              </Typography>
            </Grid>
            <Grid size={12} sx={{ mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>
                Reason for Correction
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569", mt: 0.5, fontStyle: "italic", fontWeight: 500 }}>
                "{request?.reason}"
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Review Input */}
        <Box>
          <TextInput
            label="Reviewer Comments"
            multiline
            rows={3}
            placeholder="Provide comments for approval or rejection..."
            value={reviewComments}
            onChange={(e) => setReviewComments(e.target.value)}
            disabled={submitting}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1.5 }}>
        <Button
          onClick={handleClose}
          disabled={submitting}
          sx={{
            color: "#64748B",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { backgroundColor: "#F1F5F9" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleReview("REJECTED")}
          disabled={submitting}
          variant="outlined"
          color="error"
          sx={{
            borderRadius: 2,
            px: 2.5,
            textTransform: "none",
            fontWeight: 600,
            borderColor: "#FCA5A5",
            "&:hover": { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
          }}
        >
          Reject Request
        </Button>
        <Button
          onClick={() => handleReview("APPROVED")}
          disabled={submitting}
          variant="contained"
          sx={{
            backgroundColor: "#10B981",
            "&:hover": { backgroundColor: "#059669" },
            borderRadius: 2,
            px: 2.5,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2)",
          }}
        >
          {submitting ? <CircularProgress size={18} color="inherit" /> : "Approve Request"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReviewRegularizationDialog;
