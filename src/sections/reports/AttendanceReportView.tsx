import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TablePagination from "@mui/material/TablePagination";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import { getAttendanceReport, listShifts } from "../../api/attendance.api";
import type { AttendanceRecord } from "../../store/attendance/attendance.types";
import { formatWorkedTime } from "../../utils/time";
import { formatTime } from "../../utils/format-date";
import { StatusChip } from "../../components/common/StatusChip";
import { usePagination } from "../../hooks/usePagination";
import { useDialog } from "../../hooks/useDialog";
import { usePermissions } from "../../hooks/usePermissions";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/rootReducer";
import type { AppDispatch } from "../../store/store";
import { listDepartmentsRequest } from "../../store/department";
import { listDesignationsRequest } from "../../store/designation";
import { listBranchesRequest } from "../../store/branch";

import { LazyWeeklyTrendBarChart, type TrendBarData } from "../../components/charts";
import AttendanceKpiCards, { type AttendanceKpiData } from "../../components/card/AttendanceKpiCards";
import TodayStatusBreakdownCard, { type StatusBreakdownData } from "../../components/card/TodayStatusBreakdownCard";
import EmployeeAttendanceTable, { type AttendanceRecordRow } from "../../components/table/EmployeeAttendanceTable";
import { FilterBar } from "../../components/filter";

import ManualAttendanceDialog from "../attendance/components/ManualAttendanceDialog";
import RegularizeRequestDialog from "../attendance/components/RegularizeRequestDialog";

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

const COLOR_PALETTE = [
  "#6D5DF6", "#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899"
];

function getInitials(name?: string): string {
  if (!name) return "EMP";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorForName(name?: string): string {
  if (!name) return COLOR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
}

function getRecordLocalDateStr(r: AttendanceRecord): string {
  const raw = r.attendanceDate || r.firstCheckIn || (r as any).createdAt || "";
  if (!raw) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw.split("T")[0];
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return raw.split("T")[0];
  }
}

export default function AttendanceReportView() {

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  // Start from beginning of current year to show all data
  const yearStart = new Date(year, 0, 1);
  const yearStartStr = `${yearStart.getFullYear()}-01-01`;

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    designationId: "ALL",
    branchId: "ALL",
    departmentId: "ALL",
    status: "ALL",
    fromDate: "",
    toDate: "",
  });

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog State
  const detailDialog = useDialog<AttendanceRecord>();
  const [manualOpen, setManualOpen] = useState(false);
  const [regularizeOpen, setRegularizeOpen] = useState(false);

  const { hasPermission } = usePermissions();
  const canMarkAttendance = hasPermission("attendance.create");

  const dispatch = useDispatch<AppDispatch>();
  const { departments } = useSelector((state: RootState) => state.department);
  const { designations } = useSelector((state: RootState) => state.designation);
  const { branches } = useSelector((state: RootState) => state.branch);

  useEffect(() => {
    dispatch(listDepartmentsRequest());
    dispatch(listDesignationsRequest({ pageNumber: 1, pageSize: 100 }));
    dispatch(listBranchesRequest());
  }, [dispatch]);

  const { pageNumber, pageSize, setPageNumber } =
    usePagination({ initialPageSize: 100 });

  // Client-side pagination state for the filtered table
  const [clientPage, setClientPage] = useState(0);
  const [clientRowsPerPage, setClientRowsPerPage] = useState(25);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeStatus = statusFilter === "ALL" ? undefined : statusFilter;
      
      // Use wide date range if no specific dates are set
      const effectiveFromDate = fromDate || yearStartStr;
      const effectiveToDate = toDate || todayStr;
      
      const response = await getAttendanceReport(
        effectiveFromDate,
        effectiveToDate,
        pageNumber,
        pageSize,
        activeStatus,
        undefined, // employeeId
        filterValues?.designationId !== "ALL" ? filterValues?.designationId : undefined,
        filterValues?.branchId !== "ALL" ? filterValues?.branchId : undefined,
        filterValues?.departmentId !== "ALL" ? filterValues?.departmentId : undefined,
        searchQuery?.trim() || undefined
      );

      if (response) {
        const raw: any = response;
        const dataObj: any = raw?.data ?? raw;

        let list: AttendanceRecord[] = [];
        let total = 0;

        if (Array.isArray(dataObj)) {
          list = dataObj;
          total = dataObj.length;
        } else if (dataObj && Array.isArray(dataObj?.data)) {
          list = dataObj.data;
          total = dataObj?.totalRecords ?? dataObj?.total ?? dataObj.data.length;
        } else if (dataObj && Array.isArray(dataObj?.records)) {
          list = dataObj.records;
          total = dataObj?.totalRecords ?? dataObj.records.length;
        }

        setRecords(list);
        setTotalRecords(total);
      } else {
        setError("Failed to fetch attendance report");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to load attendance report"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pageNumber, 
    pageSize, 
    fromDate, 
    toDate, 
    statusFilter,
    filterValues?.designationId,
    filterValues?.branchId,
    filterValues?.departmentId,
    searchQuery
  ]);




  // Filter today's records specifically for Today's Table and Today's Summary Cards
  const todayRecords = useMemo(() => {
    const list = records.filter((r) => {
      return getRecordLocalDateStr(r) === todayStr;
    });
    return list.length > 0 ? list : records;
  }, [records, todayStr]);

  const [shiftTiming, setShiftTiming] = useState<{
    startTime: string;
    graceMins: number;
  } | null>(null);

  useEffect(() => {
    const fetchDefaultShift = async () => {
      try {
        const res = await listShifts();
        const shiftsArr = Array.isArray(res) ? res : ((res as any)?.data || []);
        if (Array.isArray(shiftsArr) && shiftsArr.length > 0) {
          const def = shiftsArr.find((s: any) => s.isDefault) || shiftsArr[0];
          if (def && def.startTime) {
            setShiftTiming({
              startTime: def.startTime,
              graceMins: def.gracePeriodMinutes ?? 15,
            });
          }
        }
      } catch {
        // Ignore, fallback to default 09:00 AM + 15m grace
      }
    };
    fetchDefaultShift();
  }, []);

  const formatMinsTo12h = (totalMins: number): string => {
    const mins = ((totalMins % 1440) + 1440) % 1440;
    const hours24 = Math.floor(mins / 60);
    const minutes = mins % 60;
    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 || 12;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(hours12)}:${pad(minutes)} ${period}`;
  };

  // Compute 4 Summary KPI Cards from real live API records
  const kpiData: AttendanceKpiData = useMemo(() => {
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let wfhCount = 0;

    // Shift start & grace calculation
    const shiftStart = shiftTiming?.startTime || "09:00";
    const graceMins = shiftTiming?.graceMins ?? 15;

    const [shHours, shMins] = shiftStart.split(":").map((n) => parseInt(n, 10) || 0);
    const startMins = shHours * 60 + shMins;
    const lateThresholdMins = startMins + graceMins;

    const shiftStart12h = formatMinsTo12h(startMins);
    const cutoff12h = formatMinsTo12h(lateThresholdMins);

    todayRecords.forEach((r) => {
      const s = String(r.status || "").toUpperCase();
      const checkInTime = r.firstCheckIn || (r as any).checkIn || (r as any).checkInTime || (r.sessions && r.sessions[0]?.timestamp);
      const hasCheckedIn = Boolean(checkInTime);

      let isLate = s.includes("LATE") || (r as any).isLate === true;

      // Check check-in timestamp against dynamic shift start + grace
      if (!isLate && checkInTime) {
        try {
          const d = new Date(checkInTime);
          if (!isNaN(d.getTime())) {
            const totalMins = d.getHours() * 60 + d.getMinutes();
            if (totalMins > lateThresholdMins) {
              isLate = true;
            }
          }
        } catch {
          // ignore
        }
      }

      const isWfh = s.includes("WFH") || s.includes("REMOTE");
      const isAbsent = s === "ABSENT";
      const isHalfDay = s.includes("HALF");
      const isPresentStatus = s.includes("PRESENT") || isHalfDay || isLate || isWfh;
      const isPresent = !isAbsent && (hasCheckedIn || isPresentStatus);

      if (isLate) lateCount++;
      if (isWfh) wfhCount++;
      if (isAbsent) absentCount++;
      if (isPresent) presentCount++;
    });

    const total = totalRecords || todayRecords.length || 0;
    const presentRate = total > 0 ? Math.round((presentCount / total) * 100 * 10) / 10 : 0;
    const wfhRate = total > 0 ? Math.round((wfhCount / total) * 100 * 10) / 10 : 0;

    return {
      presentCount,
      presentRateText: `${presentRate}% attendance rate`,
      absentCount,
      absentSubtext: `${absentCount} absent today`,
      lateCount,
      lateSubtext: `After ${cutoff12h} (${shiftStart12h} Shift + ${graceMins}m Grace)`,
      wfhCount,
      wfhSubtext: `${wfhRate}% of workforce`,
    };
  }, [todayRecords, totalRecords, shiftTiming]);


  // Compute status breakdown counts from real live API records
  const breakdownData: StatusBreakdownData = useMemo(() => {
    let onTime = 0;
    let late = 0;
    let wfh = 0;
    let absent = 0;
    let onLeave = 0;

    todayRecords.forEach((r) => {
      const s = (r.status || "").toUpperCase();
      const checkInTime = r.firstCheckIn || (r as any).checkIn || (r as any).checkInTime || (r.sessions && r.sessions[0]?.timestamp);
      const hasCheckedIn = Boolean(checkInTime);

      let isLate = s.includes("LATE") || (r as any).isLate === true;
      if (!isLate && checkInTime) {
        try {
          const d = new Date(checkInTime);
          if (!isNaN(d.getTime()) && d.getHours() * 60 + d.getMinutes() > 615) {
            isLate = true;
          }
        } catch {
          // ignore
        }
      }

      if (isLate) {
        late++;
      } else if (s.includes("WFH") || s.includes("REMOTE")) {

        wfh++;
      } else if (s.includes("LEAVE")) {
        onLeave++;
      } else if (s.includes("ABSENT")) {
        absent++;
      } else if (hasCheckedIn || s.includes("PRESENT")) {
        onTime++;
      }
    });

    return {
      onTime,
      late,
      wfh,
      absent,
      onLeave,
      totalWorkforce: totalRecords || todayRecords.length || 0,
      dateText: `Today – ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`,
    };
  }, [todayRecords, totalRecords]);

  const getRealWorkedMinutes = (r: AttendanceRecord): number => {
    if (r.workedMinutes && r.workedMinutes > 0) return r.workedMinutes;
    if (r.firstCheckIn && r.lastCheckOut) {
      const start = new Date(r.firstCheckIn).getTime();
      const end = new Date(r.lastCheckOut).getTime();
      if (!isNaN(start) && !isNaN(end) && end > start) {
        return Math.round((end - start) / (1000 * 60));
      }
    }
    return 0;
  };

  const getResolvedStatus = (r: AttendanceRecord): string => {
    const rawStatus = (r.status || "").toUpperCase();
    const mins = getRealWorkedMinutes(r);
    const hasCheckedOut = Boolean(r.lastCheckOut);
    const hasCheckedIn = Boolean(r.firstCheckIn || (r.sessions && r.sessions.length > 0));

    if (rawStatus === "HALF_DAY") {
      if (mins >= 420) {
        return (r as any).isLate ? "LATE" : "PRESENT";
      }
      return "HALF_DAY";
    }

    if (rawStatus === "NOT_CHECKED_IN" || rawStatus === "") {
      if (mins >= 420) {
        return (r as any).isLate ? "LATE" : "PRESENT";
      }
      if (mins >= 240 && hasCheckedOut) {
        return "HALF_DAY";
      }
      if (hasCheckedIn) {
        return (r as any).isLate ? "LATE" : "PRESENT";
      }
    }

    return rawStatus || "PRESENT";
  };

  // Convert real live API records to table row format
  const tableRows: AttendanceRecordRow[] = useMemo(() => {
    return todayRecords.map((r) => {
      const empObj = typeof r?.employeeId === "object" ? r.employeeId : r?.employee;
      const firstName = empObj?.firstName || (r as any)?.firstName || "";
      const lastName = empObj?.lastName || (r as any)?.lastName || "";
      const fullName = empObj?.fullName || (r as any)?.fullName || (r as any)?.employeeName || `${firstName} ${lastName}`.trim();
      const empName = fullName || "Employee";

      const avatarUrl =
        empObj?.avatarUrl ||
        empObj?.profilePicture ||
        (r as any)?.avatarUrl ||
        (r as any)?.profilePicture ||
        (empObj as any)?.user?.avatarUrl ||
        "";

      const mins = getRealWorkedMinutes(r);
      const status = getResolvedStatus(r);

      const deptName = (empObj as any)?.department?.name || (empObj as any)?.departmentName || (r as any)?.departmentName || "";
      const desigName = (empObj as any)?.designation?.title || (empObj as any)?.designationName || (r as any)?.designationName || "";
      const branchName = (empObj as any)?.branch?.name || (empObj as any)?.branchName || (r as any)?.branchName || "";

      return {
        id: r?._id || Math.random().toString(),
        employeeName: empName,
        initials: getInitials(empName),
        avatarColor: getColorForName(empName),
        avatarUrl,
        departmentName: deptName,
        designationName: desigName,
        branchName: branchName,
        checkIn: formatTime(r?.firstCheckIn),
        checkOut: formatTime(r?.lastCheckOut),
        hours: formatWorkedTime(mins),
        status: status,
      };
    });
  }, [todayRecords]);

  // Reset client page when any filter changes
  useEffect(() => {
    setClientPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, statusFilter, searchQuery, filterValues?.designationId, filterValues?.branchId, filterValues?.departmentId]);

  // Reset client page when filters change
  const handleClientPageChange = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setClientPage(newPage);
  };

  const handleClientRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientRowsPerPage(parseInt(e.target.value, 10));
    setClientPage(0);
  };

  // Paginated slice of client-filtered rows
  const paginatedRows = useMemo(() => {
    const start = clientPage * clientRowsPerPage;
    return tableRows.slice(start, start + clientRowsPerPage);
  }, [tableRows, clientPage, clientRowsPerPage]);

  // Compute dynamic Weekly Trend Chart Data for the last 7 days leading up to today
  const trendData: TrendBarData[] = useMemo(() => {
    const days: TrendBarData[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      const monthName = d.toLocaleDateString("en-US", { month: "short" });
      const dayNum = d.getDate();
      const dateLabel = i === 0 ? "Today" : `${monthName} ${dayNum}`;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const fullDate = `${yyyy}-${mm}-${dd}`;

      // Count actual records present on each specific day (using local date comparison)
      const dayPresent = records.filter((r) => {
        const recordDateStr = getRecordLocalDateStr(r);
        const matchesDate = recordDateStr === fullDate;
        const s = String(r.status || "").toUpperCase();
        return matchesDate && s !== "ABSENT";
      }).length;


      const dayCount = dayPresent;

      days.push({
        date: dateLabel,
        fullDate,
        count: dayCount,
      });
    }

    return days;
  }, [records]);

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2.5, md: 4 }, backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
        
        {/* Top Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3.5 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" }}>
              Attendance
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
              Real-time workforce attendance tracking
            </Typography>
          </Box>

          {canMarkAttendance && (
            <Button
              variant="contained"
              onClick={() => setManualOpen(true)}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 2.5,
                px: 2.5,
                py: 1,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.875rem",
                backgroundColor: "#6D5DF6",
                boxShadow: "0 4px 14px rgba(109, 93, 246, 0.3)",
                "&:hover": { backgroundColor: "#5B4BEA" },
              }}
            >
              Mark Attendance
            </Button>
          )}
        </Box>

        {/* 1. Top KPI Summary Cards */}
        <AttendanceKpiCards data={kpiData} />

        {/* Generic Horizontal Filter Bar with Real Backend Data */}
        <FilterBar
          searchPlaceholder="Search employees..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          fields={[
            { key: "dateRange", label: "Date Range", type: "daterange" },
            {
              key: "branchId",
              label: "Branch",
              type: "select",
              options: [
                { value: "ALL", label: "All Branches" },
                ...(branches?.map((b: any) => ({
                  value: b._id || b.name,
                  label: b.name,
                })) || []),
              ],
              minWidth: 140,
            },
            {
              key: "departmentId",
              label: "Departments",
              type: "select",
              options: [
                { value: "ALL", label: "All Departments" },
                ...(departments?.map((dep: any) => ({
                  value: dep._id || dep.name,
                  label: dep.name,
                })) || []),
              ],
              minWidth: 150,
            },
            {
              key: "designationId",
              label: "Designation",
              type: "select",
              options: [
                { value: "ALL", label: "All Designations" },
                ...(designations?.map((d: any) => ({
                  value: d._id || d.title || d.name,
                  label: d.title || d.name,
                })) || []),
              ],
              minWidth: 150,
            },
            {
              key: "status",
              label: "Status",
              type: "select",
              options: STATUS_OPTIONS,
              minWidth: 150,
            },
          ]}
          values={{
            ...filterValues,
            fromDate,
            toDate,
            status: statusFilter,
          }}
          onFilterChange={(key, val) => {
            if (key === "fromDate") setFromDate(val);
            else if (key === "toDate") setToDate(val);
            else if (key === "status") setStatusFilter(val);
            else setFilterValues((prev) => ({ ...prev, [key]: val }));
          }}
          onReset={() => {
            setSearchQuery("");
            setFromDate("");
            setToDate("");
            setStatusFilter("ALL");
            setFilterValues({
              designationId: "ALL",
              branchId: "ALL",
              departmentId: "ALL",
            });
            setPageNumber(1);
          }}
        />

        {/* 2. Middle Grid: Weekly Trend & Today Breakdown */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, mb: 4, mt: 3.5 }}>
          <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 66.666%" } }}>
            <LazyWeeklyTrendBarChart
              data={trendData}
              onRegularizeClick={() => setRegularizeOpen(true)}
            />
          </Box>
          <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 33.333%" } }}>
            <TodayStatusBreakdownCard data={breakdownData} />
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading Spinner */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        )}

        {/* 3. Bottom Table */}
        {!loading && (
          <>
            <EmployeeAttendanceTable
              records={paginatedRows}
              onRowClick={(row) => {
                const origRecord = records.find((r) => r._id === row.id);
                if (origRecord) detailDialog.open(origRecord);
              }}
            />

            {/* Pagination Controls */}
            {tableRows.length > 0 && (
              <TablePagination
                component="div"
                count={tableRows.length}
                page={clientPage}
                onPageChange={handleClientPageChange}
                rowsPerPage={clientRowsPerPage}
                onRowsPerPageChange={handleClientRowsPerPageChange}
                rowsPerPageOptions={[10, 25, 50, 100]}
                sx={{ mt: 2, color: "#64748B" }}
              />
            )}
          </>
        )}

        {/* Detail Modal */}
        <Dialog
          open={detailDialog.isOpen}
          onClose={detailDialog.close}
          maxWidth="xs"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Attendance Details
            </Typography>
            <IconButton onClick={detailDialog.close} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {detailDialog.target && (
              <>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Status:</Typography>
                  <StatusChip status={detailDialog.target.status} />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">First Check In:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatTime(detailDialog.target.firstCheckIn)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Last Check Out:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatTime(detailDialog.target.lastCheckOut)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Worked Hours:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatWorkedTime(detailDialog.target.workedMinutes)}</Typography>
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={detailDialog.close} sx={{ textTransform: "none", fontWeight: 600 }}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Modals */}
        <ManualAttendanceDialog
          open={manualOpen}
          onClose={() => setManualOpen(false)}
          onSuccess={() => {
            setManualOpen(false);
            fetchReport();
          }}
        />

        <RegularizeRequestDialog
          open={regularizeOpen}
          onClose={() => setRegularizeOpen(false)}
          record={detailDialog.target}
          onSuccess={() => {
            setRegularizeOpen(false);
            fetchReport();
          }}
        />

      </Box>
    </DashboardLayout>
  );
}
