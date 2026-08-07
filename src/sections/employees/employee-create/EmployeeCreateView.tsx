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
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import TextInput from "../../../components/input/TextInput";
import { formatToYYYYMMDD } from "../../../utils/format-date";
import { paths } from "../../../routes/paths";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import {
  createEmployeeRequest,
  clearEmployeeError,
  resetEmployeeState,
} from "../../../store/employee";
import { listDepartmentsRequest } from "../../../store/department";
import { listDesignationsRequest } from "../../../store/designation";
import { listBranchesRequest } from "../../../store/branch";
import {
  createEmployeeSchema,
  type CreateEmployeeFormData,
} from "../../../validations/employee/create-employee.schema";
import { listShifts } from "../../../api/attendance.api";
import type { Shift } from "../../../store/attendance";
import { useActiveBranchId } from "../../../hooks/useActiveBranchId";



const EMPLOYEE_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "CONSULTANT", "TEMPORARY", "UNPAID", "FREELANCE"];
const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
];

function EmployeeCreateView() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const branchId = useActiveBranchId();

  const { submitting, success, error } = useSelector(
    (state: RootState) => state.employee
  );

  const departments = useSelector(
    (state: RootState) => state.department?.departments ?? []
  );
  const designations = useSelector(
    (state: RootState) => state.designation?.designations ?? []
  );

  const branches = useSelector(
    (state: RootState) => state.branch?.branches ?? []
  );

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
      branchId: branchId || "",
      departmentId: "",
      designationId: "",
      countryCode: "IN",
      employeeType: "FULL_TIME",
      shiftId: "",
    },
  });

  useEffect(() => {
    if (branches.length === 0) {
      dispatch(listBranchesRequest());
    }
    if (departments.length === 0) {
      dispatch(listDepartmentsRequest());
    }
    if (designations.length === 0) {
      dispatch(listDesignationsRequest({ pageNumber: 1, pageSize: 50 }));
    }
    dispatch(clearEmployeeError());
  }, [dispatch, branches.length, departments.length, designations.length]);

  useEffect(() => {
    if (branchId) {
      setValue("branchId", branchId);
    }
  }, [branchId, setValue]);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await listShifts();
        if (res.succeeded && res.data) {
          setShifts(res.data);
        }
      } catch (err) {
        console.error("Failed to load shifts:", err);
      } finally {
        setShiftsLoading(false);
      }
    };
    fetchShifts();
  }, []);



  const employeeType = watch("employeeType");

  // Sync salary pay type with employee type when salary section is active
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

    payload.branchId = payload.branchId || branchId;

    if (payload.joiningDate) {
      payload.joiningDate = formatToYYYYMMDD(payload.joiningDate);
    }
    if (payload.probationEndDate) {
      payload.probationEndDate = formatToYYYYMMDD(payload.probationEndDate);
    }

    // Clean up: remove empty optionals
    if (!payload.phone) delete payload.phone;
    if (!payload.managerId) delete payload.managerId;
    if (!payload.probationEndDate) delete payload.probationEndDate;
    if (!payload.shiftId) delete payload.shiftId;

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
        lineItems = [{ componentCode: "BASIC", amount: ctcAnnual > 0 ? ctcAnnual : 25000 }];
      }

      payload.salaryStructure = {
        ctcAnnual,
        lineItems,
      };
      delete payload.salarySetup;
    }

    dispatch(createEmployeeRequest(payload));
  };

  const renderSalaryFields = () => {
    const payType = watch("salarySetup.employeePayType") || employeeType;

    switch (payType) {
      case "FULL_TIME":
        return (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Annual CTC"
                type="number"
                placeholder="Enter annual CTC"
                registration={register("salarySetup.structure.amount", { valueAsNumber: true })}
                error={(errors.salarySetup?.structure as any)?.amount?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                select
                label="Currency"
                registration={register("salarySetup.structure.currency")}
              >
                <MenuItem value="INR">INR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
              </TextInput>
            </Grid>
            <Grid size={12}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 1 }}>
                Salary Components
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextInput
                label="Basic"
                type="number"
                placeholder="Enter basic salary"
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
                label="Conveyance"
                type="number"
                placeholder="Enter conveyance"
                registration={register("salarySetup.structure.components.2.amount", { valueAsNumber: true })}
              />
            </Grid>
            <Grid size={12}>
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <FormControlLabel control={<Checkbox {...register("salarySetup.benefits.hasHealthInsurance")} />} label="Health Insurance" />
                <FormControlLabel control={<Checkbox {...register("salarySetup.benefits.hasRetirementPlan")} />} label="Retirement Plan" />
                <FormControlLabel control={<Checkbox {...register("salarySetup.benefits.hasLeaveEncashment")} />} label="Leave Encashment" />
              </Box>
            </Grid>
            {watch("salarySetup.benefits.hasLeaveEncashment") && (
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextInput
                  label="Leave Encashment Rate (₹/day)"
                  type="number"
                  placeholder="Enter rate per day"
                  registration={register("salarySetup.benefits.leaveEncashmentRate", { valueAsNumber: true })}
                />
              </Grid>
            )}
          </>
        );

      case "PART_TIME":
        return (
          <>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextInput
                label="Hourly Rate (₹)"
                type="number"
                required
                registration={register("salarySetup.structure.hourlyRate", { valueAsNumber: true })}
                error={(errors.salarySetup?.structure as any)?.hourlyRate?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextInput
                label="Working Hours/Week"
                type="number"
                registration={register("salarySetup.structure.workingHoursPerWeek", { valueAsNumber: true })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextInput
                label="Working Days/Month"
                type="number"
                registration={register("salarySetup.structure.workingDaysPerMonth", { valueAsNumber: true })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextInput
                select
                label="Currency"
                registration={register("salarySetup.structure.currency")}
              >
                <MenuItem value="INR">INR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
              </TextInput>
            </Grid>
          </>
        );

      case "CONTRACT":
      case "TEMPORARY":
      case "FREELANCE":
        return (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Monthly Amount (₹)"
                type="number"
                required
                registration={register("salarySetup.structure.amount", { valueAsNumber: true })}
                error={(errors.salarySetup?.structure as any)?.amount?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                select
                label="Currency"
                registration={register("salarySetup.structure.currency")}
              >
                <MenuItem value="INR">INR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
              </TextInput>
            </Grid>
          </>
        );

      case "INTERN":
      case "CONSULTANT":
        return (
          <>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextInput
                label={payType === "INTERN" ? "Stipend Amount (₹)" : "Consultant Fee (₹)"}
                type="number"
                required
                registration={register("salarySetup.structure.amount", { valueAsNumber: true })}
                error={(errors.salarySetup?.structure as any)?.amount?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextInput
                select
                label="Frequency"
                registration={register("salarySetup.structure.frequency")}
              >
                <MenuItem value="MONTHLY">Monthly</MenuItem>
                <MenuItem value="WEEKLY">Weekly</MenuItem>
                <MenuItem value="ONE_TIME">One Time</MenuItem>
              </TextInput>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextInput
                select
                label="Currency"
                registration={register("salarySetup.structure.currency")}
              >
                <MenuItem value="INR">INR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
              </TextInput>
            </Grid>
            <Grid size={12}>
              <TextInput
                label="Description (optional)"
                placeholder="e.g. Summer Intern Stipend"
                registration={register("salarySetup.structure.description")}
              />
            </Grid>
          </>
        );

      case "UNPAID":
        return (
          <Grid size={12}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              This employee has no salary (co-founder, volunteer, etc.)
            </Alert>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1000, mx: "auto" }}>
        {/* Page Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 1.5,
            mb: 3,
          }}
        >
          <PersonAddOutlinedIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: "#6D5DF6" }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
              Add New Employee
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create employee profile and initiate setup workflow
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert
            severity="error"
            onClose={() => dispatch(clearEmployeeError())}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}

        {formValidationError && (
          <Alert
            severity="error"
            onClose={() => setFormValidationError(null)}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {formValidationError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit, onInvalidForm)}>
          <Stack spacing={{ xs: 2.5, sm: 3 }}>
            {/* Section 1: Basic Identity & Contact */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9" }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#111827", fontSize: { xs: "1rem", sm: "1.15rem" } }}>
                  Basic Information
                </Typography>
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      label="First Name"
                      placeholder="e.g. Rahul"
                      registration={register("firstName")}
                      error={errors.firstName?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      label="Last Name"
                      placeholder="e.g. Verma"
                      registration={register("lastName")}
                      error={errors.lastName?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      label="Email Address"
                      placeholder="e.g. rahul@example.com"
                      registration={register("email")}
                      error={errors.email?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 8, sm: 4 }}>
                    <TextInput
                      label="Phone Number"
                      placeholder="e.g. 9876543210"
                      maxLength={10}
                      registration={register("phone")}
                      error={errors.phone?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 4, sm: 2 }}>
                    <TextInput
                      select
                      label="Code"
                      registration={register("countryCode")}
                      error={errors.countryCode?.message}
                    >
                      {COUNTRIES.map((c) => (
                        <MenuItem key={c.code} value={c.code}>
                          {c.code}
                        </MenuItem>
                      ))}
                    </TextInput>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Section 2: Employment Details */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9" }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#111827", fontSize: { xs: "1rem", sm: "1.15rem" } }}>
                  Employment &amp; Job Details
                </Typography>
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      select
                      label="Department"
                      value={watch("departmentId") || ""}
                      onChange={(e) => setValue("departmentId", e.target.value, { shouldValidate: true })}
                      error={errors.departmentId?.message}
                      slotProps={{
                        select: {
                          displayEmpty: true,
                          renderValue: (value: unknown) => {
                            const val = value as string;
                            if (!val) return <span style={{ color: "#9CA3AF", fontSize: "13.5px" }}>Select Department</span>;
                            const dept = departments.find((d) => d._id === val);
                            return dept ? `${dept.name} (${dept.code})` : val;
                          }
                        }
                      }}
                    >
                      <MenuItem value="" disabled sx={{ color: "#9CA3AF" }}>
                        Select Department
                      </MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept._id} value={dept._id}>
                          {dept.name} ({dept.code})
                        </MenuItem>
                      ))}
                    </TextInput>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      select
                      label="Designation"
                      value={watch("designationId") || ""}
                      onChange={(e) => setValue("designationId", e.target.value, { shouldValidate: true })}
                      error={errors.designationId?.message}
                      slotProps={{
                        select: {
                          displayEmpty: true,
                          renderValue: (value: unknown) => {
                            const val = value as string;
                            if (!val) return <span style={{ color: "#9CA3AF", fontSize: "13.5px" }}>Select Designation</span>;
                            const desig = designations.find((d) => d._id === val);
                            return desig ? `${desig.name} (${desig.code})` : val;
                          }
                        }
                      }}
                    >
                      <MenuItem value="" disabled sx={{ color: "#9CA3AF" }}>
                        Select Designation
                      </MenuItem>
                      {designations.map((desig) => (
                        <MenuItem key={desig._id} value={desig._id}>
                          {desig.name} ({desig.code})
                        </MenuItem>
                      ))}
                    </TextInput>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      select
                      label="Employee Type"
                      value={watch("employeeType") || "FULL_TIME"}
                      onChange={(e) => setValue("employeeType", e.target.value as any, { shouldValidate: true })}
                      error={errors.employeeType?.message}
                      slotProps={{
                        select: {
                          displayEmpty: true,
                          renderValue: (value: unknown) => {
                            const val = value as string;
                            if (!val) return <span style={{ color: "#9CA3AF", fontSize: "13.5px" }}>Select Type</span>;
                            return val.replace(/_/g, " ");
                          }
                        }
                      }}
                    >
                      {EMPLOYEE_TYPES.map((et) => (
                        <MenuItem key={et} value={et}>{et.replace(/_/g, " ")}</MenuItem>
                      ))}
                    </TextInput>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      label="Joining Date"
                      type="date"
                      placeholder="YYYY-MM-DD"
                      registration={register("joiningDate")}
                      error={errors.joiningDate?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextInput
                      label="Probation End Date (optional)"
                      type="date"
                      placeholder="YYYY-MM-DD"
                      registration={register("probationEndDate")}
                      error={errors.probationEndDate?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      label="Manager ID (optional)"
                      placeholder="Enter manager employee ID"
                      registration={register("managerId")}
                      error={errors.managerId?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      select
                      label="Shift Selection"
                      disabled={shiftsLoading}
                      value={watch("shiftId") || ""}
                      onChange={(e) => setValue("shiftId", e.target.value, { shouldValidate: true })}
                      error={errors.shiftId?.message || (shiftsLoading ? "Loading shifts..." : undefined)}
                      slotProps={{
                        select: {
                          displayEmpty: true,
                          renderValue: (value: unknown) => {
                            const val = value as string;
                            if (!val) return <span style={{ color: "#9CA3AF", fontSize: "13.5px" }}>Select Shift</span>;
                            const shift = shifts.find((s) => s._id === val);
                            if (!shift) return val;
                            return `${shift.name} (${shift.startTime} - ${shift.endTime})${shift.isDefault ? " (Default)" : ""}`;
                          }
                        }
                      }}
                    >
                      <MenuItem value="" disabled sx={{ color: "#9CA3AF" }}>
                        Select Shift
                      </MenuItem>
                      {shifts.map((shift) => (
                        <MenuItem key={shift._id} value={shift._id}>
                          {shift.name} ({shift.startTime} - {shift.endTime}){shift.isDefault ? " (Default)" : ""}
                        </MenuItem>
                      ))}
                    </TextInput>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Section 5: Salary Setup */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9" }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827", fontSize: { xs: "1rem", sm: "1.15rem" } }}>
                    Salary Setup {manageSalary ? "" : "(optional)"}
                  </Typography>
                  {!manageSalary && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setManageSalary(true)}
                      sx={{ textTransform: "none", borderRadius: 2, borderColor: "#D1D5DB", color: "#374151" }}
                    >
                      Add Salary
                    </Button>
                  )}
                </Box>
                {manageSalary && (
                  <>
                    <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextInput
                          select
                          label="Employee Pay Type"
                          value={watch("salarySetup.employeePayType") || employeeType}
                          onChange={(e) => {
                            const val = e.target.value;
                            setValue("salarySetup.employeePayType", val as any);
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
                            setValue("salarySetup.structure.type", typeMap[val] || "");
                          }}
                        >
                          {EMPLOYEE_TYPES.map((et) => (
                            <MenuItem key={et} value={et}>{et.replace(/_/g, " ")}</MenuItem>
                          ))}
                        </TextInput>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextInput
                          label="Effective From (optional)"
                          type="date"
                          placeholder="YYYY-MM-DD"
                          registration={register("salarySetup.effectiveFrom")}
                        />
                      </Grid>
                      {renderSalaryFields()}
                    </Grid>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                      <Button
                        size="small"
                        color="error"
                        variant="text"
                        onClick={() => setManageSalary(false)}
                        sx={{ textTransform: "none" }}
                      >
                        Remove Salary Setup
                      </Button>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Submit Actions */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column-reverse", sm: "row" },
                gap: 1.5,
                justifyContent: "flex-end",
                pt: 1,
              }}
            >
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate(paths.employees.directory)}
                disabled={submitting}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 600,
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  borderRadius: 2,
                  px: 5,
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 600,
                  backgroundColor: "#6D5DF6",
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": { backgroundColor: "#5B4BEA" },
                }}
              >
                {submitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Create Employee"
                )}
              </Button>
            </Box>
          </Stack>
        </form>
      </Box>
    </DashboardLayout>
  );
}

export default EmployeeCreateView;
