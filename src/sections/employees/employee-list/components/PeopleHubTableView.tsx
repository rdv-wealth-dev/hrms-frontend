import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import type { EmployeeListItem } from "../../../../store/employee/employee.types";

interface PeopleHubTableViewProps {
  employees: EmployeeListItem[];
  loading?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canManageRoles?: boolean;
  onEdit: (employee: EmployeeListItem) => void;
  onDelete: (employee: EmployeeListItem) => void;
  onRoleManage?: (employee: EmployeeListItem) => void;
  onCompOffCredit?: (employee: EmployeeListItem) => void;
  onManualAttendance?: (employee: EmployeeListItem) => void;
  onSelectEmployee?: (employee: EmployeeListItem) => void;
}

// Helper color palette for initial avatars matching screenshot
const AVATAR_COLORS = [
  "#8B5CF6", // Violet (Priya Sharma PS)
  "#10B981", // Emerald (Rahul Verma RV)
  "#06B6D4", // Cyan (Aisha Khan AK)
  "#F59E0B", // Amber (Vikram Nair VN)
  "#EC4899", // Pink (Shreya Pillai SP)
  "#3B82F6", // Blue (Arjun Mehta AM)
];

// Helper mock properties generator for email, phone, performance if not present in API record
function getPeopleHubMeta(index: number, emp?: Partial<EmployeeListItem>) {
  const defaultEmails = [
    "palmer.hayden@company.com",
    "shivam.sharma@company.com",
    "sam.smith@company.com",
    "shally.cooper@company.com",
    "sameer.mehta@company.com",
  ];
  const defaultPhones = [
    "+91 98765 43210",
    "+91 98765 43211",
    "+91 98765 43212",
    "+91 98765 43213",
    "+91 98765 43214",
  ];
  const performances = [94, 88, 91, 76, 97, 92, 85, 90, 95];

  const email = emp?.email || defaultEmails[index % defaultEmails.length];
  const phone = emp?.phone || defaultPhones[index % defaultPhones.length];
  const perf = performances[index % performances.length];
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return { email, phone, performance: perf, color };
}

function getEmployeeStatusStyle(status?: string, employeeType?: string, isActive?: boolean) {
  const rawStatus = (status || "").toUpperCase();
  const rawType = (employeeType || "").toUpperCase();

  if (rawStatus.includes("LEAVE") || rawType.includes("LEAVE")) {
    return {
      label: "On Leave",
      bg: "rgba(238, 242, 255, 0.9)",
      color: "#4F46E5",
    };
  }

  if (rawStatus.includes("PROBATION") || rawType.includes("PROBATION") || rawStatus === "PROBATIONARY") {
    return {
      label: "Probation",
      bg: "rgba(254, 243, 199, 0.7)",
      color: "#B45309",
    };
  }

  if (rawStatus.includes("NOTICE")) {
    return {
      label: "Notice Period",
      bg: "rgba(255, 237, 213, 0.9)",
      color: "#C2410C",
    };
  }

  if (rawStatus.includes("INACTIVE") || rawStatus.includes("TERMINATED") || rawStatus.includes("EXITED") || isActive === false) {
    return {
      label: "Inactive",
      bg: "rgba(243, 244, 246, 0.9)",
      color: "#6B7280",
    };
  }

  const formattedLabel = status
    ? status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : "Active";

  return {
    label: formattedLabel,
    bg: "rgba(220, 252, 231, 0.7)",
    color: "#15803D",
  };
}

export function PeopleHubTableView({
  employees,
  canUpdate = true,
  canDelete = true,
  canManageRoles = true,
  onEdit,
  onDelete,
  onRoleManage,
  onCompOffCredit,
  onManualAttendance,
  onSelectEmployee,
}: PeopleHubTableViewProps) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeListItem | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, emp: EmployeeListItem) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedEmp(emp);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedEmp(null);
  };



  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
        backgroundColor: "#FFFFFF",
        overflowX: "auto",
      }}
    >
      <Table sx={{ minWidth: 1100 }}>
        <TableHead sx={{ backgroundColor: "#FAFAFA" }}>
          <TableRow sx={{ "& th": { borderBottom: "1px solid #E5E7EB", py: 1.8 } }}>
            <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }}>
              EMPLOYEE
            </TableCell>

            <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }}>
              DESIGNATION
            </TableCell>

            <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }}>
              DEPARTMENT
            </TableCell>

            <TableCell align="center" sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }}>
              EMAIL
            </TableCell>

            <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }}>
              PHONE NUMBER
            </TableCell>

            <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }}>
              JOINING DATE
            </TableCell>

            <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }}>
              STATUS
            </TableCell>

            <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }} width={180}>
              PERFORMANCE
            </TableCell>

            <TableCell width={48} align="right" />
          </TableRow>
        </TableHead>

        <TableBody>
          {employees.map((emp, index) => {
            const fullName = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() || "Employee";
            const initials = `${emp.firstName?.[0] ?? ""}${emp.lastName?.[0] ?? ""}`.toUpperCase() || "E";
            const meta = getPeopleHubMeta(index, emp);

            const statusStyle = getEmployeeStatusStyle(emp.status, emp.employeeType, emp.isActive);

            return (
              <TableRow
                key={emp._id}
                hover
                sx={{
                  transition: "background-color 0.15s ease",
                  "&:last-child td": { borderBottom: 0 },
                  "& td": { borderBottom: "1px solid #F1F5F9", py: 1.6 },
                }}
              >
                {/* Employee Info */}
                <TableCell>
                  <Box
                    onClick={() => {
                      if (onSelectEmployee) {
                        onSelectEmployee(emp);
                      } else {
                        navigate(`/employees/${emp._id}`);
                      }
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      cursor: "pointer",
                      width: "fit-content",
                      "&:hover .emp-name": { color: "#6D5DF6" },
                    }}
                  >
                    <Avatar
                      src={(emp as any).avatarUrl || (emp as any).avatar || (emp as any).profilePicture}
                      sx={{
                        width: 36,
                        height: 36,
                        backgroundColor: meta.color,
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#FFFFFF",
                      }}
                    >
                      {initials}
                    </Avatar>
                    <Typography
                      variant="subtitle2"
                      className="emp-name"
                      sx={{
                        fontWeight: 700,
                        color: "#0F172A",
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                        transition: "color 0.15s ease",
                      }}
                    >
                      {fullName}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Designation */}
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Typography variant="body2" sx={{ color: "#334155", fontWeight: 600, fontSize: "13px", whiteSpace: "nowrap" }}>
                    {typeof emp.designationId === "object" ? (emp.designationId as any)?.name || "Software Developer" : emp.designationId || "Software Developer"}
                  </Typography>
                </TableCell>

                {/* Department */}
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Typography variant="body2" sx={{ color: "#334155", fontWeight: 500, fontSize: "13px", whiteSpace: "nowrap" }}>
                    {typeof emp.departmentId === "object" ? (emp.departmentId as any)?.name || "Engineering" : "Engineering"}
                  </Typography>
                </TableCell>

                {/* Email */}
                <TableCell align="center">
                  <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 0.75, color: "#64748B" }}>
                    <EmailOutlinedIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#475569",
                        fontSize: "13px",
                        maxWidth: { xs: 140, sm: 180, md: 220 },
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {meta.email}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Phone Number */}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#64748B" }}>
                    <PhoneOutlinedIcon sx={{ fontSize: 15, color: "#94A3B8" }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#475569",
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {meta.phone}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Joining Date */}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#64748B" }}>
                    <CalendarMonthOutlinedIcon sx={{ fontSize: 15, color: "#94A3B8" }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#475569",
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {emp.joiningDate
                        ? new Date(emp.joiningDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : ["15 Jan 2023", "01 Jun 2022", "10 Mar 2024", "20 Aug 2021", "05 Nov 2023"][index % 5]}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Status Badge */}
                <TableCell>
                  <Chip
                    label={statusStyle.label}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "11px",
                      fontWeight: 700,
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      borderRadius: "12px",
                      px: 0.5,
                    }}
                  />
                </TableCell>

                {/* Performance Progress Bar */}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={meta.performance}
                      sx={{
                        flexGrow: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#E2E8F0",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 3,
                          backgroundColor: "#6D5DF6",
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: "#334155", minWidth: 28 }}
                    >
                      {meta.performance}%
                    </Typography>
                  </Box>
                </TableCell>

                {/* Action Trigger */}
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenMenu(e, emp)}
                    sx={{ color: "#94A3B8", "&:hover": { color: "#6D5DF6", backgroundColor: "#F1F5F9" } }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Row Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: { borderRadius: 2, minWidth: 160, p: 0.5 },
          },
        }}
      >
        {canUpdate && selectedEmp && (
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              onEdit(selectedEmp);
            }}
          >
            <ListItemIcon>
              <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Edit Employee" />
          </MenuItem>
        )}

        {canManageRoles && selectedEmp && onRoleManage && (
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              onRoleManage(selectedEmp);
            }}
          >
            <ListItemIcon>
              <AdminPanelSettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Manage Role" />
          </MenuItem>
        )}

        {onCompOffCredit && selectedEmp && (
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              onCompOffCredit(selectedEmp);
            }}
          >
            <ListItemIcon>
              <CalendarMonthOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Credit Comp Off" />
          </MenuItem>
        )}

        {onManualAttendance && selectedEmp && (
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              onManualAttendance(selectedEmp);
            }}
          >
            <ListItemIcon>
              <AccessTimeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Mark Attendance" />
          </MenuItem>
        )}

        {canDelete && selectedEmp && (
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              onDelete(selectedEmp);
            }}
            sx={{ color: "#EF4444" }}
          >
            <ListItemIcon sx={{ color: "#EF4444" }}>
              <DeleteOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        )}
      </Menu>
    </TableContainer>
  );
}

export default PeopleHubTableView;
