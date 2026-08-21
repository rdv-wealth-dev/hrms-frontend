import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import CloseIcon from "@mui/icons-material/Close";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

import TextInput from "../../../components/input/TextInput";
import {
  assignSalaryStructure,
  type SalaryStructureItem,
} from "../../../api/employee.api";

interface SalaryStructureDialogProps {
  open: boolean;
  onClose: () => void;
  employeeId: string;
  currentStructure?: SalaryStructureItem | null;
  onSuccess: () => Promise<void>;
  showSnackbar: (
    msg: string,
    variant: "success" | "error" | "info" | "warning"
  ) => void;
}

export const SalaryStructureDialog: React.FC<SalaryStructureDialogProps> = ({
  open,
  onClose,
  employeeId,
  currentStructure,
  onSuccess,
  showSnackbar,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [ctcAnnual, setCtcAnnual] = useState<number | "">(1200000);
  const [currency, setCurrency] = useState("INR");
  const [basicMonthly, setBasicMonthly] = useState<number | "">(50000);
  const [hraMonthly, setHraMonthly] = useState<number | "">(25000);
  const [specialMonthly, setSpecialMonthly] = useState<number | "">(25000);

  useEffect(() => {
    if (currentStructure) {
      setCtcAnnual(currentStructure.ctcAnnual || 1200000);
      setCurrency(currentStructure.currency || "INR");

      const items = currentStructure.lineItems || [];
      const basic = items.find((i) => i.componentCode === "BASIC")?.amount;
      const hra = items.find((i) => i.componentCode === "HRA")?.amount;
      const special = items.find(
        (i) => i.componentCode === "SPECIAL_ALLOWANCE" || i.componentCode === "ALLOWANCE"
      )?.amount;

      if (basic !== undefined) setBasicMonthly(basic);
      if (hra !== undefined) setHraMonthly(hra);
      if (special !== undefined) setSpecialMonthly(special);
    }
  }, [currentStructure, open]);

  // Auto-calculate components when Annual CTC changes
  const handleCtcChange = (val: string) => {
    const num = Number(val);
    setCtcAnnual(num);
    if (!isNaN(num) && num > 0) {
      const monthly = Math.round(num / 12);
      const basic = Math.round(monthly * 0.5);
      const hra = Math.round(monthly * 0.25);
      const special = monthly - basic - hra;
      setBasicMonthly(basic);
      setHraMonthly(hra);
      setSpecialMonthly(Math.max(0, special));
    }
  };

  const grossMonthly =
    (Number(basicMonthly) || 0) +
    (Number(hraMonthly) || 0) +
    (Number(specialMonthly) || 0);

  const handleSubmit = async () => {
    if (!employeeId) {
      setErrorMsg("Employee ID is missing.");
      return;
    }

    const ctc = Number(ctcAnnual);
    if (isNaN(ctc) || ctc <= 0) {
      setErrorMsg("Please enter a valid Annual CTC.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const lineItems = [
        { componentCode: "BASIC", amount: Number(basicMonthly) || 0 },
        { componentCode: "HRA", amount: Number(hraMonthly) || 0 },
        { componentCode: "SPECIAL_ALLOWANCE", amount: Number(specialMonthly) || 0 },
      ].filter((item) => item.amount > 0);

      const response = await assignSalaryStructure({
        employeeId,
        ctcAnnual: ctc,
        grossMonthly,
        wagesForStatutory: Number(basicMonthly) || 0,
        currency,
        lineItems,
      });

      if (response?.succeeded) {
        showSnackbar("Salary structure assigned successfully!", "success");
        await onSuccess();
        onClose();
      } else {
        setErrorMsg(response?.message || "Failed to assign salary structure.");
      }
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || "Something went wrong while saving."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!submitting) onClose();
      }}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(15, 23, 42, 0.4)",
          },
        },
        paper: { sx: { borderRadius: "16px", p: 1 } },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          justify: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PaymentsOutlinedIcon sx={{ color: "#4F46E5" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
            Assign / Revise Salary Structure
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "#9CA3AF" }}
          disabled={submitting}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 2 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ borderRadius: "10px" }}>
            {errorMsg}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextInput
              type="number"
              label="Annual CTC (₹)"
              value={ctcAnnual}
              onChange={(e) => handleCtcChange(e.target.value)}
              placeholder="e.g. 1200000"
              required
              disabled={submitting}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextInput
              select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={submitting}
            >
              <MenuItem value="INR">INR (₹)</MenuItem>
              <MenuItem value="USD">USD ($)</MenuItem>
              <MenuItem value="EUR">EUR (€)</MenuItem>
              <MenuItem value="GBP">GBP (£)</MenuItem>
            </TextInput>
          </Grid>

          <Grid size={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: "10px",
                backgroundColor: "#F8FAFC",
                border: "1px dashed #CBD5E1",
                display: "flex",
                justify: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                Calculated Gross Monthly:
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#4F46E5" }}>
                ₹{grossMonthly.toLocaleString("en-IN")} / mo
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextInput
              type="number"
              label="Basic Salary (Monthly)"
              value={basicMonthly}
              onChange={(e) => setBasicMonthly(Number(e.target.value))}
              placeholder="e.g. 50000"
              disabled={submitting}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextInput
              type="number"
              label="HRA (Monthly)"
              value={hraMonthly}
              onChange={(e) => setHraMonthly(Number(e.target.value))}
              placeholder="e.g. 25000"
              disabled={submitting}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextInput
              type="number"
              label="Special Allowance (Monthly)"
              value={specialMonthly}
              onChange={(e) => setSpecialMonthly(Number(e.target.value))}
              placeholder="e.g. 25000"
              disabled={submitting}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting} color="inherit">
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !ctcAnnual}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            backgroundColor: "#4F46E5",
            "&:hover": { backgroundColor: "#4338CA" },
            px: 3,
          }}
        >
          {submitting ? "Saving..." : "Save Salary Structure"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SalaryStructureDialog;
