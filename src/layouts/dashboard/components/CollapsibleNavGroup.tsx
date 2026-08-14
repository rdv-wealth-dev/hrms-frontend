import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { usePermissions } from "../../../hooks/usePermissions";

export interface NavSubItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  permission?: string;
  children?: NavSubItem[];
}

interface CollapsibleNavGroupProps {
  title: string;
  icon?: React.ReactNode;
  items: NavSubItem[];
  isCollapsed?: boolean;
  onNavigate: (path: string) => void;
}

function NestedSubGroupItem({
  item,
  onNavigate,
}: {
  item: NavSubItem;
  onNavigate: (path: string) => void;
}) {
  const location = useLocation();
  const { hasPermission } = usePermissions();

  const visibleChildren = (item.children || []).filter((child) => {
    if (!child.permission) return true;
    return hasPermission(child.permission);
  });

  const isChildActive = visibleChildren.some((child) => child.path && location.pathname === child.path);
  const [open, setOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) {
      setOpen(true);
    }
  }, [isChildActive]);

  if (visibleChildren.length === 0) return null;

  return (
    <Box sx={{ mb: 0.5 }}>
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
          onClick={() => setOpen((prev) => !prev)}
          sx={{
            borderRadius: 2,
            px: 1.5,
            py: 0.75,
            transition: "all 0.2s ease",
            backgroundColor: isChildActive && !open ? "#4F46E5" : "transparent",
            border: "1px solid transparent",
            "&:hover": {
              backgroundColor: isChildActive && !open ? "#4338CA" : "rgba(79, 70, 229, 0.08)",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: 1.5,
              color: isChildActive ? "#FFFFFF" : "rgba(79, 70, 229, 0.7)",
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  fontWeight: isChildActive ? 700 : 500,
                  color: isChildActive ? "#FFFFFF" : "#6B6699",
                }}
              >
                {item.label}
              </Typography>
            }
          />
          <Box sx={{ color: isChildActive ? "#FFFFFF" : "rgba(79, 70, 229, 0.5)", display: "flex", alignItems: "center" }}>
            {open ? (
              <ExpandMoreIcon sx={{ fontSize: 16 }} />
            ) : (
              <ChevronRightIcon sx={{ fontSize: 16 }} />
            )}
          </Box>
        </ListItemButton>
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 2, mt: 0.25 }}>
          {visibleChildren.map((child) => {
            const isActive = child.path ? location.pathname === child.path : false;

            return (
              <ListItem key={child.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => child.path && onNavigate(child.path)}
                  sx={{
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.65,
                    transition: "all 0.2s ease",
                    backgroundColor: isActive ? "#4F46E5" : "transparent",
                    border: "1px solid transparent",
                    boxShadow: isActive ? "0px 2px 6px rgba(79, 70, 229, 0.15)" : "none",
                    "&:hover": {
                      backgroundColor: isActive ? "#4338CA" : "rgba(79, 70, 229, 0.08)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 1.25,
                      color: isActive ? "#FFFFFF" : "rgba(79, 70, 229, 0.7)",
                    }}
                  >
                    {child.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? "#FFFFFF" : "#6B6699",
                        }}
                      >
                        {child.label}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </Box>
  );
}

export default function CollapsibleNavGroup({
  title,
  icon = <AccessTimeIcon fontSize="small" />,
  items,
  isCollapsed = false,
  onNavigate,
}: CollapsibleNavGroupProps) {
  const location = useLocation();
  const { hasPermission } = usePermissions();

  // Filter items according to permissions & role rules
  const visibleItems = items.filter((item) => {
    if (item.children && item.children.length > 0) {
      return item.children.some((child) => !child.permission || hasPermission(child.permission));
    }
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  const isChildActive = visibleItems.some((item) => {
    if (item.children && item.children.length > 0) {
      return item.children.some((child) => child.path && location.pathname === child.path);
    }
    return item.path && location.pathname === item.path;
  });

  const [open, setOpen] = useState(isChildActive);

  // Auto-expand if active route changes to one of the child items
  useEffect(() => {
    if (isChildActive) {
      setOpen(true);
    }
  }, [isChildActive]);

  // If no sub-items are permitted for this user, do not render the group
  if (visibleItems.length === 0) {
    return null;
  }

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Box sx={{ mb: 1 }}>
      {/* Group Header Button */}
      <ListItem disablePadding>
        <ListItemButton
          onClick={handleToggle}
          sx={{
            borderRadius: 2.5,
            px: 1.5,
            py: 1,
            justifyContent: isCollapsed ? "center" : "space-between",
            transition: "all 0.2s ease",
            backgroundColor: isChildActive && !open ? "rgba(79, 70, 229, 0.08)" : "transparent",
            "&:hover": {
              backgroundColor: "rgba(79, 70, 229, 0.06)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <ListItemIcon
              sx={{
                minWidth: 0,
                color: isChildActive ? "#4F46E5" : "rgba(79, 70, 229, 0.6)",
                justifyContent: "center",
              }}
            >
              {icon}
            </ListItemIcon>
            {!isCollapsed && (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                  color: isChildActive ? "#4F46E5" : "#6B6699",
                  textTransform: "uppercase",
                }}
              >
                {title}
              </Typography>
            )}
          </Box>

          {!isCollapsed && (
            <Box sx={{ color: isChildActive ? "#4F46E5" : "rgba(79, 70, 229, 0.5)", display: "flex", alignItems: "center" }}>
              {open ? (
                <ExpandMoreIcon sx={{ fontSize: 18 }} />
              ) : (
                <ChevronRightIcon sx={{ fontSize: 18 }} />
              )}
            </Box>
          )}
        </ListItemButton>
      </ListItem>

      {/* Sub-Items List */}
      <Collapse in={open && !isCollapsed} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 1.5, mt: 0.5 }}>
          {visibleItems.map((item) => {
            if (item.children && item.children.length > 0) {
              return (
                <NestedSubGroupItem
                  key={item.label}
                  item={item}
                  onNavigate={onNavigate}
                />
              );
            }

            const isActive = item.path ? location.pathname === item.path : false;
            return (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => item.path && onNavigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.75,
                    transition: "all 0.2s ease",
                    backgroundColor: isActive ? "#4F46E5" : "transparent",
                    border: "1px solid transparent",
                    boxShadow: isActive ? "0px 2px 6px rgba(79, 70, 229, 0.15)" : "none",
                    "&:hover": {
                      backgroundColor: isActive ? "#4338CA" : "rgba(79, 70, 229, 0.08)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 1.5,
                      color: isActive ? "#FFFFFF" : "rgba(79, 70, 229, 0.7)",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontSize: "0.8125rem",
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? "#FFFFFF" : "#6B6699",
                        }}
                      >
                        {item.label}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </Box>
  );
}
