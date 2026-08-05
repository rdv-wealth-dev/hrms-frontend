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
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";

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

const disabledMenuItemSx = {
  color: "#94A3B8 !important",
  fontWeight: 500,
  "&.Mui-disabled": {
    opacity: "1 !important",
    color: "#94A3B8 !important",
  },
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
        checkIn: data.checkInTime ? `${data.attendanceDate}T${data.checkInTime}:00.000Z` : new Date().toISOString(),
        checkOut: data.checkOutTime ? `${data.attendanceDate}T${data.checkOutTime}:00.000Z` : undefined,
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
        <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", gap: 2.5 }}>
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
                <TextInput
                  {...field}
                  select
                  label="Select Employee"
                  disabled={loadingEmployees || submitting}
                  error={errors.selectedEmployeeId?.message}
                  slotProps={{ select: { displayEmpty: true } }}
                >
                  <MenuItem value="" disabled sx={disabledMenuItemSx}>
                    {loadingEmployees ? "Loading employees list..." : "Choose an employee"}
                  </MenuItem>
                  {employeesList.map((emp) => (
                    <MenuItem key={emp._id} value={emp._id}>
                      {`${emp.firstName} ${emp.lastName} (${emp.employeeCode})`}
                    </MenuItem>
                  ))}
                </TextInput>
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
                    label="Check-Out Time (optional)"
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
                label="Reason / Notes"
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
              height: 42,
              borderRadius: "10px",
              px: 3,
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: "#6D5DF6",
              boxShadow: "0 2px 8px rgba(109, 93, 246, 0.25)",
              "&:hover": { backgroundColor: "#5B4BEA" },
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
