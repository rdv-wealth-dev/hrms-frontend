import { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import TextInput from "../../../components/input/TextInput";

import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";

import { uploadDocument, getDownloadUrl, type EmployeeDocument } from "../../../api/employee.api";

interface DocumentsTabProps {
  documents: EmployeeDocument[];
  missingDocTypes: string[];
  documentsLoading: boolean;
  isViewingOther: boolean;
  onRefreshProfileData: () => Promise<void>;
  showSnackbar: (msg: string, variant: "success" | "error" | "info" | "warning") => void;
}

const DOCUMENT_TYPES = [
  { value: "PAN", label: "PAN Card" },
  { value: "AADHAAR", label: "Aadhaar Card" },
  { value: "PASSPORT", label: "Passport" },
  { value: "DRIVING_LICENSE", label: "Driving License" },
  { value: "OFFER_LETTER", label: "Offer Letter" },
  { value: "RESUME", label: "Resume" },
  { value: "DEGREE", label: "Degree" },
  { value: "EXPERIENCE", label: "Experience Letter" },
  { value: "OTHER", label: "Other" },
];

const ALLOWED_FILE_TYPES = [".jpg", ".jpeg", ".pdf"];

export default function DocumentsTab({
  documents,
  missingDocTypes,
  documentsLoading,
  isViewingOther,
  onRefreshProfileData,
  showSnackbar,
}: DocumentsTabProps) {
  const [docUploadDialogOpen, setDocUploadDialogOpen] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const [docUploadError, setDocUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState("PAN");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetDocUploadForm = () => {
    setSelectedFile(null);
    setSelectedDocType("PAN");
    setDocUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDocDownload = async (docId: string) => {
    try {
      const res = await getDownloadUrl(docId);
      if (res.succeeded && res.data?.downloadUrl) {
        window.open(res.data.downloadUrl, "_blank");
      }
    } catch {
      // silently ignore
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_FILE_TYPES.includes(ext)) {
        setDocUploadError("Only JPG, JPEG, and PDF files are allowed.");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }
    setSelectedFile(file);
    setDocUploadError(null);
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) return;

    setDocUploading(true);
    setDocUploadError(null);

    try {
      const res = await uploadDocument(selectedFile, selectedDocType);

      if (!res.succeeded) {
        setDocUploadError(res.message || "Failed to upload document");
        setDocUploading(false);
        return;
      }

      showSnackbar("Document uploaded — awaiting HR verification", "success");
      setDocUploadDialogOpen(false);
      resetDocUploadForm();
      await onRefreshProfileData();
    } catch (err: unknown) {
      setDocUploadError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDocUploading(false);
    }
  };

  return (
    <Box>
      <Card sx={{ p: 3.5 }}>
        {!isViewingOther && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<CloudUploadOutlinedIcon />}
              onClick={() => {
                resetDocUploadForm();
                setDocUploadDialogOpen(true);
              }}
              sx={{ backgroundColor: "#4F46E5" }}
            >
              Upload Document
            </Button>
          </Box>
        )}
        {(missingDocTypes || []).length > 0 && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            Missing required verification documents: <strong>{(missingDocTypes || []).join(", ")}</strong>
          </Alert>
        )}
        {documentsLoading ? (
          <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress size={28} sx={{ color: "#4F46E5" }} /></Box>
        ) : documents.length === 0 ? (
          <Typography variant="body2" sx={{ color: "#64748B", textAlign: "center", py: 3 }}>No documents uploaded yet.</Typography>
        ) : (
          <Grid container spacing={2}>
            {documents.map((doc, index) => (
              <Grid key={doc.id || doc._id || index} size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, borderRadius: 2, border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>{doc.fileName}</Typography>
                    <Chip label={doc.documentType} size="small" variant="outlined" sx={{ mt: 0.5, fontSize: "0.7rem" }} />
                  </Box>
                  <Button size="small" onClick={() => handleDocDownload(doc.id || doc._id)} sx={{ color: "#4F46E5" }}>
                    <DownloadOutlinedIcon fontSize="small" />
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Card>

      {/* Upload Document Dialog */}
      <Dialog
        open={docUploadDialogOpen}
        onClose={() => { if (!docUploading) setDocUploadDialogOpen(false); }}
        maxWidth="sm"
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
            Upload Document
          </Typography>
          <IconButton onClick={() => setDocUploadDialogOpen(false)} size="small" sx={{ color: "#9CA3AF" }} disabled={docUploading}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 2 }}>
          {docUploadError && <Alert severity="error" sx={{ borderRadius: "10px" }}>{docUploadError}</Alert>}
          <TextInput
            select
            label="Document Type"
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
            disabled={docUploading}
          >
            {DOCUMENT_TYPES.map((dt) => (
              <MenuItem key={dt.value} value={dt.value}>{dt.label}</MenuItem>
            ))}
          </TextInput>
          
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
              Select File *
            </Typography>
            <Button
              variant="outlined"
              component="label"
              disabled={docUploading}
              sx={{
                borderColor: "#D1D5DB",
                color: "#374151",
                justifyContent: "flex-start",
                py: 1.25,
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "14px",
                "&:hover": { borderColor: "#9CA3AF" },
              }}
            >
              {selectedFile ? selectedFile.name : "Choose File"}
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".jpg,.jpeg,.pdf"
                onChange={handleFileSelect}
              />
            </Button>
            <Typography variant="caption" sx={{ color: "#9CA3AF", ml: 0.5, mt: 0.5 }}>
              Accepted file formats: .pdf, .jpg, .jpeg
            </Typography>
          </Box>

          {docUploading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "#6B7280" }}>
              <CircularProgress size={16} sx={{ color: "#6D5DF6" }} />
              <Typography variant="caption">Uploading to server...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setDocUploadDialogOpen(false)}
            disabled={docUploading}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleUploadDocument}
            disabled={docUploading || !selectedFile}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "#6D5DF6",
              "&:hover": { backgroundColor: "#5B4CE5" },
              px: 3,
            }}
          >
            {docUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
