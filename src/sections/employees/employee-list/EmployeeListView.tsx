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
import TablePagination from "@mui/material/TablePagination";
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

function EmployeeListView() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { employees = [], loading, error, total = 0, pageNumber = 1, pageSize = 10, search, status } =
    useSelector((state: RootState) => state.employee);

  const user = useSelector((state: RootState) => state.auth?.user);
  const userCanManage = user?.role === "HR" || user?.role === "SUPER_ADMIN";

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EmployeeListItem | null>(null);
  const [searchVal, setSearchVal] = useState(search || "");
  const [statusVal, setStatusVal] = useState(status || "");

  const [statusMenuAnchor, setStatusMenuAnchor] = useState<HTMLElement | null>(null);
  const [statusMenuTarget, setStatusMenuTarget] = useState<EmployeeListItem | null>(null);

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
                      {userCanManage && (
                        <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Actions</TableCell>
                      )}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {employees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={userCanManage ? 10 : 9} align="center">
                          <Box sx={{ py: 8 }}>
                            <PeopleAltOutlinedIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 1.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              No employees found. Click "Add Employee" to create one.
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
                                userCanManage
                                  ? (e) => {
                                      setStatusMenuAnchor(e.currentTarget);
                                      setStatusMenuTarget(emp);
                                    }
                                  : undefined
                              }
                              sx={{
                                cursor: userCanManage ? "pointer" : "default",
                                "&:hover": userCanManage
                                  ? {
                                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                                    }
                                  : {},
                              }}
                            />
                          </TableCell>
                          {userCanManage && (
                            <TableCell>
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
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Table Pagination */}
              {total > 0 && (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={total}
                  rowsPerPage={pageSize}
                  page={pageNumber - 1}
                  onPageChange={(_, newPage) => handlePageChange(newPage + 1)}
                  onRowsPerPageChange={(e) =>
                    handleRowsPerPageChange(parseInt(e.target.value, 10))
                  }
                  sx={{
                    borderTop: "1px solid rgba(224, 224, 224, 1)",
                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                      fontSize: "13px",
                    },
                  }}
                />
              )}
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
    </DashboardLayout>
  );
}

export default EmployeeListView;
