import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import { useSnackbar } from "../../../components/snackbar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextInput from "../../../components/input/TextInput";
import Tooltip from "@mui/material/Tooltip";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import {
  getPendingDocuments,
  verifyDocument,
  getHrDownloadUrl,
  type EmployeeDocument,
} from "../../../api/employee.api";

export function DocumentVerificationView() {
  const { showSnackbar } = useSnackbar();
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<EmployeeDocument | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState("");

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPendingDocuments();
      if (res.succeeded) {
        setDocuments(res.data);
      } else {
        setError(res.message || "Failed to fetch pending documents");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const getEmployeeName = (doc: EmployeeDocument): string => {
    if (typeof doc.employeeId === "object" && doc.employeeId) {
      return `${doc.employeeId.firstName ?? ""} ${doc.employeeId.lastName ?? ""}`.trim() || "—";
    }
    return "—";
  };

  const getEmployeeId = (doc: EmployeeDocument): string => {
    if (typeof doc.employeeId === "object" && doc.employeeId) {
      return doc.employeeId._id;
    }
    return doc.employeeId as string;
  };

  const handleView = async (doc: EmployeeDocument) => {
    try {
      const res = await getHrDownloadUrl(getEmployeeId(doc), doc._id);
      if (res.succeeded && res.data.downloadUrl) {
        window.open(res.data.downloadUrl, "_blank");
      }
    } catch {
      // silently ignore
    }
  };

  const handleApprove = async (doc: EmployeeDocument) => {
    setActionLoading(doc._id);
    setError(null);
    try {
      const res = await verifyDocument(doc._id, { isVerified: true });
      if (res.succeeded) {
        setDocuments((prev) => prev.filter((d) => d._id !== doc._id));
        showSnackbar("Document approved successfully", "success");
      } else {
        setError(res.message || "Failed to approve document");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectDialog = (doc: EmployeeDocument) => {
    setRejectTarget(doc);
    setRejectRemarks("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget._id);
    setError(null);
    setRejectDialogOpen(false);
    try {
      const res = await verifyDocument(rejectTarget._id, {
        isVerified: false,
        remarks: rejectRemarks.trim() || undefined,
      });
      if (res.succeeded) {
        setDocuments((prev) => prev.filter((d) => d._id !== rejectTarget._id));
        showSnackbar("Document rejected", "success");
      } else {
        setError(res.message || "Failed to reject document");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setActionLoading(null);
      setRejectTarget(null);
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 1 }}>
              <DescriptionOutlinedIcon sx={{ color: "#6D5DF6" }} />
              Document Verification
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
              Review and verify employee documents
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        <Card sx={{ borderRadius: 4, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={32} sx={{ color: "#9CA3AF" }} />
            </Box>
          ) : documents.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <HourglassEmptyOutlinedIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 2 }} />
              <Typography variant="body1" sx={{ color: "#6B7280", fontWeight: 500 }}>
                No pending documents to verify
              </Typography>
              <Typography variant="body2" sx={{ color: "#9CA3AF", mt: 0.5 }}>
                All documents have been reviewed
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: "none", borderRadius: 4 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
                    <TableCell sx={{ fontWeight: 600, color: "#6B7280", fontSize: "0.8rem" }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#6B7280", fontSize: "0.8rem" }}>Document Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#6B7280", fontSize: "0.8rem" }}>File Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#6B7280", fontSize: "0.8rem" }}>Uploaded</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#6B7280", fontSize: "0.8rem" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#6B7280", fontSize: "0.8rem" }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc._id} sx={{ "&:hover": { backgroundColor: "#F9FAFB" } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1F2937" }}>
                          {getEmployeeName(doc)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                          {doc.employeeId && typeof doc.employeeId === "object" ? doc.employeeId.employeeCode ?? "" : ""}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={doc.documentType} size="small" variant="outlined" sx={{ fontSize: "0.75rem", fontWeight: 500 }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#374151", fontFamily: "monospace", fontSize: "0.8rem" }}>
                          {doc.fileName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#6B7280", fontSize: "0.8rem" }}>
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<HourglassEmptyOutlinedIcon sx={{ fontSize: "14px !important" }} />}
                          label="Pending"
                          size="small"
                          sx={{ backgroundColor: "#FEF3C7", color: "#92400E", fontWeight: 600, fontSize: "0.75rem" }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                          <Tooltip title="View document">
                            <IconButton size="small" onClick={() => handleView(doc)} sx={{ color: "#6D5DF6" }}>
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              onClick={() => handleApprove(doc)}
                              disabled={actionLoading === doc._id}
                              sx={{ color: "#059669" }}
                            >
                              <CheckCircleOutlineOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              onClick={() => openRejectDialog(doc)}
                              disabled={actionLoading === doc._id}
                              sx={{ color: "#DC2626" }}
                            >
                              <CancelOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>

      {/* Reject Remarks Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.15rem" }}>
          Reject Document
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#6B7280", mb: 2 }}>
            Are you sure you want to reject this document? You can optionally provide a reason.
          </Typography>
          <TextInput
            label="Remarks (optional)"
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)} sx={{ textTransform: "none", color: "#6B7280" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleReject}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, backgroundColor: "#DC2626", "&:hover": { backgroundColor: "#B91C1C" } }}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default DocumentVerificationView;
