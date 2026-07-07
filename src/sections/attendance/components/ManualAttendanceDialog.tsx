import { useState, useEffect } from "react";
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

type ManualAttendanceDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  employee?: { _id: string; firstName: string; lastName: string; employeeCode: string } | null;
};

export default function ManualAttendanceDialog({
  open,
  onClose,
  onSuccess,
  employee,
}: ManualAttendanceDialogProps) {
  const [employeesList, setEmployeesList] = useState<EmployeeListItem[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employee?._id ?? "");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [checkInTime, setCheckInTime] = useState("09:00");
  const [checkOutTime, setCheckOutTime] = useState("18:00");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch employees list if no preset employee is provided
  useEffect(() => {
    if (open && !employee) {
      const fetchEmployees = async () => {
        setLoadingEmployees(true);
        setError(null);
        try {
          const response = await listEmployees(1, 100, "", "ACTIVE");
          if (response.succeeded && response.data) {
            setEmployeesList(response.data);
          } else {
            setError(response.message || "Failed to load employees list");
          }
        } catch (err: any) {
          setError(err.response?.data?.message || err.message || "Failed to load employees list");
        } finally {
          setLoadingEmployees(false);
        }
      };
      fetchEmployees();
    }
  }, [open, employee]);

  // Sync state if preset employee changes
  useEffect(() => {
    if (employee) {
      setSelectedEmployeeId(employee._id);
    } else {
      setSelectedEmployeeId("");
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      setError("Please select an employee");
      return;
    }
    if (!attendanceDate) {
      setError("Please enter the attendance date");
      return;
    }
    if (!checkInTime) {
      setError("Please enter the check-in time");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Compose ISO datetime strings (local time to ISO UTC conversion)
      const checkInDate = new Date(`${attendanceDate}T${checkInTime}:00`);
      if (isNaN(checkInDate.getTime())) {
        throw new Error("Invalid check-in time format");
      }
      const checkIn = checkInDate.toISOString();

      let checkOut: string | undefined = undefined;
      if (checkOutTime) {
        const checkOutDate = new Date(`${attendanceDate}T${checkOutTime}:00`);
        if (isNaN(checkOutDate.getTime())) {
          throw new Error("Invalid check-out time format");
        }
        if (checkOutDate.getTime() < checkInDate.getTime()) {
          throw new Error("Check-out time cannot be earlier than check-in time");
        }
        checkOut = checkOutDate.toISOString();
      }

      const response = await createManualAttendance({
        employeeId: selectedEmployeeId,
        attendanceDate,
        checkIn,
        checkOut,
        notes: notes || undefined,
      });

      if (response.succeeded) {
        setSuccess("Attendance recorded manually successfully!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
      } else {
        setError(response.message || "Failed to record manual attendance");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while recording manual attendance"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
          Record Manual Attendance (HR)
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "#9CA3AF" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 3 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}

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
            <TextField
              select
              label="Select Employee"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              fullWidth
              size="small"
              required
              disabled={loadingEmployees || submitting}
              slotProps={{ select: { displayEmpty: true } }}
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

          {/* 2. Attendance Date */}
          <TextField
            label="Attendance Date"
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            fullWidth
            size="small"
            required
            disabled={submitting}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          {/* 3. Timings Row */}
          <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
            <TextField
              label="Check-In Time"
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              fullWidth
              size="small"
              required
              disabled={submitting}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Check-Out Time"
              type="time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              fullWidth
              size="small"
              disabled={submitting}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>

          {/* 4. Notes */}
          <TextField
            label="Reason / Notes"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            size="small"
            required
            disabled={submitting}
            placeholder="e.g. Biometric machine error, manually logged by HR"
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
              backgroundColor: "#6D5DF6",
              "&:hover": { backgroundColor: "#5B4BEA" },
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
