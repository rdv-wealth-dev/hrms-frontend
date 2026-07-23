import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  onboardingStep3Schema,
  type OnboardingStep3FormData,
} from "../../../validations/onboarding/onboarding.schema";
import TextInput from "../../../components/input/TextInput";

const ACCOUNT_TYPES = [
  { value: "SALARY", label: "Salary Account" },
  { value: "SAVINGS", label: "Savings Account" },
  { value: "CURRENT", label: "Current Account" },
] as const;

interface OnboardingStep3Props {
  initialValues?: Partial<OnboardingStep3FormData>;
  onSubmitStep: (data: OnboardingStep3FormData) => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

export default function OnboardingStep3Bank({
  initialValues,
  onSubmitStep,
  onBack,
  loading,
}: OnboardingStep3Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OnboardingStep3FormData>({
    resolver: zodResolver(onboardingStep3Schema),
    defaultValues: {
      bankName: initialValues?.bankName || "",
      accountNumber: initialValues?.accountNumber || "",
      ifscCode: initialValues?.ifscCode || "",
      accountType: initialValues?.accountType || "SALARY",
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitStep)}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", mb: 2.5 }}>
          3. Bank Account Details
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Bank Name"
              placeholder="e.g. HDFC Bank, State Bank of India"
              registration={register("bankName")}
              error={errors.bankName?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Account Number"
              placeholder="8 to 20 numeric digits"
              registration={register("accountNumber")}
              error={errors.accountNumber?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="IFSC Code"
              placeholder="e.g. SBIN0001234"
              registration={register("ifscCode")}
              error={errors.ifscCode?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: "#374151", fontSize: "13.5px" }}>
              Account Type
            </Typography>
            <TextField
              select
              fullWidth
              value={watch("accountType") || "SALARY"}
              {...register("accountType")}
              error={!!errors.accountType}
              helperText={errors.accountType?.message}
            >
              {ACCOUNT_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
          sx={{ px: 3, py: 1.2, borderRadius: "10px", color: "#64748B", borderColor: "#CBD5E1" }}
        >
          Back
        </Button>
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
