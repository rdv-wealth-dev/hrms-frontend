import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import TextInput from "../../../components/input/TextInput";
import { formatToYYYYMMDD } from "../../../utils/format-date";

import { createManualAttendance } from "../../../api/attendance.api";
import { listEmployees } from "../../../api/employee.api";
import type { EmployeeListItem } from "../../../store/employee/employee.types";

const SUCCESS_CLOSE_DELAY_MS = 1200;
const DEFAULT_CHECK_IN_TIME = "09:00";
const DEFAULT_CHECK_OUT_TIME = "18:00";
const EMPLOYEE_PAGE_SIZE = 100;

const manualAttendanceSchema = z
  .object({
    selectedEmployeeId: z.string().min(1, "Please select an employee"),
    attendanceDate: z.string().min(1, "Please enter the attendance date"),
    checkInTime: z.string().min(1, "Please enter the check-in time"),
    checkOutTime: z.string().optional(),
    notes: z.string().trim().min(1, "Please enter a reason / note"),
  })
  .refine(
    (data) => !data.checkOutTime || data.checkOutTime >= data.checkInTime,
    {
      message: "Check-out time cannot be earlier than check-in time",
      path: ["checkOutTime"],
    }
  );

type ManualAttendanceFormData = z.infer<typeof manualAttendanceSchema>;

type PresetEmployee = {
  _id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
};

type ManualAttendanceDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  employee?: PresetEmployee | null;
};



export function ManualAttendanceDialog({
  open,
  onClose,
  onSuccess,
  employee = null,
}: ManualAttendanceDialogProps) {
  const [employeesList, setEmployeesList] = useState<EmployeeListItem[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const todayIsoDate = formatToYYYYMMDD(new Date());

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ManualAttendanceFormData>({
    resolver: zodResolver(manualAttendanceSchema),
    defaultValues: {
      selectedEmployeeId: employee?._id || "",
      attendanceDate: todayIsoDate,
      checkInTime: DEFAULT_CHECK_IN_TIME,
      checkOutTime: DEFAULT_CHECK_OUT_TIME,
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) {
      setApiError(null);
      setSuccessMessage(null);
      setSubmitting(false);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      return;
    }

    setApiError(null);
    setSuccessMessage(null);

    const initialEmployeeId = employee?._id || "";
    reset({
      selectedEmployeeId: initialEmployeeId,
      attendanceDate: todayIsoDate,
      checkInTime: DEFAULT_CHECK_IN_TIME,
      checkOutTime: DEFAULT_CHECK_OUT_TIME,
      notes: "",
    });

    if (!employee) {
      let isMounted = true;
      setLoadingEmployees(true);
      setEmployeesError(null);

      listEmployees(1, EMPLOYEE_PAGE_SIZE)
        .then((res: any) => {
          if (!isMounted) return;
          const items = res?.data || res?.employees || [];
          setEmployeesList(items);
        })
        .catch((err) => {
          if (!isMounted) return;
          const msg = err?.response?.data?.message || "Failed to load employees list";
          setEmployeesError(msg);
        })
        .finally(() => {
          if (isMounted) setLoadingEmployees(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [open, employee, reset, todayIsoDate]);

  useEffect(() => {
    if (employee?._id) {
      setValue("selectedEmployeeId", employee._id, { shouldValidate: true });
    }
  }, [employee, setValue]);

  const onSubmit = async (data: ManualAttendanceFormData) => {
    setSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      await createManualAttendance({
        employeeId: data.selectedEmployeeId,
        attendanceDate: data.attendanceDate,
        checkIn: data.checkInTime ? new Date(`${data.attendanceDate}T${data.checkInTime}`).toISOString() : new Date().toISOString(),
        checkOut: data.checkOutTime ? new Date(`${data.attendanceDate}T${data.checkOutTime}`).toISOString() : undefined,
        notes: data.notes,
      });

      setSuccessMessage("Manual attendance recorded successfully.");
      onSuccess?.();

      closeTimerRef.current = setTimeout(() => {
        onClose();
      }, SUCCESS_CLOSE_DELAY_MS);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const msg = err.response?.data?.message || "Failed to record manual attendance.";
        setApiError(msg);
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableRestoreFocus
      maxWidth="sm"
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
            borderRadius: "20px",
            p: 3,
            backgroundColor: "background.paper",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid",
            borderColor: "divider",
          },
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          p: 0,
          mb: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "text.primary" }}>
          Record Manual Attendance
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          disabled={submitting}
          sx={{
            color: "#64748B",
            borderRadius: "10px",
            "&:hover": { backgroundColor: "action.hover", color: "text.primary" },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {apiError && <Alert severity="error" sx={{ borderRadius: "10px" }}>{apiError}</Alert>}
          {employeesError && <Alert severity="warning" sx={{ borderRadius: "10px" }}>{employeesError}</Alert>}
          {successMessage && <Alert severity="success" sx={{ borderRadius: "10px" }}>{successMessage}</Alert>}

          {/* 1. Employee Field */}
          {employee ? (
            <Box sx={{ p: 2, borderRadius: "12px", backgroundColor: "action.hover", border: "1px solid", borderColor: "divider" }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "text.primary", textTransform: "uppercase", letterSpacing: "0.5px", mb: 0.5 }}>
                Employee Profile
              </Typography>
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "text.primary" }}>
                {employee.firstName} {employee.lastName} ({employee.employeeCode})
              </Typography>
            </Box>
          ) : (
            <Controller
              name="selectedEmployeeId"
              control={control}
              render={({ field: { value, onChange, ref, ...fieldProps } }) => (
                <Box>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#334155",
                      mb: 0.6,
                      display: "block",
                    }}
                  >
                    Select Employee
                  </Typography>
                  <Autocomplete
                    {...fieldProps}
                    size="small"
                    options={employeesList || []}
                    loading={loadingEmployees}
                    getOptionLabel={(option) =>
                      option ? `${option.firstName || ""} ${option.lastName || ""} (${option.employeeCode || ""})` : ""
                    }
                    isOptionEqualToValue={(option, val) => option?._id === val?._id}
                    value={employeesList.find((emp) => emp?._id === value) || null}
                    onChange={(_, newValue) => {
                      onChange(newValue ? newValue._id : "");
                    }}
                    slotProps={{
                      listbox: {
                        sx: {
                          maxHeight: 180,
                        },
                      },
                    }}
                    disabled={loadingEmployees || submitting}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        inputRef={ref}
                        placeholder="Search employee by name or code..."
                        error={Boolean(errors.selectedEmployeeId?.message)}
                        helperText={errors.selectedEmployeeId?.message}
                        slotProps={{
                          ...params.slotProps,
                          input: {
                            ...params.slotProps?.input,
                            endAdornment: (
                              <>
                                {loadingEmployees ? (
                                  <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.slotProps?.input?.endAdornment}
                              </>
                            ),
                          },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            backgroundColor: "#FFFFFF",
                            "& fieldset": { borderColor: "divider" },
                            "&:hover fieldset": { borderColor: "#CBD5E1" },
                            "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: "2px" },
                          },
                          "& .MuiFormHelperText-root": {
                            mx: 0,
                            mt: 0.5,
                          }
                        }}
                      />
                    )}
                  />
                </Box>
              )}
            />
          )}

          {/* 2. Attendance Date */}
          <Controller
            name="attendanceDate"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                type="date"
                label="Attendance Date"
                disabled={submitting}
                error={errors.attendanceDate?.message}
              />
            )}
          />

          {/* 3. Timings Row */}
          <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
            <Box sx={{ flex: 1 }}>
              <Controller
                name="checkInTime"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    type="time"
                    label="Check-In Time"
                    disabled={submitting}
                    error={errors.checkInTime?.message}
                  />
                )}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Controller
                name="checkOutTime"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    type="time"
                    label="Check-Out Time"
                    disabled={submitting}
                    error={errors.checkOutTime?.message}
                  />
                )}
              />
            </Box>
          </Box>

          {/* 4. Notes */}
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                multiline
                rows={3}
                label="Reason / Remark"
                placeholder="e.g. Biometric machine error, manually logged by HR"
                disabled={submitting}
                error={errors.notes?.message}
              />
            )}
          />
        </DialogContent>

        <DialogActions sx={{ p: 0, mt: 3, display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
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
              "&:hover": { backgroundColor: "action.hover", color: "text.primary" },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || (loadingEmployees && !employee)}
            variant="contained"
            sx={{
              height: 42,
              borderRadius: "10px",
              px: 3,
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: "primary.main",
              boxShadow: "0 2px 8px rgba(109, 93, 246, 0.25)",
              "&:hover": { backgroundColor: "primary.dark" },
            }}
          >
            {submitting ? <CircularProgress size={18} color="inherit" /> : "Record Attendance"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default ManualAttendanceDialog;
