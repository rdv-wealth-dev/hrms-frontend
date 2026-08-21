import { useState, useCallback } from "react";
import { getLoggedInEmployeeProfile } from "../api/employee.api";

type ProfileSectionKey = "personalDetails" | "address" | "emergencyContact" | "bankDetails" | "mandatoryDocs";

const SECTION_LABELS: Record<ProfileSectionKey, string> = {
  personalDetails:  "Personal Details",
  address:          "Address",
  emergencyContact: "Emergency Contact",
  bankDetails:      "Bank Account",
  mandatoryDocs:    "Required Documents",
};

interface ProfileBlockState {
  isBlocked: boolean;
  pendingSections: string[];
}

/**
 * Detects when an API call is blocked because the employee's profile is incomplete.
 *
 * Usage:
 *   const { isBlocked, pendingSections, detectBlock, reset } = useProfileBlockDetect();
 *
 *   // In any catch block:
 *   detectBlock(err);
 *
 *   // In JSX:
 *   {isBlocked && <ProfileLockedOverlay pendingSections={pendingSections} />}
 *
 * Reusable for: Attendance, Leave, Payroll, Regularization, Comp-Off, or any
 * future feature blocked by the requireCompleteProfile backend middleware.
 */
export function useProfileBlockDetect() {
  const [state, setState] = useState<ProfileBlockState>({
    isBlocked: false,
    pendingSections: [],
  });

  const detectBlock = useCallback(async (err: any): Promise<boolean> => {
    const isForbidden =
      (typeof err === "string" && err.toLowerCase().includes("complete your profile")) ||
      err?.response?.data?.errorCode === "FORBIDDEN_PERMISSION" ||
      err?.response?.data?.message?.toLowerCase().includes("complete your profile") ||
      err?.message?.toLowerCase().includes("complete your profile");

    if (!isForbidden) return false;

    // Immediately show the lock overlay with a generic list
    setState({
      isBlocked: true,
      pendingSections: Object.values(SECTION_LABELS),
    });

    // Silently fetch the actual profileCompletion flags to refine the list
    try {
      const res = await getLoggedInEmployeeProfile();
      if (res.succeeded && res.data?.profileCompletion) {
        const completion = res.data.profileCompletion;
        const pending = (Object.keys(SECTION_LABELS) as Array<ProfileSectionKey>)
          .filter((key) => !completion[key])
          .map((key) => SECTION_LABELS[key]);

        setState({ isBlocked: true, pendingSections: pending });
      }
    } catch {
      // Keep the generic list already set above — no additional error needed
    }

    return true;
  }, []);

  const reset = useCallback(() => {
    setState({ isBlocked: false, pendingSections: [] });
  }, []);

  return {
    isBlocked: state.isBlocked,
    pendingSections: state.pendingSections,
    detectBlock,
    reset,
  };
}
