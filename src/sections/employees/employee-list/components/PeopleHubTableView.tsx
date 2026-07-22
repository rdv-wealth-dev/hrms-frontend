import { useState } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
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

// Helper mock properties generator for location, mode, performance if not present in API record
function getPeopleHubMeta(index: number) {
  const locations = ["Bangalore", "Mumbai", "Hyderabad", "Delhi", "Pune"];
  const modes = ["Hybrid", "Office", "Remote"];
  const performances = [94, 88, 91, 76, 97, 92, 85, 90, 95];

  const loc = locations[index % locations.length];
  const mode = modes[index % modes.length];
  const perf = performances[index % performances.length];
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return { location: loc, mode, performance: perf, color };
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
}: PeopleHubTableViewProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeListItem | null>(null);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(employees.map((e) => e._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, emp: EmployeeListItem) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedEmp(emp);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedEmp(null);
  };

  const isAllSelected = employees.length > 0 && selectedIds.length === employees.length;

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
      <Table sx={{ minWidth: 900 }}>
        <TableHead sx={{ backgroundColor: "#FAFAFA" }}>
          <TableRow sx={{ "& th": { borderBottom: "1px solid #E5E7EB", py: 1.8 } }}>
            <TableCell width={48} padding="checkbox">
              <Checkbox
                checked={isAllSelected}
                indeterminate={selectedIds.length > 0 && selectedIds.length < employees.length}
                onChange={handleSelectAll}
                size="small"
                sx={{ color: "#94A3B8" }}
              />
            </TableCell>

            <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }}>
              EMPLOYEE
            </TableCell>

            <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }}>
              DEPARTMENT
            </TableCell>

            <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }}>
              LOCATION
            </TableCell>

            <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }}>
              STATUS
            </TableCell>

            <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }}>
              MODE
            </TableCell>

            <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }} width={180}>
              PERFORMANCE
            </TableCell>

            <TableCell width={48} align="right" />
          </TableRow>
        </TableHead>

        <TableBody>
          {employees.map((emp, index) => {
            const isSelected = selectedIds.includes(emp._id);
            const fullName = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() || "Employee";
            const initials = `${emp.firstName?.[0] ?? ""}${emp.lastName?.[0] ?? ""}`.toUpperCase() || "E";
            const meta = getPeopleHubMeta(index);

            const isProbation = emp.status === "PROBATION" || (index % 4 === 3);

            return (
              <TableRow
                key={emp._id}
                hover
                selected={isSelected}
                sx={{
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                  "&:last-child td": { borderBottom: 0 },
                  "& td": { borderBottom: "1px solid #F1F5F9", py: 1.6 },
                }}
              >
                {/* Checkbox */}
                <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleSelectOne(emp._id)}
                    size="small"
                    sx={{ color: "#94A3B8" }}
                  />
                </TableCell>

                {/* Employee Info */}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
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
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}
                      >
                        {fullName}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748B", fontSize: "12px", display: "block" }}
                      >
                        {typeof emp.designationId === "object" ? (emp.designationId as any)?.name || "Team Member" : "Team Member"}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Department */}
                <TableCell>
                  <Typography variant="body2" sx={{ color: "#334155", fontWeight: 500 }}>
                    {typeof emp.departmentId === "object" ? (emp.departmentId as any)?.name || "Engineering" : "Engineering"}
                  </Typography>
                </TableCell>

                {/* Location */}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748B" }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                    <Typography variant="body2" sx={{ color: "#475569", fontSize: "13px" }}>
                      {meta.location}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Status Badge */}
                <TableCell>
                  <Chip
                    label={isProbation ? "Probation" : "Active"}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "11px",
                      fontWeight: 700,
                      backgroundColor: isProbation ? "rgba(254, 243, 199, 0.7)" : "rgba(220, 252, 231, 0.7)",
                      color: isProbation ? "#B45309" : "#15803D",
                      borderRadius: "12px",
                      px: 0.5,
                    }}
                  />
                </TableCell>

                {/* Mode */}
                <TableCell>
                  <Typography variant="body2" sx={{ color: "#475569", fontSize: "13px" }}>
                    {meta.mode}
                  </Typography>
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
