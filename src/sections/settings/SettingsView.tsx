import { useState, type ReactNode } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Paper from "@mui/material/Paper";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import SettingsContentPanel from "../../components/settings/SettingsContentPanel";
import DepartmentContent from "../departments/components/DepartmentContent";
import DesignationContent from "../designations/components/DesignationContent";
import ShiftContent from "../attendance/components/ShiftContent";
import LeaveTypeContent from "../leave/leave-policy/LeaveTypeContent";
import OrganizationProfileContent from "./components/OrganizationProfileContent";
import OrganizationModulesContent from "./components/OrganizationModulesContent";
import OrganizationStatutoryContent from "./components/OrganizationStatutoryContent";
import OrganizationDocumentsContent from "./components/OrganizationDocumentsContent";
import BranchListContent from "../branches/branch-list/components/BranchListContent";
import RolesListContent from "./components/roles/RolesListContent";
import CustomFieldsSettingsTab from "./components/CustomFieldsSettingsTab";
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
  "org-profile":       <OrganizationProfileContent />,
  "org-modules":       <OrganizationModulesContent />,
  "org-statutory":     <OrganizationStatutoryContent />,
  "org-documents":     <OrganizationDocumentsContent />,
  "custom-fields":     <CustomFieldsSettingsTab />,
  "roles-permissions": <RolesListContent />,
  branches:            <BranchListContent />,
  departments:         <DepartmentContent />,
  designations:        <DesignationContent />,
  "leave-types":       <LeaveTypeContent />,
  "shift-master":      <ShiftContent />,
};

// =============================================================
// SettingsView — orchestrates the 2-column nested settings layout
// Responsive: sidebar on md+, scrollable tabs on sm/xs
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

  const handleNavClick = (id: string) => {
    setActiveSubItem(id);
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
    <>
      <Box sx={{ p: { xs: 2, md: 3 } }}>

        {/* Page Title Row */}
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", fontSize: { xs: "1.1rem", md: "1.4rem" } }}>
            Settings &amp; Administration
          </Typography>
        </Box>

        {permittedSubItems.length === 0 ? (
          <Box sx={{ p: 1 }}>
            <Alert severity="warning" sx={{ borderRadius: 2.5 }}>
              You do not have authorization to view or manage any administrative settings.
            </Alert>
          </Box>
        ) : (
          <>
            {/* ── MOBILE & TABLET: Horizontal Scrollable Tabs ── */}
            <Box sx={{ display: { xs: "block", md: "none" }, mb: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  backgroundColor: "#FFFFFF",
                  overflow: "hidden",
                }}
              >
                <Tabs
                  value={activeSubItem}
                  onChange={(_, val) => setActiveSubItem(val)}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  slots={{
                    startScrollButtonIcon: ChevronLeftRoundedIcon,
                    endScrollButtonIcon: ChevronRightRoundedIcon,
                  }}
                  sx={{
                    minHeight: 44,

                    "& .MuiTabs-scroller": {
                      scrollbarWidth: "none",

                      "&::-webkit-scrollbar": {
                        display: "none",
                      },
                    },

                    // Keep tab container properly aligned
                    "& .MuiTabs-list": {
                      alignItems: "stretch",
                    },

                    // Chevron buttons
                    "& .MuiTabScrollButton-root": {
                      flexShrink: 0,
                      width: 28,
                      minWidth: 28,
                      color: "#6D5DF6",
                      opacity: 0.9,
                      transition: "all 0.2s ease",

                      "&.Mui-disabled": {
                        opacity: 0.25,

                        // DON'T remove width, otherwise visible tab
                        // widths keep changing when button enables/disables
                      },

                      "&:hover": {
                        backgroundColor: "rgba(109, 93, 246, 0.08)",
                      },
                    },

                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontSize: {
                        xs: "12px",
                        sm: "13px",
                      },
                      fontWeight: 500,

                      minHeight: 44,

                      // Important ↓
                      boxSizing: "border-box",

                      // Exactly 2 tabs visible on mobile
                      flex: {
                        xs: "0 0 50%",
                        sm: "0 0 auto",
                      },

                      width: {
                        xs: "50%",
                        sm: "auto",
                      },

                      minWidth: {
                        xs: "50%",
                        sm: "auto",
                      },

                      maxWidth: {
                        xs: "50%",
                        sm: "none",
                      },

                      px: {
                        xs: 1,
                        sm: 1.75,
                      },

                      py: 1,

                      color: "#64748B",
                      whiteSpace: "nowrap",

                      // Make sure text isn't clipped unnecessarily
                      overflow: "visible",
                    },

                    "& .Mui-selected": {
                      color: "#6D5DF6 !important",
                      fontWeight: 700,
                    },

                    "& .MuiTabs-indicator": {
                      backgroundColor: "#6D5DF6",
                      height: 3,
                      borderRadius: "3px 3px 0 0",
                    },
                  }}
                >
                  {permittedSubItems.map((item) => (
                    <Tab
                      key={item.id}
                      label={item.label}
                      value={item.id}
                    />
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
          </>
        )}

      </Box>
    </>
  );
}

export default SettingsView;
