import { useState, useEffect, useRef } from "react";
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
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import Badge from "@mui/material/Badge";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import CustomAvatar from "../../components/avatar/CustomAvatar";

// CollapsibleNavGroup import removed (flattened menu)

import type { AppDispatch } from "../../store/store";
import { logout } from "../../store/auth";
import { logoutUser } from "../../api/auth.api";

import { paths } from "../../routes/paths";
import type { RootState } from "../../store/rootReducer";
import { usePermissions } from "../../hooks/usePermissions";
import { useModalTrigger } from "../../hooks/useModalTrigger";
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

    // Keep a stable focus target for the temporary mobile Drawer.
    // When the Drawer closes, focus is restored to the element that opened it.
    const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

    const handleMobileMenuOpen = useModalTrigger(() => setMobileOpen(true));

    const restoreMobileMenuFocus = () => {
        // Let MUI finish the Drawer close/Modal transition before restoring focus.
        requestAnimationFrame(() => {
            mobileMenuButtonRef.current?.focus();
        });
    };

    const handleMobileDrawerClose = () => {
        setMobileOpen(false);
        restoreMobileMenuFocus();
    };

    const handleMobileNavigation = (targetPath: string) => {
        navigate(targetPath);
        setMobileOpen(false);
        restoreMobileMenuFocus();
    };

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

    const getItemTarget = (item: NavItem) => {
        if (role === "EMPLOYEE") {
            if (item.path === paths.reports) return paths.reports;
            if (item.path === paths.leave) return paths.leave;
        }
        return item.path;
    };

    const isItemActive = (item: NavItem) => {
        if (role === "EMPLOYEE") {
            const searchParams = new URLSearchParams(location.search);
            const currentTab = searchParams.get("tab");

            if (item.path === paths.reports) {
                return location.pathname === paths.reports || (location.pathname === paths.profile && currentTab === "attendance");
            }
            if (item.path === paths.leave) {
                return location.pathname === paths.profile && currentTab === "leave";
            }
            if (item.path === paths.profile) {
                return (
                    location.pathname === paths.profile &&
                    (!currentTab || (currentTab !== "attendance" && currentTab !== "leave"))
                );
            }
        }
        return location.pathname === item.path;
    };

    const getBadgeCount = (item: NavItem) => {
        if (role === "EMPLOYEE") return 0;
        if (item.path === paths.leaveApprovals || item.path === paths.leave) return pendingLeaveCount;
        if (item.path === paths.attendanceRegularizations) return pendingRegCount;
        return 0;
    };

    const renderNavListItem = (item: NavItem, isCollapsed = false) => {
        const targetPath = getItemTarget(item);
        const isActive = isItemActive(item);
        const badgeCount = getBadgeCount(item);

        return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.8 }}>
                <ListItemButton
                    onClick={() => {
                        handleMobileNavigation(targetPath);
                    }}
                    sx={{
                        borderRadius: 2.5,
                        px: 1.5,
                        py: 1,
                        justify: isCollapsed ? "center" : "initial",
                        transition: "all 0.2s ease",
                        background: isActive ? "linear-gradient(135deg, #A855F7 0%, #8B5CF6 100%)" : "transparent",
                        border: "1px solid transparent",
                        boxShadow: isActive ? "0px 4px 14px rgba(168, 85, 247, 0.25)" : "none",
                        "&:hover": {
                            background: isActive ? "linear-gradient(135deg, #B76EF9 0%, #9A6FF8 100%)" : "rgba(168, 85, 247, 0.08)",
                            border: "1px solid transparent",
                        },
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: isCollapsed ? 0 : 34,
                            mr: isCollapsed ? 0 : 0,
                            justifyContent: "center",
                            color: isActive ? "#FFFFFF" : "#A855F7",
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
                                    color: isActive ? "#FFFFFF" : "#475569",
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
                    backgroundColor: "background.paper",
                    color: "text.primary",
                    overflow: "hidden",
                    borderRight: "1px solid",
                    borderColor: "divider",
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
                                background: "linear-gradient(135deg, #A855F7 0%, #8B5CF6 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                color: "#fff",
                                boxShadow: "0 2px 10px rgba(168, 85, 247, 0.3)",
                            }}
                        >
                            N
                        </Box>
                    ) : (
                        <>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1E1B4B", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                                NexusHR
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#A855F7", fontSize: 11, mt: 0.5, fontWeight: 600 }}>
                                AI-Powered HRMS
                            </Typography>
                        </>
                    )}
                </Box>

                <Divider sx={{ borderColor: "divider" }} />

                {/* Nav Items with Premium Custom Light Scrollbar */}
                <List
                    sx={{
                        px: 1.5,
                        py: 2,
                        flexGrow: 1,
                        overflowY: "auto",
                        minHeight: 0,
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(168, 85, 247, 0.2) transparent",
                        "&::-webkit-scrollbar": {
                            width: "5px",
                        },
                        "&::-webkit-scrollbar-track": {
                            backgroundColor: "transparent",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "rgba(168, 85, 247, 0.2)",
                            borderRadius: "10px",
                            transition: "background-color 0.2s ease",
                            "&:hover": {
                                backgroundColor: "rgba(168, 85, 247, 0.35)",
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

                <Divider sx={{ borderColor: "divider" }} />

                {/* User Footer Container */}
                <Box sx={{ px: isCollapsed ? 1.5 : 2, py: 2, flexShrink: 0 }}>
                    <Box
                        sx={{
                            p: isCollapsed ? 1 : 1.2,
                            borderRadius: 3,
                            backgroundColor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: "none",
                        }}
                    >
                        <Box
                            onClick={() => {
                                handleMobileNavigation(paths.profile);
                            }}
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
                                    backgroundColor: "rgba(168, 85, 247, 0.08)",
                                },
                            }}
                        >
                            {!isCollapsed && (
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "#1E1B4B",
                                            fontWeight: 700,
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
                                            fontWeight: 500,
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
                                color: "#64748B",
                                "&:hover": {
                                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                                    color: "#EF4444",
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: isCollapsed ? 0 : 30,
                                    color: "#A855F7",
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
                id="mobile-navigation-drawer"
                variant="temporary"
                open={mobileOpen}
                onClose={handleMobileDrawerClose}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        width: 240,
                        borderRight: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "background.paper",
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
                        backgroundColor: "background.paper",
                        color: "text.primary",
                        border: "1px solid",
                        borderColor: "divider",
                        width: 28,
                        height: 28,
                        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
                        "&:hover": {
                            backgroundColor: "action.hover",
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
                        borderRight: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "background.paper",
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
                            ref={mobileMenuButtonRef}
                            aria-label="Open navigation menu"
                            aria-expanded={mobileOpen}
                            aria-controls="mobile-navigation-drawer"
                            onClick={handleMobileMenuOpen}
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

                    {/* Right: Search, Notifications, Avatar, & Back Button */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5, md: 2 } }}>
                        {/* Search Bar */}
                        <OutlinedInput
                            placeholder="Search employees, reports, actions..."
                            size="small"
                            startAdornment={
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "#9CA3AF", fontSize: 20 }} />
                                </InputAdornment>
                            }
                            endAdornment={
                                <InputAdornment position="end">
                                    <Box
                                        sx={{
                                            px: 0.8,
                                            py: 0.2,
                                            borderRadius: 1,
                                            backgroundColor: "#F3F4F6",
                                            border: "1px solid #E5E7EB",
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            color: "#6B7280",
                                            display: { xs: "none", sm: "inline-flex" },
                                            alignItems: "center",
                                        }}
                                    >
                                        ⌘ K
                                    </Box>
                                </InputAdornment>
                            }
                            sx={{
                                width: { xs: 150, sm: 240, md: 300 },
                                borderRadius: 2.5,
                                backgroundColor: "#FFFFFF",
                                fontSize: "0.85rem",
                                "& fieldset": {
                                    borderColor: "#E5E7EB",
                                },
                                "&:hover fieldset": {
                                    borderColor: "#D1D5DB",
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: "primary.main",
                                },
                            }}
                        />

                        {/* Notifications Bell */}
                        <IconButton
                            sx={{
                                backgroundColor: "#FFFFFF",
                                border: "1px solid #E5E7EB",
                                p: 0.8,
                                borderRadius: 2.5,
                                "&:hover": {
                                    backgroundColor: "#F9FAFB",
                                },
                            }}
                        >
                            <Badge badgeContent={6} color="error">
                                <NotificationsNoneOutlinedIcon sx={{ color: "#4B5563", fontSize: 20 }} />
                            </Badge>
                        </IconButton>

                        {/* User Avatar */}
                        <CustomAvatar
                            name={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "User"}
                            size={34}
                            fontSize="0.8rem"
                        />

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
                                    "&:hover": { color: "primary.main", backgroundColor: "primary.lighter" },
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