import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";

import TextInput from "./TextInput";
import { useDebounce } from "../../hooks/useDebounce";
import { checkSlug } from "../../api/auth.api";

type SlugStatus = "idle" | "checking" | "available" | "taken" | "error";

export interface SlugInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  /** Notify parent whether slug is confirmed available (true), taken (false), or unchecked (null) */
  onAvailabilityChange?: (available: boolean | null) => void;
}

export default function SlugInput({
  value,
  onChange,
  error,
  onAvailabilityChange,
}: SlugInputProps) {
  const [status, setStatus] = useState<SlugStatus>("idle");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const debouncedSlug = useDebounce(value, 400);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Enforce: lowercase, only a-z 0-9 and hyphens, no spaces
    const sanitized = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    onChange(sanitized);
    setStatus("idle");
    onAvailabilityChange?.(null);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Prefix label + input in a single visual row */}
      <Typography
        sx={{
          fontSize: "13.5px",
          fontWeight: 600,
          color: "#334155",
          mb: 0.8,
          display: "block",
        }}
      >
        Workspace URL <span style={{ color: "#EF4444" }}>*</span>
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
        {/* Prefix badge */}
        <Box
          sx={{
            height: 44,
            display: "flex",
            alignItems: "center",
            px: 1.5,
            backgroundColor: "#F1F5F9",
            border: "1.5px solid #E2E8F0",
            borderRight: "none",
            borderRadius: "12px 0 0 12px",
            whiteSpace: "nowrap",
            fontSize: "13px",
            color: "#64748B",
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          ourhrms.com/
        </Box>

        {/* Slug text input — shares the border seamlessly */}
        <TextInput
          placeholder="acme-corp"
          value={value}
          onChange={handleChange}
          error={error}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "0 12px 12px 0 !important",
              "& fieldset": {
                borderLeftColor: "transparent !important",
              },
            },
          }}
        />
      </Box>

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
                    backgroundColor: "#F1F5F9",
                    color: "#475569",
                    fontWeight: 600,
                    "&:hover": { backgroundColor: "#6D5DF6", color: "#fff" },
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
