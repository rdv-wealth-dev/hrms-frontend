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

import TextInput from "../../../components/input/TextInput";
import CustomSelect from "../../../components/input/CustomSelect";
import TagInput from "../../../components/input/TagInput";
import PrimaryButton from "../../../components/button/PrimaryButton";

import { createTeam, type CreateTeamPayload, type TeamItem } from "../../../api/team.api";
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
}

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
}: CreateTeamDialogProps) {
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
              value: d._id || d.id,
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
              value: b._id || b.id,
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

  // Sync default reporting target when departmentHead is loaded
  useEffect(() => {
    if (selectedReportingType === "DEPARTMENT_HEAD" && departmentHead) {
      setValue("reporting.targetId", departmentHead._id || "");
      setValue("reporting.targetName", departmentHead.fullName || "Department Head");
    }
  }, [selectedReportingType, departmentHead, setValue]);

  // Reset form on open
  useEffect(() => {
    if (open) {
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
      setSubmitError(null);
    }
  }, [open, defaultDepartmentId, defaultBranchId, reset]);

  const leadOptions = managers.map((m) => ({
    value: m._id || "",
    label: `${m.fullName || "Employee"}${m.designationTitle ? ` (${m.designationTitle})` : ""}`,
    subtext: m.employeeCode || undefined,
  }));

  const onSubmit = async (values: CreateTeamFormValues) => {
    setSubmitError(null);

    try {
      const payload: CreateTeamPayload = {
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        type: values.type,
        departmentId: values.departmentId,
        branchId: values.branchId?.trim() || undefined,
        leadId: values.leadId?.trim() || undefined,
        isCrossFunctional: values.isCrossFunctional ?? false,
        description: values.description?.trim() || undefined,
        maxConcurrentLeaves:
          values.maxConcurrentLeaves !== undefined && !isNaN(values.maxConcurrentLeaves)
            ? Number(values.maxConcurrentLeaves)
            : undefined,
        reporting: values.reporting?.type
          ? {
              type: values.reporting.type,
              targetId: values.reporting.targetId?.trim() || undefined,
              targetName: values.reporting.targetName?.trim() || undefined,
            }
          : undefined,
        tags: values.tags && values.tags.length > 0 ? values.tags : undefined,
        startDate: values.startDate?.trim() || undefined,
      };

      const response = await createTeam(payload);

      if (response?.success || (response as any)?.succeeded) {
        toast.success(response?.message || "Team created successfully!");
        onSuccess?.(response.data);
        onClose();
      } else {
        const errorMsg = response?.message || "Failed to create team.";
        setSubmitError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "An unexpected error occurred while creating the team.";
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
              backgroundColor: "rgba(109, 93, 246, 0.1)",
              color: "#6D5DF6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GroupsRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.05rem", sm: "1.2rem" }, color: "#0F172A", lineHeight: 1.2 }}>
              Create New Team / Squad
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B", fontSize: "12px" }}>
              Define a collaborative squad under a parent department
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
                    label="Branch (Optional)"
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
                    label="Team Lead (Optional)"
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
                label="Description (Optional)"
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
              Create Team
            </PrimaryButton>
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default CreateTeamDialog;
