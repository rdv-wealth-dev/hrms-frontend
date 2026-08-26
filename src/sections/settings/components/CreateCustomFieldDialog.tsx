import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import TextInput from "../../../components/input/TextInput";
import {
  createCustomField,
  type FieldType,
  type UIComponentType,
  type FieldScope,
  type CustomFieldOption,
  type CreateCustomFieldPayload,
} from "../../../api/custom-field.api";

interface CreateCustomFieldDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_COLORS = ["#2886CE", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#6B7280"];

export function CreateCustomFieldDialog({
  open,
  onClose,
  onSuccess,
}: CreateCustomFieldDialogProps) {
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("SELECT");
  const [uiComponent, setUiComponent] = useState<UIComponentType>("RADIO_GROUP");
  const [scope, setScope] = useState<FieldScope>("ORGANIZATION");
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [section, setSection] = useState<string>("WORK_PREFERENCES");
  const [defaultValue, setDefaultValue] = useState<string>("");
  const [isRequired, setIsRequired] = useState<boolean>(true);
  const [helperText, setHelperText] = useState<string>("");
  const [placeholder, setPlaceholder] = useState<string>("");
  const [showInOnboarding, setShowInOnboarding] = useState<boolean>(true);
  const [showInBulkImport, setShowInBulkImport] = useState<boolean>(true);

  // Dynamic Options Builder
  const [options, setOptions] = useState<CustomFieldOption[]>([
    { label: "Work From Office (WFO)", value: "WFO", description: "Direct attendance from office branch", color: "#2886CE" },
    { label: "Work From Home (WFH)", value: "WFH", description: "Remote attendance from home", color: "#10B981" },
    { label: "Hybrid", value: "HYBRID", description: "Flexible office & remote schedule", color: "#8B5CF6" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  const handleFieldTypeChange = (type: FieldType) => {
    setFieldType(type);
    if (type === "SELECT") setUiComponent("RADIO_GROUP");
    else if (type === "MULTI_SELECT") setUiComponent("PILL_SELECT");
    else if (type === "BOOLEAN") setUiComponent("SWITCH");
    else setUiComponent("TEXT_INPUT");
  };

  const handleAddOption = () => {
    const nextIdx = options.length + 1;
    setOptions((prev) => [
      ...prev,
      {
        label: `Option ${nextIdx}`,
        value: `OPTION_${nextIdx}`,
        description: "",
        color: PRESET_COLORS[(nextIdx - 1) % PRESET_COLORS.length],
      },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, key: keyof CustomFieldOption, val: string) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: val };
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!fieldLabel.trim()) {
      setError("Field label is required");
      return;
    }

    if ((fieldType === "SELECT" || fieldType === "MULTI_SELECT") && options.length === 0) {
      setError("Please add at least one option for Select/Multi-Select fields");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: CreateCustomFieldPayload = {
      fieldLabel: fieldLabel.trim(),
      fieldType,
      uiComponent,
      scope,
      wizardStep,
      section: section.trim() || "GENERAL",
      defaultValue: defaultValue.trim() || undefined,
      isRequired,
      options: (fieldType === "SELECT" || fieldType === "MULTI_SELECT") ? options : undefined,
      placeholder: placeholder.trim() || undefined,
      helperText: helperText.trim() || undefined,
      showInOnboarding,
      showInBulkImport,
      order: 1,
    };

    try {
      const res = await createCustomField(payload);
      if (res?.succeeded || (res as any)?.success) {
        onSuccess();
        onClose();
      } else {
        setError(res?.message || "Failed to create custom field");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        err?.message ||
        "Failed to create custom field";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            p: { xs: 1, sm: 2 },
          },
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A" }}>
            Add New Custom Field
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748B" }}>
            Define custom employee data fields for Onboarding &amp; Profile 360
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#9CA3AF" }} disabled={submitting}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "12px !important" }}>
        {error && (
          <Alert severity="error" sx={{ borderRadius: "10px" }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Form Fields Layout */}
        <Grid container spacing={2}>
          {/* Field Label */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Field Label"
              value={fieldLabel}
              onChange={(e) => setFieldLabel(e.target.value)}
              placeholder="e.g. Office Type, T-Shirt Size"
              required
            />
          </Grid>

          {/* Scope */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              select
              label="Scope"
              value={scope}
              onChange={(e) => setScope(e.target.value as FieldScope)}
            >
              <MenuItem value="ORGANIZATION">Organization Level</MenuItem>
              <MenuItem value="DEPARTMENT">Department Level</MenuItem>
              <MenuItem value="BRANCH">Branch Level</MenuItem>
              <MenuItem value="GLOBAL">Global</MenuItem>
            </TextInput>
          </Grid>

          {/* Field Type */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              select
              label="Field Type"
              value={fieldType}
              onChange={(e) => handleFieldTypeChange(e.target.value as FieldType)}
            >
              <MenuItem value="SELECT">Select (Single Option)</MenuItem>
              <MenuItem value="MULTI_SELECT">Multi-Select Badges</MenuItem>
              <MenuItem value="TEXT">Text Input</MenuItem>
              <MenuItem value="NUMBER">Number Input</MenuItem>
              <MenuItem value="DATE">Date Picker</MenuItem>
              <MenuItem value="BOOLEAN">Boolean Switch</MenuItem>
            </TextInput>
          </Grid>

          {/* UI Component Widget */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              select
              label="UI Control Widget"
              value={uiComponent}
              onChange={(e) => setUiComponent(e.target.value as UIComponentType)}
            >
              <MenuItem value="RADIO_GROUP">Radio Group Pills</MenuItem>
              <MenuItem value="PILL_SELECT">Segmented Pill Badges</MenuItem>
              <MenuItem value="DROPDOWN">Dropdown Select</MenuItem>
              <MenuItem value="TEXT_INPUT">Text Input</MenuItem>
              <MenuItem value="SWITCH">Toggle Switch</MenuItem>
            </TextInput>
          </Grid>

          {/* Wizard Step & Section */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              select
              label="Onboarding Wizard Step"
              value={wizardStep}
              onChange={(e) => setWizardStep(Number(e.target.value))}
            >
              <MenuItem value={1}>Step 1: Personal Details &amp; Custom Fields</MenuItem>
              <MenuItem value={2}>Step 2: Family Details</MenuItem>
              <MenuItem value={3}>Step 3: Bank Account</MenuItem>
              <MenuItem value={4}>Step 4: Documents Upload</MenuItem>
              <MenuItem value={5}>Step 5: Review &amp; Confirm</MenuItem>
            </TextInput>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Section Name"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. WORK_PREFERENCES, PERSONAL"
            />
          </Grid>

          {/* Helper Text & Placeholder */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Helper Text / Subtitle"
              value={helperText}
              onChange={(e) => setHelperText(e.target.value)}
              placeholder="e.g. Select your designated work mode"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Placeholder Text"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder="e.g. Choose one option..."
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Default Value"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder="e.g. WFO"
            />
          </Grid>

          {/* Toggles */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, p: 1.5, borderRadius: 2, backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <FormControlLabel
                control={<Switch checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} color="primary" />}
                label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Required Field</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={showInOnboarding} onChange={(e) => setShowInOnboarding(e.target.checked)} color="primary" />}
                label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Show in Onboarding</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={showInBulkImport} onChange={(e) => setShowInBulkImport(e.target.checked)} color="primary" />}
                label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Show in Bulk Import Excel</Typography>}
              />
            </Box>
          </Grid>

          {/* Dynamic Options List Builder (for SELECT or MULTI_SELECT) */}
          {(fieldType === "SELECT" || fieldType === "MULTI_SELECT") && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mt: 1, p: 2, borderRadius: 3, border: "1px solid #E2E8F0", backgroundColor: "#FAFAFA" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                      Field Options ({options.length})
                    </Typography>
                    <Chip label="Pills / Select Items" size="small" sx={{ fontSize: 10, fontWeight: 700, backgroundColor: "#EEF2FF", color: "#4F46E5" }} />
                  </Box>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddOption}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#6D5DF6" }}
                  >
                    Add Option
                  </Button>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {options.map((opt, idx) => (
                    <Paper key={idx} elevation={0} sx={{ p: 1.5, borderRadius: 2, border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF" }}>
                      <Grid container spacing={1.5} sx={{ alignItems: "center" }}>
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <TextInput
                            size="small"
                            label="Label"
                            value={opt.label}
                            onChange={(e) => handleOptionChange(idx, "label", e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <TextInput
                            size="small"
                            label="Value Key"
                            value={opt.value}
                            onChange={(e) => handleOptionChange(idx, "value", e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 10, sm: 5 }}>
                          <TextInput
                            size="small"
                            label="Description"
                            value={opt.description || ""}
                            onChange={(e) => handleOptionChange(idx, "description", e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 2, sm: 1 }} sx={{ textAlign: "right" }}>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveOption(idx)}
                            disabled={options.length <= 1}
                            sx={{ color: "#EF4444", "&:hover": { backgroundColor: "#FEE2E2" } }}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ textTransform: "none", color: "#64748B" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !fieldLabel.trim()}
          sx={{
            background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "10px",
            px: 3,
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
            "&:hover": { background: "linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)" },
          }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : "Create Custom Field"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateCustomFieldDialog;
