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
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import TextInput from "../../../components/input/TextInput";
import CustomSelect from "../../../components/input/CustomSelect";
import TagInput from "../../../components/input/TagInput";
import PrimaryButton from "../../../components/button/PrimaryButton";

import { createTeam, updateTeam, type CreateTeamPayload, type UpdateTeamPayload, type TeamItem } from "../../../api/team.api";
import { listDepartments } from "../../../api/department.api";
import { listBranches } from "../../../api/branch.api";
import { useEligibleManagers } from "../../../hooks/useEligibleManagers";
import { createTeamSchema, type CreateTeamFormValues } from "../../../validations/team/create-team.schema";

export interface CreateTeamDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (team: TeamItem) => void;
  defaultDepartmentId?: string;
  defaultBranchId?: string;
  mode?: "create" | "update";
  teamToEdit?: TeamItem | null;
}

/**
 * Safely extracts a plain string ID from scalar values or populated objects
 */
const extractId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    const rawId = value._id || value.id;
    if (typeof rawId === "string") return rawId.trim();
    if (rawId && typeof rawId === "object") return String(rawId._id || rawId.id || rawId).trim();
    if (rawId) return String(rawId).trim();
  }
  return "";
};

const TEAM_TYPE_OPTIONS = [
  { value: "PERMANENT", label: "Permanent Team", subtext: "Core ongoing business squad" },
  { value: "TEMPORARY", label: "Temporary Squad", subtext: "Short-term operational team" },
  { value: "PROJECT_BASED", label: "Project-Based", subtext: "Formed for a specific client/internal project" },
];

const REPORTING_TYPE_OPTIONS = [
  { value: "DEPARTMENT_HEAD", label: "Department Head", subtext: "Reports to parent Department Head" },
  { value: "DIRECT_MANAGER", label: "Direct Manager", subtext: "Reports to selected team lead / manager" },
  { value: "CUSTOM", label: "Custom Executive", subtext: "Reports to custom executive" },
];

export function CreateTeamDialog({
  open,
  onClose,
  onSuccess,
  defaultDepartmentId,
  defaultBranchId,
  mode = "create",
  teamToEdit,
}: CreateTeamDialogProps) {
  const isUpdateMode = mode === "update" && Boolean(teamToEdit);
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([]);
  const [branches, setBranches] = useState<{ value: string; label: string }[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "PERMANENT",
      departmentId: defaultDepartmentId || "",
      branchId: defaultBranchId || "",
      leadId: "",
      isCrossFunctional: false,
      description: "",
      maxConcurrentLeaves: undefined,
      reporting: {
        type: "DEPARTMENT_HEAD",
        targetId: "",
        targetName: "",
      },
      tags: [],
      startDate: "",
    },
  });

  const selectedDepartmentId = watch("departmentId");
  const selectedBranchId = watch("branchId");
  const selectedReportingType = watch("reporting.type");

  // Dynamic Manager & Department Head hook
  const { managers, departmentHead, loading: loadingManagers } = useEligibleManagers({
    departmentId: selectedDepartmentId || undefined,
    branchId: selectedBranchId || undefined,
  });

  // Load Department & Branch options when dialog opens
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setLoadingMeta(true);
    setSubmitError(null);

    Promise.allSettled([listDepartments(1, 100), listBranches()])
      .then(([deptRes, branchRes]) => {
        if (!isMounted) return;

        if (deptRes.status === "fulfilled" && deptRes.value) {
          const rawDepts = Array.isArray(deptRes.value.data)
            ? deptRes.value.data
            : (deptRes.value.data as any)?.items || [];
          setDepartments(
            rawDepts.map((d: any) => ({
              value: String(d._id || d.id),
              label: d.name,
            }))
          );
        }

        if (branchRes.status === "fulfilled" && branchRes.value) {
          const rawBranches = Array.isArray(branchRes.value.data)
            ? branchRes.value.data
            : (branchRes.value.data as any)?.items || [];
          setBranches(
            rawBranches.map((b: any) => ({
              value: String(b._id || b.id),
              label: b.name,
            }))
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoadingMeta(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  // Sync default reporting target when departmentHead is loaded (only in create mode)
  useEffect(() => {
    if (!isUpdateMode && selectedReportingType === "DEPARTMENT_HEAD" && departmentHead) {
      setValue("reporting.targetId", String(departmentHead._id || ""));
      setValue("reporting.targetName", departmentHead.fullName || "Department Head");
    }
  }, [isUpdateMode, selectedReportingType, departmentHead, setValue]);

  // Pre-fill / Reset form on open
  useEffect(() => {
    if (open) {
      if (isUpdateMode && teamToEdit) {
        const deptId =
          extractId(teamToEdit.department) ||
          extractId(teamToEdit.departmentId) ||
          defaultDepartmentId ||
          "";
        const bId =
          extractId(teamToEdit.branch) ||
          extractId(teamToEdit.branchId) ||
          defaultBranchId ||
          "";
        const lId =
          extractId(teamToEdit.lead) ||
          extractId(teamToEdit.leadId) ||
          "";
        const rTargetId = extractId(teamToEdit.reporting?.targetId);
        const sDate = teamToEdit.startDate
          ? new Date(teamToEdit.startDate).toISOString().split("T")[0]
          : "";

        reset({
          name: teamToEdit.name || "",
          code: teamToEdit.code || "",
          type: (teamToEdit.type as any) || "PERMANENT",
          departmentId: deptId,
          branchId: bId,
          leadId: lId,
          isCrossFunctional: Boolean(teamToEdit.isCrossFunctional),
          description: teamToEdit.description || "",
          maxConcurrentLeaves: teamToEdit.maxConcurrentLeaves,
          reporting: {
            type: (teamToEdit.reporting?.type as any) || "DEPARTMENT_HEAD",
            targetId: rTargetId,
            targetName: teamToEdit.reporting?.targetName || "",
          },
          tags: teamToEdit.tags || [],
          startDate: sDate,
        });
      } else {
        reset({
          name: "",
          code: "",
          type: "PERMANENT",
          departmentId: defaultDepartmentId || "",
          branchId: defaultBranchId || "",
          leadId: "",
          isCrossFunctional: false,
          description: "",
          maxConcurrentLeaves: undefined,
          reporting: {
            type: "DEPARTMENT_HEAD",
            targetId: "",
            targetName: "",
          },
          tags: [],
          startDate: "",
        });
      }
      setSubmitError(null);
    }
  }, [open, isUpdateMode, teamToEdit, defaultDepartmentId, defaultBranchId, reset]);

  const leadOptions = managers.map((m) => ({
    value: String(m._id || (m as any).id || ""),
    label: `${m.fullName || "Employee"}${m.designationTitle ? ` (${m.designationTitle})` : ""}`,
    subtext: m.employeeCode || undefined,
  }));

  const onSubmit = async (values: CreateTeamFormValues) => {
    setSubmitError(null);

    try {
      // Ensure date is formatted as ISO string for backend Zod datetime validator
      let formattedStartDate: string | undefined;
      if (values.startDate && values.startDate.trim()) {
        const parsedDate = new Date(values.startDate.trim());
        if (!isNaN(parsedDate.getTime())) {
          formattedStartDate = parsedDate.toISOString();
        }
      }

      // Ensure leaves is a positive integer >= 1 or undefined
      const cleanLeaves =
        values.maxConcurrentLeaves !== undefined &&
        !isNaN(Number(values.maxConcurrentLeaves)) &&
        Number(values.maxConcurrentLeaves) >= 1
          ? Math.floor(Number(values.maxConcurrentLeaves))
          : undefined;

      const targetTeamId = teamToEdit?._id || teamToEdit?.id;

      if (isUpdateMode && !targetTeamId) {
        setSubmitError("Team ID missing for update.");
        return;
      }

      const payload: CreateTeamPayload = {
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        type: values.type,
        departmentId: extractId(values.departmentId),
        branchId: extractId(values.branchId) || undefined,
        leadId: extractId(values.leadId) || undefined,
        isCrossFunctional: values.isCrossFunctional ?? false,
        description: values.description?.trim() || undefined,
        maxConcurrentLeaves: cleanLeaves,
        reporting: values.reporting?.type
          ? {
              type: values.reporting.type,
              targetId: extractId(values.reporting.targetId) || undefined,
              targetName: values.reporting.targetName?.trim() || undefined,
            }
          : undefined,
        tags: values.tags && values.tags.length > 0 ? values.tags.map((t) => t.trim()).filter(Boolean) : undefined,
        startDate: formattedStartDate,
      };

      const response = isUpdateMode
        ? await updateTeam(String(targetTeamId), payload as UpdateTeamPayload)
        : await createTeam(payload);

      if (response?.success || (response as any)?.succeeded) {
        const successMsg =
          response?.message ||
          (isUpdateMode ? "Team updated successfully!" : "Team created successfully!");
        toast.success(successMsg);
        onSuccess?.(response.data);
        onClose();
      } else {
        const errorMsg =
          response?.message ||
          (isUpdateMode ? "Failed to update team." : "Failed to create team.");
        setSubmitError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      let errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "An unexpected error occurred while saving the team.";

      // Unpack stringified Zod issues array if returned by backend
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
      maxWidth="md"
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
            maxHeight: { xs: "92vh", sm: "88vh" },
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        },
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        component="div"
        sx={{
          py: { xs: 1.75, sm: 2.2 },
          px: { xs: 2, sm: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #F1F5F9",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              backgroundColor: isUpdateMode ? "rgba(16, 185, 129, 0.1)" : "rgba(109, 93, 246, 0.1)",
              color: isUpdateMode ? "#10B981" : "#6D5DF6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isUpdateMode ? <EditOutlinedIcon sx={{ fontSize: 22 }} /> : <GroupsRoundedIcon sx={{ fontSize: 22 }} />}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.05rem", sm: "1.2rem" }, color: "#0F172A", lineHeight: 1.2 }}>
              {isUpdateMode ? "Edit Team Information" : "Create New Team / Squad"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B", fontSize: "12px" }}>
              {isUpdateMode
                ? "Update squad details, capacity limits, and reporting lines"
                : "Define a collaborative squad under a parent department"}
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

      {/* Form Body */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <DialogContent
          sx={{
            p: { xs: 2, sm: 3 },
            pb: { xs: 4, sm: 4 },
            flex: "1 1 auto",
            overflowY: "auto",
            minHeight: 0,
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: "#CBD5E1", borderRadius: "4px" },
          }}
        >
          {submitError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: "10px" }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {/* Section 1: Basic Identity */}
            <Grid size={12}>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                1. Basic Identity & Hierarchy
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 7 }}>
              <TextInput
                label="Team Name"
                placeholder="e.g. Bangalore Backend Core Team"
                registration={register("name")}
                error={errors.name?.message}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 5 }}>
              <TextInput
                label="Team Code"
                placeholder="e.g. BLR-ENG-BE"
                registration={register("code", {
                  onChange: (e) => {
                    setValue("code", (e.target.value ?? "").toUpperCase(), { shouldValidate: true });
                  },
                })}
                error={errors.code?.message}
                slotProps={{ htmlInput: { style: { textTransform: "uppercase" } } }}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="departmentId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Parent Department"
                    placeholder={loadingMeta ? "Loading departments..." : "Select Department"}
                    options={departments}
                    value={field.value}
                    onChange={(val) => field.onChange(String(val))}
                    error={errors.departmentId?.message}
                    searchable
                    required
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="branchId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Branch"
                    placeholder={loadingMeta ? "Loading branches..." : "All / Head Office"}
                    options={[{ value: "", label: "No specific branch (Global)" }, ...branches]}
                    value={field.value || ""}
                    onChange={(val) => field.onChange(String(val))}
                    error={errors.branchId?.message}
                    searchable
                  />
                )}
              />
            </Grid>

            {/* Section 2: Leadership & Reporting */}
            <Grid size={12} sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                2. Leadership & Reporting Structure
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="leadId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Team Lead"
                    placeholder={loadingManagers ? "Loading leads..." : "Select Team Lead"}
                    options={[{ value: "", label: "No assigned lead yet" }, ...leadOptions]}
                    value={field.value || ""}
                    onChange={(val) => field.onChange(String(val))}
                    error={errors.leadId?.message}
                    searchable
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="reporting.type"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Reporting Target"
                    options={REPORTING_TYPE_OPTIONS}
                    value={field.value || "DEPARTMENT_HEAD"}
                    onChange={(val) => field.onChange(val as any)}
                  />
                )}
              />
            </Grid>

            {/* Section 3: Operational Rules & Metadata */}
            <Grid size={12} sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                3. Operational Rules & Metadata
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Team Type"
                    options={TEAM_TYPE_OPTIONS}
                    value={field.value}
                    onChange={(val) => field.onChange(val as any)}
                    error={errors.type?.message}
                    required
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextInput
                label="Max Concurrent Leaves"
                type="number"
                placeholder="e.g. 2"
                registration={register("maxConcurrentLeaves", {
                  valueAsNumber: true,
                })}
                error={errors.maxConcurrentLeaves?.message}
                min={0}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextInput
                label="Start Date"
                type="date"
                registration={register("startDate")}
                error={errors.startDate?.message}
              />
            </Grid>

            {/* Tags */}
            <Grid size={12}>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagInput
                    label="Team Tags (Tech Stack / Focus)"
                    placeholder="Type tag (e.g. NodeJS, Backend) and hit Enter..."
                    tags={field.value || []}
                    onChange={(newTags) => field.onChange(newTags)}
                    error={errors.tags?.message}
                  />
                )}
              />
            </Grid>

            {/* Cross-functional switch */}
            <Grid size={12}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "12px",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: "13.5px", fontWeight: 600, color: "#1E293B" }}>
                    Cross-Functional Squad
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>
                    Allow members from different parent departments to join this squad
                  </Typography>
                </Box>
                <Controller
                  name="isCrossFunctional"
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

            {/* Description */}
            <Grid size={12}>
              <TextInput
                label="Description"
                placeholder="Briefly describe the purpose, goals, or scope of this team..."
                multiline
                rows={2}
                registration={register("description")}
                error={errors.description?.message}
                maxLength={500}
              />
            </Grid>
          </Grid>
        </DialogContent>

        {/* Modal Footer Actions */}
        <DialogActions
          sx={{
            py: 1.75,
            px: { xs: 2, sm: 3 },
            borderTop: "1px solid #F1F5F9",
            backgroundColor: "#FAFAFA",
            display: "flex",
            flexDirection: { xs: "column-reverse", sm: "row" },
            justifyContent: "flex-end",
            gap: 1.25,
            flexShrink: 0,
          }}
        >
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              height: 42,
              borderRadius: "10px",
              px: 2.5,
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              color: "#475569",
              backgroundColor: "#F1F5F9",
              width: { xs: "100%", sm: "auto" },
              "&:hover": { backgroundColor: "#E2E8F0" },
            }}
          >
            Cancel
          </Button>

          <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
            <PrimaryButton
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isUpdateMode ? "Save Changes" : "Create Team"}
            </PrimaryButton>
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default CreateTeamDialog;
