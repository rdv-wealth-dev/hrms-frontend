import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import { usePermissions } from "../../../hooks/usePermissions";
import ManualAttendanceDialog from "../components/ManualAttendanceDialog";
import RegularizeRequestDialog from "../components/RegularizeRequestDialog";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import { getMyAttendanceHistory, getMyRegularizationRequests } from "../../../api/attendance.api";
import { listCompanyEvents, type CompanyEvent } from "../../../api/event.api";
import CreateEventDialog from "../components/CreateEventDialog";
import type { AttendanceRecord, RegularizationRequest } from "../../../store/attendance/attendance.types";
import AttendanceStatusChip from "../components/AttendanceStatusChip";
import { formatWorkedTime } from "../../../utils/time";

export default function MyAttendanceView() {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("attendance.create");
  const [manualOpen, setManualOpen] = useState(false);
  const [regOpen, setRegOpen] = useState(false);
  const [regTarget, setRegTarget] = useState<AttendanceRecord | null>(null);
  
  const [tabValue, setTabValue] = useState(0);
  const [regRequests, setRegRequests] = useState<RegularizationRequest[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const [fromDate, setFromDate] = useState(`${year}-${month}-01`);
  const [toDate, setToDate] = useState(`${year}-${month}-${day}`);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Company Events state
  const [companyEvents, setCompanyEvents] = useState<CompanyEvent[]>([]);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [choiceDate, setChoiceDate] = useState("");
  const [selectedEventDetails, setSelectedEventDetails] = useState<CompanyEvent | null>(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);

  // Map attendance records and company events to calendar events
  const calendarEvents = [
    ...records.map((rec) => {
      let title: string = rec.status;
      let color = "#6B7280"; // Default grey
      
      if (rec.status === "PRESENT") {
        color = "#10B981"; // Green
        title = `Present (${formatWorkedTime(rec.workedMinutes)})`;
      } else if (rec.status === "LATE") {
        color = "#F59E0B"; // Orange
        title = `Late (${formatWorkedTime(rec.workedMinutes)})`;
      } else if (rec.status === "HALF_DAY") {
        color = "#F59E0B"; // Orange
        title = `Half Day (${formatWorkedTime(rec.workedMinutes)})`;
      } else if (rec.status === "ABSENT") {
        color = "#EF4444"; // Red
        title = "Absent";
      } else if (rec.status === "ON_LEAVE") {
        color = "#3B82F6"; // Blue
        title = "On Leave";
      }

      return {
        title,
        start: rec.attendanceDate ? rec.attendanceDate.split("T")[0] : "",
        backgroundColor: color,
        borderColor: color,
        allDay: true,
        extendedProps: { type: "attendance", record: rec },
      };
    }),
    ...companyEvents.map((evt) => ({
      title: `📢 ${evt.title}`,
      start: evt.date ? evt.date.split("T")[0] : "",
      backgroundColor: "#6D5DF6",
      borderColor: "#6D5DF6",
      allDay: true,
      extendedProps: { type: "company_event", event: evt },
    }))
  ];

  const handleEventClick = (info: any) => {
    const ext = info.event.extendedProps;
    if (ext.type === "attendance") {
      if (ext.record) {
        handleOpenDetails(ext.record);
      }
    } else if (ext.type === "company_event") {
      if (ext.event) {
        setSelectedEventDetails(ext.event);
        setEventDetailsOpen(true);
      }
    }
  };

  const handleDateClick = (info: any) => {
    const clickedDateStr = info.dateStr;
    const existing = records.find(r => r.attendanceDate && r.attendanceDate.split("T")[0] === clickedDateStr);
    
    if (existing) {
      handleOpenDetails(existing);
    } else if (canCreate) {
      setChoiceDate(clickedDateStr);
      setChoiceOpen(true);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyAttendanceHistory(fromDate, toDate);
      if (response.succeeded && response.data) {
        // Sort records by date descending
        const sorted = [...response.data].sort((a, b) => {
          const dateA = a.attendanceDate ? new Date(a.attendanceDate).getTime() : 0;
          const dateB = b.attendanceDate ? new Date(b.attendanceDate).getTime() : 0;
          return dateB - dateA;
        });
        setRecords(sorted);
      } else {
        setError(response.message || "Failed to fetch attendance history");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to load attendance history"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRegularizationRequests = async () => {
    setLoadingRegs(true);
    setError(null);
    try {
      const response = await getMyRegularizationRequests();
      if (response.succeeded && response.data) {
        const sorted = [...response.data].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setRegRequests(sorted);
      } else {
        setError(response.message || "Failed to fetch regularization requests");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to load regularization requests"
      );
    } finally {
      setLoadingRegs(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await listCompanyEvents(1, 50);
      if (response.succeeded && response.data) {
        setCompanyEvents(response.data);
      }
    } catch (err) {
      console.error("Failed to load company calendar events", err);
    }
  };

  useEffect(() => {
    if (tabValue === 0) {
      fetchHistory();
      fetchEvents();
    } else {
      fetchRegularizationRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue]);

  const handleRegSuccess = () => {
    fetchHistory();
    if (tabValue === 1) {
      fetchRegularizationRequests();
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(navigator.language, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "—";
    return new Date(timeStr).toLocaleTimeString(navigator.language, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getRegStatusChip = (status: string) => {
    let color = "#F59E0B";
    let bg = "rgba(245, 158, 11, 0.08)";
    let border = "1px solid rgba(245, 158, 11, 0.15)";
    let label = "Pending";

    if (status === "APPROVED") {
      color = "#10B981";
      bg = "rgba(16, 185, 129, 0.08)";
      border = "1px solid rgba(16, 185, 129, 0.15)";
      label = "Approved";
    } else if (status === "REJECTED") {
      color = "#EF4444";
      bg = "rgba(239, 68, 68, 0.08)";
      border = "1px solid rgba(239, 68, 68, 0.15)";
      label = "Rejected";
    }

    return (
      <Chip
        label={label}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: "0.75rem",
          color,
          backgroundColor: bg,
          border,
        }}
      />
    );
  };

  const handleOpenDetails = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedRecord(null);
    setDetailOpen(false);
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <CalendarMonthOutlinedIcon sx={{ fontSize: 32, color: "#6D5DF6" }} />
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
              My Attendance
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Track your daily check-in logs, shifts, and total worked duration
            </Typography>
          </Box>
        </Box>

        {/* Tab Selection */}
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            mb: 3,
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            "& .MuiTabs-indicator": { backgroundColor: "#6D5DF6" },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              color: "#6B7280",
              "&.Mui-selected": { color: "#6D5DF6" },
            },
          }}
        >
          <Tab label="Attendance History" />
          <Tab label="Regularization Requests" />
        </Tabs>

        {tabValue === 0 && (
          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              mb: 3,
              border: "1px solid rgba(0,0,0,0.03)",
              backgroundColor: "#fff",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2.5,
                alignItems: { xs: "stretch", sm: "center" },
              }}
            >
              <TextField
                label="From Date"
                type="date"
                size="small"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ width: { xs: "100%", sm: 200 } }}
              />
              <TextField
                label="To Date"
                type="date"
                size="small"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ width: { xs: "100%", sm: 200 } }}
              />
              <Button
                variant="contained"
                onClick={fetchHistory}
                disabled={loading}
                startIcon={<FilterListIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  height: 40,
                  backgroundColor: "#6D5DF6",
                  "&:hover": { backgroundColor: "#5B4BEA" },
                }}
              >
                Apply Filter
              </Button>
              {canCreate && (
                <Button
                  variant="outlined"
                  onClick={() => setManualOpen(true)}
                  startIcon={<AddIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 3,
                    height: 40,
                    color: "#6D5DF6",
                    borderColor: "#6D5DF6",
                    "&:hover": {
                      borderColor: "#5B4BEA",
                      backgroundColor: "rgba(109, 93, 246, 0.04)",
                    },
                  }}
                >
                  Manual Entry
                </Button>
              )}
              <Box sx={{ flexGrow: 1 }} />
              <Box sx={{ display: "flex", gap: 0.5, border: "1px solid #E5E7EB", p: 0.5, borderRadius: 2.5, backgroundColor: "#F9FAFB" }}>
                <Button
                  size="small"
                  onClick={() => setViewMode("list")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    py: 0.5,
                    backgroundColor: viewMode === "list" ? "#FFF" : "transparent",
                    color: viewMode === "list" ? "#111827" : "#6B7280",
                    boxShadow: viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    "&:hover": { backgroundColor: viewMode === "list" ? "#FFF" : "rgba(0,0,0,0.04)" },
                  }}
                >
                  List
                </Button>
                <Button
                  size="small"
                  onClick={() => setViewMode("calendar")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    py: 0.5,
                    backgroundColor: viewMode === "calendar" ? "#FFF" : "transparent",
                    color: viewMode === "calendar" ? "#111827" : "#6B7280",
                    boxShadow: viewMode === "calendar" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    "&:hover": { backgroundColor: viewMode === "calendar" ? "#FFF" : "rgba(0,0,0,0.04)" },
                  }}
                >
                  Calendar
                </Button>
              </Box>
            </Box>
          </Card>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.03)",
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          {tabValue === 0 ? (
            loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress sx={{ color: "#6D5DF6" }} />
              </Box>
            ) : viewMode === "calendar" ? (
              <Box
                sx={{
                  p: 3.5,
                  "& .fc": {
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                  },
                  "& .fc-header-toolbar": {
                    mb: 3,
                  },
                  "& .fc-toolbar-title": {
                    fontSize: "1.25rem !important",
                    fontWeight: 700,
                    color: "#111827",
                  },
                  "& .fc-button-primary": {
                    backgroundColor: "#FFF !important",
                    borderColor: "#E5E7EB !important",
                    color: "#374151 !important",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderRadius: "8px !important",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    "&:hover": {
                      backgroundColor: "#F9FAFB !important",
                    },
                    "&:disabled": {
                      opacity: 0.5,
                    },
                  },
                  "& .fc-button-group .fc-button": {
                    margin: "0 2px !important",
                  },
                  "& .fc-col-header-cell": {
                    backgroundColor: "#F9FAFB",
                    py: 1.5,
                    border: "1px solid #F3F4F6",
                  },
                  "& .fc-col-header-cell-cushion": {
                    color: "#4B5563 !important",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    textDecoration: "none !important",
                  },
                  "& .fc-daygrid-day-number": {
                    color: "#374151",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    p: 1.5,
                    textDecoration: "none !important",
                  },
                  "& .fc-day": {
                    borderColor: "#F3F4F6 !important",
                  },
                  "& .fc-event": {
                    cursor: "pointer",
                    borderRadius: "6px",
                    px: 1,
                    py: 0.5,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    boxShadow: "none",
                    border: "none",
                    margin: "2px 4px !important",
                  },
                  "& .fc-daygrid-day-frame": {
                    minHeight: "100px",
                  },
                }}
              >
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin] as any}
                  initialView="dayGridMonth"
                  events={calendarEvents}
                  eventClick={handleEventClick}
                  dateClick={handleDateClick}
                  headerToolbar={{
                    left: "title",
                    center: "",
                    right: "prev,next today",
                  }}
                  height="auto"
                />
              </Box>
            ) : records.length === 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: "#4B5563" }}>
                  No Records Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try selecting a different date range or check your internet connection.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>Shift</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>First Check-In</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>Last Check-Out</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>Worked Hours</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }} align="center">Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.map((row) => (
                      <TableRow key={row._id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 500, color: "#111827" }}>
                          {formatDate(row.attendanceDate)}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, color: "#4B5563" }}>
                          General Shift
                        </TableCell>
                        <TableCell sx={{ color: "#111827", fontWeight: 500 }}>
                          {formatTime(row.firstCheckIn)}
                        </TableCell>
                        <TableCell sx={{ color: "#111827", fontWeight: 500 }}>
                          {formatTime(row.lastCheckOut)}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                          {formatWorkedTime(row.workedMinutes)}
                        </TableCell>
                        <TableCell>
                          <AttendanceStatusChip status={row.status} />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDetails(row)}
                            sx={{ color: "#6D5DF6", "&:hover": { backgroundColor: "rgba(109, 93, 246, 0.08)" } }}
                            title="View Details"
                          >
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                          {!row.isRegularized && (
                            <IconButton
                              size="small"
                              onClick={() => {
                                setRegTarget(row);
                                setRegOpen(true);
                              }}
                              sx={{ color: "#10B981", "&:hover": { backgroundColor: "rgba(16, 185, 129, 0.08)" }, ml: 1 }}
                              title="Request Regularization"
                            >
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          ) : (
            loadingRegs ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress sx={{ color: "#6D5DF6" }} />
              </Box>
            ) : regRequests.length === 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: "#4B5563" }}>
                  No Regularization Requests Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You have not submitted any regularization requests yet.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>Target Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>Requested Check-In</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>Requested Check-Out</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>Reason</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>Requested On</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {regRequests.map((row) => (
                      <TableRow key={row._id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 500, color: "#111827" }}>
                          {formatDate(row.attendanceDate)}
                        </TableCell>
                        <TableCell sx={{ color: "#111827", fontWeight: 500 }}>
                          {formatTime(row.requestedCheckIn)}
                        </TableCell>
                        <TableCell sx={{ color: "#111827", fontWeight: 500 }}>
                          {formatTime(row.requestedCheckOut)}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, color: "#4B5563", maxWidth: 220, wordBreak: "break-word" }}>
                          {row.reason}
                        </TableCell>
                        <TableCell>
                          {getRegStatusChip(row.status)}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, color: "#6B7280" }}>
                          {new Date(row.createdAt).toLocaleDateString(navigator.language, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          )}
        </Card>

        <Dialog
          open={detailOpen}
          onClose={handleCloseDetails}
          fullWidth
          maxWidth="sm"
          slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
              Attendance Details
            </Typography>
            <IconButton onClick={handleCloseDetails} size="small" sx={{ color: "#9CA3AF" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ borderTop: "1px solid rgba(0,0,0,0.08)", borderBottom: "1px solid rgba(0,0,0,0.08)", py: 2.5 }}>
            {selectedRecord && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Header Meta */}
                <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      Date
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                      {formatDate(selectedRecord.attendanceDate)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      Daily Status
                    </Typography>
                    <AttendanceStatusChip status={selectedRecord.status} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      Worked Duration
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#6D5DF6" }}>
                      {formatWorkedTime(selectedRecord.workedMinutes)}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                {/* Session Punch List */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "#374151" }}>
                    Recorded Punch Sessions
                  </Typography>
                  {selectedRecord.sessions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      No manual punch sessions logged for this record.
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {selectedRecord.sessions.map((session, idx) => {
                        const isCheckIn = session.type === "CHECK_IN";
                        return (
                          <Box
                            key={idx}
                            sx={{
                              p: 2,
                              borderRadius: 2.5,
                              backgroundColor: isCheckIn ? "rgba(16, 185, 129, 0.03)" : "rgba(239, 68, 68, 0.03)",
                              border: isCheckIn ? "1px solid rgba(16, 185, 129, 0.12)" : "1px solid rgba(239, 68, 68, 0.12)",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 2,
                            }}
                          >
                            <Box>
                              <Chip
                                label={session.type === "CHECK_IN" ? "Clock In" : "Clock Out"}
                                size="small"
                                sx={{
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  backgroundColor: isCheckIn ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                  color: isCheckIn ? "#10B981" : "#EF4444",
                                  mb: 1,
                                }}
                              />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                                {new Date(session.timestamp).toLocaleTimeString(navigator.language, {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  second: "2-digit",
                                  hour12: true,
                                })}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, maxWidth: "320px", wordBreak: "break-all" }}>
                                Device: {session.deviceInfo || "Browser Agent"}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                IP Address
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: "#4B5563", fontSize: 13 }}>
                                {session.ipAddress || "—"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                                Source
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: "#374151" }}>
                                {session.source}
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 2, py: 1.5 }}>
            {selectedRecord && !selectedRecord.isRegularized && (
              <Button
                onClick={() => {
                  setRegTarget(selectedRecord);
                  setRegOpen(true);
                  handleCloseDetails();
                }}
                variant="contained"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  backgroundColor: "#10B981",
                  "&:hover": { backgroundColor: "#059669" },
                  mr: "auto",
                }}
              >
                Request Regularization
              </Button>
            )}
            <Button
              onClick={handleCloseDetails}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#4B5563",
                borderRadius: 2,
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {canCreate && (
          <ManualAttendanceDialog
            open={manualOpen}
            onClose={() => setManualOpen(false)}
            onSuccess={fetchHistory}
            employee={null}
          />
        )}

        <RegularizeRequestDialog
          open={regOpen}
          onClose={() => {
            setRegOpen(false);
            setRegTarget(null);
          }}
          onSuccess={handleRegSuccess}
          record={regTarget}
        />

        {/* Date Click Action Choice Dialog (Admin Only) */}
        <Dialog open={choiceOpen} onClose={() => setChoiceOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Choose Action</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Select what you want to schedule for {choiceDate}:
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setChoiceOpen(false);
                setManualOpen(true);
              }}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                backgroundColor: "#6D5DF6",
                "&:hover": { backgroundColor: "#5B4BE5" },
                m: "0 !important"
              }}
            >
              Manual Attendance Log
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setChoiceOpen(false);
                setCreateEventOpen(true);
              }}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#6D5DF6",
                borderColor: "#6D5DF6",
                "&:hover": { borderColor: "#5B4BE5", backgroundColor: "rgba(109,93,246,0.04)" },
                m: "0 !important"
              }}
            >
              Create Company Event
            </Button>
            <Button
              fullWidth
              onClick={() => setChoiceOpen(false)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#6B7280",
                m: "0 !important"
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Event Dialog */}
        <CreateEventDialog
          open={createEventOpen}
          onClose={() => setCreateEventOpen(false)}
          onSuccess={fetchEvents}
          defaultDate={choiceDate}
        />

        {/* Company Event Details Dialog */}
        <Dialog open={eventDetailsOpen} onClose={() => { setEventDetailsOpen(false); setSelectedEventDetails(null); }} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            📢 {selectedEventDetails?.title}
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              Date & Time
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827", mb: 2 }}>
              {selectedEventDetails?.date
                ? new Date(selectedEventDetails.date).toLocaleString(navigator.language, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "—"}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              Description
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedEventDetails?.description || "No description provided."}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => { setEventDetailsOpen(false); setSelectedEventDetails(null); }}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#4B5563",
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
