import { useState, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";

import CloseIcon from "@mui/icons-material/Close";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  bulkImportEmployees,
  getImportTemplate,
  type BulkImportResponse,
} from "../../../../api/employee.api";
import { useResponsive } from "../../../../hooks/useResponsive";
import { useImportWizard, type RowFilterStatus } from "../../../../hooks/useImportWizard";
import { formatEmployeeEmail } from "../../utils/employeeFormatters";

interface BulkImportDialogProps {
  open: boolean;
  onClose: () => void;
  tenantSlug: string;
  onSuccess: () => void;
}

export default function BulkImportDialog({
  open,
  onClose,
  tenantSlug,
  onSuccess,
}: BulkImportDialogProps) {
  const { isMobile } = useResponsive();
  const [importMode, setImportMode] = useState<"direct" | "wizard">("direct");

  // Direct 1-Click State
  const [directFile, setDirectFile] = useState<File | null>(null);
  const [directSubmitting, setDirectSubmitting] = useState<boolean>(false);
  const [directError, setDirectError] = useState<string | null>(null);
  const [directResult, setDirectResult] = useState<BulkImportResponse | null>(null);
  const [directSendEmail, setDirectSendEmail] = useState<boolean>(false);
  const [copiedPassword, setCopiedPassword] = useState<boolean>(false);
  const [templateLoading, setTemplateLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3-Step Wizard Hook
  const wizard = useImportWizard({
    tenantSlug,
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleClose = () => {
    if (directSubmitting || wizard.committing) return;
    setDirectFile(null);
    setDirectError(null);
    setDirectResult(null);
    setCopiedPassword(false);
    wizard.resetWizard();
    onClose();
  };

  const handleDownloadTemplate = async (format: "xlsx" | "csv") => {
    setTemplateLoading(true);
    setDirectError(null);
    try {
      const res = await getImportTemplate(format);
      if (res?.succeeded && res?.data?.fileData) {
        const { fileName, mimeType, fileData } = res.data;
        const byteCharacters = atob(fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
      } else {
        setDirectError(res?.message || "Failed to download template.");
      }
    } catch (err: any) {
      setDirectError(
        err?.response?.data?.message ||
          err?.message ||
          "An error occurred while fetching template."
      );
    } finally {
      setTemplateLoading(false);
    }
  };

  // Direct import file change
  const handleDirectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) {
      setDirectError("File exceeds the maximum 10MB limit.");
      setDirectFile(null);
      return;
    }
    setDirectError(null);
    setDirectResult(null);
    setDirectFile(selected);
  };

  // Direct 1-Click submit
  const handleDirectSubmit = async () => {
    if (!directFile) return;
    setDirectSubmitting(true);
    setDirectError(null);
    setDirectResult(null);

    try {
      const res = await bulkImportEmployees(
        directFile,
        tenantSlug,
        directSendEmail
      );
      if (res?.succeeded || res?.success) {
        setDirectResult(res);
        onSuccess();
      } else {
        setDirectError(res?.message || "Failed to process bulk import.");
      }
    } catch (err: any) {
      const serverErr = err?.response?.data;
      if (serverErr && (serverErr.errors || serverErr.message)) {
        setDirectError(serverErr.message || "Spreadsheet validation failed.");
        if (Array.isArray(serverErr.errors)) {
          setDirectResult({
            succeeded: false,
            success: false,
            message: serverErr.message || "File processing errors found.",
            errors: serverErr.errors,
            data: {
              totalProcessed: 0,
              insertedCount: 0,
              failedCount: serverErr.errors.length,
              errors: serverErr.errors,
            },
          });
        }
      } else {
        setDirectError(err?.message || "An unexpected network error occurred.");
      }
    } finally {
      setDirectSubmitting(false);
    }
  };

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
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
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
          Bulk Import Employees
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ color: "#9CA3AF" }}
          disabled={directSubmitting || wizard.committing}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      {/* Mode Switcher Tabs */}
      <Box sx={{ px: 3, borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={importMode}
          onChange={(_e, val) => setImportMode(val)}
          textColor="primary"
          indicatorColor="primary"
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab
            value="direct"
            icon={<FlashOnIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="1-Click Fast Import"
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "13px" }}
          />
          <Tab
            value="wizard"
            icon={<AutoFixHighIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="3-Step Guided Wizard"
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "13px" }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 2.5 }}>
        {/* ======================================================== */}
        {/* MODE 1: 1-CLICK DIRECT IMPORT                           */}
        {/* ======================================================== */}
        {importMode === "direct" && (
          <>
            {directError && (
              <Alert severity="error" sx={{ borderRadius: "10px" }}>
                {directError}
              </Alert>
            )}

            {/* Direct Result Banner */}
            {directResult && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 2,
                    borderRadius: "10px",
                    backgroundColor:
                      directResult.succeeded || directResult.success
                        ? "#ECFDF5"
                        : "#FEF2F2",
                    border: "1px solid",
                    borderColor:
                      directResult.succeeded || directResult.success
                        ? "#A7F3D0"
                        : "#FECACA",
                  }}
                >
                  {directResult.succeeded || directResult.success ? (
                    <CheckCircleOutlinedIcon sx={{ color: "#059669", fontSize: 28 }} />
                  ) : (
                    <CancelOutlinedIcon sx={{ color: "#DC2626", fontSize: 28 }} />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color:
                          directResult.succeeded || directResult.success
                            ? "#065F46"
                            : "#991B1B",
                      }}
                    >
                      {directResult.message}
                    </Typography>
                    {directResult.data && (
                      <Typography variant="body2" color="text.secondary">
                        Processed: <strong>{directResult.data.totalProcessed}</strong> • Inserted:{" "}
                        <strong style={{ color: "#059669" }}>
                          {directResult.data.insertedCount}
                        </strong>{" "}
                        • Failed:{" "}
                        <strong style={{ color: "#DC2626" }}>
                          {directResult.data.failedCount}
                        </strong>
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Copyable Default Password Alert for Silent Imports */}
                {directResult?.data?.defaultPassword && (
                  <Alert
                    severity="success"
                    sx={{
                      borderRadius: "10px",
                      backgroundColor: "#F0FDF4",
                      border: "1px solid #86EFAC",
                      "& .MuiAlert-icon": { color: "#16A34A" },
                    }}
                    action={
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<ContentCopyIcon fontSize="small" />}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            directResult?.data?.defaultPassword || "Welcome@2026"
                          );
                          setCopiedPassword(true);
                          setTimeout(() => setCopiedPassword(false), 2500);
                        }}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      >
                        {copiedPassword ? "Copied!" : "Copy Password"}
                      </Button>
                    }
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#166534" }}>
                      Temporary Password for Active Users:{" "}
                      <strong>{directResult.data.defaultPassword}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#15803D", display: "block" }}>
                      Share this temporary password internally. Active users will be forced to change it on their first login.
                    </Typography>
                  </Alert>
                )}

                {/* Errors List */}
                {directResult.data?.errors && directResult.data.errors.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#1F2937" }}>
                      Row Validation Failures ({directResult.data.errors.length})
                    </Typography>
                    <TableContainer
                      component={Paper}
                      sx={{
                        maxHeight: 220,
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        boxShadow: "none",
                      }}
                    >
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB" }}>
                              Row
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB" }}>
                              Identifier
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB" }}>
                              Failure Reason
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {directResult.data.errors.map((err, idx) => (
                            <TableRow key={idx}>
                              <TableCell sx={{ fontWeight: 500 }}>{err.rowNumber}</TableCell>
                              <TableCell>{err.email || "—"}</TableCell>
                              <TableCell sx={{ color: "#DC2626" }}>{err.reason}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* Auto-Creation Summary */}
                {((directResult?.data?.created?.departments &&
                  directResult.data.created.departments.length > 0) ||
                  (directResult?.data?.created?.designations &&
                    directResult.data.created.designations.length > 0)) && (
                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: "10px",
                      backgroundColor: "#F0F9FF",
                      border: "1px solid #BAE6FD",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0369A1" }}>
                      System Masters Automatically Created:
                    </Typography>
                    {directResult?.data?.created?.departments && (
                      <Typography variant="caption" sx={{ display: "block", color: "#0C4A6E" }}>
                        Departments: {directResult.data.created.departments.join(", ")}
                      </Typography>
                    )}
                    {directResult?.data?.created?.designations && (
                      <Typography variant="caption" sx={{ display: "block", color: "#0C4A6E" }}>
                        Designations: {directResult.data.created.designations.join(", ")}
                      </Typography>
                    )}
                  </Alert>
                )}
              </Box>
            )}

            {/* Direct Upload Form */}
            {!directResult && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569" }}>
                    Need a template?
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      onClick={() => handleDownloadTemplate("xlsx")}
                      disabled={templateLoading}
                      variant="outlined"
                      sx={{ textTransform: "none", fontSize: "12px", borderRadius: "6px" }}
                    >
                      {templateLoading ? "Downloading..." : "Download Excel Template"}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleDownloadTemplate("csv")}
                      disabled={templateLoading}
                      variant="outlined"
                      sx={{ textTransform: "none", fontSize: "12px", borderRadius: "6px" }}
                    >
                      Download CSV
                    </Button>
                  </Box>
                </Box>

                {/* Drag and Drop Zone */}
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: "2px dashed",
                    borderColor: directFile ? "primary.main" : "#CBD5E1",
                    borderRadius: "12px",
                    p: 4,
                    textAlign: "center",
                    backgroundColor: directFile ? "#F0F9FF" : "#F8FAFC",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "#F0F9FF",
                    },
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleDirectFileChange}
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    style={{ display: "none" }}
                  />
                  <CloudUploadOutlinedIcon
                    sx={{
                      fontSize: 48,
                      color: directFile ? "primary.main" : "#94A3B8",
                      mb: 1,
                    }}
                  />
                  {directFile ? (
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
                        {directFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatSize(directFile.size)} • Click to replace file
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
                        Click to upload, or drag and drop spreadsheet
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Supports .xlsx, .xls, and .csv (Max size: 10MB)
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Email Notification Option */}
                <Box
                  sx={{
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    p: 2,
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={directSendEmail}
                        onChange={(e) => setDirectSendEmail(e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        Send welcome emails with login credentials
                      </Typography>
                    }
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", display: "block", ml: 3.5, mt: 0.5 }}
                  >
                    Leave unchecked (recommended) to import silently without emailing employees. Active employees can log in with temporary password "Welcome@2026" and will be forced to change it on first login.
                  </Typography>
                </Box>
              </Box>
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* MODE 2: 3-STEP GUIDED WIZARD                            */}
        {/* ======================================================== */}
        {importMode === "wizard" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {wizard.error && (
              <Alert severity="error" sx={{ borderRadius: "10px" }}>
                {wizard.error}
              </Alert>
            )}

            {/* Wizard Step Indicator */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 1,
                py: 1,
                backgroundColor: "#F8FAFC",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: wizard.step === 1 ? 700 : 500,
                  color: wizard.step === 1 ? "primary.main" : "text.secondary",
                }}
              >
                1. Upload & Validate
              </Typography>
              <Typography variant="caption" sx={{ color: "#CBD5E1" }}>
                ➔
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: wizard.step === 2 ? 700 : 500,
                  color: wizard.step === 2 ? "primary.main" : "text.secondary",
                }}
              >
                2. Review Data ({wizard.counts.total})
              </Typography>
              <Typography variant="caption" sx={{ color: "#CBD5E1" }}>
                ➔
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: wizard.step === 3 ? 700 : 500,
                  color: wizard.step === 3 ? "primary.main" : "text.secondary",
                }}
              >
                3. Final Commit
              </Typography>
            </Box>

            {/* WIZARD STEP 1: UPLOAD & VALIDATE */}
            {wizard.step === 1 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: "2px dashed #CBD5E1",
                    borderRadius: "12px",
                    p: 4,
                    textAlign: "center",
                    backgroundColor: wizard.file ? "#F0F9FF" : "#F8FAFC",
                    cursor: "pointer",
                    "&:hover": { borderColor: "primary.main", backgroundColor: "#F0F9FF" },
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) wizard.handleFileSelect(f);
                    }}
                    accept=".csv, .xlsx, .xls"
                    style={{ display: "none" }}
                  />
                  <CloudUploadOutlinedIcon sx={{ fontSize: 44, color: "#94A3B8", mb: 1 }} />
                  {wizard.file ? (
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{wizard.file.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatSize(wizard.file.size)} • Click to choose another
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>
                        Select spreadsheet to validate
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Upload to test header mapping and preview all rows before importing
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Button
                    size="small"
                    onClick={() => handleDownloadTemplate("xlsx")}
                    variant="text"
                    sx={{ textTransform: "none", fontSize: "12px" }}
                  >
                    Download Template (.xlsx)
                  </Button>
                  <Button
                    onClick={wizard.handleValidate}
                    disabled={!wizard.file || wizard.validating}
                    variant="contained"
                    endIcon={
                      wizard.validating ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <ArrowForwardIcon fontSize="small" />
                      )
                    }
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    {wizard.validating ? "Validating Spreadsheet..." : "Validate & Preview"}
                  </Button>
                </Box>
              </Box>
            )}

            {/* WIZARD STEP 2: REVIEW & FILTER PREVIEW GRID */}
            {wizard.step === 2 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {/* Filter Tabs */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                  {(
                    [
                      { id: "all", label: `All (${wizard.counts.total})` },
                      { id: "valid", label: `🟢 Valid (${wizard.counts.valid})` },
                      { id: "warning", label: `🟡 Warnings (${wizard.counts.warning})` },
                      { id: "error", label: `🔴 Errors (${wizard.counts.error})` },
                    ] as const
                  ).map((tab) => (
                    <Chip
                      key={tab.id}
                      label={tab.label}
                      clickable
                      onClick={() => wizard.setStatusFilter(tab.id as RowFilterStatus)}
                      color={wizard.statusFilter === tab.id ? "primary" : "default"}
                      variant={wizard.statusFilter === tab.id ? "filled" : "outlined"}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </Box>

                {/* Preview Table */}
                <TableContainer
                  component={Paper}
                  sx={{
                    maxHeight: 280,
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    boxShadow: "none",
                  }}
                >
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: "#F8FAFC" }}>
                          Row
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: "#F8FAFC" }}>
                          Name
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: "#F8FAFC" }}>
                          Email
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: "#F8FAFC" }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: "#F8FAFC" }}>
                          Details
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {wizard.filteredRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
                            No rows match this filter status.
                          </TableCell>
                        </TableRow>
                      ) : (
                        wizard.filteredRows.map((r, idx) => {
                          const name =
                            r.data?.fullName ||
                            `${r.data?.firstName || ""} ${r.data?.lastName || ""}`.trim() ||
                            "—";
                          const email = formatEmployeeEmail(r.data?.email);
                          const messages =
                            r.messages?.length
                              ? r.messages.join("; ")
                              : r.errors?.length
                              ? r.errors.join("; ")
                              : r.warnings?.length
                              ? r.warnings.join("; ")
                              : "Ready to import";

                          return (
                            <TableRow key={idx} hover>
                              <TableCell sx={{ fontWeight: 500 }}>{r.rowNumber}</TableCell>
                              <TableCell>{name}</TableCell>
                              <TableCell>{email}</TableCell>
                              <TableCell>
                                <Chip
                                  label={r.status.toUpperCase()}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    backgroundColor:
                                      r.status === "valid"
                                        ? "#ECFDF5"
                                        : r.status === "warning"
                                        ? "#FFFBEB"
                                        : "#FEF2F2",
                                    color:
                                      r.status === "valid"
                                        ? "#059669"
                                        : r.status === "warning"
                                        ? "#D97706"
                                        : "#DC2626",
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontSize: "12px", color: "text.secondary" }}>
                                {messages}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                  <Button
                    onClick={() => wizard.setStep(1)}
                    startIcon={<ArrowBackIcon fontSize="small" />}
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: "none" }}
                  >
                    Back to Upload
                  </Button>
                  <Button
                    onClick={() => wizard.setStep(3)}
                    variant="contained"
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    size="small"
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Proceed to Commit ({wizard.counts.valid} Valid)
                  </Button>
                </Box>
              </Box>
            )}

            {/* WIZARD STEP 3: FINAL COMMIT & CONFIRMATION */}
            {wizard.step === 3 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {wizard.commitResult || wizard.directResult ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Alert severity="success" sx={{ borderRadius: "10px" }}>
                      Employees imported successfully!
                    </Alert>

                    {/* Copyable Temporary Password Banner */}
                    {(wizard.commitResult?.data?.defaultPassword ||
                      wizard.directResult?.data?.defaultPassword) && (
                      <Alert
                        severity="success"
                        sx={{
                          borderRadius: "10px",
                          backgroundColor: "#F0FDF4",
                          border: "1px solid #86EFAC",
                          "& .MuiAlert-icon": { color: "#16A34A" },
                        }}
                        action={
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<ContentCopyIcon fontSize="small" />}
                            onClick={() => {
                              const pass =
                                wizard.commitResult?.data?.defaultPassword ||
                                wizard.directResult?.data?.defaultPassword ||
                                "Welcome@2026";
                              navigator.clipboard.writeText(pass);
                              setCopiedPassword(true);
                              setTimeout(() => setCopiedPassword(false), 2500);
                            }}
                            sx={{ textTransform: "none", fontWeight: 600 }}
                          >
                            {copiedPassword ? "Copied!" : "Copy Password"}
                          </Button>
                        }
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#166534" }}>
                          Temporary Password:{" "}
                          <strong>
                            {wizard.commitResult?.data?.defaultPassword ||
                              wizard.directResult?.data?.defaultPassword}
                          </strong>
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#15803D", display: "block" }}>
                          Share this with active employees. They will be forced to change it on their first login.
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: "10px",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Ready to Finalize Import
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
                        You are about to import <strong>{wizard.counts.valid}</strong> valid employee records.
                        {wizard.counts.error > 0 && (
                          <span> (<strong>{wizard.counts.error}</strong> invalid rows will be skipped safely).</span>
                        )}
                      </Typography>

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={wizard.sendWelcomeEmail}
                            onChange={(e) => wizard.setSendWelcomeEmail(e.target.checked)}
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Send welcome emails with login credentials
                          </Typography>
                        }
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", display: "block", ml: 3.5, mt: 0.5 }}
                      >
                        Leave unchecked (recommended) for silent import without sending emails.
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Button
                        onClick={() => wizard.setStep(2)}
                        startIcon={<ArrowBackIcon fontSize="small" />}
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: "none" }}
                      >
                        Back to Review
                      </Button>
                      <Button
                        onClick={wizard.handleCommit}
                        disabled={wizard.committing || wizard.counts.valid === 0}
                        variant="contained"
                        sx={{ textTransform: "none", fontWeight: 600, px: 3 }}
                      >
                        {wizard.committing ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          "Commit & Import Employees"
                        )}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={directSubmitting || wizard.committing} color="inherit">
          {directResult || wizard.commitResult ? "Done" : "Cancel"}
        </Button>
        {importMode === "direct" && !directResult && (
          <Button
            onClick={handleDirectSubmit}
            disabled={directSubmitting || !directFile}
            variant="contained"
            sx={{
              backgroundColor: "primary.main",
              "&:hover": { backgroundColor: "primary.dark" },
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            {directSubmitting ? <CircularProgress size={20} color="inherit" /> : "Import Employees"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
