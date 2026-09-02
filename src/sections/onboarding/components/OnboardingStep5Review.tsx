import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import DescriptionIcon from "@mui/icons-material/Description";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EditIcon from "@mui/icons-material/Edit";

import {
  onboardingStep5Schema,
  type OnboardingStep5FormData,
} from "../../../validations/onboarding/onboarding.schema";

interface MissingStepItem {
  step: number;
  key: string;
  label: string;
}

interface Step5ReviewData {
  canAccessReview?: boolean;
  allStepsCompleted?: boolean;
  missingSteps?: MissingStepItem[];
  review?: {
    personalAndEducation?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      employeeCode?: string;
      joiningDate?: string;
      phone?: string;
      dateOfBirth?: string;
      gender?: string;
      bloodGroup?: string;
      maritalStatus?: string;
      religion?: string;
      nationality?: string;
      fatherName?: string;
      fatherPhone?: string;
      motherName?: string;
      motherPhone?: string;
      pan?: string;
      aadhaar?: string;
      passportNo?: string;
      highestQualification?: string;
      previousEmployerName?: string;
      previousEmployerLastWorkingDate?: string;
      currentAddress?: {
        addressLine1?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
      };
      permanentAddress?: {
        addressLine1?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
      };
      emergencyContact?: Array<{
        name?: string;
        relationship?: string;
        phone?: string;
      }>;
      educationDetails?: Array<{
        degree?: string;
        institutionName?: string;
        yearOfPassing?: number;
        percentageOrCgpa?: string;
      }>;
    };
    family?: {
      isNotApplicable?: boolean;
      familyMembers?: Array<{
        fullName?: string;
        relationship?: string;
        dateOfBirth?: string;
        gender?: string;
        phone?: string;
        occupation?: string;
        isDependent?: boolean;
        isNominee?: boolean;
      }>;
    };
    bank?: {
      bankName?: string;
      accountNumber?: string;
      ifscCode?: string;
      accountType?: string;
    };
    documents?: {
      mandatoryRequired?: string[];
      uploadedCount?: number;
      isComplete?: boolean;
    };
  };
}

interface OnboardingStep5Props {
  step5Data?: Step5ReviewData | null;
  onSubmitStep: (data: OnboardingStep5FormData) => Promise<void>;
  onBack: () => void;
  onNavigateToStep?: (stepNumber: number) => void;
  loading: boolean;
  errorMsg?: string | null;
}

// Helper to mask account number keeping only last 4 digits visible
function maskAccountNumber(accNum?: string): string {
  if (!accNum) return "N/A";
  const clean = accNum.replace(/\s+/g, "");
  if (clean.length <= 4) return clean;
  const maskedLength = clean.length - 4;
  return "•••• ".repeat(Math.ceil(maskedLength / 4)) + clean.slice(-4);
}

// Helper component for rendering clean read-only form panel fields
function ReadOnlyFormField({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, uppercase: true, fontSize: "11px", letterSpacing: "0.5px" }}>
        {label}
      </Typography>
      <Box sx={{ p: 1.2, mt: 0.5, backgroundColor: "#F8FAFC", borderRadius: 2, border: "1px solid #E2E8F0" }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1E293B" }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default function OnboardingStep5Review({
  step5Data,
  onSubmitStep,
  onBack,
  onNavigateToStep,
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

  const missingSteps = step5Data?.missingSteps || [];
  const isAllComplete = step5Data?.allStepsCompleted !== false && missingSteps.length === 0;
  const review = step5Data?.review;

  const personal = review?.personalAndEducation;
  const family = review?.family;
  const bank = review?.bank;
  const docs = review?.documents;

  const currentAddrStr = personal?.currentAddress
    ? [personal.currentAddress.addressLine1, personal.currentAddress.city, personal.currentAddress.state, personal.currentAddress.zipCode, personal.currentAddress.country].filter(Boolean).join(", ")
    : "";

  const permAddrStr = personal?.permanentAddress
    ? [personal.permanentAddress.addressLine1, personal.permanentAddress.city, personal.permanentAddress.state, personal.permanentAddress.zipCode, personal.permanentAddress.country].filter(Boolean).join(", ")
    : "";

  const isPermDifferent = permAddrStr && permAddrStr !== currentAddrStr;

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitStep)}>
      {/* Header Banner */}
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3, textAlign: "center" }}>
        <Box sx={{ display: "inline-flex", p: 2, borderRadius: "50%", backgroundColor: isAllComplete ? "#EEF2FF" : "#FEF3C7", color: isAllComplete ? "#4F46E5" : "#D97706", mb: 2 }}>
          {isAllComplete ? <CheckCircleIcon sx={{ fontSize: 48 }} /> : <WarningAmberIcon sx={{ fontSize: 48 }} />}
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", mb: 1 }}>
          5. Master Profile Review &amp; Confirmation
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 600, mx: "auto" }}>
          {isAllComplete
            ? "Please review all your prefilled onboarding information below before final submission."
            : "Some onboarding steps were skipped. Please review the incomplete sections below and complete them before final submission."}
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mt: 3, borderRadius: 2, textAlign: "left", maxWidth: 600, mx: "auto" }}>
            {errorMsg}
          </Alert>
        )}
      </Paper>

      {/* ⚠️ SKIPPED STEPS WARNING BANNER */}
      {!isAllComplete && missingSteps.length > 0 && (
        <Alert
          severity="warning"
          icon={<WarningAmberIcon fontSize="inherit" />}
          sx={{ mb: 3, borderRadius: 3, "& .MuiAlert-message": { width: "100%" } }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#92400E", mb: 0.5 }}>
            Incomplete Onboarding Steps Require Attention
          </Typography>
          <Typography variant="body2" sx={{ color: "#B45309", mb: 1.5 }}>
            The following steps were skipped during onboarding. Please click to complete them:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {missingSteps.map((m) => (
              <Button
                key={m.step}
                size="small"
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => onNavigateToStep?.(m.step)}
                sx={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#F59E0B",
                  color: "#B45309",
                  fontWeight: 700,
                  borderRadius: "8px",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#FEF3C7", borderColor: "#D97706" },
                }}
              >
                Go to {m.label || `Step ${m.step}`}
              </Button>
            ))}
          </Box>
        </Alert>
      )}

      {/* 📋 READ-ONLY FORM PANELS */}
      {review && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 3 }}>
          {/* SECTION 1 — 👤 Personal, Address & Education */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box sx={{ p: 1, borderRadius: 2, backgroundColor: "#EEF2FF", color: "#6366F1" }}>
                <PersonIcon fontSize="small" />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0F172A" }}>
                Section 1: Personal, Address &amp; Education Details
              </Typography>
            </Box>
            <Divider sx={{ mb: 2.5 }} />

            {personal ? (
              <>
                {/* Identity & Basic Details */}
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#4F46E5", uppercase: true, letterSpacing: "0.5px", display: "block", mb: 1.5 }}>
                  Identity &amp; Basic Information
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}><ReadOnlyFormField label="First Name" value={personal.firstName} /></Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}><ReadOnlyFormField label="Last Name" value={personal.lastName} /></Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}><ReadOnlyFormField label="Email Address" value={personal.email} /></Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}><ReadOnlyFormField label="Employee Code" value={personal.employeeCode} /></Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}><ReadOnlyFormField label="Joining Date" value={personal.joiningDate ? new Date(personal.joiningDate).toLocaleDateString() : null} /></Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}><ReadOnlyFormField label="Phone Number" value={personal.phone} /></Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}><ReadOnlyFormField label="Date of Birth" value={personal.dateOfBirth ? new Date(personal.dateOfBirth).toLocaleDateString() : null} /></Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}><ReadOnlyFormField label="Gender" value={personal.gender} /></Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}><ReadOnlyFormField label="Blood Group" value={personal.bloodGroup} /></Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}><ReadOnlyFormField label="Marital Status" value={personal.maritalStatus} /></Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}><ReadOnlyFormField label="Religion" value={personal.religion} /></Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}><ReadOnlyFormField label="Nationality" value={personal.nationality} /></Grid>
                </Grid>

                {/* Parents' Details */}
                {(personal.fatherName || personal.motherName) && (
                  <>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "#4F46E5", uppercase: true, letterSpacing: "0.5px", display: "block", mb: 1.5 }}>
                      Parents' Details
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 12, sm: 6 }}><ReadOnlyFormField label="Father's Name" value={personal.fatherName} /></Grid>
                      <Grid size={{ xs: 12, sm: 6 }}><ReadOnlyFormField label="Father's Phone" value={personal.fatherPhone} /></Grid>
                      <Grid size={{ xs: 12, sm: 6 }}><ReadOnlyFormField label="Mother's Name" value={personal.motherName} /></Grid>
                      <Grid size={{ xs: 12, sm: 6 }}><ReadOnlyFormField label="Mother's Phone" value={personal.motherPhone} /></Grid>
                    </Grid>
                  </>
                )}

                {/* Address Information */}
                {currentAddrStr && (
                  <>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "#4F46E5", uppercase: true, letterSpacing: "0.5px", display: "block", mb: 1.5 }}>
                      Address Information
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 12 }}><ReadOnlyFormField label="Current Address" value={currentAddrStr} /></Grid>
                      {isPermDifferent && (
                        <Grid size={{ xs: 12 }}><ReadOnlyFormField label="Permanent Address" value={permAddrStr} /></Grid>
                      )}
                    </Grid>
                  </>
                )}

                {/* Emergency Contacts */}
                {personal.emergencyContact && personal.emergencyContact.length > 0 && (
                  <>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "#4F46E5", uppercase: true, letterSpacing: "0.5px", display: "block", mb: 1.5 }}>
                      Emergency Contacts
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {personal.emergencyContact.map((em, i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6 }}>
                          <ReadOnlyFormField label={`Emergency Contact #${i + 1}`} value={`${em.name || "N/A"} (${em.relationship || "N/A"}) — ${em.phone || "N/A"}`} />
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}

                {/* Identity Document Numbers */}
                {(personal.pan || personal.aadhaar || personal.passportNo) && (
                  <>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "#4F46E5", uppercase: true, letterSpacing: "0.5px", display: "block", mb: 1.5 }}>
                      Identity Document Numbers
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 12, sm: 4 }}><ReadOnlyFormField label="PAN Number" value={personal.pan} /></Grid>
                      <Grid size={{ xs: 12, sm: 4 }}><ReadOnlyFormField label="Aadhaar Number" value={personal.aadhaar} /></Grid>
                      <Grid size={{ xs: 12, sm: 4 }}><ReadOnlyFormField label="Passport Number" value={personal.passportNo} /></Grid>
                    </Grid>
                  </>
                )}

                {/* Education & Qualifications */}
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#4F46E5", uppercase: true, letterSpacing: "0.5px", display: "block", mb: 1.5 }}>
                  Education &amp; Qualifications
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 6 }}><ReadOnlyFormField label="Highest Qualification" value={personal.highestQualification} /></Grid>
                  {personal.previousEmployerName && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <ReadOnlyFormField
                        label="Previous Employer"
                        value={`${personal.previousEmployerName}${personal.previousEmployerLastWorkingDate ? ` (Last Working Date: ${new Date(personal.previousEmployerLastWorkingDate).toLocaleDateString()})` : ""}`}
                      />
                    </Grid>
                  )}
                </Grid>

                {personal.educationDetails && personal.educationDetails.length > 0 && (
                  <Box sx={{ p: 2, backgroundColor: "#F8FAFC", borderRadius: 2.5, border: "1px solid #E2E8F0" }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748B", uppercase: true, display: "block", mb: 1 }}>
                      Detailed Education Entries:
                    </Typography>
                    {personal.educationDetails.map((edu, i) => (
                      <Box key={i} sx={{ py: 0.8, borderBottom: i < personal.educationDetails!.length - 1 ? "1px dashed #CBD5E1" : "none" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1E293B" }}>
                          • {edu.degree} — <strong>{edu.institutionName}</strong> ({edu.yearOfPassing || "N/A"}) [{edu.percentageOrCgpa || "N/A"}]
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">No personal details found.</Typography>
            )}
          </Paper>

          {/* SECTION 2 — 👨‍👩‍👧 Family & Dependents */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box sx={{ p: 1, borderRadius: 2, backgroundColor: "#F0FDF4", color: "#16A34A" }}>
                <FamilyRestroomIcon fontSize="small" />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0F172A" }}>
                Section 2: Family Details &amp; Dependents
              </Typography>
            </Box>
            <Divider sx={{ mb: 2.5 }} />

            {family?.isNotApplicable ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Family details were explicitly marked as <strong>Not Applicable (NA)</strong> during step 2.
              </Alert>
            ) : family?.familyMembers && family.familyMembers.length > 0 ? (
              <Grid container spacing={2}>
                {family.familyMembers.map((fam, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, backgroundColor: "#F8FAFC" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                          {fam.fullName}
                        </Typography>
                        <Chip label={fam.relationship} size="small" sx={{ backgroundColor: "#DCFCE7", color: "#15803D", fontWeight: 700, fontSize: "11px" }} />
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        {fam.phone && <Typography variant="caption" color="text.secondary">Phone: <strong>{fam.phone}</strong></Typography>}
                        {fam.dateOfBirth && <Typography variant="caption" color="text.secondary">DOB: <strong>{new Date(fam.dateOfBirth).toLocaleDateString()}</strong></Typography>}
                        {fam.gender && <Typography variant="caption" color="text.secondary">Gender: <strong>{fam.gender}</strong></Typography>}
                        {fam.occupation && <Typography variant="caption" color="text.secondary">Occupation: <strong>{fam.occupation}</strong></Typography>}
                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                          {fam.isDependent && <Chip label="Dependent" size="small" color="primary" variant="outlined" sx={{ fontSize: "10px", height: "20px" }} />}
                          {fam.isNominee && <Chip label="Nominee" size="small" color="secondary" variant="outlined" sx={{ fontSize: "10px", height: "20px" }} />}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">No family details submitted.</Typography>
            )}
          </Paper>

          {/* SECTION 3 — 🏦 Bank Account Information */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box sx={{ p: 1, borderRadius: 2, backgroundColor: "#FFF7ED", color: "#EA580C" }}>
                <AccountBalanceIcon fontSize="small" />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0F172A" }}>
                Section 3: Bank Account Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 2.5 }} />

            {bank?.bankName ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><ReadOnlyFormField label="Bank Name" value={bank.bankName} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><ReadOnlyFormField label="Account Number" value={maskAccountNumber(bank.accountNumber)} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><ReadOnlyFormField label="IFSC Code" value={bank.ifscCode} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><ReadOnlyFormField label="Account Type" value={bank.accountType || "SALARY"} /></Grid>
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">No bank details submitted.</Typography>
            )}
          </Paper>

          {/* SECTION 4 — 📄 Mandatory Documents Verification */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box sx={{ p: 1, borderRadius: 2, backgroundColor: "#FAF5FF", color: "#9333EA" }}>
                <DescriptionIcon fontSize="small" />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0F172A" }}>
                Section 4: Mandatory Documents Status
              </Typography>
            </Box>
            <Divider sx={{ mb: 2.5 }} />

            {docs ? (
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ReadOnlyFormField label="Uploaded Files Count" value={`${docs.uploadedCount ?? 0} files uploaded`} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, uppercase: true, fontSize: "11px", letterSpacing: "0.5px" }}>
                      Mandatory Required Documents
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.8 }}>
                      {docs.mandatoryRequired && docs.mandatoryRequired.length > 0 ? (
                        docs.mandatoryRequired.map((docType) => (
                          <Chip key={docType} label={docType} size="small" variant="outlined" sx={{ fontWeight: 700, borderColor: "#9333EA", color: "#9333EA" }} />
                        ))
                      ) : (
                        <Chip label="All Standard KYC Docs" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">No document verification metadata found.</Typography>
            )}
          </Paper>
        </Box>
      )}

      {/* SECTION 5 — ✍️ Declaration & Confirmation */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
        <Box sx={{ maxWidth: 650, mx: "auto", p: 2.5, backgroundColor: "#F8FAFC", borderRadius: 2.5, border: "1px dashed #CBD5E1" }}>
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
          disabled={loading || !isAllComplete}
          sx={{
            px: 5,
            py: 1.3,
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.95rem",
            backgroundColor: isAllComplete ? "#059669" : "#94A3B8",
            "&:hover": { backgroundColor: isAllComplete ? "#047857" : "#94A3B8" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {loading ? "Submitting..." : "Complete & Finish Onboarding"}
        </Button>
      </Box>
    </Box>
  );
}
