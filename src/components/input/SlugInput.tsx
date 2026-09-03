import { useState, useEffect } from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";

import { useDebounce } from "../../hooks/useDebounce";
import { checkSlug } from "../../api/auth.api";

type SlugStatus = "idle" | "checking" | "available" | "taken" | "error";

export interface SlugInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  /** Notify parent whether slug is confirmed available (true), taken (false), or unchecked (null) */
  onAvailabilityChange?: (available: boolean | null) => void;
  /** Called when the user manually types in the slug field — used by parent to stop auto-generating from company name */
  onManualEdit?: () => void;
}

export default function SlugInput({
  value,
  onChange,
  error,
  onAvailabilityChange,
  onManualEdit,
}: SlugInputProps) {
  const [status, setStatus] = useState<SlugStatus>("idle");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const debouncedSlug = useDebounce(value, 400);

  // Immediately reset status when value changes so stale results ("taken"/"available") aren't displayed during debounce window
  useEffect(() => {
    setStatus("idle");
    setSuggestions([]);
    onAvailabilityChange?.(null);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!debouncedSlug || debouncedSlug.length < 3) {
      setStatus("idle");
      setSuggestions([]);
      onAvailabilityChange?.(null);
      return;
    }

    let cancelled = false;
    setStatus("checking");

    checkSlug(debouncedSlug)
      .then((res) => {
        if (cancelled) return;
        if (res.data?.available) {
          setStatus("available");
          setSuggestions([]);
          onAvailabilityChange?.(true);
        } else {
          setStatus("taken");
          setSuggestions(res.data?.suggestions ?? []);
          onAvailabilityChange?.(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        onAvailabilityChange?.(null);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Enforce: lowercase, only a-z 0-9 and hyphens, no spaces
    const sanitized = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    onChange(sanitized);
    setStatus("idle");
    onAvailabilityChange?.(null);
    // Signal parent that user has manually edited the slug field
    onManualEdit?.();
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Label */}
      <Typography
        sx={{
          fontSize: "13px",
          fontWeight: 600,
          color: "#334155",
          mb: 0.6,
          display: "block",
        }}
      >
        Workspace URL <span style={{ color: "#EF4444" }}>*</span>
      </Typography>

      {/* Input Outer Container */}
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          height: 40,
          minHeight: 40,
          borderRadius: "12px",
          backgroundColor: "background.paper",
          overflow: "hidden",
          border: "1.5px solid",
          borderColor: error
            ? "error.main"
            : isFocused
            ? "primary.main"
            : "divider",
          boxShadow: isFocused ? (theme: any) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}` : "none",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            borderColor: error ? "error.main" : isFocused ? "primary.main" : "neutral.300",
          },
        }}
      >
        {/* Prefix Badge */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1.8,
            backgroundColor: "action.hover",
            borderRight: "1.5px solid",
            borderColor: "divider",
            color: "text.secondary",
            fontWeight: 500,
            fontSize: "13.5px",
            userSelect: "none",
            flexShrink: 0,
          }}
        >
          ourhrms.com/
        </Box>

        {/* Input Field */}
        <Box
          component="input"
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          sx={{
            flex: 1,
            height: "100%",
            px: "14px",
            py: 0,
            border: "none",
            outline: "none",
            backgroundColor: "transparent",
            fontSize: "14px",
            color: "text.primary",
            fontFamily: "inherit",
            "&::placeholder": {
              color: "#94A3B8",
              opacity: 1,
              fontSize: "13.5px",
              fontWeight: 400,
            },
          }}
        />
      </Box>

      {/* Validation Error Message */}
      {error && (
        <Typography
          variant="caption"
          sx={{
            color: "#EF4444",
            fontSize: "12px",
            mt: 0.5,
            ml: 0.5,
            display: "block",
          }}
        >
          {error}
        </Typography>
      )}

      {/* Status row */}
      {status === "checking" && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.8 }}>
          <CircularProgress size={13} sx={{ color: "#94A3B8" }} />
          <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: "12px" }}>
            Checking availability…
          </Typography>
        </Box>
      )}

      {status === "available" && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.8 }}>
          <CheckCircleOutlinedIcon sx={{ fontSize: 15, color: "#10B981" }} />
          <Typography variant="caption" sx={{ color: "#10B981", fontWeight: 600, fontSize: "12px" }}>
            "{value}" is available
          </Typography>
        </Box>
      )}

      {status === "taken" && (
        <Box sx={{ mt: 0.8 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <ErrorOutlinedIcon sx={{ fontSize: 15, color: "#EF4444" }} />
            <Typography variant="caption" sx={{ color: "#EF4444", fontWeight: 600, fontSize: "12px" }}>
              Already taken.
              {suggestions.length > 0 && " Try:"}
            </Typography>
          </Box>
          {suggestions.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, mt: 0.5 }}>
              {suggestions.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  size="small"
                  onClick={() => {
                    onChange(s);
                    setStatus("idle");
                    onAvailabilityChange?.(null);
                  }}
                  sx={{
                    fontSize: "11px",
                    height: 22,
                    cursor: "pointer",
                    backgroundColor: "action.hover",
                    color: "text.secondary",
                    fontWeight: 600,
                    "&:hover": { backgroundColor: "primary.main", color: "primary.contrastText" },
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      )}

      {status === "error" && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.8 }}>
          <ErrorOutlinedIcon sx={{ fontSize: 15, color: "#F59E0B" }} />
          <Typography variant="caption" sx={{ color: "#F59E0B", fontWeight: 600, fontSize: "12px" }}>
            Could not check availability. Please try again.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
