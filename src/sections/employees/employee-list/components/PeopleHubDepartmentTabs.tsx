import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloseIcon from "@mui/icons-material/Close";

import { MultiSelect, type MultiSelectOption } from "../../../../components/input/MultiSelect";

export interface FilterState {
  designation?: string | string[];
  branch?: string | string[];
  team?: string | string[];
  dateOfJoining?: string;
  fromDate?: string;
  toDate?: string;
  department?: string | string[];
  status?: string | string[];
}

interface PeopleHubFilterTabsProps {
  filters?: FilterState;
  onFilterChange?: (newFilters: FilterState) => void;
  departmentsList?: string[];
  designationsList?: string[];
  branchesList?: string[];
  teamsList?: string[];
  statusesList?: string[];
  datesList?: string[];
  searchElement?: React.ReactNode;
  // Legacy prop compatibility
  selectedDepartment?: string;
  onSelectDepartment?: (dept: string) => void;
}

const CATEGORIES = [
  { id: "dateOfJoining", label: "Date of Joining", isDate: true, options: ["All Dates", "This Month", "Last 3 Months", "Last 6 Months", "Last Year"] },
  { id: "branch", label: "Branch", options: ["All Branches", "Head Office", "Bangalore Branch", "Mumbai Branch", "Hyderabad Branch", "Delhi Branch"] },
  { id: "department", label: "Departments", options: ["All Departments", "Engineering", "Product", "HR", "Sales", "Design", "Finance", "Marketing", "Operations"] },
  { id: "team", label: "Team", options: ["All Teams", "Core Platform", "Product Design", "Talent Acquisition", "Enterprise Sales", "DevOps"] },
  { id: "designation", label: "Designation", options: ["All Designations", "Senior Software Engineer", "Product Manager", "HR Business Partner", "UX Lead", "Account Executive", "Engineering Director"] },
  { id: "status", label: "Status", options: ["All Statuses", "Active", "Inactive", "On Leave", "Terminated", "Resigned"] },
];

export function PeopleHubDepartmentTabs({
  filters = {},
  onFilterChange,
  departmentsList,
  designationsList,
  branchesList,
  teamsList,
  statusesList,
  datesList,
  searchElement,
  selectedDepartment = "",
  onSelectDepartment,
}: PeopleHubFilterTabsProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [localFilters, setLocalFilters] = useState<FilterState>({
    department: selectedDepartment,
    ...filters,
  });

  const handleToggleCategory = (categoryId: string) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null);
    } else {
      setActiveCategory(categoryId);
    }
  };

  const handleCloseMenu = () => {
    setActiveCategory(null);
  };

  const handleSelectOption = (categoryId: string, option: string) => {
    const isAll = option.startsWith("All");
    const value = isAll ? "" : option;

    const updated = {
      ...localFilters,
      [categoryId]: value,
    };

    setLocalFilters(updated);
    onFilterChange?.(updated);

    if (categoryId === "department") {
      onSelectDepartment?.(value);
    }

    handleCloseMenu();
  };

  const handleResetFilters = () => {
    const reset: FilterState = {
      designation: "",
      branch: "",
      team: "",
      dateOfJoining: "",
      fromDate: "",
      toDate: "",
      department: "",
      status: "",
    };
    setLocalFilters(reset);
    onFilterChange?.(reset);
    onSelectDepartment?.("");
    setActiveCategory(null);
  };

  const activeCategoryObj = CATEGORIES.find((c) => c.id === activeCategory);
  const hasActiveFilters = Object.values(localFilters).some((val) => Boolean(val));

  const getCategoryOptions = (catId: string) => {
    if (catId === "department" && departmentsList && departmentsList.length > 0) return departmentsList;
    if (catId === "designation" && designationsList && designationsList.length > 0) return designationsList;
    if (catId === "branch" && branchesList && branchesList.length > 0) return branchesList;
    if (catId === "team" && teamsList && teamsList.length > 0) return teamsList;
    if (catId === "status" && statusesList && statusesList.length > 0) return statusesList;
    if (catId === "dateOfJoining" && datesList && datesList.length > 0) return datesList;
    const cat = CATEGORIES.find((c) => c.id === catId);
    return cat?.options || [];
  };

  const activeOptions = activeCategoryObj ? getCategoryOptions(activeCategoryObj.id) : [];

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", mb: 2 }}>
      {/* Category Buttons Row */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          gap: 1.5,
          width: "100%",
        }}
      >
        {searchElement && (
          <Box sx={{
            width: { xs: "100%", md: "auto" },
            flexShrink: 0,
            "& .MuiTextField-root": {
              width: "100% !important"
            }
          }}>
            {searchElement}
          </Box>
        )}
        <Box
          sx={{
            display: { xs: "grid", sm: "flex" },
            gridTemplateColumns: { xs: "repeat(3, 1fr)", sm: "none" },
            alignItems: "center",
            flexWrap: "wrap",
            gap: { xs: 0.8, sm: 1.2 },
            py: 0.5,
            px: 0.5,
            flexGrow: 1,
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: { xs: "grid", sm: "contents" },
              gridTemplateColumns: { xs: "repeat(3, 1fr)", sm: "none" },
              gap: { xs: 0.8, sm: 0 },
              width: "100%",
              gridColumn: { xs: "span 3", sm: "auto" }
            }}
          >
            {CATEGORIES.map((cat) => {
              if (cat.isDate) {
                const selectedValue = localFilters[cat.id as keyof FilterState] as string;
                const isSelected = Boolean(selectedValue);
                const isOpen = activeCategory === cat.id;
                return (
                  <Button
                    key={cat.id}
                    onClick={() => handleToggleCategory(cat.id)}
                    size="small"
                    endIcon={<CalendarTodayOutlinedIcon sx={{ fontSize: { xs: 12, sm: 16 }, color: isOpen ? "#6D5DF6" : "#64748B" }} />}
                    sx={{
                      height: { xs: 36, sm: 40 },
                      borderRadius: "10px",
                      px: { xs: 0.8, sm: 1.8 },
                      fontSize: { xs: "11px", sm: "14px" },
                      fontWeight: isSelected || isOpen ? 600 : 500,
                      textTransform: "none",
                      whiteSpace: "nowrap",
                      backgroundColor: isOpen ? "#EEF2FF" : "#FFFFFF",
                      color: isSelected || isOpen ? "#0F172A" : "#475569",
                      border: isOpen ? "1.5px solid #6D5DF6" : isSelected ? "1px solid #6D5DF6" : "1px solid #CBD5E1",
                      minWidth: { xs: "auto", sm: 145 },
                    }}
                  >
                    <span>{selectedValue || cat.label}</span>
                  </Button>
                );
              }

              const rawVal = localFilters[cat.id as keyof FilterState];
              const selectedArray = Array.isArray(rawVal)
                ? rawVal
                : typeof rawVal === "string" && rawVal && !rawVal.startsWith("All")
                ? [rawVal]
                : [];

              const rawOptions = getCategoryOptions(cat.id);
              const optionsObj: MultiSelectOption[] = rawOptions
                .filter((opt) => !opt.startsWith("All"))
                .map((opt) => ({ value: opt, label: opt }));

              return (
                <Box key={cat.id} sx={{ minWidth: { xs: "100%", sm: 140 }, flexShrink: 0 }}>
                  <MultiSelect
                    placeholder={cat.label}
                    options={optionsObj}
                    value={selectedArray}
                    onChange={(newVals) => {
                      const updated = { ...localFilters, [cat.id]: newVals };
                      setLocalFilters(updated);
                      onFilterChange?.(updated);
                      if (cat.id === "department") {
                        onSelectDepartment?.(newVals[0] || "");
                      }
                    }}
                  />
                </Box>
              );
            })}
          </Box>

          {hasActiveFilters && (
            <Button
              onClick={handleResetFilters}
              size="small"
              startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
              sx={{
                height: 40,
                borderRadius: "10px",
                px: 1.5,
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "none",
                color: "#EF4444",
                backgroundColor: "#FEF2F2",
                whiteSpace: "nowrap",
                width: { xs: "100%", sm: "auto" },
                gridColumn: { xs: "span 3", sm: "auto" },
                "&:hover": {
                  backgroundColor: "#FEE2E2",
                },
              }}
            >
              Reset
            </Button>
          )}
        </Box>
      </Box>

      {/* In-Line Push-Down Filter Options Panel */}
      <Collapse in={Boolean(activeCategory)} timeout={250} unmountOnExit>
        <Box
          sx={{
            mt: 1.5,
            p: 2,
            borderRadius: "12px",
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
              }}
            >
              Filter by {activeCategoryObj?.label}
            </Typography>
            <IconButton
              size="small"
              onClick={handleCloseMenu}
              sx={{
                color: "#64748B",
                width: 24,
                height: 24,
                "&:hover": { backgroundColor: "#E2E8F0", color: "#0F172A" },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
            {activeOptions.map((option) => {
              const currentVal = localFilters[activeCategoryObj?.id as keyof FilterState];
              const isSelected =
                (option.startsWith("All") && !currentVal) || currentVal === option;

              return (
                <Chip
                  key={option}
                  label={option}
                  onClick={() => {
                    if (activeCategoryObj) {
                      if (activeCategoryObj.id === "dateOfJoining") {
                        const updated = {
                          ...localFilters,
                          dateOfJoining: option.startsWith("All") ? "" : option,
                          fromDate: "",
                          toDate: "",
                        };
                        setLocalFilters(updated);
                        onFilterChange?.(updated);
                        handleCloseMenu();
                      } else {
                        handleSelectOption(activeCategoryObj.id, option);
                      }
                    }
                  }}
                  clickable
                  sx={{
                    height: 32,
                    borderRadius: "8px",
                    px: 1,
                    fontSize: "13px",
                    fontWeight: isSelected ? 600 : 500,
                    backgroundColor: isSelected ? "#6D5DF6" : "#FFFFFF",
                    color: isSelected ? "#FFFFFF" : "#334155",
                    border: isSelected ? "1px solid #6D5DF6" : "1px solid #CBD5E1",
                    boxShadow: isSelected ? "0 2px 5px rgba(109, 93, 246, 0.25)" : "none",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      backgroundColor: isSelected ? "#5B4EB3" : "#F1F5F9",
                      borderColor: isSelected ? "#5B4EB3" : "#94A3B8",
                      color: isSelected ? "#FFFFFF" : "#0F172A",
                    },
                  }}
                />
              );
            })}

            {activeCategoryObj?.id === "dateOfJoining" && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: { xs: 0, sm: 1 }, flexWrap: "wrap" }}>
                <TextField
                  type="date"
                  size="small"
                  value={localFilters.fromDate || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const updated = { ...localFilters, fromDate: val, dateOfJoining: "Custom" };
                    setLocalFilters(updated);
                    onFilterChange?.(updated);
                  }}
                  sx={{
                    width: 145,
                    "& .MuiOutlinedInput-root": {
                      height: 32,
                      borderRadius: "8px",
                      backgroundColor: "#FFFFFF",
                      fontSize: "12px",
                      color: "#0F172A",
                      "& fieldset": { borderColor: localFilters.fromDate ? "#6D5DF6" : "#CBD5E1" },
                    },
                    "& .MuiOutlinedInput-input": { py: 0, height: 32, boxSizing: "border-box" },
                  }}
                />

                <Typography sx={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>to</Typography>

                <TextField
                  type="date"
                  size="small"
                  value={localFilters.toDate || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const updated = { ...localFilters, toDate: val, dateOfJoining: "Custom" };
                    setLocalFilters(updated);
                    onFilterChange?.(updated);
                  }}
                  sx={{
                    width: 145,
                    "& .MuiOutlinedInput-root": {
                      height: 32,
                      borderRadius: "8px",
                      backgroundColor: "#FFFFFF",
                      fontSize: "12px",
                      color: "#0F172A",
                      "& fieldset": { borderColor: localFilters.toDate ? "#6D5DF6" : "#CBD5E1" },
                    },
                    "& .MuiOutlinedInput-input": { py: 0, height: 32, boxSizing: "border-box" },
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

export default PeopleHubDepartmentTabs;

