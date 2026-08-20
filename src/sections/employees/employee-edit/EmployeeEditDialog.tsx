import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import TextInput from "../../../components/input/TextInput";
import PhoneInput from "../../../components/input/PhoneInput";

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

const disabledMenuItemSx = {
  color: "#94A3B8 !important",
  fontWeight: 500,
  "&.Mui-disabled": {
    opacity: "1 !important",
    color: "#94A3B8 !important",
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
      maxWidth="md"
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
            p: { xs: 2.5, sm: 3.5 },
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
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontSize: { xs: "16px", sm: "18px" }, fontWeight: 700, color: "#0F172A" }}>
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

      <DialogContent sx={{ p: 0, overflowX: "hidden" }}>
        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: "10px" }}>{error}</Alert>}

        {/* Section 1: Employment Information Header */}
        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", mb: 2 }}>
          Employment Information
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 2.5 }} sx={{ mb: 3 }}>
          {/* Marital Status */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              select
              label="Marital Status"
              value={maritalStatus}
              onChange={(e) => setMaritalStatus(e.target.value)}
              slotProps={{ select: { displayEmpty: true } }}
            >
              <MenuItem value="" disabled sx={disabledMenuItemSx}>
                Select marital status
              </MenuItem>
              <MenuItem value="SINGLE">Single</MenuItem>
              <MenuItem value="MARRIED">Married</MenuItem>
              <MenuItem value="DIVORCED">Divorced</MenuItem>
              <MenuItem value="WIDOWED">Widowed</MenuItem>
            </TextInput>
          </Grid>

          {/* Confirmation Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              type="date"
              label="Confirmation Date (optional)"
              placeholder="Select confirmation date"
              value={confirmationDate}
              onChange={(e) => setConfirmationDate(e.target.value)}
            />
          </Grid>

          {/* Department */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              select
              label="Department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
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
            </TextInput>
          </Grid>

          {/* Designation */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              select
              label="Designation"
              value={designationId}
              onChange={(e) => setDesignationId(e.target.value)}
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
            </TextInput>
          </Grid>
        </Grid>

        {/* Section 2: Current Address Header */}
        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", mb: 2 }}>
          Current Address
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 2.5 }}>
          {/* Address Line 1 */}
          <Grid size={12}>
            <TextInput
              label="Address Line 1"
              placeholder="e.g. Flat 402, Sunshine Apartments, MG Road"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              required
            />
          </Grid>

          {/* City */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="City"
              placeholder="e.g. Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </Grid>

          {/* State */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="State"
              placeholder="e.g. Maharashtra"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              required
            />
          </Grid>

          {/* Zip Code */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Zip Code"
              placeholder="e.g. 400001"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              required
            />
          </Grid>

          {/* Phone Number */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <PhoneInput
              label="Phone Number"
              countryCodeValue={countryCode}
              onCountryCodeChange={(code) => setCountryCode(code)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 0, mt: 3.5, display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
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
          onClick={handleSubmit}
          disabled={submitting || isFormInvalid}
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
          {submitting ? <CircularProgress size={18} color="inherit" /> : "Update Employee"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EmployeeEditDialog;
