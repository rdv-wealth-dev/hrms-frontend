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

// ── Constants ────────────────────────────────────────────────
const SUCCESS_CLOSE_DELAY_MS = 1200;
const DEFAULT_CHECK_IN_TIME = "09:00";
const DEFAULT_CHECK_OUT_TIME = "18:00";
const EMPLOYEE_PAGE_SIZE = 100;
const ACCENT_COLOR = "#6D5DF6";
const ACCENT_COLOR_HOVER = "#5B4BEA";

// ── Validation schema ───────────────────────────────────────
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

  // Cancels a pending "close after success" timer if the component
  // unmounts first, avoiding setState-after-unmount warnings.
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
      attendanceDate: new Date().toISOString().split("T")[0],
      checkInTime: DEFAULT_CHECK_IN_TIME,
      checkOutTime: DEFAULT_CHECK_OUT_TIME,
      notes: "",
    },
  });

  // Reset the form whenever the dialog opens or the preset employee changes.
  useEffect(() => {
    if (!open) return;
    reset({
      selectedEmployeeId: employee?._id ?? "",
      attendanceDate: new Date().toISOString().split("T")[0],
      checkInTime: DEFAULT_CHECK_IN_TIME,
      checkOutTime: DEFAULT_CHECK_OUT_TIME,
      notes: "",
    });
    setApiError(null);
    setSuccessMessage(null);
  }, [open, employee, reset]);

  // Fetch the employee list only when needed (no preset employee) and
  // guard against a stale response overwriting state after the dialog
  // has since closed or been reopened with a different employee.
  useEffect(() => {
    if (!open || employee) return;

    let cancelled = false;

    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      setEmployeesError(null);
      try {
        const response = await listEmployees(1, EMPLOYEE_PAGE_SIZE, "", "ACTIVE");
        if (cancelled) return;

        if (response.succeeded && response.data) {
          setEmployeesList(response.data);
        } else {
          setEmployeesError(response.message || "Failed to load employees list");
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const message = isAxiosError<{ message?: string }>(err)
          ? err.response?.data?.message ?? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load employees list";
        setEmployeesError(message);
      } finally {
        if (!cancelled) setLoadingEmployees(false);
      }
    };

    fetchEmployees();

    return () => {
      cancelled = true;
    };
  }, [open, employee]);

  // Clear any pending "close after success" timer on unmount.
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const onSubmit = async (data: ManualAttendanceFormData) => {
    setSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const checkInDate = combineDateAndTime(data.attendanceDate, data.checkInTime, "check-in");
      const checkIn = checkInDate.toISOString();

      let checkOut: string | undefined;
      if (data.checkOutTime) {
        const checkOutDate = combineDateAndTime(data.attendanceDate, data.checkOutTime, "check-out");
        checkOut = checkOutDate.toISOString();
      }

      const response = await createManualAttendance({
        employeeId: data.selectedEmployeeId,
        attendanceDate: data.attendanceDate,
        checkIn,
        checkOut,
        notes: data.notes || undefined,
      });

      if (response.succeeded) {
        setSuccessMessage("Attendance recorded manually successfully!");
        closeTimeoutRef.current = setTimeout(() => {
          onSuccess?.();
          onClose();
        }, SUCCESS_CLOSE_DELAY_MS);
      } else {
        setApiError(response.message || "Failed to record manual attendance");
      }
    } catch (err: unknown) {
      const message = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message ?? err.message
        : err instanceof Error
          ? err.message
          : "Something went wrong while recording manual attendance";
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    if (submitting) return;
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="sm" aria-labelledby="manual-attendance-title">
      <DialogTitle
        id="manual-attendance-title"
        component="div"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: "#111827" }}>
          Record Manual Attendance (HR)
        </Typography>
        <IconButton onClick={onClose} size="small" disabled={submitting} aria-label="Close dialog" sx={{ color: "#9CA3AF" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 3 }}>
          <Box role="status" aria-live="polite">
            {(apiError || employeesError) && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {apiError || employeesError}
              </Alert>
            )}
            {successMessage && (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                {successMessage}
              </Alert>
            )}
          </Box>

          {/* 1. Employee Dropdown or Static Display */}
          {employee ? (
            <TextField
              label="Employee"
              value={`${employee.firstName} ${employee.lastName} (${employee.employeeCode})`}
              disabled
              fullWidth
              size="small"
            />
          ) : (
            <Controller
              name="selectedEmployeeId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Select Employee"
                  fullWidth
                  size="small"
                  required
                  disabled={loadingEmployees || submitting}
                  error={!!errors.selectedEmployeeId}
                  helperText={errors.selectedEmployeeId?.message}
                  slotProps={{
                    select: { displayEmpty: true },
                    inputLabel: { shrink: true },
                  }}
                >
                  <MenuItem value="" disabled>
                    {loadingEmployees ? "Loading employees list..." : "Choose an employee"}
                  </MenuItem>
                  {employeesList.map((emp) => (
                    <MenuItem key={emp._id} value={emp._id}>
                      {`${emp.firstName} ${emp.lastName} (${emp.employeeCode})`}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}

          {/* 2. Attendance Date */}
          <Controller
            name="attendanceDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Attendance Date"
                type="date"
                fullWidth
                size="small"
                required
                disabled={submitting}
                error={!!errors.attendanceDate}
                helperText={errors.attendanceDate?.message}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />

          {/* 3. Timings Row */}
          <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
            <Controller
              name="checkInTime"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Check-In Time"
                  type="time"
                  fullWidth
                  size="small"
                  required
                  disabled={submitting}
                  error={!!errors.checkInTime}
                  helperText={errors.checkInTime?.message}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
            <Controller
              name="checkOutTime"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Check-Out Time"
                  type="time"
                  fullWidth
                  size="small"
                  disabled={submitting}
                  error={!!errors.checkOutTime}
                  helperText={errors.checkOutTime?.message}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Box>

          {/* 4. Notes */}
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Reason / Notes"
                multiline
                rows={3}
                fullWidth
                size="small"
                required
                disabled={submitting}
                placeholder="e.g. Biometric machine error, manually logged by HR"
                error={!!errors.notes}
                helperText={errors.notes?.message}
              />
            )}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={submitting} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || (loadingEmployees && !employee)}
            variant="contained"
            sx={{
              backgroundColor: ACCENT_COLOR,
              "&:hover": { backgroundColor: ACCENT_COLOR_HOVER },
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : "Record Attendance"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
