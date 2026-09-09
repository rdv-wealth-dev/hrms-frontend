import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import OutlinedInput from "@mui/material/OutlinedInput";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";

import StatusChip from "../../../components/common/StatusChip";
import type { PtStateGroup, PtSlabRule } from "../../../types/payroll.types";
import { saveProfessionalTaxSlabs } from "../../../api/payroll.api";

interface ProfessionalTaxSlabsContentProps {
  data?: PtStateGroup[];
}

interface SlabFormRow {
  id: string;
  minSalary: number | string;
  maxSalary: number | string;
  ptAmount: number | string;
}

const DEFAULT_SLABS: SlabFormRow[] = [
  { id: "slab-1", minSalary: 0, maxSalary: 7500, ptAmount: 0 },
  { id: "slab-2", minSalary: 7501, maxSalary: 10000, ptAmount: 175 },
  { id: "slab-3", minSalary: 10001, maxSalary: 0, ptAmount: 200 },
];

export function ProfessionalTaxSlabsContent({
  data,
}: ProfessionalTaxSlabsContentProps) {
  const initialGroup = data?.[0];

  const [stateCode, setStateCode] = useState<string>(initialGroup?.stateCode ?? "MH");
  const [stateName, setStateName] = useState<string>(initialGroup?.stateName ?? "Maharashtra");
  const [financialYear, setFinancialYear] = useState<string>(initialGroup?.financialYear ?? "2026-27");
  const [frequency, setFrequency] = useState<string>(initialGroup?.frequency ?? "MONTHLY");

  const [slabs, setSlabs] = useState<SlabFormRow[]>(() => {
    if (initialGroup?.slabs?.length) {
      return initialGroup.slabs.map((s, idx) => ({
        id: s.id || `slab-${idx + 1}`,
        minSalary: s.minSalary,
        maxSalary: s.maxSalary,
        ptAmount: s.ptAmount,
      }));
    }
    return DEFAULT_SLABS;
  });

  // Inline add slab inputs
  const [newMin, setNewMin] = useState<string>("");
  const [newMax, setNewMax] = useState<string>("");
  const [newPtAmount, setNewPtAmount] = useState<string>("");

  // API Call States
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAddSlab = () => {
    if (newMin === "" || newPtAmount === "") {
      setErrorMsg("Please enter Min salary and PT amount.");
      return;
    }
    setErrorMsg(null);
    const newSlabItem: SlabFormRow = {
      id: `slab-${Date.now()}`,
      minSalary: Number(newMin) || 0,
      maxSalary: newMax !== "" ? Number(newMax) : 0,
      ptAmount: Number(newPtAmount) || 0,
    };
    setSlabs((prev) => [...prev, newSlabItem]);
    setNewMin("");
    setNewMax("");
    setNewPtAmount("");
  };

  const handleDeleteSlab = (id: string) => {
    setSlabs((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveConfiguration = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!stateCode.trim() || !stateName.trim()) {
      setErrorMsg("State Code and State Name are required.");
      return;
    }

    if (slabs.length === 0) {
      setErrorMsg("At least one tax slab rule is required.");
      return;
    }

    const formattedSlabs: PtSlabRule[] = slabs.map((s) => ({
      minSalary: Number(s.minSalary) || 0,
      maxSalary: Number(s.maxSalary) || 0,
      ptAmount: Number(s.ptAmount) || 0,
    }));

    setSaving(true);
    try {
      await saveProfessionalTaxSlabs({
        stateCode: stateCode.trim(),
        stateName: stateName.trim(),
        financialYear: financialYear.trim(),
        frequency,
        slabs: formattedSlabs,
      });
      setSuccessMsg(`Professional Tax Slabs for ${stateName} saved successfully!`);
    } catch (err: any) {
      console.error("Failed to save PT Slabs:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save Professional Tax Slabs configuration.";
      setErrorMsg(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
      {/* 1. Header Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              letterSpacing: "-0.3px",
            }}
          >
            Professional Tax (PT) Slabs
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Configure state-wise Professional Tax slab rules and deduction amounts
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <StatusChip
            variant="outlined"
            label={`${financialYear} · STATUTORY`}
            sx={{
              fontWeight: 700,
              fontSize: "0.8125rem",
              borderColor: "primary.main",
              color: "primary.main",
              backgroundColor: "transparent",
            }}
          />
        </Box>
      </Box>

      {/* 2. Endpoint Indicator Pill */}
      <Box sx={{ mb: 2.5 }}>
        <Box
          component="span"
          sx={{
            display: "inline-block",
            px: 1.25,
            py: 0.5,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "success.light",
            color: "success.dark",
            backgroundColor: "success.50",
            fontFamily: "monospace",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          POST /payroll/statutory/pt
        </Box>
      </Box>

      {/* Alerts */}
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      {/* 3. State Slabs Card */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: { xs: "100%", md: 850 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          {/* Metadata Controls */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                State Name
              </Typography>
              <OutlinedInput
                size="small"
                fullWidth
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="Maharashtra"
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                State Code
              </Typography>
              <OutlinedInput
                size="small"
                fullWidth
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                placeholder="MH"
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                Financial Year
              </Typography>
              <OutlinedInput
                size="small"
                fullWidth
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                placeholder="2026-27"
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                Frequency
              </Typography>
              <FormControl size="small" fullWidth>
                <Select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <MenuItem value="MONTHLY">MONTHLY</MenuItem>
                  <MenuItem value="HALF_YEARLY">HALF_YEARLY</MenuItem>
                  <MenuItem value="ANNUALLY">ANNUALLY</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 2,
            }}
          >
            Slabs Matrix ({stateName})
          </Typography>

          {/* Slabs Table */}
          <TableContainer sx={{ overflowX: "auto", mb: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <Table size="small" aria-label="professional tax slabs table">
              <TableHead sx={{ backgroundColor: "action.hover" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>
                    Min Monthly Salary (₹)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>
                    Max Monthly Salary (₹)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>
                    PT Amount (₹)
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {slabs.map((slab) => (
                  <TableRow key={slab.id} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                    <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                      ₹{slab.minSalary}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                      {Number(slab.maxSalary) === 0 ? "Above (No Cap)" : `₹${slab.maxSalary}`}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem", color: "primary.main" }}>
                      ₹{slab.ptAmount}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteSlab(slab.id)}
                        title="Delete Slab"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {slabs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No tax slabs configured yet. Add a slab below.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Inline Add Slab Form Row */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "grey.50",
              mb: 3,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", mb: 1.5, display: "block" }}>
              ADD NEW SLAB RULE
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                flexWrap: { xs: "wrap", sm: "nowrap" },
                gap: 2,
              }}
            >
              <Box sx={{ flex: { xs: "1 1 calc(50% - 8px)", sm: 1 } }}>
                <Typography variant="caption" sx={{ fontWeight: 500, color: "text.secondary", mb: 0.5, display: "block" }}>
                  Min Salary
                </Typography>
                <OutlinedInput
                  size="small"
                  type="number"
                  fullWidth
                  value={newMin}
                  onChange={(e) => setNewMin(e.target.value)}
                  placeholder="e.g. 7501"
                  sx={{ height: 38, borderRadius: 1.5, backgroundColor: "background.paper" }}
                />
              </Box>

              <Box sx={{ flex: { xs: "1 1 calc(50% - 8px)", sm: 1 } }}>
                <Typography variant="caption" sx={{ fontWeight: 500, color: "text.secondary", mb: 0.5, display: "block" }}>
                  Max Salary (0 = Unlimited)
                </Typography>
                <OutlinedInput
                  size="small"
                  type="number"
                  fullWidth
                  value={newMax}
                  onChange={(e) => setNewMax(e.target.value)}
                  placeholder="e.g. 10000"
                  sx={{ height: 38, borderRadius: 1.5, backgroundColor: "background.paper" }}
                />
              </Box>

              <Box sx={{ flex: { xs: "1 1 calc(50% - 8px)", sm: 1 } }}>
                <Typography variant="caption" sx={{ fontWeight: 500, color: "text.secondary", mb: 0.5, display: "block" }}>
                  PT Amount (₹)
                </Typography>
                <OutlinedInput
                  size="small"
                  type="number"
                  fullWidth
                  value={newPtAmount}
                  onChange={(e) => setNewPtAmount(e.target.value)}
                  placeholder="e.g. 175"
                  sx={{ height: 38, borderRadius: 1.5, backgroundColor: "background.paper" }}
                />
              </Box>

              <Box sx={{ flex: { xs: "1 1 100%", sm: "none" } }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddSlab}
                  sx={{
                    height: 38,
                    width: { xs: "100%", sm: "auto" },
                    px: 2.5,
                    borderRadius: 1.5,
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    textTransform: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Add Slab
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Action Footer */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1 }}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              disabled={saving}
              onClick={handleSaveConfiguration}
              sx={{
                px: 3.5,
                py: 1,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: "0.875rem",
                textTransform: "none",
              }}
            >
              {saving ? "Saving Slabs..." : "Save PT Slabs Configuration"}
            </Button>
          </Box>
        </Paper>

        {/* Footnote */}
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontSize: "0.75rem",
            lineHeight: 1.5,
          }}
        >
          State Professional Tax configuration applies to employees belonging to the selected state branch jurisdiction.
        </Typography>
      </Box>
    </Box>
  );
}

export default ProfessionalTaxSlabsContent;
