import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
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
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
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

function EmployeeListView() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem("employee_view_mode") as ViewMode) || "people_hub";
  });

  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("");

  const handleViewModeChange = (mode: ViewMode) => {
    if (mode === "directory") {
      navigate(paths.employees.directory);
      return;
    }
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

      const activeStatus = filters.status || statusVal;
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

  const [usersList, setUsersList] = useState<UserAccountData[]>([]);

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

  const getUserRole = (emp: EmployeeListItem) => {
    const user = usersList.find(
      (u) =>
        u.employeeId === emp._id ||
        u.email.toLowerCase() === emp.email.toLowerCase()
    );
    return user ? user.role : "EMPLOYEE";
  };

  const getUserRoleLabel = (emp: EmployeeListItem) => {
    const role = getUserRole(emp);
    const roleLabels: Record<string, string> = {
      ORG_ADMIN: "Org Admin",
      HR_ADMIN: "HR Admin",
      BRANCH_ADMIN: "Branch Admin",
      LEADERSHIP: "Leadership",
      MANAGER: "Manager",
      PRODUCT_MANAGER: "Product Manager",
      TEAM_LEADER: "Team Leader",
      EMPLOYEE: "Employee",
    };
    return roleLabels[role] || role;
  };

  const getUserRoleChipColor = (role: string) => {
    switch (role) {
      case "ORG_ADMIN":
        return "#FEE2E2";
      case "HR_ADMIN":
        return "#F3E8FF";
      case "BRANCH_ADMIN":
        return "#E0F2FE";
      case "LEADERSHIP":
      case "MANAGER":
      case "PRODUCT_MANAGER":
      case "TEAM_LEADER":
        return "#ECFDF5";
      case "EMPLOYEE":
      default:
        return "#F3F4F6";
    }
  };

  const getUserRoleChipTextColor = (role: string) => {
    switch (role) {
      case "ORG_ADMIN":
        return "#991B1B";
      case "HR_ADMIN":
        return "#6B21A8";
      case "BRANCH_ADMIN":
        return "#075985";
      case "LEADERSHIP":
      case "MANAGER":
      case "PRODUCT_MANAGER":
      case "TEAM_LEADER":
        return "#065F46";
      case "EMPLOYEE":
      default:
        return "#374151";
    }
  };

  const getStatusChipProps = (statusStr: string) => {
    switch (statusStr) {
      case "ACTIVE":
        return { label: "Active", color: "success" as const, variant: "outlined" as const };
      case "ON_LEAVE":
        return { label: "On Leave", color: "warning" as const, variant: "outlined" as const };
      case "INACTIVE":
      default:
        return { label: "Inactive", color: "default" as const, variant: "outlined" as const };
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
    if (branches.length === 0) {
      dispatch(listBranchesRequest());
    }
    dispatch(clearEmployeeError());
  }, [dispatch, departments.length, designations.length, branches.length]);

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
    const effectiveStatus = filters.status || statusVal;
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

  // Helper mapping IDs to human-readable names
  const getDepartmentName = (id: any) => {
    if (!id) return "—";
    if (typeof id === "object") {
      if (id.name) {
        return `${id.name} (${id.code || "—"})`;
      }
      id = id._id;
    }
    if (!id || !Array.isArray(departments)) return "—";
    const dept = departments.find((d) => d && d._id === id);
    return dept ? `${dept.name || "—"} (${dept.code || "—"})` : "—";
  };

  const getDesignationName = (id: any) => {
    if (!id) return "—";
    if (typeof id === "object") {
      if (id.name) {
        return id.name;
      }
      id = id._id;
    }
    if (!id || !Array.isArray(designations)) return "—";
    const desig = designations.find((d) => d && d._id === id);
    return desig ? desig.name || "—" : "—";
  };

  const formatEmployeeType = (type: string) => {
    if (!type) return "—";
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const displayedEmployees = employees.filter((emp) => {
    // Note: Department, Designation, and Branch filters are executed server-side.

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
    const activeStatus = filters.status || statusVal;
    if (activeStatus) {
      const targetStatus = activeStatus.toUpperCase();
      const empStatus = (emp.status || "").toUpperCase();
      if (targetStatus === "ACTIVE" && empStatus !== "ACTIVE") return false;
      if (targetStatus === "PROBATION" && !empStatus.includes("PROBATION")) return false;
      if (targetStatus === "NOTICE" && !empStatus.includes("NOTICE")) return false;
      if (targetStatus === "INACTIVE" && empStatus !== "INACTIVE") return false;
      if (targetStatus === "ON_LEAVE" && empStatus !== "ON_LEAVE") return false;
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
    <DashboardLayout>
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
            <PeopleAltOutlinedIcon sx={{ fontSize: 32, color: "#6D5DF6" }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
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
            {/* Design View Switcher (Design 1: Classic vs Design 2: People Hub) */}
            <ViewModeSwitcher viewMode={viewMode} onChange={handleViewModeChange} />

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
                borderColor: "#E2E8F0",
                color: "#475569",
                fontWeight: 600,
                fontSize: "14px",
                px: 2.5,
                boxSizing: "border-box",
                whiteSpace: "nowrap",
                flexShrink: 0,
                "&:hover": {
                  borderColor: "#CBD5E1",
                  backgroundColor: "#F8FAFC",
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
                  borderColor: "#6D5DF6",
                  color: "#6D5DF6",
                  fontWeight: 600,
                  fontSize: "14px",
                  px: 2.5,
                  boxSizing: "border-box",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  "&:hover": {
                    borderColor: "#5B4BEA",
                    backgroundColor: "#F5F3FF",
                  },
                }}
              >
                Import
              </Button>
            )}

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

        {/* Top KPI Metric Summary Cards (People Hub View) */}
        {viewMode === "people_hub" && (
          <PeopleHubKpiCards
            employees={employees}
            totalEmployees={total || employees.length}
          />
        )}

        {/* Single Line Unified Toolbar (Search + Category Filters) Directly Above Cards */}
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
            if (newFilters.status !== undefined) {
              setStatusVal(newFilters.status);
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

        {/* Conditional View Rendering: Design 2 (People Hub) vs Design 1 (Classic) */}
        {viewMode === "people_hub" ? (
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
                <CircularProgress sx={{ color: "#6D5DF6" }} />
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
                <CircularProgress sx={{ color: "#6D5DF6" }} />
              </Box>
            )}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Employee Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Designation</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Joining Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Status</TableCell>
                    {canReadRoles && (
                      <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>System Role</TableCell>
                    )}
                    {(canUpdate || hasPermission("attendance.create") || hasPermission("leave.create") || canManageRoles || canDelete) && (
                      <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Actions</TableCell>
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {displayedEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9 + (canUpdate || hasPermission("attendance.create") || canManageRoles ? 1 : 0) + (canReadRoles ? 1 : 0)}
                        align="center"
                      >
                        <Box sx={{ py: 8 }}>
                          <PeopleAltOutlinedIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 1.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            No employees found. {canCreate && 'Click "Add Employee" to create one.'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedEmployees.map((emp, index) => (
                      <TableRow
                        key={emp._id || index}
                        hover
                        sx={{ height: 53, "&:last-child td": { border: 0 } }}
                      >
                        <TableCell>
                          <Chip
                            label={emp.employeeCode || "—"}
                            size="small"
                            sx={{
                              backgroundColor: "#EEF2FF",
                              color: "#6D5DF6",
                              fontWeight: 600,
                              fontSize: 12,
                            }}
                          />
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#6D5DF6" }}
                          onClick={() => navigate(paths.employees.detail.replace(":id", emp._id))}
                        >
                          {`${emp.firstName ?? ""} ${emp.lastName ?? ""}`}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{emp.email || "—"}</TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{emp.phone || "—"}</TableCell>
                        <TableCell sx={{ fontSize: 13 }}>
                          {getDepartmentName(emp.departmentId)}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13 }}>
                          {getDesignationName(emp.designationId)}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>
                          {formatEmployeeType(emp.employeeType)}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13 }}>
                          {formatDate(emp.joiningDate)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            {...getStatusChipProps(emp.status)}
                            size="small"
                            onClick={
                              canUpdate
                                ? (e) => {
                                    setStatusMenuAnchor(e.currentTarget);
                                    setStatusMenuTarget(emp);
                                  }
                                : undefined
                            }
                            sx={{
                              cursor: canUpdate ? "pointer" : "default",
                              "&:hover": canUpdate
                                ? {
                                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                                  }
                                : {},
                            }}
                          />
                        </TableCell>
                        {canReadRoles && (
                          <TableCell>
                            <Chip
                              label={getUserRoleLabel(emp)}
                              size="small"
                              sx={{
                                backgroundColor: getUserRoleChipColor(getUserRole(emp)),
                                color: getUserRoleChipTextColor(getUserRole(emp)),
                                fontWeight: 600,
                                fontSize: 11,
                              }}
                            />
                          </TableCell>
                        )}
                        {(canUpdate || hasPermission("attendance.create") || hasPermission("leave.create") || canManageRoles || canDelete) && (
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              {canUpdate && (
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditTarget(emp);
                                    setEditOpen(true);
                                  }}
                                  sx={{ color: "#6D5DF6" }}
                                >
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                              )}
                              {canManageRoles && (
                                <IconButton
                                  size="small"
                                  title="Manage System Role"
                                  onClick={() => {
                                    setRoleTarget(emp);
                                    setRoleOpen(true);
                                  }}
                                  sx={{ color: "#8B5CF6" }}
                                >
                                  <AdminPanelSettingsIcon fontSize="small" />
                                </IconButton>
                              )}
                              {hasPermission("attendance.create") && (
                                <IconButton
                                  size="small"
                                  title="Record Manual Attendance"
                                  onClick={() => {
                                    setManualTarget(emp);
                                    setManualOpen(true);
                                  }}
                                  sx={{ color: "#10B981" }}
                                >
                                  <CalendarMonthOutlinedIcon fontSize="small" />
                                </IconButton>
                              )}
                              {hasPermission("leave.create") && (
                                <IconButton
                                  size="small"
                                  title="Credit Comp-Off"
                                  onClick={() => {
                                    setCompOffTarget(emp);
                                    setCompOffOpen(true);
                                  }}
                                  sx={{ color: "#D97706" }}
                                >
                                  <AccessTimeIcon fontSize="small" />
                                </IconButton>
                              )}
                              {canDelete && (
                                <IconButton
                                  size="small"
                                  title="Delete Employee"
                                  onClick={() => {
                                    setDeleteTarget(emp);
                                    setDeleteOpen(true);
                                  }}
                                  sx={{ color: "#EF4444" }}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                  {displayedEmployees.length > 0 && Math.max(0, 10 - displayedEmployees.length) > 0 &&
                    Array.from({ length: Math.max(0, 10 - displayedEmployees.length) }).map((_, index) => {
                      const isLast = index === Math.max(0, 10 - displayedEmployees.length) - 1;
                      return (
                        <TableRow
                          key={`empty-classic-${index}`}
                          sx={{
                            height: 53,
                            "& td": { borderBottom: isLast ? 0 : "1px solid #F1F5F9" },
                          }}
                        >
                          <TableCell colSpan={9 + (canUpdate || hasPermission("attendance.create") || canManageRoles ? 1 : 0) + (canReadRoles ? 1 : 0)} />
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Table Pagination */}
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
    </DashboardLayout>
  );
}

export default EmployeeListView;
