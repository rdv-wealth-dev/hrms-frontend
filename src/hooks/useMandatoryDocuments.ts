import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store/store";
import type { RootState } from "../store/rootReducer";
import { loadOrganizationRequest } from "../store/organization";
import { getDocumentDefinition, type DocumentDefinition } from "../utils/doc-helpers";
import { resolveLoadedArray } from "../utils/resolve-loaded-array";

const DEFAULT_MANDATORY_DOCUMENTS = ["PAN", "AADHAAR"] as const;

export function useMandatoryDocuments(): {
  docTypes: string[] | null;
  mandatoryDefinitions: DocumentDefinition[];
  isMandatory: (code: string) => boolean;
  isLoading: boolean;
} {
  const dispatch = useDispatch<AppDispatch>();
  const organization = useSelector((state: RootState) => state.organization?.organization);
  const loading = useSelector((state: RootState) => state.organization?.loading ?? false);
  const error = useSelector((state: RootState) => state.organization?.error);

  const [docTypes, setDocTypes] = useState<string[] | null>(null);

  useEffect(() => {
    // Only fetch settings if not already loaded, not currently loading, and no previous error (e.g. 403 Forbidden for employees)
    if (!organization && !loading && !error) {
      dispatch(loadOrganizationRequest());
    }
  }, [dispatch, organization, loading, error]);

  useEffect(() => {
    // If there is a fetch error (e.g. 403 Forbidden for non-admin employees):
    if (error && !organization) {
      setDocTypes([...DEFAULT_MANDATORY_DOCUMENTS]);
      return;
    }

    const isUnloaded = loading || !organization;
    const resolved = resolveLoadedArray(
      isUnloaded,
      organization?.mandatoryDocumentTypes,
      [...DEFAULT_MANDATORY_DOCUMENTS]
    );
    setDocTypes(resolved);
  }, [organization, loading, error]);

  const isMandatory = useCallback(
    (code: string) => {
      if (!code || !docTypes) return false;
      return docTypes.some((t) => t.toUpperCase() === code.toUpperCase());
    },
    [docTypes]
  );

  const mandatoryDefinitions: DocumentDefinition[] = (docTypes || []).map((code) =>
    getDocumentDefinition(code)
  );

  return {
    docTypes: docTypes ?? [...DEFAULT_MANDATORY_DOCUMENTS],
    mandatoryDefinitions,
    isMandatory,
    isLoading: loading && !error && !organization,
  };
}

export default useMandatoryDocuments;
