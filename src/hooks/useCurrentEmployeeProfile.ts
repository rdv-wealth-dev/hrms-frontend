import { useState, useEffect, useCallback } from "react";
import { getLoggedInEmployeeProfile, type CompleteProfileEmployee } from "../api/employee.api";

interface UseCurrentEmployeeProfileOptions {
  enabled?: boolean;
}

let cachedEmployeeProfile: CompleteProfileEmployee | null = null;

/**
 * Reusable hook to fetch and cache the currently logged-in employee profile.
 * Useful for self-service components (like Leave, Attendance, Documents) that need
 * basic employee demographics (gender, marital status, department) without prop drilling.
 */
export function useCurrentEmployeeProfile(options: UseCurrentEmployeeProfileOptions = {}) {
  const { enabled = true } = options;
  const [employee, setEmployee] = useState<CompleteProfileEmployee | null>(cachedEmployeeProfile);
  const [loading, setLoading] = useState<boolean>(!cachedEmployeeProfile && enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLoggedInEmployeeProfile();
      if (res?.succeeded && res?.data) {
        cachedEmployeeProfile = res.data;
        setEmployee(res.data);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to fetch employee profile";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled && !cachedEmployeeProfile) {
      fetchProfile();
    }
  }, [enabled, fetchProfile]);

  return {
    employee,
    gender: employee?.gender,
    maritalStatus: employee?.maritalStatus,
    loading,
    error,
    refetch: fetchProfile,
  };
}
