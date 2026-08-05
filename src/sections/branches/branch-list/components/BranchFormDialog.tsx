import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";

import TextInput from "../../../../components/input/TextInput";
import type { Branch, CreateBranchRequest } from "../../../../store/branch/branch.types";
import { CustomWeekOffRulesBuilder } from "../../../../components/settings/CustomWeekOffRulesBuilder";
import type { CustomWeekOffRule } from "../../../../store/organization/organization.types";
import { syncBranchDataToOrganization } from "../../../../utils/org-sync-helper";
import {
  calculateWorkingHoursFromTimes,
  parseWorkingHoursToDecimal,
  formatWorkingHoursDisplay,
} from "../../../../utils/format-date";

type Props = {
  open: boolean;
  mode: "create" | "update";
  initialValues?: Branch | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (data: CreateBranchRequest) => void;
};

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata (India)" },
  { value: "Asia/Calcutta", label: "Asia/Calcutta (India Alternative)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "America/New_York (EST)" },
  { value: "Europe/London", label: "Europe/London (GMT)" },
];

function BranchFormDialog({ open, mode, initialValues, submitting, error, onClose, onSubmit }: Props) {
  // Details
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  // Address
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [countryCode, setCountryCode] = useState("IN");
  const [zip, setZip] = useState("");

  // Contact
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Work Policy
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [weeklyOffDays, setWeeklyOffDays] = useState<string[]>(["Saturday", "Sunday"]);
  const [shiftStartTime, setShiftStartTime] = useState("09:00");
  const [shiftEndTime, setShiftEndTime] = useState("18:00");
  const [workingHoursInput, setWorkingHoursInput] = useState("9");
  const [customWeekOffRules, setCustomWeekOffRules] = useState<CustomWeekOffRule[]>([]);

  // Statutory
  const [pfApplicable, setPfApplicable] = useState(false);
  const [esiApplicable, setEsiApplicable] = useState(false);
  const [ptApplicable, setPtApplicable] = useState(false);
  const [ptStateCode, setPtStateCode] = useState("");

  useEffect(() => {
    if (open) {
      if (mode === "update" && initialValues) {
        setName(initialValues.name ?? "");
        setCode(initialValues.code ?? "");
        setAddressLine1(initialValues.address?.addressLine1 ?? "");
        setAddressLine2(initialValues.address?.addressLine2 ?? "");
        setCity(initialValues.address?.city ?? "");
        setState(initialValues.address?.state ?? "");
        setCountryCode(initialValues.address?.countryCode ?? "IN");
        setZip(initialValues.address?.zip ?? "");
        setPhone(initialValues.contact?.phone ?? "");
        setEmail(initialValues.contact?.email ?? "");
        setTimezone(initialValues.workPolicy?.timezone ?? "Asia/Kolkata");
        setWeeklyOffDays(initialValues.workPolicy?.weeklyOffDays ?? []);
        setShiftStartTime(initialValues.workPolicy?.shiftStartTime ?? "09:00");
        setShiftEndTime(initialValues.workPolicy?.shiftEndTime ?? "18:00");
        setWorkingHoursInput(formatWorkingHoursDisplay(initialValues.workPolicy?.workingHoursPerDay ?? 9));
        setCustomWeekOffRules(initialValues.workPolicy?.customWeekOffRules ?? []);
        setPfApplicable(initialValues.statutory?.pfApplicable ?? false);
        setEsiApplicable(initialValues.statutory?.esiApplicable ?? false);
        setPtApplicable(initialValues.statutory?.ptApplicable ?? false);
        setPtStateCode(initialValues.statutory?.ptStateCode ?? "");
      } else {
        // Reset fields
        setName("");
        setCode("");
        setAddressLine1("");
        setAddressLine2("");
        setCity("");
        setState("");
        setCountryCode("IN");
        setZip("");
        setPhone("");
        setEmail("");
        setTimezone("Asia/Kolkata");
        setWeeklyOffDays(["Saturday", "Sunday"]);
        setShiftStartTime("09:00");
        setShiftEndTime("18:00");
        setWorkingHoursInput("9");
        setCustomWeekOffRules([]);
        setPfApplicable(false);
        setEsiApplicable(false);
        setPtApplicable(false);
        setPtStateCode("");
      }
    }
  }, [open, mode, initialValues]);

  // Auto-calculate working hours whenever shiftStartTime or shiftEndTime changes
  useEffect(() => {
    if (shiftStartTime && shiftEndTime) {
      const calculatedDisplay = calculateWorkingHoursFromTimes(shiftStartTime, shiftEndTime);
      setWorkingHoursInput(calculatedDisplay);
    }
  }, [shiftStartTime, shiftEndTime]);

  const handleWeeklyOffToggle = (day: string) => {
    if (weeklyOffDays.includes(day)) {
      setWeeklyOffDays(weeklyOffDays.filter((d) => d !== day));
    } else {
      setWeeklyOffDays([...weeklyOffDays, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !countryCode.trim()) return;

    const payload: CreateBranchRequest = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      address: {
        addressLine1: addressLine1.trim() || undefined,
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        countryCode: countryCode.trim(),
        zip: zip.trim() || undefined,
      },
      contact: {
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      },
      workPolicy: {
        timezone,
        weeklyOffDays,
        shiftStartTime: shiftStartTime || undefined,
        shiftEndTime: shiftEndTime || undefined,
        workingHoursPerDay: parseWorkingHoursToDecimal(workingHoursInput),
        customWeekOffRules,
      },
      statutory: {
        pfApplicable,
        esiApplicable,
        ptApplicable,
        ptStateCode: ptStateCode.trim() || undefined,
      },
      geo: { geofenceEnabled: true },
    };

    // Sync Branch data to Organization Profile
    syncBranchDataToOrganization(payload);

    onSubmit(payload);
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
      <DialogTitle sx={{ pt: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 2.5 }, pb: 1, fontWeight: 800, fontSize: { xs: "1.1rem", sm: "1.25rem" }, color: "#0F172A", flexShrink: 0 }}>
        {mode === "create" ? "Create Branch" : "Update Branch"}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", overflow: "hidden", flexGrow: 1 }}>
        <DialogContent
          sx={{
            px: { xs: 2, sm: 2.5 },
            pb: { xs: 2, sm: 2.5 },
            pt: 0.5,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            overflowY: "auto",
            flexGrow: 1,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
              margin: "6px 0",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#CBD5E1",
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: "#94A3B8",
              },
            },
          }}
        >
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={{ xs: 1.25, sm: 1.5, md: 1.75 }}>
            {/* Basic Details */}
            <Grid size={12}>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                Basic Details
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Branch Name"
                value={name}
                onChange={(e) => setName(e.target.value ?? "")}
                placeholder="e.g. Bangalore Office"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Branch Code"
                value={code}
                onChange={(e) => setCode((e.target.value ?? "").toUpperCase())}
                placeholder="e.g. BLR-01"
                required
              />
            </Grid>

            {/* Address Details */}
            <Grid size={12} sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                Address Details
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Address Line 1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value ?? "")}
                placeholder="e.g. 456 Tech Hub"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Address Line 2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value ?? "")}
                placeholder="e.g. Phase 1"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextInput
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value ?? "")}
                placeholder="e.g. Bangalore"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextInput
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value ?? "")}
                placeholder="e.g. Karnataka"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 2 }}>
              <TextInput
                label="Country Code"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value ?? "")}
                placeholder="IN"
                required
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 2 }}>
              <TextInput
                label="Zip"
                value={zip}
                onChange={(e) => setZip(e.target.value ?? "")}
                placeholder="560001"
              />
            </Grid>

            {/* Contact Details */}
            <Grid size={12} sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                Contact Details
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value ?? "")}
                placeholder="blr1@abctech.com"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Phone"
                value={phone}
                onChange={(e) => setPhone((e.target.value ?? "").replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                maxLength={10}
              />
            </Grid>

            {/* Work Policy */}
            <Grid size={12} sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                Work Policy
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                select
                label="Timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value ?? "")}
              >
                {TIMEZONES.map((tz) => (
                  <MenuItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </MenuItem>
                ))}
              </TextInput>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Working Hours Per Day"
                type="text"
                value={workingHoursInput}
                onChange={(e) => setWorkingHoursInput(e.target.value ?? "")}
                placeholder="08:40 or 8"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6 }}>
              <TextInput
                label="Start Time"
                value={shiftStartTime}
                onChange={(e) => setShiftStartTime(e.target.value ?? "")}
                placeholder="09:00"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6 }}>
              <TextInput
                label="End Time"
                value={shiftEndTime}
                onChange={(e) => setShiftEndTime(e.target.value ?? "")}
                placeholder="18:00"
              />
            </Grid>
            <Grid size={12}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155", mb: 0.5 }}>
                Weekly Off Days
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {WEEKDAYS.map((day) => {
                  const isChecked = weeklyOffDays.includes(day);
                  return (
                    <FormControlLabel
                      key={day}
                      control={
                        <Checkbox
                          size="small"
                          checked={isChecked}
                          onChange={() => handleWeeklyOffToggle(day)}
                          sx={{ color: "#6D5DF6", "&.Mui-checked": { color: "#6D5DF6" } }}
                        />
                      }
                      label={<Typography variant="body2">{day}</Typography>}
                    />
                  );
                })}
              </Box>
            </Grid>

            <Grid size={12} sx={{ mt: 1 }}>
              <CustomWeekOffRulesBuilder
                rules={customWeekOffRules}
                onChange={setCustomWeekOffRules}
              />
            </Grid>

            <Grid size={12} sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                Statutory Configurations
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={pfApplicable}
                    onChange={(e) => setPfApplicable(e.target.checked)}
                    sx={{ color: "#6D5DF6", "&.Mui-checked": { color: "#6D5DF6" } }}
                  />
                }
                label={<Typography variant="body2">PF Applicable</Typography>}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={esiApplicable}
                    onChange={(e) => setEsiApplicable(e.target.checked)}
                    sx={{ color: "#6D5DF6", "&.Mui-checked": { color: "#6D5DF6" } }}
                  />
                }
                label={<Typography variant="body2">ESI Applicable</Typography>}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={ptApplicable}
                    onChange={(e) => setPtApplicable(e.target.checked)}
                    sx={{ color: "#6D5DF6", "&.Mui-checked": { color: "#6D5DF6" } }}
                  />
                }
                label={<Typography variant="body2">PT Applicable</Typography>}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextInput
                label="PT State Code"
                value={ptStateCode}
                onChange={(e) => setPtStateCode(e.target.value ?? "")}
                placeholder="e.g. KA"
                disabled={!ptApplicable}
              />
            </Grid>

            {/* Responsive Actions inside form directly below Statutory Configurations */}
            <Grid size={12} sx={{ display: "flex", flexDirection: { xs: "column-reverse", sm: "row" }, justifyContent: "flex-end", gap: 1.5, mt: 2 }}>
              <Button
                onClick={onClose}
                disabled={submitting}
                sx={{
                  height: 42,
                  borderRadius: "10px",
                  px: 2.5,
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "none",
                  color: "#475569",
                  backgroundColor: "#F1F5F9",
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": { backgroundColor: "#E2E8F0" },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                sx={{
                  height: 42,
                  borderRadius: "10px",
                  px: 3,
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "none",
                  backgroundColor: "#6D5DF6",
                  color: "#FFFFFF",
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": { backgroundColor: "#5B4BEA" },
                }}
              >
                {submitting ? (
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                ) : null}
                {mode === "create" ? "Create" : "Save"}
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Box>
    </Dialog>
  );
}

export default BranchFormDialog;
