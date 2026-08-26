import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

import TextInput from "./TextInput";
import { MultiSelect } from "./MultiSelect";
import { type CustomFieldDefinition } from "../../api/custom-field.api";
import { useResponsive } from "../../hooks/useResponsive";

interface DynamicFieldRendererProps {
  field: CustomFieldDefinition;
  value: any;
  onChange: (val: any) => void;
  error?: string;
}

export function DynamicFieldRenderer({
  field,
  value,
  onChange,
  error,
}: DynamicFieldRendererProps) {
  const { isMobile } = useResponsive();

  if (!field || field.isActive === false) return null;

  const isRequired = field.isRequired;
  const label = `${field.fieldLabel || "Custom Field"}${isRequired ? " *" : ""}`;
  const options = field.options || [];

  // Helper title bar with optional tooltip helper text
  const FieldLabelHeader = () => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
        {label}
      </Typography>
      {field.helperText && (
        <Tooltip title={field.helperText} arrow placement="top">
          <HelpOutlineOutlinedIcon sx={{ fontSize: 16, color: "#94A3B8", cursor: "pointer" }} />
        </Tooltip>
      )}
    </Box>
  );

  // ── Render 1: SELECT / MULTI_SELECT with RADIO_GROUP or PILL_SELECT ──
  if (
    (field.fieldType === "SELECT" || field.fieldType === "MULTI_SELECT") &&
    (field.uiComponent === "RADIO_GROUP" || field.uiComponent === "PILL_SELECT")
  ) {
    const selectedVals: string[] = Array.isArray(value)
      ? value
      : typeof value === "string" && value
      ? [value]
      : field.defaultValue
      ? [field.defaultValue]
      : [];

    const handlePillClick = (optVal: string) => {
      if (field.fieldType === "MULTI_SELECT") {
        if (selectedVals.includes(optVal)) {
          onChange(selectedVals.filter((v) => v !== optVal));
        } else {
          onChange([...selectedVals, optVal]);
        }
      } else {
        onChange(optVal);
      }
    };

    return (
      <Box sx={{ mb: 2, width: "100%" }}>
        <FieldLabelHeader />
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.25,
            alignItems: "center",
          }}
        >
          {options.map((opt) => {
            const isSelected = selectedVals.includes(opt.value);
            const chipColor = opt.color || "#6D5DF6";

            return (
              <Chip
                key={opt.value}
                label={opt.label || opt.value}
                onClick={() => handlePillClick(opt.value)}
                variant={isSelected ? "filled" : "outlined"}
                sx={{
                  fontWeight: 600,
                  fontSize: isMobile ? "12px" : "13px",
                  height: isMobile ? 36 : 40,
                  px: 1,
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  backgroundColor: isSelected ? chipColor : "transparent",
                  color: isSelected ? "#FFFFFF" : "#334155",
                  borderColor: isSelected ? chipColor : "#CBD5E1",
                  boxShadow: isSelected ? `0 2px 8px ${chipColor}40` : "none",
                  "&:hover": {
                    backgroundColor: isSelected ? chipColor : "rgba(109, 93, 246, 0.08)",
                    borderColor: chipColor,
                  },
                }}
              />
            );
          })}
        </Box>
        {field.helperText && (
          <Typography variant="caption" sx={{ color: "#64748B", mt: 0.5, display: "block" }}>
            {field.helperText}
          </Typography>
        )}
        {error && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
            {error}
          </Typography>
        )}
      </Box>
    );
  }

  // ── Render 2: SELECT with DROPDOWN ──
  if (field.fieldType === "SELECT") {
    return (
      <Box sx={{ mb: 2, width: "100%" }}>
        <TextInput
          select
          label={label}
          value={value ?? field.defaultValue ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || `Select ${field.fieldLabel}`}
          error={error}
        >
          <MenuItem value="">
            <em>Select {field.fieldLabel}</em>
          </MenuItem>
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextInput>
        {field.helperText && (
          <Typography variant="caption" sx={{ color: "#64748B", mt: 0.5, display: "block" }}>
            {field.helperText}
          </Typography>
        )}
      </Box>
    );
  }

  // ── Render 3: MULTI_SELECT Dropdown ──
  if (field.fieldType === "MULTI_SELECT") {
    const multiOptions = options.map((opt) => ({
      value: opt.value,
      label: opt.label,
    }));

    return (
      <Box sx={{ mb: 2, width: "100%" }}>
        <MultiSelect
          label={label}
          options={multiOptions}
          value={Array.isArray(value) ? value : []}
          onChange={(val: string[]) => onChange(val)}
          placeholder={field.placeholder || `Select ${field.fieldLabel}`}
          error={error}
        />
        {field.helperText && (
          <Typography variant="caption" sx={{ color: "#64748B", mt: 0.5, display: "block" }}>
            {field.helperText}
          </Typography>
        )}
      </Box>
    );
  }

  // ── Render 4: BOOLEAN Switch ──
  if (field.fieldType === "BOOLEAN") {
    return (
      <Box sx={{ mb: 2, width: "100%" }}>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(value ?? field.defaultValue ?? false)}
              onChange={(e) => onChange(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#1E293B" }}>
                {label}
              </Typography>
              {field.helperText && (
                <Typography variant="caption" sx={{ color: "#64748B" }}>
                  {field.helperText}
                </Typography>
              )}
            </Box>
          }
        />
        {error && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
            {error}
          </Typography>
        )}
      </Box>
    );
  }

  // ── Render 5: NUMBER Input ──
  if (field.fieldType === "NUMBER") {
    return (
      <Box sx={{ mb: 2, width: "100%" }}>
        <TextInput
          label={label}
          type="number"
          value={value ?? field.defaultValue ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || `Enter ${field.fieldLabel}`}
          error={error}
        />
        {field.helperText && (
          <Typography variant="caption" sx={{ color: "#64748B", mt: 0.5, display: "block" }}>
            {field.helperText}
          </Typography>
        )}
      </Box>
    );
  }

  // ── Render 6: DATE Picker ──
  if (field.fieldType === "DATE") {
    return (
      <Box sx={{ mb: 2, width: "100%" }}>
        <TextInput
          label={label}
          type="date"
          value={value ?? field.defaultValue ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || "YYYY-MM-DD"}
          error={error}
        />
        {field.helperText && (
          <Typography variant="caption" sx={{ color: "#64748B", mt: 0.5, display: "block" }}>
            {field.helperText}
          </Typography>
        )}
      </Box>
    );
  }

  // ── Render 7: TEXT Input (Default) ──
  return (
    <Box sx={{ mb: 2, width: "100%" }}>
      <TextInput
        label={label}
        value={value ?? field.defaultValue ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || `Enter ${field.fieldLabel}`}
        error={error}
      />
      {field.helperText && (
        <Typography variant="caption" sx={{ color: "#64748B", mt: 0.5, display: "block" }}>
          {field.helperText}
        </Typography>
      )}
    </Box>
  );
}

export default DynamicFieldRenderer;
