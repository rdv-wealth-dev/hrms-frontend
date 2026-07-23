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
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import TextInput from "../../../components/input/TextInput";
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
import {
  createEmployeeSchema,
  type CreateEmployeeFormData,
} from "../../../validations/employee/create-employee.schema";
import { listShifts } from "../../../api/attendance.api";
import type { Shift } from "../../../store/attendance";



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

  const user = useSelector((state: RootState) => state.auth?.user);
  const branchId = user?.branchIds?.[0] ?? "";

  const { submitting, success, error } = useSelector(
    (state: RootState) => state.employee
  );

  const departments = useSelector(
    (state: RootState) => state.department?.departments ?? []
  );
  const designations = useSelector(
    (state: RootState) => state.designation?.designations ?? []
  );

  const [manageSalary, setManageSalary] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(true);

  useEffect(() => {
    if (departments.length === 0) {
      dispatch(listDepartmentsRequest());
    }
    if (designations.length === 0) {
      dispatch(listDesignationsRequest({ pageNumber: 1, pageSize: 50 }));
    }
    dispatch(clearEmployeeError());
  }, [dispatch, departments.length, designations.length]);

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
    if (branchId) {
      setValue("branchId", branchId);
    }
  }, [branchId, setValue]);

  useEffect(() => {
    if (success) {
      dispatch(resetEmployeeState());
      navigate(paths.employees.directory);
    }
  }, [success, navigate, dispatch]);

function formatToYYYYMMDD(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  const str = dateStr.trim();
  if (!str) return undefined;

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  if (str.includes("/") || str.includes("-")) {
    const parts = str.split(/[/|-]/);
    if (parts.length === 3) {
      let year: string, month: string, day: string;
      if (parts[0].length === 4) {
        [year, month, day] = parts;
      } else if (parts[2].length === 4) {
        year = parts[2];
        if (parseInt(parts[0], 10) > 12) {
          day = parts[0];
          month = parts[1];
        } else if (parseInt(parts[1], 10) > 12) {
          month = parts[0];
          day = parts[1];
        } else {
          month = parts[0];
          day = parts[1];
        }
      } else {
        return str;
      }
      const pad = (num: string) => num.padStart(2, "0");
      return `${year}-${pad(month)}-${pad(day)}`;
    }
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }

  return str;
}

  const onSubmit = (data: CreateEmployeeFormData) => {
    const payload: any = { ...data };

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
      const ctcAnnual = payload.salaryStructure?.ctcAnnual || payload.salarySetup?.structure?.amount || 0;
      const components = payload.salarySetup?.structure?.components || payload.salaryStructure?.lineItems || [];
      const lineItems = components.length > 0
        ? components.map((c: any) => ({
            componentCode: c.componentCode || "BASIC",
            amount: Number(c.amount || 0),
            isPartOfWages: Boolean(c.isPartOfWages),
          }))
        : [{ componentCode: "BASIC", amount: Number(ctcAnnual), isPartOfWages: true }];

      payload.salaryStructure = {
        ctcAnnual: Number(ctcAnnual),
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
              <TextField
                label="Annual CTC"
                type="number"
                fullWidth
                {...register("salarySetup.structure.amount", { valueAsNumber: true })}
                error={!!(errors.salarySetup?.structure as any)?.amount}
                helperText={(errors.salarySetup?.structure as any)?.amount?.message}

              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Currency"
                fullWidth
                defaultValue="INR"
                {...register("salarySetup.structure.currency")}

              >
                <MenuItem value="INR">INR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
              </TextField>
            </Grid>
            <Grid size={12}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 1 }}>
                Salary Components
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Basic"
                type="number"
                fullWidth
                {...register("salarySetup.structure.components.0.amount", { valueAsNumber: true })}

              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="HRA"
                type="number"
                fullWidth
                {...register("salarySetup.structure.components.1.amount", { valueAsNumber: true })}

              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Conveyance"
                type="number"
                fullWidth
                {...register("salarySetup.structure.components.2.amount", { valueAsNumber: true })}

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
                <TextField
                  label="Leave Encashment Rate (₹/day)"
                  type="number"
                  fullWidth
                  {...register("salarySetup.benefits.leaveEncashmentRate", { valueAsNumber: true })}
  
                />
              </Grid>
            )}
          </>
        );

      case "PART_TIME":
        return (
          <>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Hourly Rate (₹)"
                type="number"
                fullWidth
                required
                {...register("salarySetup.structure.hourlyRate", { valueAsNumber: true })}
                error={!!(errors.salarySetup?.structure as any)?.hourlyRate}
                helperText={(errors.salarySetup?.structure as any)?.hourlyRate?.message}

              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Working Hours/Week"
                type="number"
                fullWidth
                defaultValue={40}
                {...register("salarySetup.structure.workingHoursPerWeek", { valueAsNumber: true })}

              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Working Days/Month"
                type="number"
                fullWidth
                defaultValue={22}
                {...register("salarySetup.structure.workingDaysPerMonth", { valueAsNumber: true })}

              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                label="Currency"
                fullWidth
                defaultValue="INR"
                {...register("salarySetup.structure.currency")}

              >
                <MenuItem value="INR">INR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
              </TextField>
            </Grid>
          </>
        );

      case "CONTRACT":
      case "TEMPORARY":
      case "FREELANCE":
        return (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Monthly Amount (₹)"
                type="number"
                fullWidth
                required
                {...register("salarySetup.structure.amount", { valueAsNumber: true })}
                error={!!(errors.salarySetup?.structure as any)?.amount}
                helperText={(errors.salarySetup?.structure as any)?.amount?.message}

              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Currency"
                fullWidth
                defaultValue="INR"
                {...register("salarySetup.structure.currency")}

              >
                <MenuItem value="INR">INR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
              </TextField>
            </Grid>
          </>
        );

      case "INTERN":
      case "CONSULTANT":
        return (
          <>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label={payType === "INTERN" ? "Stipend Amount (₹)" : "Consultant Fee (₹)"}
                type="number"
                fullWidth
                required
                {...register("salarySetup.structure.amount", { valueAsNumber: true })}
                error={!!(errors.salarySetup?.structure as any)?.amount}
                helperText={(errors.salarySetup?.structure as any)?.amount?.message}

              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                label="Frequency"
                fullWidth
                defaultValue="MONTHLY"
                {...register("salarySetup.structure.frequency")}

              >
                <MenuItem value="MONTHLY">Monthly</MenuItem>
                <MenuItem value="WEEKLY">Weekly</MenuItem>
                <MenuItem value="ONE_TIME">One Time</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                label="Currency"
                fullWidth
                defaultValue="INR"
                {...register("salarySetup.structure.currency")}

              >
                <MenuItem value="INR">INR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
              </TextField>
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
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: "auto" }}>
        {/* Page Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <PersonAddOutlinedIcon sx={{ fontSize: 32, color: "#6D5DF6" }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
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
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* Section 1: Basic Identity & Contact */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#111827" }}>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
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
                      registration={register("phone")}
                      error={errors.phone?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 4, sm: 2 }}>
                    <TextField
                      select
                      label="Code"
                      fullWidth
                      defaultValue="IN"
                      {...register("countryCode")}
                      error={!!errors.countryCode}
                      helperText={errors.countryCode?.message}
      
                    >
                      {COUNTRIES.map((c) => (
                        <MenuItem key={c.code} value={c.code}>{c.code}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Section 2: Employment Details */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#111827" }}>
                  Employment &amp; Job Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="Department"
                      value={watch("departmentId") || ""}
                      slotProps={{
                        select: {
                          displayEmpty: true,
                          renderValue: (value: unknown) => {
                            const val = value as string;
                            if (!val) return <span style={{ color: "#9CA3AF", fontSize: "13px" }}>Select Department</span>;
                            const dept = departments.find((d) => d._id === val);
                            return dept ? `${dept.name} (${dept.code})` : val;
                          }
                        }
                      }}
                      {...register("departmentId")}
                      error={!!errors.departmentId}
                      helperText={errors.departmentId?.message}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept._id} value={dept._id}>
                          {dept.name} ({dept.code})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="Designation"
                      value={watch("designationId") || ""}
                      slotProps={{
                        select: {
                          displayEmpty: true,
                          renderValue: (value: unknown) => {
                            const val = value as string;
                            if (!val) return <span style={{ color: "#9CA3AF", fontSize: "13px" }}>Select Designation</span>;
                            const desig = designations.find((d) => d._id === val);
                            return desig ? `${desig.name} (${desig.code})` : val;
                          }
                        }
                      }}
                      {...register("designationId")}
                      error={!!errors.designationId}
                      helperText={errors.designationId?.message}
                    >
                      {designations.map((desig) => (
                        <MenuItem key={desig._id} value={desig._id}>
                          {desig.name} ({desig.code})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      select
                      fullWidth
                      label="Employee Type"
                      value={watch("employeeType") || "FULL_TIME"}
                      slotProps={{
                        select: {
                          displayEmpty: true,
                          renderValue: (value: unknown) => {
                            const val = value as string;
                            if (!val) return <span style={{ color: "#9CA3AF", fontSize: "13px" }}>Select Type</span>;
                            return val.replace(/_/g, " ");
                          }
                        }
                      }}
                      {...register("employeeType")}
                      error={!!errors.employeeType}
                      helperText={errors.employeeType?.message}
                    >
                      {EMPLOYEE_TYPES.map((et) => (
                        <MenuItem key={et} value={et}>{et.replace(/_/g, " ")}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextInput
                      label="Joining Date"
                      type="date"
                      placeholder="YYYY-MM-DD"
                      registration={register("joiningDate")}
                      error={errors.joiningDate?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
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
                    <TextField
                      select
                      fullWidth
                      label="Shift Selection"
                      value={watch("shiftId") || ""}
                      slotProps={{
                        select: {
                          displayEmpty: true,
                          renderValue: (value: unknown) => {
                            const val = value as string;
                            if (!val) return <span style={{ color: "#9CA3AF", fontSize: "13px" }}>Select Shift</span>;
                            const shift = shifts.find((s) => s._id === val);
                            if (!shift) return val;
                            return `${shift.name} (${shift.startTime} - ${shift.endTime})${shift.isDefault ? " (Default)" : ""}`;
                          }
                        }
                      }}
                      {...register("shiftId")}
                      error={!!errors.shiftId}
                      helperText={errors.shiftId?.message || (shiftsLoading ? "Loading shifts..." : "")}
                      disabled={shiftsLoading}
                    >
                        <MenuItem value="">
                          <span style={{ color: "#9CA3AF" }}>Select Shift</span>
                        </MenuItem>
                        {shifts.map((shift) => (
                          <MenuItem 
                            key={shift._id} 
                            value={shift._id}
                            sx={{ 
                              display: "flex", 
                              justifyContent: "space-between", 
                              alignItems: "center",
                              py: 1
                            }}
                          >
                            <Box sx={{ display: "flex", flexDirection: "column" }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#111827" }}>
                                {shift.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {shift.startTime} - {shift.endTime}
                              </Typography>
                            </Box>
                            {shift.isDefault && (
                              <Box
                                sx={{
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                  fontSize: "10px",
                                  fontWeight: 600,
                                  backgroundColor: "rgba(109, 93, 246, 0.08)",
                                  color: "#6D5DF6",
                                  border: "1px solid rgba(109, 93, 246, 0.2)",
                                }}
                              >
                                Default
                              </Box>
                            )}
                          </MenuItem>
                        ))}
                      </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Section 5: Salary Setup */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827" }}>
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
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                            Employee Pay Type
                          </Typography>
                          <TextField
                            select
                            fullWidth
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
                          </TextField>
                        </Box>
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
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", pt: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate(paths.employees.directory)}
                disabled={submitting}
                sx={{ borderRadius: 2, px: 4, py: 1.2, textTransform: "none" }}
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
                  backgroundColor: "#6D5DF6",
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
