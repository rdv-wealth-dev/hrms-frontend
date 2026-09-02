import { useState, useEffect } from "react";
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
import Card from "@mui/material/Card";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ContactEmergencyOutlinedIcon from "@mui/icons-material/ContactEmergencyOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

import CircularProgress from "@mui/material/CircularProgress";
import TuneIcon from "@mui/icons-material/Tune";



import DynamicFieldRenderer from "../../../components/input/DynamicFieldRenderer";
import useCustomFields from "../../../hooks/useCustomFields";
import useEducationOptions from "../../../hooks/useEducationOptions";
import type { CustomFieldDefinition } from "../../../api/custom-field.api";


import {
  onboardingStep1Schema,
  type OnboardingStep1FormData,
} from "../../../validations/onboarding/onboarding.schema";
import TextInput from "../../../components/input/TextInput";
import PhoneInput from "../../../components/input/PhoneInput";
import { formatToYYYYMMDD } from "../../../utils/format-date";

const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;
const MARITAL_STATUSES = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"] as const;
const RELIGIONS = [
  "HINDUISM",
  "ISLAM",
  "CHRISTIANITY",
  "SIKHISM",
  "BUDDHISM",
  "JAINISM",
  "ZOROASTRIANISM",
  "JUDAISM",
  "OTHER",
  "PREFER_NOT_TO_SAY",
] as const;

const QUALIFICATION_LEVELS = [
  "DOCTORATE",
  "POST_GRADUATE",
  "UNDER_GRADUATE",
  "DIPLOMA",
  "HIGHER_SECONDARY",
  "SECONDARY",
  "OTHER",
] as const;

import SkipStepButton from "./SkipStepButton";

interface OnboardingStep1Props {
  initialValues?: Partial<OnboardingStep1FormData> & {
    customFields?: Record<string, any>;
  };
  customFieldDefinitions?: CustomFieldDefinition[];
  onSubmitStep: (data: OnboardingStep1FormData & { customFields?: Record<string, any> }) => Promise<void>;
  onSkipStep?: () => void;
  loading: boolean;
}

const buildStep1Defaults = (initial?: Partial<OnboardingStep1FormData>): OnboardingStep1FormData => ({
  dateOfBirth: formatToYYYYMMDD(initial?.dateOfBirth) || "",
  gender: initial?.gender || "",
  bloodGroup: initial?.bloodGroup || "",
  maritalStatus: initial?.maritalStatus || "",
  religion: initial?.religion || "",
  phone: initial?.phone || "",
  fatherName: initial?.fatherName || "",
  fatherPhone: initial?.fatherPhone || "",
  motherName: initial?.motherName || "",
  motherPhone: initial?.motherPhone || "",
  highestQualification: initial?.highestQualification || "",
  educationDetails: initial?.educationDetails?.length
    ? initial.educationDetails.map((ed) => ({
        qualificationLevel: ed?.qualificationLevel || "UNDER_GRADUATE",
        degree: ed?.degree || "",
        fieldOfStudy: ed?.fieldOfStudy || "",
        institutionName: ed?.institutionName || "",
        yearOfPassing: ed?.yearOfPassing ? Number(ed.yearOfPassing) : undefined,
        percentageOrCgpa: ed?.percentageOrCgpa || "",
      }))
    : [
        {
          qualificationLevel: "UNDER_GRADUATE",
          degree: "",
          fieldOfStudy: "",
          institutionName: "",
          yearOfPassing: undefined,
          percentageOrCgpa: "",
        },
      ],
  previousEmployerName: initial?.previousEmployerName || "",
  previousEmployerLastWorkingDate: formatToYYYYMMDD(initial?.previousEmployerLastWorkingDate) || "",
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
    ? initial.emergencyContact.map((ec) => ({
        name: ec?.name || "",
        relationship: ec?.relationship || "",
        phone: ec?.phone || "",
        email: ec?.email || "",
      }))
    : [{ name: "", relationship: "", phone: "", email: "" }],
});

interface EducationRowItemProps {
  idx: number;
  control: any;
  register: any;
  setValue: any;
  watch: any;
  errors: any;
  onRemove: (index: number) => void;
}

function EducationRowItem({
  idx,
  control,
  register,
  setValue,
  watch,
  errors,
  onRemove,
}: EducationRowItemProps) {
  const level = watch(`educationDetails.${idx}.qualificationLevel`);
  const boardCode = watch(`educationDetails.${idx}.boardCode`);
  const isCustom = watch(`educationDetails.${idx}.isCustom`);
  const currentDegree = watch(`educationDetails.${idx}.degree`);
  const countryCode = watch("currentAddress.countryCode") || "IN";


  const { categories, boardOptions, stateBoards, loading } = useEducationOptions(level, countryCode);

  // Local state for Step 1 stream category
  const [selectedStreamCategory, setSelectedStreamCategory] = useState<string>(() => {
    if (!currentDegree || !categories.length) return "";
    const matched = categories.find((cat) => cat.degrees.includes(currentDegree));
    return matched ? matched.category : "";
  });

  // Auto-sync selected stream category if categories load after initial render
  useEffect(() => {
    if (currentDegree && categories.length && !selectedStreamCategory) {
      const matched = categories.find((cat) => cat.degrees.includes(currentDegree));
      if (matched) {
        setSelectedStreamCategory(matched.category);
      }
    }
  }, [currentDegree, categories, selectedStreamCategory]);

  const activeCategoryObj = categories.find((cat) => cat.category === selectedStreamCategory);
  const specializationDegrees = activeCategoryObj?.degrees ?? [];

  const isSchool = level === "SECONDARY" || level === "HIGHER_SECONDARY";

  const handleBoardChange = (selectedCode: string) => {
    setValue(`educationDetails.${idx}.boardCode`, selectedCode, { shouldValidate: true });
    if (!isCustom) {
      const boardObj = boardOptions.find((b) => b.code === selectedCode);
      const levelTitle = level === "SECONDARY" ? "10th Standard (Matriculation)" : "12th Standard";
      const suffix = boardObj ? ` (${boardObj.code})` : "";
      setValue(`educationDetails.${idx}.degree`, `${levelTitle}${suffix}`, { shouldValidate: true });
      setValue(`educationDetails.${idx}.fieldOfStudy`, level === "SECONDARY" ? "General" : "High School", { shouldValidate: true });
    }
  };

  const handleStreamChange = (catName: string) => {
    setSelectedStreamCategory(catName);
    setValue(`educationDetails.${idx}.degree`, "", { shouldValidate: true });
    if (catName) {
      setValue(`educationDetails.${idx}.fieldOfStudy`, catName, { shouldValidate: true });
    }
  };

  const handleDegreeChange = (selectedDegree: string) => {
    if (selectedDegree === "CUSTOM_ENTRY") {
      setValue(`educationDetails.${idx}.isCustom`, true, { shouldValidate: true });
      setValue(`educationDetails.${idx}.degree`, "", { shouldValidate: true });
      return;
    }
    setValue(`educationDetails.${idx}.degree`, selectedDegree, { shouldValidate: true });
  };

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2.5,
        mb: 2,
        backgroundColor: "rgba(248, 250, 252, 0.6)",
        borderColor: "#E2E8F0",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569" }}>
            Qualification #{idx + 1}
          </Typography>
          {loading && <CircularProgress size={16} sx={{ color: "#6366F1" }} />}
        </Box>
        <IconButton onClick={() => onRemove(idx)} size="small" sx={{ color: "#EF4444" }}>
          <DeleteOutlineOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        {/* Qualification Level */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name={`educationDetails.${idx}.qualificationLevel` as const}
            control={control}
            render={({ field: qField }) => (
              <TextInput
                {...qField}
                select
                required
                label="Level"
                error={errors.educationDetails?.[idx]?.qualificationLevel?.message}
                onChange={(e) => {
                  qField.onChange(e);
                  setSelectedStreamCategory("");
                  setValue(`educationDetails.${idx}.degree`, "");
                  setValue(`educationDetails.${idx}.fieldOfStudy`, "");
                  setValue(`educationDetails.${idx}.boardCode`, "");
                  setValue(`educationDetails.${idx}.isCustom`, false);
                }}
              >
                <MenuItem value="">Select Level</MenuItem>
                {QUALIFICATION_LEVELS.map((ql) => (
                  <MenuItem key={ql} value={ql}>
                    {ql.replace(/_/g, " ")}
                  </MenuItem>
                ))}
              </TextInput>
            )}
          />
        </Grid>

        {/* ── SCHOOL LEVEL (10th / 12th) ── */}
        {isSchool ? (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Controller
                name={`educationDetails.${idx}.boardCode` as const}
                control={control}
                render={({ field: bField }) => (
                  <TextInput
                    {...bField}
                    select
                    label="School Board"
                    required={!isCustom}
                    error={errors.educationDetails?.[idx]?.boardCode?.message}
                    onChange={(e) => handleBoardChange(e.target.value)}
                  >
                    <MenuItem value="">Select Board</MenuItem>
                    {boardOptions.map((b) => (
                      <MenuItem key={b.code} value={b.code}>
                        {b.name}
                      </MenuItem>
                    ))}
                  </TextInput>
                )}
              />
            </Grid>

            {boardCode === "STATE_BOARD" && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name={`educationDetails.${idx}.stateBoardState` as const}
                  control={control}
                  render={({ field: sField }) => (
                    <TextInput
                      {...sField}
                      select
                      required
                      label="Select State Board"
                      error={errors.educationDetails?.[idx]?.stateBoardState?.message}
                    >
                      <MenuItem value="">Select State</MenuItem>
                      {stateBoards.map((sb) => (
                        <MenuItem key={sb.boardCode} value={sb.state}>
                          {sb.state} ({sb.boardName})
                        </MenuItem>
                      ))}
                    </TextInput>
                  )}
                />
              </Grid>
            )}

            {boardCode === "OTHER" && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextInput
                  label="Board Name"
                  required
                  placeholder="Enter Board Name"
                  registration={register(`educationDetails.${idx}.otherBoardName` as const)}
                  error={errors.educationDetails?.[idx]?.otherBoardName?.message}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6, md: boardCode === "STATE_BOARD" || boardCode === "OTHER" ? 12 : 4 }}>
              <TextInput
                label="Degree / Certificate Title"
                required
                placeholder={level === "SECONDARY" ? "10th Standard (Matriculation)" : "12th Standard"}
                registration={register(`educationDetails.${idx}.degree` as const)}
                error={errors.educationDetails?.[idx]?.degree?.message}
              />
            </Grid>
          </>
        ) : (
          /* ── HIGHER EDUCATION: 2-STEP CASCADING DROPDOWNS (UG / PG / DIPLOMA / DOCTORATE) ── */
          <>
            {/* STEP 1: Degree Stream / Discipline Dropdown */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextInput
                select
                required={!isCustom}
                label="Degree Type / Stream"
                value={selectedStreamCategory}
                onChange={(e) => handleStreamChange(e.target.value)}
              >
                <MenuItem value="">Select Degree Type...</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.category} value={cat.category}>
                    {cat.category}
                  </MenuItem>
                ))}
              </TextInput>
            </Grid>

            {/* STEP 2: Specialization / Degree Branch Dropdown */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              {!isCustom ? (
                <Controller
                  name={`educationDetails.${idx}.degree` as const}
                  control={control}
                  render={({ field: dField }) => (
                    <TextInput
                      {...dField}
                      select
                      required
                      disabled={!selectedStreamCategory}
                      label="Specialization / Degree"
                      error={errors.educationDetails?.[idx]?.degree?.message}
                      onChange={(e) => handleDegreeChange(e.target.value)}
                    >
                      <MenuItem value="">
                        {selectedStreamCategory ? "Select Specialization..." : "Select Stream First"}
                      </MenuItem>
                      <MenuItem value="CUSTOM_ENTRY" sx={{ color: "#6366F1", fontWeight: 700, borderBottom: "1px solid #E2E8F0" }}>
                        ➕ Enter Custom Degree (Manual Entry)
                      </MenuItem>
                      {specializationDegrees.map((deg) => (
                        <MenuItem key={deg} value={deg}>
                          {deg}
                        </MenuItem>
                      ))}
                    </TextInput>
                  )}
                />
              ) : (
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  <TextInput
                    label="Custom Degree Title"
                    required
                    placeholder="e.g. B.Tech in Quantum Computing"
                    registration={register(`educationDetails.${idx}.degree` as const)}
                    error={errors.educationDetails?.[idx]?.degree?.message}
                  />
                  <Button
                    size="small"
                    onClick={() => {
                      setValue(`educationDetails.${idx}.isCustom`, false);
                      setValue(`educationDetails.${idx}.degree`, "");
                    }}
                    sx={{ mt: 3, textTransform: "none", whiteSpace: "nowrap", color: "#6366F1" }}
                  >
                    Select Catalog
                  </Button>
                </Box>
              )}
            </Grid>
          </>
        )}



        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <TextInput
            label="Institution / University Name"
            required
            placeholder="e.g. Delhi University, IIT Bombay, DPS"
            registration={register(`educationDetails.${idx}.institutionName` as const)}
            error={errors.educationDetails?.[idx]?.institutionName?.message}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextInput
            label="Year of Passing"
            type="tel"
            format="numeric"
            maxLength={4}
            placeholder="e.g. 2022"
            registration={register(`educationDetails.${idx}.yearOfPassing` as const)}
            error={errors.educationDetails?.[idx]?.yearOfPassing?.message}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextInput
            label="% / CGPA"
            placeholder="e.g. 8.7 CGPA"
            registration={register(`educationDetails.${idx}.percentageOrCgpa` as const)}
            error={errors.educationDetails?.[idx]?.percentageOrCgpa?.message}
          />
        </Grid>

      </Grid>
    </Card>
  );
}

export default function OnboardingStep1Personal({
  initialValues,
  customFieldDefinitions: passedDefinitions,
  onSubmitStep,
  onSkipStep,
  loading,
}: OnboardingStep1Props) {
  const { customFields: fetchedDefinitions } = useCustomFields({ scope: "ORGANIZATION", autoFetch: !passedDefinitions });
  const activeDefinitions = passedDefinitions?.length ? passedDefinitions : fetchedDefinitions;

  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>(
    () => initialValues?.customFields || {}
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<OnboardingStep1FormData>({
    resolver: zodResolver(onboardingStep1Schema) as any,
    defaultValues: buildStep1Defaults(initialValues),
  });

  const previousEmployerName = watch("previousEmployerName");

  useEffect(() => {
    if (initialValues) {
      reset(buildStep1Defaults(initialValues));
      if (initialValues.customFields) {
        setCustomFieldValues(initialValues.customFields);
      }
    }
  }, [initialValues, reset]);

  const {
    fields: emergencyFields,
    append: appendEmergency,
    remove: removeEmergency,
  } = useFieldArray({
    control,
    name: "emergencyContact",
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: "educationDetails",
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitStep)}>
      {/* 1. Personal Information */}
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
          <PersonOutlinedIcon sx={{ color: "#6366F1" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
            1. Personal Details
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextInput
              label="Date of Birth"
              type="date"
              required
              registration={register("dateOfBirth")}
              error={errors.dateOfBirth?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="bloodGroup"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  select
                  label="Blood Group"
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

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="religion"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  select
                  label="Religion"
                  error={errors.religion?.message}
                >
                  <MenuItem value="">Select Religion</MenuItem>
                  {RELIGIONS.map((rel) => (
                    <MenuItem key={rel} value={rel}>
                      {rel.replace(/_/g, " ")}
                    </MenuItem>
                  ))}
                </TextInput>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <PhoneInput
              label="Phone Number"
              required
              phoneRegistration={register("phone")}
              countryCodeRegistration={register("currentAddress.countryCode")}
              phoneError={errors.phone?.message}
              countryCodeError={errors.currentAddress?.countryCode?.message}
              setValue={setValue}
              watch={watch}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Parents' Details */}
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
          <FamilyRestroomIcon sx={{ color: "#6366F1" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
            2. Parents' Information
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Father's Full Name"
              registration={register("fatherName")}
              error={errors.fatherName?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Father's Phone Number"
              type="tel"
              format="numeric"
              maxLength={10}
              registration={register("fatherPhone")}
              error={errors.fatherPhone?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Mother's Full Name"
              registration={register("motherName")}
              error={errors.motherName?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Mother's Phone Number"
              type="tel"
              format="numeric"
              maxLength={10}
              registration={register("motherPhone")}
              error={errors.motherPhone?.message}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 3. Higher Education & Qualification History */}
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SchoolOutlinedIcon sx={{ color: "#6366F1" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
              3. Education & Qualifications
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() =>
              appendEducation({
                qualificationLevel: "UNDER_GRADUATE",
                degree: "",
                fieldOfStudy: "",
                institutionName: "",
                yearOfPassing: undefined,
                percentageOrCgpa: "",
              })
            }
            sx={{ textTransform: "none", fontWeight: 600, color: "#6366F1" }}
          >
            Add Qualification
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="highestQualification"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  select
                  required
                  label="Highest Qualification Level"
                  error={errors.highestQualification?.message}
                >
                  <MenuItem value="">Select Level</MenuItem>
                  {QUALIFICATION_LEVELS.map((ql) => (
                    <MenuItem key={ql} value={ql}>
                      {ql.replace(/_/g, " ")}
                    </MenuItem>
                  ))}
                </TextInput>
              )}
            />
          </Grid>
        </Grid>

        {educationFields.map((field, idx) => (
          <EducationRowItem
            key={field.id}
            idx={idx}
            control={control}
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
            onRemove={removeEducation}
          />
        ))}

      </Paper>

      {/* 4. Previous Employment History */}
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
          <BusinessCenterOutlinedIcon sx={{ color: "#6366F1" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
            4. Previous Employment
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Previous Employer / Company Name"
              placeholder="e.g. Infosys Ltd"
              registration={register("previousEmployerName")}
              error={errors.previousEmployerName?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Last Working Date"
              type="date"
              required={!!previousEmployerName}
              registration={register("previousEmployerLastWorkingDate")}
              error={errors.previousEmployerLastWorkingDate?.message}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 5. Statutory Documents & Identity */}
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
          <BadgeOutlinedIcon sx={{ color: "#6366F1" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
            5. Identity & Statutory Details
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextInput
              label="PAN Card Number"
              format="pan"
              maxLength={10}
              placeholder="e.g. ABCDE1234F"
              registration={register("pan")}
              error={errors.pan?.message}
              onChange={(e) => {
                const upper = (e.target.value ?? "").toUpperCase();
                setValue("pan", upper, { shouldValidate: true });
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextInput
              label="Aadhaar Card Number"
              format="aadhaar"
              maxLength={12}
              placeholder="12 numeric digits"
              registration={register("aadhaar")}
              error={errors.aadhaar?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextInput
              label="Passport Number"
              format="uppercase"
              maxLength={15}
              placeholder="e.g. Z1234567"
              registration={register("passportNo")}
              error={errors.passportNo?.message}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 6. Current Address */}
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
          <HomeOutlinedIcon sx={{ color: "#6366F1" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
            6. Current Residential Address
          </Typography>
        </Box>

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
              label="Address Line 2"
              registration={register("currentAddress.addressLine2")}
              error={errors.currentAddress?.addressLine2?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextInput
              label="City"
              required
              registration={register("currentAddress.city")}
              error={errors.currentAddress?.city?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextInput
              label="State"
              required
              registration={register("currentAddress.state")}
              error={errors.currentAddress?.state?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextInput
              label="Zip / Postal Code"
              type="tel"
              format="numeric"
              maxLength={6}
              required
              registration={register("currentAddress.zip")}
              error={errors.currentAddress?.zip?.message}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 7. Emergency Contacts */}
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ContactEmergencyOutlinedIcon sx={{ color: "#6366F1" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
              7. Emergency Contacts
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => appendEmergency({ name: "", relationship: "", phone: "", email: "" })}
            sx={{ textTransform: "none", fontWeight: 600, color: "#6366F1" }}
          >
            Add Contact
          </Button>
        </Box>

        {errors.emergencyContact?.root && (
          <Typography variant="caption" color="error" sx={{ display: "block", mb: 1 }}>
            {errors.emergencyContact.root.message}
          </Typography>
        )}

        {emergencyFields.map((field, idx) => (
          <Box key={field.id} sx={{ mb: idx === emergencyFields.length - 1 ? 0 : 2 }}>
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
                  format="numeric"
                  maxLength={10}
                  required
                  registration={register(`emergencyContact.${idx}.phone` as const)}
                  error={errors.emergencyContact?.[idx]?.phone?.message}
                />
              </Grid>
              <Grid size={{ xs: 10, sm: 2.5 }}>
                <TextInput
                  label="Email Address"
                  type="email"
                  registration={register(`emergencyContact.${idx}.email` as const)}
                  error={errors.emergencyContact?.[idx]?.email?.message}
                />
              </Grid>
              <Grid size={{ xs: 2, sm: 0.5 }} sx={{ display: "flex", justifyContent: "flex-end", pt: 3 }}>
                {emergencyFields.length > 1 && (
                  <IconButton onClick={() => removeEmergency(idx)} size="small" sx={{ color: "#EF4444" }}>
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                )}
              </Grid>
            </Grid>
            {idx < emergencyFields.length - 1 && <Divider sx={{ my: 2 }} />}
          </Box>
        ))}
      </Paper>

      {/* 8. Dynamic Custom Fields Section */}
      {activeDefinitions && activeDefinitions.length > 0 && (
        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
            <TuneIcon sx={{ color: "#6366F1" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
              8. Additional Information
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {activeDefinitions.map((field) => (
              <Grid
                key={field._id}
                size={{
                  xs: 12,
                  sm: field.fieldType === "SELECT" || field.fieldType === "MULTI_SELECT" ? 12 : 6,
                }}
              >
                <DynamicFieldRenderer
                  field={field}
                  value={customFieldValues[field.fieldKey]}
                  onChange={(val) =>
                    setCustomFieldValues((prev: Record<string, any>) => ({
                      ...prev,
                      [field.fieldKey]: val,
                    }))
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Action Row */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2, flexDirection: { xs: "column-reverse", sm: "row" } }}>
        <SkipStepButton onSkip={onSkipStep} loading={loading} />
        <Button
          type="button"
          onClick={handleSubmit((data) =>
            onSubmitStep({
              ...data,
              customFields: customFieldValues,
            })
          )}
          variant="contained"
          disabled={loading}
          endIcon={<ArrowForwardIcon />}
          sx={{
            px: 4,
            py: 1.2,
            borderRadius: "10px",
            background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
            "&:hover": { background: "linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)" },
            fontWeight: 700,
            textTransform: "none",
            fontSize: "15px",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {loading ? "Saving..." : "Save & Continue"}
        </Button>
      </Box>
    </Box>
  );
}
