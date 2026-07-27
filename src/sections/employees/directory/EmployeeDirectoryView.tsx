import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import { paths } from "../../../routes/paths";
import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import { listEmployeesRequest } from "../../../store/employee";
import { useDebounce } from "../../../hooks/useDebounce";
import { usePermissions } from "../../../hooks/usePermissions";

import { PeopleHubKpiCards } from "../employee-list/components/PeopleHubKpiCards";
import { PeopleHubDepartmentTabs, type FilterState } from "../employee-list/components/PeopleHubDepartmentTabs";
import { ViewModeSwitcher } from "../employee-list/components/ViewModeSwitcher";
import { EmployeeDirectoryCardGrid } from "./components/EmployeeDirectoryCardGrid";

function EmployeeDirectoryView() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("employee.create");

  const {
    employees = [],
    loading,
    total = 0,
  } = useSelector((state: RootState) => state.employee);

  const departments = useSelector(
    (state: RootState) => state.department?.departments ?? []
  );
  const designations = useSelector(
    (state: RootState) => state.designation?.designations ?? []
  );
  const branches = useSelector(
    (state: RootState) => (state as any).branch?.branches ?? []
  );

  const departmentsList = useMemo(() => {
    const names = new Set<string>();
    departments.forEach((d) => d?.name && names.add(d.name));
    employees.forEach((e) => {
      const deptObj = typeof e.departmentId === "object" ? (e.departmentId as any) : null;
      if (deptObj?.name) names.add(deptObj.name);
    });
    return ["All Departments", ...Array.from(names)];
  }, [departments, employees]);

  const designationsList = useMemo(() => {
    const names = new Set<string>();
    designations.forEach((d) => d?.name && names.add(d.name));
    employees.forEach((e) => {
      const desigObj = typeof e.designationId === "object" ? (e.designationId as any) : null;
      if (desigObj?.name) names.add(desigObj.name);
    });
    return ["All Designations", ...Array.from(names)];
  }, [designations, employees]);

  const branchesList = useMemo(() => {
    const names = new Set<string>();
    branches.forEach((b: any) => b?.name && names.add(b.name));
    employees.forEach((e) => {
      const branchObj = typeof (e as any).branchId === "object" ? ((e as any).branchId as any) : null;
      if (branchObj?.name) names.add(branchObj.name);
    });
    return ["All Branches", ...Array.from(names)];
  }, [branches, employees]);

  const teamsList = useMemo(() => {
    const names = new Set<string>();
    employees.forEach((e) => {
      const t = (e as any).team;
      if (t) names.add(t);
    });
    if (names.size === 0) {
      return ["All Teams", "Core Platform", "Product Design", "Talent Acquisition", "Enterprise Sales", "DevOps"];
    }
    return ["All Teams", ...Array.from(names)];
  }, [employees]);

  const statusesList = [
    "All Statuses",
    "Active",
    "Inactive",
    "On Leave",
    "Terminated",
    "Resigned",
  ];

  const [searchVal, setSearchVal] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const debouncedSearchVal = useDebounce(searchVal, 500);

  useEffect(() => {
    dispatch(
      listEmployeesRequest({
        pageNumber: 1,
        pageSize: 50,
        search: debouncedSearchVal,
      })
    );
  }, [dispatch, debouncedSearchVal]);

  const displayedEmployees = employees.filter((emp) => {
    // 1. Department Filter
    const activeDept = filters.department || selectedDeptFilter;
    if (activeDept) {
      const deptObj = typeof emp.departmentId === "object" ? (emp.departmentId as any) : null;
      const deptName = deptObj?.name || "";
      if (!deptName.toLowerCase().includes(activeDept.toLowerCase())) {
        return false;
      }
    }

    // 2. Designation Filter
    if (filters.designation) {
      const desigObj = typeof emp.designationId === "object" ? (emp.designationId as any) : null;
      const desigName = desigObj?.name || "";
      if (!desigName.toLowerCase().includes(filters.designation.toLowerCase())) {
        return false;
      }
    }

    // 3. Branch Filter
    if (filters.branch) {
      const branchObj = typeof (emp as any).branchId === "object" ? ((emp as any).branchId as any) : null;
      const branchName = branchObj?.name || "";
      if (branchName && !branchName.toLowerCase().includes(filters.branch.toLowerCase())) {
        return false;
      }
    }

    // 4. Team Filter
    if (filters.team) {
      const empTeam = (emp as any).team || "";
      const deptObj = typeof emp.departmentId === "object" ? (emp.departmentId as any) : null;
      const deptName = deptObj?.name || "";
      const matchesTeam =
        empTeam.toLowerCase().includes(filters.team.toLowerCase()) ||
        deptName.toLowerCase().includes(filters.team.toLowerCase());
      if (!matchesTeam) {
        return false;
      }
    }

    // 5. Status Filter
    if (filters.status) {
      const targetStatus = filters.status.toUpperCase();
      const empStatus = (emp.status || "").toUpperCase();
      if (targetStatus === "ACTIVE" && empStatus !== "ACTIVE") return false;
      if (targetStatus === "PROBATION" && !empStatus.includes("PROBATION")) return false;
      if (targetStatus === "NOTICE" && !empStatus.includes("NOTICE")) return false;
      if (targetStatus === "INACTIVE" && empStatus !== "INACTIVE") return false;
      if (targetStatus === "ON_LEAVE" && empStatus !== "ON_LEAVE") return false;
    }

    // 6. Date of Joining Filter
    if (filters.dateOfJoining) {
      const joinDateStr = (emp as any).joiningDate || (emp as any).dateOfJoining || emp.createdAt;
      if (joinDateStr) {
        const joinDate = new Date(joinDateStr);
        const now = new Date();
        if (!isNaN(joinDate.getTime())) {
          if (filters.dateOfJoining === "This Month") {
            const sameMonth =
              joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
            if (!sameMonth) return false;
          } else if (filters.dateOfJoining === "Last 3 Months") {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            if (joinDate < threeMonthsAgo) return false;
          } else if (filters.dateOfJoining === "Last 6 Months") {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            if (joinDate < sixMonthsAgo) return false;
          } else if (filters.dateOfJoining === "This Year") {
            if (joinDate.getFullYear() !== now.getFullYear()) return false;
          }
        }
      }
    }

    return true;
  });

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Top Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mb: 2.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PeopleAltOutlinedIcon sx={{ fontSize: 32, color: "#6D5DF6" }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
                All Employees
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {total > 0
                  ? `Showing ${displayedEmployees.length} of ${total} employee records`
                  : "Manage employee directory, profiles, and assignments"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <ViewModeSwitcher
              viewMode="directory"
              onChange={(mode) => {
                if (mode === "people_hub" || mode === "classic") {
                  localStorage.setItem("employee_view_mode", mode);
                  navigate(paths.employees.list);
                }
              }}
            />

            {canCreate && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon sx={{ fontSize: 20 }} />}
                onClick={() => navigate(paths.employees.create)}
                sx={{
                  height: 40,
                  borderRadius: "10px",
                  textTransform: "none",
                  backgroundColor: "#6D5DF6",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "14px",
                  px: 2.5,
                  boxSizing: "border-box",
                  boxShadow: "0 2px 8px rgba(109, 93, 246, 0.25)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  "&:hover": {
                    backgroundColor: "#5B4BEA",
                    boxShadow: "0 4px 12px rgba(109, 93, 246, 0.35)",
                  },
                }}
              >
                Add Employee
              </Button>
            )}
          </Box>
        </Box>

        {/* Metric KPI Summary Cards */}
        <PeopleHubKpiCards
          employees={employees}
          totalEmployees={total || employees.length}
        />

        {/* Single Line Toolbar & Filter Tabs Directly Above Cards */}
        <PeopleHubDepartmentTabs
          filters={filters}
          searchElement={
            <TextField
              size="small"
              placeholder="Search employees..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
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
                width: { xs: 180, sm: 210 },
                flexShrink: 0,
                "& .MuiOutlinedInput-root": {
                  height: 40,
                  borderRadius: "10px",
                  backgroundColor: "#FFFFFF",
                  fontSize: "14px",
                  color: "#0F172A",
                  "& fieldset": { borderColor: "#E2E8F0" },
                  "&:hover fieldset": { borderColor: "#CBD5E1" },
                  "&.Mui-focused fieldset": { borderColor: "#6D5DF6" },
                },
                "& .MuiOutlinedInput-input": {
                  py: 0,
                  height: 40,
                  fontSize: "14px",
                  boxSizing: "border-box",
                  color: "#0F172A",
                  "&::placeholder": {
                    color: "#94A3B8",
                    opacity: 1,
                  },
                },
              }}
            />
          }
          departmentsList={departmentsList}
          designationsList={designationsList}
          branchesList={branchesList}
          teamsList={teamsList}
          statusesList={statusesList}
          selectedDepartment={selectedDeptFilter}
          onSelectDepartment={setSelectedDeptFilter}
          onFilterChange={(newFilters) => {
            setFilters(newFilters);
            if (newFilters.department !== undefined) {
              setSelectedDeptFilter(newFilters.department);
            }
          }}
        />

        {/* Card Grid Design View */}
        {loading && displayedEmployees.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress sx={{ color: "#6D5DF6" }} />
          </Box>
        ) : (
          <EmployeeDirectoryCardGrid
            employees={displayedEmployees}
            onSelectEmployee={(emp) => navigate(`/employees/${emp._id}`)}
          />
        )}
      </Box>
    </DashboardLayout>
  );
}

export default EmployeeDirectoryView;