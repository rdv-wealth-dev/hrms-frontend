import React, { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Paper from "@mui/material/Paper";

import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CloseIcon from "@mui/icons-material/Close";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  label: string;
  type?: "select" | "date" | "daterange" | "text";
  options?: FilterOption[];
  minWidth?: number;
  icon?: React.ReactNode;
}

export interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  fields?: FilterField[];
  values?: Record<string, any>;
  onFilterChange?: (key: string, value: any) => void;
  onReset?: () => void;
  showReset?: boolean;
}

const COMMON_INPUT_SX = {
  height: 40,
  borderRadius: "10px",
  backgroundColor: "#FFFFFF",
  fontSize: "14px",
  color: "#0F172A",
  "& fieldset": { borderColor: "#E2E8F0" },
  "&:hover fieldset": { borderColor: "#CBD5E1" },
  "&.Mui-focused fieldset": { borderColor: "#6D5DF6" },
  "& .MuiOutlinedInput-input": {
    py: 0,
    height: 40,
    fontSize: "14px",
    boxSizing: "border-box",
    color: "#0F172A",
  },
};

const DEFAULT_OPTIONS: Record<string, FilterOption[]> = {
  department: [
    { value: "ALL", label: "All Departments" },
    { value: "Engineering", label: "Engineering" },
    { value: "Product", label: "Product" },
    { value: "HR", label: "HR" },
    { value: "Sales", label: "Sales" },
    { value: "Design", label: "Design" },
    { value: "Finance", label: "Finance" },
    { value: "Marketing", label: "Marketing" },
    { value: "Operations", label: "Operations" },
  ],
  departmentId: [
    { value: "ALL", label: "All Departments" },
    { value: "Engineering", label: "Engineering" },
    { value: "Product", label: "Product" },
    { value: "HR", label: "HR" },
    { value: "Sales", label: "Sales" },
    { value: "Design", label: "Design" },
    { value: "Finance", label: "Finance" },
    { value: "Marketing", label: "Marketing" },
    { value: "Operations", label: "Operations" },
  ],
  designation: [
    { value: "ALL", label: "All Designations" },
    { value: "Senior Software Engineer", label: "Senior Software Engineer" },
    { value: "Product Manager", label: "Product Manager" },
    { value: "HR Business Partner", label: "HR Business Partner" },
    { value: "UX Lead", label: "UX Lead" },
    { value: "Account Executive", label: "Account Executive" },
    { value: "Engineering Director", label: "Engineering Director" },
  ],
  designationId: [
    { value: "ALL", label: "All Designations" },
    { value: "Senior Software Engineer", label: "Senior Software Engineer" },
    { value: "Product Manager", label: "Product Manager" },
    { value: "HR Business Partner", label: "HR Business Partner" },
    { value: "UX Lead", label: "UX Lead" },
    { value: "Account Executive", label: "Account Executive" },
    { value: "Engineering Director", label: "Engineering Director" },
  ],
  branch: [
    { value: "ALL", label: "All Branches" },
    { value: "Head Office", label: "Head Office" },
    { value: "Bangalore Branch", label: "Bangalore Branch" },
    { value: "Mumbai Branch", label: "Mumbai Branch" },
    { value: "Hyderabad Branch", label: "Hyderabad Branch" },
    { value: "Delhi Branch", label: "Delhi Branch" },
  ],
  branchId: [
    { value: "ALL", label: "All Branches" },
    { value: "Head Office", label: "Head Office" },
    { value: "Bangalore Branch", label: "Bangalore Branch" },
    { value: "Mumbai Branch", label: "Mumbai Branch" },
    { value: "Hyderabad Branch", label: "Hyderabad Branch" },
    { value: "Delhi Branch", label: "Delhi Branch" },
  ],
  team: [
    { value: "ALL", label: "All Teams" },
    { value: "Core Platform", label: "Core Platform" },
    { value: "Product Design", label: "Product Design" },
    { value: "Talent Acquisition", label: "Talent Acquisition" },
    { value: "Enterprise Sales", label: "Enterprise Sales" },
    { value: "DevOps", label: "DevOps" },
  ],
  teamId: [
    { value: "ALL", label: "All Teams" },
    { value: "Core Platform", label: "Core Platform" },
    { value: "Product Design", label: "Product Design" },
    { value: "Talent Acquisition", label: "Talent Acquisition" },
    { value: "Enterprise Sales", label: "Enterprise Sales" },
    { value: "DevOps", label: "DevOps" },
  ],
  status: [
    { value: "ALL", label: "All Statuses" },
    { value: "PRESENT", label: "Present" },
    { value: "ABSENT", label: "Absent" },
    { value: "LATE", label: "Late" },
    { value: "HALF_DAY", label: "Half Day" },
    { value: "ON_LEAVE", label: "On Leave" },
  ],
};

function resolveFieldOptions(field: FilterField): FilterOption[] {
  if (field.options && field.options.length > 1) {
    return field.options;
  }
  const fallback = DEFAULT_OPTIONS[field.key];
  if (fallback && fallback.length > 0) {
    return fallback;
  }
  return field.options || [];
}

const formatDateString = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
};

export default function FilterBar({
  searchPlaceholder = "Search employees...",
  searchValue = "",
  onSearchChange,
  fields = [],
  values = {},
  onFilterChange,
  onReset,
  showReset = true,
}: FilterBarProps) {
  const [activePanelKey, setActivePanelKey] = useState<string | null>(null);

  const activeField = fields.find((f) => f.key === activePanelKey);

  const hasActiveFilters =
    Boolean(searchValue) ||
    Object.values(values).some((v) => v !== "" && v !== "ALL" && v !== undefined && v !== null);

  const handlePillClick = (key: string) => {
    setActivePanelKey((prev) => (prev === key ? null : key));
  };

  const handleSelectOption = (key: string, val: string) => {
    if (onFilterChange) {
      onFilterChange(key, val);
    }
    // Auto-close sub-panel when a select option is chosen
    setActivePanelKey(null);
  };

  // Date fields: update value without closing the panel
  // (native date input fires onChange on every arrow/spinner interaction,
  //  closing on each change would dismiss the picker mid-navigation)
  const handleDateChange = (key: string, val: string) => {
    if (onFilterChange) {
      onFilterChange(key, val);
    }
  };

  return (
    <Box sx={{ width: "100%", mb: 3 }}>
      {/* 1. Horizontal Pill Controls Row */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
        }}
      >
        {/* Search Input */}
        {onSearchChange && (
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 1 }}>
                    <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: { xs: "100%", sm: 220 },
              flexShrink: 0,
              "& .MuiOutlinedInput-root": COMMON_INPUT_SX,
            }}
          />
        )}

        {/* Dynamic Filter Pill Buttons */}
        {fields.map((field) => {
          const isPanelOpen = activePanelKey === field.key;
          const currentVal = values[field.key];
          const hasValue = currentVal !== undefined && currentVal !== "" && currentVal !== "ALL";

          if (field.type === "daterange") {
            const hasFrom = Boolean(values.fromDate);
            const hasTo = Boolean(values.toDate);
            const hasVal = hasFrom || hasTo;

            let btnLabel = field.label;
            if (hasFrom && hasTo) {
              btnLabel = `${formatDateString(values.fromDate)} - ${formatDateString(values.toDate)}`;
            } else if (hasFrom) {
              btnLabel = `From ${formatDateString(values.fromDate)}`;
            } else if (hasTo) {
              btnLabel = `To ${formatDateString(values.toDate)}`;
            }

            return (
              <Button
                key={field.key}
                disableRipple
                onClick={() => handlePillClick(field.key)}
                endIcon={<CalendarMonthOutlinedIcon sx={{ fontSize: "18px !important" }} />}
                sx={{
                  height: 40,
                  borderRadius: "10px",
                  px: 2,
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: isPanelOpen || hasVal ? 600 : 500,
                  backgroundColor: isPanelOpen ? "#F5F3FF" : "#FFFFFF",
                  color: isPanelOpen || hasVal ? "#6D5DF6" : "#334155",
                  border: isPanelOpen || hasVal ? "1.5px solid #6D5DF6" : "1px solid #E2E8F0",
                  boxShadow: isPanelOpen ? "0 0 0 3px rgba(109, 93, 246, 0.12)" : "none",
                  "&:hover": {
                    backgroundColor: isPanelOpen ? "#F5F3FF" : "#F8FAFC",
                    borderColor: isPanelOpen ? "#6D5DF6" : "#CBD5E1",
                  },
                  transition: "all 0.15s ease-in-out",
                }}
              >
                {btnLabel}
              </Button>
            );
          }

          if (field.type === "date") {
            return (
              <Button
                key={field.key}
                disableRipple
                onClick={() => handlePillClick(field.key)}
                endIcon={<CalendarMonthOutlinedIcon sx={{ fontSize: "18px !important" }} />}
                sx={{
                  height: 40,
                  borderRadius: "10px",
                  px: 2,
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: isPanelOpen || hasValue ? 600 : 500,
                  backgroundColor: isPanelOpen ? "#F5F3FF" : "#FFFFFF",
                  color: isPanelOpen || hasValue ? "#6D5DF6" : "#334155",
                  border: isPanelOpen || hasValue ? "1.5px solid #6D5DF6" : "1px solid #E2E8F0",
                  boxShadow: isPanelOpen ? "0 0 0 3px rgba(109, 93, 246, 0.12)" : "none",
                  "&:hover": {
                    backgroundColor: isPanelOpen ? "#F5F3FF" : "#F8FAFC",
                    borderColor: isPanelOpen ? "#6D5DF6" : "#CBD5E1",
                  },
                  transition: "all 0.15s ease-in-out",
                }}
              >
                {field.label}
              </Button>
            );
          }

          // Select Pills
          return (
            <Button
              key={field.key}
              disableRipple
              onClick={() => handlePillClick(field.key)}
              endIcon={
                isPanelOpen ? (
                  <KeyboardArrowUpIcon sx={{ fontSize: "18px !important" }} />
                ) : (
                  <KeyboardArrowDownIcon sx={{ fontSize: "18px !important" }} />
                )
              }
              sx={{
                height: 40,
                borderRadius: "10px",
                px: 2,
                textTransform: "none",
                fontSize: "14px",
                fontWeight: isPanelOpen || hasValue ? 600 : 500,
                backgroundColor: isPanelOpen ? "#F5F3FF" : "#FFFFFF",
                color: isPanelOpen || hasValue ? "#6D5DF6" : "#334155",
                border: isPanelOpen || hasValue ? "1.5px solid #6D5DF6" : "1px solid #E2E8F0",
                boxShadow: isPanelOpen ? "0 0 0 3px rgba(109, 93, 246, 0.12)" : "none",
                "&:hover": {
                  backgroundColor: isPanelOpen ? "#F5F3FF" : "#F8FAFC",
                  borderColor: isPanelOpen ? "#6D5DF6" : "#CBD5E1",
                },
                transition: "all 0.15s ease-in-out",
              }}
            >
              {field.label}
            </Button>
          );
        })}

        {/* Optional Reset Button */}
        {showReset && hasActiveFilters && onReset && (
          <Button
            variant="text"
            onClick={() => {
              setActivePanelKey(null);
              onReset();
            }}
            startIcon={<RestartAltIcon fontSize="small" />}
            sx={{
              height: 40,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "13px",
              color: "#64748B",
              px: 1.5,
              "&:hover": { backgroundColor: "#F1F5F9", color: "#0F172A" },
            }}
          >
            Reset Filters
          </Button>
        )}
      </Box>

      {/* 2. Collapsible Interactive Sub-Panel */}
      <Collapse in={Boolean(activePanelKey && activeField)} timeout={200} unmountOnExit>
        {activeField && (
          <Paper
            elevation={0}
            sx={{
              mt: 1.5,
              p: 2.5,
              borderRadius: "14px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            }}
          >
            {/* Sub-panel Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  fontSize: "11px",
                  letterSpacing: "0.06em",
                  color: "#64748B",
                  textTransform: "uppercase",
                }}
              >
                FILTER BY {activeField.label}
              </Typography>

              <IconButton
                size="small"
                onClick={() => setActivePanelKey(null)}
                sx={{
                  color: "#64748B",
                  "&:hover": { backgroundColor: "#F1F5F9", color: "#0F172A" },
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {/* Sub-panel Content */}
            {activeField.type === "daterange" ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569" }}>From:</Typography>
                  <TextField
                    type="date"
                    size="small"
                    value={values.fromDate || ""}
                    onChange={(e) => handleDateChange("fromDate", e.target.value)}
                    sx={{
                      width: 170,
                      "& .MuiOutlinedInput-root": COMMON_INPUT_SX,
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569" }}>To:</Typography>
                  <TextField
                    type="date"
                    size="small"
                    value={values.toDate || ""}
                    onChange={(e) => handleDateChange("toDate", e.target.value)}
                    sx={{
                      width: 170,
                      "& .MuiOutlinedInput-root": COMMON_INPUT_SX,
                    }}
                  />
                </Box>
                {(values.fromDate || values.toDate) && (
                  <Button
                    size="small"
                    onClick={() => {
                      handleDateChange("fromDate", "");
                      handleDateChange("toDate", "");
                    }}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#EF4444", ml: 1 }}
                  >
                    Clear Range
                  </Button>
                )}
              </Box>
            ) : activeField.type === "date" ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <TextField
                  type="date"
                  size="small"
                  value={values[activeField.key] || ""}
                  onChange={(e) => handleDateChange(activeField.key, e.target.value)}
                  sx={{
                    width: 220,
                    "& .MuiOutlinedInput-root": COMMON_INPUT_SX,
                  }}
                />
                {values[activeField.key] && (
                  <Button
                    size="small"
                    onClick={() => handleSelectOption(activeField.key, "")}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#EF4444" }}
                  >
                    Clear Date
                  </Button>
                )}
              </Box>
            ) : (
              /* Option Chips Grid */
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25 }}>
                {(() => {
                  const resolvedOpts = resolveFieldOptions(activeField);
                  const hasAllOpt = resolvedOpts.some((o) => o.value === "ALL");
                  const baseLabel = activeField.label.trim();
                  const defaultAllLabel = baseLabel.toLowerCase().startsWith("all")
                    ? baseLabel
                    : `All ${baseLabel.toLowerCase().endsWith("s") ? baseLabel : baseLabel + "s"}`;

                  const displayOptions = hasAllOpt
                    ? resolvedOpts.map((o) => (o.value === "ALL" && o.label === baseLabel ? { ...o, label: defaultAllLabel } : o))
                    : [{ value: "ALL", label: defaultAllLabel }, ...resolvedOpts];

                  return displayOptions.map((opt) => {
                    const currentVal = values[activeField.key] ?? "ALL";
                    const isSelected = currentVal === opt.value;

                    return (
                      <Button
                        key={opt.value}
                        disableRipple
                        onClick={() => handleSelectOption(activeField.key, opt.value)}
                        sx={{
                          height: 36,
                          borderRadius: "10px",
                          px: 2,
                          textTransform: "none",
                          fontSize: "13.5px",
                          fontWeight: isSelected ? 600 : 500,
                          backgroundColor: isSelected ? "#6D5DF6" : "#FFFFFF",
                          color: isSelected ? "#FFFFFF" : "#334155",
                          border: isSelected ? "1px solid #6D5DF6" : "1px solid #E2E8F0",
                          boxShadow: isSelected ? "0 2px 8px rgba(109, 93, 246, 0.25)" : "none",
                          "&:hover": {
                            backgroundColor: isSelected ? "#5B4BEA" : "#F8FAFC",
                            borderColor: isSelected ? "#5B4BEA" : "#CBD5E1",
                          },
                          transition: "all 0.15s ease-in-out",
                        }}
                      >
                        {opt.label}
                      </Button>
                    );
                  });
                })()}
              </Box>
            )}
          </Paper>
        )}
      </Collapse>
    </Box>
  );
}
