import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

import AddIcon from "@mui/icons-material/Add";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import type { AppDispatch } from "../../store/store";
import type { RootState } from "../../store/rootReducer";
import { usePermissions } from "../../hooks/usePermissions";
import { useDialog } from "../../hooks/useDialog";
import { useSubmitSuccess } from "../../hooks/useSubmitSuccess";
import {
  listHolidaysRequest,
  createHolidayRequest,
  resetLeaveStatus,
} from "../../store/leave";
import type { Holiday, CreateHolidayRequest } from "../../api/leave.api";

// ============================================================
// Create Holiday Form Dialog Component
// ============================================================

interface HolidayFormProps {
  open: boolean;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (data: CreateHolidayRequest) => void;
}

function HolidayFormDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: HolidayFormProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<"NATIONAL" | "RESTRICTED" | "REGIONAL">("NATIONAL");
  const [isOptional, setIsOptional] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setDate("");
      setType("NATIONAL");
      setIsOptional(false);
      setDescription("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!name.trim() || !date) return;

    onSubmit({
      name: name.trim(),
      date,
      type,
      isOptional,
      description: description.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Add New Holiday</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Holiday Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          size="small"
          placeholder="e.g. Independence Day"
          required
        />

        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          size="small"
          required
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          select
          label="Holiday Type"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          fullWidth
          size="small"
        >
          <MenuItem value="NATIONAL">National Holiday</MenuItem>
          <MenuItem value="RESTRICTED">Restricted Holiday</MenuItem>
          <MenuItem value="REGIONAL">Regional Holiday</MenuItem>
        </TextField>

        <FormControlLabel
          control={<Switch checked={isOptional} onChange={(e) => setIsOptional(e.target.checked)} color="primary" />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Is Optional Holiday</Typography>
              <Typography variant="caption" color="text.secondary">Employees can choose to take this leave or not</Typography>
            </Box>
          }
        />

        <TextField
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          size="small"
          multiline
          rows={2}
          placeholder="Brief description or context"
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={submitting} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !name.trim() || !date}
          variant="contained"
          sx={{
            backgroundColor: "#6D5DF6",
            "&:hover": { backgroundColor: "#5B4EE4" },
            fontWeight: 600,
            px: 3,
          }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================
// Main HolidayListView Layout Component
// ============================================================

export default function HolidayListView() {
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("holiday.create");

  const { holidays = [], loading, submitting, success, error } = useSelector(
    (state: RootState) => state.leave ?? { holidays: [], loading: false, submitting: false, success: false, error: null }
  );

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const formDialog = useDialog<any>();

  // Fetch list when selectedYear changes
  useEffect(() => {
    dispatch(listHolidaysRequest(selectedYear));
  }, [dispatch, selectedYear]);

  // Handle success auto-close
  useSubmitSuccess({
    submitting,
    success,
    error,
    onSuccess: () => {
      formDialog.close();
      dispatch(listHolidaysRequest(selectedYear));
    },
  });

  const handleOpenCreate = () => {
    dispatch(resetLeaveStatus());
    formDialog.open();
  };

  const handleCreateSubmit = (data: CreateHolidayRequest) => {
    dispatch(createHolidayRequest(data));
  };

  const formatDate = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return dateStr;
    }
  };

  const getHolidayTypeChipColor = (type: string) => {
    switch (type) {
      case "NATIONAL":
        return { backgroundColor: "#FEE2E2", color: "#991B1B" };
      case "RESTRICTED":
        return { backgroundColor: "#FEF3C7", color: "#92400E" };
      case "REGIONAL":
      default:
        return { backgroundColor: "#E0F2FE", color: "#075985" };
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CalendarMonthOutlinedIcon sx={{ fontSize: 36, color: "#6D5DF6" }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Holidays
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Configure and view organization-wide holidays
              </Typography>
            </Box>
          </Box>

          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              sx={{
                backgroundColor: "#6D5DF6",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                "&:hover": { backgroundColor: "#5B4EE4" },
              }}
            >
              Add Holiday
            </Button>
          )}
        </Box>

        {/* Year Filter Dropdown */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
            Select Year:
          </Typography>
          <TextField
            select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
            size="small"
            sx={{ width: 120 }}
          >
            <MenuItem value={2024}>2024</MenuItem>
            <MenuItem value={2025}>2025</MenuItem>
            <MenuItem value={2026}>2026</MenuItem>
            <MenuItem value={2027}>2027</MenuItem>
            <MenuItem value={2028}>2028</MenuItem>
          </TextField>
        </Box>

        {/* Content Section */}
        {loading && holidays.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#6D5DF6" }} />
          </Box>
        ) : error && !formDialog.isOpen ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : holidays.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
              border: "1px dashed rgba(224, 224, 224, 1)",
              boxShadow: "none",
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Holidays Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Holidays represent organization-wide paid calendar closures.
            </Typography>
            {canCreate && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
                sx={{
                  backgroundColor: "#6D5DF6",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#5B4EE4" },
                }}
              >
                Create Your First Holiday
              </Button>
            )}
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)", border: "1px solid rgba(224, 224, 224, 0.8)" }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#F9FAFB" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Holiday Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Is Optional</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {holidays.map((type: Holiday) => {
                  const chipStyle = getHolidayTypeChipColor(type.type);
                  return (
                    <TableRow key={type._id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{type.name}</TableCell>
                      <TableCell>{formatDate(type.date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={type.type}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            backgroundColor: chipStyle.backgroundColor,
                            color: chipStyle.color,
                            borderRadius: 1.5,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={type.isOptional ? "Optional" : "Mandatory"}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            backgroundColor: type.isOptional ? "#F3F4F6" : "#ECFDF5",
                            color: type.isOptional ? "#374151" : "#047857",
                            borderRadius: 1.5,
                          }}
                        />
                      </TableCell>
                      <TableCell color="text.secondary">
                        {type.description || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Holiday Form Dialog */}
      <HolidayFormDialog
        open={formDialog.isOpen}
        submitting={submitting}
        error={error}
        onClose={formDialog.close}
        onSubmit={handleCreateSubmit}
      />
    </DashboardLayout>
  );
}
