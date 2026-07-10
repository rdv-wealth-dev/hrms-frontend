import { useEffect, useState, useRef } from "react";
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
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import { paths } from "../../../routes/paths";
import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import {
  listEmployeesRequest,
  clearEmployeeError,
  updateEmployeeStatusRequest,
} from "../../../store/employee";
import type { EmployeeListItem } from "../../../store/employee/employee.types";
import { listDepartmentsRequest } from "../../../store/department";
import { listDesignationsRequest } from "../../../store/designation";
import EmployeeEditDialog from "./components/EmployeeEditDialog";
import { usePermissions } from "../../../hooks/usePermissions";
import ManualAttendanceDialog from "../../attendance/components/ManualAttendanceDialog";
import ManageRoleDialog from "./components/ManageRoleDialog";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { listUsers, type UserAccountData } from "../../../api/user.api";
import { deleteEmployee } from "../../../api/employee.api";
import { ConfirmDialog } from "../../../components/modal";
import CustomTablePagination from "../../../components/pagination";

function EmployeeListView() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { employees = [], loading, error, total = 0, pageNumber = 1, pageSize = 10, search, status } =
    useSelector((state: RootState) => state.employee);

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("employee.create");
  const canUpdate = hasPermission("employee.update");
  const canManageRoles = hasPermission("role.update");
  const canReadRoles = hasPermission("role.read");
  const canDelete = hasPermission("employee.delete");

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EmployeeListItem | null>(null);
  const [searchVal, setSearchVal] = useState(search || "");
  const [statusVal, setStatusVal] = useState(status || "");

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
        dispatch(listEmployeesRequest({ pageNumber, pageSize, search, status }));
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

  const isFirstRun = useRef(true);

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

  // Fetch initial setup data
  useEffect(() => {
    if (departments.length === 0) {
      dispatch(listDepartmentsRequest());
    }
    if (designations.length === 0) {
      dispatch(listDesignationsRequest({ pageNumber: 1, pageSize: 50 }));
    }
    dispatch(clearEmployeeError());
  }, [dispatch, departments.length, designations.length]);

  // Fetch users list for system roles if permitted
  useEffect(() => {
    if (canReadRoles) {
      fetchUsersList();
    }
  }, [canReadRoles]);

  // Debounced search & status trigger
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      if (employees.length > 0 && !searchVal && !statusVal) {
        return;
      }
      dispatch(
        listEmployeesRequest({
          pageNumber: 1,
          pageSize,
          search: searchVal,
          status: statusVal || undefined,
        })
      );
      return;
    }

    const delayDebounce = setTimeout(() => {
      dispatch(
        listEmployeesRequest({
          pageNumber: 1,
          pageSize,
          search: searchVal,
          status: statusVal || undefined,
        })
      );
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchVal, statusVal, pageSize, dispatch, employees.length]);

  const handlePageChange = (newPage: number) => {
    dispatch(
      listEmployeesRequest({
        pageNumber: newPage,
        pageSize,
        search: searchVal,
        status: statusVal || undefined,
      })
    );
  };

  const handleRowsPerPageChange = (newSize: number) => {
    dispatch(
      listEmployeesRequest({
        pageNumber: 1,
        pageSize: newSize,
        search: searchVal,
        status: statusVal || undefined,
      })
    );
  };

  // Helper mapping IDs to human-readable names
  const getDepartmentName = (id: string) => {
    if (!id || !Array.isArray(departments)) return "—";
    const dept = departments.find((d) => d && d._id === id);
    return dept ? `${dept.name || "—"} (${dept.code || "—"})` : "—";
  };

  const getDesignationName = (id: string) => {
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

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Page Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mb: 3,
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
                  ? `Showing ${employees.length} of ${total} employee records`
                  : "Manage employee accounts, details, and assignments"}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <TextField
              size="small"
              placeholder="Search employees..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                width: { xs: "100%", sm: 220 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "#FFFFFF",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#BFC5D2",
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#D1D5DB",
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#6D5DF6",
                },
              }}
            />

            <TextField
              select
              size="small"
              value={statusVal}
              onChange={(e) => setStatusVal(e.target.value)}
              slotProps={{
                select: {
                  displayEmpty: true,
                  renderValue: (value: unknown) => {
                    const val = value as string;
                    if (!val) return <span style={{ color: "#9CA3AF", fontSize: "14px" }}>All Statuses</span>;
                    if (val === "ACTIVE") return "Active";
                    if (val === "INACTIVE") return "Inactive";
                    if (val === "ON_LEAVE") return "On Leave";
                    return val;
                  },
                },
              }}
              sx={{
                width: { xs: "100%", sm: 150 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "#FFFFFF",
                  height: 40,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#BFC5D2",
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#D1D5DB",
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#6D5DF6",
                },
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
              <MenuItem value="ON_LEAVE">On Leave</MenuItem>
            </TextField>

            {canCreate && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => navigate(paths.employees.create)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  backgroundColor: "#6D5DF6",
                  height: 40,
                  px: 2.5,
                  "&:hover": { backgroundColor: "#5B4BEA" },
                }}
              >
                Add Employee
              </Button>
            )}
          </Box>
        </Box>

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

        {/* Table List Card */}
        <Card sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          {loading && employees.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress sx={{ color: "#6D5DF6" }} />
            </Box>
          ) : (
            <>
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
                      {(canUpdate || hasPermission("attendance.create") || canManageRoles) && (
                        <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Actions</TableCell>
                      )}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {employees.length === 0 ? (
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
                      employees.map((emp, index) => (
                        <TableRow
                          key={emp._id || index}
                          hover
                          sx={{ "&:last-child td": { border: 0 } }}
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
                          <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>
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
                          {(canUpdate || hasPermission("attendance.create") || canManageRoles || canDelete) && (
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
              />
            </>
          )}
        </Card>
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
    </DashboardLayout>
  );
}

export default EmployeeListView;
