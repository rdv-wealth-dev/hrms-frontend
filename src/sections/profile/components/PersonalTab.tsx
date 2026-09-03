import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ContactEmergencyOutlinedIcon from "@mui/icons-material/ContactEmergencyOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";

import ConfirmDialog from "../../../components/modal/ConfirmDialog";
import { useDialog } from "../../../hooks/useDialog";
import { useProfileSelfUpdate } from "../../../hooks/useProfileSelfUpdate";
import EmergencyContactDialog from "./EmergencyContactDialog";
import type { CompleteProfileEmployee, EmergencyContact } from "../../../api/employee.api";

import TuneIcon from "@mui/icons-material/Tune";
import useCustomFields from "../../../hooks/useCustomFields";

interface PersonalTabProps {
  empProfile: CompleteProfileEmployee | null;
  isViewingOther: boolean;
  displayFirstName: string;
  displayLastName: string;
  displayEmail: string;
  handleOpenEditProfile: () => void;
  onRefreshProfileData: () => Promise<void>;
  showSnackbar: (msg: string, variant: "success" | "error" | "info" | "warning") => void;
}

export default function PersonalTab({
  empProfile,
  isViewingOther,
  displayFirstName,
  displayLastName,
  displayEmail,
  handleOpenEditProfile,
  onRefreshProfileData,
  showSnackbar,
}: PersonalTabProps) {
  const { customFields: activeCustomFields } = useCustomFields({ scope: "ORGANIZATION" });
  const ecDialog = useDialog<void>();
  const [ecDeleteTarget, setEcDeleteTarget] = useState<number | null>(null);
  const [ecDeleteConfirmOpen, setEcDeleteConfirmOpen] = useState(false);
  const [ecSuccessMessage, setEcSuccessMessage] = useState("");

  const onEcUpdated = useCallback(async () => {
    await onRefreshProfileData();
    ecDialog.close();
    setEcDeleteConfirmOpen(false);
    setEcDeleteTarget(null);
    showSnackbar(ecSuccessMessage, "success");
  }, [ecDialog, ecSuccessMessage, showSnackbar, onRefreshProfileData]);

  const ecUpdater = useProfileSelfUpdate(onEcUpdated);

  const handleAddEmergencyContact = async (contact: EmergencyContact) => {
    const current = empProfile?.emergencyContacts ?? [];
    setEcSuccessMessage("Emergency contact added successfully");
    await ecUpdater.submit({ emergencyContacts: [...current, contact] });
  };

  const handleDeleteEmergencyContact = async () => {
    if (ecDeleteTarget === null) return;
    const updated = (empProfile?.emergencyContacts ?? []).filter((_, i) => i !== ecDeleteTarget);
    setEcSuccessMessage("Emergency contact removed successfully");
    await ecUpdater.submit({ emergencyContacts: updated });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Personal Info Card */}
      <Card sx={{ p: 3.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", display: "flex", alignItems: "center", gap: 1 }}>
            <BadgeOutlinedIcon sx={{ color: "#4F46E5" }} />
            Personal Information
          </Typography>
          {!isViewingOther && (
            <Button size="small" startIcon={<EditOutlinedIcon />} onClick={handleOpenEditProfile} sx={{ textTransform: "none", color: "#4F46E5", fontWeight: 600 }}>
              Edit Details
            </Button>
          )}
        </Box>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>First Name</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary", mt: 0.5 }}>{displayFirstName || "—"}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>Last Name</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary", mt: 0.5 }}>{displayLastName || "—"}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>Email Address</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary", mt: 0.5 }}>{displayEmail || "—"}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>Phone Number</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary", mt: 0.5 }}>{empProfile?.phone || "—"}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>Gender</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary", mt: 0.5 }}>{empProfile?.gender || "—"}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>Date of Birth</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary", mt: 0.5 }}>
              {empProfile?.dateOfBirth ? new Date(empProfile.dateOfBirth).toLocaleDateString(undefined, { dateStyle: "medium", timeZone: "UTC" }) : "—"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>Current Address</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary", mt: 0.5 }}>
              {empProfile?.currentAddress?.addressLine1 ? (
                `${empProfile.currentAddress.addressLine1}, ${empProfile.currentAddress.city || ""}, ${empProfile.currentAddress.state || ""}, ${empProfile.currentAddress.countryCode || ""} ${empProfile.currentAddress.zip || ""}`
              ) : "—"}
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Emergency Contacts Card */}
      <Card sx={{ p: 3.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", display: "flex", alignItems: "center", gap: 1 }}>
            <ContactEmergencyOutlinedIcon sx={{ color: "#4F46E5" }} />
            Emergency Contacts
          </Typography>
          {!isViewingOther && (
            <Button size="small" startIcon={<AddIcon />} onClick={() => ecDialog.open()} sx={{ textTransform: "none", color: "#4F46E5", fontWeight: 600 }}>
              Add Contact
            </Button>
          )}
        </Box>

        {(empProfile?.emergencyContacts ?? []).length === 0 ? (
          <Typography variant="body2" sx={{ color: "#94A3B8", textAlign: "center", py: 2 }}>
            No emergency contacts added yet
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {(empProfile?.emergencyContacts ?? []).map((ec, idx) => (
              <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", backgroundColor: "action.hover" }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>{ec.name}</Typography>
                  <Typography variant="caption" sx={{ color: "#64748B" }}>{ec.relationship} · {ec.phone}</Typography>
                </Box>
                {!isViewingOther && (
                  <IconButton size="small" onClick={() => { setEcDeleteTarget(idx); setEcDeleteConfirmOpen(true); }} sx={{ color: "#94A3B8" }}>
                    <DeleteOutlinedIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Card>

      {/* Dynamic Custom Fields Card */}
      {activeCustomFields && activeCustomFields.length > 0 && (
        <Card sx={{ p: 3.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <TuneIcon sx={{ color: "#4F46E5" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
              Additional Custom Information
            </Typography>
          </Box>
          <Grid container spacing={2.5}>
            {activeCustomFields.map((field) => {
              const customData = (empProfile as any)?.customFields || {};
              const rawVal = customData[field.fieldKey] ?? field.defaultValue ?? "—";
              const displayVal = Array.isArray(rawVal)
                ? rawVal.join(", ")
                : typeof rawVal === "boolean"
                ? rawVal ? "Yes" : "No"
                : String(rawVal);

              return (
                <Grid key={field._id} size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>
                    {field.fieldLabel}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary", mt: 0.5 }}>
                    {displayVal || "—"}
                  </Typography>
                </Grid>
              );
            })}
          </Grid>
        </Card>
      )}

      {/* Add Emergency Contact dialog */}
      <EmergencyContactDialog
        open={ecDialog.isOpen}
        onClose={ecDialog.close}
        onSave={handleAddEmergencyContact}
        submitting={ecUpdater.submitting}
        error={ecUpdater.error}
      />

      {/* Delete Emergency Contact Confirm Dialog */}
      <ConfirmDialog
        open={ecDeleteConfirmOpen}
        title="Remove Emergency Contact?"
        content="Are you sure you want to remove this emergency contact? This action cannot be undone."
        confirmLabel="Remove"
        loading={ecUpdater.submitting}
        onConfirm={handleDeleteEmergencyContact}
        onClose={() => { if (!ecUpdater.submitting) { setEcDeleteConfirmOpen(false); setEcDeleteTarget(null); } }}
      />
    </Box>
  );
}
