import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

import CustomAvatar from "../../../../../../components/avatar/CustomAvatar";
import { usePermissions } from "../../../../../../hooks/usePermissions";
import type { OrgTreeNode, EmployeeNode } from "../types";

export type EmployeeCardProps = {
  employee: OrgTreeNode | EmployeeNode | any;
  onReparent?: (node: OrgTreeNode | EmployeeNode | any) => void;
};

export default function EmployeeCard({ employee, onReparent }: EmployeeCardProps) {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canUpdateOrgTree = hasPermission("orgtree.update");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const empData = employee?.assignedEmployee;
  const name = empData?.fullName || (empData?.firstName ? `${empData.firstName} ${empData.lastName || ""}` : employee?.name || employee?.title || "Vacant Position");
  const designation = employee?.title || employee?.designation || empData?.designationTitle || "Role";
  const department = employee?.department?.name || employee?.department || empData?.departmentName || "";
  const reportsCount = employee?.children?.length ?? employee?.teamCount ?? 0;
  const isVacant = Boolean(employee?.isVacant || !empData);
  const employeeId = empData?._id || empData?.id || employee?._id || employee?.id;

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
        width: { xs: 260, sm: 290 },
        p: 2,
        borderRadius: "16px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 12px 24px -4px rgba(109, 93, 246, 0.15)",
          borderColor: "#6D5DF6",
        },
      }}
    >
      <Stack spacing={1.5}>
        {/* Header with Avatar, Name & Options */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            <CustomAvatar
              name={name}
              src={empData?.avatarUrl}
              size={44}
              sx={{
                border: "2px solid #F1F5F9",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                noWrap
                sx={{
                  fontWeight: 700,
                  fontSize: "14.5px",
                  color: isVacant ? "#94A3B8" : "#0F172A",
                  lineHeight: 1.2,
                }}
              >
                {name}
              </Typography>
              <Typography
                noWrap
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "#6D5DF6",
                  fontSize: "12.5px",
                  display: "block",
                  mt: 0.2,
                }}
              >
                {designation}
              </Typography>
            </Box>
          </Box>

          {/* Action Menu (for Admins) */}
          <IconButton
            size="small"
            onClick={handleOpenMenu}
            sx={{
              color: "#94A3B8",
              p: 0.5,
              borderRadius: "8px",
              "&:hover": { backgroundColor: "#F1F5F9", color: "#0F172A" },
            }}
          >
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Department & Reports Count Footer */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 0.5 }}>
          {department ? (
            <Chip
              label={department}
              size="small"
              sx={{
                height: 22,
                fontSize: "11px",
                fontWeight: 600,
                backgroundColor: "#F1F5F9",
                color: "#475569",
                maxWidth: 160,
              }}
            />
          ) : (
            <Box />
          )}

          {reportsCount > 0 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 1,
                py: 0.3,
                borderRadius: "12px",
                backgroundColor: "rgba(109, 93, 246, 0.08)",
                color: "#6D5DF6",
              }}
            >
              <GroupsOutlinedIcon sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: "11.5px", fontWeight: 700 }}>
                {reportsCount} {reportsCount === 1 ? "report" : "reports"}
              </Typography>
            </Box>
          )}
        </Box>
      </Stack>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              border: "1px solid #E2E8F0",
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
            <ListItemIcon sx={{ minWidth: 28, color: "#6D5DF6" }}>
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