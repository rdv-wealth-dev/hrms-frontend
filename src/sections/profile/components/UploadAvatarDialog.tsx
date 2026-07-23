import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import type { AvatarCropParams } from "../../../api/employee.api";

interface UploadAvatarDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, cropParams?: AvatarCropParams) => Promise<void>;
  submitting: boolean;
  error: string | null;
}

export default function UploadAvatarDialog({
  open,
  onClose,
  onUpload,
  submitting,
  error,
}: UploadAvatarDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Optional crop inputs
  const [cropX, setCropX] = useState<string>("");
  const [cropY, setCropY] = useState<string>("");
  const [cropWidth, setCropWidth] = useState<string>("");
  const [cropHeight, setCropHeight] = useState<string>("");

  useEffect(() => {
    if (open) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setValidationError(null);
      setCropX("");
      setCropY("");
      setCropWidth("");
      setCropHeight("");
    }
  }, [open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValidationError(null);

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setValidationError("Invalid file type. Please select an image file (PNG, JPG, WEBP).");
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setValidationError("Please select an image file to upload.");
      return;
    }

    const cropParams: AvatarCropParams = {};
    if (cropX !== "") cropParams.cropX = Number(cropX);
    if (cropY !== "") cropParams.cropY = Number(cropY);
    if (cropWidth !== "") cropParams.cropWidth = Number(cropWidth);
    if (cropHeight !== "") cropParams.cropHeight = Number(cropHeight);

    await onUpload(selectedFile, Object.keys(cropParams).length > 0 ? cropParams : undefined);
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.15rem" }}>
        Upload Profile Picture
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {(error || validationError) && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {validationError || error}
            </Alert>
          )}

          {/* Drag & Drop File Selector */}
          <Box
            component="label"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justify: "center",
              p: 3,
              border: "2px dashed #CBD5E1",
              borderRadius: 3,
              backgroundColor: "#F8FAFC",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": { borderColor: "#4F46E5", backgroundColor: "#EEF2FF" },
            }}
          >
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />

            {previewUrl ? (
              <Avatar
                src={previewUrl}
                sx={{ width: 96, height: 96, mb: 1, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
            ) : (
              <CloudUploadOutlinedIcon sx={{ fontSize: 42, color: "#64748B", mb: 1 }} />
            )}

            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0F172A" }}>
              {selectedFile ? selectedFile.name : "Click to select an image"}
            </Typography>

            <Typography variant="caption" sx={{ color: "#64748B", mt: 0.5 }}>
              Supports PNG, JPG, or WEBP (Max 5MB)
            </Typography>
          </Box>

          {/* Optional Crop Parameters */}
          {selectedFile && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 1 }}>
                Crop Settings (Optional)
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                <TextField
                  label="Crop X (px)"
                  size="small"
                  type="number"
                  placeholder="e.g. 50"
                  value={cropX}
                  onChange={(e) => setCropX(e.target.value)}
                />
                <TextField
                  label="Crop Y (px)"
                  size="small"
                  type="number"
                  placeholder="e.g. 50"
                  value={cropY}
                  onChange={(e) => setCropY(e.target.value)}
                />
                <TextField
                  label="Width (px)"
                  size="small"
                  type="number"
                  placeholder="e.g. 200"
                  value={cropWidth}
                  onChange={(e) => setCropWidth(e.target.value)}
                />
                <TextField
                  label="Height (px)"
                  size="small"
                  type="number"
                  placeholder="e.g. 200"
                  value={cropHeight}
                  onChange={(e) => setCropHeight(e.target.value)}
                />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting} sx={{ textTransform: "none", color: "#64748B" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!selectedFile || submitting}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              backgroundColor: "#4F46E5",
              "&:hover": { backgroundColor: "#4338CA" },
            }}
          >
            {submitting ? "Uploading..." : "Upload Picture"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
