import React, { useState, useMemo, useRef } from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Popover from "@mui/material/Popover";
import Checkbox from "@mui/material/Checkbox";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  options?: MultiSelectOption[];
  value?: string[];
  onChange?: (selectedValues: string[]) => void;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  size?: "small" | "medium";
  fullWidth?: boolean;
  error?: string;
  sx?: any;
}

export function MultiSelect({
  label,
  placeholder = "Select options",
  options = [],
  value = [],
  onChange,
  disabled = false,
  searchable = true,
  searchPlaceholder = "Search options...",
  fullWidth = true,
  size = "small",
  error,
  sx,
}: MultiSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const safeOptions = Array.isArray(options) ? options : [];
  const safeValue = Array.isArray(value) ? value : [];

  const filteredOptions = useMemo(() => {
    const query = searchTerm?.trim()?.toLowerCase() ?? "";
    if (!query || !searchable) return safeOptions;
    return safeOptions.filter((opt) =>
      opt?.label?.toLowerCase()?.includes(query)
    );
  }, [safeOptions, searchTerm, searchable]);

  const allSelected = useMemo(() => {
    if (safeOptions.length === 0) return false;
    return safeOptions.every((opt) => safeValue.includes(opt.value));
  }, [safeOptions, safeValue]);

  const someSelected = useMemo(() => {
    if (allSelected) return false;
    return safeOptions.some((opt) => safeValue.includes(opt.value));
  }, [allSelected, safeOptions, safeValue]);

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggleOption = (val: string) => {
    if (!onChange) return;
    if (safeValue.includes(val)) {
      onChange(safeValue.filter((v) => v !== val));
    } else {
      onChange([...safeValue, val]);
    }
  };

  const handleToggleSelectAll = () => {
    if (!onChange) return;
    if (allSelected) {
      onChange([]);
    } else {
      onChange(safeOptions.map((opt) => opt.value));
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) onChange([]);
  };

  const triggerDisplayText = useMemo(() => {
    if (safeValue.length === 0) return placeholder;
    if (safeValue.length === 1) {
      const found = safeOptions.find((opt) => opt.value === safeValue[0]);
      return found?.label ?? safeValue[0];
    }
    return `${safeValue.length} Selected`;
  }, [safeValue, safeOptions, placeholder]);

  return (
    <Box ref={containerRef} sx={{ width: fullWidth ? "100%" : "auto" }}>
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
          {label}
        </Typography>
      )}

      <Box
        onClick={handleOpen}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: size === "small" ? 40 : 44,
          px: 1.5,
          py: 0.5,
          borderRadius: "10px",
          backgroundColor: "background.paper",
          border: "1.5px solid",
          borderColor: isOpen ? "primary.main" : "divider",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.15s ease",
          boxShadow: isOpen ? (theme: any) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}` : "none",
          "&:hover": {
            borderColor: disabled ? "divider" : "neutral.300",
          },
          ...sx,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflow: "hidden", flexGrow: 1 }}>
          <Typography
            noWrap
            sx={{
              fontSize: "14px",
              fontWeight: safeValue.length > 0 ? 600 : 400,
              color: safeValue.length > 0 ? "text.primary" : "text.secondary",
            }}
          >
            {triggerDisplayText}
          </Typography>

          {safeValue.length > 0 && (
            <Chip
              label={safeValue.length}
              size="small"
              sx={{
                height: 20,
                fontSize: "11px",
                fontWeight: 700,
                backgroundColor: "#EEF2FF",
                color: "#4F46E5",
                borderRadius: "6px",
              }}
            />
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0, ml: 1 }}>
          {safeValue.length > 0 && !disabled && (
            <IconButton
              size="small"
              onClick={handleClearAll}
              sx={{ p: 0.2, color: "#94A3B8", "&:hover": { color: "#EF4444" } }}
            >
              <ClearIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
          <KeyboardArrowDownIcon
            sx={{
              fontSize: 18,
              color: "#94A3B8",
              transition: "transform 0.15s ease",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </Box>
      </Box>

      <Popover
        open={isOpen}
        anchorEl={containerRef.current}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.8,
              width: containerRef.current?.clientWidth ?? 260,
              minWidth: 240,
              maxWidth: "92vw",
              maxHeight: 320,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
              boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.1)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            },
          },
        }}
      >
        {searchable && (
          <Box sx={{ p: 1, borderBottom: "1px solid", borderColor: "divider" }}>
            <TextField
              size="small"
              fullWidth
              autoFocus
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                    </InputAdornment>
                  ),
                  sx: { fontSize: "13px", height: 34, borderRadius: "8px" },
                },
              }}
            />
          </Box>
        )}

        <Box sx={{ px: 1, py: 0.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={handleToggleSelectAll}>
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={someSelected}
              sx={{ p: 0.5, color: "text.secondary", "&.Mui-checked": { color: "primary.main" } }}
            />
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "text.primary", ml: 0.5 }}>
              Select All
            </Typography>
          </Box>

          {safeValue.length > 0 && (
            <Button
              size="small"
              onClick={handleClearAll}
              sx={{ fontSize: "12px", fontWeight: 600, textTransform: "none", color: "#EF4444", p: 0.5 }}
            >
              Clear
            </Button>
          )}
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: "auto", py: 0.5 }}>
          {filteredOptions.length === 0 ? (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography sx={{ fontSize: "13px", color: "#94A3B8" }}>
                No options found
              </Typography>
            </Box>
          ) : (
            filteredOptions.map((opt) => {
              const isChecked = safeValue.includes(opt.value);
              return (
                <Box
                  key={opt.value}
                  onClick={() => handleToggleOption(opt.value)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    py: 0.8,
                    px: 1.5,
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "background-color 0.15s ease",
                    backgroundColor: isChecked ? "primary.lighter" : "transparent",
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={isChecked}
                    sx={{ p: 0.5, mr: 1, color: "text.secondary", "&.Mui-checked": { color: "primary.main" } }}
                  />
                  <Typography noWrap sx={{ fontSize: "13.5px", fontWeight: isChecked ? 600 : 400, color: isChecked ? "primary.main" : "text.primary" }}>
                    {opt.label}
                  </Typography>
                </Box>
              );
            })
          )}
        </Box>
      </Popover>
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
