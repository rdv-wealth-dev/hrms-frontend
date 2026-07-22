import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloseIcon from "@mui/icons-material/Close";

export interface FilterState {
  designation?: string;
  branch?: string;
  team?: string;
  dateOfJoining?: string;
  department?: string;
  status?: string;
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
  { id: "designation", label: "Designation", options: ["All Designations", "Senior Software Engineer", "Product Manager", "HR Business Partner", "UX Lead", "Account Executive", "Engineering Director"] },
  { id: "branch", label: "Branch", options: ["All Branches", "Head Office", "Bangalore Branch", "Mumbai Branch", "Hyderabad Branch", "Delhi Branch"] },
  { id: "team", label: "Team", options: ["All Teams", "Core Platform", "Product Design", "Talent Acquisition", "Enterprise Sales", "DevOps"] },
  { id: "department", label: "Departments", options: ["All Departments", "Engineering", "Product", "HR", "Sales", "Design", "Finance", "Marketing", "Operations"] },
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
          alignItems: "center",
          gap: 1.2,
          overflowX: "auto",
          py: 0.5,
          px: 0.5,
          maxWidth: "100%",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {searchElement}
        {CATEGORIES.map((cat) => {
          const selectedValue = localFilters[cat.id as keyof FilterState];
          const isSelected = Boolean(selectedValue);
          const isOpen = activeCategory === cat.id;

          return (
            <Button
              key={cat.id}
              onClick={() => handleToggleCategory(cat.id)}
              size="small"
              endIcon={
                cat.isDate ? (
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: isOpen ? "#6D5DF6" : "#64748B" }} />
                ) : (
                  <KeyboardArrowDownIcon
                    sx={{
                      fontSize: 18,
                      color: isOpen ? "#6D5DF6" : "#64748B",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                )
              }
              sx={{
                height: 40,
                borderRadius: "10px",
                px: 1.8,
                fontSize: "14px",
                fontWeight: isSelected || isOpen ? 600 : 500,
                textTransform: "none",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
                backgroundColor: isOpen ? "#EEF2FF" : "#FFFFFF",
                color: isSelected || isOpen ? "#0F172A" : "#475569",
                border: isOpen
                  ? "1.5px solid #6D5DF6"
                  : isSelected
                  ? "1px solid #6D5DF6"
                  : "1px solid #CBD5E1",
                boxShadow: isOpen ? "0 2px 6px rgba(109, 93, 246, 0.15)" : "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "space-between",
                minWidth: cat.isDate ? 145 : 125,
                "&:hover": {
                  backgroundColor: isOpen ? "#E0E7FF" : "#F8FAFC",
                  borderColor: isSelected || isOpen ? "#6D5DF6" : "#94A3B8",
                  color: "#0F172A",
                },
              }}
            >
              {selectedValue ? selectedValue : cat.label}
            </Button>
          );
        })}

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
              "&:hover": {
                backgroundColor: "#FEE2E2",
              },
            }}
          >
            Reset
          </Button>
        )}
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

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {activeOptions.map((option) => {
              const currentVal = localFilters[activeCategoryObj?.id as keyof FilterState];
              const isSelected =
                (option.startsWith("All") && !currentVal) || currentVal === option;

              return (
                <Chip
                  key={option}
                  label={option}
                  onClick={() =>
                    activeCategoryObj && handleSelectOption(activeCategoryObj.id, option)
                  }
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
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

export default PeopleHubDepartmentTabs;

