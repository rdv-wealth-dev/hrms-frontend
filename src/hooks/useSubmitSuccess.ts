import { useEffect, useRef } from "react";

interface SubmitStatusOptions {
  submitting: boolean;
  success: boolean;
  error: string | null;
  onSuccess: () => void;
}

export function useSubmitSuccess({ submitting, success, error, onSuccess }: SubmitStatusOptions) {
  const isSubmitting = useRef(false);

  useEffect(() => {
    if (submitting) {
      isSubmitting.current = true;
    }

    if (isSubmitting.current && !submitting && !error && success) {
      isSubmitting.current = false;
      onSuccess();
    }
  }, [submitting, success, error, onSuccess]);
}
