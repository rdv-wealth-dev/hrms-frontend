import React from "react";
import { alpha } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { UseFormRegisterReturn } from "react-hook-form";

export interface SelectOption {
  value: string;
  label: string;
  subLabel?: string;
  isHead?: boolean;
}

interface CascadingSelectProps {
  label?: string;
  required?: boolean;
  value?: string;
  options: SelectOption[];
  loading?: boolean;
  disabled?: boolean;
  disabledPlaceholder?: string;
  emptyPlaceholder?: string;
  placeholder?: string;
  error?: string;
  registration?: UseFormRegisterReturn;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
}

export const CascadingSelect: React.FC<CascadingSelectProps> = ({
  label,
  required = false,
  value,
  options,
  loading = false,
  disabled = false,
  disabledPlaceholder = "Select parent option first",
  emptyPlaceholder = "No options available",
  placeholder = "Select Option",
  error,
  registration,
  onChange,
  helperText,
}) => {
  const isInputDisabled = disabled || loading;

  let displayPlaceholder = placeholder;
  if (disabled) {
    displayPlaceholder = disabledPlaceholder;
  } else if (!loading && options?.length === 0) {
    displayPlaceholder = emptyPlaceholder;
  }

  return (
    <Box sx={{ width: "100%" }}>
      {label && (
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#334155",
            mb: 0.6,
            display: "block",
          }}
        >
          {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
        </Typography>
      )}

      <TextField
        select
        fullWidth
        value={value ?? ""}
        disabled={isInputDisabled}
        error={Boolean(error)}
        helperText={error || helperText}
        {...registration}
        onChange={(e: any) => {
          if (registration?.onChange) {
            registration.onChange(e);
          }
          if (onChange) {
            onChange(e);
          }
        }}
        slotProps={{
          input: {
            endAdornment: loading ? (
              <InputAdornment position="end" sx={{ mr: 2 }}>
                <CircularProgress size={18} />
              </InputAdornment>
            ) : undefined,
          },
          select: {
            displayEmpty: true,
            renderValue: (selectedVal: any) => {
              if (!selectedVal) {
                return (
                  <Typography variant="body2" sx={{ color: "#94A3B8", fontSize: "13.5px" }}>
                    {displayPlaceholder}
                  </Typography>
                );
              }

              // Robust matching by normalizing string IDs
              const selectedOpt = options?.find(
                (o) => String(o?.value ?? "").trim() === String(selectedVal ?? "").trim()
              );

              let textToDisplay = selectedOpt?.label;

              // If options list hasn't loaded yet or item isn't in options, don't show raw Mongo ObjectId hex code
              if (!textToDisplay) {
                const isRawHexId = typeof selectedVal === "string" && /^[0-9a-fA-F]{24}$/.test(selectedVal);
                if (isRawHexId) {
                  textToDisplay = loading ? "Loading..." : displayPlaceholder;
                } else {
                  textToDisplay = String(selectedVal);
                }
              }

              return (
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    fontSize: "14px",
                    color: "text.primary",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {textToDisplay}
                </Typography>
              );
            },
            MenuProps: {
              disableScrollLock: true,
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              slotProps: {
                paper: {
                  sx: {
                    maxHeight: { xs: "200px !important", sm: "240px !important" },
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.1)",
                    overflowY: "auto",
                    "& .MuiMenuItem-root": {
                      fontSize: { xs: "13.5px", sm: "14px" },
                      minHeight: "40px",
                      py: 1,
                      px: 1.5,
                      borderRadius: "6px",
                      mx: 0.5,
                      my: 0.2,
                      color: "text.primary",
                      "&:hover": { backgroundColor: "action.hover" },
                      "&.Mui-selected": { backgroundColor: "primary.lighter", color: "primary.main", fontWeight: 600 },
                    },
                  },
                },
              },
            },
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            height: 40,
            minHeight: 40,
            borderRadius: "12px",
            backgroundColor: isInputDisabled ? "action.hover" : "background.paper",
            fontSize: "14px",
            color: "text.primary",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "& fieldset": {
              borderColor: "divider",
              borderWidth: "1.5px",
            },
            "&:hover fieldset": {
              borderColor: isInputDisabled ? "divider" : "neutral.300",
            },
            "&.Mui-focused": {
              backgroundColor: "background.paper",
              "& fieldset": {
                borderColor: "primary.main",
                borderWidth: "2px",
              },
              boxShadow: (theme: any) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
            },
          },
          "& .MuiSelect-select": {
            py: "8px !important",
            height: "40px !important",
            minHeight: "40px !important",
            display: "flex",
            alignItems: "center",
            boxSizing: "border-box",
          },
        }}
      >
        <MenuItem value="" disabled sx={{ color: "#94A3B8" }}>
          <Typography variant="body2" sx={{ color: "#94A3B8", fontSize: "13.5px" }}>
            {displayPlaceholder}
          </Typography>
        </MenuItem>

        {options?.map((opt) => (
          <MenuItem key={opt?.value} value={opt?.value}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 1 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {opt?.label}
                </Typography>
                {opt?.subLabel && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "11px" }}>
                    {opt?.subLabel}
                  </Typography>
                )}
              </Box>
              {opt?.isHead && (
                <Chip
                  label="Dept Head"
                  size="small"
                  color="primary"
                  sx={{ height: 18, fontSize: "0.625rem", fontWeight: 700 }}
                />
              )}
            </Box>
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default CascadingSelect;
