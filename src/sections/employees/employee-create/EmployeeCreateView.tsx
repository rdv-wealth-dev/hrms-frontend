import { useEffect } from "react";
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

  useEffect(() => {
    if (departments.length === 0) {
      dispatch(listDepartmentsRequest());
    }
    if (designations.length === 0) {
      dispatch(listDesignationsRequest({ pageNumber: 1, pageSize: 50 }));
    }
    dispatch(clearEmployeeError());
  }, [dispatch, departments.length, designations.length]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      branchId: branchId,
      countryCode: "IN",
      employeeType: "FULL_TIME",
      currentAddress: {
        countryCode: "IN",
      },
      emergencyContacts: [
        {
          name: "",
          relationship: "",
          phone: "",
        },
      ],
    },
  });

  // Make sure branchId is sync'ed with loaded user profile
  useEffect(() => {
    if (branchId) {
      setValue("branchId", branchId);
    }
  }, [branchId, setValue]);

  // Handle successful create redirect
  useEffect(() => {
    if (success) {
      dispatch(resetEmployeeState());
      navigate(paths.employees.directory);
    }
  }, [success, navigate, dispatch]);

  const onSubmit = (data: CreateEmployeeFormData) => {
    dispatch(createEmployeeRequest(data));
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

        {/* Error Alert */}
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      label="Phone Number"
                      placeholder="e.g. 9876543210"
                      registration={register("phone")}
                      error={errors.phone?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      label="Date of Birth"
                      type="date"
                      placeholder="YYYY-MM-DD"
                      registration={register("dateOfBirth")}
                      error={errors.dateOfBirth?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}
                      >
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
                        <MenuItem value="MALE">Male</MenuItem>
                        <MenuItem value="FEMALE">Female</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                      </TextField>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      label="Blood Group"
                      placeholder="e.g. O+"
                      registration={register("bloodGroup")}
                      error={errors.bloodGroup?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}
                      >
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
                        <MenuItem value="SINGLE">Single</MenuItem>
                        <MenuItem value="MARRIED">Married</MenuItem>
                        <MenuItem value="DIVORCED">Divorced</MenuItem>
                        <MenuItem value="WIDOWED">Widowed</MenuItem>
                      </TextField>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      label="Nationality"
                      placeholder="e.g. Indian"
                      registration={register("nationality")}
                      error={errors.nationality?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      label="PAN"
                      placeholder="e.g. ABCDE1234F"
                      registration={register("pan")}
                      error={errors.pan?.message}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Section 2: Job Details */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#111827" }}>
                  Employment & Job Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}
                      >
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
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}
                      >
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}
                      >
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
                              return val.replace("_", " ");
                            }
                          }
                        }}
                        {...register("employeeType")}
                        error={!!errors.employeeType}
                        helperText={errors.employeeType?.message}
                        sx={selectFieldSx}
                      >
                        <MenuItem value="FULL_TIME">Full Time</MenuItem>
                        <MenuItem value="PART_TIME">Part Time</MenuItem>
                        <MenuItem value="CONTRACT">Contract</MenuItem>
                        <MenuItem value="INTERN">Intern</MenuItem>
                      </TextField>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextInput
                      label="Joining Date"
                      type="date"
                      placeholder="YYYY-MM-DD"
                      registration={register("joiningDate")}
                      error={errors.joiningDate?.message}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Section 3: Current Address */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#111827" }}>
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
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextInput
                      label="Zip Code"
                      placeholder="e.g. 400001"
                      registration={register("currentAddress.zip")}
                      error={errors.currentAddress?.zip?.message}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Section 4: Emergency Contacts */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#111827" }}>
                  Emergency Contact
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextInput
                      label="Contact Name"
                      placeholder="e.g. Priya Verma"
                      registration={register("emergencyContacts.0.name")}
                      error={errors.emergencyContacts?.[0]?.name?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextInput
                      label="Relationship"
                      placeholder="e.g. Sister"
                      registration={register("emergencyContacts.0.relationship")}
                      error={errors.emergencyContacts?.[0]?.relationship?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextInput
                      label="Contact Phone"
                      placeholder="e.g. 9988776655"
                      registration={register("emergencyContacts.0.phone")}
                      error={errors.emergencyContacts?.[0]?.phone?.message}
                    />
                  </Grid>
                </Grid>
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
