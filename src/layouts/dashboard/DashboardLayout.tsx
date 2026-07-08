import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";

import type { AppDispatch } from "../../store/store";
import { logout } from "../../store/auth";

import { paths } from "../../routes/paths";
import type { RootState } from "../../store/rootReducer";
import { usePermissions } from "../../hooks/usePermissions";

const navItems = [
    {
        label: "Dashboard",
        icon: <DashboardOutlinedIcon fontSize="small" />,
        path: paths.dashboard,
    },
    {
        label: "Employees",
        icon: <PeopleAltOutlinedIcon fontSize="small" />,
        path: paths.employees.list,
        permission: "employee.read",
    },
    {
        label: "Branches",
        icon: <ApartmentOutlinedIcon fontSize="small" />,
        path: paths.branches,
        permission: "branch.read",
    },
    {
        label: "My Attendance",
        icon: <CalendarMonthOutlinedIcon fontSize="small" />,
        path: paths.attendance,
    },
    {
        label: "Settings",
        icon: <SettingsOutlinedIcon fontSize="small" />,
        path: paths.settings,
        permission: "settings.read",
    },
];

type Props = {
    children: React.ReactNode;
};

function DashboardLayout({ children }: Props) {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const user = useSelector((state: RootState) => state.auth?.user);
    const { hasPermission, role } = usePermissions();

    const visibleNavItems = navItems.filter((item) => {
        if (item.label === "My Attendance" && role === "ORG_ADMIN") {
            return false;
        }
        if (!item.permission) return true;
        return hasPermission(item.permission);
    });

    const sidebarWidth = collapsed ? 76 : 240;

    const renderSidebarContent = (isMobile = false) => {
        const isCollapsed = !isMobile && collapsed;
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    backgroundColor: "#1E1B4B",
                    color: "#fff",
                    overflow: "hidden",
                }}
            >
                {/* Logo */}
                <Box
                    sx={{
                        px: isCollapsed ? 2.5 : 3,
                        py: 3,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isCollapsed ? "center" : "flex-start",
                        minHeight: 88,
                        boxSizing: "border-box",
                    }}
                >
                    {isCollapsed ? (
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: "#fff", lineHeight: 1 }}
                        >
                            N
                        </Typography>
                    ) : (
                        <>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 700, color: "#fff", letterSpacing: "-0.3px", lineHeight: 1.2 }}
                            >
                                NexusHR
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#A5B4FC", fontSize: 11, mt: 0.5 }}>
                                AI-Powered HRMS
                            </Typography>
                        </>
                    )}
                </Box>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

                {/* Nav Items */}
                <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
                    {visibleNavItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => {
                                        navigate(item.path);
                                        setMobileOpen(false);
                                    }}
                                    sx={{
                                        borderRadius: 2,
                                        px: 1.5,
                                        py: 1,
                                        justifyContent: isCollapsed ? "center" : "initial",
                                        backgroundColor: isActive
                                            ? "rgba(99,102,241,0.25)"
                                            : "transparent",
                                        "&:hover": {
                                            backgroundColor: isActive
                                                ? "rgba(99,102,241,0.3)"
                                                : "rgba(255,255,255,0.06)",
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: isCollapsed ? 0 : 34,
                                            mr: isCollapsed ? 0 : 0,
                                            justifyContent: "center",
                                            color: isActive ? "#818CF8" : "rgba(255,255,255,0.5)",
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    {!isCollapsed && (
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    sx={{
                                                        fontSize: 14,
                                                        fontWeight: isActive ? 600 : 400,
                                                        color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                                                    }}
                                                >
                                                    {item.label}
                                                </Typography>
                                            }
                                        />
                                    )}
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

                {/* User Footer */}
                <Box sx={{ px: isCollapsed ? 1.5 : 2, py: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: isCollapsed ? "center" : "flex-start",
                            gap: isCollapsed ? 0 : 1.5,
                            mb: 1.5,
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 34,
                                height: 34,
                                backgroundColor: "#6D5DF6",
                                fontSize: 13,
                                fontWeight: 600,
                            }}
                        >
                            {user?.firstName?.[0]?.toUpperCase() ?? "U"}
                            {user?.lastName?.[0]?.toUpperCase() ?? ""}
                        </Avatar>
                        {!isCollapsed && (
                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#fff",
                                        fontWeight: 600,
                                        fontSize: 13,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "User"}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: "rgba(255,255,255,0.5)",
                                        fontSize: 11,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        display: "block",
                                    }}
                                >
                                    {user?.role
                                        ? user.role
                                            .split("_")
                                            .map(
                                                (w) =>
                                                    w.charAt(0).toUpperCase() +
                                                    w.slice(1).toLowerCase()
                                            )
                                            .join(" ")
                                        : ""}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <ListItemButton
                        onClick={() => {
                            dispatch(logout());
                            navigate(paths.auth.login);
                        }}
                        sx={{
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.75,
                            justifyContent: isCollapsed ? "center" : "initial",
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: isCollapsed ? 0 : 30,
                                color: "rgba(255,255,255,0.4)",
                                justifyContent: "center",
                            }}
                        >
                            <LogoutOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        {!isCollapsed && (
                            <ListItemText
                                primary={
                                    <Typography
                                        sx={{
                                            fontSize: 13,
                                            color: "rgba(255,255,255,0.55)",
                                        }}
                                    >
                                        Logout
                                    </Typography>
                                }
                            />
                        )}
                    </ListItemButton>
                </Box>
            </Box>
        );
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F5F6FA" }}>
            {/* Mobile hamburger */}
            <Box
                sx={{
                    display: { xs: "flex", md: "none" },
                    position: "fixed",
                    top: 12,
                    left: 12,
                    zIndex: 1300,
                }}
            >
                <IconButton
                    onClick={() => setMobileOpen(true)}
                    sx={{ backgroundColor: "#1E1B4B", color: "#fff", borderRadius: 2 }}
                >
                    <MenuIcon />
                </IconButton>
            </Box>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        width: 240,
                        border: "none",
                    },
                }}
            >
                {renderSidebarContent(true)}
            </Drawer>

            {/* Desktop Sidebar Toggle Button */}
            <Box
                sx={{
                    display: { xs: "none", md: "block" },
                    position: "fixed",
                    top: 30,
                    left: collapsed ? 62 : 226,
                    zIndex: 1300,
                    transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <IconButton
                    onClick={() => setCollapsed(!collapsed)}
                    sx={{
                        backgroundColor: "#1E1B4B",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.12)",
                        width: 28,
                        height: 28,
                        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
                        "&:hover": {
                            backgroundColor: "#2E2A6B",
                        },
                    }}
                >
                    {collapsed ? (
                        <ChevronRightIcon sx={{ fontSize: 18 }} />
                    ) : (
                        <ChevronLeftIcon sx={{ fontSize: 18 }} />
                    )}
                </IconButton>
            </Box>

            {/* Desktop Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", md: "block" },
                    "& .MuiDrawer-paper": {
                        width: sidebarWidth,
                        border: "none",
                        boxSizing: "border-box",
                        transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        overflowX: "hidden",
                    },
                }}
                open
            >
                {renderSidebarContent(false)}
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    ml: { md: `${sidebarWidth}px` },
                    minHeight: "100vh",
                    backgroundColor: "#F5F6FA",
                    transition: "margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

export default DashboardLayout;