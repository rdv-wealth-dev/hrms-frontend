import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

import { usePermissions } from "../../../../../../hooks/usePermissions";
import type { OrgTreeNode, EmployeeNode } from "../types";

export type EmployeeCardProps = {
  employee: OrgTreeNode | EmployeeNode | any;
  onReparent?: (node: OrgTreeNode | EmployeeNode | any) => void;
};

// Avatar Palette matching EmployeeDirectoryCardGrid
const AVATAR_COLORS = [
  "#8B5CF6", // Violet
  "#10B981", // Emerald Green
  "#06B6D4", // Cyan
  "#F59E0B", // Amber Orange
  "#EC4899", // Pink
  "#3B82F6", // Royal Blue
  "#14B8A6", // Teal
  "#EA580C", // Red-Orange
  "#7C3AED", // Purple
  "#0284C7", // Sky Blue
];

function getCardColor(str?: string) {
  if (!str) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function EmployeeCard({ employee, onReparent }: EmployeeCardProps) {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canUpdateOrgTree = hasPermission("orgtree.update");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const empData = employee?.assignedEmployee || employee;
  const name = empData?.fullName || (empData?.firstName ? `${empData.firstName} ${empData.lastName || ""}` : employee?.name || employee?.title || "Vacant Position");
  
  const firstName = empData?.firstName || name.split(" ")[0] || "";
  const lastName = empData?.lastName || name.split(" ")[1] || "";
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "E";
  const avatarColor = getCardColor(name);

  const designation = employee?.title || employee?.designation || empData?.designationTitle || (typeof empData?.designationId === "object" ? empData?.designationId?.name : empData?.designationId) || "Role";
  const department = employee?.department?.name || employee?.department || empData?.departmentName || (typeof empData?.departmentId === "object" ? empData?.departmentId?.name : empData?.departmentId) || "Engineering";
  const reportsCount = employee?.children?.length ?? employee?.teamCount ?? 0;
  const isVacant = Boolean(employee?.isVacant || (!employee?.assignedEmployee && !employee?.firstName && !employee?.fullName));
  const employeeId = empData?._id || empData?.id || employee?._id || employee?.id;

  const rawStatus = (empData?.status || employee?.status || "").toUpperCase();
  const rawType = (empData?.employeeType || employee?.employeeType || "").toUpperCase();

  let statusLabel = "Active";
  let statusBg = "rgba(220, 252, 231, 0.9)";
  let statusColor = "#15803D";

  if (isVacant) {
    statusLabel = "Vacant";
    statusBg = "rgba(243, 244, 246, 0.9)";
    statusColor = "#6B7280";
  } else if (rawStatus.includes("LEAVE") || rawType.includes("LEAVE")) {
    statusLabel = "On Leave";
    statusBg = "rgba(238, 242, 255, 0.9)";
    statusColor = "#4F46E5";
  } else if (rawStatus.includes("PROBATION") || rawType.includes("PROBATION")) {
    statusLabel = "Probation";
    statusBg = "rgba(254, 243, 199, 0.9)";
    statusColor = "#B45309";
  } else if (rawStatus.includes("NOTICE")) {
    statusLabel = "Notice Period";
    statusBg = "rgba(255, 237, 213, 0.9)";
    statusColor = "#C2410C";
  } else if (rawStatus.includes("INACTIVE") || empData?.isActive === false) {
    statusLabel = "Inactive";
    statusBg = "rgba(243, 244, 246, 0.9)";
    statusColor = "#6B7280";
  }

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleReparentClick = () => {
    handleCloseMenu();
    onReparent?.(employee);
  };

  const handleViewProfile = () => {
    handleCloseMenu();
    if (employeeId) {
      navigate(`/profile?id=${employeeId}`);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        width: { xs: 240, sm: 255 },
        p: 2.5,
        borderRadius: 4,
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 10px 25px rgba(109, 93, 246, 0.12)",
          borderColor: "#C7D2FE",
        },
      }}
    >
      {/* 3-Dots Action Menu Icon (Top Right) */}
      <IconButton
        size="small"
        onClick={handleOpenMenu}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          color: "#94A3B8",
          p: 0.5,
          borderRadius: "8px",
          "&:hover": { backgroundColor: "action.hover", color: "text.primary" },
        }}
      >
        <MoreVertIcon sx={{ fontSize: 18 }} />
      </IconButton>

      {/* Centered Avatar matching EmployeeDirectoryCardGrid */}
      <Avatar
        src={empData?.avatarUrl || empData?.profilePicture}
        sx={{
          width: 52,
          height: 52,
          backgroundColor: avatarColor,
          fontSize: "16px",
          fontWeight: 800,
          color: "#FFFFFF",
          mb: 1.5,
          boxShadow: `0 4px 14px ${avatarColor}40`,
        }}
      >
        {initials}
      </Avatar>

      {/* Employee Full Name */}
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 800,
          color: isVacant ? "text.secondary" : "text.primary",
          lineHeight: 1.2,
          fontSize: "15px",
          mb: 0.5,
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </Typography>

      {/* Designation */}
      <Typography
        variant="caption"
        sx={{
          color: "#64748B",
          fontWeight: 500,
          fontSize: "12px",
          display: "block",
          lineHeight: 1.3,
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {designation}
      </Typography>

      {/* Department */}
      <Typography
        variant="caption"
        sx={{
          color: "#94A3B8",
          fontWeight: 500,
          fontSize: "12px",
          display: "block",
          mb: 1.5,
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {department}
      </Typography>

      {/* Status & Direct Reports Badges */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75, width: "100%" }}>
        <Chip
          label={statusLabel}
          size="small"
          sx={{
            height: 22,
            fontSize: "11px",
            fontWeight: 700,
            backgroundColor: statusBg,
            color: statusColor,
            borderRadius: "12px",
            px: 1,
          }}
        />

        {reportsCount > 0 && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.2,
              py: 0.3,
              borderRadius: "12px",
              backgroundColor: "#EEF2FF",
              color: "#4F46E5",
              mt: 0.25,
            }}
          >
            <GroupsOutlinedIcon sx={{ fontSize: 13 }} />
            <Typography sx={{ fontSize: "11px", fontWeight: 700 }}>
              {reportsCount} {reportsCount === 1 ? "report" : "reports"}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Dropdown Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              border: "1px solid",
              borderColor: "divider",
              minWidth: 200,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleViewProfile}>
          <ListItemIcon sx={{ minWidth: 28, color: "#64748B" }}>
            <PersonOutlineOutlinedIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontSize: "13px", fontWeight: 600 }}>View Profile</Typography>}
          />
        </MenuItem>

        {canUpdateOrgTree && (
          <MenuItem onClick={handleReparentClick}>
            <ListItemIcon sx={{ minWidth: 28, color: "primary.main" }}>
              <AccountTreeOutlinedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: "13px", fontWeight: 600 }}>Change Reporting Line</Typography>}
              secondary={<Typography variant="caption" sx={{ fontSize: "11px", color: "text.secondary" }}>Reparent node</Typography>}
            />
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
}