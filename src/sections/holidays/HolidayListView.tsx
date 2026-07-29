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
import Menu from "@mui/material/Menu";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

import IconButton from "@mui/material/IconButton";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import TextInput from "../../components/input/TextInput";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import type { AppDispatch } from "../../store/store";
import type { RootState } from "../../store/rootReducer";
import { usePermissions } from "../../hooks/usePermissions";
import { useDialog } from "../../hooks/useDialog";
import { useSubmitSuccess } from "../../hooks/useSubmitSuccess";
import {
  listHolidaysRequest,
  createHolidayRequest,
  updateHolidayRequest,
  deleteHolidayRequest,
  seedDefaultHolidaysRequest,
  resetLeaveStatus,
} from "../../store/leave";
import type { Holiday, HolidayScope } from "../../api/leave.api";
import { listBranches } from "../../api/branch.api";
import type { Branch } from "../../store/branch/branch.types";

// ============================================================
// Create / Edit Holiday Form Dialog Component
// ============================================================

interface HolidayFormProps {
  open: boolean;
  editingHoliday: Holiday | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (data: any, id?: string) => void;
}

function HolidayFormDialog({
  open,
  editingHoliday,
  submitting,
  error,
  onClose,
  onSubmit,
}: HolidayFormProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<"NATIONAL" | "RESTRICTED" | "REGIONAL">("NATIONAL");
  const [scope, setScope] = useState<HolidayScope>("GLOBAL");
  const [countryCode, setCountryCode] = useState("IN");
  const [stateCode, setStateCode] = useState("Karnataka");
  const [branchId, setBranchId] = useState("");
  const [isOptional, setIsOptional] = useState(false);
  const [description, setDescription] = useState("");

  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    if (open) {
      if (editingHoliday) {
        setName(editingHoliday.name || "");
        setDate(editingHoliday.date ? editingHoliday.date.slice(0, 10) : "");
        setType(editingHoliday.type || "NATIONAL");
        setScope(editingHoliday.scope || "GLOBAL");
        setCountryCode(editingHoliday.countryCode || "IN");
        setStateCode(editingHoliday.stateCode || "Karnataka");
        setBranchId(editingHoliday.branchId || "");
        setIsOptional(Boolean(editingHoliday.isOptional));
        setDescription(editingHoliday.description || "");
      } else {
        setName("");
        setDate("");
        setType("NATIONAL");
        setScope("GLOBAL");
        setCountryCode("IN");
        setStateCode("Karnataka");
        setBranchId("");
        setIsOptional(false);
        setDescription("");
      }

      listBranches()
        .then((res) => {
          if (res?.data && Array.isArray(res.data)) {
            setBranches(res.data);
            if (!editingHoliday && res.data.length > 0) {
              setBranchId(res.data[0]._id);
            }
          }
        })
        .catch((err) => console.error("Failed to load branches for holiday modal", err));
    }
  }, [open, editingHoliday]);

  const handleSubmit = () => {
    if (!name.trim() || !date) return;

    const payload: any = {
      name: name.trim(),
      date,
      type,
      scope,
      isOptional,
      description: description.trim() || undefined,
    };

    if (scope === "BRANCH") {
      if (!branchId) return;
      payload.branchId = branchId;
    } else if (scope === "COUNTRY") {
      payload.countryCode = countryCode.trim() || "IN";
    } else if (scope === "STATE") {
      payload.countryCode = countryCode.trim() || "IN";
      payload.stateCode = stateCode.trim() || undefined;
    }

    onSubmit(payload, editingHoliday?._id);
  };

  const isSubmitDisabled =
    submitting ||
    !name.trim() ||
    !date ||
    (scope === "BRANCH" && !branchId) ||
    (scope === "COUNTRY" && !countryCode.trim()) ||
    (scope === "STATE" && (!countryCode.trim() || !stateCode.trim()));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editingHoliday ? "Edit Holiday" : "Add New Holiday"}
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        <TextInput
          label="Holiday Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Republic Day or Bangalore Office Day Off"
          required
        />

        <TextInput
          type="date"
          label="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <TextInput
          select
          label="Holiday Type"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
        >
          <MenuItem value="NATIONAL">National Holiday</MenuItem>
          <MenuItem value="RESTRICTED">Restricted Holiday</MenuItem>
          <MenuItem value="REGIONAL">Regional Holiday</MenuItem>
        </TextInput>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <TextInput
            select
            label="Holiday Scope"
            value={scope}
            onChange={(e) => setScope(e.target.value as HolidayScope)}
          >
            <MenuItem value="GLOBAL">Global (Entire Organization / Tenant)</MenuItem>
            <MenuItem value="COUNTRY">Country Scope (e.g. IN, US)</MenuItem>
            <MenuItem value="STATE">State Scope (e.g. Karnataka, California)</MenuItem>
            <MenuItem value="BRANCH">Branch Scope (Local Office Override)</MenuItem>
          </TextInput>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Determines whether this holiday applies Globally, per Country, per State, or to a specific Branch.
          </Typography>
        </Box>

        {/* Dynamic Fields Based on Selected Scope */}
        {scope === "BRANCH" && (
          <TextInput
            select
            label="Select Target Branch"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            required
          >
            {branches.map((b) => (
              <MenuItem key={b._id} value={b._id}>
                {b.name || (b as any).branchName} ({b.address?.city || b.code || "Branch"})
              </MenuItem>
            ))}
          </TextInput>
        )}

        {(scope === "COUNTRY" || scope === "STATE") && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <TextInput
              label="Country Code"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              placeholder="e.g. IN or US"
              required
            />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              2-letter ISO country code (e.g. IN, US)
            </Typography>
          </Box>
        )}

        {scope === "STATE" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <TextInput
              label="State Code / State Name"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              placeholder="e.g. Karnataka or KA"
              required
            />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              State code or full state name (e.g. Karnataka or KA)
            </Typography>
          </Box>
        )}

        <FormControlLabel
          control={<Switch checked={isOptional} onChange={(e) => setIsOptional(e.target.checked)} color="primary" />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Is Optional Holiday</Typography>
              <Typography variant="caption" color="text.secondary">Employees can choose to take this leave or not</Typography>
            </Box>
          }
        />

        <TextInput
          multiline
          rows={2}
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description or context"
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={submitting} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          variant="contained"
          sx={{
            backgroundColor: "#6D5DF6",
            "&:hover": { backgroundColor: "#5B4EE4" },
            fontWeight: 600,
            px: 3,
          }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : editingHoliday ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================
// Seed Default Statutory Holidays Dialog Component
// ============================================================

interface SeedHolidaysProps {
  open: boolean;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (params?: { countryCode?: string; stateCode?: string }) => void;
}

function SeedHolidaysDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: SeedHolidaysProps) {
  const [countryCode, setCountryCode] = useState("IN");
  const [stateCode, setStateCode] = useState("");

  useEffect(() => {
    if (open) {
      setCountryCode("IN");
      setStateCode("");
    }
  }, [open]);

  const handleSubmit = () => {
    onSubmit({
      countryCode: countryCode.trim() || undefined,
      stateCode: stateCode.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
        <AutoAwesomeIcon sx={{ color: "#6D5DF6" }} />
        Seed Default Statutory Holidays
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Alert severity="info" sx={{ fontSize: "13px" }}>
          Generates statutory national (COUNTRY) & cantonal/regional (STATE) holidays for the selected country and state. Idempotent & safe to execute.
        </Alert>

        <TextField
          select
          fullWidth
          label="Target Country Code"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
        >
          <MenuItem value="IN">India (IN) — Primary Org Country</MenuItem>
          <MenuItem value="CH">Switzerland (CH)</MenuItem>
          <MenuItem value="US">United States (US)</MenuItem>
          <MenuItem value="UK">United Kingdom (UK)</MenuItem>
          <MenuItem value="CA">Canada (CA)</MenuItem>
          <MenuItem value="AU">Australia (AU)</MenuItem>
        </TextField>

        <TextInput
          label="State / Canton Code (Optional)"
          value={stateCode}
          onChange={(e) => setStateCode(e.target.value)}
          placeholder="e.g. ZH (Zurich), GE, KA, NY, CA"
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ color: "text.secondary", textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          variant="contained"
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
          sx={{
            backgroundColor: "#6D5DF6",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { backgroundColor: "#5B4EE4" },
          }}
        >
          Seed Statutory Holidays
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import { resolveBranchHolidays } from "../../api/leave.api";
import useBranchCalendar from "../../hooks/useBranchCalendar";
import useMySchedule from "../../hooks/useMySchedule";
import BranchCalendarGrid from "../../components/calendar/BranchCalendarGrid";

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
  const [viewMode, setViewMode] = useState<"ALL" | "RESOLVED" | "GRID" | "MY_SCHEDULE">("ALL");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [branchesList, setBranchesList] = useState<Branch[]>([]);
  const [resolvedHolidays, setResolvedHolidays] = useState<Holiday[]>([]);
  const [loadingResolved, setLoadingResolved] = useState(false);

  // Hook for Point 3: Fetch Branch Monthly Calendar (/branches/:branchId/calendar)
  const branchCalendar = useBranchCalendar({
    branchId: selectedBranchId,
    initialYear: selectedYear,
    initialMonth: new Date().getMonth() + 1,
    autoFetch: viewMode === "GRID",
  });

  // Hook for Point 4: Fetch Personal Schedule (/branches/me/schedule)
  const mySchedule = useMySchedule({
    initialYear: selectedYear,
    initialMonth: new Date().getMonth() + 1,
    autoFetch: viewMode === "MY_SCHEDULE",
  });

  const formDialog = useDialog<any>();
  const seedDialog = useDialog();

  // Fetch all master holidays when selectedYear changes
  useEffect(() => {
    dispatch(listHolidaysRequest(selectedYear));
  }, [dispatch, selectedYear]);

  // Load branches list on mount
  useEffect(() => {
    listBranches()
      .then((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setBranchesList(res.data);
          setSelectedBranchId(res.data[0]._id);
        }
      })
      .catch((err) => console.error("Failed loading branches", err));
  }, []);

  // Fetch resolved holidays when in RESOLVED view mode or when branch/year changes
  useEffect(() => {
    if (viewMode === "RESOLVED" && selectedBranchId) {
      setLoadingResolved(true);
      resolveBranchHolidays(selectedBranchId, selectedYear)
        .then((res) => {
          if (res?.data && Array.isArray(res.data)) {
            setResolvedHolidays(res.data);
          }
        })
        .catch((err) => console.error("Failed to resolve branch holidays", err))
        .finally(() => setLoadingResolved(false));
    }
  }, [viewMode, selectedBranchId, selectedYear]);

  // Handle success auto-close
  useSubmitSuccess({
    submitting,
    success,
    error,
    onSuccess: () => {
      formDialog.close();
      seedDialog.close();
      dispatch(listHolidaysRequest(selectedYear));
      if (viewMode === "RESOLVED" && selectedBranchId) {
        resolveBranchHolidays(selectedBranchId, selectedYear)
          .then((res) => {
            if (res?.data && Array.isArray(res.data)) {
              setResolvedHolidays(res.data);
            }
          })
          .catch((err) => console.error(err));
      }
    },
  });

  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [deletingHoliday, setDeletingHoliday] = useState<Holiday | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [actionHoliday, setActionHoliday] = useState<Holiday | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, item: Holiday) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setActionHoliday(item);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActionHoliday(null);
  };

  const handleOpenCreate = () => {
    setEditingHoliday(null);
    dispatch(resetLeaveStatus());
    formDialog.open();
  };

  const handleOpenSeed = () => {
    dispatch(resetLeaveStatus());
    seedDialog.open();
  };

  const handleSeedSubmit = (params?: { countryCode?: string; stateCode?: string }) => {
    dispatch(seedDefaultHolidaysRequest(params));
  };

  const handleOpenEdit = (item: Holiday) => {
    setEditingHoliday(item);
    dispatch(resetLeaveStatus());
    formDialog.open();
  };

  const handleFormSubmit = (data: any, id?: string) => {
    if (id) {
      dispatch(updateHolidayRequest(id, data));
    } else {
      dispatch(createHolidayRequest(data));
    }
  };

  const handleOpenDelete = (item: Holiday) => {
    setDeletingHoliday(item);
  };

  const handleCloseDelete = () => {
    setDeletingHoliday(null);
  };

  const handleConfirmDelete = () => {
    if (deletingHoliday?._id) {
      dispatch(deleteHolidayRequest(deletingHoliday._id));
      setDeletingHoliday(null);
    }
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

  const getScopeChip = (item: Holiday) => {
    const scope = item.scope || "GLOBAL";
    if (scope === "BRANCH") {
      return {
        label: "BRANCH",
        bg: "#E0E7FF",
        color: "#4338CA",
      };
    }
    if (scope === "STATE") {
      return {
        label: `STATE (${item.stateCode || "Regional"})`,
        bg: "#CCFBF1",
        color: "#0F766E",
      };
    }
    if (scope === "COUNTRY") {
      return {
        label: `COUNTRY (${item.countryCode || "IN"})`,
        bg: "#E0F2FE",
        color: "#0369A1",
      };
    }
    return {
      label: "GLOBAL",
      bg: "#EDE9FE",
      color: "#7C3AED",
    };
  };

  const displayHolidaysList = viewMode === "RESOLVED" ? resolvedHolidays : holidays;
  const isDataLoading = viewMode === "RESOLVED" ? loadingResolved : loading;
  const selectedBranchObj = branchesList.find((b) => b._id === selectedBranchId);

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
                Configure multi-scope organization holidays & resolve branch priority calendars
              </Typography>
            </Box>
          </Box>

          {canCreate && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<AutoAwesomeIcon sx={{ color: "#6D5DF6" }} />}
                onClick={handleOpenSeed}
                sx={{
                  borderColor: "#6D5DF6",
                  color: "#6D5DF6",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  "&:hover": { borderColor: "#5B4EE4", backgroundColor: "#F5F3FF" },
                }}
              >
                Seed Defaults
              </Button>
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
            </Box>
          )}
        </Box>

        {/* Filter Toolbar: Year, View Mode, Branch Selector */}
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
              Year:
            </Typography>
            <TextField
              select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
              size="small"
              sx={{ width: 110 }}
            >
              <MenuItem value={2024}>2024</MenuItem>
              <MenuItem value={2025}>2025</MenuItem>
              <MenuItem value={2026}>2026</MenuItem>
              <MenuItem value={2027}>2027</MenuItem>
              <MenuItem value={2028}>2028</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
              View Mode:
            </Typography>
            <TextField
              select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as "ALL" | "RESOLVED")}
              size="small"
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="ALL">All Organization Master Holidays</MenuItem>
              <MenuItem value="RESOLVED">Resolve Branch List (GET /resolve)</MenuItem>
              <MenuItem value="GRID">Branch Monthly Calendar Grid (GET /calendar)</MenuItem>
              <MenuItem value="MY_SCHEDULE">My Personal Schedule (GET /branches/me/schedule)</MenuItem>
            </TextField>
          </Box>

          {(viewMode === "RESOLVED" || viewMode === "GRID") && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                Branch:
              </Typography>
              <TextField
                select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              >
                {branchesList.map((b) => (
                  <MenuItem key={b._id} value={b._id}>
                    {b.name || (b as any).branchName} ({b.address?.city || b.code || "Branch"})
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}
        </Box>

        {viewMode === "RESOLVED" && selectedBranchObj && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Showing priority-resolved calendar for <strong>{selectedBranchObj.name || (selectedBranchObj as any).branchName}</strong>. 
            The engine automatically merges and deduplicates holidays using priority order: <strong>BRANCH &gt; STATE &gt; COUNTRY &gt; GLOBAL</strong>.
          </Alert>
        )}

        {viewMode === "GRID" && (
          <Box sx={{ mb: 4 }}>
            {branchCalendar.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {branchCalendar.error}
              </Alert>
            )}
            {branchCalendar.calendarData ? (
              <BranchCalendarGrid
                data={branchCalendar.calendarData}
                isFetching={branchCalendar.loading}
                onPrevMonth={branchCalendar.handlePrevMonth}
                onNextMonth={branchCalendar.handleNextMonth}
                onResetMonth={branchCalendar.handleResetMonth}
              />
            ) : branchCalendar.loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress sx={{ color: "#6D5DF6" }} />
              </Box>
            ) : (
              <Alert severity="warning">Select a valid branch to view its monthly interactive calendar.</Alert>
            )}
          </Box>
        )}

        {viewMode === "MY_SCHEDULE" && (
          <Box sx={{ mb: 4 }}>
            {mySchedule.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {mySchedule.error}
              </Alert>
            )}
            {mySchedule.scheduleData ? (
              <BranchCalendarGrid
                data={mySchedule.scheduleData}
                isFetching={mySchedule.loading}
                onPrevMonth={mySchedule.handlePrevMonth}
                onNextMonth={mySchedule.handleNextMonth}
                onResetMonth={mySchedule.handleResetMonth}
              />
            ) : mySchedule.loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress sx={{ color: "#6D5DF6" }} />
              </Box>
            ) : (
              <Alert severity="info">No personal schedule found for this period.</Alert>
            )}
          </Box>
        )}

        {/* Content Section for Table Views */}
        {viewMode !== "GRID" && viewMode !== "MY_SCHEDULE" && (
          <>
        {isDataLoading && displayHolidaysList.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#6D5DF6" }} />
          </Box>
        ) : error && !formDialog.isOpen ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : displayHolidaysList.length === 0 ? (
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
              {viewMode === "RESOLVED" ? "No Resolved Holidays for this Branch" : "No Holidays Found"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {viewMode === "RESOLVED"
                ? "No global, country, state, or branch holidays are active for this branch in the selected year."
                : "Holidays represent organization-wide paid calendar closures."}
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
                Create New Holiday
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
                  <TableCell sx={{ fontWeight: 600 }}>Scope</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Is Optional</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, pr: 4 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayHolidaysList.map((type: Holiday) => {
                  const chipStyle = getHolidayTypeChipColor(type.type);
                  const scopeChip = getScopeChip(type);
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
                          label={scopeChip.label}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "11px",
                            backgroundColor: scopeChip.bg,
                            color: scopeChip.color,
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
                      <TableCell align="center" sx={{ pr: 4 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, type)}
                          title="Actions"
                          sx={{ color: "#64748B", "&:hover": { color: "#6D5DF6", backgroundColor: "#F1F5F9" } }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </>
    )}
      </Box>

      {/* Holiday Form Dialog */}
      <HolidayFormDialog
        open={formDialog.isOpen}
        editingHoliday={editingHoliday}
        submitting={submitting}
        error={error}
        onClose={formDialog.close}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingHoliday)}
        title="Delete Holiday"
        content={`Are you sure you want to delete the holiday "${deletingHoliday?.name}"?`}
        confirmLabel="Delete"
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />

      {/* Seed Statutory Default Holidays Dialog */}
      <SeedHolidaysDialog
        open={seedDialog.isOpen}
        submitting={submitting}
        error={error}
        onClose={seedDialog.close}
        onSubmit={handleSeedSubmit}
      />

      {/* Row Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: { borderRadius: 2, minWidth: 140, p: 0.5 },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (actionHoliday) {
              handleOpenEdit(actionHoliday);
            }
            handleCloseMenu();
          }}
        >
          <ListItemIcon sx={{ color: "#6D5DF6", minWidth: "32px !important" }}>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>Edit</Typography>} />
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (actionHoliday) {
              handleOpenDelete(actionHoliday);
            }
            handleCloseMenu();
          }}
          sx={{ color: "#EF4444" }}
        >
          <ListItemIcon sx={{ color: "#EF4444", minWidth: "32px !important" }}>
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>Delete</Typography>} />
        </MenuItem>
      </Menu>
    </DashboardLayout>
  );
}
