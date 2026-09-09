import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import TextInput from "../../../components/input/TextInput";
import type {
  StructureTemplateItem,
  StructureLineItem,
} from "../../../types/payroll.types";

interface CreateStructureTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (template: Omit<StructureTemplateItem, "id">) => void;
  availableComponents?: { id: string; code: string; name: string; type: "EARNING" | "DEDUCTION" }[];
}

const TYPE_OPTIONS = ["REGULAR", "CONTRACTOR", "EXECUTIVE", "INTERN", "CUSTOM"];

export function CreateStructureTemplateDialog({
  open,
  onClose,
  onSubmit,
  availableComponents = [],
}: CreateStructureTemplateDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("REGULAR");
  const [description, setDescription] = useState("");

  // Earnings state & input
  const [earnings, setEarnings] = useState<StructureLineItem[]>([]);
  const [earningComponent, setEarningComponent] = useState("");
  const [earningCalc, setEarningCalc] = useState("");

  // Deductions state & input
  const [deductions, setDeductions] = useState<StructureLineItem[]>([]);
  const [deductionComponent, setDeductionComponent] = useState("");
  const [deductionCalc, setDeductionCalc] = useState("");

  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setType("REGULAR");
    setDescription("");
    setEarnings([]);
    setEarningComponent("");
    setEarningCalc("");
    setDeductions([]);
    setDeductionComponent("");
    setDeductionCalc("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddEarning = () => {
    if (!earningComponent) return;
    const newItem: StructureLineItem = {
      id: `e-${Date.now()}`,
      name: earningComponent,
      calculation: earningCalc.trim() || "Flat Amount",
    };
    setEarnings((prev) => [...prev, newItem]);
    setEarningComponent("");
    setEarningCalc("");
  };

  const handleRemoveEarning = (id: string) => {
    setEarnings((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddDeduction = () => {
    if (!deductionComponent) return;
    const newItem: StructureLineItem = {
      id: `d-${Date.now()}`,
      name: deductionComponent,
      calculation: deductionCalc.trim() || "Flat Amount",
    };
    setDeductions((prev) => [...prev, newItem]);
    setDeductionComponent("");
    setDeductionCalc("");
  };

  const handleRemoveDeduction = (id: string) => {
    setDeductions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a structure template name.");
      return;
    }

    onSubmit({
      title: name.trim(),
      description: description.trim() || `${type} salary structure blueprint`,
      tags: [{ label: type, variant: type === "REGULAR" ? "filled" : "outlined" }],
      earnings,
      deductions,
      assignedEmployeesCount: 0,
    });

    handleClose();
  };

  const earningOptions = availableComponents.filter(
    (c) => c.type === "EARNING"
  );
  const deductionOptions = availableComponents.filter(
    (c) => c.type === "DEDUCTION"
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          p: 1,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2, px: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: "18px",
            color: "#0F172A",
            letterSpacing: "-0.2px",
          }}
        >
          Create Structure Template
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, pt: 1.5, pb: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Name */}
            <TextInput
              label="Name"
              placeholder="e.g. Standard Corporate Structure"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* Type */}
            <TextInput
              label="Type"
              select
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextInput>

            {/* Description */}
            <TextInput
              label="Description"
              multiline
              rows={2}
              placeholder="Enter a brief overview of this structure..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Earnings Section */}
            <Box sx={{ pt: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "#1E293B", mb: 1, fontSize: "14px" }}
              >
                Earnings
              </Typography>

              {/* Added Earnings List */}
              {earnings.length > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1.5 }}>
                  {earnings.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 1.5,
                        py: 0.75,
                        borderRadius: "8px",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: "#0F172A", display: "inline-block", mr: 1 }}
                        >
                          {item.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748B" }}>
                          — {item.calculation}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveEarning(item.id)}
                        sx={{ color: "#94A3B8", "&:hover": { color: "#EF4444" } }}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Add Earning Row */}
              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={5}>
                  <TextInput
                    select
                    menuPlacement="top"
                    placeholder="Choose..."
                    value={earningComponent}
                    onChange={(e) => setEarningComponent(e.target.value)}
                  >
                    <MenuItem value="" disabled>
                      Choose...
                    </MenuItem>
                    {earningOptions.map((c) => (
                      <MenuItem key={c.id} value={c.code}>
                        {c.name} ({c.code})
                      </MenuItem>
                    ))}
                  </TextInput>
                </Grid>
                <Grid item xs={5}>
                  <TextInput
                    placeholder="e.g. 40% of CTC"
                    value={earningCalc}
                    onChange={(e) => setEarningCalc(e.target.value)}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    type="button"
                    variant="contained"
                    fullWidth
                    onClick={handleAddEarning}
                    sx={{
                      backgroundColor: "#E2E8F0",
                      color: "#1E293B",
                      fontWeight: 700,
                      textTransform: "none",
                      height: 40,
                      borderRadius: "10px",
                      boxShadow: "none",
                      "&:hover": { backgroundColor: "#CBD5E1", boxShadow: "none" },
                    }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Deductions Section */}
            <Box sx={{ pt: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "#1E293B", mb: 1, fontSize: "14px" }}
              >
                Deductions
              </Typography>

              {/* Added Deductions List */}
              {deductions.length > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1.5 }}>
                  {deductions.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 1.5,
                        py: 0.75,
                        borderRadius: "8px",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: "#0F172A", display: "inline-block", mr: 1 }}
                        >
                          {item.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748B" }}>
                          — {item.calculation}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveDeduction(item.id)}
                        sx={{ color: "#94A3B8", "&:hover": { color: "#EF4444" } }}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Add Deduction Row */}
              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={5}>
                  <TextInput
                    select
                    menuPlacement="top"
                    placeholder="Choose..."
                    value={deductionComponent}
                    onChange={(e) => setDeductionComponent(e.target.value)}
                  >
                    <MenuItem value="" disabled>
                      Choose...
                    </MenuItem>
                    {deductionOptions.map((c) => (
                      <MenuItem key={c.id} value={c.code}>
                        {c.name} ({c.code})
                      </MenuItem>
                    ))}
                  </TextInput>
                </Grid>
                <Grid item xs={5}>
                  <TextInput
                    placeholder="e.g. 12% of Basic"
                    value={deductionCalc}
                    onChange={(e) => setDeductionCalc(e.target.value)}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    type="button"
                    variant="contained"
                    fullWidth
                    onClick={handleAddDeduction}
                    sx={{
                      backgroundColor: "#E2E8F0",
                      color: "#1E293B",
                      fontWeight: 700,
                      textTransform: "none",
                      height: 40,
                      borderRadius: "10px",
                      boxShadow: "none",
                      "&:hover": { backgroundColor: "#CBD5E1", boxShadow: "none" },
                    }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
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
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default CreateStructureTemplateDialog;
