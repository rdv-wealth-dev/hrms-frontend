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
import { useSnackbar } from "../../../components/snackbar";

import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import FingerprintOutlinedIcon from "@mui/icons-material/FingerprintOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import DriveEtaOutlinedIcon from "@mui/icons-material/DriveEtaOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import SaveIcon from "@mui/icons-material/Save";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import {
  loadOrganizationRequest,
  updateMandatoryDocsRequest,
  resetOrganizationStatus,
} from "../../../store/organization";
import { usePermissions } from "../../../hooks/usePermissions";
import ModuleToggleCard from "../../../components/card/ModuleToggleCard";

const DOCUMENT_ITEMS = [
  {
    type: "PAN",
    title: "PAN Card",
    description: "Permanent Account Number card issued by the Income Tax Department.",
    icon: <BadgeOutlinedIcon />,
  },
  {
    type: "AADHAAR",
    title: "Aadhaar Card",
    description: "12-digit unique identity number issued by the UIDAI representing residency proof.",
    icon: <FingerprintOutlinedIcon />,
  },
  {
    type: "PASSPORT",
    title: "Passport",
    description: "Official government-issued document certifying identity and citizenship for international travel.",
    icon: <PublicOutlinedIcon />,
  },
  {
    type: "DRIVING_LICENSE",
    title: "Driving License",
    description: "Official document permitting individuals to operate motorized vehicles on public roads.",
    icon: <DriveEtaOutlinedIcon />,
  },
  {
    type: "RESUME",
    title: "Resume / CV",
    description: "Professional profile summarizing career, educational qualifications, and key skills.",
    icon: <DescriptionOutlinedIcon />,
  },
  {
    type: "DEGREE",
    title: "Degree Certificate",
    description: "Academic qualification diploma issued by an accredited university or college.",
    icon: <SchoolOutlinedIcon />,
  },
  {
    type: "EXPERIENCE",
    title: "Experience Certificate",
    description: "Formal document from previous employers certifying tenure, designation, and roles.",
    icon: <BusinessCenterOutlinedIcon />,
  },
];

export default function OrganizationDocumentsContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { showSnackbar } = useSnackbar();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("settings.update");

  const { organization, loading, submitting, success, error } = useSelector(
    (state: RootState) => state.organization
  );

  const [mandatoryDocs, setMandatoryDocs] = useState<string[]>([]);

  useEffect(() => {
    dispatch(loadOrganizationRequest());
    return () => {
      dispatch(resetOrganizationStatus());
    };
  }, [dispatch]);

  // Synchronize switches with fetched details
  useEffect(() => {
    if (organization) {
      setMandatoryDocs(organization.mandatoryDocumentTypes || []);
    }
  }, [organization]);

  useEffect(() => {
    if (success) {
      showSnackbar("Mandatory document types updated successfully", "success");
      dispatch(resetOrganizationStatus());
    }
  }, [success, dispatch, showSnackbar]);

  const handleToggle = (type: string, checked: boolean) => {
    if (checked) {
      setMandatoryDocs((prev) => [...prev, type]);
    } else {
      setMandatoryDocs((prev) => prev.filter((d) => d !== type));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdate) return;

    dispatch(
      updateMandatoryDocsRequest({
        mandatoryDocumentTypes: mandatoryDocs,
      })
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
        <CircularProgress size={40} sx={{ color: "primary.main" }} />
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
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 } }} component="form" onSubmit={handleSubmit}>
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
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileUploadOutlinedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 750, color: "text.primary" }}>
              Mandatory Onboarding Documents
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure which documents are strictly required from employees to complete profile verification
            </Typography>
          </Box>
        </Box>

        <Divider />

        <Grid container spacing={3}>
          {DOCUMENT_ITEMS.map((item) => (
            <Grid key={item.type} size={{ xs: 12, sm: 6 }}>
              <ModuleToggleCard
                title={item.title}
                description={item.description}
                checked={mandatoryDocs.includes(item.type)}
                onChange={(checked) => handleToggle(item.type, checked)}
                disabled={!canUpdate}
                icon={item.icon}
              />
            </Grid>
          ))}
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
                backgroundColor: "primary.main",
                color: "#fff",
                px: 4,
                py: 1.5,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0px 4px 12px rgba(109, 93, 246, 0.2)",
                "&:hover": {
                  backgroundColor: "primary.dark",
                  boxShadow: "0px 6px 16px rgba(109, 93, 246, 0.3)",
                },
              }}
            >
              {submitting ? "Saving..." : "Save Settings"}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
