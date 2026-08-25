import { useState, useCallback, useMemo } from "react";
import { type ZodSchema, ZodError } from "zod";
import { toast } from "sonner";

export interface ValidateOptions<T> {
  tabMapping?: Record<number, (keyof T | string)[]>;
  onTabChange?: (tabIndex: number) => void;
  toastMessage?: string;
  showToast?: boolean;
}

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: Record<string, string>;
}

export function useFormValidation<T extends Record<string, any>>(schema?: ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Set a specific field error manually (e.g. from backend API response)
   */
  const setError = useCallback((field: keyof T | string, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [String(field)]: message,
    }));
  }, []);

  /**
   * Clear a specific field error on change/blur
   */
  const clearError = useCallback((field: keyof T | string) => {
    setErrors((prev) => {
      if (!prev[String(field)]) return prev;
      const next = { ...prev };
      delete next[String(field)];
      return next;
    });
  }, []);

  /**
   * Clear multiple field errors at once
   */
  const clearErrors = useCallback((fields: (keyof T | string)[]) => {
    setErrors((prev) => {
      let changed = false;
      const next = { ...prev };
      fields.forEach((f) => {
        if (next[String(f)]) {
          delete next[String(f)];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, []);

  /**
   * Clear all active errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Run validation against data using the Zod schema
   */
  const validate = useCallback(
    (data: unknown, options?: ValidateOptions<T>): ValidationResult<T> => {
      if (!schema) {
        return { isValid: true, data: data as T, errors: {} };
      }

      const result = schema.safeParse(data);

      if (result.success) {
        setErrors({});
        return { isValid: true, data: result.data, errors: {} };
      }

      // Format Zod issues into a key-value error dictionary
      const formattedErrors: Record<string, string> = {};
      if (result.error instanceof ZodError) {
        for (const issue of result.error.issues) {
          // Flatten path e.g. ["address", "zip"] -> "address.zip" or root "firstName"
          const key = issue.path.join(".") || "root";
          // Only keep the first error encountered for each field
          if (!formattedErrors[key]) {
            formattedErrors[key] = issue.message;
          }
        }
      }

      setErrors(formattedErrors);

      const showToast = options?.showToast ?? true;
      if (showToast) {
        const msg = options?.toastMessage || "Please fix the highlighted errors before saving.";
        toast.error(msg);
      }

      // Multi-tab automatic redirection to first error
      if (options?.tabMapping && options?.onTabChange) {
        const errorKeys = Object.keys(formattedErrors);
        const tabIndices = Object.keys(options.tabMapping)
          .map(Number)
          .sort((a, b) => a - b);

        for (const tabIndex of tabIndices) {
          const tabFields = options.tabMapping[tabIndex] || [];
          const hasErrorInTab = tabFields.some((field) => {
            const fieldStr = String(field);
            return errorKeys.some((k) => k === fieldStr || k.startsWith(`${fieldStr}.`));
          });

          if (hasErrorInTab) {
            options.onTabChange(tabIndex);
            break;
          }
        }
      }

      return { isValid: false, errors: formattedErrors };
    },
    [schema]
  );

  /**
   * Count errors belonging to a specific tab
   */
  const getTabErrorCount = useCallback(
    (tabFields: (keyof T | string)[]): number => {
      const errorKeys = Object.keys(errors);
      let count = 0;
      tabFields.forEach((field) => {
        const fieldStr = String(field);
        if (errorKeys.some((k) => k === fieldStr || k.startsWith(`${fieldStr}.`))) {
          count += 1;
        }
      });
      return count;
    },
    [errors]
  );

  /**
   * Check if a specific tab has any errors
   */
  const hasTabErrors = useCallback(
    (tabFields: (keyof T | string)[]): boolean => {
      return getTabErrorCount(tabFields) > 0;
    },
    [getTabErrorCount]
  );

  const hasAnyErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  return {
    errors,
    setErrors,
    setError,
    clearError,
    clearErrors,
    clearAllErrors,
    validate,
    getTabErrorCount,
    hasTabErrors,
    hasAnyErrors,
  };
}

export default useFormValidation;
