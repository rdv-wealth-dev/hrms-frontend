import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

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
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";

import { paths } from "../../routes/paths";
import type { RootState } from "../../store/rootReducer";

const SIDEBAR_WIDTH = 240;

const navItems = [
    {
        label: "Dashboard",
        icon: <DashboardOutlinedIcon fontSize="small" />,
        path: paths.dashboard,
    },
    {
        label: "Departments",
        icon: <ApartmentOutlinedIcon fontSize="small" />,
        path: paths.departments,
    },
];

type Props = {
    children: React.ReactNode;
};

function DashboardLayout({ children }: Props) {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const user = useSelector((state: RootState) => state.auth?.user);

    const sidebarContent = (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                backgroundColor: "#1E1B4B",
                color: "#fff",
            }}
        >
            {/* Logo */}
            <Box sx={{ px: 3, py: 3 }}>
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}
                >
                    NexusHR
                </Typography>
                <Typography variant="caption" sx={{ color: "#A5B4FC", fontSize: 11 }}>
                    AI-Powered HRMS
                </Typography>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

            {/* Nav Items */}
            <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
                {navItems.map((item) => {
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
                                        minWidth: 34,
                                        color: isActive ? "#818CF8" : "rgba(255,255,255,0.5)",
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
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
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

            {/* User Footer */}
            <Box sx={{ px: 2, py: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
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
                            {user?.role ?? ""}
                        </Typography>
                    </Box>
                </Box>

                <ListItemButton
                    onClick={() => navigate(paths.auth.login)}
                    sx={{
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.75,
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 30, color: "rgba(255,255,255,0.4)" }}>
                        <LogoutOutlinedIcon fontSize="small" />
                    </ListItemIcon>
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
                </ListItemButton>
            </Box>
        </Box>
    );

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
                        width: SIDEBAR_WIDTH,
                        border: "none",
                    },
                }}
            >
                {sidebarContent}
            </Drawer>

            {/* Desktop Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", md: "block" },
                    "& .MuiDrawer-paper": {
                        width: SIDEBAR_WIDTH,
                        border: "none",
                        boxSizing: "border-box",
                    },
                }}
                open
            >
                {sidebarContent}
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    ml: { md: `${SIDEBAR_WIDTH}px` },
                    minHeight: "100vh",
                    backgroundColor: "#F5F6FA",
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

export default DashboardLayout;