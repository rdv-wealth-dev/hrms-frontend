import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import TextInput from "../../../components/input/TextInput";
import CustomSelect from "../../../components/input/CustomSelect";
import PrimaryButton from "../../../components/button/PrimaryButton";

import {
  addTeamMember,
  updateTeamMember,
  changeTeamLead,
  type AddTeamMemberPayload,
  type UpdateTeamMemberPayload,
  type TeamMember,
} from "../../../api/team.api";
import { listEmployees } from "../../../api/employee.api";
import { addTeamMemberSchema, type AddTeamMemberFormValues } from "../../../validations/team/add-member.schema";

export interface AddTeamMemberDialogProps {
  open: boolean;
  mode?: "add" | "edit";
  memberToEdit?: TeamMember | null;
  teamId: string | null;
  teamName?: string;
  hasActiveLead?: boolean;
  members?: TeamMember[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddTeamMemberDialog({
  open,
  mode = "add",
  memberToEdit,
  teamId,
  teamName,
  hasActiveLead = false,
  members = [],
  onClose,
  onSuccess,
}: AddTeamMemberDialogProps) {
  const isEditMode = mode === "edit";
  const [employees, setEmployees] = useState<{ value: string; label: string; subtext?: string }[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isCurrentLead = isEditMode && (memberToEdit?.roleInTeam as any) === "LEAD";
  // In add mode, disable adding a second lead if one exists. In edit mode, allow promoting to lead.
  const isLeadDisabled = !isEditMode && Boolean(hasActiveLead);

  const roleOptions = [
    { value: "MEMBER", label: "Team Member", subtext: "Standard squad contributor" },
    {
      value: "LEAD",
      label: "Team Lead",
      subtext: isLeadDisabled
        ? "Squad already has a Lead"
        : isEditMode && !isCurrentLead && hasActiveLead
          ? "Reassigns squad leadership to this member"
          : "Squad leader / manager",
      disabled: isLeadDisabled,
      tooltip: isLeadDisabled ? "Team already has a Team Lead. Use 'Change Team Lead' or edit member to reassign leadership" : undefined,
    },
  ];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddTeamMemberFormValues>({
    resolver: zodResolver(addTeamMemberSchema),
    defaultValues: {
      employeeId: "",
      roleInTeam: "MEMBER",
      isPrimary: true,
      allocationPercentage: 100,
    },
  });

  // Extract plain employee ID string from memberToEdit
  const extractEmployeeId = (mem?: TeamMember | null): string => {
    if (!mem) return "";
    if (typeof mem.employeeId === "object" && mem.employeeId) {
      return String(mem.employeeId._id || mem.employeeId.id || "");
    }
    if (typeof mem.employeeId === "string") return mem.employeeId;
    return String(mem._id || mem.id || "");
  };

  // Load active organization employees when open
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setLoadingEmployees(true);
    setSubmitError(null);

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
        console.error("Failed to load employees for team member assignment:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingEmployees(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  // Pre-fill form when dialog opens
  useEffect(() => {
    if (!open) return;

    setSubmitError(null);

    if (isEditMode && memberToEdit) {
      const empId = extractEmployeeId(memberToEdit);
      reset({
        employeeId: empId,
        roleInTeam: isCurrentLead ? "LEAD" : "MEMBER",
        isPrimary: memberToEdit.isPrimary !== false,
        allocationPercentage: memberToEdit.allocationPercentage ?? 100,
      });
    } else {
      reset({
        employeeId: "",
        roleInTeam: "MEMBER",
        isPrimary: true,
        allocationPercentage: 100,
      });
    }
  }, [open, isEditMode, memberToEdit, isCurrentLead, reset]);

  const onSubmit = async (values: AddTeamMemberFormValues) => {
    if (!teamId) {
      setSubmitError("Missing target team ID.");
      return;
    }

    setSubmitError(null);

    try {
      if (isEditMode) {
        // Find target employee ID for member update
        const targetMemberId = extractEmployeeId(memberToEdit) || values.employeeId;
        if (!targetMemberId) {
          setSubmitError("Missing target member ID.");
          return;
        }

        const updatePayload: UpdateTeamMemberPayload = {
          roleInTeam: values.roleInTeam,
          isPrimary: values.isPrimary ?? true,
          allocationPercentage: Number(values.allocationPercentage) || 100,
        };

        const response = await updateTeamMember(teamId, targetMemberId, updatePayload);

        if (values.roleInTeam === "LEAD") {
          // 1. Synchronize team lead endpoint
          await changeTeamLead(teamId, targetMemberId).catch(() => {});

          // 2. Demote all other members who currently have roleInTeam === "LEAD" to "MEMBER"
          if (Array.isArray(members) && members.length > 0) {
            const oldLeads = members.filter((m: any) => {
              const mEmpId = String(
                typeof m.employeeId === "object"
                  ? m.employeeId?._id || m.employeeId?.id
                  : m.employeeId || m._id || m.id
              );
              return m.roleInTeam === "LEAD" && mEmpId !== targetMemberId && m._id !== targetMemberId;
            });

            const demotePromises = oldLeads.map((oldM: any) => {
              const oldTargetId = String(
                typeof oldM.employeeId === "object"
                  ? oldM.employeeId?._id || oldM.employeeId?.id
                  : oldM.employeeId || oldM._id || oldM.id
              );
              return updateTeamMember(teamId, oldTargetId, { roleInTeam: "MEMBER" }).catch(() => {});
            });

            if (demotePromises.length > 0) {
              await Promise.allSettled(demotePromises);
            }
          }
        }

        if (response?.success || (response as any)?.succeeded) {
          toast.success(response?.message || "Team member updated successfully!");
          onSuccess?.();
          onClose();
        } else {
          const msg = response?.message || "Failed to update team member.";
          setSubmitError(msg);
          toast.error(msg);
        }
      } else {
        const createPayload: AddTeamMemberPayload = {
          employeeId: values.employeeId,
          roleInTeam: values.roleInTeam,
          isPrimary: values.isPrimary ?? true,
          allocationPercentage: Number(values.allocationPercentage) || 100,
        };

        const response = await addTeamMember(teamId, createPayload);

        if (response?.success || (response as any)?.succeeded) {
          toast.success(response?.message || "Team member added successfully!");
          onSuccess?.();
          onClose();
        } else {
          const msg = response?.message || "Failed to add member to team.";
          setSubmitError(msg);
          toast.error(msg);
        }
      }
    } catch (err: any) {
      let errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        `Failed to ${isEditMode ? "update" : "add"} team member.`;

      if (typeof errorMsg === "string" && errorMsg.trim().startsWith("[") && errorMsg.includes("message")) {
        try {
          const parsed = JSON.parse(errorMsg);
          if (Array.isArray(parsed) && parsed.length > 0) {
            errorMsg = parsed.map((item: any) => `${item.path?.join(".") || "Field"}: ${item.message}`).join(" | ");
          }
        } catch {
          // Keep raw string
        }
      }

      setSubmitError(errorMsg);
      toast.error(errorMsg);
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
            backgroundColor: "background.paper",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid",
            borderColor: "divider",
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
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              backgroundColor: isEditMode ? "primary.lighter" : "rgba(16, 185, 129, 0.1)",
              color: isEditMode ? "primary.main" : "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isEditMode ? <EditOutlinedIcon sx={{ fontSize: 22 }} /> : <PersonAddAlt1Icon sx={{ fontSize: 22 }} />}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "text.primary", lineHeight: 1.2 }}>
              {isEditMode ? "Edit Member Allocation & Role" : "Add Member to Squad"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {teamName ? `Managing member for ${teamName}` : "Configure member role and capacity allocation"}
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          disabled={isSubmitting}
          size="small"
          sx={{
            color: "text.secondary",
            borderRadius: "10px",
            "&:hover": { backgroundColor: "action.hover", color: "text.primary" },
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      {/* Form Content */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent sx={{ p: 3 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: "10px" }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Select Employee (Disabled in Edit Mode) */}
            <Grid size={12}>
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Employee"
                    placeholder={loadingEmployees ? "Loading employees..." : "Search employee..."}
                    options={employees}
                    value={field.value}
                    onChange={(val) => field.onChange(String(val))}
                    error={errors.employeeId?.message}
                    disabled={isEditMode}
                    searchable
                    required
                  />
                )}
              />
            </Grid>

            {/* Team Role */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="roleInTeam"
                control={control}
                render={({ field }) => (
                  <Box>
                    <CustomSelect
                      label="Role in Team"
                      options={roleOptions}
                      value={field.value}
                      onChange={(val) => field.onChange(val as any)}
                      error={errors.roleInTeam?.message}
                      required
                    />
                    {isLeadDisabled && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#64748B",
                          display: "block",
                          mt: 0.75,
                          fontSize: "11.5px",
                          lineHeight: 1.3,
                        }}
                      >
                        ℹ️ Team already has a Team Lead. Use <b>Change Team Lead</b> to reassign leadership.
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Grid>

            {/* Allocation Percentage */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Capacity Allocation (%)"
                type="number"
                placeholder="100"
                registration={register("allocationPercentage", {
                  valueAsNumber: true,
                })}
                slotProps={{ htmlInput: { min: 1, max: 100 } }}
                required
              />
            </Grid>

            {/* Primary Team Switch */}
            <Grid size={12}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "12px",
                  backgroundColor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: "13.5px", fontWeight: 600, color: "text.primary" }}>
                    Primary Team Assignment
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                    Set this team as the employee's primary squad assignment
                  </Typography>
                </Box>
                <Controller
                  name="isPrimary"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={Boolean(field.value)}
                      onChange={(e) => field.onChange(e.target.checked)}
                      color="primary"
                    />
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        {/* Footer Actions */}
        <DialogActions
          sx={{
            py: 1.75,
            px: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "action.hover",
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
              color: "text.secondary",
              backgroundColor: "action.hover",
              "&:hover": { backgroundColor: "divider" },
            }}
          >
            Cancel
          </Button>

          <PrimaryButton type="submit" loading={isSubmitting} disabled={isSubmitting}>
            {isEditMode ? "Save Changes" : "Add Member"}
          </PrimaryButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default AddTeamMemberDialog;
