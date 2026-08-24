import { useEffect, useState } from "react";
import { toast } from "sonner";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";

import CustomSelect from "../../../components/input/CustomSelect";
import PrimaryButton from "../../../components/button/PrimaryButton";

import { changeTeamLead, updateTeamMember, type TeamMember } from "../../../api/team.api";
import { listEmployees } from "../../../api/employee.api";

export interface ChangeTeamLeadDialogProps {
  open: boolean;
  teamId: string | null;
  teamName?: string;
  currentLeadName?: string | null;
  members?: TeamMember[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function ChangeTeamLeadDialog({
  open,
  teamId,
  teamName,
  currentLeadName,
  members = [],
  onClose,
  onSuccess,
}: ChangeTeamLeadDialogProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [employees, setEmployees] = useState<{ value: string; label: string; subtext?: string }[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load team members (or organization employees as fallback) when open
  useEffect(() => {
    if (!open) return;

    setSubmitError(null);
    setSelectedLeadId("");

    if (Array.isArray(members) && members.length > 0) {
      setEmployees(
        members.map((mem: any) => {
          const emp = typeof mem.employeeId === "object" && mem.employeeId ? mem.employeeId : null;
          const empId = String(emp?._id || emp?.id || (typeof mem.employeeId === "string" ? mem.employeeId : "") || mem._id || mem.id || "");
          const name = emp?.fullName || `${emp?.firstName || ""} ${emp?.lastName || ""}`.trim() || mem.fullName || "Member";
          const code = emp?.employeeCode || mem.employeeCode ? `[${emp?.employeeCode || mem.employeeCode}]` : "";
          const desig = typeof emp?.designation === "object" ? emp.designation?.name : emp?.designation || mem.designation || "";
          const roleBadge = mem.roleInTeam ? `(${mem.roleInTeam})` : "";
          return {
            value: empId,
            label: `${name} ${code} ${roleBadge}`.trim(),
            subtext: desig || undefined,
          };
        })
      );
      setLoadingEmployees(false);
    } else {
      let isMounted = true;
      setLoadingEmployees(true);

      listEmployees(1, 100, undefined, "ACTIVE")
        .then((res) => {
          if (!isMounted) return;
          const items = Array.isArray(res?.data) ? res.data : (res?.data as any)?.items || [];
          setEmployees(
            items.map((emp: any) => {
              const empId = String(emp._id || emp.id);
              const name = emp.fullName || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Employee";
              const code = emp.employeeCode ? `[${emp.employeeCode}]` : "";
              const desig = typeof emp.designation === "object" ? emp.designation?.name : emp.designation || "";
              return {
                value: empId,
                label: `${name} ${code}`.trim(),
                subtext: desig || undefined,
              };
            })
          );
        })
        .catch((err) => {
          console.error("Failed to load employees for team lead selection:", err);
        })
        .finally(() => {
          if (isMounted) setLoadingEmployees(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [open, members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamId) {
      setSubmitError("Missing target team ID.");
      return;
    }

    if (!selectedLeadId) {
      setSubmitError("Please select a new team lead.");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await changeTeamLead(teamId, selectedLeadId);

      // Synchronize roleInTeam across squad members so the table immediately updates
      const syncPromises: Promise<any>[] = [];

      // 1. Promote new lead in members list
      const newLeadMember = members.find((m: any) => {
        const mEmpId = String(typeof m.employeeId === "object" ? m.employeeId?._id || m.employeeId?.id : m.employeeId || m._id || m.id);
        return mEmpId === selectedLeadId || m._id === selectedLeadId;
      });
      if (newLeadMember) {
        const targetId = String(typeof newLeadMember.employeeId === "object" ? newLeadMember.employeeId?._id || newLeadMember.employeeId?.id : newLeadMember.employeeId || newLeadMember._id || newLeadMember.id);
        syncPromises.push(updateTeamMember(teamId, targetId, { roleInTeam: "LEAD" }).catch(() => {}));
      }

      // 2. Demote old lead(s) in members list
      const oldLeads = members.filter((m: any) => {
        const mEmpId = String(typeof m.employeeId === "object" ? m.employeeId?._id || m.employeeId?.id : m.employeeId || m._id || m.id);
        return m.roleInTeam === "LEAD" && mEmpId !== selectedLeadId && m._id !== selectedLeadId;
      });
      oldLeads.forEach((oldM: any) => {
        const targetId = String(typeof oldM.employeeId === "object" ? oldM.employeeId?._id || oldM.employeeId?.id : oldM.employeeId || oldM._id || oldM.id);
        syncPromises.push(updateTeamMember(teamId, targetId, { roleInTeam: "MEMBER" }).catch(() => {}));
      });

      if (syncPromises.length > 0) {
        await Promise.allSettled(syncPromises);
      }

      if (response?.success || (response as any)?.succeeded) {
        toast.success(response?.message || "Team lead updated successfully!");
        onSuccess?.();
        onClose();
      } else {
        const msg = response?.message || "Failed to update team lead.";
        setSubmitError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to change team lead.";
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
          },
        },
        paper: {
          sx: {
            borderRadius: { xs: "16px", sm: "20px" },
            p: 0,
            backgroundColor: "#FFFFFF",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid #E2E8F0",
            mx: { xs: 1.5, sm: "auto" },
            width: { xs: "calc(100% - 24px)", sm: "100%" },
            overflow: "hidden",
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        component="div"
        sx={{
          py: 2,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              color: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PersonIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A", lineHeight: 1.2 }}>
              Change Team Lead
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B" }}>
              {teamName ? `Reassign squad leadership for ${teamName}` : "Reassign squad leadership to another employee"}
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          disabled={isSubmitting}
          size="small"
          sx={{
            color: "#64748B",
            borderRadius: "10px",
            "&:hover": { backgroundColor: "#F1F5F9", color: "#0F172A" },
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      {/* Form Content */}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ p: 3 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: "10px" }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Current Lead Notice */}
            <Grid size={12}>
              <Box
                sx={{
                  p: 1.75,
                  borderRadius: "12px",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                  Current Team Lead:
                </Typography>
                <Typography variant="body2" sx={{ color: "#0F172A", fontWeight: 700 }}>
                  {currentLeadName || "Currently Unassigned"}
                </Typography>
              </Box>
            </Grid>

            {/* Select New Team Lead */}
            <Grid size={12}>
              <CustomSelect
                label="Select New Team Lead from Squad Members"
                placeholder={loadingEmployees ? "Loading squad members..." : "Search member by name..."}
                options={employees}
                value={selectedLeadId}
                onChange={(val) => setSelectedLeadId(String(val))}
                searchable
                required
              />
            </Grid>
          </Grid>
        </DialogContent>

        {/* Footer Actions */}
        <DialogActions
          sx={{
            py: 1.75,
            px: 3,
            borderTop: "1px solid #F1F5F9",
            backgroundColor: "#FAFAFA",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.25,
          }}
        >
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              height: 40,
              borderRadius: "10px",
              px: 2.5,
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              color: "#475569",
              backgroundColor: "#F1F5F9",
              "&:hover": { backgroundColor: "#E2E8F0" },
            }}
          >
            Cancel
          </Button>

          <PrimaryButton type="submit" loading={isSubmitting} disabled={isSubmitting || !selectedLeadId}>
            Assign Team Lead
          </PrimaryButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default ChangeTeamLeadDialog;
