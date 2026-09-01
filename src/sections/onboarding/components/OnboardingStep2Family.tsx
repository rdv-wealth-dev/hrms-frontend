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
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  onboardingStep2Schema,
  type OnboardingStep2FormData,
} from "../../../validations/onboarding/onboarding.schema";
import TextInput from "../../../components/input/TextInput";
import { formatToYYYYMMDD } from "../../../utils/format-date";

const RELATIONSHIPS = ["SPOUSE", "CHILD", "FATHER", "MOTHER", "SIBLING", "OTHER"] as const;

interface OnboardingStep2Props {
  initialValues?: Partial<OnboardingStep2FormData>;
  onSubmitStep: (data: OnboardingStep2FormData) => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

const buildStep2Defaults = (initial?: Partial<OnboardingStep2FormData>): OnboardingStep2FormData => ({
  familyMembers: (initial?.familyMembers || []).map((m) => ({
    ...m,
    dateOfBirth: formatToYYYYMMDD(m.dateOfBirth) || "",
  })),
});

export default function OnboardingStep2Family({
  initialValues,
  onSubmitStep,
  onBack,
  loading,
}: OnboardingStep2Props) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OnboardingStep2FormData>({
    resolver: zodResolver(onboardingStep2Schema),
    defaultValues: buildStep2Defaults(initialValues),
  });

  useEffect(() => {
    if (initialValues) {
      reset(buildStep2Defaults(initialValues));
    }
  }, [initialValues, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "familyMembers",
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitStep)}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
              2. Family Members &amp; Dependents
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
              Single employees with no dependents may skip this step by clicking <strong>&quot;Save &amp; Continue&quot;</strong>.
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() =>
              append({
                fullName: "",
                relationship: "",
                dateOfBirth: "",
                gender: "",
                isDependent: true,
                occupation: "",
                phone: "",
                isNominee: false,
              })
            }
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Add Family Member
          </Button>
        </Box>

        {fields.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center", backgroundColor: "#F8FAFC", borderRadius: 2, border: "1.5px dashed #CBD5E1", my: 2 }}>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              No family members added. If you have dependents or nominees, click <strong>&quot;Add Family Member&quot;</strong> above.
            </Typography>
          </Box>
        ) : (
          fields.map((field, idx) => (
            <Box key={field.id} sx={{ my: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextInput
                    label="Full Name"
                    required
                    registration={register(`familyMembers.${idx}.fullName` as const)}
                    error={errors.familyMembers?.[idx]?.fullName?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
                  <Controller
                    name={`familyMembers.${idx}.relationship` as const}
                    control={control}
                    render={({ field: selectField }) => (
                      <TextInput
                        {...selectField}
                        select
                        required
                        label="Relationship"
                        error={errors.familyMembers?.[idx]?.relationship?.message}
                      >
                        <MenuItem value="">Select Relationship</MenuItem>
                        {RELATIONSHIPS.map((rel) => (
                          <MenuItem key={rel} value={rel}>{rel}</MenuItem>
                        ))}
                      </TextInput>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 2.3 }}>
                  <TextInput
                    label="Date of Birth"
                    type="date"
                    registration={register(`familyMembers.${idx}.dateOfBirth` as const)}
                    error={errors.familyMembers?.[idx]?.dateOfBirth?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
                  <TextInput
                    label="Occupation"
                    registration={register(`familyMembers.${idx}.occupation` as const)}
                    error={errors.familyMembers?.[idx]?.occupation?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 2.3 }}>
                  <TextInput
                    label="Phone Number"
                    type="tel"
                    maxLength={10}
                    required
                    registration={register(`familyMembers.${idx}.phone` as const)}
                    error={errors.familyMembers?.[idx]?.phone?.message}
                  />
                </Grid>

                <Grid size={12} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <FormControlLabel
                      control={<Checkbox {...register(`familyMembers.${idx}.isDependent` as const)} defaultChecked />}
                      label={<Typography variant="body2" sx={{ fontSize: "13px" }}>Is Dependent?</Typography>}
                    />
                    <FormControlLabel
                      control={<Checkbox {...register(`familyMembers.${idx}.isNominee` as const)} />}
                      label={<Typography variant="body2" sx={{ fontSize: "13px" }}>Is Nominee?</Typography>}
                    />
                  </Box>
                  <IconButton onClick={() => remove(idx)} size="small" sx={{ color: "#EF4444", "&:hover": { backgroundColor: "#FEE2E2" } }}>
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                </Grid>
              </Grid>
              {idx < fields.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))
        )}
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
          endIcon={<ArrowForwardIcon />}
          sx={{ px: 4, py: 1.2, borderRadius: "10px", backgroundColor: "#4F46E5", "&:hover": { backgroundColor: "#4338CA" }, width: { xs: "100%", sm: "auto" } }}
        >
          {loading ? "Saving..." : "Save & Continue"}
        </Button>
      </Box>
    </Box>
  );
}
