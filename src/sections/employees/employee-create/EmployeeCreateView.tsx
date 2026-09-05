import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

import TextInput from "../../../components/input/TextInput";
import PhoneInput from "../../../components/input/PhoneInput";
import CascadingSelect, { type SelectOption } from "../../../components/input/CascadingSelect";
import { formatToYYYYMMDD } from "../../../utils/format-date";
import { paths } from "../../../routes/paths";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import {
  createEmployeeRequest,
  clearEmployeeError,
  resetEmployeeState,
} from "../../../store/employee";
import { listBranchesRequest } from "../../../store/branch";
import {
  listDepartments,
} from "../../../api/department.api";
import {
  listDesignations,
} from "../../../api/designation.api";
import {
  createEmployeeSchema,
  type CreateEmployeeFormData,
} from "../../../validations/employee/create-employee.schema";
import { listShifts } from "../../../api/attendance.api";
import { listRoles, type RoleItem } from "../../../api/role.api";
import { listTeams } from "../../../api/team.api";
import type { Shift } from "../../../store/attendance";
import { useActiveBranchId } from "../../../hooks/useActiveBranchId";
import { useEligibleManagers } from "../../../hooks/useEligibleManagers";

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
  { value: "TEMPORARY", label: "Temporary" },
  { value: "FREELANCE", label: "Freelance" },
];

export default function EmployeeCreateView() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const activeBranchId = useActiveBranchId();

  const { submitting, success, error } = useSelector(
    (state: RootState) => state.employee
  );

  const branches = useSelector(
    (state: RootState) => state.branch?.branches ?? []
  );

  // Cascading Dynamic State
  const [departments, setDepartments] = useState<Array<{ _id: string; name: string; code: string }>>([]);
  const [loadingDepartments, setLoadingDepartments] = useState<boolean>(false);

  const [designations, setDesignations] = useState<Array<{ _id: string; name: string; code: string }>>([]);
  const [loadingDesignations, setLoadingDesignations] = useState<boolean>(false);

  const [teams, setTeams] = useState<Array<{ _id: string; name: string; code: string }>>([]);
  const [loadingTeams, setLoadingTeams] = useState<boolean>(false);

  const manageSalary = true;
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(true);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);
  const [secondaryManagerOpen, setSecondaryManagerOpen] = useState(false);

  const [rolesList, setRolesList] = useState<RoleItem[]>(DEFAULT_FALLBACK_ROLES);

  // Fetch active squad teams from DB
  useEffect(() => {
    let isMounted = true;
    setLoadingTeams(true);
    listTeams()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data) ? res.data : (res?.data as any)?.items || [];
        setTeams(list);
      })
      .catch((err) => console.error("Failed to load squad teams:", err))
      .finally(() => {
        if (isMounted) setLoadingTeams(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch active system and custom roles from DB
  useEffect(() => {
    let isMounted = true;
    listRoles()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        if (list.length > 0) {
          setRolesList(list);
        }
      })
      .catch((err) => {
        console.error("Failed to load roles from backend, using default fallback roles:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      branchId: activeBranchId || "",
      departmentId: "",
      designationId: "",
      teamId: "",
      managerId: "",
      secondaryManagerIds: [],
      role: "EMPLOYEE",
      countryCode: "IN",
      employeeType: "FULL_TIME",
      shiftId: "",
      gender: "",
      maritalStatus: "",
      bloodGroup: "",
      nationality: "Indian",
      bankAccount: {
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountType: "SALARY",
        accountHolderName: "",
      },
    },
  });

  const selectedBranchId = watch("branchId");
  const selectedDepartmentId = watch("departmentId");
  const selectedDesignationId = watch("designationId");
  const selectedManagerId = watch("managerId");
  const employeeType = watch("employeeType");

  // Custom hook for eligible managers
  const {
    managers: eligibleManagers,
    defaultManagerId,
    loading: loadingManagers,
  } = useEligibleManagers({
    branchId: selectedBranchId,
    departmentId: selectedDepartmentId,
    designationId: selectedDesignationId,
  });

  // Load initial branches
  useEffect(() => {
    if (branches.length === 0) {
      dispatch(listBranchesRequest());
    }
    dispatch(clearEmployeeError());
  }, [dispatch, branches.length]);

  // Set default active branch if available
  useEffect(() => {
    if (activeBranchId && !selectedBranchId) {
      setValue("branchId", activeBranchId);
    }
  }, [activeBranchId, selectedBranchId, setValue]);

  // 1. Reactive Watcher: Branch Change ➔ Reset & Fetch Departments
  useEffect(() => {
    if (!selectedBranchId) {
      setDepartments([]);
      setDesignations([]);
      setValue("departmentId", "");
      setValue("designationId", "");
      setValue("managerId", "");
      return;
    }

    const fetchBranchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const res = await listDepartments(1, 100, selectedBranchId);
        if (res?.succeeded && res?.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data as any)?.items ?? [];
          setDepartments(list);
        } else {
          setDepartments([]);
        }
      } catch (err) {
        console.error("Failed to load departments for branch:", err);
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };

    // Reset children selections
    setValue("departmentId", "");
    setValue("designationId", "");
    setValue("managerId", "");
    setDesignations([]);

    fetchBranchDepartments();
  }, [selectedBranchId, setValue]);

  // 2. Reactive Watcher: Department Change ➔ Reset & Fetch Designations
  useEffect(() => {
    if (!selectedDepartmentId) {
      setDesignations([]);
      setValue("designationId", "");
      setValue("managerId", "");
      return;
    }

    const fetchDepartmentDesignations = async () => {
      setLoadingDesignations(true);
      try {
        const res = await listDesignations(1, 100, selectedDepartmentId);
        if (res?.succeeded && res?.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data as any)?.items ?? [];
          setDesignations(list);
        } else {
          setDesignations([]);
        }
      } catch (err) {
        console.error("Failed to load designations for department:", err);
        setDesignations([]);
      } finally {
        setLoadingDesignations(false);
      }
    };

    // Reset child designation & manager
    setValue("designationId", "");
    setValue("managerId", "");

    fetchDepartmentDesignations();
  }, [selectedDepartmentId, setValue]);

  // 3. Auto-Select Default Manager when returned by query hook
  useEffect(() => {
    if (defaultManagerId && !selectedManagerId) {
      setValue("managerId", defaultManagerId);
    }
  }, [defaultManagerId, selectedManagerId, setValue]);

  // Load shifts list
  useEffect(() => {
    const fetchShiftsList = async () => {
      try {
        const res = await listShifts();
        if (res?.succeeded && res?.data) {
          setShifts(res.data);
        }
      } catch (err) {
        console.error("Failed to load shifts:", err);
      } finally {
        setShiftsLoading(false);
      }
    };
    fetchShiftsList();
  }, []);

  // Sync salary pay type with employee type
  useEffect(() => {
    if (manageSalary) {
      const payType = watch("salarySetup.employeePayType") || employeeType;
      const typeMap: Record<string, string> = {
        FULL_TIME: "CTC",
        PART_TIME: "HOURLY_RATE",
        CONTRACT: "FIXED_MONTHLY",
        TEMPORARY: "FIXED_MONTHLY",
        FREELANCE: "FIXED_MONTHLY",
        INTERN: "STIPEND",
        CONSULTANT: "STIPEND",
        UNPAID: "UNPAID",
      };
      setValue("salarySetup.employeePayType", payType as any);
      setValue("salarySetup.structure.type", typeMap[payType] || "");
    }
  }, [employeeType, manageSalary, watch, setValue]);

  // Handle successful creation redirect
  useEffect(() => {
    if (success) {
      dispatch(resetEmployeeState());
      navigate(paths.employees.directory);
    }
  }, [success, navigate, dispatch]);

  const onInvalidForm = (validationErrors: any) => {
    console.error("Form Validation Errors:", validationErrors);
    const firstKey = Object.keys(validationErrors)[0];
    if (firstKey) {
      const errObj = validationErrors[firstKey];
      const msg = errObj?.message || `Please check the ${firstKey} field.`;
      setFormValidationError(`Validation Error: Please check "${firstKey}" (${msg})`);
    }
  };

  const onSubmit = (data: CreateEmployeeFormData) => {
    setFormValidationError(null);
    const payload: any = { ...data };

    payload.branchId = payload.branchId || activeBranchId;

    if (payload.joiningDate) {
      payload.joiningDate = formatToYYYYMMDD(payload.joiningDate);
    }
    if (payload.probationEndDate) {
      payload.probationEndDate = formatToYYYYMMDD(payload.probationEndDate);
    }

    // Clean up all empty optional fields to prevent backend validation errors
    const optionalKeys = [
      "phone", "managerId", "teamId", "secondaryManagerIds", "probationEndDate", "shiftId",
      "pan", "aadhaar", "passportNo", "dateOfBirth", "gender",
      "bloodGroup", "maritalStatus", "nationality", "currentAddress", "permanentAddress", "bankAccount"
    ];
    optionalKeys.forEach((key) => {
      const val = payload[key];
      if (val === "" || val === null || val === undefined || (Array.isArray(val) && val.length === 0)) {
        delete payload[key];
      } else if (typeof val === "object" && !Array.isArray(val)) {
        const hasValues = Object.values(val).some((v) => v !== "" && v !== null && v !== undefined);
        if (!hasValues) {
          delete payload[key];
        }
      }
    });

    // Bank Account mapping / validation cleanup
    if (payload.bankAccount) {
      const bank = payload.bankAccount;
      if (!bank.bankName && !bank.accountNumber && !bank.ifscCode) {
        delete payload.bankAccount;
      } else {
        if (!bank.accountHolderName) {
          bank.accountHolderName = `${payload.firstName || ""} ${payload.lastName || ""}`.trim();
        }
        if (bank.ifscCode) {
          bank.ifscCode = bank.ifscCode.toUpperCase().trim();
        }
      }
    }

    // Salary Structure mapping
    if (!manageSalary || (!payload.salarySetup && !payload.salaryStructure)) {
      delete payload.salarySetup;
      delete payload.salaryStructure;
    } else {
      const ctcAnnual = Number(payload.salaryStructure?.ctcAnnual || payload.salarySetup?.structure?.amount || 0);
      const rawComponents = payload.salarySetup?.structure?.components || payload.salaryStructure?.lineItems || [];
      const defaultCodes = ["BASIC", "HRA", "ALLOWANCE"];

      let lineItems = rawComponents
        .map((c: any, index: number) => ({
          componentCode: ((c && c.componentCode) || defaultCodes[index] || "BASIC").toUpperCase(),
          amount: Number((c && c.amount) || 0),
        }))
        .filter((c: any) => c.amount > 0);

      if (lineItems.length === 0) {
        lineItems = [{ componentCode: "BASIC", amount: ctcAnnual > 0 ? Math.round(ctcAnnual * 0.5) : 25000 }];
      }

      payload.salaryStructure = {
        ctcAnnual,
        lineItems,
      };
      delete payload.salarySetup;
    }

    dispatch(createEmployeeRequest(payload));
  };

  // Convert departments to CascadingSelect options
  const departmentOptions: SelectOption[] = departments?.map((d) => ({
    value: d._id,
    label: `${d.name} (${d.code})`,
  })) ?? [];

  // Convert designations to CascadingSelect options
  const designationOptions: SelectOption[] = designations?.map((des) => ({
    value: des._id,
    label: des.name,
  })) ?? [];

  // Convert teams to CascadingSelect options
  const teamOptions: SelectOption[] = teams?.map((t: any) => ({
    value: t._id || t.id,
    label: `${t.name} (${t.code || "SQUAD"})`,
  })) ?? [];

  // Convert managers to CascadingSelect options
  const managerOptions: SelectOption[] = eligibleManagers?.map((m) => ({
    value: m._id,
    label: m.fullName,
    subLabel: `${m.designationTitle || "Manager"} • ${m.employeeCode}`,
    isHead: m.isDepartmentHead,
  })) ?? [];

  return (
    <>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1400, mx: "auto" }}>
        
        {/* Header Title */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PersonAddOutlinedIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
                Add New Employee
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create employee profile and initiate setup workflow
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Global Notifications */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "8px" }}>
            {error}
          </Alert>
        )}
        {formValidationError && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: "8px" }}>
            {formValidationError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit, onInvalidForm)} autoComplete="off">
          <Stack spacing={3}>

            {/* ── CARD 1: CASCADING ORGANIZATIONAL PLACEMENT (STEPS 1 - 7) ── */}
            <Card sx={{ borderRadius: "12px", boxShadow: "0px 1px 3px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                  <BusinessOutlinedIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#1F2937" }}>
                    Organizational Placement & Hierarchy
                  </Typography>
                </Box>

                <Grid container spacing={2.5}>
                  {/* Step 1: Branch Selection */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      select
                      label="STEP 1: Branch Location"
                      required
                      registration={register("branchId")}
                      error={errors.branchId?.message}
                    >
                      <MenuItem value="" disabled sx={{ color: "#94A3B8" }}>
                        Select Branch
                      </MenuItem>
                      {branches?.map((b) => (
                        <MenuItem key={b._id} value={b._id}>
                          {b.name}
                        </MenuItem>
                      ))}
                    </TextInput>
                  </Grid>

                  {/* Step 2: Department (Cascading) */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <CascadingSelect
                      label="STEP 2: Department"
                      required
                      value={watch("departmentId")}
                      options={departmentOptions}
                      loading={loadingDepartments}
                      disabled={!selectedBranchId}
                      disabledPlaceholder="Select Branch first"
                      emptyPlaceholder="No departments in branch"
                      error={errors.departmentId?.message}
                      registration={register("departmentId")}
                    />
                  </Grid>

                  {/* Step 3: Designation (Cascading) */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <CascadingSelect
                      label="STEP 3: Designation"
                      required
                      value={watch("designationId")}
                      options={designationOptions}
                      loading={loadingDesignations}
                      disabled={!selectedDepartmentId}
                      disabledPlaceholder="Select Department first"
                      emptyPlaceholder="No designations in department"
                      error={errors.designationId?.message}
                      registration={register("designationId")}
                    />
                  </Grid>

                  {/* Step 4: Squad Team */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <CascadingSelect
                      label="STEP 4: Squad Team"
                      value={watch("teamId")}
                      options={teamOptions}
                      loading={loadingTeams}
                      disabledPlaceholder="No teams available"
                      emptyPlaceholder="No squad teams found"
                      error={errors.teamId?.message}
                      registration={register("teamId")}
                    />
                  </Grid>

                  {/* Step 5: Primary Reporting Manager */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <CascadingSelect
                      label="STEP 5: Primary Reporting Manager"
                      value={watch("managerId")}
                      options={managerOptions}
                      loading={loadingManagers}
                      disabled={!selectedBranchId || !selectedDepartmentId}
                      disabledPlaceholder="Select Branch & Dept first"
                      emptyPlaceholder="No eligible managers found"
                      error={errors.managerId?.message}
                      registration={register("managerId")}
                    />
                  </Grid>

                  {/* Step 6: Secondary Managers (Multi-Select) */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      select
                      label="STEP 6: Secondary Managers"
                      value={Array.isArray(watch("secondaryManagerIds")) ? watch("secondaryManagerIds") : []}
                      onChange={(e) => {
                        const val = e.target.value;
                        setValue("secondaryManagerIds", typeof val === "string" ? val.split(",") : val);
                        setSecondaryManagerOpen(false);
                      }}
                      error={errors.secondaryManagerIds?.message}
                      slotProps={{
                        select: {
                          multiple: true,
                          open: secondaryManagerOpen,
                          onOpen: () => setSecondaryManagerOpen(true),
                          onClose: () => setSecondaryManagerOpen(false),
                        },
                      }}
                      disabled={!selectedBranchId || !selectedDepartmentId}
                    >
                      {eligibleManagers?.map((m) => (
                        <MenuItem key={m._id} value={m._id}>
                          {m.fullName} [{m.employeeCode}] • {m.designationTitle || "Manager"}
                        </MenuItem>
                      ))}
                    </TextInput>
                  </Grid>

                  {/* Step 7: System Access Security Role */}
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      select
                      label="STEP 7: System Security Role"
                      required
                      registration={register("role")}
                      error={errors.role?.message}
                    >
                      {rolesList?.map((r) => (
                        <MenuItem key={r.slug || r._id} value={r.slug}>
                          {r.name} ({r.slug})
                        </MenuItem>
                      ))}
                    </TextInput>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* ── CARD 2: BASIC INFORMATION & CONTACT ── */}
            <Card sx={{ borderRadius: "12px", boxShadow: "0px 1px 3px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1F2937", mb: 2.5 }}>
                  Basic Information & Contact
                </Typography>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextInput
                      label="First Name"
                      required
                      placeholder="e.g. Rohan"
                      registration={register("firstName")}
                      error={errors.firstName?.message}
                      slotProps={{ htmlInput: { autoComplete: "new-password" } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextInput
                      label="Last Name"
                      required
                      placeholder="e.g. Sharma"
                      registration={register("lastName")}
                      error={errors.lastName?.message}
                      slotProps={{ htmlInput: { autoComplete: "new-password" } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextInput
                      label="Work Email Address"
                      required
                      placeholder="e.g. rohan.sharma@apexglobal.io"
                      registration={register("email")}
                      error={errors.email?.message}
                      slotProps={{ htmlInput: { autoComplete: "new-password" } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <PhoneInput
                      label="Mobile Number"
                      phoneRegistration={register("phone")}
                      countryCodeRegistration={register("countryCode")}
                      phoneError={errors.phone?.message}
                      countryCodeError={errors.countryCode?.message}
                      setValue={setValue}
                      watch={watch}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>





            {/* ── CARD 5: EMPLOYMENT DATES & SHIFT SCHEDULE ── */}
            <Card sx={{ borderRadius: "12px", boxShadow: "0px 1px 3px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1F2937", mb: 2.5 }}>
                  Employment Details & Schedule
                </Typography>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextInput
                      select
                      label="Employee Type"
                      required
                      registration={register("employeeType")}
                      error={errors.employeeType?.message}
                    >
                      {EMPLOYEE_TYPES.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                          {t.label}
                        </MenuItem>
                      ))}
                    </TextInput>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextInput
                      type="date"
                      label="Joining Date"
                      required
                      slotProps={{ inputLabel: { shrink: true } }}
                      registration={register("joiningDate")}
                      error={errors.joiningDate?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextInput
                      type="date"
                      label="Probation End Date"
                      slotProps={{ inputLabel: { shrink: true } }}
                      registration={register("probationEndDate")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextInput
                      select
                      label="Shift Selection"
                      disabled={shiftsLoading}
                      registration={register("shiftId")}
                    >
                      <MenuItem value="">Default Shift</MenuItem>
                      {shifts?.map((s) => (
                        <MenuItem key={s._id} value={s._id}>
                          {s.name} ({s.startTime} - {s.endTime})
                        </MenuItem>
                      ))}
                    </TextInput>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* ── CARD 6: BANK ACCOUNT DETAILS (PAYROLL SETUP) ── */}
            <Card sx={{ borderRadius: "12px", boxShadow: "0px 1px 3px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                  <AccountBalanceOutlinedIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#1F2937" }}>
                    Bank Account Details (Payroll Setup)
                  </Typography>
                </Box>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextInput
                      label="Bank Name"
                      placeholder="e.g. HDFC Bank, SBI, ICICI"
                      registration={register("bankAccount.bankName")}
                      error={errors.bankAccount?.bankName?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextInput
                      label="Account Number"
                      format="numeric"
                      maxLength={13}
                      placeholder="e.g. 50100432109876"
                      registration={register("bankAccount.accountNumber")}
                      error={errors.bankAccount?.accountNumber?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextInput
                      label="IFSC Code"
                      format="uppercase"
                      maxLength={11}
                      placeholder="e.g. HDFC0001234"
                      registration={register("bankAccount.ifscCode")}
                      error={errors.bankAccount?.ifscCode?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextInput
                      select
                      label="Account Type"
                      registration={register("bankAccount.accountType")}
                      error={errors.bankAccount?.accountType?.message}
                    >
                      <MenuItem value="SALARY">Salary Account</MenuItem>
                      <MenuItem value="SAVINGS">Savings Account</MenuItem>
                      <MenuItem value="CURRENT">Current Account</MenuItem>
                    </TextInput>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                    <TextInput
                      label="Account Holder Name"
                      placeholder="Leave blank to use employee's full name"
                      registration={register("bankAccount.accountHolderName")}
                      error={errors.bankAccount?.accountHolderName?.message}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* ── CARD 7: COMPENSATION & SALARY SETUP ── */}
            <Card sx={{ borderRadius: "12px", boxShadow: "0px 1px 3px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PaymentsOutlinedIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#1F2937" }}>
                      Compensation & Salary Setup
                    </Typography>
                  </Box>
                </Box>

                {manageSalary && (
                  <Grid container spacing={2.5} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextInput
                        label="Annual CTC (₹)"
                        type="number"
                        placeholder="e.g. 1200000"
                        registration={register("salarySetup.structure.amount", { valueAsNumber: true })}
                        error={(errors.salarySetup?.structure as any)?.amount?.message}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextInput select label="Currency" registration={register("salarySetup.structure.currency")}>
                        <MenuItem value="INR">INR (₹)</MenuItem>
                        <MenuItem value="USD">USD ($)</MenuItem>
                        <MenuItem value="EUR">EUR (€)</MenuItem>
                        <MenuItem value="GBP">GBP (£)</MenuItem>
                      </TextInput>
                    </Grid>

                    <Grid size={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", mb: 1 }}>
                        Salary Component Breakdown
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextInput
                        label="Basic Salary"
                        type="number"
                        placeholder="Enter basic"
                        registration={register("salarySetup.structure.components.0.amount", { valueAsNumber: true })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextInput
                        label="HRA"
                        type="number"
                        placeholder="Enter HRA"
                        registration={register("salarySetup.structure.components.1.amount", { valueAsNumber: true })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextInput
                        label="Special Allowance"
                        type="number"
                        placeholder="Enter allowance"
                        registration={register("salarySetup.structure.components.2.amount", { valueAsNumber: true })}
                      />
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>

            {/* ── ACTION BUTTONS ── */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pt: 1, pb: 4 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate(paths.employees.directory)}
                sx={{ px: 4, borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  px: 4,
                  py: 1.2,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {submitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "💾 Submit Employee"
                )}
              </Button>
            </Box>

          </Stack>
        </form>
      </Box>
    </>
  );
}
