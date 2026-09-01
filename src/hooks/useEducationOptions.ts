import { useState, useEffect } from "react";
import { getEducationOptions, type EducationOptionsResponse } from "../api/onboarding.api";

const cacheMap = new Map<string, EducationOptionsResponse["data"]>();

export function useEducationOptions(
  qualificationLevel?: string,
  countryCode: string = "IN",
  searchQuery?: string
) {
  const [options, setOptions] = useState<EducationOptionsResponse["data"] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const activeSearch = searchQuery && searchQuery.trim().length >= 2 ? searchQuery.trim() : "";
    const cacheKey = `${qualificationLevel || "ALL"}_${countryCode}_${activeSearch}`;

    if (cacheMap.has(cacheKey)) {
      setOptions(cacheMap.get(cacheKey) || null);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);

      getEducationOptions(qualificationLevel, countryCode, activeSearch)
        .then((res) => {
          if (!isMounted) return;
          if (res?.succeeded && res?.data) {
            cacheMap.set(cacheKey, res.data);
            setOptions(res.data);
          } else {
            setError(res?.message || "Failed to load options");
          }
        })
        .catch((err) => {
          if (isMounted) setError(err?.message || "Error fetching options");
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }, activeSearch ? 300 : 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [qualificationLevel, countryCode, searchQuery]);

  return {
    categories: options?.categories ?? [],
    allDegrees: options?.allDegrees ?? [],
    boardOptions: options?.boardOptions ?? [],
    stateBoards: options?.stateBoards ?? [],
    searchQuery: options?.searchQuery,
    totalMatches: options?.totalMatches,
    loading,
    error,
  };
}

export default useEducationOptions;
