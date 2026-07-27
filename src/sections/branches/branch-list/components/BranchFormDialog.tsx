import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";

import type { Branch, CreateBranchRequest } from "../../../../store/branch/branch.types";
import { CustomWeekOffRulesBuilder } from "../../../../components/settings/CustomWeekOffRulesBuilder";
import type { CustomWeekOffRule } from "../../../../store/organization/organization.types";

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
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState<number>(9);
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
        setWorkingHoursPerDay(initialValues.workPolicy?.workingHoursPerDay ?? 9);
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
        setWorkingHoursPerDay(9);
        setCustomWeekOffRules([]);
        setPfApplicable(false);
        setEsiApplicable(false);
        setPtApplicable(false);
        setPtStateCode("");
      }
    }
  }, [open, mode, initialValues]);

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
        workingHoursPerDay: Number(workingHoursPerDay) || undefined,
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

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {mode === "create" ? "Create Branch" : "Update Branch"}
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2, pb: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            {/* Section 1: Basic Details */}
            <Grid size={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#6D5DF6", mb: 1 }}>
                Basic Details
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                label="Branch Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bangalore Office"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                label="Branch Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. BLR-01"
                size="small"
                slotProps={{ htmlInput: { style: { textTransform: "uppercase" } } }}
              />
            </Grid>

            {/* Section 2: Address */}
            <Grid size={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#6D5DF6", mb: 1 }}>
                Address Details
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="e.g. 456 Tech Hub"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Address Line 2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="e.g. Phase 1"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bangalore"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Karnataka"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <TextField
                required
                fullWidth
                label="Country Code"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                placeholder="IN"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <TextField
                fullWidth
                label="Zip"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="560001"
                size="small"
              />
            </Grid>

            {/* Section 3: Contact */}
            <Grid size={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#6D5DF6", mb: 1 }}>
                Contact Details
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="blr1@abctech.com"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                size="small"
                slotProps={{ htmlInput: { maxLength: 10 } }}
              />
            </Grid>

            {/* Section 4: Work Policy */}
            <Grid size={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#6D5DF6", mb: 1 }}>
                Work Policy
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="Timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                size="small"
              >
                {TIMEZONES.map((tz) => (
                  <MenuItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <TextField
                fullWidth
                label="Start Time"
                type="text"
                value={shiftStartTime}
                onChange={(e) => setShiftStartTime(e.target.value)}
                placeholder="09:00"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <TextField
                fullWidth
                label="End Time"
                type="text"
                value={shiftEndTime}
                onChange={(e) => setShiftEndTime(e.target.value)}
                placeholder="18:00"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Working Hours Per Day"
                type="number"
                value={workingHoursPerDay || ""}
                placeholder="8"
                onChange={(e) => setWorkingHoursPerDay(e.target.value === "" ? 8 : Number(e.target.value))}
                size="small"
              />
            </Grid>
            <Grid size={12}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}>
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

            {/* Section 5: Statutory */}
            <Grid size={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#6D5DF6", mb: 1 }}>
                Statutory Configurations
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
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
            <Grid size={{ xs: 12, sm: 3 }}>
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
            <Grid size={{ xs: 12, sm: 3 }}>
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
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="PT State Code"
                value={ptStateCode}
                onChange={(e) => setPtStateCode(e.target.value)}
                placeholder="e.g. KA"
                size="small"
                disabled={!ptApplicable}
              />
              </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={submitting} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              backgroundColor: "#6D5DF6",
              "&:hover": { backgroundColor: "#5B4EE4" },
            }}
          >
            {submitting ? (
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
            ) : null}
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default BranchFormDialog;
