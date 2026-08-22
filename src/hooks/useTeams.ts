import { useState, useEffect, useCallback } from "react";
import { listTeams, type TeamItem } from "../api/team.api";

interface UseTeamsProps {
  departmentId?: string;
  branchId?: string;
  autoFetch?: boolean;
}

interface UseTeamsReturn {
  teams: TeamItem[];
  teamOptions: { value: string; label: string }[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTeams({
  departmentId,
  branchId,
  autoFetch = true,
}: UseTeamsProps = {}): UseTeamsReturn {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listTeams({ departmentId, branchId });
      let items: TeamItem[] = [];

      if (Array.isArray(res?.data)) {
        items = res.data;
      } else if (Array.isArray((res?.data as any)?.items)) {
        items = (res.data as any).items;
      } else if (Array.isArray(res as any)) {
        items = res as any;
      }

      setTeams(items);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load teams.";
      setError(msg);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [departmentId, branchId]);

  useEffect(() => {
    if (autoFetch) {
      fetchTeams();
    }
  }, [fetchTeams, autoFetch]);

  const teamOptions = teams.map((t) => ({
    value: t.id || t._id || t.code || t.name,
    label: t.name,
  }));

  return {
    teams,
    teamOptions,
    loading,
    error,
    refetch: fetchTeams,
  };
}

export default useTeams;
