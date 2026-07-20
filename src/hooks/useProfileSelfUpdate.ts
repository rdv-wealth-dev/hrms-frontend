import { useState, useCallback } from "react";
import {
  updateLoggedInEmployeeProfile,
  type UpdateLoggedInEmployeeRequest,
} from "../api/employee.api";

/**
 * Reusable hook for PATCH /employees/me self-service updates.
 * Used by personal details, emergency contacts, and any future self-update dialogs.
 */
export function useProfileSelfUpdate(onSuccess: () => Promise<void> | void) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (payload: UpdateLoggedInEmployeeRequest) => {
      setSubmitting(true);
      setError(null);
      try {
        const res = await updateLoggedInEmployeeProfile(payload);
        if (res.succeeded) {
          await onSuccess();
        } else {
          setError(res.message || "Update failed");
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message || err?.message || "Something went wrong"
        );
      } finally {
        setSubmitting(false);
      }
    },
    [onSuccess]
  );

  const clearError = useCallback(() => setError(null), []);

  return { submit, submitting, error, clearError };
}
