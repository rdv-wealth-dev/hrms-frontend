import { useState, type ReactNode } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import SettingsCategoryList from "../../components/settings/SettingsCategoryList";
import SettingsSubList from "../../components/settings/SettingsSubList";
import SettingsContentPanel from "../../components/settings/SettingsContentPanel";
import DepartmentContent from "../departments/components/DepartmentContent";
import DesignationContent from "../designations/components/DesignationContent";

import {
  SETTINGS_CATEGORIES,
  SETTINGS_SUB_ITEMS,
} from "./settings-config";

// =============================================================
// Content map — maps sub-item id → the component to render.
// Adding a new settings page = 1 line here + 1 line in settings-config.ts
// =============================================================

const CONTENT_MAP: Record<string, ReactNode> = {
  departments:  <DepartmentContent />,
  designations: <DesignationContent />,
};

// =============================================================
// SettingsView — orchestrates the 3-column settings layout
// =============================================================

function SettingsView() {
  const [activeCategory, setActiveCategory] = useState(
    SETTINGS_CATEGORIES[0]?.id ?? ""
  );
  const [activeSubItem, setActiveSubItem] = useState(
    SETTINGS_SUB_ITEMS[0]?.id ?? ""
  );

  const subItems = SETTINGS_SUB_ITEMS.filter(
    (item) => item.categoryId === activeCategory
  );

  const handleCategorySelect = (id: string) => {
    setActiveCategory(id);
    // Auto-select first sub-item of the new category
    const first = SETTINGS_SUB_ITEMS.find((i) => i.categoryId === id);
    if (first) setActiveSubItem(first.id);
  };

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

        {/* 3-Column Panel */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <SettingsCategoryList
            categories={SETTINGS_CATEGORIES}
            activeId={activeCategory}
            onSelect={handleCategorySelect}
          />

          <SettingsSubList
            items={subItems}
            activeId={activeSubItem}
            onSelect={setActiveSubItem}
          />

          <SettingsContentPanel>
            {CONTENT_MAP[activeSubItem] ?? null}
          </SettingsContentPanel>
        </Box>

      </Box>
    </DashboardLayout>
  );
}

export default SettingsView;
