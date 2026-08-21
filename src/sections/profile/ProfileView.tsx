import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserAvatar } from "../../store/auth";
import { useParams, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import { useSnackbar } from "../../components/snackbar";
import TextInput from "../../components/input/TextInput";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import type { RootState } from "../../store/rootReducer";
import { useProfileSelfUpdate } from "../../hooks/useProfileSelfUpdate";
import { usePermissions } from "../../hooks/usePermissions";
import { loadOrganizationRequest } from "../../store/organization/organization.actions";
import { KpiCard } from "../../components/card/KpiCard";
import UploadAvatarDialog from "./components/UploadAvatarDialog";
import {
  getEmployeeCompleteProfile,
  getLoggedInEmployeeProfile,
  getBankAccounts,
  getEmployeeDocuments,
  uploadSelfAvatar,
  uploadEmployeeAvatar,
  type AvatarCropParams,
  type BankAccount,
  type EmployeeDocument,
  type CompleteProfileEmployee,
  type CompleteProfileCompletion,
  type CompleteProfileSummary,
} from "../../api/employee.api";

// Lazy load the tab components
const OverviewTab = lazy(() => import("./components/OverviewTab"));
const PersonalTab = lazy(() => import("./components/PersonalTab"));
const DocumentsTab = lazy(() => import("./components/DocumentsTab"));
const PayrollTab = lazy(() => import("./components/PayrollTab"));
const LeaveTab = lazy(() => import("./components/LeaveTab"));
const AttendanceTab = lazy(() => import("./components/AttendanceTab"));

interface ProfileViewProps {
  targetEmployeeId?: string;
}

export default function ProfileView({ targetEmployeeId }: ProfileViewProps) {
  const dispatch = useDispatch<any>();
  const { showSnackbar } = useSnackbar();
  const routeParams = useParams<{ id: string }>();
  const user = useSelector((state: RootState) => state.auth?.user);
  const organization = useSelector((state: RootState) => state.organization?.organization);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    if (!organization) {
      dispatch(loadOrganizationRequest());
    }
  }, [dispatch, organization]);

  const resolvedTargetId = targetEmployeeId || routeParams.id;
  const employeeId = resolvedTargetId || user?.employeeId;
  const isViewingOther = !!resolvedTargetId;
  const canViewAttendance = !isViewingOther || hasPermission("attendance.read") || hasPermission("attendance.create");

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => {
    const currentTab = searchParams.get("tab") || "overview";
    if (currentTab === "attendance" && !canViewAttendance) {
      setActiveTab("overview");
      setSearchParams({ tab: "overview" });
    } else {
      setActiveTab(currentTab);
    }
  }, [searchParams, canViewAttendance, setSearchParams]);

  const handleTabChange = (_event: React.SyntheticEvent, newTab: string) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Bank & documents shared state
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(true);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [missingDocTypes, setMissingDocTypes] = useState<string[]>([]);

  const [profileCompletion, setProfileCompletion] = useState<CompleteProfileCompletion | null>(null);
  const [_profileSummary, setProfileSummary] = useState<CompleteProfileSummary | null>(null);
  const [empProfile, setEmpProfile] = useState<CompleteProfileEmployee | null>(null);

  // ── Avatar Upload Dialog ──────────────────────────────────────────────────
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [avatarSubmitting, setAvatarSubmitting] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const handleUploadAvatar = useCallback(async (file: File, cropParams?: AvatarCropParams) => {
    setAvatarSubmitting(true);
    setAvatarError(null);
    try {
      let res;
      if (isViewingOther && employeeId) {
        res = await uploadEmployeeAvatar(employeeId, file, cropParams);
      } else if (user?.employeeId) {
        res = await uploadSelfAvatar(file, cropParams);
      } else {
        setAvatarError("Your account does not have an employee profile linked. Please contact your administrator.");
        return;
      }

      if (res.succeeded && res.data?.avatarUrl) {
        const freshAvatarUrl = res.data.avatarUrl.includes("?")
          ? `${res.data.avatarUrl}&t=${Date.now()}`
          : `${res.data.avatarUrl}?t=${Date.now()}`;

        setEmpProfile((prev) => prev ? { ...prev, avatarUrl: freshAvatarUrl } : prev);
        if (!isViewingOther) {
          dispatch(updateUserAvatar(freshAvatarUrl));
        }
        showSnackbar("Profile picture updated successfully", "success");
        setAvatarDialogOpen(false);
      } else {
        const msg = res.message || "Failed to upload avatar";
        setAvatarError(
          msg.toLowerCase().includes("no employee record")
            ? "Your account does not have an employee profile linked. Please contact your administrator."
            : msg
        );
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to upload avatar";
      setAvatarError(
        msg.toLowerCase().includes("no employee record")
          ? "Your account does not have an employee profile linked. Please contact your administrator."
          : msg
      );
    } finally {
      setAvatarSubmitting(false);
    }
  }, [isViewingOther, employeeId, user?.employeeId, dispatch, showSnackbar]);

  // ── Edit Personal Details dialog ──────────────────────────────────────────
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editAddressLine1, setEditAddressLine1] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editZip, setEditZip] = useState("");
  const [editCountryCode, setEditCountryCode] = useState("IN");

  const loadProfileData = async (cancelled = false) => {
    if (!employeeId && isViewingOther) {
      setBankAccountsLoading(false);
      setDocumentsLoading(false);
      return;
    }

    let loadedSelf = false;
    if (employeeId) {
      try {
        const res = await getEmployeeCompleteProfile(employeeId);
        if (!cancelled && res.succeeded) {
          const empData = res.data.employee ? { ...res.data.employee } : null;
          if (empData?.avatarUrl && !empData.avatarUrl.includes("?t=")) {
            empData.avatarUrl = `${empData.avatarUrl}?t=${Date.now()}`;
          }
          setEmpProfile(empData);
          setBankAccounts((res.data.bankAccounts || []) as BankAccount[]);
          setDocuments((res.data.documents || []) as EmployeeDocument[]);
          setMissingDocTypes(res.data.organizationRequirements?.missingDocuments || []);
          if (res.data.profileCompletion) {
            setProfileCompletion(res.data.profileCompletion);
          }
          if (res.data.summary) {
            setProfileSummary(res.data.summary);
          }
          loadedSelf = true;
        }
      } catch (err: any) {
        // Fall through to self load if we are viewing ourselves
      }
    }

    if (!loadedSelf && !cancelled && !isViewingOther) {
      try {
        const [profileRes, bankRes, docRes] = await Promise.all([
          getLoggedInEmployeeProfile(),
          getBankAccounts(),
          getEmployeeDocuments(),
        ]);

        if (profileRes.succeeded) {
          const empData = profileRes.data ? { ...profileRes.data } : null;
          if (empData?.avatarUrl && !empData.avatarUrl.includes("?t=")) {
            empData.avatarUrl = `${empData.avatarUrl}?t=${Date.now()}`;
          }
          setEmpProfile(empData);
        }
        if (bankRes.succeeded) {
          setBankAccounts((bankRes.data || []) as BankAccount[]);
        }
        if (docRes.succeeded) {
          setDocuments((docRes.data || []) as EmployeeDocument[]);
        }
        setMissingDocTypes([]);
      } catch (fallbackErr) {
        // HR Admin or user without employee record — 404 expected
      }
    }

    if (!cancelled) {
      setBankAccountsLoading(false);
      setDocumentsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadProfileData(cancelled);
    return () => {
      cancelled = true;
    };
  }, [employeeId, isViewingOther, user?.id, user?.employeeId]);

  const onProfileUpdated = useCallback(async () => {
    await loadProfileData();
    showSnackbar("Personal details and address updated successfully", "success");
    setEditProfileOpen(false);
  }, [showSnackbar]);

  const personalDetailsUpdater = useProfileSelfUpdate(onProfileUpdated);

  const handleOpenEditProfile = () => {
    setEditPhone(empProfile?.phone || "");
    let dobVal = "";
    if (empProfile?.dateOfBirth) dobVal = empProfile.dateOfBirth.split("T")[0];
    setEditDob(dobVal);
    setEditGender(empProfile?.gender || "");
    const addr = (empProfile?.currentAddress || {}) as any;
    setEditAddressLine1(addr.addressLine1 || "");
    setEditCity(addr.city || "");
    setEditState(addr.state || "");
    setEditZip(addr.zip || "");
    setEditCountryCode(addr.countryCode || "IN");
    personalDetailsUpdater.clearError();
    setEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await personalDetailsUpdater.submit({
      phone: editPhone.trim(),
      dateOfBirth: editDob || undefined,
      gender: editGender || undefined,
      countryCode: editCountryCode || "IN",
      currentAddress: {
        addressLine1: editAddressLine1.trim(),
        city: editCity.trim(),
        state: editState.trim(),
        countryCode: editCountryCode || "IN",
        zip: editZip.trim(),
      },
    });
  };

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

  const displayFirstName = isViewingOther ? empProfile?.firstName : (user?.firstName || empProfile?.firstName);
  const displayLastName = isViewingOther ? empProfile?.lastName : (user?.lastName || empProfile?.lastName);
  const displayEmail = isViewingOther ? empProfile?.email : (user?.email || empProfile?.email);
  const displayName = `${displayFirstName || ""} ${displayLastName || ""}`.trim() || "User Profile";
  const displayId = isViewingOther ? empProfile?._id : (user?.id || empProfile?._id);
  const displayRole = isViewingOther ? (empProfile?.designationId?.name || "Employee") : getRoleLabel(user?.role || "");

  return (
    <>
      <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, width: "100%", maxWidth: "100%", boxSizing: "border-box", overflowX: "hidden", backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
        


        {/* Hero Profile Header Card */}
        <Card
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            mb: 3,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
              alignItems: { xs: "stretch", md: "center" },
              justifyContent: "space-between",
              minWidth: 0,
              width: "100%",
            }}
          >
            {/* Left Column: Avatar + Profile Details info */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 3,
                alignItems: "flex-start",
                flexGrow: 1,
                minWidth: 0,
              }}
            >
              {/* Avatar & Initial Badge */}
              <Box sx={{ position: "relative", flexShrink: 0, mx: { xs: "auto", sm: 0 } }}>
                <Avatar
                  src={empProfile?.avatarUrl || (isViewingOther ? undefined : user?.avatarUrl)}
                  sx={{
                    width: 92,
                    height: 92,
                    fontSize: "2.1rem",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #818CF8 0%, #6366F1 100%)",
                    color: "#FFFFFF",
                    boxShadow: "0 8px 20px rgba(99, 102, 241, 0.25)",
                  }}
                >
                  {displayFirstName?.[0]?.toUpperCase() ?? "P"}
                  {displayLastName?.[0]?.toUpperCase() ?? "S"}
                </Avatar>
                {(user?.employeeId || isViewingOther) && (
                  <IconButton
                    size="small"
                    onClick={() => setAvatarDialogOpen(true)}
                    title="Upload Profile Picture"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      backgroundColor: "#4F46E5",
                      color: "#FFFFFF",
                      width: 28,
                      height: 28,
                      border: "2px solid #FFFFFF",
                      "&:hover": { backgroundColor: "#4338CA" },
                    }}
                  >
                    <EditOutlinedIcon sx={{ fontSize: "15px" }} />
                  </IconButton>
                )}
              </Box>

              {/* Employee Title, Name & Meta Badges */}
              <Box sx={{ flexGrow: 1, minWidth: 0, textAlign: { xs: "center", sm: "left" }, width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: { xs: "center", sm: "flex-start" },
                    gap: 1.5,
                    mb: 0.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.55rem", wordBreak: "break-word" }}>
                    {displayName}
                  </Typography>
                </Box>

                <Typography variant="subtitle1" sx={{ color: "#64748B", fontWeight: 500, mb: 1.5, fontSize: "0.95rem", wordBreak: "break-word" }}>
                  {empProfile?.designationId?.name || displayRole} · {empProfile?.departmentId?.name || "Engineering"}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: { xs: "center", sm: "flex-start" },
                    gap: 1,
                    mb: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Chip label="Active" size="small" sx={{ backgroundColor: "#DCFCE7", color: "#166534", fontWeight: 700, fontSize: "0.75rem", px: 0.5 }} />
                  <Chip label={(empProfile as any)?.band || "L5"} size="small" sx={{ backgroundColor: "#F1F5F9", color: "#475569", fontWeight: 600, fontSize: "0.75rem", px: 0.5 }} />
                </Box>

                {/* Key Meta Info Details list */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: { xs: "center", sm: "flex-start" },
                    gap: 2,
                    flexWrap: "wrap",
                    color: "#64748B",
                    fontSize: "0.825rem",
                    wordBreak: "break-word",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <BadgeOutlinedIcon sx={{ fontSize: 16, color: "#94A3B8", flexShrink: 0 }} />
                    <span>{empProfile?.employeeCode || "NX-001"}</span>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <EmailOutlinedIcon sx={{ fontSize: 16, color: "#94A3B8", flexShrink: 0 }} />
                    <span style={{ wordBreak: "break-all" }}>{displayEmail || "priya.sharma@nexus.hr"}</span>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <PhoneOutlinedIcon sx={{ fontSize: 16, color: "#94A3B8", flexShrink: 0 }} />
                    <span>{empProfile?.phone || "+91 98765 43210"}</span>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 16, color: "#94A3B8", flexShrink: 0 }} />
                    <span>{String(empProfile?.currentAddress?.city || "Bangalore")}</span>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <CalendarMonthOutlinedIcon sx={{ fontSize: 16, color: "#94A3B8", flexShrink: 0 }} />
                    <span>Joined 15 Mar 2021</span>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <BusinessOutlinedIcon sx={{ fontSize: 16, color: "#94A3B8", flexShrink: 0 }} />
                    <span>{(empProfile as any)?.tenantId?.companyName || (empProfile as any)?.tenantId?.legalName || (empProfile as any)?.organizationName || organization?.companyName || organization?.legalName || (user as any)?.organizationName || (user as any)?.companyName || "Nexus HR Organization"}</span>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Right Column: Top Right Header Action Buttons */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
                flexShrink: 0,
                alignSelf: { xs: "stretch", md: "center" },
                justifyContent: { xs: "center", md: "flex-end" },
                width: { xs: "100%", md: "auto" },
                mt: { xs: 1, md: 0 },
              }}
            >
              <Button
                startIcon={<AutoAwesomeIcon sx={{ fontSize: "18px !important" }} />}
                variant="contained"
                onClick={() => setActiveTab("ai-insights")}
                sx={{
                  background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                  color: "#FFFFFF",
                  px: 2,
                  boxShadow: "0 4px 12px rgba(139, 92, 246, 0.25)",
                  "&:hover": { background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)" },
                  flexGrow: { xs: 1, sm: 0 },
                }}
              >
                AI Summary
              </Button>
              <Button
                startIcon={<DownloadOutlinedIcon />}
                variant="outlined"
                sx={{
                  borderColor: "#E2E8F0",
                  color: "#475569",
                  px: 2,
                  "&:hover": { backgroundColor: "#F8FAFC", borderColor: "#CBD5E1" },
                  flexGrow: { xs: 1, sm: 0 },
                }}
              >
                Export
              </Button>
            </Box>
          </Box>
        </Card>

        {/* Key KPI Metrics Ribbon */}
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          {[
            { title: "94%", label: "Performance", sub: "Q2 2025", icon: <TrendingUpOutlinedIcon sx={{ fontSize: 18, color: "#4F46E5" }} /> },
            { title: "96.4%", label: "Attendance", sub: "This month", icon: <AccessTimeOutlinedIcon sx={{ fontSize: 18, color: "#10B981" }} /> },
            { title: "12d", label: "Leave Balance", sub: "Annual remaining", icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: "#0284C7" }} /> },
            { title: "L5", label: "Grade", sub: "Current band", icon: <BadgeOutlinedIcon sx={{ fontSize: 18, color: "#8B5CF6" }} /> },
            { title: "78%", label: "Training %", sub: "4/5 courses done", icon: <SchoolOutlinedIcon sx={{ fontSize: 18, color: "#F59E0B" }} /> },
            { title: "2", label: "Assets", sub: "Assigned", icon: <Inventory2OutlinedIcon sx={{ fontSize: 18, color: "#06B6D4" }} /> },
            { title: "Low", label: "Attrition Risk", sub: "AI prediction", icon: <PsychologyOutlinedIcon sx={{ fontSize: 18, color: "#10B981" }} /> },
            { 
              title: profileCompletion?.overallScore !== undefined ? `${profileCompletion.overallScore}%` : "100%", 
              label: "Profile Complete", 
              sub: profileCompletion ? `${profileCompletion.completedSections}/${profileCompletion.totalSections} sections` : "5/5 sections", 
              icon: <AutoAwesomeIcon sx={{ fontSize: 18, color: "#6366F1" }} /> 
            },
          ].map((metric, i) => (
            <Grid key={i} size={{ xs: 6, sm: 6, md: 4, lg: 3, xl: 1.5 }}>
              <KpiCard
                title={metric.label}
                value={metric.title}
                subtext={metric.sub}
                icon={metric.icon}
                iconBg="rgba(109, 93, 246, 0.08)"
              />
            </Grid>
          ))}
        </Grid>

        {/* Horizontal Navigation Tabs Bar */}
        <Box sx={{ borderBottom: "1px solid #E2E8F0", mb: 3, width: "100%", maxWidth: "100%" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 44,
              "& .MuiTabs-indicator": { backgroundColor: "#4F46E5", height: 3, borderRadius: "3px 3px 0 0" },
              "& .MuiTabs-scrollButtons": {
                color: "#4F46E5",
                width: 32,
                "&.Mui-disabled": { opacity: 0.25 },
              },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: "0.8rem", sm: "0.84rem", md: "0.86rem" },
                color: "#64748B",
                minHeight: 44,
                minWidth: 0,
                px: { xs: 1.2, sm: 1.5, md: 1.75 },
                py: 1,
                whiteSpace: "nowrap",
                "&:hover": { color: "#4338CA", backgroundColor: "rgba(99, 102, 241, 0.04)" },
                "&.Mui-selected": { color: "#4F46E5", fontWeight: 700 },
              },
            }}
          >
            <Tab label="Overview" value="overview" />
            <Tab label="Personal" value="personal" />
            {canViewAttendance && <Tab label="Attendance" value="attendance" />}
            <Tab label="Leave" value="leave" />
            <Tab label="Payroll" value="payroll" />
            <Tab label="Performance" value="performance" />
            <Tab label="Learning" value="learning" />
            <Tab label="Documents" value="documents" />
            <Tab label="Assets" value="assets" />
            <Tab label="Timeline" value="timeline" />
            <Tab label="Notes" value="notes" />
            <Tab label="AI Insights" value="ai-insights" />
            <Tab label="Activity" value="activity" />
          </Tabs>
        </Box>

        {/* Tab content screens wrapped in Suspense for optimization */}
        <Suspense fallback={
          <Card sx={{ p: 5, borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", display: "flex", justify: "center", alignItems: "center", minHeight: 200 }}>
            <CircularProgress sx={{ color: "#4F46E5" }} />
          </Card>
        }>
          <Box sx={{ display: activeTab === "overview" ? "block" : "none" }}>
            <OverviewTab
              empProfile={empProfile}
              displayEmail={displayEmail || ""}
              displayFirstName={displayFirstName || ""}
              displayLastName={displayLastName || ""}
              displayId={displayId || ""}
              user={user}
              showSnackbar={showSnackbar}
            />
          </Box>

          <Box sx={{ display: activeTab === "personal" ? "block" : "none" }}>
            <PersonalTab
              empProfile={empProfile}
              isViewingOther={isViewingOther}
              displayFirstName={displayFirstName || ""}
              displayLastName={displayLastName || ""}
              displayEmail={displayEmail || ""}
              handleOpenEditProfile={handleOpenEditProfile}
              onRefreshProfileData={loadProfileData}
              showSnackbar={showSnackbar}
            />
          </Box>

          <Box sx={{ display: activeTab === "documents" ? "block" : "none" }}>
            <DocumentsTab
              documents={documents}
              missingDocTypes={missingDocTypes}
              documentsLoading={documentsLoading}
              isViewingOther={isViewingOther}
              onRefreshProfileData={loadProfileData}
              showSnackbar={showSnackbar}
            />
          </Box>

          <Box sx={{ display: activeTab === "payroll" ? "block" : "none" }}>
            <PayrollTab
              bankAccounts={bankAccounts}
              bankAccountsLoading={bankAccountsLoading}
              isViewingOther={isViewingOther}
              employeeId={employeeId || null}
              user={user}
              onRefreshProfileData={loadProfileData}
              showSnackbar={showSnackbar}
            />
          </Box>

          <Box sx={{ display: activeTab === "leave" ? "block" : "none" }}>
            <LeaveTab
              isViewingOther={isViewingOther}
              user={user}
            />
          </Box>

          <Box sx={{ display: activeTab === "attendance" && canViewAttendance ? "block" : "none" }}>
            <AttendanceTab employeeId={employeeId || undefined} isViewingOther={isViewingOther} />
          </Box>

          {/* AI Insights Coming Soon Tab */}
          {activeTab === "ai-insights" && (
            <Card
              sx={{
                p: 6,
                textAlign: "center",
                border: "1px solid #DDD6FE",
                backgroundColor: "#FAF9FF",
                boxShadow: "0 10px 30px rgba(139, 92, 246, 0.04)",
                borderRadius: "16px",
              }}
            >
              <AutoAwesomeIcon sx={{ color: "#8B5CF6", fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", mb: 1 }}>
                AI Insights & Summary
              </Typography>
              <Chip
                label="Coming Soon"
                size="small"
                sx={{
                  mb: 3,
                  backgroundColor: "#EDE9FE",
                  color: "#7C3AED",
                  fontWeight: 700,
                  fontSize: "11px",
                  px: 1.5,
                  height: 24,
                }}
              />
              <Typography variant="body1" sx={{ color: "#64748B", maxWidth: 500, mx: "auto", lineHeight: 1.6 }}>
                Deep employee performance analysis, sentiment analytics, and automated retention recommendations are on their way.
              </Typography>
            </Card>
          )}

          {/* Generic Content Fallback for remaining/placeholder tabs */}
          {!["overview", "personal", "documents", "payroll", "leave", "attendance", "ai-insights"].includes(activeTab) && (
             <Card sx={{ p: 5, textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", mb: 1, textTransform: "capitalize" }}>
                {activeTab} Section
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B" }}>
                Detailed {activeTab} information for {displayName} is loaded into this section.
              </Typography>
            </Card>
          )}
        </Suspense>

      </Box>

      {/* Upload Avatar Dialog */}
      <UploadAvatarDialog
        open={avatarDialogOpen}
        onClose={() => { if (!avatarSubmitting) setAvatarDialogOpen(false); }}
        onUpload={handleUploadAvatar}
        submitting={avatarSubmitting}
        error={avatarError}
      />

      {/* Edit Personal Details Dialog */}
      <Dialog
        open={editProfileOpen}
        onClose={() => { if (!personalDetailsUpdater.submitting) setEditProfileOpen(false); }}
        maxWidth="md"
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
        <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, pt: 2, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
            Edit Personal Details & Address
          </Typography>
          <IconButton onClick={() => setEditProfileOpen(false)} size="small" sx={{ color: "#9CA3AF" }} disabled={personalDetailsUpdater.submitting}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleSaveProfile}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1, px: 3 }}>
            {personalDetailsUpdater.error && <Alert severity="error" sx={{ borderRadius: 2 }}>{personalDetailsUpdater.error}</Alert>}

            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151" }}>
              Personal Information
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextInput
                  label="Phone Number"
                  type="tel"
                  value={editPhone}
                  maxLength={10}
                  onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  required
                  placeholder="e.g. 9876543210"
                  disabled={personalDetailsUpdater.submitting}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextInput
                  select
                  label="Gender"
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value)}
                  required
                  disabled={personalDetailsUpdater.submitting}
                >
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </TextInput>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextInput
                  type="date"
                  label="Date of Birth"
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  required
                  disabled={personalDetailsUpdater.submitting}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", mt: 0.5 }}>
              Current Address
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12 }}>
                <TextInput
                  label="Address Line 1"
                  value={editAddressLine1}
                  onChange={(e) => setEditAddressLine1(e.target.value)}
                  required
                  disabled={personalDetailsUpdater.submitting}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextInput
                  label="City"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  required
                  disabled={personalDetailsUpdater.submitting}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextInput
                  label="State"
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  required
                  disabled={personalDetailsUpdater.submitting}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextInput
                  label="ZIP / Postal Code"
                  value={editZip}
                  onChange={(e) => setEditZip(e.target.value)}
                  required
                  disabled={personalDetailsUpdater.submitting}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextInput
                  select
                  label="Country"
                  value={editCountryCode}
                  onChange={(e) => setEditCountryCode(e.target.value)}
                  required
                  disabled={personalDetailsUpdater.submitting}
                >
                  <MenuItem value="IN">India</MenuItem>
                  <MenuItem value="US">United States</MenuItem>
                  <MenuItem value="GB">United Kingdom</MenuItem>
                </TextInput>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setEditProfileOpen(false)}
              disabled={personalDetailsUpdater.submitting}
              sx={{ textTransform: "none", color: "#475569", fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={personalDetailsUpdater.submitting}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                backgroundColor: "#6D5DF6",
                px: 3,
                "&:hover": { backgroundColor: "#5B4CE5" },
              }}
            >
              {personalDetailsUpdater.submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
