import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";

import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";

import {
  getImportExportHistory,
  type ImportExportHistoryItem,
} from "../../../../api/employee.api";
import { useResponsive } from "../../../../hooks/useResponsive";

interface ImportAuditHistoryDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ImportAuditHistoryDialog({
  open,
  onClose,
}: ImportAuditHistoryDialogProps) {
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<ImportExportHistoryItem[]>([]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getImportExportHistory();
      if (res?.data) {
        setHistoryItems(res.data);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load import and export history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open]);

  const handleDownloadFile = (item: ImportExportHistoryItem) => {
    if (!item?.fileData) return;
    try {
      const byteCharacters = atob(item.fileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: item.mimeType || "application/octet-stream",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = item.fileName || "export.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error("Failed to download file from base64:", e);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HistoryIcon sx={{ color: "primary.main", fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
            Import & Export History
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small" onClick={fetchHistory} disabled={loading}>
            <RefreshIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        ) : historyItems.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 500 }}>
              No import or export activities recorded yet.
            </Typography>
            <Typography variant="caption" sx={{ color: "text.disabled", mt: 0.5 }}>
              Past employee bulk imports and exports will appear here.
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 440,
              border: "1px solid #E2E8F0",
              borderRadius: "10px",
              boxShadow: "none",
            }}
          >
            <Table stickyHeader size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: "#F8FAFC" }}>
                    Date & Time
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: "#F8FAFC" }}>
                    Operation
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: "#F8FAFC" }}>
                    File Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: "#F8FAFC" }}>
                    Records
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: "#F8FAFC" }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyItems.map((item, idx) => {
                  const isImport = item.operationType === "IMPORT";
                  return (
                    <TableRow key={item._id || idx} hover>
                      <TableCell sx={{ fontSize: "13px", color: "text.secondary" }}>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.operationType}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "11px",
                            backgroundColor: isImport ? "#EFF6FF" : "#F5F3FF",
                            color: isImport ? "#1D4ED8" : "#6D28D9",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: "13px" }}>
                        {item.fileName || "—"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "13px" }}>
                        {isImport ? (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <span style={{ color: "#059669", fontWeight: 600 }}>
                              +{item.insertedCount ?? 0}
                            </span>
                            {(item.failedCount ?? 0) > 0 && (
                              <span style={{ color: "#DC2626", fontWeight: 600 }}>
                                -{item.failedCount}
                              </span>
                            )}
                          </Box>
                        ) : (
                          <span>{item.totalRecords ?? "—"}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.fileData ? (
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadFile(item)}
                            title="Download File"
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          <Typography variant="caption" sx={{ color: "text.disabled" }}>
                            —
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: "8px" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
