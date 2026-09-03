import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";

import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RefreshIcon from "@mui/icons-material/Refresh";

import { paths } from "../../../routes/paths";
import { listDepartments } from "../../../api/department.api";
import { listDesignations } from "../../../api/designation.api";
import { getHeadOffice } from "../../../api/branch.api";
import { usePermissions } from "../../../hooks/usePermissions";
import { useActiveBranchId } from "../../../hooks/useActiveBranchId";
import AdminSetupWizardDialog from "./AdminSetupWizardDialog";

export default function OrgSetupGuidanceWidget() {
  const navigate = useNavigate();
  const { role } = usePermissions();

  // Get branchId using the shared hook — handles ORG_ADMIN (empty branchIds) correctly
  const branchId = useActiveBranchId();

  const [loading, setLoading] = useState(true);
  const [deptCount, setDeptCount] = useState<number | null>(null);
  const [desigCount, setDesigCount] = useState<number | null>(null);
  const [hasBranch, setHasBranch] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);

  const fetchCounts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check for head office branch first
      let branchExists = false;
      try {
        const branchRes = await getHeadOffice();
        branchExists = branchRes?.succeeded && !!branchRes?.data;
      } catch (branchErr) {
        branchExists = false;
      }
      
      // Fetch departments and designations
      const [deptRes, desigRes] = await Promise.all([
        listDepartments(1, 1).catch(() => null),
        listDesignations(1, 1).catch(() => null),
      ]);

      setDeptCount(deptRes?.totalRecords ?? deptRes?.data?.length ?? 0);
      setDesigCount(desigRes?.totalRecords ?? desigRes?.data?.length ?? 0);
      setHasBranch(branchExists);
    } catch (err: any) {
      console.error("fetchCounts error:", err);
      setError("Failed to check organization setup status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "ORG_ADMIN" || role === "HR_ADMIN") {
      fetchCounts();
    } else {
      setLoading(false);
    }
  }, [role]);

  // Re-fetch when resolved branchId changes (e.g. after branch creation loads into Redux)
  useEffect(() => {
    if ((role === "ORG_ADMIN" || role === "HR_ADMIN") && !loading) {
      fetchCounts();
    }
  }, [branchId]);

  // Only Org Admin and HR Admin need setup guidance
  if (role !== "ORG_ADMIN" && role !== "HR_ADMIN") return null;

  // Don't render while checking initial state
  if (loading) return null;

  const hasDepts = (deptCount ?? 0) > 0;
  const hasDesigs = (desigCount ?? 0) > 0;

  // If organization structure is fully configured (branch + depts + desigs), hide widget cleanly
  if (hasBranch && hasDepts && hasDesigs) return null;

  const completedSteps = (hasBranch ? 1 : 0) + (hasDepts ? 1 : 0) + (hasDesigs ? 1 : 0);
  const progressPercent = (completedSteps / 3) * 100;

  return (
    <Card
      sx={{
        mb: 4,
        p: { xs: 2.5, sm: 3.5 },
        borderRadius: 3.5,
        background: (theme: any) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: "primary.contrastText",
        boxShadow: "0 10px 30px rgba(109, 93, 246, 0.25)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Decorative Element */}
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.08)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2.5,
              backgroundColor: "rgba(255, 255, 255, 0.18)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RocketLaunchOutlinedIcon sx={{ fontSize: 28, color: "#fff" }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff", lineHeight: 1.2, display: "flex", alignItems: "center", gap: 1 }}>
              Organization Initial Setup Required 🎉
              <IconButton
                onClick={fetchCounts}
                disabled={loading}
                size="small"
                sx={{
                  color: "#fff",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                }}
                title="Refresh status"
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.85)", mt: 0.5 }}>
              Set up your departments and designations to start managing employees effectively.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={() => setSetupDialogOpen(true)}
            startIcon={<RocketLaunchOutlinedIcon />}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "#fff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 2.5,
              px: 2.5,
              py: 1,
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                transform: "translateY(-1px)",
              },
            }}
          >
            Complete Initial Setup
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.9)", color: "#991B1B" }}>
          {error}
        </Alert>
      )}

      {/* Progress Bar */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
            Setup Progress ({completedSteps}/3 completed)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#fff" }}>
            {progressPercent}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#10B981",
              borderRadius: 4,
            },
          }}
        />
      </Box>

      {/* Action Steps Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {/* Step 0: Branch Setup (Head Office) */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2.5,
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            display: "flex",
            flexDirection: "column",
            justify: "space-between",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <BusinessOutlinedIcon sx={{ color: "#fff" }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#fff" }}>
                  0. Branch (Head Office)
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  {hasBranch ? "Branch configured" : "No branch created yet"}
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={hasBranch ? <CheckCircleOutlinedIcon style={{ color: "#fff" }} /> : undefined}
              label={hasBranch ? "Ready" : "Required"}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "0.72rem",
                backgroundColor: hasBranch ? "rgba(16, 185, 129, 0.85)" : "rgba(239, 68, 68, 0.85)",
                color: "#fff",
              }}
            />
          </Box>

          <Button
            variant="outlined"
            onClick={() => navigate(paths.branches)}
            endIcon={<ArrowForwardIcon />}
            sx={{
              color: "#fff",
              borderColor: "rgba(255, 255, 255, 0.4)",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              alignSelf: "flex-start",
              "&:hover": {
                borderColor: "#fff",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            {hasBranch ? "View Branch" : "Create Branch"}
          </Button>
        </Box>

        {/* Step 1: Department Setup */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2.5,
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            display: "flex",
            flexDirection: "column",
            justify: "space-between",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <BusinessOutlinedIcon sx={{ color: "#fff" }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#fff" }}>
                  1. Departments
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  {hasDepts ? `${deptCount} Department(s) configured` : "No departments created yet"}
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={hasDepts ? <CheckCircleOutlinedIcon style={{ color: "#fff" }} /> : undefined}
              label={hasDepts ? "Ready" : "Required"}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "0.72rem",
                backgroundColor: hasDepts ? "rgba(16, 185, 129, 0.85)" : "rgba(239, 68, 68, 0.85)",
                color: "#fff",
              }}
            />
          </Box>

          <Button
            variant="outlined"
            onClick={() => navigate(paths.departments)}
            endIcon={<ArrowForwardIcon />}
            sx={{
              color: "#fff",
              borderColor: "rgba(255, 255, 255, 0.4)",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              alignSelf: "flex-start",
              "&:hover": {
                borderColor: "#fff",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            {hasDepts ? "View Departments" : "Create Departments"}
          </Button>
        </Box>

        {/* Step 2: Designation Setup */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2.5,
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            display: "flex",
            flexDirection: "column",
            justify: "space-between",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <BadgeOutlinedIcon sx={{ color: "#fff" }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#fff" }}>
                  2. Designations
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  {hasDesigs ? `${desigCount} Designation(s) configured` : "No designations created yet"}
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={hasDesigs ? <CheckCircleOutlinedIcon style={{ color: "#fff" }} /> : undefined}
              label={hasDesigs ? "Ready" : "Required"}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "0.72rem",
                backgroundColor: hasDesigs ? "rgba(16, 185, 129, 0.85)" : "rgba(239, 68, 68, 0.85)",
                color: "#fff",
              }}
            />
          </Box>

          <Button
            variant="outlined"
            onClick={() => navigate(paths.designations)}
            endIcon={<ArrowForwardIcon />}
            sx={{
              color: "#fff",
              borderColor: "rgba(255, 255, 255, 0.4)",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              alignSelf: "flex-start",
              "&:hover": {
                borderColor: "#fff",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            {hasDesigs ? "View Designations" : "Create Designations"}
          </Button>
        </Box>
      </Box>

      <AdminSetupWizardDialog
        open={setupDialogOpen}
        onClose={() => setSetupDialogOpen(false)}
        onSuccess={fetchCounts}
      />
    </Card>
  );
}
