import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";

import { listEmployees } from "../../../api/employee.api";
import type { EmployeeListItem } from "../../../store/employee/employee.types";
import type {
  ShiftRotationPlan,
  AssignRotationPlanRequest,
} from "../../../store/attendance/attendance.types";

type Props = {
  open: boolean;
  submitting: boolean;
  error: string | null;
  rotationPlans: ShiftRotationPlan[];
  onClose: () => void;
  onSubmit: (data: AssignRotationPlanRequest) => void;
};

export default function AssignRotationPlanDialog({
  open,
  submitting,
  error,
  rotationPlans,
  onClose,
  onSubmit,
}: Props) {
  const [rotationPlanId, setRotationPlanId] = useState("");
  const [rotationStartDate, setRotationStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedEmployees, setSelectedEmployees] = useState<EmployeeListItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setRotationPlanId("");
      setRotationStartDate(new Date().toISOString().split("T")[0]);
      setSelectedEmployees([]);
      setValidationError(null);

      const fetchEmployees = async () => {
        try {
          setLoadingEmployees(true);
          const res = await listEmployees(1, 200);
          if (res.succeeded && res.data) {
            setEmployees(res.data);
          }
        } catch (err) {
          console.error("Failed to load employees", err);
        } finally {
          setLoadingEmployees(false);
        }
      };

      fetchEmployees();
    }
  }, [open]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!rotationPlanId) {
      setValidationError("Please select a rotation plan.");
      return;
    }

    if (!rotationStartDate) {
      setValidationError("Please select a rotation start date.");
      return;
    }

    if (selectedEmployees.length === 0) {
      setValidationError("Please select at least one employee.");
      return;
    }

    const payload: AssignRotationPlanRequest = {
      rotationPlanId,
      rotationStartDate: new Date(rotationStartDate).toISOString(),
      employeeIds: selectedEmployees.map((emp) => emp._id),
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleFormSubmit}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Assign Rotation Plan
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2, pb: 2 }}>
          {(error || validationError) && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error || validationError}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            <Grid size={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Assign a rotational shift plan and start date for one or more employees.
              </Typography>
            </Grid>

            {/* Select Rotation Plan */}
            <Grid size={12}>
              <TextField
                select
                required
                fullWidth
                label="Rotation Plan"
                value={rotationPlanId}
                onChange={(e) => setRotationPlanId(e.target.value)}
                size="small"
              >
                <MenuItem value="" disabled>
                  Select Rotation Plan
                </MenuItem>
                {rotationPlans.map((plan) => (
                  <MenuItem key={plan._id} value={plan._id}>
                    {plan.name} ({plan.cycleDuration})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Rotation Start Date */}
            <Grid size={12}>
              <TextField
                required
                fullWidth
                label="Rotation Start Date"
                type="date"
                value={rotationStartDate}
                onChange={(e) => setRotationStartDate(e.target.value)}
                size="small"
                slotProps={{
                  inputLabel: { shrink: true }
                }}
              />
            </Grid>

            {/* Select Employees */}
            <Grid size={12}>
              <Autocomplete
                multiple
                options={employees}
                loading={loadingEmployees}
                value={selectedEmployees}
                onChange={(_, newValue) => setSelectedEmployees(newValue)}
                getOptionLabel={(option) =>
                  `${option.firstName} ${option.lastName} (${option.employeeCode})`
                }
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assign to Employees"
                    size="small"
                    placeholder={selectedEmployees.length === 0 ? "Select employees..." : ""}
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
                      }
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5 }}>
          <Button onClick={onClose} disabled={submitting} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              backgroundColor: "#6D5DF6",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 4,
              "&:hover": { backgroundColor: "#5B4BEA" }
            }}
          >
            {submitting ? (
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
            ) : null}
            Assign Plan
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
