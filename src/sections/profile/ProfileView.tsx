import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

import type { RootState } from "../../store/rootReducer";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";

function ProfileView() {
  const user = useSelector((state: RootState) => state.auth?.user);

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      ORG_ADMIN: "Org Admin",
      HR_ADMIN: "HR Admin",
      BRANCH_ADMIN: "Branch Admin",
      LEADERSHIP: "Leadership",
      MANAGER: "Manager",
      PRODUCT_MANAGER: "Product Manager",
      TEAM_LEADER: "Team Leader",
      EMPLOYEE: "Employee",
    };
    return roleLabels[role] || role;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? "—"
      : date.toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        });
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 4, maxWidth: "1200px", margin: "0 auto" }}>
        {/* Banner Section */}
        <Card
          sx={{
            position: "relative",
            p: 4,
            mb: 4,
            borderRadius: 4,
            boxShadow: "0px 10px 30px rgba(109, 93, 246, 0.08)",
            background: "linear-gradient(135deg, #6D5DF6 0%, #4F46E5 100%)",
            color: "#fff",
            overflow: "visible",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 3,
          }}
        >
          <Avatar
            sx={{
              width: 90,
              height: 90,
              fontSize: "2.2rem",
              fontWeight: 700,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              border: "3px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            {user?.firstName?.[0]?.toUpperCase() ?? "U"}
            {user?.lastName?.[0]?.toUpperCase() ?? ""}
          </Avatar>
          <Box sx={{ textAlign: { xs: "center", sm: "left" }, flexGrow: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "center", sm: "flex-start" }, gap: 1.5, mb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {user?.fullName || `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "User Profile"}
              </Typography>
              {user?.isActive && (
                <Chip
                  label="Active Account"
                  size="small"
                  sx={{
                    backgroundColor: "rgba(16, 185, 129, 0.2)",
                    color: "#34D399",
                    fontWeight: 600,
                    border: "1px solid rgba(52, 211, 153, 0.3)",
                  }}
                />
              )}
            </Box>
            <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 0.5 }}>
              {user?.email}
            </Typography>
            <Chip
              icon={<AdminPanelSettingsOutlinedIcon sx={{ color: "#fff !important" }} />}
              label={getRoleLabel(user?.role || "")}
              sx={{
                mt: 0.5,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            />
          </Box>
        </Card>

        {/* Content Cards */}
        <Grid container spacing={3}>
          {/* Column 1 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                p: 3.5,
                height: "100%",
                borderRadius: 4,
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
                backgroundColor: "#fff",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: "#111827", display: "flex", alignItems: "center", gap: 1 }}>
                <BadgeOutlinedIcon sx={{ color: "#6D5DF6" }} />
                Personal Information
              </Typography>
              <Grid container spacing={2.5}>
                <Grid size={6}>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>First Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#1F2937", mt: 0.5 }}>{user?.firstName || "—"}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Last Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#1F2937", mt: 0.5 }}>{user?.lastName || "—"}</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Email Address</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#1F2937" }}>{user?.email || "—"}</Typography>
                    {user?.isEmailVerified && (
                      <Chip
                        icon={<CheckCircleOutlinedIcon sx={{ fontSize: "14px !important", color: "#047857 !important" }} />}
                        label="Verified"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.7rem",
                          backgroundColor: "#D1FAE5",
                          color: "#065F46",
                          fontWeight: 600,
                          px: 0.5,
                        }}
                      />
                    )}
                  </Box>
                </Grid>
                <Grid size={12}>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Account ID</Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace", color: "#4B5563", backgroundColor: "#F9FAFB", p: 1, borderRadius: 2, border: "1px solid #E5E7EB", mt: 0.5 }}>
                    {user?.id || "—"}
                  </Typography>
                </Grid>
                {user?.employeeId && (
                  <Grid size={12}>
                    <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Employee profile ID</Typography>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", color: "#4B5563", backgroundColor: "#F9FAFB", p: 1, borderRadius: 2, border: "1px solid #E5E7EB", mt: 0.5 }}>
                      {user.employeeId}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Card>
          </Grid>

          {/* Column 2 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, height: "100%" }}>
              {/* System Credentials & Organization */}
              <Card
                sx={{
                  p: 3.5,
                  borderRadius: 4,
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
                  backgroundColor: "#fff",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: "#111827", display: "flex", alignItems: "center", gap: 1 }}>
                  <VpnKeyOutlinedIcon sx={{ color: "#6D5DF6" }} />
                  Access & Security
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>System Role</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#1F2937", mt: 0.5 }}>{getRoleLabel(user?.role || "")}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Org Admin</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: user?.isOrgAdmin ? "#D97706" : "#4B5563", mt: 0.5 }}>
                      {user?.isOrgAdmin ? "Yes" : "No"}
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Tenant Identifier (Tenant ID)</Typography>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", color: "#4B5563", mt: 0.5 }}>{user?.tenantId || "—"}</Typography>
                  </Grid>
                  {user?.branchIds && user.branchIds.length > 0 && (
                    <Grid size={12}>
                      <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500, mb: 1, display: "block" }}>Branch Authorizations</Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {user.branchIds.map((bid) => (
                          <Chip
                            key={bid}
                            label={bid}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#4B5563" }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Card>

              {/* Account Activity Logs */}
              <Card
                sx={{
                  p: 3.5,
                  borderRadius: 4,
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
                  backgroundColor: "#fff",
                  flexGrow: 1,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: "#111827", display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTimeOutlinedIcon sx={{ color: "#6D5DF6" }} />
                  Session Activity
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <CalendarMonthOutlinedIcon sx={{ color: "#9CA3AF", mt: 0.2 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Joined On</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mt: 0.5 }}>
                        {formatDate(user?.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <EmailOutlinedIcon sx={{ color: "#9CA3AF", mt: 0.2 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Last Login Session</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mt: 0.5 }}>
                        {formatDate(user?.lastLoginAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}

export default ProfileView;
