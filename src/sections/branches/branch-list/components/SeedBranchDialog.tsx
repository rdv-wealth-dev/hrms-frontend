import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

import type { Branch } from "../../../../store/branch/branch.types";
import { seedBranchMasterData } from "../../../../api/branch.api";
import { seedDefaultDepartments, listDepartments } from "../../../../api/department.api";
import { seedDefaultDesignations } from "../../../../api/designation.api";
import { seedDefaultHolidays } from "../../../../api/leave.api";
import { useSnackbar } from "../../../../components/snackbar";

interface SeedBranchDialogProps {
  open: boolean;
  branch: Branch | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SeedBranchDialog({
  open,
  branch,
  onClose,
  onSuccess,
}: SeedBranchDialogProps) {
  const { showSnackbar } = useSnackbar();

  const [seedMaster, setSeedMaster] = useState(true);
  const [seedDepts, setSeedDepts] = useState(true);
  const [seedDesigs, setSeedDesigs] = useState(true);
  const [seedHols, setSeedHols] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!branch) return null;

  const handleSeed = async () => {
    if (!branch._id) return;
    setLoading(true);
    setError(null);

    const completedTasks: string[] = [];
    const failedTasks: string[] = [];

    try {
      // 1. Seed Branch Master Data (Leave Types & Work Shifts)
      if (seedMaster) {
        try {
          const res = await seedBranchMasterData(branch._id);
          if (res?.succeeded) {
            completedTasks.push("Branch Leave Types & Work Shifts");
          } else {
            failedTasks.push(res?.message || "Branch Master Data");
          }
        } catch (err: any) {
          const msg = err?.response?.data?.message || err?.message || "Failed to seed Branch Master Data";
          failedTasks.push(msg);
        }
      }

      // 2. Seed Default Departments
      let departmentIds: string[] = [];
      if (seedDepts) {
        try {
          departmentIds = await seedDefaultDepartments(branch._id);
          if (departmentIds?.length > 0) {
            completedTasks.push("Default Departments");
          } else {
            completedTasks.push("Departments (Already Initialized)");
          }
        } catch (err: any) {
          const msg = err?.response?.data?.message || err?.message || "Failed to seed Departments";
          failedTasks.push(msg);
        }
      }

      // 3. Seed Default Designations
      if (seedDesigs) {
        try {
          if (departmentIds.length === 0) {
            try {
              const deptList = await listDepartments(1, 50);
              departmentIds = (deptList?.data || []).map((d: any) => d._id);
            } catch {
              departmentIds = [];
            }
          }

          if (departmentIds.length > 0) {
            const desigRes = await seedDefaultDesignations(branch._id, departmentIds);
            if (desigRes) {
              completedTasks.push("Default Designations");
            } else {
              failedTasks.push("Default Designations");
            }
          } else {
            completedTasks.push("Designations (Requires existing department)");
          }
        } catch (err: any) {
          const msg = err?.response?.data?.message || err?.message || "Failed to seed Designations";
          failedTasks.push(msg);
        }
      }

      // 4. Seed Default Holidays
      if (seedHols) {
        try {
          const stateCode = branch.address?.state;
          const countryCode = branch.address?.countryCode;
          const res = await seedDefaultHolidays(countryCode, stateCode);
          if (res?.succeeded || res?.success) {
            completedTasks.push("Default Holidays");
          } else {
            failedTasks.push(res?.message || "Default Holidays");
          }
        } catch (err: any) {
          const msg = err?.response?.data?.message || err?.message || "Failed to seed Holidays";
          failedTasks.push(msg);
        }
      }

      if (failedTasks.length === 0 && completedTasks.length > 0) {
        showSnackbar(`Master data seeded successfully for ${branch.name}!`, "success");
        if (onSuccess) onSuccess();
        onClose();
      } else if (completedTasks.length > 0) {
        showSnackbar(`Seeded partially: ${completedTasks.join(", ")}. Issues: ${failedTasks.join("; ")}`, "warning");
        if (onSuccess) onSuccess();
        onClose();
      } else if (failedTasks.length > 0) {
        setError(failedTasks.join("; "));
      } else {
        setError("Please select at least one master data category to seed.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "An unexpected error occurred during seeding";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: { xs: 1, sm: 2 },
          },
        },
      }}
    >
      {/* Title */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AutoAwesomeIcon sx={{ color: "#6D5DF6", fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
              Seed Master Data for {branch.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Initialize default templates and policies for this branch
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} disabled={loading} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers sx={{ py: { xs: 2, sm: 3 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 3, borderRadius: 2, fontSize: "0.85rem" }}>
          Seeding automatically populates standard starter templates. Existing custom policies will <strong>not</strong> be deleted or overwritten.
        </Alert>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "#374151" }}>
          Select Master Data Categories to Seed:
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={seedMaster}
                onChange={(e) => setSeedMaster(e.target.checked)}
                color="primary"
                disabled={loading}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Branch Master Data (Leave Types & Work Shifts)
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Paid Leave, Sick Leave, Casual Leave & Standard Morning Shift schedules
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={seedDepts}
                onChange={(e) => setSeedDepts(e.target.checked)}
                color="primary"
                disabled={loading}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Starter Departments
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  HR, IT, Engineering, Sales & Marketing, Operations
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={seedDesigs}
                onChange={(e) => setSeedDesigs(e.target.checked)}
                color="primary"
                disabled={loading}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Starter Designations
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Software Engineer, HR Manager, Sales Executive, Operations Lead
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={seedHols}
                onChange={(e) => setSeedHols(e.target.checked)}
                color="primary"
                disabled={loading}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Default Holidays
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Standard National & Regional public holidays
                </Typography>
              </Box>
            }
          />
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          display: "flex",
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: { xs: 1, sm: 1.5 },
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          fullWidth
          sx={{
            display: { xs: "block", sm: "none" },
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            display: { xs: "none", sm: "inline-flex" },
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSeed}
          disabled={loading}
          fullWidth
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircleOutlinedIcon />}
          sx={{
            backgroundColor: "#6D5DF6",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            "&:hover": { backgroundColor: "#5B4EE4" },
          }}
        >
          {loading ? "Seeding Master Data..." : "Seed Selected Master Data"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
