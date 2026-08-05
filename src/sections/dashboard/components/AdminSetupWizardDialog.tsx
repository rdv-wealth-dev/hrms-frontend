import { useState } from "react";
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

import TextInput from "../../../components/input/TextInput";
import { useSnackbar } from "../../../components/snackbar";
import { completeOnboarding, type CompleteOnboardingRequest } from "../../../api/auth.api";

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

export default function AdminSetupWizardDialog({ open, onClose, onSuccess }: Props) {
  const { showSnackbar } = useSnackbar();

  const [countryCode, setCountryCode] = useState("IN");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [baseCurrency, setBaseCurrency] = useState("INR");
  const [fiscalYearStart, setFiscalYearStart] = useState("April");
  const [employeeCountRange, setEmployeeCountRange] = useState("11-50");
  const [industry, setIndustry] = useState("Technology");
  const [phone, setPhone] = useState("+919876543210");
  const [adminJobTitle, setAdminJobTitle] = useState("HR Manager");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !adminJobTitle.trim()) return;

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
      const msg = err?.response?.data?.message || err?.message || "Failed to complete onboarding setup.";
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
            backgroundColor: "#FFFFFF",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid #E2E8F0",
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
          background: "linear-gradient(135deg, #6D5DF6 0%, #4634E2 100%)",
          color: "#FFFFFF",
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

          <Grid container spacing={2}>
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
              <TextInput
                label="Contact Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Admin Job Title"
                value={adminJobTitle}
                onChange={(e) => setAdminJobTitle(e.target.value)}
                placeholder="e.g. HR Manager / Operations Director"
                required
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      {/* Dialog Footer Actions */}
      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3.5 },
          py: 2,
          borderTop: "1px solid #E2E8F0",
          backgroundColor: "#F8FAFC",
          display: "flex",
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{
            color: "#64748B",
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
            backgroundColor: "#6D5DF6",
            color: "#FFFFFF",
            fontWeight: 700,
            px: 3,
            py: 1,
            borderRadius: 2.5,
            textTransform: "none",
            boxShadow: "0 4px 14px rgba(109, 93, 246, 0.35)",
            "&:hover": {
              backgroundColor: "#5B4EB8",
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
