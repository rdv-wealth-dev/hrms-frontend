import { useMemo } from "react";

type PlacementRecord = {
  _id?: string;
  id?: string;
  name?: string;
  code?: string;
  isActive?: boolean;
};

type UseEmployeeRoleAutoFillOptions = {
  role?: string;
  selectedDepartmentId?: string;
  departments?: PlacementRecord[];
  designations?: PlacementRecord[];
  departmentsLoaded?: boolean;
  designationsLoaded?: boolean;
  loadingDepartments?: boolean;
  loadingDesignations?: boolean;
};

const normalize = (value?: string) => value?.trim().toLowerCase() ?? "";
const resolveId = (record?: PlacementRecord) => record?._id ?? record?.id ?? "";

export function useEmployeeRoleAutoFill({
  role,
  selectedDepartmentId,
  departments = [],
  designations = [],
  departmentsLoaded = false,
  designationsLoaded = false,
  loadingDepartments = false,
  loadingDesignations = false,
}: UseEmployeeRoleAutoFillOptions) {
  const isCeoRole = normalize(role) === "ceo";

  const targetDepartmentId = useMemo(() => {
    if (!isCeoRole) return "";

    const activeDepartments = departments?.filter(
      (department) => department?.isActive !== false
    ) ?? [];
    const administration = activeDepartments.find(
      (department) =>
        normalize(department?.code) === "admin" ||
        normalize(department?.name) === "administration"
    );
    const executive = activeDepartments.find(
      (department) =>
        normalize(department?.code) === "exec" ||
        normalize(department?.name) === "executive"
    );

    return resolveId(administration ?? executive);
  }, [departments, isCeoRole]);

  const targetDesignationId = useMemo(() => {
    if (
      !isCeoRole ||
      !targetDepartmentId ||
      selectedDepartmentId !== targetDepartmentId
    ) {
      return "";
    }

    const designation = designations?.find(
      (item) =>
        item?.isActive !== false &&
        (normalize(item?.code) === "ceo" ||
          normalize(item?.name) === "chief executive officer")
    );

    return resolveId(designation);
  }, [designations, isCeoRole, selectedDepartmentId, targetDepartmentId]);

  const error = useMemo(() => {
    if (!isCeoRole) return null;
    if (departmentsLoaded && !loadingDepartments && !targetDepartmentId) {
      return "CEO placement requires an active Administration or Executive department in the selected branch.";
    }
    if (
      targetDepartmentId &&
      selectedDepartmentId === targetDepartmentId &&
      designationsLoaded &&
      !loadingDesignations &&
      !targetDesignationId
    ) {
      return "Chief Executive Officer designation is not configured in the selected department.";
    }
    return null;
  }, [
    departmentsLoaded,
    designationsLoaded,
    isCeoRole,
    loadingDepartments,
    loadingDesignations,
    selectedDepartmentId,
    targetDepartmentId,
    targetDesignationId,
  ]);

  const resolving =
    isCeoRole &&
    !error &&
    (loadingDepartments ||
      !departmentsLoaded ||
      selectedDepartmentId !== targetDepartmentId ||
      loadingDesignations ||
      !designationsLoaded ||
      !targetDesignationId);

  return {
    isCeoRole,
    targetDepartmentId,
    targetDesignationId,
    resolving,
    error,
  };
}

export default useEmployeeRoleAutoFill;
