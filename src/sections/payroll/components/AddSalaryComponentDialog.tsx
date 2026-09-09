import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";

import TextInput from "../../../components/input/TextInput";
import type {
  SalaryComponentItem,
  SalaryComponentType,
  CalculationType,
  CreateSalaryComponentPayload,
} from "../../../types/payroll.types";
import { createSalaryComponent } from "../../../api/payroll.api";

interface AddSalaryComponentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (component: SalaryComponentItem) => void;
}

export function AddSalaryComponentDialog({
  open,
  onClose,
  onSubmit,
}: AddSalaryComponentDialogProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<SalaryComponentType>("EARNING");
  const [calculationType, setCalculationType] = useState<CalculationType>("FLAT");
  const [isTaxable, setIsTaxable] = useState(true);
  const [isPartOfWages, setIsPartOfWages] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setCode("");
    setName("");
    setType("EARNING");
    setCalculationType("FLAT");
    setIsTaxable(true);
    setIsPartOfWages(true);
    setLoading(false);
    setError(null);
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError("Please enter a component code.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter a component name.");
      return;
    }

    const formattedCode = code.trim().toUpperCase().replace(/\s+/g, "_");

    const payload: CreateSalaryComponentPayload = {
      name: name.trim(),
      code: formattedCode,
      type,
      calculationType,
      isTaxable,
      isPartOfWages,
    };

    setLoading(true);
    try {
      const createdComponent = await createSalaryComponent(payload);
      onSubmit(createdComponent);
      handleClose();
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.errors) && err?.response?.data?.errors[0]) ||
        err?.message ||
        "Failed to create salary component. Please try again.";
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            p: 1.5,
            backgroundColor: "#FFFFFF",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.5, pt: 2, px: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: "18px",
            color: "#0F172A",
            letterSpacing: "-0.2px",
          }}
        >
          Add Salary Component
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, py: 1.5 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: "10px" }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
            {/* Row 1: Code & Name */}
            <TextInput
              label="Code"
              placeholder="e.g. BASIC"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
            />

            <TextInput
              label="Name"
              placeholder="e.g. Basic Salary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />

            {/* Row 2: Type & Calculation Type */}
            <TextInput
              label="Type"
              select
              value={type}
              onChange={(e) => setType(e.target.value as SalaryComponentType)}
              disabled={loading}
            >
              <MenuItem value="EARNING">EARNING</MenuItem>
              <MenuItem value="DEDUCTION">DEDUCTION</MenuItem>
            </TextInput>

            <TextInput
              label="Calculation Type"
              select
              value={calculationType}
              onChange={(e) => setCalculationType(e.target.value as CalculationType)}
              disabled={loading}
            >
              <MenuItem value="FLAT">FLAT</MenuItem>
              <MenuItem value="PERCENTAGE">PERCENTAGE</MenuItem>
              <MenuItem value="FORMULA">FORMULA</MenuItem>
            </TextInput>

            {/* Row 3: Options & Flags */}
            <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" }, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isTaxable}
                    onChange={(e) => setIsTaxable(e.target.checked)}
                    disabled={loading}
                    sx={{
                      color: "#94A3B8",
                      "&.Mui-checked": { color: "#EF4444" },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                    Is Taxable Component
                  </Typography>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isPartOfWages}
                    onChange={(e) => setIsPartOfWages(e.target.checked)}
                    disabled={loading}
                    sx={{
                      color: "#94A3B8",
                      "&.Mui-checked": { color: "#EF4444" },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                    Is Part of Minimum Wages
                  </Typography>
                }
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 2, gap: 1.5, justifyContent: "flex-end" }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="contained"
            sx={{
              color: "#334155",
              backgroundColor: "#E2E8F0",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "14px",
              px: 3,
              py: 1,
              borderRadius: "10px",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#CBD5E1",
                boxShadow: "none",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            sx={{
              backgroundColor: "#EF4444",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "14px",
              px: 3,
              py: 1,
              minWidth: 150,
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
              "&:hover": {
                backgroundColor: "#DC2626",
                boxShadow: "0 6px 16px rgba(239, 68, 68, 0.35)",
              },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Create Component"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddSalaryComponentDialog;
