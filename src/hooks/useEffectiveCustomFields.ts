import { useState, useEffect, useCallback } from "react";
import {
  getEffectiveCustomFields,
  type CustomFieldDefinition,
  type GetEffectiveCustomFieldsParams,
} from "../api/custom-field.api";

interface UseEffectiveCustomFieldsOptions extends GetEffectiveCustomFieldsParams {
  autoFetch?: boolean;
}

export function useEffectiveCustomFields(options: UseEffectiveCustomFieldsOptions = {}) {
  const { branchId, departmentId, forOnboarding, autoFetch = true } = options;

  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEffectiveCustomFields({
        branchId,
        departmentId,
        forOnboarding,
      });
      if (res?.succeeded || (res as any)?.success) {
        const items = Array.isArray(res.data) ? res.data : [];
        items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCustomFields(items);
      } else {
        setError(res?.message || "Failed to fetch effective custom fields");
        setCustomFields([]);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Effective custom fields offline";
      setError(msg);
      setCustomFields([]);
    } finally {
      setLoading(false);
    }
  }, [branchId, departmentId, forOnboarding]);

  useEffect(() => {
    if (autoFetch) {
      fetchFields();
    }
  }, [autoFetch, fetchFields]);

  return {
    customFields,
    loading,
    error,
    refetch: fetchFields,
  };
}

export default useEffectiveCustomFields;
