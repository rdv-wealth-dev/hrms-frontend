import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { CustomAvatar } from "../avatar";

export interface AttendanceRecordRow {
  id: string;
  employeeName: string;
  initials: string;
  avatarColor: string;
  avatarUrl?: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: "Present" | "Wfh" | "Late" | "Absent" | "Half Day" | string;
}

interface EmployeeAttendanceTableProps {
  records: AttendanceRecordRow[];
  onExport?: () => void;
  onRowClick?: (record: AttendanceRecordRow) => void;
}

export default function EmployeeAttendanceTable({
  records,
  onExport,
  onRowClick,
}: EmployeeAttendanceTableProps) {
  const getStatusChipProps = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("present")) {
      return { label: "Present", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" };
    }
    if (s.includes("wfh") || s.includes("remote")) {
      return { label: "WFH", color: "#0D9488", bg: "#F0FDFA", border: "#99F6E4" };
    }
    if (s.includes("late")) {
      return { label: "Late", color: "#4F46E5", bg: "#EEF2FF", border: "#C7D2FE" };
    }
    if (s.includes("half")) {
      return { label: "Half Day", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };
    }
    if (s.includes("leave")) {
      return { label: "On Leave", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" };
    }
    if (s.includes("absent")) {
      return { label: "Absent", color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" };
    }
    return { label: status.replace(/_/g, " "), color: "#4B5563", bg: "#F3F4F6", border: "#E5E7EB" };
  };

  const handleCsvExport = () => {
    if (onExport) {
      onExport();
      return;
    }
    if (records.length === 0) return;

    const headers = ["Employee", "Check In", "Check Out", "Hours", "Status"];
    const rows = records.map((r) => [r.employeeName, r.checkIn, r.checkOut, r.hours, r.status]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Employee_Attendance_Today.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card
      sx={{
        borderRadius: 3.5,
        backgroundColor: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}
    >
      {/* Table Card Header */}
      <Box
        sx={{
          px: { xs: 2.5, sm: 3 },
          py: 2.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #F3F4F6",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", fontSize: "1rem" }}>
          Employee Attendance — Today
        </Typography>
        <Button
          onClick={handleCsvExport}
          startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
          sx={{
            ml: "auto",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.825rem",
            color: "#4B5563",
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            border: "1px solid #E5E7EB",
            backgroundColor: "#FFFFFF",
            "&:hover": { backgroundColor: "#F9FAFB", borderColor: "#D1D5DB" },
          }}
        >
          Export
        </Button>
      </Box>

      {/* Table Body */}
      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#6B7280", letterSpacing: "0.05em" }}>
                EMPLOYEE
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#6B7280", letterSpacing: "0.05em" }}>
                CHECK IN
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#6B7280", letterSpacing: "0.05em" }}>
                CHECK OUT
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#6B7280", letterSpacing: "0.05em" }}>
                HOURS
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#6B7280", letterSpacing: "0.05em" }}>
                STATUS
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {records.map((row) => {
              const chip = getStatusChipProps(row.status);
              return (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row)}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    "&:hover": { backgroundColor: "#F9FAFB" },
                    transition: "background-color 0.15s ease",
                  }}
                >
                  {/* EMPLOYEE column */}
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <CustomAvatar
                        name={row.employeeName}
                        src={row.avatarUrl}
                        size={34}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                        {row.employeeName}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* CHECK IN column */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", color: "#4B5563", fontWeight: 500 }}>
                      {row.checkIn}
                    </Typography>
                  </TableCell>

                  {/* CHECK OUT column */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", color: "#4B5563", fontWeight: 500 }}>
                      {row.checkOut}
                    </Typography>
                  </TableCell>

                  {/* HOURS column */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                      {row.hours}
                    </Typography>
                  </TableCell>

                  {/* STATUS column */}
                  <TableCell>
                    <Chip
                      label={chip.label}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: chip.color,
                        backgroundColor: chip.bg,
                        border: `1px solid ${chip.border}`,
                        borderRadius: 2,
                        px: 0.5,
                        height: 24,
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}
