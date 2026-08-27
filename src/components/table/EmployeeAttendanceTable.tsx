import { useRef } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { CustomAvatar } from "../avatar";
import VirtualizedTableBody from "./VirtualizedTableBody";

export interface AttendanceRecordRow {
  id: string;          // unique per punch row — used as the React key
  recordId: string;    // original attendance record _id — used for row-click lookups
  employeeCode: string;
  employeeName: string;
  avatarUrl?: string;
  punchLog: string;    // single formatted time, e.g. "10:46 AM"
  punchDate: string;   // e.g. "25 08 26"
  // Kept but not rendered as columns — your existing filter bar reads these
  status?: string;
  departmentName?: string;
  designationName?: string;
  branchName?: string;
}

interface EmployeeAttendanceTableProps {
  records: AttendanceRecordRow[];
  onExport?: () => void;
  onRowClick?: (record: AttendanceRecordRow) => void;
  loading?: boolean;
  maxHeight?: number | string;
  startIndex?: number; // offset for continuous S.No. across pages, default 0
}

export default function EmployeeAttendanceTable({
  records = [],
  onExport,
  onRowClick,
  loading = false,
  maxHeight = "none",
  startIndex = 0,
}: EmployeeAttendanceTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const safeRecords = Array.isArray(records) ? records : [];

  const handleCsvExport = () => {
    if (onExport) {
      onExport();
      return;
    }
    if (safeRecords.length === 0) return;

    const headers = ["S.No", "Employee Code", "Employee Name", "Punch Log", "Punch Date"];
    const rows = safeRecords.map((r, i) => [
      String(startIndex + i + 1),
      r?.employeeCode ?? "",
      r?.employeeName ?? "",
      r?.punchLog ?? "",
      r?.punchDate ?? "",
    ]);
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
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #F3F4F6",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", fontSize: "1rem" }}>
          Employee Attendance
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

      <TableContainer
        ref={containerRef}
        sx={{
          ...(maxHeight && maxHeight !== "none"
            ? { maxHeight, overflowY: "auto" }
            : { overflowY: "visible" }),
          overflowX: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#CBD5E1 transparent",
          "&::-webkit-scrollbar": { width: "6px", height: "6px" },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "#CBD5E1", borderRadius: "6px" },
        }}
      >
        <Table stickyHeader sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ "& th": { backgroundColor: "#F9FAFB", zIndex: 3 } }}>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#6B7280", letterSpacing: "0.05em" }}>
                S.NO.
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#6B7280", letterSpacing: "0.05em" }}>
                EMPLOYEE CODE
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#6B7280", letterSpacing: "0.05em" }}>
                EMPLOYEE NAME
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#6B7280", letterSpacing: "0.05em" }}>
                PUNCH LOG
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#6B7280", letterSpacing: "0.05em" }}>
                PUNCH DATE
              </TableCell>
            </TableRow>
          </TableHead>

          <VirtualizedTableBody
            items={safeRecords}
            containerRef={containerRef}
            estimateRowHeight={56}
            columnsCount={5}
            loading={loading}
            renderRow={(row, index) => {
              return (
                <TableRow
                  key={row?.id}
                  onClick={() => onRowClick && onRowClick(row)}
                  sx={{
                    height: 56,
                    cursor: onRowClick ? "pointer" : "default",
                    "&:hover": { backgroundColor: "#F9FAFB" },
                    transition: "background-color 0.15s ease",
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500 }}>
                      {startIndex + index + 1}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                      {row?.employeeCode ?? "--"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <CustomAvatar
                        name={row?.employeeName ?? ""}
                        src={row?.avatarUrl}
                        size={34}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                        {row?.employeeName ?? "N/A"}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", color: "#4B5563", fontWeight: 500 }}>
                      {row?.punchLog ?? "--"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", color: "#4B5563", fontWeight: 500 }}>
                      {row?.punchDate ?? "--"}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            }}
          />
        </Table>
      </TableContainer>
    </Card>
  );
}