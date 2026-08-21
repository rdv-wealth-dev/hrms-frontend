import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";

export interface CustomSelectOption {
  value: string | number;
  label: string;
  subtext?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface CustomSelectProps {
  label?: string;
  placeholder?: string;
  options?: CustomSelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  fullWidth?: boolean;
  size?: "small" | "medium";
  sx?: any;
}

export function CustomSelect({
  label,
  placeholder = "Select Option",
  options = [],
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  searchable = false,
  searchPlaceholder = "Search options...",
  fullWidth = true,
  size = "small",
  sx,
}: CustomSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const safeOptions = Array.isArray(options) ? options : [];

  const filteredOptions = searchable
    ? safeOptions.filter((opt) =>
        opt?.label?.toLowerCase()?.includes(searchTerm?.toLowerCase()?.trim() ?? "")
      )
    : safeOptions;

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange?.(val);
  };

  const selectedOption = safeOptions.find((opt) => String(opt?.value) === String(value));

  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
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
        fullWidth={fullWidth}
        value={value ?? ""}
        onChange={handleSelectChange}
        error={!!error}
        helperText={error}
        disabled={disabled}
        size={size}
        variant="outlined"
        slotProps={{
          select: {
            displayEmpty: true,
            renderValue: (selectedVal: any) => {
              if (selectedVal === "" || selectedVal === undefined || selectedVal === null) {
                return <span style={{ color: "#94A3B8", fontSize: "13.5px" }}>{placeholder}</span>;
              }
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {selectedOption?.icon}
                  <Typography variant="body2" sx={{ fontSize: "14px", color: "#0F172A", fontWeight: 500 }}>
                    {selectedOption?.label ?? selectedVal}
                  </Typography>
                </Box>
              );
            },
            MenuProps: {
              disableScrollLock: true,
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              slotProps: {
                backdrop: {
                  invisible: true,
                  style: { backdropFilter: "none", backgroundColor: "transparent" },
                },
                paper: {
                  sx: {
                    maxHeight: searchable ? { xs: "235px !important", sm: "225px !important" } : { xs: "184px !important", sm: "176px !important" },
                    maxWidth: "calc(100vw - 32px)",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)",
                    p: 0.5,
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#CBD5E1 transparent",
                    "&::-webkit-scrollbar": { width: "5px" },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "#CBD5E1",
                      borderRadius: "4px",
                    },
                    "& .MuiMenuItem-root": {
                      fontSize: { xs: "13.5px", sm: "14px" },
                      minHeight: { xs: "44px !important", sm: "40px !important" },
                      height: { xs: "auto", sm: "40px" },
                      whiteSpace: { xs: "normal", sm: "nowrap" },
                      wordBreak: { xs: "break-word", sm: "normal" },
                      py: { xs: 1, sm: 0 },
                      px: { xs: 1.5, sm: 1.8 },
                      borderRadius: "6px",
                      mx: 0.2,
                      my: 0.2,
                      color: "#334155",
                      "&:hover": { backgroundColor: "#F1F5F9", color: "#0F172A" },
                      "&.Mui-selected": { backgroundColor: "#EEF2FF", color: "#4F46E5", fontWeight: 600 },
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
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            fontSize: "14px",
            color: "#0F172A",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "& fieldset": {
              borderColor: "#E2E8F0",
              borderWidth: "1.5px",
            },
            "&:hover fieldset": {
              borderColor: "#CBD5E1",
            },
            "&.Mui-focused": {
              backgroundColor: "#FFFFFF",
              "& fieldset": {
                borderColor: "#6D5DF6",
                borderWidth: "2px",
              },
              boxShadow: "0 0 0 3px rgba(109, 93, 246, 0.12)",
            },
          },
          ...sx,
        }}
      >
        {searchable && (
          <Box
            sx={{ px: 1, py: 0.8, sticky: "top", backgroundColor: "#fff", zIndex: 1 }}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <TextField
              size="small"
              fullWidth
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm("")}>
                        <ClearIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  fontSize: "13px",
                  backgroundColor: "#F8FAFC",
                },
              }}
            />
          </Box>
        )}

        {filteredOptions?.length === 0 ? (
          <MenuItem disabled sx={{ justifyContent: "center", py: 2, color: "#94A3B8", fontSize: "13px" }}>
            No options found
          </MenuItem>
        ) : (
          filteredOptions?.map((opt) => (
            <MenuItem key={String(opt?.value)} value={opt?.value} disabled={opt?.disabled}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {opt?.icon}
                  <Typography variant="body2" sx={{ fontWeight: value === opt?.value ? 600 : 400 }}>
                    {opt?.label}
                  </Typography>
                </Box>
                {opt?.subtext && (
                  <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: "11px", ml: "auto" }}>
                    {opt?.subtext}
                  </Typography>
                )}
              </Box>
            </MenuItem>
          ))
        )}
      </TextField>
    </Box>
  );
}

export default CustomSelect;
