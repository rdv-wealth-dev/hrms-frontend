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
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";

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
        label: "My Leaves",
        icon: <PolicyOutlinedIcon fontSize="small" />,
        path: paths.leave,
    },
    {
        label: "Regularizations",
        icon: <CalendarMonthOutlinedIcon fontSize="small" />,
        path: paths.attendanceRegularizations,
        permission: "attendance.approve",
    },
    {
        label: "Leave Approvals",
        icon: <PolicyOutlinedIcon fontSize="small" />,
        path: paths.leaveApprovals,
        permission: "leave.approve",
    },
    {
        label: "Holidays",
        icon: <CalendarMonthOutlinedIcon fontSize="small" />,
        path: paths.holidays,
        permission: "leave.read",
    },
    {
        label: "Reports",
        icon: <AssessmentOutlinedIcon fontSize="small" />,
        path: paths.reports,
        permission: "report.read",
    },
    {
        label: "Settings",
        icon: <SettingsOutlinedIcon fontSize="small" />,
        path: paths.settings,
        permission: "settings.read",
    },
    {
        label: "Document Verification",
        icon: <FactCheckOutlinedIcon fontSize="small" />,
        path: paths.documentVerification,
        permission: "document.read",
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
                    backgroundColor: "#FFFFFF",
                    color: "#1E293B",
                    overflow: "hidden",
                    borderRight: "1px solid #E5E7EB",
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
                        <Box
                            sx={{
                                width: 34,
                                height: 34,
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, #6D5DF6 0%, #4F46E5 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                color: "#fff",
                                boxShadow: "0 2px 10px rgba(109, 93, 246, 0.3)",
                            }}
                        >
                            N
                        </Box>
                    ) : (
                        <>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 800, color: "#0F172A", letterSpacing: "-0.3px", lineHeight: 1.2 }}
                            >
                                NexusHR
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748B", fontSize: 11, mt: 0.5, fontWeight: 500 }}>
                                AI-Powered HRMS
                            </Typography>
                        </>
                    )}
                </Box>

                <Divider sx={{ borderColor: "#E5E7EB" }} />

                {/* Nav Items with Premium Custom Light Scrollbar */}
                <List
                    sx={{
                        px: 1.5,
                        py: 2,
                        flexGrow: 1,
                        overflowY: "auto",
                        minHeight: 0,
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(100, 116, 139, 0.25) transparent",
                        "&::-webkit-scrollbar": {
                            width: "5px",
                        },
                        "&::-webkit-scrollbar-track": {
                            backgroundColor: "transparent",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "rgba(100, 116, 139, 0.25)",
                            borderRadius: "10px",
                            transition: "background-color 0.2s ease",
                            "&:hover": {
                                backgroundColor: "rgba(100, 116, 139, 0.45)",
                            },
                        },
                        "&::-webkit-scrollbar-button": {
                            display: "none",
                        },
                    }}
                >
                    {visibleNavItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <ListItem key={item.label} disablePadding sx={{ mb: 0.8 }}>
                                <ListItemButton
                                    onClick={() => {
                                        navigate(item.path);
                                        setMobileOpen(false);
                                    }}
                                    sx={{
                                        borderRadius: 2.5,
                                        px: 1.5,
                                        py: 1,
                                        justifyContent: isCollapsed ? "center" : "initial",
                                        transition: "all 0.2s ease",
                                        backgroundColor: isActive
                                            ? "#EEF2FF"
                                            : "transparent",
                                        border: isActive
                                            ? "1px solid #C7D2FE"
                                            : "1px solid transparent",
                                        boxShadow: isActive
                                            ? "0 2px 8px rgba(99, 102, 241, 0.1)"
                                            : "none",
                                        "&:hover": {
                                            backgroundColor: isActive
                                                ? "#E0E7FF"
                                                : "#F1F5F9",
                                            border: isActive
                                                ? "1px solid #A5B4FC"
                                                : "1px solid transparent",
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: isCollapsed ? 0 : 34,
                                            mr: isCollapsed ? 0 : 0,
                                            justifyContent: "center",
                                            color: isActive ? "#6D5DF6" : "#64748B",
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
                                                        fontWeight: isActive ? 700 : 500,
                                                        color: isActive ? "#4F46E5" : "#334155",
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

                <Divider sx={{ borderColor: "#E5E7EB" }} />

                {/* User Footer Container */}
                <Box sx={{ px: isCollapsed ? 1.5 : 2, py: 2, flexShrink: 0 }}>
                    <Box
                        sx={{
                            p: isCollapsed ? 1 : 1.2,
                            borderRadius: 3,
                            backgroundColor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                        }}
                    >
                        <Box
                            onClick={() => navigate(paths.profile)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: isCollapsed ? "center" : "flex-start",
                                gap: isCollapsed ? 0 : 1.5,
                                mb: 1,
                                cursor: "pointer",
                                padding: "6px",
                                borderRadius: "8px",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    backgroundColor: "#F1F5F9",
                                },
                            }}
                        >
                            {!isCollapsed && (
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "#0F172A",
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
                                            color: "#64748B",
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
                                px: 1.2,
                                py: 0.75,
                                justifyContent: isCollapsed ? "center" : "initial",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    backgroundColor: "#FEF2F2",
                                    color: "#EF4444",
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: isCollapsed ? 0 : 30,
                                    color: "#64748B",
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
                                                fontWeight: 500,
                                                color: "#475569",
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
            </Box>
        );
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F5F6FA", width: "100%", maxWidth: "100vw", overflowX: "hidden" }}>
            {/* Mobile hamburger */}
            <Box
                sx={{
                    display: { xs: mobileOpen ? "none" : "flex", md: "none" },
                    position: "fixed",
                    top: 12,
                    left: 12,
                    zIndex: 1300,
                }}
            >
                <IconButton
                    onClick={() => setMobileOpen(true)}
                    sx={{ backgroundColor: "#FFFFFF", color: "#0F172A", border: "1px solid #E2E8F0", borderRadius: 2, boxShadow: "0px 2px 8px rgba(0,0,0,0.06)" }}
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
                        borderRight: "1px solid #E5E7EB",
                        backgroundColor: "#FFFFFF",
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
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                        border: "1px solid #E2E8F0",
                        width: 28,
                        height: 28,
                        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                        "&:hover": {
                            backgroundColor: "#F8FAFC",
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
                        borderRight: "1px solid #E5E7EB",
                        backgroundColor: "#FFFFFF",
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
                    minWidth: 0,
                    maxWidth: "100%",
                    width: { md: `calc(100% - ${sidebarWidth}px)` },
                    backgroundColor: "#F5F6FA",
                    transition: "margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    overflowX: "hidden",
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

export default DashboardLayout;