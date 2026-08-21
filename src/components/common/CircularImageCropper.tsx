import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import Box from "@mui/material/Box";
import type { AvatarCropParams } from "../../api/employee.api";

interface CircularImageCropperProps {
  imageSrc: string;
  zoom: number;
  isDragging: boolean;
  onDraggingChange: (v: boolean) => void;
  cropSize?: number;
}

export interface CropResult {
  file: File;
  params: AvatarCropParams;
}

export interface CircularImageCropperRef {
  generateCropResult: () => Promise<CropResult | null>;
  resetPosition: () => void;
}

/**
 * Renders the image viewport only — no border, no backdrop, no controls.
 * Mount inside a parent container that provides the circle shape & border.
 */
const CircularImageCropper = forwardRef<CircularImageCropperRef, CircularImageCropperProps>(
  ({ imageSrc, zoom, isDragging, onDraggingChange, cropSize = 220 }, ref) => {
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [pinchDist, setPinchDist] = useState<number | null>(null);
    const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    useEffect(() => {
      if (!imageSrc) return;
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setOffset({ x: 0, y: 0 });
      };
    }, [imageSrc]);

    const generateCropResult = useCallback(async (): Promise<CropResult | null> => {
      if (!imageSrc || !imgDimensions.width || !imgDimensions.height) return null;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
      await new Promise((resolve) => { if (img.complete) resolve(true); else img.onload = () => resolve(true); });

      const canvas = document.createElement("canvas");
      const outputSize = 400;
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.clip();

      const scaleFactor = outputSize / cropSize;
      const aspect = imgDimensions.width / imgDimensions.height;
      let renderW = cropSize;
      let renderH = cropSize;
      if (aspect > 1) { renderH = cropSize; renderW = cropSize * aspect; }
      else { renderW = cropSize; renderH = cropSize / aspect; }

      const scaledW = renderW * zoom;
      const scaledH = renderH * zoom;
      const drawX = (cropSize - scaledW) / 2 + offset.x;
      const drawY = (cropSize - scaledH) / 2 + offset.y;

      ctx.drawImage(img, drawX * scaleFactor, drawY * scaleFactor, scaledW * scaleFactor, scaledH * scaleFactor);

      const cropXRatio = Math.max(0, -drawX / scaledW);
      const cropYRatio = Math.max(0, -drawY / scaledH);
      const cropWRatio = cropSize / scaledW;
      const cropHRatio = cropSize / scaledH;

      const params: AvatarCropParams = {
        cropX: Math.round(cropXRatio * imgDimensions.width),
        cropY: Math.round(cropYRatio * imgDimensions.height),
        cropWidth: Math.round(cropWRatio * imgDimensions.width),
        cropHeight: Math.round(cropHRatio * imgDimensions.height),
      };

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(null); return; }
          resolve({ file: new File([blob], "avatar.png", { type: "image/png" }), params });
        }, "image/png");
      });
    }, [imageSrc, imgDimensions, zoom, offset, cropSize]);

    const resetPosition = useCallback(() => { setOffset({ x: 0, y: 0 }); }, []);

    useImperativeHandle(ref, () => ({ generateCropResult, resetPosition }), [generateCropResult, resetPosition]);

    // --- Mouse handlers ---
    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      onDraggingChange(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };
    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };
    const handleMouseUp = () => onDraggingChange(false);

    // --- Touch handlers ---
    const getTouchDist = (t1: React.Touch, t2: React.Touch) => {
      const dx = t1.clientX - t2.clientX; const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };
    const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        onDraggingChange(true);
        setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
      } else if (e.touches.length === 2) {
        onDraggingChange(false);
        setPinchDist(getTouchDist(e.touches[0], e.touches[1]));
      }
    };
    const handleTouchMove = (e: React.TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        setOffset({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
      } else if (e.touches.length === 2 && pinchDist !== null) {
        const cur = getTouchDist(e.touches[0], e.touches[1]);
        // pinch zoom handled by parent via onZoomChange — emit via a synthetic callback if needed
        setPinchDist(cur);
      }
    };
    const handleTouchEnd = () => { onDraggingChange(false); setPinchDist(null); };

    return (
      <Box
        sx={{ width: "100%", height: "100%", position: "relative", cursor: isDragging ? "grabbing" : "grab", userSelect: "none", touchAction: "none" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {imageSrc && (
          <Box
            component="img"
            ref={imageRef}
            src={imageSrc}
            alt="Crop Preview"
            draggable={false}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              maxWidth: "none",
              maxHeight: "none",
              width: imgDimensions.width > imgDimensions.height ? "auto" : `${cropSize}px`,
              height: imgDimensions.height >= imgDimensions.width ? "auto" : `${cropSize}px`,
              minWidth: `${cropSize}px`,
              minHeight: `${cropSize}px`,
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.05s ease-out",
              pointerEvents: "none",
            }}
          />
        )}
      </Box>
    );
  }
);

CircularImageCropper.displayName = "CircularImageCropper";
export default CircularImageCropper;
