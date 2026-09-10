import { useState, useEffect } from "react";
import { toast } from "sonner";

import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

import TextInput from "../../../components/input/TextInput";
import PhoneInput from "../../../components/input/PhoneInput";
import { updateEmployee, type CompleteProfileEmployee } from "../../../api/employee.api";
import { getApiErrorMessage } from "../../../utils/handle-api-error";

interface PersonalEditDialogProps {
  open: boolean;
  empProfile: CompleteProfileEmployee | null;
  displayEmail: string;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const formatDateInput = (dateVal?: string | Date | null): string => {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    return !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "";
  } catch {
    return "";
  }
};

export default function PersonalEditDialog({
  open,
  empProfile,
  displayEmail,
  onClose,
  onSuccess,
}: PersonalEditDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("IN");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [currAddress1, setCurrAddress1] = useState("");
  const [currAddress2, setCurrAddress2] = useState("");
  const [currCity, setCurrCity] = useState("");
  const [currState, setCurrState] = useState("");
  const [currZip, setCurrZip] = useState("");
  const empId = empProfile?._id || empProfile?.id;

  useEffect(() => {
    if (open) {
      setError(null);
      if (empProfile) {
        setFirstName(empProfile.firstName || "");
        setLastName(empProfile.lastName || "");
        setPhone(empProfile.phone || "");
        setCountryCode(empProfile.countryCode || "IN");
        setGender(empProfile.gender || "");
        setDateOfBirth(formatDateInput(empProfile.dateOfBirth));

        const curr = empProfile.currentAddress || {};
        setCurrAddress1(curr.addressLine1 || "");
        setCurrAddress2(curr.addressLine2 || "");
        setCurrCity(curr.city || "");
        setCurrState(curr.state || "");
        setCurrZip(curr.zip || "");
      }
    }
  }, [open, empProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empId) return;

    if (!firstName.trim() || !lastName.trim()) {
      setError("First Name and Last Name are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        countryCode: countryCode || "IN",
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
        currentAddress: {
          addressLine1: currAddress1.trim(),
          addressLine2: currAddress2.trim() || undefined,
          city: currCity.trim(),
          state: currState.trim(),
          countryCode: "IN",
          zip: currZip.trim(),
        },
      };

      const res = await updateEmployee(empId, payload);
      if (res?.succeeded) {
        toast.success("Personal information & address updated successfully!");
        await onSuccess();
        onClose();
      } else {
        setError(res?.message || "Failed to update personal details.");
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Failed to update personal details."));
    } finally {
      setSubmitting(false);
    }
  };

  const fullName = empProfile
    ? `${empProfile.firstName || ""} ${empProfile.lastName || ""}`.trim()
    : "Employee";

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
            borderRadius: { xs: "12px", sm: "20px" },
            p: { xs: 2, sm: 3 },
            backgroundColor: "background.paper",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid",
            borderColor: "divider",
          },
        },
      }}
    >
      <DialogTitle component="div" sx={{ p: 0, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PersonOutlinedIcon sx={{ color: "primary.main", fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                Edit Personal Details & Address
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {fullName} • {empProfile?.employeeCode || empId || "Employee"}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} disabled={submitting} size="small" sx={{ color: "#64748B" }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>{error}</Alert>}

          <Grid container spacing={2.5}>
            {/* First Name */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="First Name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={submitting}
              />
            </Grid>

            {/* Last Name */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Last Name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={submitting}
              />
            </Grid>

            {/* Official Work Email Address */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Official Work Email Address"
                disabled
                value={displayEmail || empProfile?.email || ""}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                Account email address cannot be changed.
              </Typography>
            </Grid>

            {/* Mobile Phone Number */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <PhoneInput
                label="Mobile Phone Number"
                countryCodeValue={countryCode}
                phoneValue={phone}
                onCountryCodeChange={(code) => setCountryCode(code)}
                onPhoneChange={(val) => setPhone(val)}
              />
            </Grid>

            {/* Gender */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                select
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={submitting}
              >
                <MenuItem value="">Select Gender</MenuItem>
                {GENDER_OPTIONS.map((g) => (
                  <MenuItem key={g.value} value={g.value}>
                    {g.label}
                  </MenuItem>
                ))}
              </TextInput>
            </Grid>

            {/* Date of Birth */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                type="date"
                label="Date of Birth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                disabled={submitting}
              />
            </Grid>

            {/* Current Address Line 1 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Address Line 1"
                placeholder="Flat / Building / Street"
                value={currAddress1}
                onChange={(e) => setCurrAddress1(e.target.value)}
                disabled={submitting}
              />
            </Grid>

            {/* Current Address Line 2 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Address Line 2"
                placeholder="Landmark / Area"
                value={currAddress2}
                onChange={(e) => setCurrAddress2(e.target.value)}
                disabled={submitting}
              />
            </Grid>

            {/* City */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="City"
                value={currCity}
                onChange={(e) => setCurrCity(e.target.value)}
                disabled={submitting}
              />
            </Grid>

            {/* State / Province */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="State / Province"
                value={currState}
                onChange={(e) => setCurrState(e.target.value)}
                disabled={submitting}
              />
            </Grid>

            {/* Postal / Zip Code */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Postal / Zip Code"
                value={currZip}
                onChange={(e) => setCurrZip(e.target.value)}
                disabled={submitting}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ pt: 2, px: { xs: 1, sm: 2 } }}>
          <Button onClick={onClose} disabled={submitting} sx={{ textTransform: "none", color: "text.secondary", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              px: 3,
              bgcolor: "primary.main",
            }}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
