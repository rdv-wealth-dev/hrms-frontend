import { useState, type ReactNode } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Paper from "@mui/material/Paper";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import SettingsContentPanel from "../../components/settings/SettingsContentPanel";
import DepartmentContent from "../departments/components/DepartmentContent";
import DesignationContent from "../designations/components/DesignationContent";
import ShiftContent from "../attendance/components/ShiftContent";
import LeaveTypeContent from "../leave/leave-policy/LeaveTypeContent";
import OrganizationProfileContent from "./components/OrganizationProfileContent";
import OrganizationModulesContent from "./components/OrganizationModulesContent";
import OrganizationStatutoryContent from "./components/OrganizationStatutoryContent";
import OrganizationDocumentsContent from "./components/OrganizationDocumentsContent";
import { usePermissions } from "../../hooks/usePermissions";

import {
  SETTINGS_CATEGORIES,
  SETTINGS_SUB_ITEMS,
} from "./settings-config";

// =============================================================
// Content map — maps sub-item id → the component to render.
// Adding a new settings page = 1 line here + 1 line in settings-config.ts
// =============================================================

const CONTENT_MAP: Record<string, ReactNode> = {
  "org-profile":   <OrganizationProfileContent />,
  "org-modules":   <OrganizationModulesContent />,
  "org-statutory": <OrganizationStatutoryContent />,
  "org-documents": <OrganizationDocumentsContent />,
  departments:     <DepartmentContent />,
  designations:    <DesignationContent />,
  "leave-types":   <LeaveTypeContent />,
  "shift-master":  <ShiftContent />,
};

// =============================================================
// SettingsView — orchestrates the 2-column nested settings layout
// Responsive: sidebar on md+, drawer on mobile, tabs on sm
// =============================================================

function SettingsView() {
  const { hasPermission } = usePermissions();

  // Filter settings tabs based on current user permissions
  const permittedSubItems = SETTINGS_SUB_ITEMS.filter((item) => {
    if (item.permission) return hasPermission(item.permission);
    return true;
  });

  const [activeSubItem, setActiveSubItem] = useState(
    permittedSubItems[0]?.id ?? ""
  );
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setActiveSubItem(id);
    setMobileDrawerOpen(false);
  };

  // Sidebar nav content (shared between desktop sidebar & mobile drawer)
  const SidebarNav = () => (
    <Box sx={{ py: 2 }}>
      {SETTINGS_CATEGORIES.map((cat) => {
        const subItems = permittedSubItems.filter((item) => item.categoryId === cat.id);
        if (subItems.length === 0) return null;

        return (
          <Box key={cat.id} sx={{ mb: 2, px: 2 }}>
            {/* Category Header */}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                mb: 1.5,
              }}
            >
              {cat.label}
            </Typography>

            {/* Sub Items */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {subItems.map((item) => {
                const isActive = item.id === activeSubItem;
                return (
                  <Box
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    sx={{
                      px: 1.5,
                      py: 1,
                      cursor: "pointer",
                      borderRadius: 1.5,
                      backgroundColor: isActive ? "#EEF2FF" : "transparent",
                      color: isActive ? "#6D5DF6" : "#4B5563",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: isActive ? "#EEF2FF" : "#F3F4F6",
                        color: isActive ? "#6D5DF6" : "#111827",
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                        color: "inherit",
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>

        {/* Page Title Row */}
        <Box sx={{ mb: { xs: 2, md: 3 }, display: "flex", alignItems: "center", gap: 1 }}>
          {/* Hamburger menu only on mobile */}
          <IconButton
            onClick={() => setMobileDrawerOpen(true)}
            size="small"
            sx={{ display: { xs: "inline-flex", md: "none" }, mr: 0.5, color: "#4B5563" }}
          >
            <MenuIcon />
          </IconButton>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", fontSize: { xs: "1.1rem", md: "1.4rem" } }}>
              Settings &amp; Administration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: { xs: "none", sm: "block" } }}>
              Configure NexusHR for your organization
            </Typography>
          </Box>
        </Box>

        {permittedSubItems.length === 0 ? (
          <Box sx={{ p: 1 }}>
            <Alert severity="warning" sx={{ borderRadius: 2.5 }}>
              You do not have authorization to view or manage any administrative settings.
            </Alert>
          </Box>
        ) : (
          <>
            {/* ── TABLET: Horizontal Scrollable Tabs (sm only) ── */}
            <Box sx={{ display: { xs: "none", sm: "block", md: "none" }, mb: 2 }}>
              <Paper elevation={0} sx={{ borderRadius: 2.5, border: "1px solid #E5E7EB", overflow: "hidden" }}>
                <Tabs
                  value={activeSubItem}
                  onChange={(_, val) => setActiveSubItem(val)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    px: 1,
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontSize: "13px",
                      fontWeight: 500,
                      minHeight: 44,
                      color: "#6B7280",
                    },
                    "& .Mui-selected": {
                      color: "#6D5DF6 !important",
                      fontWeight: 700,
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#6D5DF6",
                    },
                  }}
                >
                  {permittedSubItems.map((item) => (
                    <Tab key={item.id} label={item.label} value={item.id} />
                  ))}
                </Tabs>
              </Paper>
            </Box>

            {/* ── MOBILE: Horizontal Scrollable Tabs (xs only) ── */}
            <Box sx={{ display: { xs: "block", sm: "none" }, mb: 2 }}>
              <Paper elevation={0} sx={{ borderRadius: 2.5, border: "1px solid #E5E7EB", overflow: "hidden" }}>
                <Tabs
                  value={activeSubItem}
                  onChange={(_, val) => setActiveSubItem(val)}
                  variant="scrollable"
                  scrollButtons={false}
                  sx={{
                    px: 0.5,
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontSize: "12px",
                      fontWeight: 500,
                      minHeight: 40,
                      color: "#6B7280",
                      px: 1.5,
                    },
                    "& .Mui-selected": {
                      color: "#6D5DF6 !important",
                      fontWeight: 700,
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#6D5DF6",
                    },
                  }}
                >
                  {permittedSubItems.map((item) => (
                    <Tab key={item.id} label={item.label} value={item.id} />
                  ))}
                </Tabs>
              </Paper>
            </Box>

            {/* ── DESKTOP: 2-Column Sidebar + Content ── */}
            <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>

              {/* Left Sidebar — desktop only (md+) */}
              <Box
                sx={{
                  display: { xs: "none", md: "block" },
                  width: 220,
                  flexShrink: 0,
                  backgroundColor: "#fff",
                  borderRadius: 3,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  height: "fit-content",
                  position: "sticky",
                  top: 80,
                }}
              >
                <SidebarNav />
              </Box>

              {/* Main Content Panel */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <SettingsContentPanel>
                  {CONTENT_MAP[activeSubItem] ?? null}
                </SettingsContentPanel>
              </Box>
            </Box>

            {/* ── MOBILE: Slide-in Drawer Navigation ── */}
            <Drawer
              anchor="left"
              open={mobileDrawerOpen}
              onClose={() => setMobileDrawerOpen(false)}
              slotProps={{ paper: { sx: { width: 260, borderRadius: "0 16px 16px 0" } } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, pt: 2, pb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#111827" }}>
                  Settings
                </Typography>
                <IconButton size="small" onClick={() => setMobileDrawerOpen(false)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              <SidebarNav />
            </Drawer>
          </>
        )}

      </Box>
    </DashboardLayout>
  );
}

export default SettingsView;
