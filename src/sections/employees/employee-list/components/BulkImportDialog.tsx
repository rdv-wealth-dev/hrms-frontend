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
import Collapse from "@mui/material/Collapse";

import CloseIcon from "@mui/icons-material/Close";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { bulkImportEmployees, type BulkImportResponse } from "../../../../api/employee.api";

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
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkImportResponse | null>(null);
  const [showHeaders, setShowHeaders] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    if (submitting) return;
    setFile(null);
    setPreviewRows([]);
    setError(null);
    setResult(null);
    setShowHeaders(false);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);
    setResult(null);
    
    // Check file size (10MB Max limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File exceeds the maximum 10MB limit.");
      setFile(null);
      setPreviewRows([]);
      return;
    }

    setFile(selectedFile);

    const isCsv = selectedFile.name.endsWith(".csv");
    if (isCsv) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0).slice(0, 6);
          const parsed = lines.map(line => {
            const rowResult: string[] = [];
            let current = "";
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                rowResult.push(current.trim());
                current = "";
              } else {
                current += char;
              }
            }
            rowResult.push(current.trim());
            return rowResult;
          });
          setPreviewRows(parsed);
        }
      };
      reader.onerror = () => {
        setError("Failed to read file preview.");
      };
      reader.readAsText(selectedFile);
    } else {
      setPreviewRows([]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewRows([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const res = await bulkImportEmployees(file, tenantSlug);
      if (res.succeeded || res.success) {
        setResult(res);
        onSuccess();
      } else {
        setError(res.message || "Failed to process bulk import.");
      }
    } catch (err: any) {
      const serverErr = err?.response?.data;
      if (serverErr && (serverErr.errors || serverErr.message)) {
        setError(serverErr.message || "Spreadsheet validation failed.");
        // If response details carry row-level formatting error arrays, package them as audit errors
        if (Array.isArray(serverErr.errors)) {
          setResult({
            succeeded: false,
            success: false,
            message: serverErr.message || "File processing errors found.",
            errors: serverErr.errors,
            data: {
              totalProcessed: 0,
              insertedCount: 0,
              failedCount: serverErr.errors.length,
              errors: serverErr.errors,
            }
          });
        }
      } else {
        setError(err?.message || "An unexpected network error occurred.");
      }
    } finally {
      setSubmitting(false);
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
      <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
          Bulk Import Employees
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: "#9CA3AF" }} disabled={submitting}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ borderRadius: "10px" }}>
            {error}
          </Alert>
        )}

        {/* 1. Results View (after import submission) */}
        {result && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 2,
                borderRadius: "12px",
                backgroundColor: result.success ? "#ECFDF5" : "#FEF2F2",
                border: result.success ? "1px solid #A7F3D0" : "1px solid #FCA5A5",
              }}
            >
              {result.success ? (
                <CheckCircleOutlinedIcon sx={{ color: "#059669", fontSize: 28 }} />
              ) : (
                <CancelOutlinedIcon sx={{ color: "#DC2626", fontSize: 28 }} />
              )}
              <Box>
                <Typography sx={{ fontWeight: 600, color: result.success ? "#065F46" : "#991B1B" }}>
                  {result.message}
                </Typography>
                {result.data && (
                  <Typography variant="body2" color="text.secondary">
                    Processed: <strong>{result.data.totalProcessed}</strong> • Inserted:{" "}
                    <strong style={{ color: "#059669" }}>{result.data.insertedCount}</strong> • Failed:{" "}
                    <strong style={{ color: "#DC2626" }}>{result.data.failedCount}</strong>
                  </Typography>
                )}
              </Box>
            </Box>

            {result.data?.errors && result.data.errors.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#1F2937" }}>
                  Row Validation Failures List
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 250, border: "1px solid #E5E7EB", borderRadius: "8px", boxShadow: "none" }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB" }}>Row</TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB" }}>Email / Identifiers</TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: "#F9FAFB" }}>Failure Reason</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.data.errors.map((err: any, idx: number) => (
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
          </Box>
        )}

        {/* 2. Upload / Main Interaction View */}
        {!result && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Alert severity="info" sx={{ borderRadius: "10px", fontSize: "13px" }}>
              Upload your employee list. Ensure columns align with existing system values.
            </Alert>

            {/* Drag & Drop Frame */}
            {!file ? (
              <Box
                component="label"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed #6D5DF6",
                  borderRadius: "12px",
                  p: 4,
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: "#F8FAFC",
                  transition: "background-color 0.2s, border-color 0.2s",
                  "&:hover": {
                    backgroundColor: "#F1F5F9",
                    borderColor: "#5B4BE4",
                  },
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <CloudUploadOutlinedIcon sx={{ fontSize: 48, color: "#6D5DF6", mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1F2937" }}>
                  Select or drag your spreadsheet file here
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B", mt: 0.5 }}>
                  Supports CSV, XLSX, or XLS (Max size: 10MB)
                </Typography>
              </Box>
            ) : (
              /* Selected file summary & inline row preview */
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "8px",
                        backgroundColor: file.name.endsWith(".csv") ? "#EFF6FF" : "#ECFDF5",
                        color: file.name.endsWith(".csv") ? "#1E40AF" : "#065F46",
                        fontWeight: 700,
                        fontSize: "12px",
                      }}
                    >
                      {file.name.endsWith(".csv") ? "CSV" : "EXCEL"}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: "#1F2937", fontSize: "14px" }}>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatSize(file.size)}
                      </Typography>
                    </Box>
                  </Box>

                  <IconButton size="small" onClick={handleRemoveFile} sx={{ color: "#EF4444" }}>
                    <CloseIcon />
                  </IconButton>
                </Box>

                {/* CSV Inline preview table (Method 2) */}
                {previewRows.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#1F2937" }}>
                      Sheet Preview (First 5 Rows)
                    </Typography>
                    <TableContainer component={Paper} sx={{ overflowX: "auto", border: "1px solid #E5E7EB", borderRadius: "8px", boxShadow: "none" }}>
                      <Table size="small">
                        <TableHead sx={{ backgroundColor: "#F9FAFB" }}>
                          <TableRow>
                            {previewRows[0]?.map((cell, idx) => (
                              <TableCell key={idx} sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                                {cell || `Col ${idx + 1}`}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {previewRows.slice(1).map((row, rowIdx) => (
                            <TableRow key={rowIdx}>
                              {row.map((cell, cellIdx) => (
                                <TableCell key={cellIdx} sx={{ whiteSpace: "nowrap" }}>
                                  {cell || "—"}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {!file.name.endsWith(".csv") && (
                  <Typography variant="caption" sx={{ color: "#64748B", fontStyle: "italic", alignSelf: "flex-start", ml: 1 }}>
                    Note: Excel files (.xlsx) are fully supported for import. Convert to CSV to see inline data preview grid.
                  </Typography>
                )}
              </Box>
            )}

            {/* Template Schema Help dropdown */}
            <Box
              sx={{
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <Box
                onClick={() => setShowHeaders(!showHeaders)}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1.5,
                  cursor: "pointer",
                  backgroundColor: "#F8FAFC",
                  "&:hover": { backgroundColor: "#F1F5F9" },
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#475569" }}>
                  View Expected Template Schema
                </Typography>
                {showHeaders ? <ExpandLessIcon sx={{ color: "#64748B" }} /> : <ExpandMoreIcon sx={{ color: "#64748B" }} />}
              </Box>
              <Collapse in={showHeaders}>
                <Box sx={{ p: 2, borderTop: "1px solid #E2E8F0" }}>
                  <Typography variant="caption" sx={{ display: "block", fontWeight: 700, mb: 1, color: "#1E293B" }}>
                    Mandatory Header Fields (Case/Space Flexible):
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                    {["First Name", "Last Name", "Email", "Branch", "Department", "Designation", "Joining Date"].map((h) => (
                      <ChipItem key={h} label={h} required />
                    ))}
                  </Box>

                  <Typography variant="caption" sx={{ display: "block", fontWeight: 700, mb: 1, color: "#1E293B" }}>
                    Optional Header Fields:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {["Phone", "Employee Type", "Gender", "Date of Birth", "PAN", "Aadhaar"].map((h) => (
                      <ChipItem key={h} label={h} />
                    ))}
                  </Box>
                </Box>
              </Collapse>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={submitting} color="inherit">
          {result ? "Close" : "Cancel"}
        </Button>
        {!result && (
          <Button
            onClick={handleUploadSubmit}
            disabled={submitting || !file}
            variant="contained"
            sx={{
              backgroundColor: "#6D5DF6",
              "&:hover": { backgroundColor: "#5B4EE4" },
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : "Import Employees"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function ChipItem({ label, required }: { label: string; required?: boolean }) {
  return (
    <Box
      sx={{
        px: 1.2,
        py: 0.5,
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 600,
        backgroundColor: required ? "#FEF2F2" : "#F1F5F9",
        color: required ? "#991B1B" : "#475569",
        border: required ? "1px solid #FCA5A5" : "1px solid #E2E8F0",
      }}
    >
      {label} {required && "*"}
    </Box>
  );
}
