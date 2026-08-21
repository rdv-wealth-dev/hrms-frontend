import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  onboardingStep5Schema,
  type OnboardingStep5FormData,
} from "../../../validations/onboarding/onboarding.schema";

interface OnboardingStep5Props {
  onSubmitStep: (data: OnboardingStep5FormData) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  errorMsg?: string | null;
}

export default function OnboardingStep5Review({
  onSubmitStep,
  onBack,
  loading,
  errorMsg,
}: OnboardingStep5Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingStep5FormData>({
    resolver: zodResolver(onboardingStep5Schema),
    defaultValues: {
      confirmed: true as any,
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitStep)}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3, textAlign: "center" }}>
        <Box sx={{ display: "inline-flex", p: 2, borderRadius: "50%", backgroundColor: "#EEF2FF", color: "#4F46E5", mb: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 48 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", mb: 1 }}>
          5. Final Review &amp; Confirmation
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 500, mx: "auto", mb: 3 }}>
          You are ready to submit your onboarding profile. Please confirm that all provided details, address, bank info, and emergency contacts are accurate.
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, textAlign: "left", maxWidth: 500, mx: "auto" }}>
            {errorMsg}
          </Alert>
        )}

        <Box sx={{ maxWidth: 500, mx: "auto", p: 2.5, backgroundColor: "#F8FAFC", borderRadius: 2.5, border: "1px dashed #CBD5E1", textAlign: "left" }}>
          <FormControlLabel
            control={<Checkbox {...register("confirmed")} defaultChecked sx={{ color: "#6366F1", "&.Mui-checked": { color: "#4F46E5" } }} />}
            label={
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.88rem" }}>
                I confirm that all information provided during this onboarding process is accurate, complete, and true to the best of my knowledge.
              </Typography>
            }
          />
          {errors.confirmed && (
            <Typography variant="caption" color="error" sx={{ display: "block", mt: 1, ml: 4 }}>
              {errors.confirmed.message}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexDirection: { xs: "column-reverse", sm: "row" } }}>
        <Button
          variant="outlined"
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
          sx={{ px: 3, py: 1.2, borderRadius: "10px", color: "#64748B", borderColor: "#CBD5E1", width: { xs: "100%", sm: "auto" } }}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            px: 5,
            py: 1.3,
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.95rem",
            backgroundColor: "#059669",
            "&:hover": { backgroundColor: "#047857" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {loading ? "Submitting..." : "Complete & Finish Onboarding"}
        </Button>
      </Box>
    </Box>
  );
}
