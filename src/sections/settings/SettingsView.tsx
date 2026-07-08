import { useState, type ReactNode } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import SettingsContentPanel from "../../components/settings/SettingsContentPanel";
import DepartmentContent from "../departments/components/DepartmentContent";
import DesignationContent from "../designations/components/DesignationContent";
import ShiftContent from "../attendance/components/ShiftContent";
import OrganizationProfileContent from "./components/OrganizationProfileContent";
import OrganizationModulesContent from "./components/OrganizationModulesContent";
import OrganizationStatutoryContent from "./components/OrganizationStatutoryContent";
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
  "org-profile": <OrganizationProfileContent />,
  "org-modules": <OrganizationModulesContent />,
  "org-statutory": <OrganizationStatutoryContent />,
  departments:  <DepartmentContent />,
  designations: <DesignationContent />,
  "shift-master": <ShiftContent />,
};

// =============================================================
// SettingsView — orchestrates the 2-column nested settings layout
// =============================================================

function SettingsView() {
  const { hasPermission } = usePermissions();

  // Filter settings tabs based on current user permissions
  const permittedSubItems = SETTINGS_SUB_ITEMS.filter((item) => {
    if (item.permission) {
      return hasPermission(item.permission);
    }
    return true;
  });

  const [activeSubItem, setActiveSubItem] = useState(
    permittedSubItems[0]?.id ?? ""
  );

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>

        {/* Page Title */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
            Settings & Administration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Configure NexusHR for your organization
          </Typography>
        </Box>

        {permittedSubItems.length === 0 ? (
          <Box sx={{ p: 1 }}>
            <Alert severity="warning" sx={{ borderRadius: 2.5 }}>
              You do not have authorization to view or manage any administrative settings.
            </Alert>
          </Box>
        ) : (
          /* 2-Column Panel */
          <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
            
            {/* Consolidated Left Sidebar */}
            <Box
              sx={{
                width: 220,
                flexShrink: 0,
                backgroundColor: "#fff",
                borderRadius: 3,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                py: 2,
                height: "fit-content",
              }}
            >
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
                            onClick={() => setActiveSubItem(item.id)}
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

            <SettingsContentPanel>
              {CONTENT_MAP[activeSubItem] ?? null}
            </SettingsContentPanel>
          </Box>
        )}

      </Box>
    </DashboardLayout>
  );
}

export default SettingsView;
