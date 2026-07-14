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
import TablePagination from "@mui/material/TablePagination";
import MenuItem from "@mui/material/MenuItem";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import { getAttendanceReport } from "../../api/attendance.api";
import type { AttendanceRecord } from "../../store/attendance/attendance.types";
import AttendanceStatusChip from "../attendance/components/AttendanceStatusChip";
import { formatWorkedTime } from "../../utils/time";
import { usePagination } from "../../hooks/usePagination";
import { useDialog } from "../../hooks/useDialog";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "Late" },
  { value: "HALF_DAY", label: "Half Day" },
  { value: "ON_LEAVE", label: "On Leave" },
  { value: "HOLIDAY", label: "Holiday" },
  { value: "WEEK_OFF", label: "Week Off" },
];

export default function AttendanceReportView() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const [fromDate, setFromDate] = useState(`${year}-${month}-01`);
  const [toDate, setToDate] = useState(`${year}-${month}-${day}`);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detailDialog = useDialog<AttendanceRecord>();
  const { pageNumber, pageSize, handlePageChange, handleRowsPerPageChange, setPageNumber } =
    usePagination({ initialPageSize: 10 });

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeStatus = statusFilter === "ALL" ? undefined : statusFilter;
      const response = await getAttendanceReport(
        fromDate,
        toDate,
        pageNumber,
        pageSize,
        activeStatus
      );

      if (response.succeeded && response.data) {
        setRecords(response.data.data);
        setTotalRecords(response.data.totalRecords);
      } else {
        setError(response.message || "Failed to fetch attendance report");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to load attendance report"
      );
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch report when pagination changes
  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize]);

  const handleApplyFilter = () => {
    setPageNumber(1); // Reset to page 1 on new filter criteria
    fetchReport();
  };

  const handleResetFilter = () => {
    setFromDate(`${year}-${month}-01`);
    setToDate(`${year}-${month}-${day}`);
    setStatusFilter("ALL");
    setPageNumber(1);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(navigator.language, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
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

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
          <AssessmentOutlinedIcon sx={{ fontSize: 36, color: "#6D5DF6" }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
              Attendance Report
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and analyze organization-wide attendance records and statuses
            </Typography>
          </Box>
        </Box>

        {/* Filter Card */}
        <Card
          sx={{
            p: 2.5,
            borderRadius: 3,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            mb: 4,
            border: "1px solid rgba(0,0,0,0.03)",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              alignItems: { xs: "stretch", md: "center" },
            }}
          >
            <TextField
              label="From Date"
              type="date"
              size="small"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: { xs: "100%", md: 180 } }}
            />
            <TextField
              label="To Date"
              type="date"
              size="small"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: { xs: "100%", md: 180 } }}
            />
            <TextField
              select
              label="Status"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ width: { xs: "100%", md: 180 } }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: "flex", gap: 1.5, ml: { md: "auto" } }}>
              <Button
                variant="outlined"
                onClick={handleResetFilter}
                disabled={loading}
                startIcon={<RestartAltIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  borderColor: "#D1D5DB",
                  color: "#4B5563",
                  height: 40,
                  "&:hover": { borderColor: "#9CA3AF", backgroundColor: "#F9FAFB" },
                }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={handleApplyFilter}
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
            </Box>
          </Box>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Report Content Table */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(224, 224, 224, 0.8)",
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          {loading && records.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: "#6D5DF6" }} />
            </Box>
          ) : records.length === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 1.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: "#4B5563" }}>
                No Records Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No attendance entries matched the selected filters.
              </Typography>
            </Box>
          ) : (
            <Box>
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#F9FAFB" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>Employee</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>First Check-In</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>Last Check-Out</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>Worked Hours</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "#4B5563" }} align="center">Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.map((row) => {
                      const empName = row.employeeId
                        // @ts-ignore
                        ? `${row.employeeId.firstName} ${row.employeeId.lastName}`
                        : "Unknown Employee";
                      const empCode = 
                        // @ts-ignore
                        row.employeeId?.employeeCode || "—";

                      return (
                        <TableRow key={row._id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                              {empName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              ID: {empCode}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500, color: "#111827" }}>
                            {formatDate(row.attendanceDate)}
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
                              onClick={() => detailDialog.open(row)}
                              sx={{ color: "#6D5DF6", "&:hover": { backgroundColor: "rgba(109, 93, 246, 0.08)" } }}
                              title="View Details"
                            >
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={totalRecords}
                rowsPerPage={pageSize}
                page={pageNumber - 1}
                onPageChange={(_, newPage) => handlePageChange(newPage + 1)}
                onRowsPerPageChange={(e) => handleRowsPerPageChange(parseInt(e.target.value, 10))}
              />
            </Box>
          )}
        </Card>

        {/* Record Details Dialog */}
        <Dialog
          open={detailDialog.isOpen}
          onClose={detailDialog.close}
          fullWidth
          maxWidth="sm"
          slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
              Attendance Details
            </Typography>
            <IconButton onClick={detailDialog.close} size="small" sx={{ color: "#9CA3AF" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ borderTop: "1px solid rgba(0,0,0,0.08)", borderBottom: "1px solid rgba(0,0,0,0.08)", py: 2.5 }}>
            {detailDialog.target && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Header Meta */}
                <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      Employee
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                      {/* @ts-ignore */}
                      {detailDialog.target.employeeId ? `${detailDialog.target.employeeId.firstName} ${detailDialog.target.employeeId.lastName}` : "Unknown"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      Date
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                      {formatDate(detailDialog.target.attendanceDate)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      Daily Status
                    </Typography>
                    <AttendanceStatusChip status={detailDialog.target.status} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      Worked Duration
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#6D5DF6" }}>
                      {formatWorkedTime(detailDialog.target.workedMinutes)}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                {/* Session Punch List */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "#374151" }}>
                    Recorded Punch Sessions
                  </Typography>
                  {detailDialog.target.sessions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      No manual punch sessions logged for this record.
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {detailDialog.target.sessions.map((session, idx) => {
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
            <Button
              onClick={detailDialog.close}
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
      </Box>
    </DashboardLayout>
  );
}
