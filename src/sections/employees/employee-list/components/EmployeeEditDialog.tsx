import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import type { AppDispatch } from "../../../../store/store";
import type { RootState } from "../../../../store/rootReducer";
import type { EmployeeListItem } from "../../../../store/employee/employee.types";
import {
  updateEmployeeRequest,
  clearEmployeeError,
} from "../../../../store/employee";

type Props = {
  open: boolean;
  employee: EmployeeListItem | null;
  onClose: () => void;
};

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

const textFieldSx = {
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
    padding: "14px 16px",
  },
  "& .MuiInputBase-input::placeholder": {
    fontSize: "13px",
    color: "#9CA3AF",
  },
};

function EmployeeEditDialog({ open, employee, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const { submitting, error } = useSelector(
    (state: RootState) => state.employee
  );

  // Form states initialized directly from props (since dialog is mounted conditionally)
  const [maritalStatus, setMaritalStatus] = useState(employee?.maritalStatus || "SINGLE");
  const [confirmationDate, setConfirmationDate] = useState(() => {
    if (employee?.confirmationDate) {
      const d = new Date(employee.confirmationDate);
      if (!isNaN(d.getTime())) {
        return d.toISOString().substring(0, 10);
      }
    }
    return "";
  });
  const [addressLine1, setAddressLine1] = useState(employee?.currentAddress?.addressLine1 || "");
  const [city, setCity] = useState(employee?.currentAddress?.city || "");
  const [stateName, setStateName] = useState(employee?.currentAddress?.state || "");
  const [zip, setZip] = useState(employee?.currentAddress?.zip || "");
  const [countryCode, setCountryCode] = useState(employee?.currentAddress?.countryCode || "IN");

  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearEmployeeError());
  }, [dispatch]);

  // Handle successful submit and close dialog asynchronously to avoid cascading renders
  useEffect(() => {
    if (hasSubmitted && !submitting && !error && open) {
      onClose();
      const timer = setTimeout(() => {
        setHasSubmitted(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [submitting, error, hasSubmitted, open, onClose]);

  const handleSubmit = () => {
    if (!employee?._id) return;
    if (!addressLine1.trim() || !city.trim() || !stateName.trim() || !zip.trim()) {
      return;
    }

    setHasSubmitted(true);
    dispatch(
      updateEmployeeRequest(employee._id, {
        maritalStatus,
        confirmationDate: confirmationDate || undefined,
        currentAddress: {
          addressLine1: addressLine1.trim(),
          city: city.trim(),
          state: stateName.trim(),
          countryCode,
          zip: zip.trim(),
        },
      })
    );
  };

  const isFormInvalid =
    !addressLine1.trim() ||
    !city.trim() ||
    !stateName.trim() ||
    !zip.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Update Employee ({employee ? `${employee.firstName} ${employee.lastName}` : ""})
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "24px !important" }}>
        {error && <Alert severity="error">{error}</Alert>}

        {/* Marital Status */}
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
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
            sx={selectFieldSx}
          >
            <MenuItem value="SINGLE">Single</MenuItem>
            <MenuItem value="MARRIED">Married</MenuItem>
            <MenuItem value="DIVORCED">Divorced</MenuItem>
            <MenuItem value="WIDOWED">Widowed</MenuItem>
          </TextField>
        </Box>

        {/* Confirmation Date */}
        <Box>
          <Typography
            variant="body2"
            sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}
          >
            Confirmation Date (optional)
          </Typography>
          <TextField
            type="date"
            fullWidth
            value={confirmationDate}
            onChange={(e) => setConfirmationDate(e.target.value)}
            sx={textFieldSx}
          />
        </Box>

        {/* Current Address Header */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#111827", mt: 1 }}>
          Current Address
        </Typography>

        <Grid container spacing={2}>
          <Grid size={12}>
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}
              >
                Address Line 1
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g. 456 New Address"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                sx={textFieldSx}
                required
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}
              >
                City
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g. Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                sx={textFieldSx}
                required
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}
              >
                State
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g. Maharashtra"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                sx={textFieldSx}
                required
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}
              >
                Zip Code
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g. 421001"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                sx={textFieldSx}
                required
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontSize: "14px", fontWeight: 500, color: "#374151" }}
              >
                Country Code
              </Typography>
              <TextField
                select
                fullWidth
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                sx={selectFieldSx}
              >
                <MenuItem value="IN">IN</MenuItem>
                <MenuItem value="US">US</MenuItem>
                <MenuItem value="RU">RU</MenuItem>
              </TextField>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={submitting} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || isFormInvalid}
          variant="contained"
          sx={{
            backgroundColor: "#6D5DF6",
            "&:hover": { backgroundColor: "#5B4BEA" },
            borderRadius: 2,
            px: 3,
          }}
        >
          {submitting ? <CircularProgress size={18} color="inherit" /> : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EmployeeEditDialog;
