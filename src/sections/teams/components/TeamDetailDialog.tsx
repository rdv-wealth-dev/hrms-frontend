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

import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import { toast } from "sonner";

import CustomAvatar from "../../../components/avatar/CustomAvatar";
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
        return { bg: "action.hover", color: "text.secondary", border: "divider" };
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
            backgroundColor: "background.paper",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid",
            borderColor: "divider",
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
          py: { xs: 2, sm: 2.25 },
          px: { xs: 2.5, sm: 3.5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
              color: "#6366F1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.12)",
              flexShrink: 0,
            }}
          >
            <GroupsIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap", mb: 0.25 }}>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.2rem", sm: "1.4rem" }, color: "text.primary", lineHeight: 1.2 }}>
                {team?.name || "Team Details"}
              </Typography>
              {team?.code && (
                <Chip
                  label={team.code}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "11px",
                    backgroundColor: "#EFF6FF",
                    color: "#2563EB",
                    borderRadius: "12px",
                    height: 22,
                    px: 0.5,
                  }}
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
                    borderRadius: "12px",
                    height: 22,
                    px: 0.5,
                  }}
                />
              )}
            </Box>
            <Typography variant="body2" sx={{ color: "#64748B", fontSize: "13px" }}>
              Single Team Profile &amp; Assigned Member Allocations
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "text.secondary",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "10px",
            width: 36,
            height: 36,
            "&:hover": { backgroundColor: "action.hover", color: "text.primary", borderColor: "divider" },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
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
            <CircularProgress size={36} sx={{ color: "primary.main" }} />
            <Typography variant="body2" color="text.secondary">
              Fetching team metadata and member assignments...
            </Typography>
          </Box>
        ) : (
          <>
            {/* 4 KPI Metric Cards Grid */}
            <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 2.5, alignItems: "stretch" }}>
              {/* Department */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex" }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                    width: "100%",
                    height: "100%",
                    minHeight: 74,
                    boxSizing: "border-box",
                  }}
                >
                  <Typography variant="caption" noWrap sx={{ color: "text.secondary", display: "block", fontWeight: 600, fontSize: "12px", mb: 0.5 }}>
                    Department
                  </Typography>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 800, color: "text.primary", fontSize: "14px" }} title={deptName || "N/A"}>
                    {deptName || "N/A"}
                  </Typography>
                </Paper>
              </Grid>

              {/* Branch */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex" }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                    width: "100%",
                    height: "100%",
                    minHeight: 74,
                    boxSizing: "border-box",
                  }}
                >
                  <Typography variant="caption" noWrap sx={{ color: "text.secondary", display: "block", fontWeight: 600, fontSize: "12px", mb: 0.5 }}>
                    Branch Location
                  </Typography>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 800, color: "text.primary", fontSize: "14px" }} title={branchName || "Global"}>
                    {branchName || "Global"}
                  </Typography>
                </Paper>
              </Grid>

              {/* Team Lead */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex" }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                    width: "100%",
                    height: "100%",
                    minHeight: 74,
                    boxSizing: "border-box",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" noWrap sx={{ color: "text.secondary", fontWeight: 600, fontSize: "12px" }}>
                      Team Lead
                    </Typography>
                    {canUpdateTeam && (
                      <IconButton
                        size="small"
                        onClick={() => setChangeLeadOpen(true)}
                        sx={{
                          p: 0.35,
                          color: "text.primary",
                          backgroundColor: "action.hover",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "6px",
                          "&:hover": { backgroundColor: "#EEF2FF", color: "#6366F1", borderColor: "#C7D2FE" },
                        }}
                        title="Change Team Lead"
                      >
                        <EditOutlinedIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    )}
                  </Box>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 800, color: "text.primary", fontSize: "14px" }} title={leadFullName || "Unassigned"}>
                    {leadFullName || "Unassigned"}
                  </Typography>
                </Paper>
              </Grid>

              {/* Max Leaves & Members */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex" }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                    width: "100%",
                    height: "100%",
                    minHeight: 74,
                    boxSizing: "border-box",
                  }}
                >
                  <Typography variant="caption" noWrap sx={{ color: "text.secondary", display: "block", fontWeight: 600, fontSize: "12px", mb: 0.5 }}>
                    Leave Cap &amp; Members
                  </Typography>
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ fontWeight: 800, color: "text.primary", fontSize: "14px" }}
                    title={`Max ${team?.maxConcurrentLeaves ?? "N/A"} | ${members.length} Members`}
                  >
                    Max {team?.maxConcurrentLeaves ?? "N/A"} | {members.length} Members
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Team Purpose / Description Banner with watermark */}
            {team?.description && (
              <Paper
                elevation={0}
                sx={{
                  p: 2.25,
                  mb: 3,
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #FBF8FF 0%, #F5F3FF 100%)",
                  border: "1px solid #E9D5FF",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.75,
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: "#F3E8FF",
                    color: "#7E22CE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                >
                  <TrackChangesIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ position: "relative", zIndex: 1, flexGrow: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#7E22CE", display: "block", mb: 0.5, letterSpacing: "0.5px" }}>
                    TEAM PURPOSE / DESCRIPTION
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#3B0764", lineHeight: 1.5, fontSize: "13.5px" }}>
                    {team.description}
                  </Typography>
                </Box>
                {/* Subtle milestone watermark decoration on the right */}
                <Box
                  sx={{
                    position: "absolute",
                    right: 12,
                    bottom: 0,
                    opacity: 0.15,
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 15L75 55H25L50 15Z" fill="#7E22CE" />
                    <path d="M75 25L95 55H55L75 25Z" fill="#9333EA" />
                    <path d="M25 35L45 55H5L25 35Z" fill="#A855F7" />
                    <line x1="50" y1="15" x2="50" y2="5" stroke="#7E22CE" strokeWidth="2" />
                    <polygon points="50,5 60,8 50,11" fill="#7E22CE" />
                  </svg>
                </Box>
              </Paper>
            )}

            {/* Assigned Members Section Header */}
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    backgroundColor: "rgba(99, 102, 241, 0.1)",
                    color: "#6366F1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GroupsIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontSize: "14px", fontWeight: 800, color: "text.primary", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  ASSIGNED TEAM MEMBERS ({members.length})
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
                  startIcon={<PersonAddIcon sx={{ fontSize: 17 }} />}
                  onClick={() => setAddMemberOpen(true)}
                  sx={{
                    height: 36,
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    textTransform: "none",
                    px: 2,
                    backgroundColor: "#6366F1",
                    color: "#FFFFFF",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
                    "&:hover": { backgroundColor: "#4F46E5" },
                  }}
                >
                  Add Member
                </Button>
              )}
            </Box>

            {members.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center", borderRadius: "14px", border: "1px dashed #CBD5E1", backgroundColor: "#F8FAFC" }}>
                <GroupsIcon sx={{ fontSize: 40, color: "#94A3B8", mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155" }}>
                  No Members Assigned Yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Add members to this team from the Employee Directory or edit team settings.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "14px", border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#F8FAFC" }}>
                      <TableCell sx={{ fontWeight: 800, color: "#64748B", py: 1.5, fontSize: "11.5px", letterSpacing: "0.5px" }}>
                        MEMBER NAME
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#64748B", py: 1.5, fontSize: "11.5px", letterSpacing: "0.5px" }}>
                        DESIGNATION
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#64748B", py: 1.5, fontSize: "11.5px", letterSpacing: "0.5px" }}>
                        TEAM ROLE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#64748B", py: 1.5, fontSize: "11.5px", letterSpacing: "0.5px" }}>
                        JOINED DATE
                      </TableCell>
                      {canUpdateTeam && (
                        <TableCell sx={{ fontWeight: 800, color: "#64748B", py: 1.5, fontSize: "11.5px", letterSpacing: "0.5px", textAlign: "right" }}>
                          ACTIONS
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

                      const roleValue = (member.roleInTeam as string)?.toUpperCase() || "MEMBER";
                      const isLeadRole = roleValue === "LEAD";

                      return (
                        <TableRow key={member.id || member._id || member.employeeId || idx} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell sx={{ py: 1.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <CustomAvatar name={memberName} size={36} fontSize="13px" />
                              <Box>
                                <Typography sx={{ fontSize: "13.5px", fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                                  {memberName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#64748B", fontSize: "12px" }}>
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
                              label={roleValue}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: "11px",
                                height: 24,
                                px: 0.5,
                                backgroundColor: isLeadRole ? "#ECFDF5" : "#EFF6FF",
                                color: isLeadRole ? "#10B981" : "#3B82F6",
                                border: isLeadRole ? "1px solid #A7F3D0" : "1px solid #BFDBFE",
                                borderRadius: "12px",
                              }}
                            />
                          </TableCell>

                          <TableCell sx={{ py: 1.5 }}>
                            <Typography variant="body2" sx={{ color: "#334155", fontSize: "13px", fontWeight: 500 }}>
                              {member.joinedAt ? formatDate(member.joinedAt) : "Aug 22, 2026"}
                            </Typography>
                          </TableCell>

                          {canUpdateTeam && (
                            <TableCell sx={{ py: 1.5, textAlign: "right" }}>
                              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => editMemberDialog.open(member)}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "8px",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    color: "#6366F1",
                                    backgroundColor: "background.paper",
                                    "&:hover": { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" },
                                  }}
                                  title="Edit Member"
                                >
                                  <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => removeMemberDialog.open(member)}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "8px",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    color: "#EF4444",
                                    backgroundColor: "background.paper",
                                    "&:hover": { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
                                  }}
                                  title="Remove Member"
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

            {/* Showing X of Y members pagination / count indicator */}
            {members.length > 0 && (
              <Box sx={{ mt: 2.5, mb: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                <Box sx={{ height: "1px", backgroundColor: "divider", width: 80 }} />
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, fontSize: "12.5px" }}>
                  Showing {members.length} of {members.length} members
                </Typography>
                <Box sx={{ height: "1px", backgroundColor: "divider", width: 80 }} />
              </Box>
            )}

            {/* Tags Footer */}
            {team?.tags && team.tags.length > 0 && (
              <Box sx={{ mt: 2.5, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
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
          px: { xs: 2.5, sm: 3.5 },
          borderTop: "1px solid #F1F5F9",
          backgroundColor: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {canUpdateTeam && team && (
            <Button
              startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                onClose();
                onEdit?.(team);
              }}
              sx={{
                height: 40,
                borderRadius: "10px",
                px: 2.5,
                fontSize: "13.5px",
                fontWeight: 700,
                textTransform: "none",
                color: "#6366F1",
                border: "1px solid #6366F1",
                backgroundColor: "#FFFFFF",
                "&:hover": { backgroundColor: "rgba(99, 102, 241, 0.08)", borderColor: "#4F46E5" },
              }}
            >
              Edit Team
            </Button>
          )}

          {canDeleteTeam && team && (
            <Button
              startIcon={<DeleteOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                onClose();
                onDelete?.(team);
              }}
              sx={{
                height: 40,
                borderRadius: "10px",
                px: 2.5,
                fontSize: "13.5px",
                fontWeight: 700,
                textTransform: "none",
                color: "#EF4444",
                border: "1px solid #EF4444",
                backgroundColor: "#FFFFFF",
                "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.08)", borderColor: "#DC2626" },
              }}
            >
              Deactivate Team
            </Button>
          )}
        </Box>

        <Button
          onClick={onClose}
          sx={{
            height: 40,
            borderRadius: "10px",
            px: 3.5,
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "none",
            color: "text.secondary",
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            "&:hover": { backgroundColor: "action.hover", borderColor: "divider" },
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
        hasActiveLead={Boolean(leadFullName || team?.leadId || team?.lead || members.some((m: any) => m.roleInTeam === "LEAD"))}
        members={members}
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
        hasActiveLead={Boolean(leadFullName || team?.leadId || team?.lead || members.some((m: any) => m.roleInTeam === "LEAD"))}
        members={members}
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
