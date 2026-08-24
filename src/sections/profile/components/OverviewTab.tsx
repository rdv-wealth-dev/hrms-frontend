import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { formatDate } from "../../../utils/format-date";

import type { CompleteProfileEmployee } from "../../../api/employee.api";
import TextInput from "../../../components/input/TextInput";
import type { RootState } from "../../../store/rootReducer";
import { listBranchesRequest } from "../../../store/branch";

interface OverviewTabProps {
  empProfile: CompleteProfileEmployee | null;
  displayEmail: string;
  displayFirstName: string;
  displayLastName: string;
  displayId?: string;
  user: any;
  showSnackbar: (msg: string, variant: "success" | "error" | "info" | "warning") => void;
}

export default function OverviewTab({
  empProfile,
  displayEmail,
  displayFirstName,
  displayLastName,
  displayId: _displayId,
  user,
  showSnackbar,
}: OverviewTabProps) {
  const dispatch = useDispatch<any>();
  const branches = useSelector((state: RootState) => state.branch?.branches || []);

  useEffect(() => {
    if (!branches || branches.length === 0) {
      dispatch(listBranchesRequest());
    }
  }, [dispatch, branches]);

  const [skills, setSkills] = useState<string[]>(["React", "TypeScript", "Node.js", "AWS"]);
  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [aiInsightsDismissed, setAiInsightsDismissed] = useState(false);

  const resolvedBranchName = useMemo(() => {
    if (!empProfile) return "Head Office";

    // 1. If branchId is an object with a name property
    if (empProfile.branchId && typeof empProfile.branchId === "object") {
      if (empProfile.branchId.name) return empProfile.branchId.name;
    }

    // 2. If branch is populated on empProfile as an object
    const branchObj = (empProfile as any).branch;
    if (branchObj && typeof branchObj === "object" && branchObj.name) {
      return branchObj.name;
    }

    // 3. If branchId or branch is a string ID, resolve it from the Redux branches list
    const branchIdStr = typeof empProfile.branchId === "string" 
      ? empProfile.branchId 
      : typeof branchObj === "string" 
        ? branchObj 
        : "";

    if (branchIdStr) {
      const match = branches.find((b: any) => String(b._id || b.id) === String(branchIdStr));
      if (match?.name) return match.name;
    }

    // 4. If branchName exists directly as a non-ID string
    const directName = (empProfile as any).branchName;
    if (directName && typeof directName === "string" && !/^[0-9a-fA-F]{24}$/.test(directName)) {
      return directName;
    }

    return "Head Office";
  }, [empProfile, branches]);

  return (
    <Grid container spacing={3}>
      {/* Left Column (~75% Width on md/lg screens, 100% on small and below) */}
      <Grid size={{ xs: 12, md: 8, lg: 8.5 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          
          {/* 1. Contact Information & Employment Details Grid */}
          <Card sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Sub-card 1: Contact Information */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A", mb: 2, fontSize: "0.95rem" }}>
                  Contact Information
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <IconButton size="small" sx={{ backgroundColor: "#F1F5F9", color: "#64748B", p: 0.8 }}>
                      <EmailOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        EMAIL
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>
                        {displayEmail || "priya.sharma@nexus.hr"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <IconButton size="small" sx={{ backgroundColor: "#F1F5F9", color: "#64748B", p: 0.8 }}>
                      <PhoneOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        PHONE
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>
                        {empProfile?.phone || "+91 98765 43210"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <IconButton size="small" sx={{ backgroundColor: "#F1F5F9", color: "#64748B", p: 0.8 }}>
                      <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        LOCATION
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>
                        {String(empProfile?.currentAddress?.city || "Bangalore")}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <IconButton size="small" sx={{ backgroundColor: "#F1F5F9", color: "#64748B", p: 0.8 }}>
                      <LanguageOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        WORK MODE
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>
                        {String((empProfile as any)?.workMode || "Hybrid")}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              {/* Sub-card 2: Employment Details */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A", mb: 2, fontSize: "0.95rem" }}>
                  Employment Details
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {[
                    { label: "Employee Code", value: empProfile?.employeeCode || "NX-001" },
                    {
                      label: "Branch Name",
                      value: resolvedBranchName,
                    },
                    { label: "Department", value: empProfile?.departmentId?.name || "Engineering" },
                    { label: "Grade / Band", value: String((empProfile as any)?.band || "L5") },
                    { label: "Business Unit", value: "Technology" },
                    {
                      label: "Shift Timing",
                      value:
                        empProfile?.shiftId && typeof empProfile.shiftId === "object"
                          ? `${empProfile.shiftId.name} (${empProfile.shiftId.startTime} - ${empProfile.shiftId.endTime})`
                          : "General Shift (09:00 AM - 06:00 PM)",
                    },
                    { label: "Employment Type", value: "Full-time Permanent" },
                    { label: "Account Created", value: formatDate(user?.createdAt) },
                  ].map((row, idx) => (
                    <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ color: "#64748B" }}>{row.label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>{row.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* 2. Reporting Structure (Org Hierarchy Tree) */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A", mb: 2.5, fontSize: "0.95rem" }}>
              Reporting Structure
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              {/* Node 1: VP Engineering */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, backgroundColor: "#EEF2FF", color: "#4F46E5", fontWeight: 700, fontSize: "0.85rem" }}>
                  CTO
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600, display: "block" }}>
                    VP Engineering
                  </Typography>
                </Box>
              </Box>

              <ChevronRightIcon sx={{ color: "#CBD5E1" }} />

              {/* Node 2: Manager */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, backgroundColor: "#F3E8FF", color: "#7C3AED", fontWeight: 700, fontSize: "0.85rem" }}>
                  AM
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                    {empProfile?.managerId ? `${empProfile.managerId.firstName} ${empProfile.managerId.lastName}` : "Arjun Mehta"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>
                    Manager
                  </Typography>
                </Box>
              </Box>

              <ChevronRightIcon sx={{ color: "#CBD5E1" }} />

              {/* Node 3: Employee */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, backgroundColor: "#6366F1", color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem" }}>
                  {displayFirstName?.[0]?.toUpperCase() ?? "P"}
                  {displayLastName?.[0]?.toUpperCase() ?? "S"}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                    {displayFirstName || "Priya"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6366F1", fontWeight: 600, display: "block" }}>
                    You
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>

          {/* 3. Assigned Policies (2x3 Grid) - Commented Out
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A", mb: 2.5, fontSize: "0.95rem" }}>
              Assigned Policies
            </Typography>

            <Grid container spacing={2}>
              {[
                { cat: "Leave Policy", title: "Annual Leave Policy v2.1" },
                { cat: "Attendance Policy", title: "Attendance & Shift Policy v1.4" },
                { cat: "Payroll Policy", title: "Payroll & Compensation v2.3" },
                { cat: "WFH Policy", title: "Work From Home Policy v3.0" },
                { cat: "Holiday Calendar", title: "India — Karnataka 2025" },
                { cat: "Performance Policy", title: "Performance Management v1.2" },
              ].map((pol, idx) => (
                <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                  <Box sx={{ p: 2, borderRadius: "12px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <ArticleOutlinedIcon sx={{ color: "#6366F1", fontSize: 20, mt: 0.2 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block", fontSize: "0.72rem" }}>
                        {pol.cat}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                        {pol.title}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Card>
          */}

          {/* 4. Skills & Expertise */}
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>
                Skills & Expertise
              </Typography>
              <Chip
                label="+ Add Skill"
                onClick={() => setAddSkillOpen(true)}
                sx={{
                  backgroundColor: "#F1F5F9",
                  color: "#475569",
                  fontWeight: 600,
                  borderRadius: "8px",
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#E2E8F0" },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap" }}>
              <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600, fontSize: "0.85rem", mr: 0.5 }}>
                For Example:
              </Typography>
              {skills.map((skill, idx) => (
                <Chip
                  key={idx}
                  label={skill}
                  sx={{
                    backgroundColor: "#EEF2FF",
                    color: "#4F46E5",
                    fontWeight: 600,
                    borderRadius: "8px",
                    px: 0.5,
                  }}
                />
              ))}
            </Box>
          </Card>

          {/* 5. Recent Activity Feed - Commented Out
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A", mb: 2.5, fontSize: "0.95rem" }}>
              Recent Activity
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { icon: <TrendingUpOutlinedIcon sx={{ color: "#4F46E5", fontSize: 18 }} />, text: "Annual performance review completed — Score: 94%", date: "Jun 1, 2025" },
                { icon: <WorkspacePremiumOutlinedIcon sx={{ color: "#10B981", fontSize: 18 }} />, text: "Salary revision approved — +12% increment", date: "Mar 15, 2025" },
                { icon: <StarOutlinedIcon sx={{ color: "#8B5CF6", fontSize: 18 }} />, text: "Promoted to Senior Software Engineer", date: "Jan 10, 2025" },
                { icon: <CalendarMonthOutlinedIcon sx={{ color: "#0284C7", fontSize: 18 }} />, text: "Annual leave — 5 days (approved by Arjun Mehta)", date: "Nov 5, 2024" },
              ].map((act, idx) => (
                <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <IconButton size="small" sx={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", p: 0.8 }}>
                    {act.icon}
                  </IconButton>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>
                      {act.text}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                      {act.date}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
          */}

          {/* 6. Related Employees / Peers in Engineering */}
          <Card sx={{ p: 3 }}>
            <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", mb: 2 }}>
              PEERS IN ENGINEERING
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { initial: "AM", name: "Arjun Mehta", role: "Engineering Director", color: "#818CF8" },
                { initial: "RD", name: "Rohan Das", role: "DevOps Engineer", color: "#F97316" },
              ].map((peer, idx) => (
                <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar sx={{ width: 38, height: 38, backgroundColor: peer.color, color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem" }}>
                    {peer.initial}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                      {peer.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>
                      {peer.role}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>

        </Box>
      </Grid>

      {/* Right Column Sidebar (~25% Width - AI Assistant & Actions) */}
      <Grid size={{ xs: 12, md: 4, lg: 3.5 }} sx={{ pl: { md: 3, xs: 0 }, mt: { xs: 3, md: 0 } }}>
        {!aiInsightsDismissed && (
          <Card
            sx={{
              p: 3,
              boxShadow: "0 4px 20px rgba(139, 92, 246, 0.08)",
              position: "sticky",
              top: 24,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <AutoAwesomeIcon sx={{ color: "#8B5CF6", fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.95rem" }}>
                  AI Insights
                </Typography>
                <Chip label="Coming Soon" size="small" sx={{ height: 16, fontSize: "8px", fontWeight: 700, backgroundColor: "#F3E8FF", color: "#7C3AED" }} />
              </Box>
              <IconButton size="small" onClick={() => setAiInsightsDismissed(true)} sx={{ color: "#94A3B8" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* AI Summary Highlight Box */}
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                backgroundColor: "#F5F3FF",
                border: "1px solid #DDD6FE",
                mb: 2.5,
              }}
            >
              <Typography variant="body2" sx={{ color: "#5B21B6", fontWeight: 500, lineHeight: 1.5, fontSize: "0.85rem" }}>
                Top performer — 94% score. Low attrition risk. Promotion-ready based on tenure and trajectory.
              </Typography>
            </Box>

            {/* Quick AI Action Trigger Buttons */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
              {[
                { icon: <StarOutlinedIcon sx={{ fontSize: 16 }} />, label: "Generate Review" },
                { icon: <ArticleOutlinedIcon sx={{ fontSize: 16 }} />, label: "Generate Promotion Summary" },
                { icon: <SchoolOutlinedIcon sx={{ fontSize: 16 }} />, label: "Recommend Training" },
                { icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 16 }} />, label: "Schedule 1:1" },
                { icon: <FavoriteBorderOutlinedIcon sx={{ fontSize: 16 }} />, label: "Send Recognition" },
              ].map((btn, idx) => (
                <Button
                  key={idx}
                  fullWidth
                  startIcon={btn.icon}
                  variant="outlined"
                  onClick={() => showSnackbar(`AI Action "${btn.label}" is coming soon!`, "warning")}
                  sx={{
                    justifyContent: "flex-start",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.825rem",
                    color: "#64748B",
                    borderColor: "#E2E8F0",
                    borderRadius: "10px",
                    py: 1,
                    backgroundColor: "#F8FAFC",
                    "&:hover": { backgroundColor: "#F1F5F9", borderColor: "#CBD5E1", color: "#64748B" }
                  }}
                >
                  <Box component="span" sx={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{btn.label}</span>
                    <Chip label="Coming Soon" size="small" sx={{ height: 16, fontSize: "8px", fontWeight: 700, backgroundColor: "#E2E8F0", color: "#64748B" }} />
                  </Box>
                </Button>
              ))}
            </Box>
          </Card>
        )}
      </Grid>

      {/* Add Skill Dialog */}
      <Dialog
        open={addSkillOpen}
        onClose={() => setAddSkillOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(15, 23, 42, 0.4)",
            },
          },
          paper: { sx: { borderRadius: "16px", p: 1 } },
        }}
      >
        <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
            Add Skill or Expertise
          </Typography>
          <IconButton onClick={() => setAddSkillOpen(false)} size="small" sx={{ color: "#9CA3AF" }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 2 }}>
          <TextInput
            label="Skill Name"
            placeholder="For example: React, TypeScript, Node.js"
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAddSkillOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={() => {
              if (newSkillInput.trim()) {
                setSkills((prev) => [...prev, newSkillInput.trim()]);
                setNewSkillInput("");
                setAddSkillOpen(false);
                showSnackbar("Skill added to profile", "success");
              }
            }}
            sx={{
              backgroundColor: "#6D5DF6",
              "&:hover": { backgroundColor: "#5B4BE4" },
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            Add Skill
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
