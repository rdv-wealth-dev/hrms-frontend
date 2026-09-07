import { useState, useEffect, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";

import TextInput from "../../../components/input/TextInput";
import PhoneInput from "../../../components/input/PhoneInput";
import { MultiSelect } from "../../../components/input/MultiSelect";
import { useSnackbar } from "../../../components/snackbar";
import { completeOnboarding, type CompleteOnboardingRequest } from "../../../api/auth.api";
import { useUserOrgData } from "../../../hooks/useUserOrgData";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const COUNTRIES = [
  { value: "IN", label: "India (IN)" },
  { value: "US", label: "United States (US)" },
  { value: "GB", label: "United Kingdom (UK)" },
  { value: "AE", label: "United Arab Emirates (AE)" },
  { value: "SG", label: "Singapore (SG)" },
];

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST +5:30)" },
  { value: "UTC", label: "UTC (Universal Time)" },
  { value: "America/New_York", label: "America/New_York (EST)" },
  { value: "Europe/London", label: "Europe/London (GMT)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST +4:00)" },
];

const CURRENCIES = [
  { value: "INR", label: "INR (₹) - Indian Rupee" },
  { value: "USD", label: "USD ($) - US Dollar" },
  { value: "EUR", label: "EUR (€) - Euro" },
  { value: "GBP", label: "GBP (£) - British Pound" },
  { value: "AED", label: "AED - UAE Dirham" },
];

const FISCAL_YEARS = ["April", "January", "July", "October"];

const EMPLOYEE_RANGES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "500+",
];

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Retail & E-commerce",
  "Manufacturing",
  "Education",
  "Professional Services",
  "Other",
];

const DEPARTMENT_OPTIONS = [
  { code: "ENG", label: "Engineering" },
  { code: "QA", label: "Quality Assurance" },
  { code: "DEVOPS", label: "DevOps" },
  { code: "SEC", label: "Security" },
  { code: "DATA", label: "Data" },
  { code: "PM", label: "Product Management" },
  { code: "ITSUP", label: "IT Support" },
  { code: "UIX", label: "Design (UI/UX)" },
  { code: "HR", label: "Human Resources" },
  { code: "FIN", label: "Finance" },
  { code: "OPS", label: "Operations" },
  { code: "ADMIN", label: "Administration" },
];

const WORKING_STYLES = [
  { value: "regular", label: "Regular", hint: "9:00 AM – 6:00 PM only" },
  { value: "flexible", label: "Flexible", hint: "9–6 and 11–8 shifts" },
  { value: "rotational", label: "Rotational", hint: "24/7, 3 shifts" },
] as const;

const LEAVE_POLICIES = [
  { value: "standard", label: "Standard", hint: "Casual, Sick, Annual, LOP" },
  { value: "all", label: "All Leave Types", hint: "All 9 types" },
  { value: "minimal", label: "Minimal", hint: "Annual + LOP only" },
] as const;

const LEAVE_TYPE_OPTIONS = [
  { code: "CL", label: "Casual Leave" },
  { code: "SL", label: "Sick Leave" },
  { code: "AL", label: "Annual Leave" },
  { code: "ML", label: "Maternity Leave" },
  { code: "PAT", label: "Paternity Leave" },
  { code: "BL", label: "Bereavement Leave" },
  { code: "COMP_OFF", label: "Compensatory Off" },
  { code: "MAR", label: "Marriage Leave" },
  { code: "LOP", label: "Loss of Pay" },
];

export default function AdminSetupWizardDialog({ open, onClose, onSuccess }: Props) {
  const { showSnackbar } = useSnackbar();
  const orgData = useUserOrgData();

  const [countryCode, setCountryCode] = useState(orgData.countryCode || "");
  const [timezone, setTimezone] = useState(orgData.timezone || "");
  const [baseCurrency, setBaseCurrency] = useState(orgData.baseCurrency || "");
  const [fiscalYearStart, setFiscalYearStart] = useState(orgData.fiscalYearStart || "");
  const [employeeCountRange, setEmployeeCountRange] = useState(orgData.employeeCountRange || "");
  const [industry, setIndustry] = useState(orgData.industry || "");
  const [phone, setPhone] = useState((orgData.phone || "").replace(/\D/g, "").slice(0, 10));
  const [adminJobTitle, setAdminJobTitle] = useState("");

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [workingStyle, setWorkingStyle] = useState<"regular" | "flexible" | "rotational">("regular");
  const [leavePolicy, setLeavePolicy] = useState<"standard" | "all" | "minimal">("standard");
  const [selectedLeaves, setSelectedLeaves] = useState<string[]>([]);
  const [useCustomLeaves, setUseCustomLeaves] = useState(false);

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (open && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      if (orgData.countryCode) setCountryCode(orgData.countryCode);
      if (orgData.timezone) setTimezone(orgData.timezone);
      if (orgData.baseCurrency) setBaseCurrency(orgData.baseCurrency);
      if (orgData.fiscalYearStart) setFiscalYearStart(orgData.fiscalYearStart);
      if (orgData.employeeCountRange) setEmployeeCountRange(orgData.employeeCountRange);
      if (orgData.industry) setIndustry(orgData.industry);
      if (orgData.phone) setPhone((orgData.phone || "").replace(/\D/g, "").slice(0, 10));
      setSelectedDepartments([]);
      setWorkingStyle("regular");
      setLeavePolicy("standard");
      setSelectedLeaves([]);
      setUseCustomLeaves(false);
      setError(null);
    } else if (!open) {
      hasInitializedRef.current = false;
    }
  }, [open, orgData]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !adminJobTitle.trim()) return;

    if (phone.replace(/\D/g, "").length !== 10) {
      setError("Contact phone number must be exactly 10 digits.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: CompleteOnboardingRequest = {
      countryCode,
      timezone,
      employeeCountRange,
      industry,
      phone: phone.trim(),
      baseCurrency,
      fiscalYearStart,
      adminJobTitle: adminJobTitle.trim(),
      selectedDepartments: selectedDepartments.length > 0 ? selectedDepartments : undefined,
      workingStyle,
      leavePolicy,
      selectedLeaves: useCustomLeaves && selectedLeaves.length > 0 ? selectedLeaves : undefined,
    };

    try {
      const res = await completeOnboarding(payload);
      if (res.succeeded) {
        showSnackbar(
          res.message || "Organization setup & Head Office seeding completed successfully!",
          "success"
        );
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Failed to complete onboarding setup.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        err?.message ||
        "Failed to complete onboarding setup.";
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
        backdrop: {
          sx: {
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(15, 23, 42, 0.45)",
          },
        },
        paper: {
          sx: {
            borderRadius: { xs: "16px", sm: "20px", md: "24px" },
            p: 0,
            backgroundColor: "background.paper",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid",
            borderColor: "divider",
            mx: { xs: 1.5, sm: "auto" },
            width: { xs: "calc(100% - 24px)", sm: "calc(100% - 48px)", md: "100%" },
            maxHeight: { xs: "90vh", sm: "88vh" },
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: { xs: 2.5, sm: 3 },
          background: (theme: any) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "primary.contrastText",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RocketLaunchOutlinedIcon sx={{ fontSize: 24, color: "#FFFFFF" }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, color: "#FFFFFF" }}>
              Complete Organization Setup
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.85)" }}>
              Configure organization locales & auto-seed Head Office master data
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#FFFFFF",
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.15)" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Form Content */}
      <DialogContent
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          overflowY: "auto",
        }}
      >
        <Box component="form" id="admin-setup-form" onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 2 }} >
            {/* Country & Timezone */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                select
                label="Country Code"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                required
              >
                {COUNTRIES.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </TextInput>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                select
                label="Timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                required
              >
                {TIMEZONES.map((tz) => (
                  <MenuItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </MenuItem>
                ))}
              </TextInput>
            </Grid>

            {/* Currency & Fiscal Year */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                select
                label="Base Currency"
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                required
              >
                {CURRENCIES.map((cur) => (
                  <MenuItem key={cur.value} value={cur.value}>
                    {cur.label}
                  </MenuItem>
                ))}
              </TextInput>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                select
                label="Fiscal Year Start"
                value={fiscalYearStart}
                onChange={(e) => setFiscalYearStart(e.target.value)}
                required
              >
                {FISCAL_YEARS.map((fy) => (
                  <MenuItem key={fy} value={fy}>
                    {fy}
                  </MenuItem>
                ))}
              </TextInput>
            </Grid>

            {/* Employee Count & Industry */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                select
                label="Employee Count Range"
                value={employeeCountRange}
                onChange={(e) => setEmployeeCountRange(e.target.value)}
                required
              >
                {EMPLOYEE_RANGES.map((range) => (
                  <MenuItem key={range} value={range}>
                    {range} Employees
                  </MenuItem>
                ))}
              </TextInput>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                select
                label="Industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
              >
                {INDUSTRIES.map((ind) => (
                  <MenuItem key={ind} value={ind}>
                    {ind}
                  </MenuItem>
                ))}
              </TextInput>
            </Grid>

            {/* Contact Phone & Admin Title */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <PhoneInput
                label="Phone Number"
                phoneValue={phone}
                countryCodeValue={countryCode}
                onPhoneChange={(val) => setPhone(val.replace(/\D/g, ""))}
                onCountryCodeChange={(code) => setCountryCode(code)}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Admin Job Title"
                value={adminJobTitle}
                onChange={(e) => setAdminJobTitle(e.target.value)}
                required
              />
            </Grid>

            {/* Divider */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* Departments */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, color: "text.primary" }}>
                Departments to Set Up (optional — leave empty for smart defaults)
              </Typography>
              <MultiSelect
                placeholder="Leave empty for smart defaults (or choose specific departments)"
                options={DEPARTMENT_OPTIONS.map((d) => ({ value: d.code, label: d.label }))}
                value={selectedDepartments}
                onChange={(values) => setSelectedDepartments(values)}
                searchable
                searchPlaceholder="Search departments..."
                sx={{
                  borderRadius: "12px",
                  minHeight: 42,
                }}
              />
              {selectedDepartments.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
                  {selectedDepartments.map((code) => {
                    const dept = DEPARTMENT_OPTIONS.find((d) => d.code === code);
                    return (
                      <Chip
                        key={code}
                        label={dept?.label || code}
                        size="small"
                        onDelete={() => setSelectedDepartments((prev) => prev.filter((c) => c !== code))}
                        color="primary"
                        variant="outlined"
                        sx={{
                          borderRadius: "8px",
                          fontWeight: 500,
                          fontSize: "12px",
                        }}
                      />
                    );
                  })}
                </Box>
              )}
            </Grid>

            {/* Divider */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* Working Style */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Working Style
              </Typography>
              <ToggleButtonGroup
                value={workingStyle}
                exclusive
                onChange={(_, val) => val && setWorkingStyle(val)}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  "& .MuiToggleButtonGroup-grouped": {
                    borderRadius: "8px !important",
                    border: "1px solid !important",
                    borderColor: "divider !important",
                    mx: 0,
                  },
                  "& .MuiToggleButton-root": {
                    flex: { xs: "1 1 100%", sm: "1 1 calc(33.333% - 8px)" },
                    borderRadius: 2,
                    textTransform: "none",
                    px: 2,
                    py: 1.25,
                    flexDirection: "column",
                    alignItems: "flex-start",
                    border: "1px solid",
                    borderColor: "divider",
                  },
                  "& .MuiToggleButton-root.Mui-selected": {
                    borderColor: (theme) => `${theme.palette.primary.main} !important`,
                    backgroundColor: "action.selected",
                  },
                }}
              >
                {WORKING_STYLES.map((w) => (
                  <ToggleButton key={w.value} value={w.value}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{w.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{w.hint}</Typography>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>

            {/* Divider */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* Leave Policy */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Leave Policy
              </Typography>
              <ToggleButtonGroup
                value={leavePolicy}
                exclusive
                disabled={useCustomLeaves}
                onChange={(_, val) => val && setLeavePolicy(val)}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  mb: 1,
                  "& .MuiToggleButtonGroup-grouped": {
                    borderRadius: "8px !important",
                    border: "1px solid !important",
                    borderColor: "divider !important",
                    mx: 0,
                  },
                  "& .MuiToggleButton-root": {
                    flex: { xs: "1 1 100%", sm: "1 1 calc(33.333% - 8px)" },
                    borderRadius: 2,
                    textTransform: "none",
                    px: 2,
                    py: 1.25,
                    flexDirection: "column",
                    alignItems: "flex-start",
                    border: "1px solid",
                    borderColor: "divider",
                  },
                  "& .MuiToggleButton-root.Mui-selected": {
                    borderColor: (theme) => `${theme.palette.primary.main} !important`,
                    backgroundColor: "action.selected",
                  },
                }}
              >
                {LEAVE_POLICIES.map((l) => (
                  <ToggleButton key={l.value} value={l.value}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{l.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{l.hint}</Typography>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <FormControlLabel
                sx={{
                  userSelect: "none",
                  cursor: "pointer",
                  mt: 0.5,
                  "& .MuiFormControlLabel-label": {
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "text.primary",
                    cursor: "pointer",
                  },
                }}
                control={
                  <Checkbox
                    checked={useCustomLeaves}
                    onChange={(e) => {
                      setUseCustomLeaves(e.target.checked);
                      if (!e.target.checked) setSelectedLeaves([]);
                    }}
                    sx={{
                      color: "text.secondary",
                      "&.Mui-checked": { color: "primary.main" },
                    }}
                  />
                }
                label="Choose specific leave types instead"
              />

              {useCustomLeaves && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {LEAVE_TYPE_OPTIONS.map((l) => (
                    <Chip
                      key={l.code}
                      label={l.label}
                      clickable
                      color={selectedLeaves.includes(l.code) ? "primary" : "default"}
                      variant={selectedLeaves.includes(l.code) ? "filled" : "outlined"}
                      onClick={() =>
                        setSelectedLeaves((prev) =>
                          prev.includes(l.code) ? prev.filter((c) => c !== l.code) : [...prev, l.code]
                        )
                      }
                    />
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      {/* Dialog Footer Actions */}
      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3.5 },
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          backgroundColor: "action.hover",
          display: "flex",
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            textTransform: "none",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="admin-setup-form"
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <RocketLaunchOutlinedIcon />}
          sx={{
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            fontWeight: 700,
            px: 3,
            py: 1,
            borderRadius: 2.5,
            textTransform: "none",
            boxShadow: "0 4px 14px rgba(109, 93, 246, 0.35)",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {submitting ? "Completing & Seeding..." : "Complete Setup & Seed Head Office"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
