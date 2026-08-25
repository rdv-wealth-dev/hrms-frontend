import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import DeselectIcon from "@mui/icons-material/Deselect";
import type { SystemPermissionItem } from "@/api/role.api";

interface PermissionMatrixProps {
  permissions: SystemPermissionItem[];
  groupedByModule: Record<string, SystemPermissionItem[]>;
  selectedPermissions: string[];
  onChange: (newSelected: string[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

const ACTION_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  read: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  create: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  update: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  delete: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  approve: { bg: "#FAF5FF", color: "#7C3AED", border: "#E9D5FF" },
  run: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  verify: { bg: "#FDF2F8", color: "#DB2777", border: "#FBCFE8" },
};

const MODULE_TITLES: Record<string, string> = {
  employee: "Employee Management",
  attendance: "Attendance & Punch Clock",
  leave: "Leave & Time Off",
  payroll: "Payroll & Compensation",
  branch: "Branch & Locations",
  department: "Department Master",
  designation: "Designation Master",
  team: "Teams & Squads",
  org_tree: "Org Chart Hierarchy",
  role: "Roles & Permissions",
  report: "Reports & Analytics",
  settings: "Organization Settings",
};

export default function PermissionMatrix({
  permissions = [],
  groupedByModule = {},
  selectedPermissions = [],
  onChange,
  disabled = false,
  readOnly = false,
}: PermissionMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const selectedSet = useMemo(() => new Set(selectedPermissions), [selectedPermissions]);

  // Filter modules and permissions by search
  const filteredGrouped = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return groupedByModule;

    const result: Record<string, SystemPermissionItem[]> = {};
    Object.entries(groupedByModule).forEach(([mod, perms]) => {
      const matchingPerms = perms.filter(
        (p) =>
          p.description?.toLowerCase().includes(query) ||
          p.resource?.toLowerCase().includes(query) ||
          p.module?.toLowerCase().includes(query) ||
          p.action?.toLowerCase().includes(query)
      );
      if (matchingPerms.length > 0) {
        result[mod] = matchingPerms;
      }
    });
    return result;
  }, [groupedByModule, searchQuery]);

  const allFilteredResources = useMemo(() => {
    const list: string[] = [];
    Object.values(filteredGrouped).forEach((perms) => {
      perms.forEach((p) => list.push(p.resource));
    });
    return list;
  }, [filteredGrouped]);

  const isAllSelected =
    allFilteredResources.length > 0 &&
    allFilteredResources.every((res) => selectedSet.has(res));

  const handleToggleSingle = (resource: string) => {
    if (readOnly || disabled) return;
    const next = new Set(selectedPermissions);
    if (next.has(resource)) {
      next.delete(resource);
    } else {
      next.add(resource);
    }
    onChange(Array.from(next));
  };

  const handleToggleModule = (modulePerms: SystemPermissionItem[]) => {
    if (readOnly || disabled) return;
    const next = new Set(selectedPermissions);
    const modResources = modulePerms.map((p) => p.resource);
    const isModuleAllSelected = modResources.every((res) => next.has(res));

    if (isModuleAllSelected) {
      modResources.forEach((res) => next.delete(res));
    } else {
      modResources.forEach((res) => next.add(res));
    }
    onChange(Array.from(next));
  };

  const handleSelectAllGlobal = () => {
    if (readOnly || disabled) return;
    const next = new Set(selectedPermissions);
    allFilteredResources.forEach((res) => next.add(res));
    onChange(Array.from(next));
  };

  const handleDeselectAllGlobal = () => {
    if (readOnly || disabled) return;
    const next = new Set(selectedPermissions);
    allFilteredResources.forEach((res) => next.delete(res));
    onChange(Array.from(next));
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Top Controls Toolbar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 1.5,
          p: 1.5,
          borderRadius: "14px",
          backgroundColor: "#F8FAFC",
          border: "1px solid #E2E8F0",
        }}
      >
        <TextField
          size="small"
          placeholder="Filter permissions or modules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94A3B8", fontSize: 19 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            flexGrow: 1,
            maxWidth: { xs: "100%", sm: 360 },
            "& .MuiOutlinedInput-root": {
              height: 38,
              borderRadius: "10px",
              backgroundColor: "#FFFFFF",
              fontSize: "13.5px",
              "& fieldset": { borderColor: "#E2E8F0" },
              "&:hover fieldset": { borderColor: "#CBD5E1" },
              "&.Mui-focused fieldset": { borderColor: "#6D5DF6", borderWidth: "2px" },
            },
          }}
        />

        {!readOnly && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleSelectAllGlobal}
              disabled={disabled || isAllSelected}
              startIcon={<SelectAllIcon fontSize="small" />}
              sx={{
                textTransform: "none",
                fontSize: "12.5px",
                fontWeight: 600,
                borderRadius: "8px",
                borderColor: "#CBD5E1",
                color: "#334155",
                "&:hover": { borderColor: "#6D5DF6", backgroundColor: "rgba(109, 93, 246, 0.04)" },
              }}
            >
              Select All
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={handleDeselectAllGlobal}
              disabled={disabled || selectedPermissions.length === 0}
              startIcon={<DeselectIcon fontSize="small" />}
              sx={{
                textTransform: "none",
                fontSize: "12.5px",
                fontWeight: 600,
                borderRadius: "8px",
                borderColor: "#CBD5E1",
                color: "#64748B",
                "&:hover": { borderColor: "#EF4444", color: "#EF4444", backgroundColor: "rgba(239, 68, 68, 0.04)" },
              }}
            >
              Clear
            </Button>
          </Box>
        )}
      </Box>

      {/* Permissions Summary Badge */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 0.5 }}>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>
          Selected Permissions:
        </Typography>
        <Chip
          label={`${selectedPermissions.length} of ${permissions.length || 36} selected`}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "12px",
            backgroundColor: selectedPermissions.length > 0 ? "rgba(109, 93, 246, 0.1)" : "#F1F5F9",
            color: selectedPermissions.length > 0 ? "#6D5DF6" : "#64748B",
            border: `1px solid ${selectedPermissions.length > 0 ? "rgba(109, 93, 246, 0.25)" : "#E2E8F0"}`,
          }}
        />
      </Box>

      {/* Modules Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(2, 1fr)" },
          gap: 2,
        }}
      >
        {Object.entries(filteredGrouped).map(([moduleKey, modPerms]) => {
          const modResources = modPerms.map((p) => p.resource);
          const selectedInModCount = modResources.filter((r) => selectedSet.has(r)).length;
          const isModAllSelected = modResources.length > 0 && selectedInModCount === modResources.length;
          const isModIndeterminate = selectedInModCount > 0 && selectedInModCount < modResources.length;

          return (
            <Box
              key={moduleKey}
              sx={{
                borderRadius: "14px",
                border: "1px solid",
                borderColor: selectedInModCount > 0 ? "#DAD7F2" : "#E2E8F0",
                backgroundColor: selectedInModCount > 0 ? "#FAFAFE" : "#FFFFFF",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                transition: "all 0.2s ease",
                overflow: "hidden",
              }}
            >
              {/* Module Header Card */}
              <Box
                sx={{
                  px: 2,
                  py: 1.2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: selectedInModCount > 0 ? "rgba(109, 93, 246, 0.05)" : "#F8FAFC",
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {!readOnly && (
                    <Checkbox
                      size="small"
                      checked={isModAllSelected}
                      indeterminate={isModIndeterminate}
                      onChange={() => handleToggleModule(modPerms)}
                      disabled={disabled}
                      sx={{
                        p: 0.5,
                        color: "#94A3B8",
                        "&.Mui-checked": { color: "#6D5DF6" },
                        "&.MuiCheckbox-indeterminate": { color: "#6D5DF6" },
                      }}
                    />
                  )}
                  <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
                    {MODULE_TITLES[moduleKey] || moduleKey.toUpperCase()}
                  </Typography>
                </Box>
                <Chip
                  label={`${selectedInModCount}/${modPerms.length}`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: selectedInModCount > 0 ? "#6D5DF6" : "#E2E8F0",
                    color: selectedInModCount > 0 ? "#FFFFFF" : "#64748B",
                  }}
                />
              </Box>

              {/* Module Actions / Permissions List */}
              <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
                {modPerms.map((perm) => {
                  const isChecked = selectedSet.has(perm.resource);
                  const actionStyle = ACTION_COLORS[perm.action] || {
                    bg: "#F1F5F9",
                    color: "#475569",
                    border: "#E2E8F0",
                  };

                  return (
                    <Box
                      key={perm.resource}
                      onClick={() => !readOnly && !disabled && handleToggleSingle(perm.resource)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 1.2,
                        py: 0.8,
                        borderRadius: "10px",
                        backgroundColor: isChecked ? "rgba(109, 93, 246, 0.05)" : "transparent",
                        border: "1px solid",
                        borderColor: isChecked ? "rgba(109, 93, 246, 0.2)" : "transparent",
                        cursor: readOnly || disabled ? "default" : "pointer",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          backgroundColor: readOnly || disabled ? undefined : "rgba(109, 93, 246, 0.08)",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {!readOnly && (
                          <Checkbox
                            size="small"
                            checked={isChecked}
                            onChange={() => handleToggleSingle(perm.resource)}
                            disabled={disabled}
                            sx={{
                              p: 0.2,
                              color: "#CBD5E1",
                              "&.Mui-checked": { color: "#6D5DF6" },
                            }}
                          />
                        )}
                        <Box>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: isChecked ? 600 : 500,
                              color: isChecked ? "#0F172A" : "#475569",
                              lineHeight: 1.3,
                            }}
                          >
                            {perm.description || perm.resource}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "11px",
                              color: "#94A3B8",
                              fontFamily: "monospace",
                            }}
                          >
                            {perm.resource}
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        label={perm.action.toUpperCase()}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "10px",
                          fontWeight: 700,
                          backgroundColor: actionStyle.bg,
                          color: actionStyle.color,
                          border: `1px solid ${actionStyle.border}`,
                          flexShrink: 0,
                          ml: 1,
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>

      {Object.keys(filteredGrouped).length === 0 && (
        <Box sx={{ p: 4, textAlign: "center", backgroundColor: "#F8FAFC", borderRadius: "12px", border: "1px dashed #CBD5E1" }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#64748B" }}>
            No permissions matching "{searchQuery}"
          </Typography>
        </Box>
      )}
    </Box>
  );
}
