import { type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

import SettingsContentPanel from "../../components/settings/SettingsContentPanel";
import DepartmentContent from "../departments/components/DepartmentContent";
import DesignationContent from "../designations/components/DesignationContent";
import ShiftContent from "../shifts/components/ShiftContent";
import LeaveTypeContent from "../leave/leave-policy/LeaveTypeContent";
import OrganizationProfileContent from "./components/OrganizationProfileContent";
import OrganizationModulesContent from "./components/OrganizationModulesContent";
import OrganizationStatutoryContent from "./components/OrganizationStatutoryContent";
import OrganizationDocumentsContent from "./components/OrganizationDocumentsContent";
import EmployeeCodeConfigContent from "./components/EmployeeCodeConfigContent";
import BranchListContent from "../branches/branch-list/components/BranchListContent";
import RolesListContent from "./components/roles/RolesListContent";
import CustomFieldsSettingsTab from "./components/CustomFieldsSettingsTab";
import { usePermissions } from "../../hooks/usePermissions";

import {
  SETTINGS_SUB_ITEMS,
} from "./settings-config";

// =============================================================
// Content map — maps sub-item id → the component to render.
// Adding a new settings page = 1 line here + 1 line in settings-config.ts
// =============================================================

const CONTENT_MAP: Record<string, ReactNode> = {
  "org-profile":       <OrganizationProfileContent />,
  "employee-code":     <EmployeeCodeConfigContent />,
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
// SettingsView — Full-width content container driven by main side navbar
// =============================================================

function SettingsView() {
  const { hasPermission } = usePermissions();
  const [searchParams] = useSearchParams();
  const currentTabParam = searchParams.get("tab");

  // Filter settings tabs based on current user permissions
  const permittedSubItems = SETTINGS_SUB_ITEMS.filter((item) => {
    if (item.permission) return hasPermission(item.permission);
    return true;
  });

  const activeSubItem =
    permittedSubItems.find((item) => item.id === currentTabParam)?.id ||
    permittedSubItems[0]?.id ||
    "org-profile";

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Page Title Row */}
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary", fontSize: { xs: "1.1rem", md: "1.4rem" } }}>
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
        <Box sx={{ width: "100%" }}>
          <SettingsContentPanel>
            {CONTENT_MAP[activeSubItem] ?? null}
          </SettingsContentPanel>
        </Box>
      )}
    </Box>
  );
}

export default SettingsView;
