import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import TextInput from "../../../components/input/TextInput";
import { uploadDocument, getEmployeeDocuments, type EmployeeDocument } from "../../../api/employee.api";

interface OnboardingStep4Props {
  missingDocuments?: string[];
  onSubmitStep: () => Promise<void>;
  onBack: () => void;
  loading: boolean;
  errorMsg?: string | null;
}

const MANDATORY_DOCS = [
  { code: "PAN", label: "PAN Card", description: "Government issued 10-character PAN card", placeholder: "e.g. ABCDE1234F", maxLength: 10 },
  { code: "AADHAAR", label: "Aadhaar Card", description: "Government issued 12-digit UID Aadhaar card", placeholder: "e.g. 123456789012", maxLength: 12 },
];

export default function OnboardingStep4Documents({
  onSubmitStep,
  onBack,
  loading,
  errorMsg,
}: OnboardingStep4Props) {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [docNumbers, setDocNumbers] = useState<Record<string, string>>({
    PAN: "",
    AADHAAR: "",
  });

  const fetchDocs = async () => {
    try {
      const res = await getEmployeeDocuments();
      if (res.succeeded) {
        setDocuments(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileUpload = async (docType: string, file: File) => {
    setUploadingDocType(docType);
    setUploadError(null);
    const num = docNumbers[docType]?.trim() || "";
    try {
      const res = await uploadDocument(file, docType, num);
      if (res.succeeded) {
        await fetchDocs();
      } else {
        setUploadError(res.message || "Failed to upload document");
      }
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || err?.message || "Failed to upload document");
    } finally {
      setUploadingDocType(null);
    }
  };

  const isUploaded = (code: string) => {
    return documents.some(
      (d) => d.documentType?.toUpperCase() === code.toUpperCase()
    );
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", mb: 1 }}>
          4. Mandatory Documents Confirmation
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748B", mb: 3 }}>
          Please enter your document numbers and upload the corresponding files before proceeding.
        </Typography>

        {(errorMsg || uploadError) && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {errorMsg || uploadError}
          </Alert>
        )}

        <Grid container spacing={2}>
          {MANDATORY_DOCS.map((doc) => {
            const uploaded = isUploaded(doc.code);
            const isUploading = uploadingDocType === doc.code;

            return (
              <Grid size={{ xs: 12, sm: 6 }} key={doc.code}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    borderColor: uploaded ? "#A7F3D0" : "#E2E8F0",
                    backgroundColor: uploaded ? "#ECFDF5" : "#FFFFFF",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 180,
                  }}
                >
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0F172A" }}>
                        {doc.label}
                      </Typography>
                      {uploaded ? (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Uploaded"
                          size="small"
                          color="success"
                          sx={{ fontWeight: 700, fontSize: "11px" }}
                        />
                      ) : (
                        <Chip label="Required" size="small" color="error" variant="outlined" sx={{ fontSize: "11px", fontWeight: 700 }} />
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: "#64748B", display: "block", mb: 1.5 }}>
                      {doc.description}
                    </Typography>

                    <TextInput
                      label={`${doc.label} Number`}
                      placeholder={doc.placeholder}
                      maxLength={doc.maxLength}
                      value={docNumbers[doc.code] || ""}
                      onChange={(e) =>
                        setDocNumbers((prev) => ({
                          ...prev,
                          [doc.code]: doc.code === "PAN" ? e.target.value.toUpperCase() : e.target.value,
                        }))
                      }
                    />
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      component="label"
                      variant={uploaded ? "outlined" : "contained"}
                      size="small"
                      disabled={isUploading}
                      startIcon={<CloudUploadIcon />}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: "8px",
                        ...(uploaded
                          ? { borderColor: "#059669", color: "#059669" }
                          : { backgroundColor: "#4F46E5", "&:hover": { backgroundColor: "#4338CA" } }),
                      }}
                    >
                      {isUploading ? "Uploading..." : uploaded ? "Replace File" : "Upload File"}
                      <input
                        type="file"
                        accept="image/png, image/jpeg, application/pdf"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(doc.code, file);
                        }}
                      />
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexDirection: { xs: "column-reverse", sm: "row" } }}>
        <Button
          variant="outlined"
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
          sx={{ px: 3, py: 1.2, borderRadius: "10px", color: "#64748B", borderColor: "#CBD5E1", width: { xs: "100%", sm: "auto" } }}
        >
          Back
        </Button>
        <Button
          onClick={onSubmitStep}
          variant="contained"
          disabled={loading}
          endIcon={<ArrowForwardIcon />}
          sx={{ px: 4, py: 1.2, borderRadius: "10px", backgroundColor: "#4F46E5", "&:hover": { backgroundColor: "#4338CA" }, width: { xs: "100%", sm: "auto" } }}
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </Button>
      </Box>
    </Box>
  );
}
