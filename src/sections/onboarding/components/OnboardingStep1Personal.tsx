import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
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
import { formatToYYYYMMDD } from "../../../utils/format-date";

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

const buildStep1Defaults = (initial?: Partial<OnboardingStep1FormData>): OnboardingStep1FormData => ({
  dateOfBirth: formatToYYYYMMDD(initial?.dateOfBirth) || "",
  gender: initial?.gender || "",
  bloodGroup: initial?.bloodGroup || "",
  maritalStatus: initial?.maritalStatus || "",
  phone: initial?.phone || "",
  pan: initial?.pan || "",
  aadhaar: initial?.aadhaar || "",
  passportNo: initial?.passportNo || "",
  currentAddress: {
    addressLine1: initial?.currentAddress?.addressLine1 || "",
    addressLine2: initial?.currentAddress?.addressLine2 || "",
    city: initial?.currentAddress?.city || "",
    state: initial?.currentAddress?.state || "",
    countryCode: initial?.currentAddress?.countryCode || "IN",
    zip: initial?.currentAddress?.zip || "",
  },
  emergencyContact: initial?.emergencyContact?.length
    ? initial.emergencyContact
    : [{ name: "", relationship: "", phone: "", email: "" }],
});

export default function OnboardingStep1Personal({
  initialValues,
  onSubmitStep,
  loading,
}: OnboardingStep1Props) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OnboardingStep1FormData>({
    resolver: zodResolver(onboardingStep1Schema),
    defaultValues: buildStep1Defaults(initialValues),
  });

  useEffect(() => {
    if (initialValues) {
      reset(buildStep1Defaults(initialValues));
    }
  }, [initialValues, reset]);

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
              required
              registration={register("dateOfBirth")}
              error={errors.dateOfBirth?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  select
                  required
                  label="Gender"
                  error={errors.gender?.message}
                >
                  <MenuItem value="">Select Gender</MenuItem>
                  {GENDERS.map((g) => (
                    <MenuItem key={g} value={g}>{g}</MenuItem>
                  ))}
                </TextInput>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="maritalStatus"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  select
                  required
                  label="Marital Status"
                  error={errors.maritalStatus?.message}
                >
                  <MenuItem value="">Select Marital Status</MenuItem>
                  {MARITAL_STATUSES.map((m) => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </TextInput>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="bloodGroup"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  select
                  label="Blood Group (Optional)"
                  error={errors.bloodGroup?.message}
                >
                  <MenuItem value="">Select Blood Group</MenuItem>
                  {BLOOD_GROUPS.map((bg) => (
                    <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                  ))}
                </TextInput>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Phone Number"
              type="tel"
              maxLength={10}
              required
              registration={register("phone")}
              error={errors.phone?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="PAN Card Number"
              maxLength={10}
              registration={register("pan")}
              error={errors.pan?.message}
              slotProps={{ htmlInput: { style: { textTransform: "uppercase" } } }}
              onChange={(e) => {
                const upper = (e.target.value ?? "").toUpperCase();
                setValue("pan", upper, { shouldValidate: true });
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Aadhaar Card Number"
              maxLength={12}
              registration={register("aadhaar")}
              error={errors.aadhaar?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Passport Number (Optional)"
              registration={register("passportNo")}
              error={errors.passportNo?.message}
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
              required
              registration={register("currentAddress.addressLine1")}
              error={errors.currentAddress?.addressLine1?.message}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextInput
              label="Address Line 2 (Optional)"
              registration={register("currentAddress.addressLine2")}
              error={errors.currentAddress?.addressLine2?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="City"
              required
              registration={register("currentAddress.city")}
              error={errors.currentAddress?.city?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="State"
              required
              registration={register("currentAddress.state")}
              error={errors.currentAddress?.state?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="currentAddress.countryCode"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  select
                  required
                  label="Country"
                  error={errors.currentAddress?.countryCode?.message}
                >
                  {COUNTRIES.map((c) => (
                    <MenuItem key={c.code} value={c.code}>{c.name} ({c.code})</MenuItem>
                  ))}
                </TextInput>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Zip / Postal Code"
              type="tel"
              maxLength={6}
              required
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
                  required
                  registration={register(`emergencyContact.${idx}.name` as const)}
                  error={errors.emergencyContact?.[idx]?.name?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextInput
                  label="Relationship"
                  required
                  registration={register(`emergencyContact.${idx}.relationship` as const)}
                  error={errors.emergencyContact?.[idx]?.relationship?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextInput
                  label="Phone Number"
                  type="tel"
                  maxLength={10}
                  required
                  registration={register(`emergencyContact.${idx}.phone` as const)}
                  error={errors.emergencyContact?.[idx]?.phone?.message}
                />
              </Grid>
              <Grid size={{ xs: 10, sm: 2.5 }}>
                <TextInput
                  label="Email Address"
                  required
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
