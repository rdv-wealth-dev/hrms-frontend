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
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";

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

const inputFieldSx = {
  "& .MuiOutlinedInput-root": {
    height: 44,
    borderRadius: "12px",
    backgroundColor: "#F8FAFC",
    fontSize: "14px",
    color: "#0F172A",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused": {
      backgroundColor: "#FFFFFF",
      "& fieldset": { borderColor: "#6D5DF6", borderWidth: "2px" },
    },
  },
  "& .MuiOutlinedInput-input": {
    height: 44,
    py: 0,
    px: "14px",
    fontSize: "14px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#475569",
    opacity: 1,
    fontSize: "13.5px",
    fontWeight: 500,
  },
  "& .MuiSelect-select": {
    height: "44px !important",
    minHeight: "44px !important",
    py: "0 !important",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
  },
};

const multilineSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#F8FAFC",
    fontSize: "14px",
    color: "#0F172A",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused": {
      backgroundColor: "#FFFFFF",
      "& fieldset": { borderColor: "#6D5DF6", borderWidth: "2px" },
    },
  },
  "& .MuiOutlinedInput-input": {
    py: "10px",
    px: "14px",
    fontSize: "14px",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#475569",
    opacity: 1,
    fontSize: "13.5px",
    fontWeight: 500,
  },
};

const disabledMenuItemSx = {
  color: "#334155 !important",
  fontWeight: 600,
  "&.Mui-disabled": {
    opacity: "1 !important",
    color: "#334155 !important",
  },
};

const combineDateAndTime = (datePart: string, timePart: string, fieldLabel: string): Date => {
  const combined = new Date(`${datePart}T${timePart}:00`);
  if (Number.isNaN(combined.getTime())) {
    throw new Error(`Invalid ${fieldLabel} time format`);
  }
  return combined;
};

export default function ManualAttendanceDialog({
  open,
  onClose,
  onSuccess,
  employee,
}: ManualAttendanceDialogProps) {
  const [employeesList, setEmployeesList] = useState<EmployeeListItem[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeesError, setEmployeesError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManualAttendanceFormData>({
    resolver: zodResolver(manualAttendanceSchema),
    defaultValues: {
      selectedEmployeeId: employee?._id ?? "",
      attendanceDate: new Date().toISOString().substring(0, 10),
      checkInTime: DEFAULT_CHECK_IN_TIME,
      checkOutTime: DEFAULT_CHECK_OUT_TIME,
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setApiError(null);
      setSuccessMessage(null);
      return;
    }

    const todayStr = new Date().toISOString().substring(0, 10);
    reset({
      selectedEmployeeId: employee?._id ?? "",
      attendanceDate: todayStr,
      checkInTime: DEFAULT_CHECK_IN_TIME,
      checkOutTime: DEFAULT_CHECK_OUT_TIME,
      notes: "",
    });

    if (employee?._id) return;

    let isMounted = true;
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      setEmployeesError(null);
      try {
        const response = await listEmployees(1, EMPLOYEE_PAGE_SIZE, "", "ACTIVE");
        if (!isMounted) return;
        setEmployeesList(response.data ?? []);
      } catch (err: unknown) {
        if (!isMounted) return;
        const message = isAxiosError<{ message?: string }>(err)
          ? err.response?.data?.message ?? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load employees";
        setEmployeesError(message);
      } finally {
        if (isMounted) setLoadingEmployees(false);
      }
    };

    fetchEmployees();

    return () => {
      isMounted = false;
    };
  }, [open, employee, reset]);

  const onSubmit = async (data: ManualAttendanceFormData) => {
    setSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const checkInDateObj = combineDateAndTime(
        data.attendanceDate,
        data.checkInTime,
        "Check-In"
      );

      let checkOutDateObj: Date | undefined;
      if (data.checkOutTime) {
        checkOutDateObj = combineDateAndTime(
          data.attendanceDate,
          data.checkOutTime,
          "Check-Out"
        );
      }

      await createManualAttendance({
        employeeId: data.selectedEmployeeId,
        attendanceDate: data.attendanceDate,
        checkIn: checkInDateObj.toISOString(),
        checkOut: checkOutDateObj ? checkOutDateObj.toISOString() : undefined,
        notes: data.notes,
      });

      setSuccessMessage("Manual attendance recorded successfully!");

      closeTimeoutRef.current = setTimeout(() => {
        onSuccess?.();
        onClose();
      }, SUCCESS_CLOSE_DELAY_MS);
    } catch (err: unknown) {
      const message = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message ?? err.message
        : err instanceof Error
          ? err.message
          : "Failed to record manual attendance";
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
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
            backgroundColor: "#FFFFFF",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid #E2E8F0",
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
        <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#0F172A" }}>
          Record Manual Attendance
        </Typography>
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
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: 0, pr: 2, mr: -1, display: "flex", flexDirection: "column", gap: 2 }}>
          {apiError && <Alert severity="error" sx={{ borderRadius: "10px" }}>{apiError}</Alert>}
          {employeesError && <Alert severity="warning" sx={{ borderRadius: "10px" }}>{employeesError}</Alert>}
          {successMessage && <Alert severity="success" sx={{ borderRadius: "10px" }}>{successMessage}</Alert>}

          {/* 1. Employee Field */}
          {employee ? (
            <Box sx={{ p: 2, borderRadius: "12px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px", mb: 0.5 }}>
                Employee Profile
              </Typography>
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
                {employee.firstName} {employee.lastName} ({employee.employeeCode})
              </Typography>
            </Box>
          ) : (
            <Controller
              name="selectedEmployeeId"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", mb: 0.8 }}>
                    Select Employee
                  </Typography>
                  <TextField
                    {...field}
                    select
                    fullWidth
                    size="small"
                    required
                    disabled={loadingEmployees || submitting}
                    error={!!errors.selectedEmployeeId}
                    helperText={errors.selectedEmployeeId?.message}
                    sx={inputFieldSx}
                    slotProps={{
                      select: { displayEmpty: true },
                    }}
                  >
                    <MenuItem value="" disabled sx={disabledMenuItemSx}>
                      {loadingEmployees ? "Loading employees list..." : "Choose an employee"}
                    </MenuItem>
                    {employeesList.map((emp) => (
                      <MenuItem key={emp._id} value={emp._id}>
                        {`${emp.firstName} ${emp.lastName} (${emp.employeeCode})`}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              )}
            />
          )}

          {/* 2. Attendance Date */}
          <Controller
            name="attendanceDate"
            control={control}
            render={({ field }) => (
              <Box>
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", mb: 0.8 }}>
                  Attendance Date
                </Typography>
                <TextField
                  {...field}
                  type="date"
                  fullWidth
                  size="small"
                  required
                  disabled={submitting}
                  error={!!errors.attendanceDate}
                  helperText={errors.attendanceDate?.message}
                  sx={inputFieldSx}
                />
              </Box>
            )}
          />

          {/* 3. Timings Row */}
          <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", mb: 0.8 }}>
                Check-In Time
              </Typography>
              <Controller
                name="checkInTime"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="time"
                    fullWidth
                    size="small"
                    required
                    disabled={submitting}
                    error={!!errors.checkInTime}
                    helperText={errors.checkInTime?.message}
                    sx={inputFieldSx}
                  />
                )}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", mb: 0.8 }}>
                Check-Out Time (optional)
              </Typography>
              <Controller
                name="checkOutTime"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="time"
                    fullWidth
                    size="small"
                    disabled={submitting}
                    error={!!errors.checkOutTime}
                    helperText={errors.checkOutTime?.message}
                    sx={inputFieldSx}
                  />
                )}
              />
            </Box>
          </Box>

          {/* 4. Notes */}
          <Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", mb: 0.8 }}>
              Reason / Notes
            </Typography>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  multiline
                  rows={3}
                  fullWidth
                  size="small"
                  required
                  disabled={submitting}
                  placeholder="e.g. Biometric machine error, manually logged by HR"
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                  sx={multilineSx}
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 0, mt: 3, display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button
            onClick={onClose}
            disabled={submitting}
            sx={{
              height: 44,
              borderRadius: "12px",
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
            type="submit"
            disabled={submitting || (loadingEmployees && !employee)}
            variant="contained"
            sx={{
              height: 44,
              borderRadius: "12px",
              px: 3,
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: "#6D5DF6",
              boxShadow: "0 4px 12px rgba(109, 93, 246, 0.25)",
              "&:hover": { backgroundColor: "#5B4EB3" },
            }}
          >
            {submitting ? <CircularProgress size={18} color="inherit" /> : "Record Attendance"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
