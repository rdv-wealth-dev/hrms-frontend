import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";

import StatusChip from "../../../components/common/StatusChip";
import { getMyTeams, type MyTeamItem } from "../../../api/team.api";
import type { RootState } from "../../../store/rootReducer";

interface MyTeamsWidgetProps {
  /**
   * When true (default), the widget is completely hidden if the employee
   * does not belong to any team, or while loading/erroring.
   */
  hideIfEmpty?: boolean;
}

export function MyTeamsWidget({ hideIfEmpty = true }: MyTeamsWidgetProps = {}) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [myTeams, setMyTeams] = useState<MyTeamItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const empId = user?.employeeId || (user as any)?._id || user?.id;
    if (!empId) {
      setLoading(false);
      setMyTeams([]);
      return;
    }

    getMyTeams(empId)
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data) ? res.data : (res?.data as any)?.items || [];
        setMyTeams(list);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to fetch My Teams:", err);
        setError(err?.response?.data?.message || "Failed to load assigned teams.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.employeeId, user?.id]);

  // Conditional rendering: completely hidden if employee belongs to no teams
  if (hideIfEmpty && (loading || error || myTeams.length === 0)) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        mb: { xs: 2.5, sm: 3, md: 4 },
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              backgroundColor: "primary.lighter",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GroupsIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary", fontSize: "1.05rem", lineHeight: 1.2 }}>
              My Squads & Teams
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Project teams & capacity allocations assigned to you
            </Typography>
          </Box>
        </Box>

        {!loading && myTeams.length > 0 && (
          <Chip
            label={`${myTeams.length} ${myTeams.length === 1 ? "Squad" : "Squads"}`}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: "11px",
              backgroundColor: "action.hover",
              color: "text.secondary",
            }}
          />
        )}
      </Box>

      {/* Content Area */}
      {loading ? (
        <Grid container spacing={2}>
          {[1, 2].map((k) => (
            <Grid key={k} size={{ xs: 12, md: 6 }}>
              <Skeleton variant="rounded" height={100} sx={{ borderRadius: "12px" }} />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Box sx={{ p: 3, textAlign: "center", borderRadius: "12px", backgroundColor: "error.lighter" }}>
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        </Box>
      ) : myTeams.length === 0 ? (
        <Box
          sx={{
            py: 3.5,
            px: 2,
            textAlign: "center",
            borderRadius: "12px",
            border: "1px dashed",
            borderColor: "divider",
            backgroundColor: "action.hover",
          }}
        >
          <GroupsIcon sx={{ fontSize: 36, color: "text.secondary", mb: 0.75 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
            No Teams Assigned Yet
          </Typography>
          <Typography variant="caption" color="text.secondary">
            You are not currently assigned to any project squad or functional team.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {myTeams.map((teamItem: any, idx: number) => {
            const teamObj = typeof teamItem.teamId === "object" && teamItem.teamId ? teamItem.teamId : teamItem;

            const tName = teamItem.teamName || teamObj.name || "Project Squad";
            const tCode = teamItem.teamCode || teamObj.code || "";

            const leadObj = typeof teamObj.leadId === "object" && teamObj.leadId ? teamObj.leadId : null;
            const lName =
              teamItem.leadName ||
              (leadObj
                ? leadObj.fullName || `${leadObj.firstName || ""} ${leadObj.lastName || ""}`.trim()
                : null);

            const allocPct = teamItem.allocationPercentage ?? 100;
            const roleInTeam = teamItem.roleInTeam || "MEMBER";
            const isPrimary = teamItem.isPrimary !== false;
            const keyId = teamItem._id || teamItem.id || teamObj._id || teamObj.id || idx;

            return (
              <Grid key={keyId} size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "action.hover",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "background.paper",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                    },
                  }}
                >
                  {/* Top Row: Team Name & Primary Badge */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, color: "text.primary" }}>
                        {tName}
                      </Typography>
                      {tCode && (
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                          Code: {tCode}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
                      {isPrimary ? (
                        <StatusChip status="PRESENT" label="Primary Squad" size="small" />
                      ) : (
                        <Chip label="Secondary" size="small" sx={{ fontSize: "10px", height: 20 }} />
                      )}
                    </Box>
                  </Box>

                  {/* Middle Row: Role Badge & Lead Info */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", my: 1.5 }}>
                    <Chip
                      label={roleInTeam}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "10px",
                        height: 22,
                        backgroundColor: roleInTeam === "LEAD" ? "success.lighter" : "action.hover",
                        color: roleInTeam === "LEAD" ? "success.dark" : "text.secondary",
                        border: "1px solid",
                        borderColor: roleInTeam === "LEAD" ? "success.light" : "divider",
                      }}
                    />

                    {lName && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <PersonIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                          Lead: {lName}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Bottom Row: Allocation Progress Bar */}
                  <Box sx={{ mt: 1.25 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        Capacity Allocation
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 700 }}>
                        {allocPct}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, Math.max(0, allocPct))}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "divider",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: allocPct >= 80 ? "success.main" : allocPct >= 50 ? "info.main" : "warning.main",
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Paper>
  );
}

export default MyTeamsWidget;
