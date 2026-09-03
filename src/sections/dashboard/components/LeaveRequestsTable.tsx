import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import CustomAvatar from "@/components/avatar/CustomAvatar";
import StatusChip from "@/components/common/StatusChip";
import { paths } from "@/routes/paths";
import { DASHBOARD_MOCK_DATA, type LeaveRequestItem } from "../mock/dashboard-data";

export function LeaveRequestsTable() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<LeaveRequestItem[]>(DASHBOARD_MOCK_DATA.leaveRequests);

  const pendingCount = requests.filter(
    (req) => req.status === "PENDING" || req.status === "REENTRY"
  ).length;

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: "APPROVED" } : req))
    );
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: "REJECTED" } : req))
    );
  };

  return (
    <Card
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 3.5,
        backgroundColor: "background.paper",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", fontSize: "1.05rem" }}>
            Leave Requests
          </Typography>
          {pendingCount > 0 && (
            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: "12px",
                backgroundColor: "#FEF3C7",
                color: "#92400E",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {pendingCount} Pending
            </Box>
          )}
        </Box>

        <Button
          size="small"
          onClick={() => navigate(paths.leaveApprovals)}
          endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: "14px !important" }} />}
          sx={{
            textTransform: "none",
            color: "primary.main",
            fontWeight: 600,
            fontSize: "0.8rem",
            p: 0,
            "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
          }}
        >
          View All
        </Button>
      </Box>

      {/* Interactive List Feed */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, my: 0.5 }}>
        {requests.map((item) => {
          const isPending = item.status === "PENDING" || item.status === "REENTRY";

          return (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.5,
                borderRadius: 2.5,
                backgroundColor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#F3F4F6",
                  borderColor: "rgba(0,0,0,0.06)",
                },
              }}
            >
              {/* Employee Avatar & Details */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                <CustomAvatar name={item.employeeName} size={36} fontSize="0.8rem" />
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        fontSize: "0.85rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.employeeName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 500 }}>
                      ({item.employeeId})
                    </Typography>
                  </Box>

                  <Typography variant="caption" sx={{ color: "#4B5563", fontSize: "0.75rem", display: "block" }}>
                    {item.leaveType} • <span style={{ color: "#6B7280" }}>{item.dateRange}</span>
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons or Status Chip */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0, ml: 1 }}>
                {isPending ? (
                  <>
                    <Tooltip title="Approve Request" arrow placement="top">
                      <IconButton
                        size="small"
                        onClick={() => handleApprove(item.id)}
                        sx={{
                          color: "#10B981",
                          backgroundColor: "rgba(16, 185, 129, 0.1)",
                          "&:hover": {
                            backgroundColor: "#10B981",
                            color: "#FFFFFF",
                          },
                          width: 30,
                          height: 30,
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Reject Request" arrow placement="top">
                      <IconButton
                        size="small"
                        onClick={() => handleReject(item.id)}
                        sx={{
                          color: "#EF4444",
                          backgroundColor: "rgba(239, 68, 68, 0.1)",
                          "&:hover": {
                            backgroundColor: "#EF4444",
                            color: "#FFFFFF",
                          },
                          width: 30,
                          height: 30,
                        }}
                      >
                        <CancelIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <StatusChip status={item.status} size="small" />
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Footer Link to Leave Management Page */}
      <Box sx={{ pt: 2, mt: 1, borderTop: "1px solid", borderColor: "divider" }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
          Full leave requests and balance approvals are managed in{" "}
          <Box
            component="span"
            onClick={() => navigate(paths.leaveApprovals)}
            sx={{ color: "primary.main", fontWeight: 600, cursor: "pointer", textDecoration: "underline", display: "inline" }}
          >
            Leave Approvals
          </Box>
        </Typography>
      </Box>
    </Card>
  );
}

export default LeaveRequestsTable;
