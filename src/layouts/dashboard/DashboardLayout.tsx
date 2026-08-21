import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
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
import Button from "@mui/material/Button";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PolicyIcon from "@mui/icons-material/Policy";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// CollapsibleNavGroup import removed (flattened menu)

import type { AppDispatch } from "../../store/store";
import { logout } from "../../store/auth";
import { logoutUser } from "../../api/auth.api";

import { paths } from "../../routes/paths";
import type { RootState } from "../../store/rootReducer";
import { usePermissions } from "../../hooks/usePermissions";
import { OnboardingBanner } from "../../components/common/OnboardingBanner";

import { getPendingLeaveRequests } from "../../api/leave.api";
import { getPendingRegularizationRequests } from "../../api/attendance.api";

interface NavItem {
    label: string;
    icon: React.ReactNode;
    path: string;
    permission?: string;
}

const topNavItems: NavItem[] = [
    {
        label: "Dashboard",
        icon: <DashboardIcon fontSize="small" />,
        path: paths.dashboard,
    },
    {
        label: "Employees",
        icon: <PeopleAltIcon fontSize="small" />,
        path: paths.employees.list,
        permission: "employee.read",
    },
    {
        label: "Attendance Report",
        icon: <AssessmentIcon fontSize="small" />,
        path: paths.reports,
        permission: "report.read",
    },
    {
        label: "Leave Management",
        icon: <PolicyIcon fontSize="small" />,
        path: paths.leave,
        permission: "leave.read",
    },
    {
        label: "Regularization",
        icon: <CalendarMonthIcon fontSize="small" />,
        path: paths.attendanceRegularizations,
        permission: "leave.read",
    },
    {
        label: "Holiday",
        icon: <CalendarMonthIcon fontSize="small" />,
        path: paths.holidays,
        permission: "leave.read",
    },
];

const bottomNavItems: NavItem[] = [
    {
        label: "Document Verification",
        icon: <FactCheckIcon fontSize="small" />,
        path: paths.documentVerification,
        permission: "document.read",
    },
    {
        label: "Settings",
        icon: <SettingsIcon fontSize="small" />,
        path: paths.settings,
        permission: "settings.read",
    },
    {
        label: "My Profile",
        icon: <PersonIcon fontSize="small" />,
        path: paths.profile,
    },
];

function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const showBackButton = location.pathname !== paths.dashboard;
    const dispatch = useDispatch<AppDispatch>();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const [pendingLeaveCount, setPendingLeaveCount] = useState<number>(0);
    const [pendingRegCount, setPendingRegCount] = useState<number>(0);

    const user = useSelector((state: RootState) => state.auth?.user);
    const { role, hasPermission } = usePermissions();

    const extractArrayCount = (res: any): number => {
        if (!res) return 0;
        let list: any[] = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res.data)) list = res.data;
        else if (Array.isArray(res.items)) list = res.items;
        else if (Array.isArray(res.data?.items)) list = res.data.items;
        else if (Array.isArray(res.requests)) list = res.requests;
        else if (Array.isArray(res.regularizations)) list = res.regularizations;

        if (list.length > 0) {
            const pendingList = list.filter((item) => {
                if (!item || typeof item !== "object") return false;
                const status = String(item.status || item.approvalStatus || item.requestStatus || "").toUpperCase();
                return status === "PENDING" || status === "SUBMITTED" || status === "REQUESTED";
            });
            return pendingList.length;
        }

        return 0;
    };

    useEffect(() => {
        if (role && role !== "EMPLOYEE") {
            getPendingLeaveRequests(1, 100)
                .then((res) => {
                    setPendingLeaveCount(extractArrayCount(res));
                })
                .catch(() => {});

            getPendingRegularizationRequests()
                .then((res) => {
                    setPendingRegCount(extractArrayCount(res));
                })
                .catch(() => {});
        }
    }, [role]);

    const filterNavItems = (items: NavItem[]) =>
        items.filter((item) => {
            if (!item.permission) return true;
            return hasPermission(item.permission);
        });

    const visibleTopItems = filterNavItems(topNavItems);
    const visibleBottomItems = filterNavItems(bottomNavItems);

    const sidebarWidth = collapsed ? 76 : 240;

    const getItemLabel = (item: NavItem) => {
        if (role === "EMPLOYEE") {
            if (item.path === paths.reports) return "My Attendance";
            if (item.path === paths.leave) return "My Leaves";
        }
        return item.label;
    };

    const getBadgeCount = (item: NavItem) => {
        if (role === "EMPLOYEE") return 0;
        if (item.path === paths.leaveApprovals || item.path === paths.leave) return pendingLeaveCount;
        if (item.path === paths.attendanceRegularizations) return pendingRegCount;
        return 0;
    };

    const renderNavListItem = (item: NavItem, isCollapsed = false) => {
        const isActive = location.pathname === item.path;
        const badgeCount = getBadgeCount(item);

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
                        justify: isCollapsed ? "center" : "initial",
                        transition: "all 0.2s ease",
                        backgroundColor: isActive ? "#4F46E5" : "transparent",
                        border: "1px solid transparent",
                        boxShadow: isActive ? "0px 2px 6px rgba(79, 70, 229, 0.2)" : "none",
                        "&:hover": {
                            backgroundColor: isActive ? "#4338CA" : "rgba(79, 70, 229, 0.08)",
                            border: "1px solid transparent",
                        },
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: isCollapsed ? 0 : 34,
                            mr: isCollapsed ? 0 : 0,
                            justifyContent: "center",
                            color: isActive ? "#FFFFFF" : "rgba(79, 70, 229, 0.7)",
                        }}
                    >
                        {item.icon}
                    </ListItemIcon>
                    {!isCollapsed && (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                            <Typography
                                sx={{
                                    fontSize: 14,
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? "#FFFFFF" : "#6B6699",
                                }}
                            >
                                {getItemLabel(item)}
                            </Typography>
                            {badgeCount > 0 && (
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        backgroundColor: "#EF4444",
                                        boxShadow: "0 0 6px rgba(239, 68, 68, 0.6)",
                                        flexShrink: 0,
                                        ml: 1,
                                    }}
                                />
                            )}
                        </Box>
                    )}
                </ListItemButton>
            </ListItem>
        );
    };

    const renderSidebarContent = (isMobile = false) => {
        const isCollapsed = !isMobile && collapsed;
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    background: "#EDEBFC",
                    color: "#312E81",
                    overflow: "hidden",
                    borderRight: "1px solid #DAD7F2",
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
                            <Typography variant="h6" sx={{ fontWeight: 800, color: "#312E81", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                                NexusHR
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#6366F1", fontSize: 11, mt: 0.5, fontWeight: 500 }}>
                                AI-Powered HRMS
                            </Typography>
                        </>
                    )}
                </Box>

                <Divider sx={{ borderColor: "#DAD7F2" }} />

                {/* Nav Items with Premium Custom Light Scrollbar */}
                <List
                    sx={{
                        px: 1.5,
                        py: 2,
                        flexGrow: 1,
                        overflowY: "auto",
                        minHeight: 0,
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(99, 102, 241, 0.2) transparent",
                        "&::-webkit-scrollbar": {
                            width: "5px",
                        },
                        "&::-webkit-scrollbar-track": {
                            backgroundColor: "transparent",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "rgba(99, 102, 241, 0.2)",
                            borderRadius: "10px",
                            transition: "background-color 0.2s ease",
                            "&:hover": {
                                backgroundColor: "rgba(99, 102, 241, 0.4)",
                            },
                        },
                        "&::-webkit-scrollbar-button": {
                            display: "none",
                        },
                    }}
                >
                    {/* Top Standalone Nav Items */}
                    {visibleTopItems.map((item) => renderNavListItem(item, isCollapsed))}

                    {/* TIME & LEAVE categories are flattened into topNavItems */}

                    {/* Bottom Standalone Nav Items */}
                    {visibleBottomItems.map((item) => renderNavListItem(item, isCollapsed))}
                </List>

                <Divider sx={{ borderColor: "#DAD7F2" }} />

                {/* User Footer Container */}
                <Box sx={{ px: isCollapsed ? 1.5 : 2, py: 2, flexShrink: 0 }}>
                    <Box
                        sx={{
                            p: isCollapsed ? 1 : 1.2,
                            borderRadius: 3,
                            backgroundColor: "rgba(79, 70, 229, 0.05)",
                            border: "1px solid #DAD7F2",
                            boxShadow: "none",
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
                                    backgroundColor: "rgba(79, 70, 229, 0.08)",
                                },
                            }}
                        >
                            {!isCollapsed && (
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "#312E81",
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
                                            color: "#6B6699",
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
                            onClick={async () => {
                                try {
                                    await logoutUser();
                                } catch {
                                    // Swallow — always clear local session regardless of API result
                                } finally {
                                    dispatch(logout());
                                    navigate(paths.auth.login, { replace: true });
                                }
                            }}
                            sx={{
                                borderRadius: 2,
                                px: 1.2,
                                py: 0.75,
                                justifyContent: isCollapsed ? "center" : "initial",
                                transition: "all 0.2s ease",
                                color: "#6B6699",
                                "&:hover": {
                                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                                    color: "#EF4444",
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: isCollapsed ? 0 : 30,
                                    color: "rgba(79, 70, 229, 0.7)",
                                    justifyContent: "center",
                                }}
                            >
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            {!isCollapsed && (
                                <ListItemText
                                    primary={
                                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
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
                        borderRight: "1px solid #DAD7F2",
                        background: "#EDEBFC",
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
                        borderRight: "1px solid #DAD7F2",
                        background: "#EDEBFC",
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
                {/* Top Navbar */}
                <Box
                    component="header"
                    sx={{
                        height: { xs: 56, sm: 64 },
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
                        position: "fixed",
                        top: 0,
                        right: 0,
                        left: { xs: 0, md: `${sidebarWidth}px` },
                        zIndex: 1200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: { xs: 2, sm: 3, md: 4 },
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                        transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                >
                    {/* Left: Mobile hamburger menu trigger */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                            onClick={() => setMobileOpen(true)}
                            sx={{
                                display: { xs: "inline-flex", md: "none" },
                                color: "#475569",
                                p: 1,
                                borderRadius: "8px",
                                "&:hover": { backgroundColor: "#F1F5F9" },
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>

                    {/* Right: Back Button */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        {showBackButton && (
                            <Button
                                variant="text"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate(-1)}
                                sx={{
                                    textTransform: "none",
                                    color: "#64748B",
                                    fontWeight: 600,
                                    fontSize: "14px",
                                    px: 1.5,
                                    py: 0.75,
                                    borderRadius: "8px",
                                    "&:hover": { color: "#6D5DF6", backgroundColor: "rgba(109, 93, 246, 0.06)" },
                                }}
                            >
                                Back
                            </Button>
                        )}
                    </Box>
                </Box>

                {/* Navbar Fixed Offset Spacer */}
                <Box sx={{ height: { xs: 56, sm: 64 } }} />

                <OnboardingBanner />
                <Outlet />
            </Box>
        </Box>
    );
}

export default DashboardLayout;