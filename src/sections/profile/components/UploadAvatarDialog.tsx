import { useState, useEffect, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import type { AvatarCropParams } from "../../../api/employee.api";
import CircularImageCropper, { type CircularImageCropperRef } from "../../../components/common/CircularImageCropper";

const CROP_SIZE = 220;

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
  const cropperRef = useRef<CircularImageCropperRef>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setValidationError(null);
      setZoom(1);
      setIsDragging(false);
    }
  }, [open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input value so same file can be re-selected
    e.target.value = "";
    setValidationError(null);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setValidationError("Invalid file type. Please select an image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setValidationError("File size exceeds 5MB limit. Please select a smaller image.");
      return;
    }

    setSelectedFile(file);
    setZoom(1);
    cropperRef.current?.resetPosition();
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleResetZoom = () => {
    setZoom(1);
    cropperRef.current?.resetPosition();
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!previewUrl) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((z) => Math.min(Math.max(1, Number((z + delta).toFixed(2))), 3));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !previewUrl) {
      setValidationError("Please select an image file to upload.");
      return;
    }

    // Canvas already produces a perfectly cropped 400x400 circle PNG.
    // Do NOT send cropParams — they would cause Sharp.js "bad extract area"
    // errors on the server when applied to an already-cropped canvas output.
    const result = await cropperRef.current?.generateCropResult();
    const finalFile = result?.file || selectedFile;

    await onUpload(finalFile, undefined);
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.15rem", textAlign: "center", pb: 0.5 }}>
        Upload Profile Picture
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, pt: 1 }}>
          {(error || validationError) && (
            <Alert severity="error" sx={{ borderRadius: 2, width: "100%" }}>
              {validationError || error}
            </Alert>
          )}

          {/* Single circular frame — toggles between upload prompt and live cropper */}
          <Box
            component={previewUrl ? "div" : "label"}
            onWheel={previewUrl ? handleWheel : undefined}
            sx={{
              width: CROP_SIZE,
              height: CROP_SIZE,
              borderRadius: "50%",
              border: `2.5px dashed ${previewUrl ? "#6366F1" : "#6366F1"}`,
              backgroundColor: previewUrl ? "#000" : "#F8FAFC",
              overflow: "hidden",
              position: "relative",
              cursor: previewUrl ? (isDragging ? "grabbing" : "grab") : "pointer",
              transition: "background-color 0.2s, transform 0.2s",
              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.1)",
              ...(!previewUrl && {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                p: 2.5,
                "&:hover": { borderColor: "#4F46E5", backgroundColor: "#EEF2FF", transform: "scale(1.02)" },
              }),
            }}
          >
            {/* Hidden file input */}
            {!previewUrl && (
              <>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
                <CloudUploadOutlinedIcon sx={{ fontSize: 44, color: "#6366F1", mb: 1, pointerEvents: "none" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.85rem", lineHeight: 1.3, pointerEvents: "none" }}>
                  Click to select profile picture
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B", mt: 0.8, fontSize: "0.72rem", pointerEvents: "none" }}>
                  PNG, JPG, or WEBP (Max 5MB)
                </Typography>
              </>
            )}

            {/* Live circular image cropper (fills the same circle) */}
            {previewUrl && (
              <CircularImageCropper
                ref={cropperRef}
                imageSrc={previewUrl}
                zoom={zoom}
                isDragging={isDragging}
                onDraggingChange={setIsDragging}
                cropSize={CROP_SIZE}
              />
            )}
          </Box>

          {/* Tip text — only when image loaded */}
          {previewUrl && (
            <Typography variant="caption" sx={{ color: "#94A3B8", mt: -1, fontSize: "0.75rem" }}>
              Drag photo to reposition • Scroll or pinch to zoom
            </Typography>
          )}

          {/* Zoom controls — only when image loaded */}
          {previewUrl && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "85%", maxWidth: 280 }}>
              <IconButton
                size="small"
                onClick={() => setZoom((z) => Math.max(1, Number((z - 0.1).toFixed(2))))}
                disabled={zoom <= 1}
                sx={{ color: "#64748B" }}
              >
                <ZoomOutIcon fontSize="small" />
              </IconButton>

              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                onChange={(_, val) => setZoom(val as number)}
                sx={{
                  color: "#6366F1",
                  height: 5,
                  "& .MuiSlider-thumb": {
                    width: 18, height: 18,
                    backgroundColor: "#fff",
                    border: "2px solid #6366F1",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    "&:hover, &.Mui-focusVisible": { boxShadow: "0 0 0 6px rgba(99,102,241,0.16)" },
                  },
                }}
              />

              <IconButton
                size="small"
                onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
                disabled={zoom >= 3}
                sx={{ color: "#64748B" }}
              >
                <ZoomInIcon fontSize="small" />
              </IconButton>

              <IconButton size="small" title="Reset" onClick={handleResetZoom} sx={{ color: "#94A3B8" }}>
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {/* Change photo link — only when image loaded */}
          {previewUrl && (
            <Button
              component="label"
              size="small"
              variant="text"
              sx={{ textTransform: "none", fontSize: "0.8rem", color: "#6366F1", mt: -1 }}
            >
              Change Photo
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
            </Button>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 0, justifyContent: "space-between" }}>
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
              px: 3,
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
