import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextInput from "../../../components/input/TextInput";
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
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import { usePermissions } from "../../../hooks/usePermissions";
import ManualAttendanceDialog from "../../attendance/components/ManualAttendanceDialog";
import RegularizeRequestDialog from "../../attendance/components/RegularizeRequestDialog";

import { getMyAttendanceHistory, getMyRegularizationRequests, getAttendanceReport } from "../../../api/attendance.api";
import { listCompanyEvents, type CompanyEvent } from "../../../api/event.api";
import CreateEventDialog from "../../attendance/components/CreateEventDialog";
import type { AttendanceRecord, RegularizationRequest } from "../../../store/attendance/attendance.types";
import AttendanceStatusChip from "../../attendance/components/AttendanceStatusChip";
import { formatWorkedTime } from "../../../utils/time";
import { formatDate, formatTime } from "../../../utils/format-date";
import { StatusChip } from "../../../components/common/StatusChip";
import MonthlyAttendanceSummaryCard from "./MonthlyAttendanceSummaryCard";

interface AttendanceTabProps {
  employeeId?: string;
  isViewingOther?: boolean;
  hideTabs?: boolean;
}

export default function AttendanceTab({ employeeId, isViewingOther = false, hideTabs = false }: AttendanceTabProps) {
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
      backgroundColor: "primary.main",
      borderColor: "primary.main",
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
      let fetchedRecords: AttendanceRecord[] = [];
      if (isViewingOther && employeeId) {
        const response = await getAttendanceReport(fromDate, toDate, 1, 1000, undefined, employeeId);
        if (response.succeeded && response.data?.data) {
          fetchedRecords = response.data.data;
        } else {
          setError(response.message || "Failed to fetch attendance history");
        }
      } else {
        const response = await getMyAttendanceHistory(fromDate, toDate);
        if (response.succeeded && response.data) {
          fetchedRecords = response.data;
        } else {
          setError(response.message || "Failed to fetch attendance history");
        }
      }

      // Sort records by date descending
      const sorted = [...fetchedRecords].sort((a, b) => {
        const dateA = a.attendanceDate ? new Date(a.attendanceDate).getTime() : 0;
        const dateB = b.attendanceDate ? new Date(b.attendanceDate).getTime() : 0;
        return dateB - dateA;
      });
      setRecords(sorted);
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

  // Fetch all data in parallel on mount — both tabs are ready instantly
  useEffect(() => {
    const promises: Promise<any>[] = [fetchHistory(), fetchEvents()];
    if (!isViewingOther) {
      promises.push(fetchRegularizationRequests());
    }
    Promise.all(promises);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isViewingOther, employeeId]);

  // Refetch requests when switching to the requests tab
  useEffect(() => {
    if (tabValue === 1 && !isViewingOther) {
      fetchRegularizationRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue, isViewingOther]);

  const handleRegSuccess = () => {
    fetchHistory();
    fetchRegularizationRequests();
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
    <Box sx={{ py: 1 }}>
      {/* Tab Selection */}
      {!isViewingOther && !hideTabs && (
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            mb: 3,
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            "& .MuiTabs-indicator": { backgroundColor: "primary.main" },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              color: "#6B7280",
              "&.Mui-selected": { color: "primary.main" },
            },
          }}
        >
          <Tab label="Attendance History" />
          <Tab label="Regularization Requests" />
        </Tabs>
      )}

      {tabValue === 0 && (
        <>
          <MonthlyAttendanceSummaryCard employeeId={employeeId} />
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
              flexWrap: "wrap",
              gap: 2,
              alignItems: { xs: "stretch", sm: "flex-end" },
              width: "100%",
            }}
          >
            <Box sx={{ width: { xs: "100%", sm: 180, md: 200 } }}>
              <TextInput
                label="From Date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Box>
            <Box sx={{ width: { xs: "100%", sm: 180, md: 200 } }}>
              <TextInput
                label="To Date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Box>
            <Button
              variant="contained"
              onClick={fetchHistory}
              disabled={loading}
              startIcon={<FilterListIcon />}
              sx={{
                height: 44,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "12px",
                px: 3,
                backgroundColor: "primary.main",
                "&:hover": { backgroundColor: "primary.dark" },
                width: { xs: "100%", sm: "auto" },
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
                  height: 44,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "12px",
                  px: 3,
                  color: "primary.main",
                  borderColor: "primary.main",
                  "&:hover": {
                    borderColor: "primary.dark",
                    backgroundColor: "primary.lighter",
                  },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Manual Entry
              </Button>
            )}
            <Box sx={{ 
              marginLeft: { xs: 0, sm: "auto" }, 
              width: { xs: "100%", sm: "auto" },
              display: "flex",
              justifyContent: { xs: "center", sm: "flex-end" }
            }}>
              <Box sx={{ display: "flex", gap: 0.5, border: "1px solid #E5E7EB", p: 0.5, borderRadius: 2.5, backgroundColor: "#F9FAFB", width: { xs: "100%", sm: "auto" } }}>
                <Button
                  size="small"
                  onClick={() => setViewMode("list")}
                  sx={{
                    flex: { xs: 1, sm: "initial" },
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2.5,
                    py: 0.75,
                    backgroundColor: viewMode === "list" ? "#FFF" : "transparent",
                    color: viewMode === "list" ? "text.primary" : "text.secondary",
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
                    flex: { xs: 1, sm: "initial" },
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2.5,
                    py: 0.75,
                    backgroundColor: viewMode === "calendar" ? "#FFF" : "transparent",
                    color: viewMode === "calendar" ? "text.primary" : "text.secondary",
                    boxShadow: viewMode === "calendar" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    "&:hover": { backgroundColor: viewMode === "calendar" ? "#FFF" : "rgba(0,0,0,0.04)" },
                  }}
                >
                  Calendar
                </Button>
              </Box>
            </Box>
          </Box>
        </Card>
      </>
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
              <CircularProgress sx={{ color: "primary.main" }} />
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
                  color: "text.primary",
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
            <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto", borderRadius: 0 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563", whiteSpace: "nowrap" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563", whiteSpace: "nowrap" }}>Shift</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563", whiteSpace: "nowrap" }}>First Check-In</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563", whiteSpace: "nowrap" }}>Last Check-Out</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563", whiteSpace: "nowrap" }}>Worked Hours</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563", whiteSpace: "nowrap" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563", whiteSpace: "nowrap" }} align="center">Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((row) => (
                    <TableRow key={row._id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 500, color: "text.primary", whiteSpace: "nowrap" }}>
                        {formatDate(row.attendanceDate)}
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, color: "#4B5563", whiteSpace: "nowrap" }}>
                        General Shift
                      </TableCell>
                      <TableCell sx={{ color: "text.primary", fontWeight: 500, whiteSpace: "nowrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                          <span>{formatTime(row.firstCheckIn)}</span>
                          {row.isLate && (
                            <Chip
                              label="Late"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: "10px",
                                fontWeight: 700,
                                backgroundColor: "rgba(245, 158, 11, 0.08)",
                                color: "#F59E0B",
                                border: "1px solid rgba(245, 158, 11, 0.15)",
                                px: 0.5,
                                borderRadius: "4px"
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "text.primary", fontWeight: 500, whiteSpace: "nowrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                          <span>{formatTime(row.lastCheckOut)}</span>
                          {row.isCheckOutEarly && (
                            <Chip
                              label="Early"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: "10px",
                                fontWeight: 700,
                                backgroundColor: "rgba(239, 68, 68, 0.08)",
                                color: "#EF4444",
                                border: "1px solid rgba(239, 68, 68, 0.15)",
                                px: 0.5,
                                borderRadius: "4px"
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>
                        {formatWorkedTime(row.workedMinutes)}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <AttendanceStatusChip status={row.status} />
                      </TableCell>
                      <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDetails(row)}
                          sx={{ color: "primary.main", "&:hover": { backgroundColor: "primary.lighter" } }}
                          title="View Details"
                        >
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                        {!isViewingOther && !row.isRegularized && (
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
              <CircularProgress sx={{ color: "primary.main" }} />
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
            <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto", borderRadius: 0 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563", whiteSpace: "nowrap" }}>Target Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563", whiteSpace: "nowrap" }}>Requested Check-In</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563", whiteSpace: "nowrap" }}>Requested Check-Out</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563", whiteSpace: "nowrap" }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563", whiteSpace: "nowrap" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563", whiteSpace: "nowrap" }}>Requested On</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {regRequests.map((row) => (
                    <TableRow key={row._id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 500, color: "text.primary", whiteSpace: "nowrap" }}>
                        {formatDate(row.attendanceDate)}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary", fontWeight: 500, whiteSpace: "nowrap" }}>
                        {formatTime(row.requestedCheckIn)}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary", fontWeight: 500, whiteSpace: "nowrap" }}>
                        {formatTime(row.requestedCheckOut)}
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, color: "#4B5563", maxWidth: 220, minWidth: 150, wordBreak: "break-word" }}>
                        {row.reason}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <StatusChip status={row.status} />
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, color: "#6B7280", whiteSpace: "nowrap" }}>
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
          <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
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
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {formatDate(selectedRecord.attendanceDate)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                    Daily Status
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AttendanceStatusChip status={selectedRecord.status} />
                    {selectedRecord?.overtimeId && (
                      <Chip
                        label="OT Computed"
                        size="small"
                        sx={{
                          fontSize: "11px",
                          fontWeight: 700,
                          backgroundColor: "#ECFDF5",
                          color: "#047857",
                          border: "1px solid #A7F3D0",
                          height: "22px",
                        }}
                      />
                    )}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Worked Duration
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
                    {formatWorkedTime(selectedRecord.workedMinutes)}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Punch Sessions list */}
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
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                                {new Date(session.timestamp).toLocaleTimeString(navigator.language, {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  second: "2-digit",
                                  hour12: true,
                                })}
                              </Typography>
                              {isCheckIn && selectedRecord.isLate && (
                                <Chip
                                  label="Late"
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: "9px",
                                    fontWeight: 700,
                                    backgroundColor: "rgba(245, 158, 11, 0.08)",
                                    color: "#F59E0B",
                                    border: "1px solid rgba(245, 158, 11, 0.15)",
                                    borderRadius: "4px"
                                  }}
                                />
                              )}
                              {session.type === "CHECK_OUT" && selectedRecord.isCheckOutEarly && (
                                <Chip
                                  label="Early Checkout"
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: "9px",
                                    fontWeight: 700,
                                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                                    color: "#EF4444",
                                    border: "1px solid rgba(239, 68, 68, 0.15)",
                                    borderRadius: "4px"
                                  }}
                                />
                              )}
                            </Box>
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
          {selectedRecord && !isViewingOther && !selectedRecord.isRegularized && (
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

      {/* Date Click Choice (Admin Only) */}
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
              backgroundColor: "primary.main",
              "&:hover": { backgroundColor: "primary.dark" },
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
              color: "primary.main",
              borderColor: "primary.main",
              "&:hover": { borderColor: "primary.dark", backgroundColor: "primary.lighter" },
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
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", mb: 2 }}>
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
  );
}
