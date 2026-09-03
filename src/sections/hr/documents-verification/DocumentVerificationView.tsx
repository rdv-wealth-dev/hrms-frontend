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
import Avatar from "@mui/material/Avatar";
import { useSnackbar } from "../../../components/snackbar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextInput from "../../../components/input/TextInput";
import { formatDate } from "../../../utils/format-date";
import Tooltip from "@mui/material/Tooltip";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

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
      if (res?.succeeded || (res as any)?.success) {
        setDocuments(Array.isArray(res.data) ? res.data : []);
      } else {
        setError(res?.message || "Failed to fetch pending documents");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load pending documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const getEmployeeName = (doc: EmployeeDocument): string => {
    if (typeof doc.employeeId === "object" && doc.employeeId) {
      return `${doc.employeeId.firstName ?? ""} ${doc.employeeId.lastName ?? ""}`.trim() || "Employee";
    }
    return "Employee";
  };

  const getEmployeeCode = (doc: EmployeeDocument): string => {
    if (typeof doc.employeeId === "object" && doc.employeeId) {
      return doc.employeeId.employeeCode || "—";
    }
    return "—";
  };

  const getEmployeeAvatar = (doc: EmployeeDocument): string | undefined => {
    if (typeof doc.employeeId === "object" && doc.employeeId) {
      return (doc.employeeId as any).avatarUrl || (doc.employeeId as any).profilePicture || undefined;
    }
    return undefined;
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
    <>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary", display: "flex", alignItems: "center", gap: 1 }}>
              <DescriptionOutlinedIcon sx={{ color: "primary.main" }} />
              Document Verification
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Review and verify employee documents
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        <Card sx={{ borderRadius: 4, boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.04)", border: "1px solid", borderColor: "divider", backgroundColor: "background.paper" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={32} sx={{ color: "primary.main" }} />
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
            <TableContainer component={Paper} elevation={0} sx={{ boxShadow: "none", borderRadius: 4, overflowX: "auto" }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: "#64748B", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#64748B", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Document Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#64748B", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase" }}>File Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#64748B", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Uploaded On</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#64748B", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#64748B", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase" }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => {
                    const empName = getEmployeeName(doc);
                    const empCode = getEmployeeCode(doc);
                    const empAvatar = getEmployeeAvatar(doc);
                    const initials = empName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "E";
                    const statusVal = ((doc as any).status || "PENDING").toUpperCase();

                    return (
                      <TableRow key={doc._id} hover sx={{ "&:last-child td": { border: 0 } }}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                              src={empAvatar}
                              sx={{
                                width: 34,
                                height: 34,
                                backgroundColor: "primary.main",
                                color: "primary.contrastText",
                                fontSize: "12px",
                                fontWeight: 700,
                              }}
                            >
                              {initials}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1E293B", lineHeight: 1.2 }}>
                                {empName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#64748B" }}>
                                {empCode}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
                          {doc.documentType}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, color: "#475569" }}>
                          {doc.fileName}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, color: "text.primary", fontWeight: 700, whiteSpace: "nowrap" }}>
                          {formatDate(doc.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusVal === "VERIFIED" ? "Verified" : statusVal === "REJECTED" ? "Rejected" : "Pending"}
                            size="small"
                            sx={{
                              backgroundColor: statusVal === "VERIFIED" ? "#DCFCE7" : statusVal === "REJECTED" ? "#FEE2E2" : "#FEF3C7",
                              color: statusVal === "VERIFIED" ? "#166534" : statusVal === "REJECTED" ? "#991B1B" : "#D97706",
                              fontWeight: 600,
                              fontSize: 11,
                              borderRadius: "12px",
                              height: 24,
                              px: 0.5,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center" }}>
                            <Tooltip title="View Document">
                              <IconButton
                                size="small"
                                onClick={() => handleView(doc)}
                                sx={{
                                  backgroundColor: "action.hover",
                                  color: "primary.main",
                                  width: 28,
                                  height: 28,
                                  "&:hover": { backgroundColor: "divider" },
                                }}
                              >
                                <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                onClick={() => handleApprove(doc)}
                                disabled={actionLoading === doc._id}
                                sx={{
                                  backgroundColor: "#DCFCE7",
                                  color: "#16A34A",
                                  width: 28,
                                  height: 28,
                                  "&:hover": { backgroundColor: "#BBF7D0" },
                                }}
                              >
                                <CheckIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                onClick={() => openRejectDialog(doc)}
                                disabled={actionLoading === doc._id}
                                sx={{
                                  backgroundColor: "#FEE2E2",
                                  color: "#DC2626",
                                  width: 28,
                                  height: 28,
                                  "&:hover": { backgroundColor: "#FECACA" },
                                }}
                              >
                                <CloseIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
            label="Remarks"
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
    </>
  );
}

export default DocumentVerificationView;
