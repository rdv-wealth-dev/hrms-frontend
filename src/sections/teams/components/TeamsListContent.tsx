import { useState, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import GroupsIcon from "@mui/icons-material/Groups";
import ApartmentIcon from "@mui/icons-material/Apartment";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { toast } from "sonner";

import CustomAvatar from "../../../components/avatar/CustomAvatar";
import CustomSelect from "../../../components/input/CustomSelect";
import StatusChip from "../../../components/common/StatusChip";
import CreateTeamDialog from "./CreateTeamDialog";
import TeamDetailDialog from "./TeamDetailDialog";
import ConfirmDialog from "../../../components/modal/ConfirmDialog";
import { useTeams } from "../../../hooks/useTeams";
import { usePermissions } from "../../../hooks/usePermissions";
import { useDialog } from "../../../hooks/useDialog";
import { listDepartments } from "../../../api/department.api";
import { listBranches } from "../../../api/branch.api";
import { deleteTeam, type TeamItem } from "../../../api/team.api";

const TYPE_OPTIONS = [
  { value: "ALL", label: "All Types" },
  { value: "PERMANENT", label: "Permanent Squad" },
  { value: "PROJECT_BASED", label: "Project Based" },
  { value: "TEMPORARY", label: "Temporary Squad" },
];

export function TeamsListContent() {
  const { canCreateTeam, canUpdateTeam, canDeleteTeam } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [isCrossOnly, setIsCrossOnly] = useState<boolean>(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const detailDialog = useDialog<string>();
  const editDialog = useDialog<TeamItem>();
  const deleteDialog = useDialog<TeamItem>();

  // Dropdown options
  const [departmentOptions, setDepartmentOptions] = useState<{ value: string; label: string }[]>([]);
  const [branchOptions, setBranchOptions] = useState<{ value: string; label: string }[]>([]);

  // API Call using useTeams hook
  const { teams, loading, error, refetch } = useTeams({
    departmentId: selectedDeptId || undefined,
    branchId: selectedBranchId || undefined,
    type: selectedType !== "ALL" ? selectedType : undefined,
    isCrossFunctional: isCrossOnly ? true : undefined,
    autoFetch: true,
  });

  // Load Department & Branch meta options
  useEffect(() => {
    Promise.allSettled([listDepartments(1, 100), listBranches()]).then(([deptRes, branchRes]) => {
      if (deptRes.status === "fulfilled" && deptRes.value) {
        const rawDepts = Array.isArray(deptRes.value.data)
          ? deptRes.value.data
          : (deptRes.value.data as any)?.items || [];
        setDepartmentOptions(
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
        setBranchOptions(
          rawBranches.map((b: any) => ({
            value: String(b._id || b.id),
            label: b.name,
          }))
        );
      }
    });
  }, []);

  // Local search filter
  const filteredTeams = useMemo(() => {
    if (!searchTerm.trim()) return teams;
    const q = searchTerm.toLowerCase().trim();
    return teams.filter((t) => {
      const nameMatch = t.name?.toLowerCase().includes(q);
      const codeMatch = t.code?.toLowerCase().includes(q);
      const leadName = typeof t.lead === "object" ? `${t.lead.firstName || ""} ${t.lead.lastName || ""}` : "";
      const leadMatch = leadName.toLowerCase().includes(q);
      return nameMatch || codeMatch || leadMatch;
    });
  }, [teams, searchTerm]);

  const getTypeChipColor = (type: string) => {
    switch (type) {
      case "PERMANENT":
        return { bg: "#EEF2FF", color: "#4F46E5", border: "#C7D2FE" };
      case "PROJECT_BASED":
        return { bg: "#F0FDF4", color: "#166534", border: "#BBF7D0" };
      case "TEMPORARY":
        return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
      default:
        return { bg: "action.hover", color: "text.secondary", border: "divider" };
    }
  };

  const handleDeleteTeam = async () => {
    const target = deleteDialog.target;
    const targetId = target?._id || target?.id;
    if (!targetId) return;

    setDeleting(true);
    try {
      const response = await deleteTeam(String(targetId));
      toast.success(response?.message || "Team deleted successfully!");
      deleteDialog.close();
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete team.";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      {/* Controls Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              backgroundColor: "primary.lighter",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GroupsIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
              Teams & Squads Directory
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredTeams.length} {filteredTeams.length === 1 ? "team" : "teams"} available
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", width: { xs: "100%", sm: "auto" } }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={loading}
            sx={{
              height: 40,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              borderColor: "divider",
              color: "text.secondary",
              "&:hover": { backgroundColor: "action.hover", borderColor: "divider" },
            }}
          >
            Refresh
          </Button>

          {canCreateTeam && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{
                height: 40,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "10px",
                px: 2.5,
                backgroundColor: "primary.main",
                boxShadow: "0 2px 8px rgba(109, 93, 246, 0.25)",
                "&:hover": { backgroundColor: "primary.dark" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Create Team / Squad
            </Button>
          )}
        </Box>
      </Box>

      {/* Filters Bar */}
      <Card
        sx={{
          mb: 3,
          p: 2,
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          backgroundColor: "background.paper",
        }}
      >
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          {/* Search Box */}
          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search team name, code, lead..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 20, color: "#94A3B8" }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "#F8FAFC",
                  "&:hover fieldset": { borderColor: "#CBD5E1" },
                },
              }}
            />
          </Grid>

          {/* Department Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <CustomSelect
              label=""
              placeholder="All Departments"
              options={[{ value: "", label: "All Departments" }, ...departmentOptions]}
              value={selectedDeptId}
              onChange={(val) => setSelectedDeptId(String(val))}
              searchable
            />
          </Grid>

          {/* Branch Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <CustomSelect
              label=""
              placeholder="All Branches"
              options={[{ value: "", label: "All Branches" }, ...branchOptions]}
              value={selectedBranchId}
              onChange={(val) => setSelectedBranchId(String(val))}
              searchable
            />
          </Grid>

          {/* Team Type Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <CustomSelect
              label=""
              placeholder="Team Type"
              options={TYPE_OPTIONS}
              value={selectedType}
              onChange={(val) => setSelectedType(String(val))}
            />
          </Grid>

          {/* Cross Functional Toggle */}
          <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isCrossOnly}
                  onChange={(e) => setIsCrossOnly(e.target.checked)}
                  size="small"
                  color="primary"
                />
              }
              label={
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>
                  Cross-Func
                </Typography>
              }
            />
          </Grid>
        </Grid>
      </Card>

      {/* Main Content Area */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={36} sx={{ color: "primary.main" }} />
        </Box>
      ) : filteredTeams.length === 0 ? (
        <Box
          sx={{
            py: 8,
            px: 2,
            textAlign: "center",
            backgroundColor: "background.paper",
            borderRadius: "16px",
            border: "1px dashed #CBD5E1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <GroupsIcon sx={{ fontSize: 56, color: "#94A3B8" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
            No Teams Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
            {searchTerm || selectedDeptId || selectedBranchId || selectedType !== "ALL"
              ? "No teams match your current filter parameters. Try clearing your filters."
              : "No teams have been created yet. Click 'Create Team / Squad' to set up your first team."}
          </Typography>
          {canCreateTeam && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{
                mt: 1,
                borderRadius: "10px",
                backgroundColor: "primary.main",
                "&:hover": { backgroundColor: "primary.dark" },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Create Team / Squad
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filteredTeams.map((team: TeamItem) => {
            const typeStyle = getTypeChipColor(team.type);
            const deptName =
              typeof team.department === "object"
                ? team.department?.name
                : "Parent Dept";
            const branchName =
              typeof team.branch === "object" ? team.branch?.name : null;
            const leadObj =
              typeof team.lead === "object" ? team.lead : null;
            const leadFullName = leadObj
              ? leadObj.fullName || `${leadObj.firstName || ""} ${leadObj.lastName || ""}`.trim()
              : null;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={team._id || team.id || team.code}>
                <Card
                  onClick={() => {
                    const targetId = team._id || team.id;
                    if (targetId) detailDialog.open(String(targetId));
                  }}
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                      borderColor: "primary.main",
                      transform: "translateY(-2px)",
                    },
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    {/* Header: Name + Code + Type Badge + Edit Button */}
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 1.5 }}>
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "16px", color: "text.primary", lineHeight: 1.3 }}>
                          {team.name}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: "0.5px" }}>
                          {team.code}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Chip
                          label={team.type?.replace("_", " ")}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "11px",
                            backgroundColor: typeStyle.bg,
                            color: typeStyle.color,
                            border: `1px solid ${typeStyle.border}`,
                            borderRadius: "6px",
                          }}
                        />
                        {canUpdateTeam && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              editDialog.open(team);
                            }}
                            sx={{
                              color: "primary.main",
                              p: 0.5,
                              borderRadius: "6px",
                              "&:hover": { backgroundColor: "primary.lighter" },
                            }}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        )}
                        {canDeleteTeam && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDialog.open(team);
                            }}
                            sx={{
                              color: "#EF4444",
                              p: 0.5,
                              borderRadius: "6px",
                              "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.1)" },
                            }}
                          >
                            <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>

                    {/* Description */}
                    {team.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748B",
                          fontSize: "13px",
                          mb: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {team.description}
                      </Typography>
                    )}

                    <Box sx={{ mt: "auto", pt: 1.5, borderTop: "1px solid #F1F5F9" }}>
                      {/* Meta Details */}
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        {/* Department */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <ApartmentIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                          <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600 }}>
                            {deptName || "Department"}
                          </Typography>
                        </Box>

                        {/* Branch */}
                        {branchName && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <LocationOnIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                            <Typography variant="caption" sx={{ color: "#475569" }}>
                              {branchName}
                            </Typography>
                          </Box>
                        )}

                        {/* Lead */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                          {leadFullName ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                              <CustomAvatar name={leadFullName} size={20} fontSize="10px" />
                              <Typography variant="caption" sx={{ fontWeight: 600, color: "#1E293B" }}>
                                {leadFullName}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="caption" sx={{ color: "#94A3B8", fontStyle: "italic" }}>
                              No Lead Assigned
                            </Typography>
                          )}
                        </Box>

                        {/* Max Concurrent Leaves */}
                        {team.maxConcurrentLeaves !== undefined && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <EventAvailableIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                            <Typography variant="caption" sx={{ color: "#475569" }}>
                              Max {team.maxConcurrentLeaves} Concurrent Leaves
                            </Typography>
                          </Box>
                        )}
                      </Stack>

                      {/* Footer Chips */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                        <Chip
                          icon={<GroupsIcon sx={{ fontSize: "14px !important" }} />}
                          label={`${team.memberCount ?? 0} Members`}
                          size="small"
                          sx={{
                            backgroundColor: "#F1F5F9",
                            color: "#334155",
                            fontWeight: 600,
                            fontSize: "11px",
                            borderRadius: "6px",
                          }}
                        />

                        {team.isCrossFunctional && (
                          <Chip
                            label="Cross-Functional"
                            size="small"
                            sx={{
                              backgroundColor: "#FAF5FF",
                              color: "#7E22CE",
                              border: "1px solid #E9D5FF",
                              fontWeight: 600,
                              fontSize: "10px",
                              borderRadius: "6px",
                            }}
                          />
                        )}

                        <StatusChip status={team.isActive !== false ? "PRESENT" : "INACTIVE"} size="small" />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create Team Modal */}
      <CreateTeamDialog
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSuccess={() => refetch()}
        defaultBranchId={selectedBranchId}
        defaultDepartmentId={selectedDeptId}
      />

      {/* Edit Team Modal */}
      <CreateTeamDialog
        open={editDialog.isOpen}
        mode="update"
        teamToEdit={editDialog.target}
        onClose={() => editDialog.close()}
        onSuccess={() => {
          refetch();
          editDialog.close();
        }}
      />

      {/* Team Detail Modal */}
      <TeamDetailDialog
        open={detailDialog.isOpen}
        teamId={detailDialog.target}
        onClose={detailDialog.close}
        onEdit={(targetTeam) => editDialog.open(targetTeam)}
        onDelete={(targetTeam) => deleteDialog.open(targetTeam)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteDialog.isOpen}
        title="Deactivate Team"
        content={`Are you sure you want to deactivate '${deleteDialog.target?.name || "this team"}'? This will soft-delete the team and deactivate its active member allocations.`}
        confirmLabel="Deactivate Team"
        cancelLabel="Cancel"
        onConfirm={handleDeleteTeam}
        onClose={deleteDialog.close}
        loading={deleting}
      />
    </Box>
  );
}

export default TeamsListContent;
