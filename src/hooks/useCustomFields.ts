import { useState, useEffect, useCallback } from "react";
import {
  getCustomFields,
  type CustomFieldDefinition,
  type FieldScope,
} from "../api/custom-field.api";

interface UseCustomFieldsOptions {
  scope?: FieldScope;
  autoFetch?: boolean;
}

export function useCustomFields(options: UseCustomFieldsOptions = {}) {
  const { scope = "ORGANIZATION", autoFetch = true } = options;

  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomFields = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomFields(scope);
      if (res?.succeeded || (res as any)?.success) {
        const items = Array.isArray(res.data) ? res.data : [];
        items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCustomFields(items);
      } else {
        setError(res?.message || "Failed to fetch custom fields");
      }
    } catch (err: any) {
      // Graceful fallback for 404 or backend endpoints not mounted
      const msg = err?.response?.data?.message || err?.message || "Custom fields offline";
      setError(msg);
      setCustomFields([]);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    if (autoFetch) {
      fetchCustomFields();
    }
  }, [autoFetch, fetchCustomFields]);

  return {
    customFields,
    loading,
    error,
    refetch: fetchCustomFields,
  };
}

export default useCustomFields;
