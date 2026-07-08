/* eslint-disable react-hooks/set-state-in-effect */
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

import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import SaveIcon from "@mui/icons-material/Save";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import {
  loadOrganizationRequest,
  updateStatutoryRequest,
  resetOrganizationStatus,
} from "../../../store/organization";
import { usePermissions } from "../../../hooks/usePermissions";
import ModuleToggleCard from "../../../components/card/ModuleToggleCard";

export default function OrganizationStatutoryContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("settings.update");

  const { organization, loading, submitting, success, error } = useSelector(
    (state: RootState) => state.organization
  );

  const [pfEnabled, setPfEnabled] = useState(false);
  const [esiEnabled, setEsiEnabled] = useState(false);
  const [tdsEnabled, setTdsEnabled] = useState(false);
  const [ptEnabled, setPtEnabled] = useState(false);
  const [lwfEnabled, setLwfEnabled] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    dispatch(loadOrganizationRequest());
    return () => {
      dispatch(resetOrganizationStatus());
    };
  }, [dispatch]);

  // Synchronize toggles with fetched details
  useEffect(() => {
    if (organization?.statutory) {
      setPfEnabled(!!organization.statutory.pfEnabled);
      setEsiEnabled(!!organization.statutory.esiEnabled);
      setTdsEnabled(!!organization.statutory.tdsEnabled);
      setPtEnabled(!!organization.statutory.ptEnabled);
      setLwfEnabled(!!organization.statutory.lwfEnabled);
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
      updateStatutoryRequest({
        pfEnabled,
        esiEnabled,
        tdsEnabled,
        ptEnabled,
        lwfEnabled,
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
            <GavelOutlinedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 750, color: "#111827" }}>
              Statutory Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Toggle statutory regulations applicable to your organization payroll & taxation
            </Typography>
          </Box>
        </Box>

        <Divider />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ModuleToggleCard
              title="Provident Fund (PF)"
              description="Enable retirement benefit contributions and statutory employee PF deductions."
              checked={pfEnabled}
              onChange={setPfEnabled}
              disabled={!canUpdate}
              icon={<AccountBalanceOutlinedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ModuleToggleCard
              title="Employee State Insurance (ESI)"
              description="Enable medical and health insurance coverage compliance for eligible employees."
              checked={esiEnabled}
              onChange={setEsiEnabled}
              disabled={!canUpdate}
              icon={<MedicalServicesOutlinedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ModuleToggleCard
              title="Tax Deducted at Source (TDS)"
              description="Configure statutory income tax deductions on payroll salary distributions."
              checked={tdsEnabled}
              onChange={setTdsEnabled}
              disabled={!canUpdate}
              icon={<PercentOutlinedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ModuleToggleCard
              title="Professional Tax (PT)"
              description="Calculate and deduct professional tax based on local state compliance policies."
              checked={ptEnabled}
              onChange={setPtEnabled}
              disabled={!canUpdate}
              icon={<WorkOutlineOutlinedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ModuleToggleCard
              title="Labour Welfare Fund (LWF)"
              description="Enable state-mandated social security contribution funds for worker welfare."
              checked={lwfEnabled}
              onChange={setLwfEnabled}
              disabled={!canUpdate}
              icon={<VolunteerActivismOutlinedIcon />}
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
              {submitting ? "Saving..." : "Save Settings"}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Success Snackbar Alert */}
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
          Statutory settings updated successfully
        </Alert>
      </Snackbar>
    </Box>
  );
}
