import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import {
  onboardingStep1Schema,
  type OnboardingStep1FormData,
} from "../../../validations/onboarding/onboarding.schema";
import TextInput from "../../../components/input/TextInput";

const GENDERS = ["MALE", "FEMALE", "OTHER"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const MARITAL_STATUSES = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"];
const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
];

interface OnboardingStep1Props {
  initialValues?: Partial<OnboardingStep1FormData>;
  onSubmitStep: (data: OnboardingStep1FormData) => Promise<void>;
  loading: boolean;
}

export default function OnboardingStep1Personal({
  initialValues,
  onSubmitStep,
  loading,
}: OnboardingStep1Props) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingStep1FormData>({
    resolver: zodResolver(onboardingStep1Schema),
    defaultValues: {
      dateOfBirth: initialValues?.dateOfBirth || "",
      gender: initialValues?.gender || "MALE",
      bloodGroup: initialValues?.bloodGroup || "",
      maritalStatus: initialValues?.maritalStatus || "SINGLE",
      phone: initialValues?.phone || "",
      currentAddress: {
        addressLine1: initialValues?.currentAddress?.addressLine1 || "",
        addressLine2: initialValues?.currentAddress?.addressLine2 || "",
        city: initialValues?.currentAddress?.city || "",
        state: initialValues?.currentAddress?.state || "",
        countryCode: initialValues?.currentAddress?.countryCode || "IN",
        zip: initialValues?.currentAddress?.zip || "",
      },
      emergencyContact: initialValues?.emergencyContact?.length
        ? initialValues.emergencyContact
        : [{ name: "", relationship: "SPOUSE", phone: "", email: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "emergencyContact",
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitStep)}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", mb: 2.5 }}>
          1. Personal Information
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Date of Birth"
              type="date"
              placeholder=""
              registration={register("dateOfBirth")}
              error={errors.dateOfBirth?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: "#374151", fontSize: "13.5px" }}>
              Gender
            </Typography>
            <TextField
              select
              fullWidth
              {...register("gender")}
              error={!!errors.gender}
              helperText={errors.gender?.message}
              slotProps={{ htmlInput: { style: { fontSize: 14 } } }}
            >
              {GENDERS.map((g) => (
                <MenuItem key={g} value={g}>{g}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: "#374151", fontSize: "13.5px" }}>
              Marital Status
            </Typography>
            <TextField
              select
              fullWidth
              {...register("maritalStatus")}
              error={!!errors.maritalStatus}
              helperText={errors.maritalStatus?.message}
              slotProps={{ htmlInput: { style: { fontSize: 14 } } }}
            >
              {MARITAL_STATUSES.map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: "#374151", fontSize: "13.5px" }}>
              Blood Group (Optional)
            </Typography>
            <TextField
              select
              fullWidth
              {...register("bloodGroup")}
              error={!!errors.bloodGroup}
              helperText={errors.bloodGroup?.message}
              slotProps={{ htmlInput: { style: { fontSize: 14 } } }}
            >
              <MenuItem value="">Select Blood Group</MenuItem>
              {BLOOD_GROUPS.map((bg) => (
                <MenuItem key={bg} value={bg}>{bg}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Phone Number (with Country Code)"
              placeholder="+91 9876543210"
              registration={register("phone")}
              error={errors.phone?.message}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Current Address */}
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", mb: 2.5 }}>
          Current Address
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextInput
              label="Address Line 1"
              placeholder="Flat / House No., Building Name, Street"
              registration={register("currentAddress.addressLine1")}
              error={errors.currentAddress?.addressLine1?.message}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextInput
              label="Address Line 2 (Optional)"
              placeholder="Landmark, Area"
              registration={register("currentAddress.addressLine2")}
              error={errors.currentAddress?.addressLine2?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="City"
              placeholder="City name"
              registration={register("currentAddress.city")}
              error={errors.currentAddress?.city?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="State"
              placeholder="State name"
              registration={register("currentAddress.state")}
              error={errors.currentAddress?.state?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: "#374151", fontSize: "13.5px" }}>
              Country
            </Typography>
            <TextField
              select
              fullWidth
              {...register("currentAddress.countryCode")}
              error={!!errors.currentAddress?.countryCode}
              helperText={errors.currentAddress?.countryCode?.message}
            >
              {COUNTRIES.map((c) => (
                <MenuItem key={c.code} value={c.code}>{c.name} ({c.code})</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Zip / Postal Code"
              placeholder="e.g. 400001"
              registration={register("currentAddress.zip")}
              error={errors.currentAddress?.zip?.message}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Emergency Contacts */}
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
            Emergency Contacts (Min. 1 Required)
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => append({ name: "", relationship: "SPOUSE", phone: "", email: "" })}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Add Contact
          </Button>
        </Box>

        {errors.emergencyContact?.root && (
          <Typography variant="caption" color="error" sx={{ display: "block", mb: 1 }}>
            {errors.emergencyContact.root.message}
          </Typography>
        )}

        {fields.map((field, idx) => (
          <Box key={field.id} sx={{ mb: idx === fields.length - 1 ? 0 : 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextInput
                  label="Contact Name"
                  placeholder="Full Name"
                  registration={register(`emergencyContact.${idx}.name` as const)}
                  error={errors.emergencyContact?.[idx]?.name?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextInput
                  label="Relationship"
                  placeholder="e.g. Spouse, Sister"
                  registration={register(`emergencyContact.${idx}.relationship` as const)}
                  error={errors.emergencyContact?.[idx]?.relationship?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextInput
                  label="Phone Number"
                  placeholder="+91 9876543210"
                  registration={register(`emergencyContact.${idx}.phone` as const)}
                  error={errors.emergencyContact?.[idx]?.phone?.message}
                />
              </Grid>
              <Grid size={{ xs: 10, sm: 2.5 }}>
                <TextInput
                  label="Email (Optional)"
                  placeholder="email@example.com"
                  registration={register(`emergencyContact.${idx}.email` as const)}
                  error={errors.emergencyContact?.[idx]?.email?.message}
                />
              </Grid>
              <Grid size={{ xs: 2, sm: 0.5 }} sx={{ display: "flex", justifyContent: "flex-end", pt: 3 }}>
                {fields.length > 1 && (
                  <IconButton onClick={() => remove(idx)} size="small" sx={{ color: "#EF4444" }}>
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                )}
              </Grid>
            </Grid>
            {idx < fields.length - 1 && <Divider sx={{ my: 2 }} />}
          </Box>
        ))}
      </Paper>

      {/* Action Row */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          endIcon={<ArrowForwardIcon />}
          sx={{ px: 4, py: 1.2, borderRadius: "10px", backgroundColor: "#4F46E5", "&:hover": { backgroundColor: "#4338CA" } }}
        >
          {loading ? "Saving..." : "Save & Continue"}
        </Button>
      </Box>
    </Box>
  );
}
