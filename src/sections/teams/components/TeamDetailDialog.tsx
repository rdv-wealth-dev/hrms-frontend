import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import LinearProgress from "@mui/material/LinearProgress";

import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import ApartmentIcon from "@mui/icons-material/Apartment";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { toast } from "sonner";

import CustomAvatar from "../../../components/avatar/CustomAvatar";
import StatusChip from "../../../components/common/StatusChip";
import AddTeamMemberDialog from "./AddTeamMemberDialog";
import ChangeTeamLeadDialog from "./ChangeTeamLeadDialog";
import ConfirmDialog from "../../../components/modal/ConfirmDialog";
import { getTeamById, removeTeamMember, type TeamItem, type TeamMember } from "../../../api/team.api";
import { formatDate } from "../../../utils/format-date";
import { usePermissions } from "../../../hooks/usePermissions";
import { useDialog } from "../../../hooks/useDialog";

export interface TeamDetailDialogProps {
  open: boolean;
  teamId: string | null;
  onClose: () => void;
  onEdit?: (team: TeamItem) => void;
  onDelete?: (team: TeamItem) => void;
}

export function TeamDetailDialog({ open, teamId, onClose, onEdit, onDelete }: TeamDetailDialogProps) {
  const { canUpdateTeam, canDeleteTeam } = usePermissions();
  const [team, setTeam] = useState<TeamItem | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [addMemberOpen, setAddMemberOpen] = useState<boolean>(false);
  const [changeLeadOpen, setChangeLeadOpen] = useState<boolean>(false);
  const [deletingMember, setDeletingMember] = useState<boolean>(false);
  const editMemberDialog = useDialog<TeamMember>();
  const removeMemberDialog = useDialog<TeamMember>();

  const handleRemoveMember = async () => {
    const target = removeMemberDialog.target;
    if (!teamId || !target) return;

    const empId =
      typeof target.employeeId === "object" && target.employeeId
        ? target.employeeId._id || target.employeeId.id
        : target.employeeId || target._id || target.id;

    if (!empId) {
      toast.error("Invalid target member ID.");
      return;
    }

    setDeletingMember(true);

    try {
      const response = await removeTeamMember(teamId, String(empId));
      toast.success(response?.message || "Team member removed successfully!");
      removeMemberDialog.close();
      fetchDetails();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to remove member from team.";
      toast.error(msg);
    } finally {
      setDeletingMember(false);
    }
  };

  const fetchDetails = async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getTeamById(teamId);
      const rawData = response?.data;

      if (!rawData) {
        setTeam(null);
        setMembers([]);
        return;
      }

      let teamData: any = null;
      let membersData: TeamMember[] = [];

      // Shape 1: { team: {...}, members: [...] }
      if ((rawData as any)?.team) {
        teamData = (rawData as any).team;
        membersData = Array.isArray((rawData as any).members)
          ? (rawData as any).members
          : Array.isArray((rawData as any).team?.members)
            ? (rawData as any).team.members
            : [];
      }
      // Shape 2: { _id: "...", name: "...", members: [...] }
      else {
        teamData = rawData;
        membersData = Array.isArray((rawData as any)?.members)
          ? (rawData as any).members
          : [];
      }

      setTeam(teamData);
      setMembers(membersData);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load team details.";

      setError(msg);
      setTeam(null);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && teamId) {
      fetchDetails();
    } else if (!open) {
      setTeam(null);
      setMembers([]);
      setError(null);
    }
  }, [open, teamId]);

  const getTypeChipColor = (type?: string) => {
    switch (type) {
      case "PERMANENT":
        return { bg: "#EEF2FF", color: "#4F46E5", border: "#C7D2FE" };
      case "PROJECT_BASED":
        return { bg: "#F0FDF4", color: "#166534", border: "#BBF7D0" };
      case "TEMPORARY":
        return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
      default:
        return { bg: "#F1F5F9", color: "#475569", border: "#E2E8F0" };
    }
  };

  const typeStyle = getTypeChipColor(team?.type);

  // Defensive formatting
  const deptName =
    typeof team?.department === "object"
      ? (team?.department as any)?.name
      : typeof (team as any)?.departmentId === "object"
        ? (team as any)?.departmentId?.name
        : "Parent Dept";

  const branchName =
    typeof team?.branch === "object"
      ? (team?.branch as any)?.name
      : typeof (team as any)?.branchId === "object"
        ? (team as any)?.branchId?.name
        : "Global / Head Office";

  const leadCandidate =
    members.find((m: any) => m.roleInTeam === "LEAD") ||
    (typeof team?.lead === "object" && team?.lead ? team?.lead : null) ||
    (typeof (team as any)?.leadId === "object" && (team as any)?.leadId ? (team as any)?.leadId : null);

  const empLead =
    leadCandidate && typeof (leadCandidate as any).employeeId === "object"
      ? (leadCandidate as any).employeeId
      : leadCandidate;

  const leadFullName = empLead
    ? (empLead as any).fullName ||
      `${(empLead as any).firstName || ""} ${(empLead as any).lastName || ""}`.trim() ||
      null
    : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      {/* Dialog Header */}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              backgroundColor: "rgba(109, 93, 246, 0.1)",
              color: "#6D5DF6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GroupsIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.1rem", sm: "1.25rem" }, color: "#0F172A", lineHeight: 1.2 }}>
                {team?.name || "Team Details"}
              </Typography>
              {team?.code && (
                <Chip
                  label={team.code}
                  size="small"
                  sx={{ fontWeight: 700, fontSize: "11px", backgroundColor: "#F1F5F9", color: "#475569" }}
                />
              )}
              {team?.type && (
                <Chip
                  label={team.type?.replace("_", " ")}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "11px",
                    backgroundColor: typeStyle.bg,
                    color: typeStyle.color,
                    border: `1px solid ${typeStyle.border}`,
                  }}
                />
              )}
            </Box>
            <Typography variant="caption" sx={{ color: "#64748B" }}>
              Single Team Profile & Assigned Member Allocations
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
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

      {/* Dialog Body */}
      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          flex: "1 1 auto",
          overflowY: "auto",
          minHeight: 0,
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "#CBD5E1", borderRadius: "4px" },
        }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2.5, borderRadius: "12px" }}
            action={
              <Button color="inherit" size="small" onClick={fetchDetails} startIcon={<RefreshIcon />}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 1.5 }}>
            <CircularProgress size={36} sx={{ color: "#6D5DF6" }} />
            <Typography variant="body2" color="text.secondary">
              Fetching team metadata and member assignments...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Overview Summary Grid */}
            <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3 }}>
              {/* Department */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.75,
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                  }}
                >
                  <ApartmentIcon sx={{ fontSize: 22, color: "#6D5DF6" }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: "#64748B", display: "block", fontWeight: 600 }}>
                      Department
                    </Typography>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: "#0F172A" }}>
                      {deptName || "N/A"}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Branch */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.75,
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: 22, color: "#0EA5E9" }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: "#64748B", display: "block", fontWeight: 600 }}>
                      Branch Location
                    </Typography>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: "#0F172A" }}>
                      {branchName || "Global"}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Team Lead */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.75,
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                  }}
                >
                  <PersonIcon sx={{ fontSize: 22, color: "#10B981" }} />
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                        Team Lead
                      </Typography>
                      {canUpdateTeam && (
                        <IconButton
                          size="small"
                          onClick={() => setChangeLeadOpen(true)}
                          sx={{ p: 0.25, color: "#6D5DF6", "&:hover": { backgroundColor: "rgba(109, 93, 246, 0.1)" } }}
                          title="Change Team Lead"
                        >
                          <EditOutlinedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      )}
                    </Box>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: "#0F172A" }}>
                      {leadFullName || "Unassigned"}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Max Leaves & Members */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.75,
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                  }}
                >
                  <EventAvailableIcon sx={{ fontSize: 22, color: "#F59E0B" }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: "#64748B", display: "block", fontWeight: 600 }}>
                      Leave Cap & Members
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                      Max {team?.maxConcurrentLeaves ?? "N/A"} | {members.length} Members
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Description & Tags */}
            {team?.description && (
              <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: "12px", backgroundColor: "#FAF5FF", border: "1px solid #E9D5FF" }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#7E22CE", display: "block", mb: 0.5 }}>
                  TEAM PURPOSE / DESCRIPTION
                </Typography>
                <Typography variant="body2" sx={{ color: "#3B0764", lineHeight: 1.5 }}>
                  {team.description}
                </Typography>
              </Paper>
            )}

            {/* Assigned Members Section Header */}
            <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Assigned Team Members ({members.length})
                </Typography>
                {team?.isCrossFunctional && (
                  <Chip
                    label="Cross-Functional"
                    size="small"
                    sx={{ backgroundColor: "#F3E8FF", color: "#6B21A8", fontWeight: 700, fontSize: "10px" }}
                  />
                )}
              </Box>

              {canUpdateTeam && (
                <Button
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setAddMemberOpen(true)}
                  sx={{
                    height: 32,
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    textTransform: "none",
                    backgroundColor: "#10B981",
                    color: "#FFFFFF",
                    boxShadow: "0 2px 6px rgba(16, 185, 129, 0.2)",
                    "&:hover": { backgroundColor: "#059669" },
                  }}
                >
                  Add Member
                </Button>
              )}
            </Box>

            {members.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center", borderRadius: "12px", border: "1px dashed #CBD5E1", backgroundColor: "#F8FAFC" }}>
                <GroupsIcon sx={{ fontSize: 40, color: "#94A3B8", mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155" }}>
                  No Members Assigned Yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Add members to this team from the Employee Directory or edit team settings.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#F8FAFC" }}>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", py: 1.25 }}>Member Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", py: 1.25 }}>Designation</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", py: 1.25 }}>Team Role</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", py: 1.25 }}>Primary</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", py: 1.25 }}>Allocation %</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", py: 1.25 }}>Joined Date</TableCell>
                      {canUpdateTeam && (
                        <TableCell sx={{ fontWeight: 700, color: "#475569", py: 1.25, textAlign: "right" }}>
                          Actions
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {members.map((member: TeamMember, idx: number) => {
                      const emp = (typeof member.employeeId === "object" && member.employeeId ? member.employeeId : member) as any;

                      const memberName =
                        emp.fullName ||
                        `${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
                        member.fullName ||
                        "Employee";

                      const memberEmail = emp.email || emp.employeeCode || member.email || "No email";

                      const memberDesig =
                        typeof emp.designation === "object"
                          ? emp.designation?.name
                          : emp.designation || member.designation || "Staff Member";

                      const allocPct = member.allocationPercentage ?? 100;

                      return (
                        <TableRow key={member.id || member._id || member.employeeId || idx} hover>
                          <TableCell sx={{ py: 1.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                              <CustomAvatar name={memberName} size={32} fontSize="12px" />
                              <Box>
                                <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>
                                  {memberName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#64748B" }}>
                                  {memberEmail}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ py: 1.5 }}>
                            <Typography variant="body2" sx={{ fontSize: "13px", color: "#334155", fontWeight: 500 }}>
                              {memberDesig}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ py: 1.5 }}>
                            <Chip
                              label={member.roleInTeam || "MEMBER"}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: "10px",
                                height: 22,
                                backgroundColor: member.roleInTeam === "LEAD" ? "#ECFDF5" : "#F1F5F9",
                                color: member.roleInTeam === "LEAD" ? "#047857" : "#475569",
                                border: member.roleInTeam === "LEAD" ? "1px solid #A7F3D0" : "1px solid #E2E8F0",
                              }}
                            />
                          </TableCell>

                          <TableCell sx={{ py: 1.5 }}>
                            {member.isPrimary !== false ? (
                              <StatusChip status="PRESENT" size="small" />
                            ) : (
                              <Chip label="Secondary" size="small" sx={{ fontSize: "10px", height: 20 }} />
                            )}
                          </TableCell>

                          <TableCell sx={{ py: 1.5, minWidth: 120 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box sx={{ flexGrow: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(100, Math.max(0, allocPct))}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: "#E2E8F0",
                                    "& .MuiLinearProgress-bar": {
                                      backgroundColor: allocPct >= 80 ? "#10B981" : allocPct >= 50 ? "#3B82F6" : "#F59E0B",
                                      borderRadius: 3,
                                    },
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: "#1E293B", minWidth: 32 }}>
                                {allocPct}%
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ py: 1.5 }}>
                            <Typography variant="caption" sx={{ color: "#64748B" }}>
                              {member.joinedAt ? formatDate(member.joinedAt) : "—"}
                            </Typography>
                          </TableCell>

                          {canUpdateTeam && (
                            <TableCell sx={{ py: 1.5, textAlign: "right" }}>
                              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => editMemberDialog.open(member)}
                                  sx={{
                                    color: "#6D5DF6",
                                    p: 0.5,
                                    borderRadius: "6px",
                                    "&:hover": { backgroundColor: "rgba(109, 93, 246, 0.1)" },
                                  }}
                                >
                                  <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => removeMemberDialog.open(member)}
                                  sx={{
                                    color: "#EF4444",
                                    p: 0.5,
                                    borderRadius: "6px",
                                    "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.1)" },
                                  }}
                                >
                                  <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Box>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Tags Footer */}
            {team?.tags && team.tags.length > 0 && (
              <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748B" }}>
                  TAGS / TECH STACK:
                </Typography>
                {team.tags.map((tag, idx) => (
                  <Chip
                    key={idx}
                    label={tag}
                    size="small"
                    sx={{
                      backgroundColor: "#F1F5F9",
                      color: "#334155",
                      fontWeight: 600,
                      fontSize: "11px",
                      borderRadius: "6px",
                    }}
                  />
                ))}
              </Box>
            )}
          </>
        )}
      </DialogContent>

      {/* Dialog Footer Actions */}
      <DialogActions
        sx={{
          py: 2,
          px: 3,
          borderTop: "1px solid #F1F5F9",
          backgroundColor: "#FAFAFA",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {canUpdateTeam && team && (
            <Button
              startIcon={<EditOutlinedIcon />}
              onClick={() => {
                onClose();
                onEdit?.(team);
              }}
              sx={{
                height: 38,
                borderRadius: "10px",
                px: 2.2,
                fontSize: "13.5px",
                fontWeight: 600,
                textTransform: "none",
                color: "#6D5DF6",
                border: "1px solid #6D5DF6",
                "&:hover": { backgroundColor: "rgba(109, 93, 246, 0.08)" },
              }}
            >
              Edit Team
            </Button>
          )}

          {canDeleteTeam && team && (
            <Button
              startIcon={<DeleteOutlinedIcon />}
              onClick={() => {
                onClose();
                onDelete?.(team);
              }}
              sx={{
                height: 38,
                borderRadius: "10px",
                px: 2.2,
                fontSize: "13.5px",
                fontWeight: 600,
                textTransform: "none",
                color: "#EF4444",
                border: "1px solid #EF4444",
                "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.08)" },
              }}
            >
              Deactivate Team
            </Button>
          )}
        </Box>

        <Button
          onClick={onClose}
          sx={{
            height: 38,
            borderRadius: "10px",
            px: 3,
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "none",
            color: "#475569",
            backgroundColor: "#F1F5F9",
            "&:hover": { backgroundColor: "#E2E8F0" },
          }}
        >
          Close
        </Button>
      </DialogActions>

      {/* Add Team Member Modal */}
      <AddTeamMemberDialog
        open={addMemberOpen}
        mode="add"
        teamId={teamId}
        teamName={team?.name}
        onClose={() => setAddMemberOpen(false)}
        onSuccess={() => fetchDetails()}
      />

      {/* Edit Team Member Modal */}
      <AddTeamMemberDialog
        open={editMemberDialog.isOpen}
        mode="edit"
        memberToEdit={editMemberDialog.target}
        teamId={teamId}
        teamName={team?.name}
        onClose={editMemberDialog.close}
        onSuccess={() => fetchDetails()}
      />

      {/* Remove Team Member Modal */}
      <ConfirmDialog
        open={removeMemberDialog.isOpen}
        title="Remove Team Member"
        content={`Are you sure you want to remove this employee from ${team?.name || "the team"}? Active member capacity allocations will be deactivated.`}
        confirmLabel="Remove Member"
        cancelLabel="Cancel"
        onConfirm={handleRemoveMember}
        onClose={removeMemberDialog.close}
        loading={deletingMember}
      />

      {/* Change Team Lead Modal */}
      <ChangeTeamLeadDialog
        open={changeLeadOpen}
        teamId={teamId}
        teamName={team?.name}
        currentLeadName={leadFullName}
        members={members}
        onClose={() => setChangeLeadOpen(false)}
        onSuccess={() => fetchDetails()}
      />
    </Dialog>
  );
}

export default TeamDetailDialog;
