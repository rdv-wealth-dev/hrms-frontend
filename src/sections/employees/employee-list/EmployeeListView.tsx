import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import AddIcon from "@mui/icons-material/Add";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SearchIcon from "@mui/icons-material/Search";

import { paths } from "../../../routes/paths";
import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import CreditCompOffDialog from "../../leave/components/CreditCompOffDialog";
import {
  listEmployeesRequest,
  clearEmployeeError,
  updateEmployeeStatusRequest,
} from "../../../store/employee";
import type { EmployeeListItem } from "../../../store/employee/employee.types";
import { listDepartmentsRequest } from "../../../store/department";
import { listDesignationsRequest } from "../../../store/designation";
import { listBranchesRequest } from "../../../store/branch";
import EmployeeEditDialog from "../employee-edit/EmployeeEditDialog";
import { usePermissions } from "../../../hooks/usePermissions";
import { useDebounce } from "../../../hooks/useDebounce";
import { usePagination } from "../../../hooks/usePagination";
import ManualAttendanceDialog from "../../attendance/components/ManualAttendanceDialog";
import ManageRoleDialog from "./components/ManageRoleDialog";
import { listUsers, type UserAccountData } from "../../../api/user.api";
import { deleteEmployee, bulkExportEmployees } from "../../../api/employee.api";
import { ConfirmDialog } from "../../../components/modal";
import CustomTablePagination from "../../../components/pagination";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import BulkImportDialog from "./components/BulkImportDialog";

// People Hub Dual Design Components
import { ViewModeSwitcher, type ViewMode } from "./components/ViewModeSwitcher";
import { PeopleHubKpiCards } from "./components/PeopleHubKpiCards";
import { PeopleHubDepartmentTabs, type FilterState } from "./components/PeopleHubDepartmentTabs";
import { PeopleHubTableView } from "./components/PeopleHubTableView";
import { OrganizationChart } from "../directory/components/OrganizationChart";

const getFilterString = (val: string | string[] | undefined): string =>
  Array.isArray(val) ? val[0] ?? "" : val ?? "";

function EmployeeListView() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem("employee_view_mode") as ViewMode) || "people_hub";
  });

  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("");

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("employee_view_mode", mode);
  };

  const { 
    employees = [], 
    loading, 
    error, 
    total = 0, 
    pageNumber: initialPageNumber = 1, 
    pageSize: initialPageSize = 10, 
    search, 
    status 
  } = useSelector((state: RootState) => state.employee);

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("employee.create");
  const canUpdate = hasPermission("employee.update");
  const canManageRoles = hasPermission("role.update");
  const canReadRoles = hasPermission("role.read");
  const canDelete = hasPermission("employee.delete");
  const canReadBranches = hasPermission("branch.read");

  const {
    pageNumber,
    pageSize,
    handlePageChange,
    handleRowsPerPageChange,
    setPageNumber,
  } = usePagination({
    initialPage: initialPageNumber,
    initialPageSize: initialPageSize,
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EmployeeListItem | null>(null);
  const [searchVal, setSearchVal] = useState(search || "");

  const [compOffOpen, setCompOffOpen] = useState(false);
  const [compOffTarget, setCompOffTarget] = useState<EmployeeListItem | null>(null);
  const [compOffSuccess, setCompOffSuccess] = useState<string | null>(null);
  const [statusVal, setStatusVal] = useState(status || "");

  const debouncedSearchVal = useDebounce(searchVal, 500);

  const [statusMenuAnchor, setStatusMenuAnchor] = useState<HTMLElement | null>(null);
  const [statusMenuTarget, setStatusMenuTarget] = useState<EmployeeListItem | null>(null);

  const [manualOpen, setManualOpen] = useState(false);
  const [manualTarget, setManualTarget] = useState<EmployeeListItem | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<EmployeeListItem | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeListItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Extract org/tenant slug
  const orgSlug = useSelector((state: RootState) => state.organization?.organization?.slug);
  const tenantSlug = orgSlug || window.location.hostname.split(".")[0];

  const handleExport = async (format: "csv" | "xlsx") => {
    setExportAnchorEl(null);
    setExportLoading(true);
    try {
      // Find database ObjectIDs of selected filter names if they are loaded
      let branchId: string | undefined = undefined;
      let departmentId: string | undefined = undefined;

      // Map filter names to database IDs
      if (filters.branch && filters.branch !== "All Branches") {
        const found = branches.find((b: any) => b.name === filters.branch || (b as any).branchName === filters.branch);
        if (found) branchId = found._id;
      }
      if (filters.department && filters.department !== "All Departments") {
        const found = departments.find((d: any) => d.name === filters.department);
        if (found) departmentId = found._id;
      }

      const activeStatus = getFilterString(filters.status) || statusVal;
      let backendStatus: string | undefined = undefined;
      if (activeStatus && activeStatus !== "All Statuses") {
        const upper = activeStatus.toUpperCase();
        if (["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED", "RESIGNED"].includes(upper)) {
          backendStatus = upper;
        }
      }

      const response = await bulkExportEmployees(
        {
          format,
          branchId,
          departmentId,
          status: backendStatus,
        },
        tenantSlug
      );

      if (response?.succeeded && response?.data) {
        const { fileName, mimeType, fileData } = response.data;
        if (!fileData) {
          throw new Error("No file data received from server.");
        }

        // 1. Convert base64 data to binary bytes
        const byteCharacters = atob(fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        // 2. Create a blob object
        const blob = new Blob([byteArray], { type: mimeType });

        // 3. Create dynamic link element and trigger download
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
      } else {
        alert(response?.message || "Failed to generate export file.");
      }
    } catch (err: any) {
      console.error("Export failed", err);
      alert(err?.message || "Failed to export employee records. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const [_usersList, setUsersList] = useState<UserAccountData[]>([]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    setDeleteSuccess(null);
    try {
      const res = await deleteEmployee(deleteTarget._id);
      if (res.succeeded) {
        setDeleteSuccess(res.message || "Employee deleted successfully");
        setDeleteOpen(false);
        setDeleteTarget(null);
        // Refresh the list
        dispatch(listEmployeesRequest({ pageNumber, pageSize, search: debouncedSearchVal, status }));
      } else {
        setDeleteError(res.message || "Failed to delete employee");
      }
    } catch (err: any) {
      setDeleteError(
        err.response?.data?.message || err.message || "Something went wrong while deleting employee"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchUsersList = async () => {
    try {
      const users = await listUsers();
      setUsersList(users);
    } catch (err) {
      console.error("Failed to fetch users for system roles", err);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (statusMenuTarget?._id) {
      dispatch(updateEmployeeStatusRequest(statusMenuTarget._id, newStatus));
    }
    setStatusMenuAnchor(null);
    setStatusMenuTarget(null);
  };

  const departments = useSelector(
    (state: RootState) => state.department?.departments ?? []
  );
  const designations = useSelector(
    (state: RootState) => state.designation?.designations ?? []
  );
  const branches = useSelector(
    (state: RootState) => (state as any).branch?.branches ?? []
  );

  // Fetch initial setup data
  useEffect(() => {
    if (departments.length === 0) {
      dispatch(listDepartmentsRequest());
    }
    if (designations.length === 0) {
      dispatch(listDesignationsRequest({ pageNumber: 1, pageSize: 50 }));
    }
    if (branches.length === 0 && canReadBranches) {
      dispatch(listBranchesRequest());
    }
    dispatch(clearEmployeeError());
  }, [dispatch, departments.length, designations.length, branches.length, canReadBranches]);

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

  const [filters, setFilters] = useState<FilterState>({});

  const mapJoiningPeriodToBackend = (label?: string): string | undefined => {
    if (!label) return undefined;
    switch (label) {
      case "This Month":
        return "this_month";
      case "Last 3 Months":
        return "last_3_months";
      case "Last 6 Months":
        return "last_6_months";
      case "Last Year":
      case "This Year":
        return "last_year";
      default:
        return undefined;
    }
  };

  // Fetch users list for system roles if permitted
  useEffect(() => {
    if (canReadRoles) {
      fetchUsersList();
    }
  }, [canReadRoles]);

  // Sync page state and fetch data safely with Zod enum validation mapping
  useEffect(() => {
    let backendStatus: string | undefined = undefined;
    const effectiveStatus = getFilterString(filters.status) || statusVal;
    if (effectiveStatus) {
      const upper = effectiveStatus.toUpperCase();
      if (["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED", "RESIGNED"].includes(upper)) {
        backendStatus = upper;
      }
    }

    const joiningPeriod = mapJoiningPeriodToBackend(filters.dateOfJoining);

    let branchId: string | undefined = undefined;
    let departmentId: string | undefined = undefined;
    let designationId: string | undefined = undefined;

    if (filters.branch && filters.branch !== "All Branches") {
      const found = branches.find((b: any) => b.name === filters.branch || (b as any).branchName === filters.branch);
      if (found) branchId = found._id;
    }
    if (filters.department && filters.department !== "All Departments") {
      const found = departments.find((d: any) => d.name === filters.department);
      if (found) departmentId = found._id;
    }
    if (filters.designation && filters.designation !== "All Designations") {
      const found = designations.find((d: any) => d.name === filters.designation);
      if (found) designationId = found._id;
    }

    dispatch(
      listEmployeesRequest({
        pageNumber,
        pageSize,
        search: debouncedSearchVal,
        status: backendStatus,
        joiningPeriod,
        branchId,
        departmentId,
        designationId,
      })
    );
  }, [
    dispatch,
    pageNumber,
    pageSize,
    debouncedSearchVal,
    statusVal,
    filters.status,
    filters.dateOfJoining,
    filters.branch,
    filters.department,
    filters.designation,
    branches,
    departments,
    designations,
  ]);

  // Reset to first page when search filter or status changes
  useEffect(() => {
    setPageNumber(1);
  }, [
    debouncedSearchVal,
    statusVal,
    filters.status,
    filters.dateOfJoining,
    filters.branch,
    filters.department,
    filters.designation,
    setPageNumber,
  ]);

  const displayedEmployees = employees.filter((emp) => {
    // 1. Branch Multi-Select Filter
    const selectedBranches = Array.isArray(filters.branch)
      ? filters.branch
      : typeof filters.branch === "string" && filters.branch && filters.branch !== "All Branches"
      ? [filters.branch]
      : [];
    if (selectedBranches.length > 0) {
      const empBranchObj = typeof (emp as any).branchId === "object" ? ((emp as any).branchId as any) : null;
      const empBranchName = empBranchObj?.name || "";
      const matchesBranch = selectedBranches.some(
        (b) => b === empBranchName || (branches.find((bObj: any) => bObj.name === b)?._id === (emp.branchId as any))
      );
      if (!matchesBranch) return false;
    }

    // 2. Department Multi-Select Filter
    const selectedDepts = Array.isArray(filters.department)
      ? filters.department
      : typeof filters.department === "string" && filters.department && filters.department !== "All Departments"
      ? [filters.department]
      : [];
    if (selectedDepts.length > 0) {
      const empDeptObj = typeof emp.departmentId === "object" ? (emp.departmentId as any) : null;
      const empDeptName = empDeptObj?.name || "";
      const matchesDept = selectedDepts.some(
        (d) => d === empDeptName || (departments.find((dObj: any) => dObj.name === d)?._id === (emp.departmentId as any))
      );
      if (!matchesDept) return false;
    }

    // 3. Designation Multi-Select Filter
    const selectedDesigs = Array.isArray(filters.designation)
      ? filters.designation
      : typeof filters.designation === "string" && filters.designation && filters.designation !== "All Designations"
      ? [filters.designation]
      : [];
    if (selectedDesigs.length > 0) {
      const empDesigObj = typeof emp.designationId === "object" ? (emp.designationId as any) : null;
      const empDesigName = empDesigObj?.name || "";
      const matchesDesig = selectedDesigs.some(
        (d) => d === empDesigName || (designations.find((dObj: any) => dObj.name === d)?._id === (emp.designationId as any))
      );
      if (!matchesDesig) return false;
    }

    // 4. Team Multi-Select Filter
    const selectedTeams = Array.isArray(filters.team)
      ? filters.team
      : typeof filters.team === "string" && filters.team && filters.team !== "All Teams"
      ? [filters.team]
      : [];
    if (selectedTeams.length > 0) {
      const empTeam = ((emp as any).team || "").toLowerCase();
      const deptObj = typeof emp.departmentId === "object" ? (emp.departmentId as any) : null;
      const deptName = (deptObj?.name || "").toLowerCase();
      const matchesTeam = selectedTeams.some(
        (t) => empTeam.includes(t.toLowerCase()) || deptName.includes(t.toLowerCase())
      );
      if (!matchesTeam) return false;
    }

    // 5. Status Multi-Select Filter
    const rawStatus = filters.status || statusVal;
    const selectedStatuses = Array.isArray(rawStatus)
      ? rawStatus
      : typeof rawStatus === "string" && rawStatus && rawStatus !== "All Statuses"
      ? [rawStatus]
      : [];
    if (selectedStatuses.length > 0) {
      const empStatus = (emp.status || "").toUpperCase();
      const matchesStatus = selectedStatuses.some((st) => {
        const target = st.toUpperCase().replace(/\s+/g, "_");
        if (target === "ACTIVE") return empStatus === "ACTIVE";
        if (target === "INACTIVE") return empStatus === "INACTIVE";
        if (target === "ON_LEAVE" || target === "ON LEAVE") return empStatus === "ON_LEAVE";
        return empStatus.includes(target);
      });
      if (!matchesStatus) return false;
    }

    // 6. Date of Joining Filter (Presets & Custom Date Range)
    if (filters.fromDate || filters.toDate) {
      const rawJoinDate = emp.joiningDate || (emp as any).dateOfJoining || emp.createdAt;
      if (rawJoinDate) {
        const joinDate = new Date(rawJoinDate);
        if (!isNaN(joinDate.getTime())) {
          if (filters.fromDate) {
            const fromD = new Date(filters.fromDate);
            fromD.setHours(0, 0, 0, 0);
            if (joinDate < fromD) return false;
          }
          if (filters.toDate) {
            const toD = new Date(filters.toDate);
            toD.setHours(23, 59, 59, 999);
            if (joinDate > toD) return false;
          }
        }
      }
    } else if (filters.dateOfJoining) {
      const rawJoinDate = emp.joiningDate || (emp as any).dateOfJoining || emp.createdAt;
      if (rawJoinDate) {
        const joinDate = new Date(rawJoinDate);
        const now = new Date();
        if (!isNaN(joinDate.getTime())) {
          const filterVal = filters.dateOfJoining.trim();
          if (filterVal === "This Month") {
            const sameMonth =
              joinDate.getFullYear() === now.getFullYear() &&
              joinDate.getMonth() === now.getMonth();
            if (!sameMonth) return false;
          } else if (filterVal === "Last 3 Months") {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            if (joinDate < threeMonthsAgo) return false;
          } else if (filterVal === "Last 6 Months") {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            if (joinDate < sixMonthsAgo) return false;
          } else if (filterVal === "Last Year" || filterVal === "This Year") {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(now.getFullYear() - 1);
            if (joinDate < oneYearAgo) return false;
          }
        }
      }
    }

    return true;
  });

  return (
    <>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Top Page Header (Icon + All Employees Title + Record Count Subtitle & Employee Directory Button) */}
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
            <PeopleAltOutlinedIcon sx={{ fontSize: 32, color: "primary.main" }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
                All Employees
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {total > 0
                  ? `Showing ${displayedEmployees.length} of ${total} employee records`
                  : "Manage employee accounts, details, and assignments"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            {/* Export Button */}
            <Button
              variant="outlined"
              size="small"
              disabled={exportLoading}
              startIcon={exportLoading ? <CircularProgress size={16} color="inherit" /> : <DownloadOutlinedIcon sx={{ fontSize: 20 }} />}
              endIcon={<KeyboardArrowDownIcon />}
              onClick={(e) => setExportAnchorEl(e.currentTarget)}
              sx={{
                height: 40,
                borderRadius: "10px",
                textTransform: "none",
                borderColor: "divider",
                color: "text.secondary",
                fontWeight: 600,
                fontSize: "14px",
                px: 2.5,
                boxSizing: "border-box",
                whiteSpace: "nowrap",
                flexShrink: 0,
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "action.hover",
                },
              }}
            >
              {exportLoading ? "Exporting..." : "Export"}
            </Button>

            {/* Export Format Popover Menu */}
            <Menu
              anchorEl={exportAnchorEl}
              open={Boolean(exportAnchorEl)}
              onClose={() => setExportAnchorEl(null)}
              slotProps={{
                paper: {
                  elevation: 3,
                  sx: { borderRadius: "12px", minWidth: 160, p: 0.5, mt: 0.5 },
                },
              }}
            >
              <MenuItem onClick={() => handleExport("csv")} sx={{ fontSize: "14px", fontWeight: 500 }}>
                Export as CSV (.csv)
              </MenuItem>
              <MenuItem onClick={() => handleExport("xlsx")} sx={{ fontSize: "14px", fontWeight: 500 }}>
                Export as Excel (.xlsx)
              </MenuItem>
            </Menu>

            {/* Import Button */}
            {canCreate && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<UploadOutlinedIcon sx={{ fontSize: 20 }} />}
                onClick={() => setImportOpen(true)}
                sx={{
                  height: 40,
                  borderRadius: "10px",
                  textTransform: "none",
                  borderColor: "primary.main",
                  color: "primary.main",
                  fontWeight: 600,
                  fontSize: "14px",
                  px: 2.5,
                  boxSizing: "border-box",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  "&:hover": {
                    borderColor: "primary.dark",
                    backgroundColor: "primary.lighter",
                  },
                }}
              >
                Import
              </Button>
            )}

            {/* Design View Switcher Pill (Right side of Import button) */}
            <ViewModeSwitcher viewMode={viewMode} onChange={handleViewModeChange} />

            {/* Add Employee Button */}
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
                  backgroundColor: "primary.main",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "14px",
                  px: 2.5,
                  boxSizing: "border-box",
                  boxShadow: "0 2px 8px rgba(109, 93, 246, 0.25)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  "&:hover": {
                    backgroundColor: "primary.dark",
                    boxShadow: "0 4px 12px rgba(109, 93, 246, 0.35)",
                  },
                }}
              >
                Add Employee
              </Button>
            )}
          </Box>
        </Box>

        {/* Top KPI Metric Summary Cards (People Hub View) */}
        {viewMode === "people_hub" && (
          <PeopleHubKpiCards
            employees={employees}
            totalEmployees={total || employees.length}
          />
        )}

        {/* Single Line Unified Toolbar (Search + Category Filters) Directly Above Cards */}
        <PeopleHubDepartmentTabs
          canReadBranches={canReadBranches}
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
                  backgroundColor: "background.paper",
                  fontSize: "14px",
                  color: "text.primary",
                  "& fieldset": { borderColor: "divider" },
                  "&:hover fieldset": { borderColor: "primary.main" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main" },
                },
                "& .MuiOutlinedInput-input": {
                  py: 0,
                  height: 40,
                  fontSize: "14px",
                  boxSizing: "border-box",
                  color: "text.primary",
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
              setSelectedDeptFilter(getFilterString(newFilters.department));
            }
            if (newFilters.status !== undefined) {
              setStatusVal(getFilterString(newFilters.status));
            }
          }}
        />

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => dispatch(clearEmployeeError())}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {deleteError && (
          <Alert
            severity="error"
            onClose={() => setDeleteError(null)}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {deleteError}
          </Alert>
        )}

        {deleteSuccess && (
          <Alert
            severity="success"
            onClose={() => setDeleteSuccess(null)}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {deleteSuccess}
          </Alert>
        )}

        {compOffSuccess && (
          <Alert
            severity="success"
            onClose={() => setCompOffSuccess(null)}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {compOffSuccess}
          </Alert>
        )}

        {/* Conditional View Rendering: Org Chart vs Table View (People Hub) */}
        {viewMode === "org_chart" ? (
          <Box sx={{ mt: 1 }}>
            <OrganizationChart />
          </Box>
        ) : (
          <Card sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", position: "relative" }}>
            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  zIndex: 10,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress sx={{ color: "primary.main" }} />
              </Box>
            )}
            <PeopleHubTableView
              employees={displayedEmployees}
              loading={loading}
              canUpdate={canUpdate}
              canDelete={canDelete}
              canManageRoles={canManageRoles}
              onEdit={(emp) => {
                setEditTarget(emp);
                setEditOpen(true);
              }}
              onDelete={(emp) => {
                setDeleteTarget(emp);
                setDeleteOpen(true);
              }}
              onRoleManage={(emp) => {
                setRoleTarget(emp);
                setRoleOpen(true);
              }}
              onCompOffCredit={(emp) => {
                setCompOffTarget(emp);
                setCompOffOpen(true);
              }}
              onManualAttendance={(emp) => {
                setManualTarget(emp);
                setManualOpen(true);
              }}
              onSelectEmployee={(emp) => {
                navigate(paths.employees.detail.replace(":id", emp._id));
              }}
            />
            <CustomTablePagination
              count={total}
              rowsPerPage={pageSize}
              page={pageNumber}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </Card>
        )}
      </Box>

      {editOpen && (
        <EmployeeEditDialog
          open={editOpen}
          employee={editTarget}
          onClose={() => {
            setEditOpen(false);
            setEditTarget(null);
          }}
        />
      )}

      {/* Status Change Popover Menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={() => {
          setStatusMenuAnchor(null);
          setStatusMenuTarget(null);
        }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
              minWidth: 130,
              mt: 0.5,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => handleStatusChange("ACTIVE")}
          selected={statusMenuTarget?.status === "ACTIVE"}
          sx={{ fontSize: "14px", fontWeight: 500 }}
        >
          Active
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange("INACTIVE")}
          selected={statusMenuTarget?.status === "INACTIVE"}
          sx={{ fontSize: "14px", fontWeight: 500 }}
        >
          Inactive
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusChange("ON_LEAVE")}
          selected={statusMenuTarget?.status === "ON_LEAVE"}
          sx={{ fontSize: "14px", fontWeight: 500 }}
        >
          On Leave
        </MenuItem>
      </Menu>

      {hasPermission("attendance.create") && (
        <ManualAttendanceDialog
          open={manualOpen}
          onClose={() => {
            setManualOpen(false);
            setManualTarget(null);
          }}
          employee={manualTarget}
        />
      )}

      {canManageRoles && (
        <ManageRoleDialog
          open={roleOpen}
          onClose={() => {
            setRoleOpen(false);
            setRoleTarget(null);
          }}
          onSuccess={() => {
            fetchUsersList();
            dispatch(
              listEmployeesRequest({
                pageNumber,
                pageSize,
                search,
                status,
              })
            );
          }}
          employee={roleTarget}
        />
      )}

      {compOffTarget && (
        <CreditCompOffDialog
          open={compOffOpen}
          employeeId={compOffTarget._id}
          employeeName={`${compOffTarget.firstName} ${compOffTarget.lastName}`}
          onClose={() => {
            setCompOffOpen(false);
            setCompOffTarget(null);
          }}
          onSuccess={() => {
            setCompOffSuccess(`Comp-off balance credited successfully for ${compOffTarget.firstName} ${compOffTarget.lastName}.`);
          }}
        />
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Employee"
        content={
          deleteTarget
            ? `Are you sure you want to delete employee ${deleteTarget.firstName} ${deleteTarget.lastName}? This action will soft-delete their profile record and cannot be undone.`
            : "Are you sure you want to delete this employee?"
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        loading={deleteLoading}
      />

      {canCreate && (
        <BulkImportDialog
          open={importOpen}
          onClose={() => setImportOpen(false)}
          tenantSlug={tenantSlug}
          onSuccess={() => {
            dispatch(
              listEmployeesRequest({
                pageNumber,
                pageSize,
                search: debouncedSearchVal,
                status: statusVal,
              })
            );
          }}
        />
      )}
    </>
  );
}

export default EmployeeListView;
