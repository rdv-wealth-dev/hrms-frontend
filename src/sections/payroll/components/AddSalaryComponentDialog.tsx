import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

import TextInput from "../../../components/input/TextInput";
import type { SalaryComponentItem, SalaryComponentType } from "../../../types/payroll.types";

interface AddSalaryComponentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (component: Omit<SalaryComponentItem, "id">) => void;
}

const CATEGORY_OPTIONS = [
  "RECURRING",
  "STATUTORY",
  "BASE",
  "BONUS",
  "OVERTIME",
  "VARIABLE",
  "OTHER",
];

export function AddSalaryComponentDialog({
  open,
  onClose,
  onSubmit,
}: AddSalaryComponentDialogProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<SalaryComponentType>("EARNING");
  const [category, setCategory] = useState("RECURRING");
  const [formula, setFormula] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setCode("");
    setName("");
    setType("EARNING");
    setCategory("RECURRING");
    setFormula("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    onSubmit({
      code: formattedCode,
      name: name.trim(),
      type,
      category,
      calculation: formula.trim() || "FLAT_AMOUNT",
      flags: type === "EARNING" ? "In CTC · Taxable" : "Deduction",
    });

    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          p: 1.5,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
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

          <Grid container spacing={2.5}>
            {/* Row 1: Code & Name */}
            <Grid item xs={12} sm={6}>
              <TextInput
                label="Code"
                placeholder="SPECIAL_ALLOWANCE"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextInput
                label="Name"
                placeholder="Special Allowance"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>

            {/* Row 2: Type, Category, Formula Expression */}
            <Grid item xs={12} sm={3.5}>
              <TextInput
                label="Type"
                select
                value={type}
                onChange={(e) => setType(e.target.value as SalaryComponentType)}
              >
                <MenuItem value="EARNING">EARNING</MenuItem>
                <MenuItem value="DEDUCTION">DEDUCTION</MenuItem>
              </TextInput>
            </Grid>

            <Grid item xs={12} sm={3.5}>
              <TextInput
                label="Category"
                select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextInput>
            </Grid>

            <Grid item xs={12} sm={5}>
              <TextInput
                label="Formula Expression"
                placeholder="BASIC * 0.40"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 2, gap: 1.5, justifyContent: "flex-end" }}>
          <Button
            onClick={handleClose}
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
            variant="contained"
            sx={{
              backgroundColor: "#EF4444",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "14px",
              px: 3,
              py: 1,
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
              "&:hover": {
                backgroundColor: "#DC2626",
                boxShadow: "0 6px 16px rgba(239, 68, 68, 0.35)",
              },
            }}
          >
            Create Component
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddSalaryComponentDialog;
