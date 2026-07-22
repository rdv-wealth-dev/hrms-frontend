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
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import type { EmployeeListItem } from "../../../store/employee/employee.types";
import {
  updateEmployeeRequest,
  clearEmployeeError,
} from "../../../store/employee";

type Props = {
  open: boolean;
  employee: EmployeeListItem | null;
  onClose: () => void;
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

const disabledMenuItemSx = {
  color: "#334155 !important",
  fontWeight: 600,
  "&.Mui-disabled": {
    opacity: "1 !important",
    color: "#334155 !important",
  },
};

function EmployeeEditDialog({ open, employee, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const { submitting, error } = useSelector(
    (state: RootState) => state.employee
  );

  const departments = useSelector(
    (state: RootState) => state.department?.departments ?? []
  );
  const designations = useSelector(
    (state: RootState) => state.designation?.designations ?? []
  );

  const [maritalStatus, setMaritalStatus] = useState(employee?.maritalStatus || "");
  const [departmentId, setDepartmentId] = useState(employee?.departmentId || "");
  const [designationId, setDesignationId] = useState(employee?.designationId || "");
  const [confirmationDate, setConfirmationDate] = useState(() => {
    if (!employee?.confirmationDate) return "";
    const d = new Date(employee.confirmationDate);
    return !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "";
  });

  const [addressLine1, setAddressLine1] = useState(employee?.currentAddress?.addressLine1 || "");
  const [city, setCity] = useState(employee?.currentAddress?.city || "");
  const [stateName, setStateName] = useState(employee?.currentAddress?.state || "");
  const [zip, setZip] = useState(employee?.currentAddress?.zip || "");
  const [countryCode, setCountryCode] = useState(employee?.currentAddress?.countryCode || "IN");

  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (employee) {
      setMaritalStatus(employee.maritalStatus || "SINGLE");
      const deptVal = typeof employee.departmentId === "object" ? (employee.departmentId as any)?._id : employee.departmentId;
      setDepartmentId(deptVal || "");
      const desigVal = typeof employee.designationId === "object" ? (employee.designationId as any)?._id : employee.designationId;
      setDesignationId(desigVal || "");
      setConfirmationDate(
        employee.confirmationDate
          ? new Date(employee.confirmationDate).toISOString().split("T")[0]
          : ""
      );
      setAddressLine1(employee.currentAddress?.addressLine1 || "");
      setCity(employee.currentAddress?.city || "");
      setStateName(employee.currentAddress?.state || "");
      setZip(employee.currentAddress?.zip || "");
      setCountryCode(employee.currentAddress?.countryCode || "IN");
    }
  }, [employee]);

  useEffect(() => {
    dispatch(clearEmployeeError());
    setHasSubmitted(false);
  }, [dispatch]);

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
    if (!addressLine1.trim() || !city.trim() || !stateName.trim() || !zip.trim() || !departmentId || !designationId) {
      return;
    }

    setHasSubmitted(true);
    dispatch(
      updateEmployeeRequest(employee._id, {
        maritalStatus,
        confirmationDate: confirmationDate || undefined,
        departmentId: departmentId || undefined,
        designationId: designationId || undefined,
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
    !zip.trim() ||
    !departmentId ||
    !designationId;

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
      {/* Modal Header */}
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
          Update Employee Details
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

      <DialogContent sx={{ p: 0, pr: 2, mr: -1, display: "flex", flexDirection: "column", gap: 2 }}>
        {error && <Alert severity="error" sx={{ borderRadius: "10px" }}>{error}</Alert>}

        {/* Section 1: Employment Information Header */}
        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
          Employment Information
        </Typography>

        {/* Marital Status */}
        <Box>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", mb: 0.8 }}>
            Marital Status
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
            sx={inputFieldSx}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="" disabled sx={disabledMenuItemSx}>
              Select marital status
            </MenuItem>
            <MenuItem value="SINGLE">Single</MenuItem>
            <MenuItem value="MARRIED">Married</MenuItem>
            <MenuItem value="DIVORCED">Divorced</MenuItem>
            <MenuItem value="WIDOWED">Widowed</MenuItem>
          </TextField>
        </Box>

        {/* Confirmation Date */}
        <Box>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", mb: 0.8 }}>
            Confirmation Date (optional)
          </Typography>
          <TextField
            type="date"
            fullWidth
            size="small"
            value={confirmationDate}
            onChange={(e) => setConfirmationDate(e.target.value)}
            placeholder="Select confirmation date"
            sx={inputFieldSx}
          />
        </Box>

        {/* Department */}
        <Box>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", mb: 0.8 }}>
            Department
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            sx={inputFieldSx}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="" disabled sx={disabledMenuItemSx}>
              Choose a department
            </MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept._id} value={dept._id}>
                {dept.name} ({dept.code})
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Designation */}
        <Box>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", mb: 0.8 }}>
            Designation
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={designationId}
            onChange={(e) => setDesignationId(e.target.value)}
            sx={inputFieldSx}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="" disabled sx={disabledMenuItemSx}>
              Choose a designation
            </MenuItem>
            {designations.map((desig) => (
              <MenuItem key={desig._id} value={desig._id}>
                {desig.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Section 2: Current Address Header */}
        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", mt: 1 }}>
          Current Address
        </Typography>

        <Grid container spacing={2}>
          <Grid size={12}>
            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", mb: 0.8 }}>
                Address Line 1
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Flat 402, Sunshine Apartments, MG Road"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                sx={inputFieldSx}
                required
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", mb: 0.8 }}>
                City
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                sx={inputFieldSx}
                required
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", mb: 0.8 }}>
                State
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Maharashtra"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                sx={inputFieldSx}
                required
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", mb: 0.8 }}>
                Zip Code
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. 400001"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                sx={inputFieldSx}
                required
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", mb: 0.8 }}>
                Country Code
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                sx={inputFieldSx}
                slotProps={{ select: { displayEmpty: true } }}
              >
                <MenuItem value="" disabled sx={disabledMenuItemSx}>
                  Select country code
                </MenuItem>
                <MenuItem value="IN">IN (India)</MenuItem>
                <MenuItem value="US">US (United States)</MenuItem>
                <MenuItem value="RU">RU (Russia)</MenuItem>
              </TextField>
            </Box>
          </Grid>
        </Grid>
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
          onClick={handleSubmit}
          disabled={submitting || isFormInvalid}
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
          {submitting ? <CircularProgress size={18} color="inherit" /> : "Update Employee"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EmployeeEditDialog;
