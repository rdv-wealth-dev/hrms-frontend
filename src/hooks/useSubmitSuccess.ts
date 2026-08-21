import { useEffect, useRef } from "react";

interface SubmitStatusOptions {
  submitting: boolean;
  success: boolean;
  error: string | null;
  onSuccess: () => void;
}

export function useSubmitSuccess({ submitting, success, error, onSuccess }: SubmitStatusOptions) {
  const prevSubmitting = useRef(false);

  useEffect(() => {
    // Detect transition from submitting (true) to not submitting (false)
    // AND ensure it was successful (success=true, error=null)
    if (prevSubmitting.current && !submitting && success && !error) {
      onSuccess();
    }
    
    // Update the previous state
    prevSubmitting.current = submitting;
  }, [submitting, success, error, onSuccess]);
}
