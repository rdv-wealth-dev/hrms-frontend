import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Skeleton from "@mui/material/Skeleton";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import CloseIcon from "@mui/icons-material/Close";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

import TextInput from "../../../components/input/TextInput";
import PhoneInput from "../../../components/input/PhoneInput";
import CascadingSelect, { type SelectOption } from "../../../components/input/CascadingSelect";
import CustomAvatar from "../../../components/avatar/CustomAvatar";
import { StatusChip } from "../../../components/common/StatusChip";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import type { EmployeeListItem } from "../../../store/employee/employee.types";
import {
  getEmployeeByIdRequest,
  clearSelectedEmployee,
  updateEmployeeRequest,
  clearEmployeeError,
} from "../../../store/employee";

import { listDepartments } from "../../../api/department.api";
import { listDesignations } from "../../../api/designation.api";
import { listRoles, type RoleItem } from "../../../api/role.api";
import { listTeams } from "../../../api/team.api";
import { listBranchesRequest } from "../../../store/branch";
import { useEligibleManagers } from "../../../hooks/useEligibleManagers";
import { useFormValidation } from "../../../hooks/useFormValidation";
import {
  updateEmployeeSchema,
  type UpdateEmployeeFormData,
} from "../../../validations/employee/update-employee.schema";

type Props = {
  open: boolean;
  employee: EmployeeListItem | null;
  onClose: () => void;
};

const DEFAULT_FALLBACK_ROLES: RoleItem[] = [
  { _id: "1", name: "Employee", slug: "EMPLOYEE", description: "Self-service access" },
  { _id: "2", name: "Manager", slug: "MANAGER", description: "Team attendance & approvals" },
  { _id: "3", name: "Team Leader", slug: "TEAM_LEADER", description: "Squad lead & member view" },
  { _id: "4", name: "HR Admin", slug: "HR_ADMIN", description: "Full operational HR access" },
  { _id: "5", name: "Branch Admin", slug: "BRANCH_ADMIN", description: "Branch operational access" },
  { _id: "6", name: "Org Admin", slug: "ORG_ADMIN", description: "Full organizational access" },
];

const EMPLOYEE_TYPES = [
  { value: "FULL_TIME", label: "Full-Time" },
  { value: "PART_TIME", label: "Part-Time" },
  { value: "CONTRACT", label: "Contractor" },
  { value: "INTERN", label: "Intern" },
  { value: "CONSULTANT", label: "Consultant" },
];

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const MARITAL_STATUS_OPTIONS = [
  { value: "SINGLE", label: "Single" },
  { value: "MARRIED", label: "Married" },
  { value: "DIVORCED", label: "Divorced" },
  { value: "WIDOWED", label: "Widowed" },
];

const TAB_FIELDS: Record<number, (keyof UpdateEmployeeFormData)[]> = {
  0: ["branchId", "departmentId", "designationId", "role", "employeeType"],
  1: ["firstName", "lastName", "phone", "pan", "aadhaar"],
  2: ["joiningDate", "confirmationDate", "probationEndDate"],
  3: ["currAddress1", "currCity", "currState", "currZip"],
};

// Helper: Safely resolve ObjectId string from either a string or populated object
const resolveId = (val: unknown): string => {
  if (!val) return "";
  if (typeof val === "object" && val !== null) {
    return (val as any)._id || (val as any).id || "";
  }
  return typeof val === "string" ? val : "";
};

// Helper: Safely resolve array of ObjectId strings from array of objects or strings
const resolveIds = (val: unknown): string[] => {
  if (!val || !Array.isArray(val)) return [];
  return val.map((item) => resolveId(item)).filter(Boolean);
};

// Helper: Format ISO date to YYYY-MM-DD for date inputs
const formatDateInput = (dateVal?: string | Date | null): string => {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    return !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "";
  } catch {
    return "";
  }
};

function EmployeeEditDialog({ open, employee, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const {
    submitting,
    error,
    selectedEmployee,
    loadingDetail,
    detailError,
  } = useSelector((state: RootState) => state.employee);

  const branches = useSelector(
    (state: RootState) => state.branch?.branches ?? []
  );

  const [activeTab, setActiveTab] = useState<number>(0);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // Global Form Validation Hook
  const {
    errors,
    validate,
    clearError,
    getTabErrorCount,
    clearAllErrors,
  } = useFormValidation<UpdateEmployeeFormData>(updateEmployeeSchema);

  // Form State: 1. Organization & Placement
  const [branchId, setBranchId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [designationId, setDesignationId] = useState<string>("");
  const [teamId, setTeamId] = useState<string>("");
  const [managerId, setManagerId] = useState<string>("");
  const [secondaryManagerIds, setSecondaryManagerIds] = useState<string[]>([]);
  const [role, setRole] = useState<string>("EMPLOYEE");
  const [employeeType, setEmployeeType] = useState<string>("FULL_TIME");

  // Form State: 2. Personal & Contact Info
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("IN");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [bloodGroup, setBloodGroup] = useState<string>("");
  const [maritalStatus, setMaritalStatus] = useState<string>("SINGLE");
  const [nationality, setNationality] = useState<string>("Indian");
  const [pan, setPan] = useState<string>("");
  const [aadhaar, setAadhaar] = useState<string>("");
  const [passportNo, setPassportNo] = useState<string>("");
  const [drivingLicense, setDrivingLicense] = useState<string>("");
  const [voterId, setVoterId] = useState<string>("");

  // Form State: 3. Employment Schedule & Dates
  const [joiningDate, setJoiningDate] = useState<string>("");
  const [confirmationDate, setConfirmationDate] = useState<string>("");
  const [probationEndDate, setProbationEndDate] = useState<string>("");
  const [pfOnActuals, setPfOnActuals] = useState<boolean>(false);

  // Form State: 4. Address Details
  const [currAddress1, setCurrAddress1] = useState<string>("");
  const [currAddress2, setCurrAddress2] = useState<string>("");
  const [currCity, setCurrCity] = useState<string>("");
  const [currState, setCurrState] = useState<string>("");
  const [currZip, setCurrZip] = useState<string>("");
  const [currCountry, setCurrCountry] = useState<string>("IN");

  const [sameAsCurrent, setSameAsCurrent] = useState<boolean>(false);
  const [permAddress1, setPermAddress1] = useState<string>("");
  const [permAddress2, setPermAddress2] = useState<string>("");
  const [permCity, setPermCity] = useState<string>("");
  const [permState, setPermState] = useState<string>("");
  const [permZip, setPermZip] = useState<string>("");
  const [permCountry, setPermCountry] = useState<string>("IN");

  // Cascading Dynamic Options
  const [departments, setDepartments] = useState<Array<{ _id: string; name: string; code: string }>>([]);
  const [loadingDepartments, setLoadingDepartments] = useState<boolean>(false);

  const [designations, setDesignations] = useState<Array<{ _id: string; name: string; code: string }>>([]);
  const [loadingDesignations, setLoadingDesignations] = useState<boolean>(false);

  const [teams, setTeams] = useState<Array<{ _id: string; name: string; code: string }>>([]);
  const [loadingTeams, setLoadingTeams] = useState<boolean>(false);

  const [rolesList, setRolesList] = useState<RoleItem[]>(DEFAULT_FALLBACK_ROLES);

  // Fetch initial master branches & roles
  useEffect(() => {
    if (open) {
      if (branches.length === 0) {
        dispatch(listBranchesRequest());
      }
      listRoles()
        .then((res) => {
          if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
            setRolesList(res.data);
          }
        })
        .catch(() => {});

      setLoadingTeams(true);
      listTeams()
        .then((res) => {
          const list = Array.isArray(res?.data) ? res.data : (res?.data as any)?.items || [];
          setTeams(list);
        })
        .catch(() => {})
        .finally(() => setLoadingTeams(false));
    }
  }, [open, branches.length, dispatch]);

  // Hook: Fetch eligible managers dynamically based on selected Branch + Department + Designation
  const {
    managers: eligibleManagers,
    loading: loadingManagers,
  } = useEligibleManagers({
    branchId: branchId || undefined,
    departmentId: departmentId || undefined,
    designationId: designationId || undefined,
  });

  // 1. Fetch fresh, populated employee data when dialog opens
  useEffect(() => {
    if (open && employee?._id) {
      dispatch(clearEmployeeError());
      dispatch(getEmployeeByIdRequest(employee._id));
      setActiveTab(0);
      setHasSubmitted(false);
      clearAllErrors();
    }
    return () => {
      if (!open) {
        dispatch(clearSelectedEmployee());
      }
    };
  }, [open, employee?._id, dispatch, clearAllErrors]);

  // 2. Populate form fields safely whenever fresh server data arrives
  useEffect(() => {
    const data = selectedEmployee || employee;
    if (data) {
      // Identity & Basic Info
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setPhone(data.phone || "");
      setCountryCode(data.countryCode || "IN");
      setDateOfBirth(formatDateInput(data.dateOfBirth));
      setGender(data.gender || "");
      setBloodGroup(data.bloodGroup || "");
      setMaritalStatus(data.maritalStatus || "SINGLE");
      setNationality(data.nationality || "Indian");
      setPan(data.pan || "");
      setAadhaar(data.aadhaar || "");
      setPassportNo((data as any).passportNo || "");
      setDrivingLicense((data as any).drivingLicense || "");
      setVoterId((data as any).voterId || "");
      setPfOnActuals(Boolean((data as any).pfOnActuals));

      // Organization Placement
      const resolvedBranch = resolveId(data.branchId);
      const resolvedDept = resolveId(data.departmentId);
      const resolvedDesig = resolveId(data.designationId);
      const resolvedTeam = resolveId((data as any).teamId);
      const resolvedMgr = resolveId(data.managerId);
      const resolvedSecondary = resolveIds((data as any).secondaryManagerIds);

      setBranchId(resolvedBranch);
      setDepartmentId(resolvedDept);
      setDesignationId(resolvedDesig);
      setTeamId(resolvedTeam);
      setManagerId(resolvedMgr);
      setSecondaryManagerIds(resolvedSecondary);
      setRole((data as any).role || "EMPLOYEE");
      setEmployeeType(data.employeeType || "FULL_TIME");

      // Dates
      setJoiningDate(formatDateInput(data.joiningDate));
      setConfirmationDate(formatDateInput(data.confirmationDate));
      setProbationEndDate(formatDateInput((data as any).probationEndDate));

      // Current Address
      const curr = data.currentAddress || {};
      setCurrAddress1(curr.addressLine1 || "");
      setCurrAddress2(curr.addressLine2 || "");
      setCurrCity(curr.city || "");
      setCurrState(curr.state || "");
      setCurrZip(curr.zip || "");
      setCurrCountry(curr.countryCode || "IN");

      // Permanent Address
      const perm = (data as any).permanentAddress || {};
      setPermAddress1(perm.addressLine1 || "");
      setPermAddress2(perm.addressLine2 || "");
      setPermCity(perm.city || "");
      setPermState(perm.state || "");
      setPermZip(perm.zip || "");
      setPermCountry(perm.countryCode || "IN");
    }
  }, [selectedEmployee, employee]);

  // 3. Reactive Watcher: Fetch departments when branchId changes
  useEffect(() => {
    if (!branchId) {
      setDepartments([]);
      return;
    }
    let isMounted = true;
    setLoadingDepartments(true);
    listDepartments(1, 100, branchId)
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data) ? res.data : (res?.data as any)?.items ?? [];
        setDepartments(list);
      })
      .catch(() => {
        if (isMounted) setDepartments([]);
      })
      .finally(() => {
        if (isMounted) setLoadingDepartments(false);
      });

    return () => {
      isMounted = false;
    };
  }, [branchId]);

  // 4. Reactive Watcher: Fetch designations when departmentId changes
  useEffect(() => {
    if (!departmentId) {
      setDesignations([]);
      return;
    }
    let isMounted = true;
    setLoadingDesignations(true);
    listDesignations(1, 100, departmentId)
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data) ? res.data : (res?.data as any)?.items ?? [];
        setDesignations(list);
      })
      .catch(() => {
        if (isMounted) setDesignations([]);
      })
      .finally(() => {
        if (isMounted) setLoadingDesignations(false);
      });

    return () => {
      isMounted = false;
    };
  }, [departmentId]);

  // 5. Sync Permanent Address with Current Address when toggle is active
  useEffect(() => {
    if (sameAsCurrent) {
      setPermAddress1(currAddress1);
      setPermAddress2(currAddress2);
      setPermCity(currCity);
      setPermState(currState);
      setPermZip(currZip);
      setPermCountry(currCountry);
    }
  }, [sameAsCurrent, currAddress1, currAddress2, currCity, currState, currZip, currCountry]);

  // 6. Handle successful update & close dialog with toast
  useEffect(() => {
    if (hasSubmitted && !submitting && !error && open) {
      toast.success("Employee profile updated successfully!");
      onClose();
      const timer = setTimeout(() => {
        setHasSubmitted(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [submitting, error, hasSubmitted, open, onClose]);

  // 7. Handle server error toast
  useEffect(() => {
    if (hasSubmitted && error) {
      toast.error(error);
    }
  }, [hasSubmitted, error]);

  // Convert departments to CascadingSelect options
  const departmentOptions: SelectOption[] = useMemo(
    () =>
      departments?.map((d) => ({
        value: d._id,
        label: `${d.name} (${d.code || "—"})`,
      })) ?? [],
    [departments]
  );

  // Convert designations to CascadingSelect options
  const designationOptions: SelectOption[] = useMemo(
    () =>
      designations?.map((des) => ({
        value: des._id,
        label: des.name,
      })) ?? [],
    [designations]
  );

  // Convert teams to CascadingSelect options
  const teamOptions: SelectOption[] = useMemo(
    () =>
      teams?.map((t: any) => ({
        value: t._id || t.id,
        label: `${t.name} (${t.code || "SQUAD"})`,
      })) ?? [],
    [teams]
  );

  // Convert eligible managers to CascadingSelect options
  const managerOptions: SelectOption[] = useMemo(
    () =>
      eligibleManagers?.map((m) => ({
        value: m._id,
        label: m.fullName,
        subLabel: `${m.designationTitle || "Manager"} • ${m.employeeCode}`,
        isHead: m.isDepartmentHead,
      })) ?? [],
    [eligibleManagers]
  );

  // Tab Error Badges calculation
  const tab0Errors = getTabErrorCount(TAB_FIELDS[0]);
  const tab1Errors = getTabErrorCount(TAB_FIELDS[1]);
  const tab2Errors = getTabErrorCount(TAB_FIELDS[2]);
  const tab3Errors = getTabErrorCount(TAB_FIELDS[3]);

  const handleSubmit = () => {
    const targetId = employee?._id || selectedEmployee?._id;
    if (!targetId) return;

    const formData: UpdateEmployeeFormData = {
      firstName,
      lastName,
      phone,
      countryCode,
      dateOfBirth,
      gender,
      bloodGroup,
      maritalStatus,
      nationality,
      pan,
      aadhaar,
      passportNo,
      drivingLicense,
      voterId,

      branchId,
      departmentId,
      designationId,
      teamId: teamId || null,
      managerId: managerId || null,
      secondaryManagerIds,
      role,
      employeeType,

      joiningDate,
      confirmationDate,
      probationEndDate,
      pfOnActuals,

      currAddress1,
      currAddress2,
      currCity,
      currState,
      currZip,
      currCountry,

      sameAsCurrent,
      permAddress1,
      permAddress2,
      permCity,
      permState,
      permZip,
      permCountry,
    };

    // Run global validation
    const validation = validate(formData, {
      tabMapping: TAB_FIELDS,
      onTabChange: (tabIdx) => setActiveTab(tabIdx),
      toastMessage: "Please fix the highlighted errors before saving.",
    });

    if (!validation.isValid) {
      return;
    }

    setHasSubmitted(true);

    const payload: any = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() || undefined,
      countryCode: countryCode || "IN",
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      bloodGroup: bloodGroup || undefined,
      maritalStatus: maritalStatus || "SINGLE",
      nationality: nationality.trim() || undefined,
      pan: pan.trim().toUpperCase() || undefined,
      aadhaar: aadhaar.trim() || undefined,
      passportNo: passportNo.trim().toUpperCase() || undefined,
      drivingLicense: drivingLicense.trim() || undefined,
      voterId: voterId.trim().toUpperCase() || undefined,

      branchId: branchId || undefined,
      departmentId: departmentId || undefined,
      designationId: designationId || undefined,
      teamId: teamId || null,
      managerId: managerId || null,
      secondaryManagerIds: secondaryManagerIds,
      role: role || "EMPLOYEE",
      employeeType: employeeType || "FULL_TIME",

      confirmationDate: confirmationDate || undefined,
      probationEndDate: probationEndDate || undefined,
      pfOnActuals,

      currentAddress: {
        addressLine1: currAddress1.trim(),
        addressLine2: currAddress2.trim() || undefined,
        city: currCity.trim(),
        state: currState.trim(),
        countryCode: currCountry || "IN",
        zip: currZip.trim(),
      },
      permanentAddress: {
        addressLine1: permAddress1.trim() || currAddress1.trim(),
        addressLine2: permAddress2.trim() || currAddress2.trim() || undefined,
        city: permCity.trim() || currCity.trim(),
        state: permState.trim() || currState.trim(),
        countryCode: permCountry || currCountry || "IN",
        zip: permZip.trim() || currZip.trim(),
      },
    };

    dispatch(updateEmployeeRequest(targetId, payload));
  };

  const activeEmployee = selectedEmployee || employee;
  const fullName = activeEmployee
    ? `${activeEmployee.firstName || ""} ${activeEmployee.lastName || ""}`.trim()
    : "Employee";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(15, 23, 42, 0.45)",
          },
        },
        paper: {
          sx: {
            borderRadius: { xs: "12px", sm: "20px" },
            p: { xs: 2, sm: 3 },
            backgroundColor: "#FFFFFF",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid #E2E8F0",
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      {/* ── Dialog Header with Profile Banner ── */}
      <DialogTitle component="div" sx={{ p: 0, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CustomAvatar
              name={fullName}
              src={activeEmployee?.avatarUrl}
              size={48}
              sx={{ border: "2px solid #6D5DF6", boxShadow: "0 2px 8px rgba(109, 93, 246, 0.2)" }}
            />
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: { xs: "16px", sm: "19px" }, fontWeight: 700, color: "#0F172A" }}>
                  Edit {fullName}
                </Typography>
                {activeEmployee?.employeeCode && (
                  <Chip
                    label={activeEmployee.employeeCode}
                    size="small"
                    sx={{ fontWeight: 700, bgcolor: "#F1F5F9", color: "#475569", fontSize: "12px", height: 22 }}
                  />
                )}
                {activeEmployee?.status && (
                  <StatusChip status={activeEmployee.status} size="small" />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "13px" }}>
                {activeEmployee?.email || "Update organizational hierarchy and employee profile records"}
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={onClose}
            size="small"
            disabled={submitting}
            sx={{
              color: "#64748B",
              borderRadius: "10px",
              "&:hover": { backgroundColor: "#F1F5F9", color: "#0F172A" },
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Navigation Tabs with Dynamic Error Badges */}
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mt: 2,
            minHeight: 44,
            borderBottom: "1px solid #E2E8F0",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "13.5px",
              minHeight: 44,
              px: 2,
              gap: 1,
            },
          }}
        >
          <Tab
            icon={<BusinessOutlinedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <span>Organization & Access</span>
                {tab0Errors > 0 && (
                  <Chip
                    label={tab0Errors}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "11px",
                      fontWeight: 700,
                      bgcolor: "#FEE2E2",
                      color: "#DC2626",
                      borderRadius: "10px",
                      px: 0.2,
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            icon={<PersonOutlinedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <span>Personal Details</span>
                {tab1Errors > 0 && (
                  <Chip
                    label={tab1Errors}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "11px",
                      fontWeight: 700,
                      bgcolor: "#FEE2E2",
                      color: "#DC2626",
                      borderRadius: "10px",
                      px: 0.2,
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <span>Employment & Schedule</span>
                {tab2Errors > 0 && (
                  <Chip
                    label={tab2Errors}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "11px",
                      fontWeight: 700,
                      bgcolor: "#FEE2E2",
                      color: "#DC2626",
                      borderRadius: "10px",
                      px: 0.2,
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            icon={<HomeOutlinedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <span>Address Details</span>
                {tab3Errors > 0 && (
                  <Chip
                    label={tab3Errors}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "11px",
                      fontWeight: 700,
                      bgcolor: "#FEE2E2",
                      color: "#DC2626",
                      borderRadius: "10px",
                      px: 0.2,
                    }}
                  />
                )}
              </Box>
            }
          />
        </Tabs>
      </DialogTitle>

      {/* ── Dialog Body ── */}
      <DialogContent sx={{ p: { xs: 1, sm: 2 }, overflowY: "auto" }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>{error}</Alert>}
        {detailError && <Alert severity="warning" sx={{ mb: 2, borderRadius: "10px" }}>{detailError}</Alert>}

        {loadingDetail ? (
          <Box sx={{ py: 4 }}>
            <Stack spacing={2.5}>
              <Skeleton variant="rectangular" height={50} sx={{ borderRadius: "10px" }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Skeleton variant="rectangular" height={52} sx={{ borderRadius: "10px" }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Skeleton variant="rectangular" height={52} sx={{ borderRadius: "10px" }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Skeleton variant="rectangular" height={52} sx={{ borderRadius: "10px" }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Skeleton variant="rectangular" height={52} sx={{ borderRadius: "10px" }} />
                </Grid>
              </Grid>
            </Stack>
          </Box>
        ) : (
          <Box sx={{ pt: 1 }}>
            {/* ══════════════════════════════════════════════════════ */}
            {/* TAB 0: ORGANIZATION & ACCESS HIERARCHY                 */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === 0 && (
              <Stack spacing={2.5}>
                <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: "#1E293B", display: "flex", alignItems: "center", gap: 1 }}>
                  <BusinessOutlinedIcon sx={{ fontSize: 20, color: "#6D5DF6" }} />
                  Organizational Placement & Reporting Hierarchy
                </Typography>

                <Grid container spacing={2.5}>
                  {/* Step 1: Branch Location */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      select
                      label="STEP 1: Branch Location"
                      required
                      value={branchId}
                      error={errors.branchId}
                      onChange={(e) => {
                        clearError("branchId");
                        setBranchId(e.target.value);
                        setDepartmentId("");
                        setDesignationId("");
                        setManagerId("");
                        setSecondaryManagerIds([]);
                      }}
                    >
                      <MenuItem value="" disabled sx={{ color: "#94A3B8" }}>
                        Select Branch
                      </MenuItem>
                      {branches?.map((b) => (
                        <MenuItem key={b._id} value={b._id}>
                          {b.name} {b.isHeadOffice ? "(HQ)" : ""}
                        </MenuItem>
                      ))}
                    </TextInput>
                  </Grid>

                  {/* Step 2: Department */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <CascadingSelect
                      label="STEP 2: Department"
                      required
                      value={departmentId}
                      options={departmentOptions}
                      loading={loadingDepartments}
                      disabled={!branchId}
                      disabledPlaceholder="Select Branch first"
                      emptyPlaceholder="No departments in branch"
                      error={errors.departmentId}
                      onChange={(e) => {
                        clearError("departmentId");
                        setDepartmentId(e.target.value);
                        setDesignationId("");
                        setManagerId("");
                        setSecondaryManagerIds([]);
                      }}
                    />
                  </Grid>

                  {/* Step 3: Designation */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <CascadingSelect
                      label="STEP 3: Designation"
                      required
                      value={designationId}
                      options={designationOptions}
                      loading={loadingDesignations}
                      disabled={!departmentId}
                      disabledPlaceholder="Select Department first"
                      emptyPlaceholder="No designations in department"
                      error={errors.designationId}
                      onChange={(e) => {
                        clearError("designationId");
                        setDesignationId(e.target.value);
                      }}
                    />
                  </Grid>

                  {/* Step 4: Squad Team */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <CascadingSelect
                      label="STEP 4: Squad Team (Optional)"
                      value={teamId}
                      options={teamOptions}
                      loading={loadingTeams}
                      disabledPlaceholder="No squad teams found"
                      emptyPlaceholder="No squad teams available"
                      error={errors.teamId}
                      onChange={(e) => {
                        clearError("teamId");
                        setTeamId(e.target.value);
                      }}
                    />
                  </Grid>

                  {/* Step 5: Primary Reporting Manager */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <CascadingSelect
                      label="STEP 5: Primary Reporting Manager"
                      value={managerId}
                      options={managerOptions}
                      loading={loadingManagers}
                      disabled={!branchId || !departmentId}
                      disabledPlaceholder="Select Branch & Dept first"
                      emptyPlaceholder="No eligible managers found"
                      error={errors.managerId}
                      onChange={(e) => {
                        clearError("managerId");
                        setManagerId(e.target.value);
                      }}
                    />
                  </Grid>

                  {/* Step 6: Secondary Managers (Multi-Select) */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      select
                      label="STEP 6: Secondary Managers (Optional)"
                      value={secondaryManagerIds}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSecondaryManagerIds(typeof val === "string" ? val.split(",") : val);
                      }}
                      slotProps={{ select: { multiple: true } }}
                      disabled={!branchId || !departmentId}
                    >
                      {eligibleManagers?.map((m) => (
                        <MenuItem key={m._id} value={m._id}>
                          {m.fullName} [{m.employeeCode}] • {m.designationTitle || "Manager"}
                        </MenuItem>
                      ))}
                    </TextInput>
                  </Grid>

                  {/* Step 7: System Access Security Role */}
                  <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                    <TextInput
                      select
                      label="System Security Role"
                      required
                      value={role}
                      error={errors.role}
                      onChange={(e) => {
                        clearError("role");
                        setRole(e.target.value);
                      }}
                    >
                      {rolesList?.map((r) => (
                        <MenuItem key={r.slug || r._id} value={r.slug}>
                          {r.name} ({r.slug})
                        </MenuItem>
                      ))}
                    </TextInput>
                  </Grid>

                  {/* Step 8: Employee Type */}
                  <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                    <TextInput
                      select
                      label="Employee Type"
                      required
                      value={employeeType}
                      error={errors.employeeType}
                      onChange={(e) => {
                        clearError("employeeType");
                        setEmployeeType(e.target.value);
                      }}
                    >
                      {EMPLOYEE_TYPES.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                          {t.label}
                        </MenuItem>
                      ))}
                    </TextInput>
                  </Grid>
                </Grid>
              </Stack>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/* TAB 1: PERSONAL & CONTACT INFORMATION                  */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === 1 && (
              <Stack spacing={2.5}>
                <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: "#1E293B", display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonOutlinedIcon sx={{ fontSize: 20, color: "#6D5DF6" }} />
                  Personal Information & Government Identity
                </Typography>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      label="First Name"
                      required
                      value={firstName}
                      error={errors.firstName}
                      onChange={(e) => {
                        clearError("firstName");
                        setFirstName(e.target.value);
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      label="Last Name"
                      required
                      value={lastName}
                      error={errors.lastName}
                      onChange={(e) => {
                        clearError("lastName");
                        setLastName(e.target.value);
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      label="Work Email Address"
                      disabled
                      value={activeEmployee?.email || ""}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      Work email is tied to the login account and cannot be modified.
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <PhoneInput
                      label="Mobile Phone Number"
                      countryCodeValue={countryCode}
                      phoneValue={phone}
                      phoneError={errors.phone}
                      onCountryCodeChange={(code) => setCountryCode(code)}
                      onPhoneChange={(val) => {
                        clearError("phone");
                        setPhone(val);
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      type="date"
                      label="Date of Birth"
                      value={dateOfBirth}
                      error={errors.dateOfBirth}
                      onChange={(e) => {
                        clearError("dateOfBirth");
                        setDateOfBirth(e.target.value);
                      }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      select
                      label="Gender"
                      value={gender}
                      error={errors.gender}
                      onChange={(e) => {
                        clearError("gender");
                        setGender(e.target.value);
                      }}
                    >
                      <MenuItem value="">Select Gender</MenuItem>
                      {GENDER_OPTIONS.map((g) => (
                        <MenuItem key={g.value} value={g.value}>
                          {g.label}
                        </MenuItem>
                      ))}
                    </TextInput>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      select
                      label="Blood Group"
                      value={bloodGroup}
                      error={errors.bloodGroup}
                      onChange={(e) => {
                        clearError("bloodGroup");
                        setBloodGroup(e.target.value);
                      }}
                    >
                      <MenuItem value="">Select Blood Group</MenuItem>
                      {BLOOD_GROUP_OPTIONS.map((bg) => (
                        <MenuItem key={bg} value={bg}>
                          {bg}
                        </MenuItem>
                      ))}
                    </TextInput>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      select
                      label="Marital Status"
                      value={maritalStatus}
                      error={errors.maritalStatus}
                      onChange={(e) => {
                        clearError("maritalStatus");
                        setMaritalStatus(e.target.value);
                      }}
                    >
                      {MARITAL_STATUS_OPTIONS.map((ms) => (
                        <MenuItem key={ms.value} value={ms.value}>
                          {ms.label}
                        </MenuItem>
                      ))}
                    </TextInput>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      label="Nationality"
                      value={nationality}
                      error={errors.nationality}
                      onChange={(e) => {
                        clearError("nationality");
                        setNationality(e.target.value);
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      label="PAN Card Number"
                      format="pan"
                      value={pan}
                      placeholder="e.g. ABCPS1234D"
                      error={errors.pan}
                      onChange={(e) => {
                        clearError("pan");
                        setPan(e.target.value);
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      label="Aadhaar Card Number"
                      format="aadhaar"
                      value={aadhaar}
                      placeholder="12 digits"
                      error={errors.aadhaar}
                      onChange={(e) => {
                        clearError("aadhaar");
                        setAadhaar(e.target.value);
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      label="Passport Number"
                      value={passportNo}
                      placeholder="e.g. Z1234567"
                      error={errors.passportNo}
                      onChange={(e) => {
                        clearError("passportNo");
                        setPassportNo(e.target.value.toUpperCase());
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      label="Driving License"
                      value={drivingLicense}
                      placeholder="License number"
                      error={errors.drivingLicense}
                      onChange={(e) => {
                        clearError("drivingLicense");
                        setDrivingLicense(e.target.value);
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      label="Voter ID"
                      value={voterId}
                      placeholder="Voter ID number"
                      error={errors.voterId}
                      onChange={(e) => {
                        clearError("voterId");
                        setVoterId(e.target.value.toUpperCase());
                      }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/* TAB 2: EMPLOYMENT SCHEDULE & DATES                     */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === 2 && (
              <Stack spacing={2.5}>
                <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: "#1E293B", display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarMonthOutlinedIcon sx={{ fontSize: 20, color: "#6D5DF6" }} />
                  Employment Timeline & Statutory Flags
                </Typography>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      type="date"
                      label="Date of Joining"
                      disabled
                      value={joiningDate}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      Official joining timestamp is recorded on creation.
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      type="date"
                      label="Confirmation Date (Optional)"
                      value={confirmationDate}
                      error={errors.confirmationDate}
                      onChange={(e) => {
                        clearError("confirmationDate");
                        setConfirmationDate(e.target.value);
                      }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      type="date"
                      label="Probation End Date (Optional)"
                      value={probationEndDate}
                      error={errors.probationEndDate}
                      onChange={(e) => {
                        clearError("probationEndDate");
                        setProbationEndDate(e.target.value);
                      }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0", mt: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={pfOnActuals}
                            onChange={(e) => setPfOnActuals(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#1E293B" }}>
                              Provident Fund (PF) on Actual Gross Wages
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Enable if statutory PF contribution is calculated on actual gross salary instead of statutory ceiling (₹15,000).
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/* TAB 3: CURRENT & PERMANENT ADDRESSES                   */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === 3 && (
              <Stack spacing={3}>
                {/* Current Address */}
                <Box>
                  <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: "#1E293B", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <HomeOutlinedIcon sx={{ fontSize: 20, color: "#6D5DF6" }} />
                    Current Residential Address
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <TextInput
                        label="Address Line 1"
                        placeholder="Flat / Building / Street"
                        value={currAddress1}
                        error={errors.currAddress1}
                        onChange={(e) => {
                          clearError("currAddress1");
                          setCurrAddress1(e.target.value);
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextInput
                        label="Address Line 2"
                        placeholder="Landmark / Area"
                        value={currAddress2}
                        error={errors.currAddress2}
                        onChange={(e) => {
                          clearError("currAddress2");
                          setCurrAddress2(e.target.value);
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextInput
                        label="City"
                        value={currCity}
                        error={errors.currCity}
                        onChange={(e) => {
                          clearError("currCity");
                          setCurrCity(e.target.value);
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextInput
                        label="State / Province"
                        value={currState}
                        error={errors.currState}
                        onChange={(e) => {
                          clearError("currState");
                          setCurrState(e.target.value);
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextInput
                        label="Postal / Zip Code"
                        value={currZip}
                        error={errors.currZip}
                        onChange={(e) => {
                          clearError("currZip");
                          setCurrZip(e.target.value);
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Permanent Address Toggle */}
                <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sameAsCurrent}
                        onChange={(e) => setSameAsCurrent(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#1E293B" }}>
                        Permanent Address is the same as Current Address
                      </Typography>
                    }
                  />
                </Box>

                {/* Permanent Address Form */}
                {!sameAsCurrent && (
                  <Box>
                    <Typography sx={{ fontSize: "14.5px", fontWeight: 700, color: "#1E293B", mb: 2 }}>
                      Permanent / Domicile Address
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 8 }}>
                        <TextInput
                          label="Address Line 1"
                          placeholder="Flat / Building / Street"
                          value={permAddress1}
                          error={errors.permAddress1}
                          onChange={(e) => {
                            clearError("permAddress1");
                            setPermAddress1(e.target.value);
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextInput
                          label="Address Line 2"
                          placeholder="Landmark / Area"
                          value={permAddress2}
                          error={errors.permAddress2}
                          onChange={(e) => {
                            clearError("permAddress2");
                            setPermAddress2(e.target.value);
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextInput
                          label="City"
                          value={permCity}
                          error={errors.permCity}
                          onChange={(e) => {
                            clearError("permCity");
                            setPermCity(e.target.value);
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextInput
                          label="State / Province"
                          value={permState}
                          error={errors.permState}
                          onChange={(e) => {
                            clearError("permState");
                            setPermState(e.target.value);
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextInput
                          label="Postal / Zip Code"
                          value={permZip}
                          error={errors.permZip}
                          onChange={(e) => {
                            clearError("permZip");
                            setPermZip(e.target.value);
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Stack>
            )}
          </Box>
        )}
      </DialogContent>

      {/* ── Dialog Footer ── */}
      <DialogActions
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          borderTop: "1px solid #E2E8F0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          {activeTab > 0 && (
            <Button
              onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
              sx={{ textTransform: "none", color: "#64748B", fontWeight: 600 }}
            >
              ← Previous Section
            </Button>
          )}
          {activeTab < 3 && (
            <Button
              onClick={() => setActiveTab((prev) => Math.min(3, prev + 1))}
              sx={{ textTransform: "none", color: "#6D5DF6", fontWeight: 600 }}
            >
              Next Section →
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            onClick={onClose}
            disabled={submitting}
            sx={{
              height: 42,
              borderRadius: "10px",
              px: 2.5,
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: "#F1F5F9",
              color: "#475569",
              "&:hover": { backgroundColor: "#E2E8F0", color: "#0F172A" },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={submitting || loadingDetail}
            variant="contained"
            sx={{
              height: 42,
              borderRadius: "10px",
              px: 3.5,
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: "#6D5DF6",
              boxShadow: "0 2px 8px rgba(109, 93, 246, 0.25)",
              "&:hover": { backgroundColor: "#5B4BEA" },
            }}
          >
            {submitting ? <CircularProgress size={18} color="inherit" /> : "Save Changes"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default EmployeeEditDialog;
