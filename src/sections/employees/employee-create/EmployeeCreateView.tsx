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
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import TextInput from "../../../components/input/TextInput";
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
import type { Shift } from "../../../store/attendance";
import { useActiveBranchId } from "../../../hooks/useActiveBranchId";
import { useEligibleManagers } from "../../../hooks/useEligibleManagers";

const EMPLOYEE_TYPES = [
  { value: "FULL_TIME", label: "Full-Time" },
  { value: "PART_TIME", label: "Part-Time" },
  { value: "CONTRACT", label: "Contractor" },
  { value: "INTERN", label: "Intern" },
  { value: "CONSULTANT", label: "Consultant" },
  { value: "TEMPORARY", label: "Temporary" },
  { value: "FREELANCE", label: "Freelance" },
];

const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
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

  const [manageSalary, setManageSalary] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(true);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

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
      managerId: "",
      countryCode: "IN",
      employeeType: "FULL_TIME",
      shiftId: "",
      gender: "MALE",
      maritalStatus: "SINGLE",
      bloodGroup: "O+",
      nationality: "Indian",
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
      "phone", "managerId", "probationEndDate", "shiftId",
      "pan", "aadhaar", "passportNo", "dateOfBirth", "gender",
      "bloodGroup", "maritalStatus", "nationality", "currentAddress", "permanentAddress"
    ];
    optionalKeys.forEach((key) => {
      const val = payload[key];
      if (val === "" || val === null || val === undefined) {
        delete payload[key];
      } else if (typeof val === "object" && !Array.isArray(val)) {
        const hasValues = Object.values(val).some((v) => v !== "" && v !== null && v !== undefined);
        if (!hasValues) {
          delete payload[key];
        }
      }
    });

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

  // Convert managers to CascadingSelect options
  const managerOptions: SelectOption[] = eligibleManagers?.map((m) => ({
    value: m._id,
    label: m.fullName,
    subLabel: `${m.designationTitle || "Manager"} • ${m.employeeCode}`,
    isHead: m.isDepartmentHead,
  })) ?? [];

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1400, mx: "auto" }}>
        
        {/* Header Title with Profile Completion Badge */}
        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PersonAddOutlinedIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
                Add New Employee
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create employee profile and initiate setup workflow
              </Typography>
            </Box>
          </Box>

          <Card sx={{ borderRadius: "12px", border: "1px solid #E5E7EB", p: 1.5, minWidth: 220, bgcolor: "#F9FAFB" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#374151" }}>
                Profile Completion
              </Typography>
              <Chip label={manageSalary ? "80%" : "65%"} size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem" }} />
            </Box>
            <LinearProgress variant="determinate" value={manageSalary ? 80 : 65} sx={{ height: 6, borderRadius: 3 }} />
          </Card>
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

        <form onSubmit={handleSubmit(onSubmit, onInvalidForm)}>
          <Stack spacing={3}>

            {/* ── CARD 1: CASCADING ORGANIZATIONAL PLACEMENT (STEPS 1 - 4) ── */}
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
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

                  {/* Step 4: Reporting Manager (Auto-filled) */}
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <CascadingSelect
                      label="STEP 4: Reporting Manager"
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      label="First Name *"
                      placeholder="e.g. Rohan"
                      registration={register("firstName")}
                      error={errors.firstName?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      label="Last Name *"
                      placeholder="e.g. Sharma"
                      registration={register("lastName")}
                      error={errors.lastName?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      label="Work Email Address *"
                      placeholder="e.g. rohan.sharma@apexglobal.io"
                      registration={register("email")}
                      error={errors.email?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextInput
                      label="Phone Number"
                      type="tel"
                      maxLength={10}
                      placeholder="e.g. 9820112233"
                      registration={register("phone")}
                      error={errors.phone?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 2 }}>
                    <TextInput
                      select
                      label="Country Code"
                      registration={register("countryCode")}
                      error={errors.countryCode?.message}
                    >
                      {COUNTRIES.map((c) => (
                        <MenuItem key={c.code} value={c.code}>
                          {c.code} ({c.name})
                        </MenuItem>
                      ))}
                    </TextInput>
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
                      label="Employee Type *"
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
                      label="Joining Date *"
                      slotProps={{ inputLabel: { shrink: true } }}
                      registration={register("joiningDate")}
                      error={errors.joiningDate?.message}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextInput
                      type="date"
                      label="Probation End Date (Optional)"
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

            {/* ── CARD 6: COMPENSATION & SALARY SETUP ── */}
            <Card sx={{ borderRadius: "12px", boxShadow: "0px 1px 3px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccountBalanceOutlinedIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#1F2937" }}>
                      Compensation & Salary Setup
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={manageSalary}
                        onChange={(e) => setManageSalary(e.target.checked)}
                      />
                    }
                    label="Manage Compensation & Salary Setup"
                  />
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
    </DashboardLayout>
  );
}
