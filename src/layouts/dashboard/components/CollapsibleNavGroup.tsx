import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
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
  permanentOpen?: boolean;
}

function NestedSubGroupItem({
  item,
  onNavigate,
  permanentOpen,
}: {
  item: NavSubItem;
  onNavigate: (path: string) => void;
  permanentOpen?: boolean;
}) {
  const location = useLocation();
  const { hasPermission } = usePermissions();

  const visibleChildren = (item?.children || []).filter((child) => {
    if (!child?.permission) return true;
    return hasPermission(child.permission);
  });

  const isChildActive = visibleChildren.some((child) => child?.path && location.pathname === child.path);
  const [open, setOpen] = useState(permanentOpen || isChildActive);

  useEffect(() => {
    if (permanentOpen) {
      setOpen(true);
    } else if (isChildActive) {
      setOpen(true);
    }
  }, [isChildActive, permanentOpen]);

  if (visibleChildren.length === 0) return null;

  return (
    <Box sx={{ mb: 0.5 }}>
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        {permanentOpen ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              width: "100%",
              px: 1.25,
              py: 0.85,
              borderRadius: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 0,
                color: isChildActive ? "#A855F7" : "rgba(168, 85, 247, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item?.icon}
            </ListItemIcon>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: isChildActive ? "#A855F7" : "#475569",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.2,
              }}
            >
              {item?.label}
            </Typography>
          </Box>
        ) : (
          <ListItemButton
            onClick={() => setOpen((prev) => !prev)}
            sx={{
              borderRadius: 2.5,
              px: 1.25,
              py: 0.85,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.25,
              transition: "all 0.2s ease",
              backgroundColor: isChildActive && !open ? "rgba(168, 85, 247, 0.08)" : "transparent",
              border: "1px solid transparent",
              "&:hover": {
                backgroundColor: "rgba(168, 85, 247, 0.08)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, flexGrow: 1 }}>
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 0,
                  color: isChildActive ? "#A855F7" : "rgba(168, 85, 247, 0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item?.icon}
              </ListItemIcon>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: isChildActive ? 600 : 500,
                  color: isChildActive ? "#A855F7" : "#475569",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.2,
                }}
              >
                {item?.label}
              </Typography>
            </Box>
            <Box sx={{ color: isChildActive ? "#A855F7" : "rgba(168, 85, 247, 0.5)", display: "flex", alignItems: "center", flexShrink: 0 }}>
              {open ? (
                <ExpandMoreIcon sx={{ fontSize: 16 }} />
              ) : (
                <ChevronRightIcon sx={{ fontSize: 16 }} />
              )}
            </Box>
          </ListItemButton>
        )}
      </ListItem>

      <Collapse in={permanentOpen || open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: permanentOpen ? 0 : 1, mt: 0.25 }}>
          {visibleChildren.map((child) => {
            const isActive = child?.path ? location.pathname === child.path : false;

            return (
              <ListItem key={child?.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => child?.path && onNavigate(child.path)}
                  sx={{
                    borderRadius: 2.5,
                    px: 1.25,
                    py: 0.85,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    transition: "all 0.2s ease",
                    background: isActive ? "linear-gradient(135deg, #A855F7 0%, #8B5CF6 100%)" : "transparent",
                    border: "1px solid transparent",
                    boxShadow: isActive ? "0px 4px 14px rgba(168, 85, 247, 0.25)" : "none",
                    "&:hover": {
                      background: isActive
                        ? "linear-gradient(135deg, #B76EF9 0%, #9A6FF8 100%)"
                        : "rgba(168, 85, 247, 0.08)",
                      border: "1px solid transparent",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 0,
                      color: isActive ? "#FFFFFF" : "#A855F7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {child?.icon}
                  </ListItemIcon>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#FFFFFF" : "#475569",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.2,
                    }}
                  >
                    {child?.label}
                  </Typography>
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
  permanentOpen,
}: CollapsibleNavGroupProps) {
  const location = useLocation();
  const { hasPermission } = usePermissions();

  // Filter items according to permissions & role rules
  const visibleItems = items.filter((item) => {
    if (item?.children) {
      return (
        item.children.length > 0 &&
        item.children.some((child) => !child?.permission || hasPermission(child.permission))
      );
    }
    if (!item?.permission) return true;
    return hasPermission(item.permission);
  });

  const isChildActive = visibleItems.some((item) => {
    if (item?.children && item.children.length > 0) {
      return item.children.some((child) => child?.path && location.pathname === child.path);
    }
    return item?.path && location.pathname === item.path;
  });

  const [open, setOpen] = useState(permanentOpen || isChildActive);

  // Auto-expand if active route changes to one of the child items
  useEffect(() => {
    if (permanentOpen) {
      setOpen(true);
    } else if (isChildActive) {
      setOpen(true);
    }
  }, [isChildActive, permanentOpen]);

  // If no sub-items are permitted for this user, do not render the group
  if (visibleItems.length === 0) {
    return null;
  }

  const handleToggle = () => {
    if (!permanentOpen) {
      setOpen((prev) => !prev);
    }
  };

  return (
    <Box sx={{ mb: 1 }}>
      {/* Group Header Button */}
      <ListItem disablePadding>
        {permanentOpen ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              width: "100%",
              px: 1.5,
              py: 1,
              justifyContent: isCollapsed ? "center" : "initial",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: isCollapsed ? 0 : 34,
                mr: 0,
                color: isChildActive ? "#A855F7" : "#A855F7",
                justifyContent: "center",
              }}
            >
              {icon}
            </ListItemIcon>
            {!isCollapsed && (
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: isChildActive ? "#A855F7" : "#475569",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.2,
                }}
              >
                {title}
              </Typography>
            )}
          </Box>
        ) : (
          <ListItemButton
            onClick={handleToggle}
            sx={{
              borderRadius: 2.5,
              px: 1.5,
              py: 1,
              justifyContent: isCollapsed ? "center" : "space-between",
              transition: "all 0.2s ease",
              backgroundColor: isChildActive && !open ? "rgba(168, 85, 247, 0.08)" : "transparent",
              border: "1px solid transparent",
              "&:hover": {
                backgroundColor: "rgba(168, 85, 247, 0.08)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  color: isChildActive ? "#A855F7" : "#A855F7",
                  justifyContent: "center",
                }}
              >
                {icon}
              </ListItemIcon>
              {!isCollapsed && (
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: isChildActive ? "#A855F7" : "#475569",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.2,
                  }}
                >
                  {title}
                </Typography>
              )}
            </Box>

            {!isCollapsed && (
              <Box sx={{ color: isChildActive ? "#A855F7" : "rgba(168, 85, 247, 0.5)", display: "flex", alignItems: "center" }}>
                {open ? (
                  <ExpandMoreIcon sx={{ fontSize: 18 }} />
                ) : (
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                )}
              </Box>
            )}
          </ListItemButton>
        )}
      </ListItem>

      {/* Sub-Items List */}
      <Collapse in={permanentOpen ? !isCollapsed : open && !isCollapsed} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: permanentOpen ? 0 : 1, mt: 0.5 }}>
          {visibleItems.map((item) => {
            if (item?.children && item.children.length > 0) {
              return (
                <NestedSubGroupItem
                  key={item?.label}
                  item={item}
                  onNavigate={onNavigate}
                  permanentOpen={permanentOpen}
                />
              );
            }

            const isActive = item?.path ? location.pathname === item.path : false;
            return (
              <ListItem key={item?.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => item?.path && onNavigate(item.path)}
                  sx={{
                    borderRadius: 2.5,
                    px: 1.25,
                    py: 0.85,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    transition: "all 0.2s ease",
                    background: isActive ? "linear-gradient(135deg, #A855F7 0%, #8B5CF6 100%)" : "transparent",
                    border: "1px solid transparent",
                    boxShadow: isActive ? "0px 4px 14px rgba(168, 85, 247, 0.25)" : "none",
                    "&:hover": {
                      background: isActive
                        ? "linear-gradient(135deg, #B76EF9 0%, #9A6FF8 100%)"
                        : "rgba(168, 85, 247, 0.08)",
                      border: "1px solid transparent",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 0,
                      color: isActive ? "#FFFFFF" : "#A855F7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item?.icon}
                  </ListItemIcon>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#FFFFFF" : "#475569",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.2,
                    }}
                  >
                    {item?.label}
                  </Typography>
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </Box>
  );
}
