import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  onboardingStep3Schema,
  type OnboardingStep3FormData,
} from "../../../validations/onboarding/onboarding.schema";
import TextInput from "../../../components/input/TextInput";
import SkipStepButton from "./SkipStepButton";

const ACCOUNT_TYPES = [
  { value: "SALARY", label: "Salary Account" },
  { value: "SAVINGS", label: "Savings Account" },
  { value: "CURRENT", label: "Current Account" },
] as const;

interface OnboardingStep3Props {
  initialValues?: Partial<OnboardingStep3FormData>;
  onSubmitStep: (data: OnboardingStep3FormData) => Promise<void>;
  onBack: () => void;
  onSkipStep?: () => void;
  loading: boolean;
}

const buildStep3Defaults = (initial?: Partial<OnboardingStep3FormData>): OnboardingStep3FormData => ({
  bankName: initial?.bankName || "",
  accountNumber: initial?.accountNumber || "",
  ifscCode: initial?.ifscCode || "",
  accountType: initial?.accountType || "",
});

export default function OnboardingStep3Bank({
  initialValues,
  onSubmitStep,
  onBack,
  onSkipStep,
  loading,
}: OnboardingStep3Props) {

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OnboardingStep3FormData>({
    resolver: zodResolver(onboardingStep3Schema),
    defaultValues: buildStep3Defaults(initialValues),
  });

  useEffect(() => {
    if (initialValues) {
      reset(buildStep3Defaults(initialValues));
    }
  }, [initialValues, reset]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitStep)}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 2.5 }}>
          3. Bank Account Details
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Bank Name"
              required
              registration={register("bankName")}
              error={errors.bankName?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Account Number"
              required
              registration={register("accountNumber")}
              error={errors.accountNumber?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="IFSC Code"
              required
              registration={register("ifscCode")}
              error={errors.ifscCode?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="accountType"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  select
                  required
                  label="Account Type"
                  error={errors.accountType?.message}
                >
                  <MenuItem value="">Select Account Type</MenuItem>
                  {ACCOUNT_TYPES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </TextInput>
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexDirection: { xs: "column-reverse", sm: "row" } }}>
        <Button
          variant="outlined"
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
          sx={{ px: 3, py: 1.2, borderRadius: "10px", color: "#64748B", borderColor: "#CBD5E1", width: { xs: "100%", sm: "auto" } }}
        >
          Back
        </Button>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center", width: { xs: "100%", sm: "auto" }, flexDirection: { xs: "column-reverse", sm: "row" } }}>
          <SkipStepButton onSkip={onSkipStep} loading={loading} />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            endIcon={<ArrowForwardIcon />}
            sx={{ px: 4, py: 1.2, borderRadius: "10px", backgroundColor: "#4F46E5", "&:hover": { backgroundColor: "#4338CA" }, width: { xs: "100%", sm: "auto" } }}
          >
            {loading ? "Saving..." : "Save & Continue"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
