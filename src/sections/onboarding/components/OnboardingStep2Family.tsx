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
import Card from "@mui/material/Card";
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

import SkipStepButton from "./SkipStepButton";

const RELATIONSHIPS = ["SPOUSE", "CHILD", "FATHER", "MOTHER", "SIBLING", "OTHER"] as const;

interface OnboardingStep2Props {
  initialValues?: Partial<OnboardingStep2FormData>;
  onSubmitStep: (data: OnboardingStep2FormData) => Promise<void>;
  onBack: () => void;
  onSkipStep?: () => void;
  loading: boolean;
}

const buildStep2Defaults = (initial?: Partial<OnboardingStep2FormData>): OnboardingStep2FormData => ({
  isNotApplicable: !!(initial?.isNotApplicable),
  familyMembers: (initial?.familyMembers || []).map((m) => ({
    ...m,
    dateOfBirth: formatToYYYYMMDD(m.dateOfBirth) || "",
  })),
});

export default function OnboardingStep2Family({
  initialValues,
  onSubmitStep,
  onBack,
  onSkipStep,
  loading,
}: OnboardingStep2Props) {

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
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

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "familyMembers",
  });

  const isNotApplicable = watch("isNotApplicable");

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitStep)}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
              2. Family Members &amp; Dependents
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
              Add your family members, dependents, or nominees. If you do not have any, check <strong>&quot;Not Applicable&quot;</strong> below.
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<AddIcon />}
            disabled={isNotApplicable}
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

        {/* Not Applicable (NA) Checkbox Card Banner */}
        <Card
          variant="outlined"
          sx={{
            p: 1.8,
            mb: 2.5,
            borderRadius: 2.5,
            backgroundColor: isNotApplicable ? "#F5F3FF" : "#F8FAFC",
            borderColor: isNotApplicable ? "#818CF8" : "#E2E8F0",
            transition: "all 0.2s ease",
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={!!isNotApplicable}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setValue("isNotApplicable", checked, { shouldValidate: true });
                  if (checked) {
                    replace([]);
                  }
                }}
                sx={{ color: "#6366F1", "&.Mui-checked": { color: "#6366F1" } }}
              />
            }
            label={
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: isNotApplicable ? "#4338CA" : "#1E293B" }}>
                I do not have family members / dependents to add (Mark as Not Applicable - NA)
              </Typography>
            }
          />
        </Card>

        {/* Validation Error Banner when submitting empty without checking NA */}
        {(errors?.familyMembers?.root?.message || (errors?.familyMembers as any)?.message) && !isNotApplicable && (
          <Box sx={{ p: 1.5, mb: 2, borderRadius: 2, backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5" }}>
            <Typography variant="body2" sx={{ color: "#DC2626", fontWeight: 600 }}>
              ⚠️ {errors?.familyMembers?.root?.message || (errors?.familyMembers as any)?.message}
            </Typography>
          </Box>
        )}

        {isNotApplicable ? (
          <Box sx={{ p: 3, textAlign: "center", backgroundColor: "#F5F3FF", borderRadius: 2, border: "1.5px dashed #A5B4FC", my: 2 }}>
            <Typography variant="body2" sx={{ color: "#4338CA", fontWeight: 600 }}>
              ✓ Family details marked as Not Applicable. Click &quot;Save &amp; Continue&quot; to proceed to Step 3.
            </Typography>
          </Box>
        ) : fields.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center", backgroundColor: "#F8FAFC", borderRadius: 2, border: "1.5px dashed #CBD5E1", my: 2 }}>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              No family members added. If you have dependents or nominees, click <strong>&quot;Add Family Member&quot;</strong> above, or check <strong>&quot;Not Applicable&quot;</strong>.
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
                          <MenuItem key={rel} value={rel}>
                            {rel}
                          </MenuItem>
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
