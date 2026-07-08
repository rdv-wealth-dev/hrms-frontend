import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";

import ViewModuleOutlinedIcon from "@mui/icons-material/ViewModuleOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import DevicesOtherOutlinedIcon from "@mui/icons-material/DevicesOtherOutlined";
import SaveIcon from "@mui/icons-material/Save";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import {
  loadOrganizationRequest,
  updateModulesRequest,
  resetOrganizationStatus,
} from "../../../store/organization";
import { usePermissions } from "../../../hooks/usePermissions";
import ModuleToggleCard from "../../../components/card/ModuleToggleCard";

function OrganizationModulesContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("settings.update");

  const { organization, loading, submitting, success, error } = useSelector(
    (state: RootState) => state.organization
  );

  // Module states
  const [payroll, setPayroll] = useState(false);
  const [performance, setPerformance] = useState(false);
  const [recruitment, setRecruitment] = useState(false);
  const [assets, setAssets] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    dispatch(loadOrganizationRequest());
    return () => {
      dispatch(resetOrganizationStatus());
    };
  }, [dispatch]);

  // Synchronize switches with fetched details
  useEffect(() => {
    if (organization?.modules) {
      setPayroll(!!organization.modules.payroll);
      setPerformance(!!organization.modules.performance);
      setRecruitment(!!organization.modules.recruitment);
      setAssets(!!organization.modules.assets);
    }
  }, [organization]);

  useEffect(() => {
    if (success) {
      setSnackbarOpen(true);
      dispatch(resetOrganizationStatus());
    }
  }, [success, dispatch]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdate) return;

    dispatch(
      updateModulesRequest({
        payroll,
        performance,
        recruitment,
        assets,
      })
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
        <CircularProgress size={40} sx={{ color: "#6D5DF6" }} />
      </Box>
    );
  }

  if (!organization) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2.5 }}>
        No organization settings found.
      </Alert>
    );
  }

  return (
    <Box sx={{ py: 1 }} component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
          border: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: "rgba(109, 93, 246, 0.08)",
              color: "#6D5DF6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ViewModuleOutlinedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 750, color: "#111827" }}>
              Modules Activation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Toggle optional system modules for your tenant instance
            </Typography>
          </Box>
        </Box>

        <Divider />

        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#4B5563", mb: 1 }}>
          Core Modules (Always Enabled)
        </Typography>

        <Grid container spacing={3}>
          {/* Core Modules - Locked */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <ModuleToggleCard
              title="Attendance Management"
              description="Track daily employee punches, geofencing, shift configurations, and regularizations."
              checked={true}
              onChange={() => {}}
              disabled={true}
              icon={<CalendarMonthOutlinedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ModuleToggleCard
              title="Leave Management"
              description="Administer leave policies, balances, allocations, and approval request chains."
              checked={true}
              onChange={() => {}}
              disabled={true}
              icon={<EventAvailableOutlinedIcon />}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#4B5563", mb: 1 }}>
          Extended Modules
        </Typography>

        <Grid container spacing={3}>
          {/* Extended Optional Modules */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <ModuleToggleCard
              title="Payroll Integration"
              description="Calculate statutory compliance deductions (PF, ESI), payslips, and monthly salary disbursements."
              checked={payroll}
              onChange={setPayroll}
              disabled={!canUpdate}
              icon={<PaymentsOutlinedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ModuleToggleCard
              title="Performance Appraisal"
              description="Set key performance indicators, appraisal cycles, OKRs, and manager feedback audits."
              checked={performance}
              onChange={setPerformance}
              disabled={!canUpdate}
              icon={<SpeedOutlinedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ModuleToggleCard
              title="Recruitment & ATS"
              description="Publish job openings, track job applicants, structure schedules, and offer letter workflows."
              checked={recruitment}
              onChange={setRecruitment}
              disabled={!canUpdate}
              icon={<GroupAddOutlinedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ModuleToggleCard
              title="Assets Management"
              description="Track company assets distribution, assignments, logs, and maintenance cycles."
              checked={assets}
              onChange={setAssets}
              disabled={!canUpdate}
              icon={<DevicesOtherOutlinedIcon />}
            />
          </Grid>
        </Grid>

        {/* Submit Actions */}
        {canUpdate && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={
                submitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              sx={{
                backgroundColor: "#6D5DF6",
                color: "#fff",
                px: 4,
                py: 1.5,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0px 4px 12px rgba(109, 93, 246, 0.2)",
                "&:hover": {
                  backgroundColor: "#5B4EE4",
                  boxShadow: "0px 6px 16px rgba(109, 93, 246, 0.3)",
                },
              }}
            >
              {submitting ? "Saving..." : "Save Activation"}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Success Snacker Alert */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{ borderRadius: 2.5 }}
        >
          Modules updated successfully
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default OrganizationModulesContent;
