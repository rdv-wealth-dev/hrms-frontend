import { useState } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import { useSelector } from "react-redux";
import type { RootState } from "../../../store/rootReducer";
import type { LeaveRequest } from "../../../api/leave.api";

interface LeaveRequestsTableProps {
  requests: LeaveRequest[];
  loading?: boolean;
  onApprove?: (req: LeaveRequest) => void;
  onReject?: (req: LeaveRequest) => void;
  onPreview?: (req: LeaveRequest) => void;
  onExport?: () => void;
}

const LEAVE_TYPES_PILLS = [
  "All",
  "Annual Leave",
  "Sick Leave",
  "Casual Leave",
  "Work From Home",
];

const STATUS_PILLS = ["All", "Pending", "Approved", "Rejected"];

// Color palette for employee avatar circles
const AVATAR_COLORS = ["#4F46E5", "#D97706", "#059669", "#0284C7", "#7C3AED", "#DB2777"];

export default function LeaveRequestsTable({
  requests,
  loading = false,
  onApprove,
  onReject,
  onPreview,
  onExport,
}: LeaveRequestsTableProps) {
  const user = useSelector((state: RootState) => state.auth?.user);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Filter requests dynamically
  const filteredRequests = requests.filter((req) => {
    // 1. Leave Type Filter
    if (selectedType !== "All") {
      const typeName = req?.leaveTypeId?.name || "";
      if (!typeName.toLowerCase().includes(selectedType.toLowerCase())) {
        return false;
      }
    }
    // 2. Status Filter
    if (selectedStatus !== "All") {
      const statusUpper = selectedStatus.toUpperCase();
      if ((req?.status || "").toUpperCase() !== statusUpper) {
        return false;
      }
    }
    return true;
  });

  const getAvatarUrl = (req: LeaveRequest) => {
    const emp = req?.employeeId as any;
    if (!emp) return undefined;

    let url =
      emp?.avatarUrl ||
      emp?.avatar ||
      emp?.profilePicture ||
      emp?.photo ||
      emp?.user?.avatarUrl ||
      emp?.user?.avatar ||
      emp?.user?.profilePicture ||
      emp?.user?.photo;

    // 1. If url is missing on this specific request item, check global avatar cache by employee ID or name
    if (!url) {
      try {
        const empName = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim().toLowerCase();
        const avatarMap = JSON.parse(localStorage.getItem("hrms_employee_avatars") || "{}");
        url = avatarMap[emp?._id] || avatarMap[empName];
      } catch {}
    }

    // 2. If still missing and request belongs to logged-in user, use logged-in user's avatar
    if (!url && user?.avatarUrl) {
      const empName = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim().toLowerCase();
      const currentUserName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim().toLowerCase();
      if (emp?._id === user?.employeeId || (empName && currentUserName && empName === currentUserName)) {
        url = user?.avatarUrl;
      }
    }

    // 3. Cache known avatar URL for employee ID and Name for future rows
    if (url && typeof url === "string") {
      try {
        const empName = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim().toLowerCase();
        const avatarMap = JSON.parse(localStorage.getItem("hrms_employee_avatars") || "{}");
        let updated = false;
        if (emp?._id && !avatarMap[emp._id]) {
          avatarMap[emp._id] = url;
          updated = true;
        }
        if (empName && !avatarMap[empName]) {
          avatarMap[empName] = url;
          updated = true;
        }
        if (updated) {
          localStorage.setItem("hrms_employee_avatars", JSON.stringify(avatarMap));
        }
      } catch {}
    }

    if (url && typeof url === "string" && !url.startsWith("http") && !url.startsWith("data:")) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "";
      const backendOrigin = apiBase.replace(/\/api\/v1\/?$/, "").replace(/\/api\/?$/, "");
      url = url.startsWith("/") ? `${backendOrigin}${url}` : `${backendOrigin}/${url}`;
    }
    return url || undefined;
  };

  const formatDateRange = (fromDateStr?: string, toDateStr?: string) => {
    if (!fromDateStr || !toDateStr) return "—";
    try {
      const fromD = new Date(fromDateStr);
      const toD = new Date(toDateStr);
      if (isNaN(fromD.getTime()) || isNaN(toD.getTime())) return "—";

      const fromFmt = fromD.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      const toFmt = toD.toLocaleDateString("en-US", { day: "numeric", month: "short" });

      if (fromFmt === toFmt) return fromFmt;
      return `${fromFmt} - ${toFmt}`;
    } catch {
      return "—";
    }
  };

  const getStatusChip = (status?: string) => {
    const s = (status || "").toUpperCase();
    if (s === "PENDING") {
      return (
        <Chip
          label="Pending"
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "12px",
            backgroundColor: "#FEF3C7",
            color: "#B45309",
            borderRadius: "12px",
            px: 0.5,
          }}
        />
      );
    }
    if (s === "APPROVED") {
      return (
        <Chip
          label="Approved"
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "12px",
            backgroundColor: "#D1FAE5",
            color: "#047857",
            borderRadius: "12px",
            px: 0.5,
          }}
        />
      );
    }
    if (s === "REJECTED") {
      return (
        <Chip
          label="Rejected"
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "12px",
            backgroundColor: "#FEE2E2",
            color: "#B91C1C",
            borderRadius: "12px",
            px: 0.5,
          }}
        />
      );
    }
    return (
      <Chip
        label={status || "Cancelled"}
        size="small"
        sx={{
          fontWeight: 700,
          fontSize: "12px",
          backgroundColor: "#F1F5F9",
          color: "#64748B",
          borderRadius: "12px",
          px: 0.5,
        }}
      />
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Dual Filter Pill Toolbars */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* Left Filter (Leave Types) */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {LEAVE_TYPES_PILLS.map((type) => {
            const isSelected = selectedType === type;
            return (
              <Chip
                key={type}
                label={type}
                onClick={() => setSelectedType(type)}
                clickable
                sx={{
                  height: 32,
                  borderRadius: "20px",
                  px: 1,
                  fontSize: "13px",
                  fontWeight: isSelected ? 600 : 500,
                  backgroundColor: isSelected ? "#4F46E5" : "#F1F5F9",
                  color: isSelected ? "#FFFFFF" : "#475569",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    backgroundColor: isSelected ? "#4338CA" : "#E2E8F0",
                  },
                }}
              />
            );
          })}
        </Box>

        {/* Right Filter (Status) + Export Button */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          {STATUS_PILLS.map((status) => {
            const isSelected = selectedStatus === status;
            return (
              <Chip
                key={status}
                label={status}
                onClick={() => setSelectedStatus(status)}
                clickable
                sx={{
                  height: 32,
                  borderRadius: "20px",
                  px: 1,
                  fontSize: "13px",
                  fontWeight: isSelected ? 600 : 500,
                  backgroundColor: isSelected ? "#4F46E5" : "#F1F5F9",
                  color: isSelected ? "#FFFFFF" : "#475569",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    backgroundColor: isSelected ? "#4338CA" : "#E2E8F0",
                  },
                }}
              />
            );
          })}

          <Button
            size="small"
            onClick={onExport}
            startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              height: 32,
              borderRadius: "20px",
              px: 2,
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: "#F1F5F9",
              color: "#475569",
              border: "1px solid #E2E8F0",
              "&:hover": {
                backgroundColor: "#E2E8F0",
              },
            }}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Requests Data Table */}
      <TableContainer
        sx={{
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px", pl: 3 }}>
                EMPLOYEE
              </TableCell>

              <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }}>
                TYPE
              </TableCell>

              <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }}>
                PERIOD
              </TableCell>

              <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }}>
                DAYS
              </TableCell>

              <TableCell sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }}>
                STATUS
              </TableCell>

              <TableCell align="center" sx={{ fontWeight: 700, fontSize: "11px", color: "#64748B", letterSpacing: "0.5px" }}>
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography sx={{ color: "#64748B", fontSize: "14px", fontWeight: 500 }}>
                    {loading ? "Loading leave requests..." : "No leave requests found."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((req, idx) => {
                const empName =
                  `${req?.employeeId?.firstName ?? ""} ${req?.employeeId?.lastName ?? ""}`.trim() ||
                  "Employee";
                const initials =
                  `${req?.employeeId?.firstName?.[0] ?? ""}${req?.employeeId?.lastName?.[0] ?? ""}`.toUpperCase() ||
                  "E";
                const avatarBg = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const avatarUrl = getAvatarUrl(req);
                const isPending = (req?.status || "").toUpperCase() === "PENDING";

                return (
                  <TableRow
                    key={req._id}
                    hover
                    sx={{
                      transition: "all 0.15s ease",
                    }}
                  >
                    {/* Employee Avatar & Name */}
                    <TableCell sx={{ pl: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          src={avatarUrl}
                          sx={{
                            width: 34,
                            height: 34,
                            fontSize: "12px",
                            fontWeight: 700,
                            backgroundColor: avatarBg,
                            color: "#FFFFFF",
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#0F172A" }}>
                          {empName}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Leave Type */}
                    <TableCell>
                      <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#475569" }}>
                        {req?.leaveTypeId?.name || "Leave"}
                      </Typography>
                    </TableCell>

                    {/* Date Period */}
                    <TableCell>
                      <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#475569" }}>
                        {formatDateRange(req?.fromDate, req?.toDate)}
                      </Typography>
                    </TableCell>

                    {/* Total Days */}
                    <TableCell>
                      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
                        {req?.totalDays ? `${req.totalDays}d` : "1d"}
                      </Typography>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>{getStatusChip(req?.status)}</TableCell>

                    {/* Inline Actions */}
                    <TableCell align="center">
                      {isPending ? (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                          <Tooltip title="Approve Request">
                            <IconButton
                              size="small"
                              onClick={() => onApprove?.(req)}
                              sx={{
                                width: 28,
                                height: 28,
                                backgroundColor: "#DCFCE7",
                                color: "#16A34A",
                                "&:hover": { backgroundColor: "#BBF7D0" },
                              }}
                            >
                              <CheckIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Reject Request">
                            <IconButton
                              size="small"
                              onClick={() => onReject?.(req)}
                              sx={{
                                width: 28,
                                height: 28,
                                backgroundColor: "#FEE2E2",
                                color: "#DC2626",
                                "&:hover": { backgroundColor: "#FCA5A5" },
                              }}
                            >
                              <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => onPreview?.(req)}
                            sx={{
                              width: 28,
                              height: 28,
                              color: "#64748B",
                              "&:hover": { backgroundColor: "#F1F5F9", color: "#0F172A" },
                            }}
                          >
                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
