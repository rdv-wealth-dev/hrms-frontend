import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
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
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip from "@mui/material/Tooltip";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
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

const selectFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#FFFFFF",
    height: "52px",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#BFC5D2",
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#D1D5DB",
    borderWidth: "1px",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#6D5DF6",
    borderWidth: "2px",
  },
  "& .MuiInputBase-input": {
    fontSize: "15px",
    color: "#111827",
  },
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const GENDERS = ["MALE", "FEMALE", "OTHER"];
const MARITAL_STATUSES = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"];
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
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      branchId,
      countryCode: "IN",
      employeeType: "FULL_TIME",
      currentAddress: { countryCode: "IN" },
      permanentAddress: { countryCode: "IN" },
      emergencyContacts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "emergencyContacts",
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

  const onSubmit = (data: CreateEmployeeFormData) => {
    const payload: any = { ...data };

    // Clean up: remove empty optionals
    if (!payload.phone) delete payload.phone;
    if (!payload.dateOfBirth) delete payload.dateOfBirth;
    if (!payload.gender) delete payload.gender;
    if (!payload.bloodGroup) delete payload.bloodGroup;
    if (!payload.maritalStatus) delete payload.maritalStatus;
    if (!payload.nationality) delete payload.nationality;
    if (!payload.pan) delete payload.pan;
    if (!payload.aadhaar) delete payload.aadhaar;
    if (!payload.managerId) delete payload.managerId;
    if (!payload.probationEndDate) delete payload.probationEndDate;
    if (!payload.shiftId) delete payload.shiftId;

    const isCurAddrEmpty = !payload.currentAddress?.addressLine1 && !payload.currentAddress?.city;
    if (isCurAddrEmpty) delete payload.currentAddress;
    const isPermAddrEmpty = !payload.permanentAddress?.addressLine1 && !payload.permanentAddress?.city;
    if (isPermAddrEmpty) delete payload.permanentAddress;

    if (!payload.emergencyContacts || payload.emergencyContacts.length === 0) {
      delete payload.emergencyContacts;
    } else {
      payload.emergencyContacts = payload.emergencyContacts.map((c: any) => {
        if (!c.email) delete c.email;
        return c;
      });
    }

    if (!manageSalary || !payload.salarySetup) {
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
                sx={selectFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Currency"
                fullWidth
                defaultValue="INR"
                {...register("salarySetup.structure.currency")}
                sx={selectFieldSx}
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
                sx={selectFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="HRA"
                type="number"
                fullWidth
                {...register("salarySetup.structure.components.1.amount", { valueAsNumber: true })}
                sx={selectFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Conveyance"
                type="number"
                fullWidth
                {...register("salarySetup.structure.components.2.amount", { valueAsNumber: true })}
                sx={selectFieldSx}
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
                  sx={selectFieldSx}
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
                sx={selectFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Working Hours/Week"
                type="number"
                fullWidth
                defaultValue={40}
                {...register("salarySetup.structure.workingHoursPerWeek", { valueAsNumber: true })}
                sx={selectFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Working Days/Month"
                type="number"
                fullWidth
                defaultValue={22}
                {...register("salarySetup.structure.workingDaysPerMonth", { valueAsNumber: true })}
                sx={selectFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                label="Currency"
                fullWidth
                defaultValue="INR"
                {...register("salarySetup.structure.currency")}
                sx={selectFieldSx}
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
                sx={selectFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Currency"
                fullWidth
                defaultValue="INR"
                {...register("salarySetup.structure.currency")}
                sx={selectFieldSx}
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
                sx={selectFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                label="Frequency"
                fullWidth
                defaultValue="MONTHLY"
                {...register("salarySetup.structure.frequency")}
                sx={selectFieldSx}
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
                sx={selectFieldSx}
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
            {/* Section 1: Personal Details */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#111827" }}>
                  Personal Details
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
                      sx={selectFieldSx}
                    >
                      {COUNTRIES.map((c) => (
                        <MenuItem key={c.code} value={c.code}>{c.code}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextInput
                      label="Date of Birth"
                      type="date"
                      placeholder="YYYY-MM-DD"
                      registration={register("dateOfBirth")}
                      error={errors.dateOfBirth?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                        Gender
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        slotProps={{
                          select: {
                            displayEmpty: true,
                            renderValue: (value: unknown) => {
                              if (!value) return <span style={{ color: "#9CA3AF", fontSize: "13px" }}>Select Gender</span>;
                              return value === "MALE" ? "Male" : value === "FEMALE" ? "Female" : "Other";
                            }
                          }
                        }}
                        {...register("gender")}
                        error={!!errors.gender}
                        helperText={errors.gender?.message}
                        sx={selectFieldSx}
                      >
                        {GENDERS.map((g) => (
                          <MenuItem key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                        Blood Group
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        slotProps={{
                          select: {
                            displayEmpty: true,
                            renderValue: (value: unknown) => {
                              if (!value) return <span style={{ color: "#9CA3AF", fontSize: "13px" }}>Select Blood Group</span>;
                              return value as string;
                            }
                          }
                        }}
                        {...register("bloodGroup")}
                        error={!!errors.bloodGroup}
                        helperText={errors.bloodGroup?.message}
                        sx={selectFieldSx}
                      >
                        {BLOOD_GROUPS.map((bg) => (
                          <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                        Marital Status
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        slotProps={{
                          select: {
                            displayEmpty: true,
                            renderValue: (value: unknown) => {
                              const val = value as string;
                              if (!val) return <span style={{ color: "#9CA3AF", fontSize: "13px" }}>Select Status</span>;
                              return val.charAt(0) + val.slice(1).toLowerCase();
                            }
                          }
                        }}
                        {...register("maritalStatus")}
                        error={!!errors.maritalStatus}
                        helperText={errors.maritalStatus?.message}
                        sx={selectFieldSx}
                      >
                        {MARITAL_STATUSES.map((ms) => (
                          <MenuItem key={ms} value={ms}>{ms.charAt(0) + ms.slice(1).toLowerCase()}</MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextInput
                      label="Nationality"
                      placeholder="e.g. Indian"
                      registration={register("nationality")}
                      error={errors.nationality?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextInput
                      label="PAN"
                      placeholder="e.g. ABCDE1234F"
                      registration={register("pan")}
                      error={errors.pan?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextInput
                      label="Aadhaar"
                      placeholder="e.g. 123456789012"
                      registration={register("aadhaar")}
                      error={errors.aadhaar?.message}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Section 2: Employment Details */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#111827" }}>
                  Employment & Job Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                        Department
                      </Typography>
                      <TextField
                        select
                        fullWidth
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
                        sx={selectFieldSx}
                      >
                        {departments.map((dept) => (
                          <MenuItem key={dept._id} value={dept._id}>
                            {dept.name} ({dept.code})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                        Designation
                      </Typography>
                      <TextField
                        select
                        fullWidth
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
                        sx={selectFieldSx}
                      >
                        {designations.map((desig) => (
                          <MenuItem key={desig._id} value={desig._id}>
                            {desig.name} ({desig.code})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                        Employee Type
                      </Typography>
                      <TextField
                        select
                        fullWidth
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
                        sx={selectFieldSx}
                      >
                        {EMPLOYEE_TYPES.map((et) => (
                          <MenuItem key={et} value={et}>{et.replace(/_/g, " ")}</MenuItem>
                        ))}
                      </TextField>
                    </Box>
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
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                        Shift Selection
                      </Typography>
                      <TextField
                        select
                        fullWidth
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
                        sx={selectFieldSx}
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
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Section 3: Address */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#111827" }}>
                  Address (optional)
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1.5, color: "#374151" }}>
                      Current Address
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={12}>
                        <TextInput
                          label="Address Line 1"
                          placeholder="e.g. 123 MG Road"
                          registration={register("currentAddress.addressLine1")}
                          error={errors.currentAddress?.addressLine1?.message}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextInput
                          label="City"
                          placeholder="e.g. Mumbai"
                          registration={register("currentAddress.city")}
                          error={errors.currentAddress?.city?.message}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextInput
                          label="State"
                          placeholder="e.g. Maharashtra"
                          registration={register("currentAddress.state")}
                          error={errors.currentAddress?.state?.message}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <TextField
                          select
                          label="Country"
                          fullWidth
                          defaultValue="IN"
                          {...register("currentAddress.countryCode")}
                          sx={selectFieldSx}
                        >
                          {COUNTRIES.map((c) => (
                            <MenuItem key={c.code} value={c.code}>{c.code}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <TextInput
                          label="Zip"
                          placeholder="e.g. 400001"
                          registration={register("currentAddress.zip")}
                          error={errors.currentAddress?.zip?.message}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1.5, color: "#374151" }}>
                      Permanent Address
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={12}>
                        <TextInput
                          label="Address Line 1"
                          placeholder="e.g. 456 Main Street"
                          registration={register("permanentAddress.addressLine1")}
                          error={errors.permanentAddress?.addressLine1?.message}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextInput
                          label="City"
                          placeholder="e.g. Pune"
                          registration={register("permanentAddress.city")}
                          error={errors.permanentAddress?.city?.message}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextInput
                          label="State"
                          placeholder="e.g. Maharashtra"
                          registration={register("permanentAddress.state")}
                          error={errors.permanentAddress?.state?.message}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <TextField
                          select
                          label="Country"
                          fullWidth
                          defaultValue="IN"
                          {...register("permanentAddress.countryCode")}
                          sx={selectFieldSx}
                        >
                          {COUNTRIES.map((c) => (
                            <MenuItem key={c.code} value={c.code}>{c.code}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <TextInput
                          label="Zip"
                          placeholder="e.g. 411001"
                          registration={register("permanentAddress.zip")}
                          error={errors.permanentAddress?.zip?.message}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Section 4: Emergency Contacts */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827" }}>
                    Emergency Contacts (optional)
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<AddCircleOutlineOutlinedIcon />}
                    onClick={() => append({ name: "", relationship: "", phone: "" })}
                    sx={{ textTransform: "none", color: "#6D5DF6", fontWeight: 600 }}
                  >
                    Add Contact
                  </Button>
                </Box>
                {fields.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                    No emergency contacts added. Click "Add Contact" to add one.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {fields.map((field, index) => (
                      <Box key={field.id}>
                        <Grid container spacing={2} sx={{ alignItems: "center" }}>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <TextInput
                              label="Contact Name"
                              placeholder="e.g. Priya Verma"
                              registration={register(`emergencyContacts.${index}.name`)}
                              error={errors.emergencyContacts?.[index]?.name?.message}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <TextInput
                              label="Relationship"
                              placeholder="e.g. Sister"
                              registration={register(`emergencyContacts.${index}.relationship`)}
                              error={errors.emergencyContacts?.[index]?.relationship?.message}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <TextInput
                              label="Contact Phone"
                              placeholder="e.g. 9988776655"
                              registration={register(`emergencyContacts.${index}.phone`)}
                              error={errors.emergencyContacts?.[index]?.phone?.message}
                            />
                          </Grid>
                          <Grid size={{ xs: 10, sm: 2 }}>
                            <TextInput
                              label="Email (optional)"
                              placeholder="e.g. priya@example.com"
                              registration={register(`emergencyContacts.${index}.email`)}
                              error={errors.emergencyContacts?.[index]?.email?.message}
                            />
                          </Grid>
                          <Grid size={{ xs: 2, sm: 1 }} sx={{ display: "flex", justifyContent: "center" }}>
                            <Tooltip title="Remove contact">
                              <IconButton onClick={() => remove(index)} color="error" size="small">
                                <RemoveCircleOutlineOutlinedIcon />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                        </Grid>
                        {index < fields.length - 1 && <Divider sx={{ mt: 2 }} />}
                      </Box>
                    ))}
                  </Stack>
                )}
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
                            sx={selectFieldSx}
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
