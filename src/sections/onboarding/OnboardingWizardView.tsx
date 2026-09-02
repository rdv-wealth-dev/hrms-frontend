import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";

import PageWrapper from "../../components/common/PageWrapper";
import { useSnackbar } from "../../components/snackbar";
import { paths } from "../../routes/paths";

import { useSelector } from "react-redux";
import type { RootState } from "../../store/rootReducer";
import { useRole } from "../../auth/hooks/use-role";

import {
  getOnboardingStatus,
  submitOnboardingStep1,
  submitOnboardingStep2,
  submitOnboardingStep3,
  submitOnboardingStep4,
  submitOnboardingStep5,
  skipOnboardingStep,
  navigateOnboardingStep,
} from "../../api/onboarding.api";
import {
  type OnboardingStep1FormData,
  type OnboardingStep2FormData,
  type OnboardingStep3FormData,
} from "../../validations/onboarding/onboarding.schema";

import OnboardingStep1Personal from "./components/OnboardingStep1Personal";
import OnboardingStep2Family from "./components/OnboardingStep2Family";
import OnboardingStep3Bank from "./components/OnboardingStep3Bank";
import OnboardingStep4Documents from "./components/OnboardingStep4Documents";
import OnboardingStep5Review from "./components/OnboardingStep5Review";

const STEPS = [
  "Personal & Address",
  "Family & Dependents",
  "Bank Details",
  "Mandatory Documents",
  "Review & Submit",
];

export default function OnboardingWizardView() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { role } = useRole();

  const user = useSelector((state: RootState) => state.auth?.user);

  const [activeStep, setActiveStep] = useState<number>(0);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [stepError, setStepError] = useState<string | null>(null);

  // Stored step data for prefilling
  const [step1Data, setStep1Data] = useState<Partial<OnboardingStep1FormData>>({});
  const [step2Data, setStep2Data] = useState<Partial<OnboardingStep2FormData>>({});
  const [step3Data, setStep3Data] = useState<Partial<OnboardingStep3FormData>>({});
  const [missingDocs, setMissingDocs] = useState<string[]>([]);
  const [mandatoryDocTypes, setMandatoryDocTypes] = useState<string[]>([]);
  const [step5Data, setStep5Data] = useState<any>(null);

  useEffect(() => {
    if (role === "ORG_ADMIN") {
      navigate(paths.dashboard);
      return;
    }
    const init = async () => {
      setLoadingStatus(true);
      try {
        const res = await getOnboardingStatus();
        if (res.succeeded && res.data) {
          if (res.data.onboardingComplete || res.data.isProfileComplete) {
            showSnackbar("Your onboarding is already complete!", "info");
            navigate(paths.dashboard);
            return;
          }
          const step = res.data.onboardingStep || res.data.currentStep || 1;
          setActiveStep(Math.min(step - 1, 4));
          const step1 = (res.data.step1Data as Partial<OnboardingStep1FormData>) || {};
          if (!step1.phone && user?.phone) {
            step1.phone = user.phone;
          }
          setStep1Data(step1);
          if (res.data.step2Data) setStep2Data(res.data.step2Data as Partial<OnboardingStep2FormData>);
          if (res.data.step3Data) setStep3Data(res.data.step3Data as Partial<OnboardingStep3FormData>);
          if (res.data.missingDocuments) setMissingDocs(res.data.missingDocuments);
          if (res.data.mandatoryDocumentTypes) setMandatoryDocTypes(res.data.mandatoryDocumentTypes);
          if (res.data.step5Data) setStep5Data(res.data.step5Data);
        } else if (res.message) {
          setStepError(res.message);
        }
      } catch (err: any) {
        console.warn("Onboarding status check fallback:", err);
      } finally {
        setLoadingStatus(false);
      }
    };
    init();
  }, [navigate, showSnackbar, user?.phone]);

  const handleNavigateBack = async (targetStepNumber: number) => {
    try {
      const res = await navigateOnboardingStep(targetStepNumber);
      if (res?.succeeded && res?.data?.currentStep) {
        setActiveStep(res.data.currentStep - 1);
      } else {
        setActiveStep(targetStepNumber - 1);
      }
    } catch (err: any) {
      setActiveStep(targetStepNumber - 1);
    }
  };

  const handleSkipStep = async (stepNumber: number) => {
    setSubmitting(true);
    setStepError(null);
    try {
      const res = await skipOnboardingStep(stepNumber);
      if (res?.succeeded) {
        showSnackbar(res?.message || `Step ${stepNumber} skipped`, "info");
        const nextStep = res?.data?.nextStep || Math.min(stepNumber + 1, 4);
        setActiveStep(nextStep - 1);
      } else {
        setStepError(res?.message || "Failed to skip step");
      }
    } catch (err: any) {
      setStepError(err?.response?.data?.message || err?.message || "Failed to skip step");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep1Submit = async (data: OnboardingStep1FormData) => {
    setSubmitting(true);
    setStepError(null);
    try {
      const res = await submitOnboardingStep1(data as any);
      if (res.succeeded) {
        setStep1Data(data);
        setActiveStep(1);
        showSnackbar("Personal information saved successfully", "success");
      } else {
        setStepError(res.message || "Failed to save Step 1");
      }
    } catch (err: any) {
      setStepError(err?.response?.data?.message || err?.message || "Failed to save Step 1");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep2Submit = async (data: OnboardingStep2FormData) => {
    setSubmitting(true);
    setStepError(null);
    try {
      const res = await submitOnboardingStep2(data as any);
      if (res.succeeded) {
        setStep2Data(data);
        setActiveStep(2);
        showSnackbar("Family details saved successfully", "success");
      } else {
        setStepError(res.message || "Failed to save Step 2");
      }
    } catch (err: any) {
      setStepError(err?.response?.data?.message || err?.message || "Failed to save Step 2");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep3Submit = async (data: OnboardingStep3FormData) => {
    setSubmitting(true);
    setStepError(null);
    try {
      const res = await submitOnboardingStep3(data as any);
      if (res.succeeded) {
        setStep3Data(data);
        setActiveStep(3);
        showSnackbar("Bank account details saved successfully", "success");
      } else {
        setStepError(res.message || "Failed to save Step 3");
      }
    } catch (err: any) {
      setStepError(err?.response?.data?.message || err?.message || "Failed to save Step 3");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep4Submit = async () => {
    setSubmitting(true);
    setStepError(null);
    try {
      const res = await submitOnboardingStep4();
      if (res.succeeded) {
        setActiveStep(4);
        showSnackbar("Mandatory documents verified", "success");
      } else {
        setStepError(res.message || "Please upload all required documents before proceeding");
      }
    } catch (err: any) {
      setStepError(err?.response?.data?.message || err?.message || "Please upload all required documents before proceeding");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep5Submit = async (_data: { confirmed: boolean }) => {
    setSubmitting(true);
    setStepError(null);
    try {
      const res = await submitOnboardingStep5({ confirmed: true });
      if (res.succeeded) {
        showSnackbar("Onboarding completed successfully! Welcome to NexusHR.", "success");
        navigate(paths.dashboard);
      } else {
        setStepError(res.message || "Failed to submit final onboarding");
      }
    } catch (err: any) {
      setStepError(err?.response?.data?.message || err?.message || "Failed to submit final onboarding");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStatus) {
    return (
      <>
        <PageWrapper>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
            <CircularProgress size={40} sx={{ color: "#6366F1" }} />
          </Box>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <PageWrapper>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#0F172A" }}>
            Employee Onboarding Wizard
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
            Please complete the 5 onboarding steps below to finalize your employee profile setup.
          </Typography>
        </Box>

        {/* Stepper Header Card */}
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: "1px solid #E2E8F0", mb: 3 }}>
          {/* Mobile Step Indicator */}
          <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#4F46E5" }}>
                Step {activeStep + 1} of {STEPS.length}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#0F172A" }}>
                {STEPS[activeStep]}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={((activeStep + 1) / STEPS.length) * 100}
              sx={{ height: 8, borderRadius: 4, backgroundColor: "#EEF2FF", "& .MuiLinearProgress-bar": { backgroundColor: "#4F46E5" } }}
            />
          </Box>

          {/* Desktop Stepper */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel
                    slotProps={{
                      label: {
                        sx: {
                          fontSize: "12px",
                          fontWeight: 600,
                          "&.Mui-active": { color: "#4F46E5", fontWeight: 700 },
                          "&.Mui-completed": { color: "#059669" },
                        },
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </Paper>

        {/* Step Error Alert */}
        {stepError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {stepError}
          </Alert>
        )}

        {/* Dynamic Step View */}
        {activeStep === 0 && (
          <OnboardingStep1Personal
            initialValues={step1Data}
            onSubmitStep={handleStep1Submit}
            onSkipStep={() => handleSkipStep(1)}
            loading={submitting}
          />
        )}

        {activeStep === 1 && (
          <OnboardingStep2Family
            initialValues={step2Data}
            onSubmitStep={handleStep2Submit}
            onBack={() => handleNavigateBack(1)}
            onSkipStep={() => handleSkipStep(2)}
            loading={submitting}
          />
        )}

        {activeStep === 2 && (
          <OnboardingStep3Bank
            initialValues={step3Data}
            onSubmitStep={handleStep3Submit}
            onBack={() => handleNavigateBack(2)}
            onSkipStep={() => handleSkipStep(3)}
            loading={submitting}
          />
        )}

        {activeStep === 3 && (
          <OnboardingStep4Documents
            mandatoryDocumentTypes={mandatoryDocTypes}
            missingDocuments={missingDocs}
            onSubmitStep={handleStep4Submit}
            onBack={() => handleNavigateBack(3)}
            onSkipStep={() => handleSkipStep(4)}
            loading={submitting}
            errorMsg={stepError}
          />
        )}

        {activeStep === 4 && (
          <OnboardingStep5Review
            step5Data={step5Data}
            onSubmitStep={handleStep5Submit}
            onBack={() => handleNavigateBack(4)}
            onNavigateToStep={(targetStep) => handleNavigateBack(targetStep)}
            loading={submitting}
            errorMsg={stepError}
          />
        )}
      </PageWrapper>
    </>
  );
}
