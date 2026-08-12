import { useState, useEffect } from "react";
import {
  getEligibleManagers,
  type EligibleManagerItem,
  type EligibleManagersResponse,
} from "../api/employee.api";

interface UseEligibleManagersProps {
  branchId?: string;
  departmentId?: string;
  designationId?: string;
  minLevel?: number;
  search?: string;
}

interface UseEligibleManagersReturn {
  managers: EligibleManagerItem[];
  defaultManagerId: string | null;
  departmentHead: EligibleManagerItem | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEligibleManagers({
  branchId,
  departmentId,
  designationId,
  minLevel,
  search,
}: UseEligibleManagersProps): UseEligibleManagersReturn {
  const [managers, setManagers] = useState<EligibleManagerItem[]>([]);
  const [defaultManagerId, setDefaultManagerId] = useState<string | null>(null);
  const [departmentHead, setDepartmentHead] = useState<EligibleManagerItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchManagers = async () => {
    // If no criteria provided, return empty list cleanly
    if (!branchId && !departmentId && !designationId) {
      setManagers([]);
      setDefaultManagerId(null);
      setDepartmentHead(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: EligibleManagersResponse = await getEligibleManagers({
        branchId: branchId || undefined,
        departmentId: departmentId || undefined,
        designationId: designationId || undefined,
        minLevel: minLevel || undefined,
        search: search || undefined,
      });

      if (response?.succeeded && response?.data) {
        const mgrList = response.data.managers ?? [];
        setManagers(mgrList);
        setDefaultManagerId(response.data.defaultManagerId ?? null);

        const headItem = mgrList.find((m) => m.isDepartmentHead) ?? null;
        setDepartmentHead(headItem);
      } else {
        setManagers([]);
        setDefaultManagerId(null);
        setDepartmentHead(null);
        if (response?.message) {
          setError(response.message);
        }
      }
    } catch (err: any) {
      console.error("Error fetching eligible managers:", err);
      setError(err?.response?.data?.message || "Failed to load eligible managers.");
      setManagers([]);
      setDefaultManagerId(null);
      setDepartmentHead(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, [branchId, departmentId, designationId, minLevel, search]);

  return {
    managers,
    defaultManagerId,
    departmentHead,
    loading,
    error,
    refetch: fetchManagers,
  };
}
