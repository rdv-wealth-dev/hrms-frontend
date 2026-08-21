import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import { useSnackbar } from "../../../components/snackbar";

import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SaveIcon from "@mui/icons-material/Save";

import TextInput from "../../../components/input/TextInput";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import {
  loadOrganizationRequest,
  updateOrganizationRequest,
  resetOrganizationStatus,
} from "../../../store/organization";
import { usePermissions } from "../../../hooks/usePermissions";
import { CustomWeekOffRulesBuilder } from "../../../components/settings/CustomWeekOffRulesBuilder";
import type { CustomWeekOffRule } from "../../../store/organization/organization.types";
import { parseWorkingHoursToDecimal, formatWorkingHoursDisplay } from "../../../utils/format-date";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const TIME_FORMATS = ["12h", "24h"];
const FISCAL_STARTS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
];

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "Asia/Calcutta", label: "Asia/Calcutta (IST)" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
];

function OrganizationProfileContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { showSnackbar } = useSnackbar();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("settings.update");

  const { organization, loading, submitting, success, error } = useSelector(
    (state: RootState) => state.organization
  );

  // Form local states
  const [companyName, setCompanyName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [industry, setIndustry] = useState("");
  const [phone, setPhone] = useState("");

  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [zip, setZip] = useState("");

  const [primaryColor, setPrimaryColor] = useState("");
  const [website, setWebsite] = useState("");
  const [supportEmail, setSupportEmail] = useState("");

  const [timezone, setTimezone] = useState("");
  const [dateFormat, setDateFormat] = useState("");
  const [timeFormat, setTimeFormat] = useState("12h");
  const [fiscalYearStart, setFiscalYearStart] = useState("");
  const [weeklyOffDays, setWeeklyOffDays] = useState<string[]>([]);
  const [workingHoursInput, setWorkingHoursInput] = useState("8");
  const [customWeekOffRules, setCustomWeekOffRules] = useState<CustomWeekOffRule[]>([]);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(loadOrganizationRequest());
    return () => {
      dispatch(resetOrganizationStatus());
    };
  }, [dispatch]);

  // Populate local states when organization is fetched
  useEffect(() => {
    if (organization) {
      setCompanyName(organization.companyName || "");
      setLegalName(organization.legalName || "");
      setIndustry(organization.industry || "");
      setPhone(organization.phone || "");

      setAddressLine1(organization.address?.addressLine1 || "");
      setCity(organization.address?.city || "");
      setStateName(organization.address?.state || "");
      setCountryCode(organization.address?.countryCode || "IN");
      setZip(organization.address?.zip || "");

      setPrimaryColor(organization.branding?.primaryColor || "#2886CE");
      setWebsite(organization.branding?.website || "");
      setSupportEmail(organization.branding?.supportEmail || "");

      setTimezone(organization.locale?.timezone || "Asia/Kolkata");
      setDateFormat(organization.locale?.dateFormat || "DD/MM/YYYY");
      setTimeFormat(organization.locale?.timeFormat === "24h" ? "24h" : "12h");
      setFiscalYearStart(organization.locale?.fiscalYearStart || "April");
      setWeeklyOffDays(organization.locale?.weeklyOffDays || ["Saturday", "Sunday"]);
      setWorkingHoursInput(formatWorkingHoursDisplay(organization.locale?.workingHoursPerDay || 8));
      
      const savedRules = localStorage.getItem("hrms_org_custom_week_off_rules");
      const orgRules = organization.locale?.customWeekOffRules;
      if (orgRules && orgRules.length > 0) {
        setCustomWeekOffRules(orgRules);
      } else if (savedRules) {
        try {
          setCustomWeekOffRules(JSON.parse(savedRules));
        } catch {
          setCustomWeekOffRules([]);
        }
      } else {
        setCustomWeekOffRules([]);
      }
    }
  }, [organization]);

  // Trigger snackbar on success and exit edit mode
  useEffect(() => {
    if (success) {
      showSnackbar("Organization updated successfully", "success");
      setIsEditing(false);
      dispatch(resetOrganizationStatus());
    }
  }, [success, dispatch, showSnackbar]);

  const handleCancel = () => {
    if (organization) {
      setCompanyName(organization.companyName || "");
      setLegalName(organization.legalName || "");
      setIndustry(organization.industry || "");
      setPhone(organization.phone || "");
      setAddressLine1(organization.address?.addressLine1 || "");
      setCity(organization.address?.city || "");
      setStateName(organization.address?.state || "");
      setCountryCode(organization.address?.countryCode || "IN");
      setZip(organization.address?.zip || "");
      setPrimaryColor(organization.branding?.primaryColor || "#2886CE");
      setWebsite(organization.branding?.website || "");
      setSupportEmail(organization.branding?.supportEmail || "");
      setTimezone(organization.locale?.timezone || "Asia/Kolkata");
      setDateFormat(organization.locale?.dateFormat || "DD/MM/YYYY");
      setTimeFormat(organization.locale?.timeFormat === "24h" ? "24h" : "12h");
      setFiscalYearStart(organization.locale?.fiscalYearStart || "April");
      setWeeklyOffDays(organization.locale?.weeklyOffDays || ["Saturday", "Sunday"]);
      setWorkingHoursInput(formatWorkingHoursDisplay(organization.locale?.workingHoursPerDay || 8));
    }
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdate) return;

    localStorage.setItem("hrms_org_custom_week_off_rules", JSON.stringify(customWeekOffRules));

    dispatch(
      updateOrganizationRequest({
        companyName,
        legalName,
        industry,
        phone,
        address: {
          addressLine1,
          city,
          state: stateName,
          countryCode,
          zip,
        },
        branding: {
          primaryColor,
          website,
          supportEmail,
        },
        locale: {
          timezone,
          dateFormat,
          timeFormat: timeFormat as "12h" | "24h",
          fiscalYearStart,
          weeklyOffDays,
          workingHoursPerDay: parseWorkingHoursToDecimal(workingHoursInput),
          customWeekOffRules,
        },
      })
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
        <CircularProgress size={40} sx={{ color: "#6D5DF6" }} />
      </Box>
    );
  }

  if (!organization) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2.5 }}>
        No organization settings found.
      </Alert>
    );
  }

  const { subscription } = organization;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 } }} component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Row 1: Profile Form & Subscription Info */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
              border: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: "rgba(109, 93, 246, 0.08)",
                  color: "#6D5DF6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BusinessOutlinedIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 750, color: "#111827" }}>
                  Basic Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your organization's general information
                </Typography>
              </Box>
              {canUpdate && !isEditing && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditOutlinedIcon />}
                  onClick={() => setIsEditing(true)}
                  sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, borderColor: "#D1D5DB", color: "#374151" }}
                >
                  Edit
                </Button>
              )}
            </Box>

            <Divider />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextInput
                  label="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={!canUpdate || !isEditing}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextInput
                  label="Legal Name"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  disabled={!canUpdate || !isEditing}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextInput
                  label="Industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  disabled={!canUpdate || !isEditing}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextInput
                  label="Phone Number"
                  value={phone}
                  maxLength={10}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  disabled={!canUpdate || !isEditing}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Subscription Plan Card (Read-only status) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",
              color: "#fff",
              boxShadow: "0px 8px 30px rgba(49, 46, 129, 0.15)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 3,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "#A5B4FC", fontWeight: 700 }}>
                  SUBSCRIPTION PLAN
                </Typography>
                <Chip
                  label={subscription.plan.toUpperCase()}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(165, 180, 252, 0.25)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 10,
                  }}
                />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                NexusHR {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
              </Typography>
              <Typography variant="caption" sx={{ color: "#C7D2FE", display: "block" }}>
                Status: {subscription.status.toUpperCase()}
              </Typography>
            </Box>

            <Divider sx={{ backgroundColor: "rgba(255,255,255,0.08)" }} />

            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ color: "#E0E7FF" }}>
                  Max Branches Capacity
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {subscription.maxBranches}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "#E0E7FF" }}>
                  Max Employees Limit
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {subscription.maxEmployees}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Address Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
              border: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              height: "100%",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 750, color: "#111827" }}>
              Corporate Address
            </Typography>
            <Divider />

            <Grid container spacing={2}>
              <Grid size={12}>
                <TextInput
                  label="Address Line 1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  disabled={!canUpdate || !isEditing}
                />
              </Grid>
              <Grid size={6}>
                <TextInput
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!canUpdate || !isEditing}
                />
              </Grid>
              <Grid size={6}>
                <TextInput
                  label="State"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  disabled={!canUpdate || !isEditing}
                />
              </Grid>
              <Grid size={6}>
                <TextInput
                  select
                  label="Country"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={!canUpdate || !isEditing}
                >
                  {COUNTRIES.map((c) => (
                    <MenuItem key={c.code} value={c.code}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextInput>
              </Grid>
              <Grid size={6}>
                <TextInput
                  label="Zip Code"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  disabled={!canUpdate || !isEditing}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Branding & Support Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
              border: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              height: "100%",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 750, color: "#111827" }}>
              Branding & Support
            </Typography>
            <Divider />

            <Grid container spacing={2}>
              <Grid size={12}>
                <TextInput
                  label="Website URL"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  disabled={!canUpdate || !isEditing}
                />
              </Grid>
              <Grid size={6}>
                <TextInput
                  label="Primary Branding Color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  disabled={!canUpdate || !isEditing}
                />
              </Grid>
              <Grid size={6}>
                <TextInput
                  label="Support Email"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  disabled={!canUpdate || !isEditing}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Row 2: Locale Preferences & Corporate Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
              border: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <LanguageOutlinedIcon sx={{ color: "#6D5DF6" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 750, color: "#111827" }}>
                Locale & Regional Settings
              </Typography>
            </Box>
            <Divider />

            <Grid container spacing={2}>
              <Grid size={6}>
                <TextInput
                  select
                  label="Timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  disabled={!canUpdate || !isEditing}
                >
                  {TIMEZONES.map((tz) => (
                    <MenuItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </MenuItem>
                  ))}
                </TextInput>
              </Grid>
              <Grid size={6}>
                <TextInput
                  select
                  label="Date Format"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  disabled={!canUpdate || !isEditing}
                >
                  {DATE_FORMATS.map((df) => (
                    <MenuItem key={df} value={df}>
                      {df}
                    </MenuItem>
                  ))}
                </TextInput>
              </Grid>
              <Grid size={6}>
                <TextInput
                  select
                  label="Time Format"
                  value={timeFormat}
                  onChange={(e) => setTimeFormat(e.target.value)}
                  disabled={!canUpdate || !isEditing}
                >
                  {TIME_FORMATS.map((tf) => (
                    <MenuItem key={tf} value={tf}>
                      {tf}
                    </MenuItem>
                  ))}
                </TextInput>
              </Grid>
              <Grid size={6}>
                <TextInput
                  select
                  label="Fiscal Year Start"
                  value={fiscalYearStart}
                  onChange={(e) => setFiscalYearStart(e.target.value)}
                  disabled={!canUpdate || !isEditing}
                >
                  {FISCAL_STARTS.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextInput>
              </Grid>
              <Grid size={6}>
                <TextInput
                  type="text"
                  label="Working Hours / Day"
                  value={workingHoursInput}
                  placeholder="08:40 or 8"
                  onChange={(e) => setWorkingHoursInput(e.target.value ?? "")}
                  disabled={!canUpdate || !isEditing}
                />
              </Grid>
              <Grid size={6}>
                <TextInput
                  select
                  label="Weekly Off Days"
                  disabled={!canUpdate || !isEditing}
                  slotProps={{
                    select: {
                      multiple: true,
                      value: weeklyOffDays,
                      onChange: (e: any) =>
                        setWeeklyOffDays(
                          typeof e.target.value === "string"
                            ? e.target.value.split(",")
                            : e.target.value
                        ),
                      renderValue: (selected: any) => (selected as string[]).join(", "),
                    },
                  }}
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <MenuItem key={day} value={day}>
                      <Checkbox checked={weeklyOffDays.indexOf(day) > -1} />
                      <ListItemText primary={day} />
                    </MenuItem>
                  ))}
                </TextInput>
              </Grid>

              <Grid size={12} sx={{ mt: 1 }}>
                <CustomWeekOffRulesBuilder
                  rules={customWeekOffRules}
                  onChange={setCustomWeekOffRules}
                  disabled={!canUpdate || !isEditing}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Corporate Statutory Identifiers (Read-only view in basic details) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
              border: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <GavelOutlinedIcon sx={{ color: "#6D5DF6" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 750, color: "#111827" }}>
                Statutory Registration Identifiers
              </Typography>
            </Box>
            <Divider />

            <Grid container spacing={2}>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary">
                  CIN
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.2 }}>
                  {organization.cin || "Not specified"}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary">
                  GSTIN
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.2 }}>
                  {organization.gstin || "Not specified"}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary">
                  PAN
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.2 }}>
                  {organization.pan || "Not specified"}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary">
                  TAN
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.2 }}>
                  {organization.tan || "Not specified"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Submit Actions Bar */}
        {canUpdate && isEditing && (
          <Grid size={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                disabled={submitting}
                onClick={handleCancel}
                startIcon={<CloseOutlinedIcon />}
                sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2.5, px: 3, py: 1.5, borderColor: "#D1D5DB", color: "#374151" }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                startIcon={
                  submitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                sx={{
                  backgroundColor: "#6D5DF6",
                  color: "#fff",
                  px: 4,
                  py: 1.5,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "0px 4px 12px rgba(109, 93, 246, 0.2)",
                  "&:hover": {
                    backgroundColor: "#5B4EE4",
                    boxShadow: "0px 6px 16px rgba(109, 93, 246, 0.3)",
                  },
                }}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default OrganizationProfileContent;
