import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

import { listLeaveTypes, type LeaveType } from "../../../api/leave.api";

export default function LeavePolicyView() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await listLeaveTypes();
        if (res.succeeded && res.data) {
          setLeaveTypes(res.data);
        }
      } catch (err) {
        console.error("Failed to load leave policy types", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Header Banner */}
      <Card
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            backgroundColor: "#EEF2FF",
            color: "#4F46E5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PolicyOutlinedIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#0F172A" }}>
            Organization Leave Policy & Entitlements
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "#64748B" }}>
            Overview of leave types, annual quotas, carry-forward rules, and advance notice requirements.
          </Typography>
        </Box>
      </Card>

      {/* Leave Types Policy Grid */}
      <Grid container spacing={2.5}>
        {loading ? (
          <Grid size={12}>
            <Typography sx={{ p: 4, textAlign: "center", color: "#64748B" }}>
              Loading leave policies...
            </Typography>
          </Grid>
        ) : leaveTypes.length === 0 ? (
          <Grid size={12}>
            <Card elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <Typography sx={{ color: "#64748B" }}>No active leave policies configured.</Typography>
            </Card>
          </Grid>
        ) : (
          leaveTypes.map((policy) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={policy._id}>
              <Card
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  height: "100%",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#0F172A" }}>
                    {policy.name} ({policy.code})
                  </Typography>
                  <Chip
                    label={policy.isPaid ? "Paid Leave" : "Unpaid Leave"}
                    size="small"
                    sx={{
                      fontSize: "11px",
                      fontWeight: 700,
                      backgroundColor: policy.isPaid ? "#DCFCE7" : "#F1F5F9",
                      color: policy.isPaid ? "#15803D" : "#475569",
                    }}
                  />
                </Box>

                <Typography sx={{ fontSize: "13px", color: "#64748B", minHeight: 36 }}>
                  {policy.description || "Standard company leave policy."}
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, pt: 1, borderTop: "1px solid #F1F5F9" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>Annual Quota:</Typography>
                    <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#0F172A" }}>{policy.annualQuota} days</Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>Carry Forward Max:</Typography>
                    <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#0F172A" }}>{policy.maxCarryForwardDays ?? 0} days</Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>Advance Notice:</Typography>
                    <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#0F172A" }}>{policy.advanceNoticeDays ?? 0} day(s)</Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                    <CheckCircleOutlinedIcon sx={{ fontSize: 16, color: "#16A34A" }} />
                    <Typography sx={{ fontSize: "12px", color: "#16A34A", fontWeight: 600 }}>
                      {policy.requiresApproval ? "Requires Manager Approval" : "Auto Approved"}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
