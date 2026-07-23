import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserAvatar } from "../../store/auth";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import { useSnackbar } from "../../components/snackbar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ContactEmergencyOutlinedIcon from "@mui/icons-material/ContactEmergencyOutlined";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";

import type { RootState } from "../../store/rootReducer";
import { paths } from "../../routes/paths";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import { useDialog } from "../../hooks/useDialog";
import { useProfileSelfUpdate } from "../../hooks/useProfileSelfUpdate";
import EmergencyContactDialog from "./components/EmergencyContactDialog";
import UploadAvatarDialog from "./components/UploadAvatarDialog";
import {
  addBankAccount,
  deleteBankAccount,
  getBankAccounts,
  uploadDocument,
  getEmployeeDocuments,
  getDownloadUrl,
  getEmployeeCompleteProfile,
  getLoggedInEmployeeProfile,
  uploadSelfAvatar,
  uploadEmployeeAvatar,
  type AvatarCropParams,
  type AddBankAccountRequest,
  type BankAccount,
  type EmployeeDocument,
  type CompleteProfileEmployee,
  type EmergencyContact,
  type CompleteProfileCompletion,
  type CompleteProfileSummary,
} from "../../api/employee.api";

interface ProfileViewProps {
  targetEmployeeId?: string;
}

function ProfileView({ targetEmployeeId }: ProfileViewProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSnackbar } = useSnackbar();
  const routeParams = useParams<{ id: string }>();
  const user = useSelector((state: RootState) => state.auth?.user);
  const resolvedTargetId = targetEmployeeId || routeParams.id;
  const employeeId = resolvedTargetId || user?.employeeId;
  const isViewingOther = !!resolvedTargetId;

  const [activeTab, setActiveTab] = useState("overview");
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript", "Node.js", "AWS"]);
  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [aiInsightsDismissed, setAiInsightsDismissed] = useState(false);

  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [bankSubmitting, setBankSubmitting] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountType, setAccountType] = useState<AddBankAccountRequest["accountType"]>("SALARY");
  const [isPrimary, setIsPrimary] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(true);

  const [profileCompletion, setProfileCompletion] = useState<CompleteProfileCompletion | null>(null);
  const [_profileSummary, setProfileSummary] = useState<CompleteProfileSummary | null>(null);
  const [bankDeleteTarget, setBankDeleteTarget] = useState<BankAccount | null>(null);
  const [bankDeleting, setBankDeleting] = useState(false);
  const [empProfile, setEmpProfile] = useState<CompleteProfileEmployee | null>(null);
  const [missingDocTypes, setMissingDocTypes] = useState<string[]>([]);

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

  // ── Emergency Contacts ────────────────────────────────────────────────────
  const ecDialog = useDialog<void>();
  const [ecDeleteTarget, setEcDeleteTarget] = useState<number | null>(null);
  const [ecDeleteConfirmOpen, setEcDeleteConfirmOpen] = useState(false);
  const [ecSuccessMessage, setEcSuccessMessage] = useState("");

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
        console.error("Fallback load failed:", fallbackErr);
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

  // Shared self-update hook for personal details
  const onProfileUpdated = useCallback(async () => {
    await loadProfileData();
    showSnackbar("Personal details and address updated successfully", "success");
    setEditProfileOpen(false);
  }, [showSnackbar]);

  const personalDetailsUpdater = useProfileSelfUpdate(onProfileUpdated);

  // Shared self-update hook for emergency contacts
  const onEcUpdated = useCallback(async () => {
    await loadProfileData();
    ecDialog.close();
    setEcDeleteConfirmOpen(false);
    setEcDeleteTarget(null);
    showSnackbar(ecSuccessMessage, "success");
  }, [ecDialog, ecSuccessMessage, showSnackbar]);

  const ecUpdater = useProfileSelfUpdate(onEcUpdated);

  const resetBankForm = () => {
    setBankName("");
    setAccountNumber("");
    setIfscCode("");
    setAccountType("SALARY");
    setIsPrimary(false);
    setBankError(null);
  };

  const handleAddBankAccount = async () => {
    if (!bankName.trim() || !accountNumber.trim() || !ifscCode.trim()) return;

    setBankSubmitting(true);
    setBankError(null);

    try {
      const response = await addBankAccount({
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        accountType,
        isPrimary,
      });

      if (!response.succeeded) {
        setBankError(response.message || "Failed to add bank account");
        setBankSubmitting(false);
        return;
      }

      showSnackbar("Bank account added successfully", "success");
      setBankDialogOpen(false);
      resetBankForm();
      await loadProfileData();
    } catch (err: unknown) {
      setBankError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBankSubmitting(false);
    }
  };

  /* ─── Document Upload ─── */

  const DOCUMENT_TYPES = [
    { value: "PAN", label: "PAN Card" },
    { value: "AADHAAR", label: "Aadhaar Card" },
    { value: "PASSPORT", label: "Passport" },
    { value: "DRIVING_LICENSE", label: "Driving License" },
    { value: "OFFER_LETTER", label: "Offer Letter" },
    { value: "RESUME", label: "Resume" },
    { value: "DEGREE", label: "Degree" },
    { value: "EXPERIENCE", label: "Experience Letter" },
    { value: "OTHER", label: "Other" },
  ];

  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [docUploadDialogOpen, setDocUploadDialogOpen] = useState(false);
  const [docUploading, setDocUploading] = useState(false);

  const [docUploadError, setDocUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState("PAN");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetDocUploadForm = () => {
    setSelectedFile(null);
    setSelectedDocType("PAN");
    setDocUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDocDownload = async (docId: string) => {
    try {
      const res = await getDownloadUrl(docId);
      if (res.succeeded && res.data.downloadUrl) {
        window.open(res.data.downloadUrl, "_blank");
      }
    } catch {
      // silently ignore
    }
  };

  const ALLOWED_FILE_TYPES = [".jpg", ".jpeg", ".pdf"];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_FILE_TYPES.includes(ext)) {
        setDocUploadError("Only JPG, JPEG, and PDF files are allowed.");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }
    setSelectedFile(file);
    setDocUploadError(null);
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) return;

    setDocUploading(true);
    setDocUploadError(null);

    try {
      const res = await uploadDocument(selectedFile, selectedDocType);

      if (!res.succeeded) {
        setDocUploadError(res.message || "Failed to upload document");
        setDocUploading(false);
        return;
      }

      showSnackbar("Document uploaded — awaiting HR verification", "success");
      setDocUploadDialogOpen(false);
      resetDocUploadForm();
      await loadProfileData();
    } catch (err: unknown) {
      setDocUploadError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDocUploading(false);
    }
  };

  const handleDeleteBankAccount = async () => {
    if (!bankDeleteTarget) return;
    setBankDeleting(true);
    setBankError(null);
    try {
      const bankId = bankDeleteTarget.id || bankDeleteTarget._id || "";
      const res = await deleteBankAccount(bankDeleteTarget.employeeId || user?.employeeId || "", bankId);
      if (res.succeeded) {
        setBankAccounts((prev) => prev.filter((a) => (a.id || a._id) !== bankId));
        setBankDeleteTarget(null);
        showSnackbar("Bank account deleted successfully", "success");
        await loadProfileData();
      } else {
        setBankError(res.message || "Failed to delete bank account");
      }
    } catch (err: unknown) {
      setBankError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBankDeleting(false);
    }
  };

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

  const handleAddEmergencyContact = async (contact: EmergencyContact) => {
    const current = empProfile?.emergencyContacts ?? [];
    setEcSuccessMessage("Emergency contact added successfully");
    await ecUpdater.submit({ emergencyContacts: [...current, contact] });
  };

  const handleDeleteEmergencyContact = async () => {
    if (ecDeleteTarget === null) return;
    const updated = (empProfile?.emergencyContacts ?? []).filter((_, i) => i !== ecDeleteTarget);
    setEcSuccessMessage("Emergency contact removed successfully");
    await ecUpdater.submit({ emergencyContacts: updated });
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

  const displayFirstName = isViewingOther ? empProfile?.firstName : (user?.firstName || empProfile?.firstName);
  const displayLastName = isViewingOther ? empProfile?.lastName : (user?.lastName || empProfile?.lastName);
  const displayEmail = isViewingOther ? empProfile?.email : (user?.email || empProfile?.email);
  const displayName = `${displayFirstName || ""} ${displayLastName || ""}`.trim() || "User Profile";
  const displayId = isViewingOther ? empProfile?._id : (user?.id || empProfile?._id);
  const displayRole = isViewingOther ? (empProfile?.designationId?.name || "Employee") : getRoleLabel(user?.role || "");

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, width: "100%", maxWidth: "100%", boxSizing: "border-box", overflowX: "hidden", backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
        
        {/* Top Header & Breadcrumbs Bar */}
        <Box sx={{ mb: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", mb: 0.5 }}>
              People Hub
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, fontSize: "0.85rem", color: "#64748B", flexWrap: "wrap" }}>
              <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.85rem", cursor: "pointer", "&:hover": { color: "#4F46E5" } }} onClick={() => navigate(paths.dashboard)}>
                Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>›</Typography>
              <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.85rem" }}>People</Typography>
              <Typography variant="body2" sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>›</Typography>
              <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.85rem", cursor: "pointer", "&:hover": { color: "#4F46E5" } }} onClick={() => navigate(paths.employees.list)}>
                Employees
              </Typography>
              <Typography variant="body2" sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>›</Typography>
              <Typography variant="body2" sx={{ color: "#0F172A", fontWeight: 700, fontSize: "0.85rem", wordBreak: "break-word" }}>
                {displayName}
              </Typography>
            </Box>
          </Box>

          <Button
            startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: "18px !important" }} />}
            onClick={() => navigate(paths.employees.list)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#475569",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "10px",
              px: 2,
              py: 0.8,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              flexShrink: 0,
              whiteSpace: "nowrap",
              "&:hover": { backgroundColor: "#F8FAFC", borderColor: "#CBD5E1" }
            }}
          >
            Back to Directory
          </Button>
        </Box>

        {/* Hero Profile Header Card */}
        <Card
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            mb: 3,
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, alignItems: { xs: "center", md: "flex-start" }, minWidth: 0, width: "100%" }}>
            {/* Avatar & Initial Badge */}
            <Box sx={{ position: "relative", flexShrink: 0 }}>
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
              {/* Only show upload button if user has an employee record or viewing another employee */}
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
            <Box sx={{ flexGrow: 1, minWidth: 0, textAlign: { xs: "center", md: "left" } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "center", md: "flex-start" }, gap: 1.5, mb: 0.5, flexWrap: "wrap" }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.55rem", wordBreak: "break-word" }}>
                  {displayName}
                </Typography>
              </Box>

              <Typography variant="subtitle1" sx={{ color: "#64748B", fontWeight: 500, mb: 1.5, fontSize: "0.95rem", wordBreak: "break-word" }}>
                {empProfile?.designationId?.name || displayRole} · {empProfile?.departmentId?.name || "Engineering"}
              </Typography>

              {/* Status Badges */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "center", md: "flex-start" }, gap: 1, mb: 2, flexWrap: "wrap" }}>
                <Chip label="Active" size="small" sx={{ backgroundColor: "#DCFCE7", color: "#166534", fontWeight: 700, fontSize: "0.75rem", px: 0.5 }} />
                <Chip label={(empProfile as any)?.workMode || "Hybrid"} size="small" sx={{ backgroundColor: "#E0F2FE", color: "#075985", fontWeight: 600, fontSize: "0.75rem", px: 0.5 }} />
                <Chip label={(empProfile as any)?.band || "L5"} size="small" sx={{ backgroundColor: "#F1F5F9", color: "#475569", fontWeight: 600, fontSize: "0.75rem", px: 0.5 }} />
                <Chip label="High Performer" size="small" sx={{ backgroundColor: "#F3E8FF", color: "#6B21A8", fontWeight: 700, fontSize: "0.75rem", px: 0.5 }} />
              </Box>

              {/* Key Meta Info */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "center", md: "flex-start" }, gap: 2, flexWrap: "wrap", color: "#64748B", fontSize: "0.825rem", wordBreak: "break-word" }}>
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
                  <span>{String((empProfile?.currentAddress as any)?.city || "Bangalore")}</span>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <CalendarMonthOutlinedIcon sx={{ fontSize: 16, color: "#94A3B8", flexShrink: 0 }} />
                  <span>Joined 15 Mar 2021</span>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <GroupOutlinedIcon sx={{ fontSize: 16, color: "#94A3B8", flexShrink: 0 }} />
                  <span>Reports to {empProfile?.managerId ? `${empProfile.managerId.firstName} ${empProfile.managerId.lastName}` : "Arjun Mehta"}</span>
                </Box>
              </Box>

              {/* Quick Contact Action Icons */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "center", md: "flex-start" }, gap: 1, mt: 2 }}>
                <IconButton size="small" sx={{ border: "1px solid #E2E8F0", borderRadius: "50%", p: 0.8, color: "#64748B" }}>
                  <EmailOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton size="small" sx={{ border: "1px solid #E2E8F0", borderRadius: "50%", p: 0.8, color: "#64748B" }}>
                  <PhoneOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton size="small" sx={{ border: "1px solid #E2E8F0", borderRadius: "50%", p: 0.8, color: "#64748B" }}>
                  <ChatOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton size="small" sx={{ border: "1px solid #E2E8F0", borderRadius: "50%", p: 0.8, color: "#64748B" }}>
                  <LanguageOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Top Right Header Action Buttons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", flexShrink: 0, alignSelf: { xs: "center", md: "flex-start" } }}>
              {!isViewingOther && (
                <Button
                  startIcon={<EditOutlinedIcon />}
                  onClick={handleOpenEditProfile}
                  variant="contained"
                  sx={{
                    backgroundColor: "#4F46E5",
                    color: "#FFFFFF",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "10px",
                    px: 2,
                    boxShadow: "none",
                    "&:hover": { backgroundColor: "#4338CA" },
                  }}
                >
                  Edit
                </Button>
              )}
              <Button
                startIcon={<AutoAwesomeIcon sx={{ fontSize: "18px !important" }} />}
                variant="contained"
                onClick={() => setActiveTab("ai-insights")}
                sx={{
                  background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                  color: "#FFFFFF",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "10px",
                  px: 2,
                  boxShadow: "0 4px 12px rgba(139, 92, 246, 0.25)",
                  "&:hover": { background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)" },
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
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "10px",
                  px: 2,
                  "&:hover": { backgroundColor: "#F8FAFC", borderColor: "#CBD5E1" },
                }}
              >
                Export
              </Button>
              <IconButton sx={{ border: "1px solid #E2E8F0", borderRadius: "10px", p: 1, color: "#64748B" }}>
                <MoreHorizOutlinedIcon />
              </IconButton>
            </Box>
          </Box>
        </Card>

        {/* Key KPI Metrics Ribbon (8 Stat Cards - Responsive Grid) */}
        <Grid container spacing={1.5} sx={{ mb: 3, width: "100%" }}>
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
            <Grid key={i} size={{ xs: 6, sm: 4, md: 3, lg: 1.5 }}>
              <Card
                sx={{
                  p: 1.8,
                  borderRadius: "14px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  backgroundColor: "#FFFFFF",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justify: "space-between",
                  transition: "all 0.2s ease",
                  minWidth: 0,
                  "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.05)", transform: "translateY(-2px)" }
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.8 }}>
                  {metric.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.2rem", lineHeight: 1.2 }}>
                  {metric.title}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569", display: "block", mt: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {metric.label}
                </Typography>
                <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: "0.68rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {metric.sub}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Horizontal Navigation Tabs Bar */}
        <Box sx={{ borderBottom: "1px solid #E2E8F0", mb: 3, width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 44,
              "& .MuiTabs-indicator": { backgroundColor: "#4F46E5", height: 3, borderRadius: "3px 3px 0 0" },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#64748B",
                minHeight: 44,
                px: 2,
                "&.Mui-selected": { color: "#4F46E5", fontWeight: 700 },
              },
            }}
          >
            <Tab label="Overview" value="overview" />
            <Tab label="Personal" value="personal" />
            <Tab label="Employment" value="employment" />
            <Tab label="Attendance" value="attendance" />
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

        {/* Tab 1: OVERVIEW MAIN 2-COLUMN DASHBOARD */}
        {activeTab === "overview" && (
          <Grid container spacing={3} sx={{ width: "100%" }}>
            {/* Left Column (~75% Width on lg screens, 100% on md and below) */}
            <Grid size={{ xs: 12, lg: 8.5 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                
                {/* 1. Contact Information & Employment Details Grid */}
                <Card sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", backgroundColor: "#FFFFFF" }}>
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
                              {String((empProfile?.currentAddress as any)?.city || "Bangalore")}
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
                          { label: "System Profile ID", value: String(displayId || "—") },
                          { label: "Department", value: empProfile?.departmentId?.name || "Engineering" },
                          { label: "Grade / Band", value: String((empProfile as any)?.band || "L5") },
                          { label: "Business Unit", value: "Technology" },
                          { label: "Cost Center", value: "CC-ENG-01" },
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
                <Card sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", backgroundColor: "#FFFFFF" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A", mb: 2.5, fontSize: "0.95rem" }}>
                    Reporting Structure
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                    {/* Node 1: CTO */}
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
                          Arjun Mehta
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

                {/* 3. Assigned Policies (2x3 Grid) */}
                <Card sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", backgroundColor: "#FFFFFF" }}>
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
                      <Grid key={idx} size={{ xs: 12, sm: 6 }}>
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

                {/* 4. Skills & Expertise */}
                <Card sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", backgroundColor: "#FFFFFF" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A", mb: 2, fontSize: "0.95rem" }}>
                    Skills & Expertise
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap" }}>
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
                    <Chip
                      icon={<AddIcon sx={{ fontSize: "16px !important" }} />}
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
                </Card>

                {/* 5. Recent Activity Feed */}
                <Card sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", backgroundColor: "#FFFFFF" }}>
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

                {/* 6. Related Employees / Peers in Engineering */}
                <Card sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", backgroundColor: "#FFFFFF" }}>
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
            <Grid size={{ xs: 12, lg: 3.5 }}>
              {!aiInsightsDismissed && (
                <Card
                  sx={{
                    p: 3,
                    borderRadius: "16px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 20px rgba(139, 92, 246, 0.08)",
                    backgroundColor: "#FFFFFF",
                    position: "sticky",
                    top: 24,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AutoAwesomeIcon sx={{ color: "#8B5CF6", fontSize: 20 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.95rem" }}>
                        AI Insights
                      </Typography>
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
                        onClick={() => showSnackbar(`AI Action "${btn.label}" initiated`, "info")}
                        sx={{
                          justify: "flex-start",
                          textTransform: "none",
                          fontWeight: 600,
                          fontSize: "0.825rem",
                          color: "#475569",
                          borderColor: "#E2E8F0",
                          borderRadius: "10px",
                          py: 1,
                          backgroundColor: "#F8FAFC",
                          "&:hover": { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE", color: "#4F46E5" }
                        }}
                      >
                        {btn.label}
                      </Button>
                    ))}
                  </Box>
                </Card>
              )}
            </Grid>
          </Grid>
        )}

        {/* Tab 2: PERSONAL DETAILS TAB */}
        {activeTab === "personal" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Card sx={{ p: 3.5, borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 1 }}>
                  <BadgeOutlinedIcon sx={{ color: "#4F46E5" }} />
                  Personal Information
                </Typography>
                {!isViewingOther && (
                  <Button size="small" startIcon={<EditOutlinedIcon />} onClick={handleOpenEditProfile} sx={{ textTransform: "none", color: "#4F46E5", fontWeight: 600 }}>
                    Edit Details
                  </Button>
                )}
              </Box>
              <Grid container spacing={2.5}>
                <Grid size={6}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>First Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#0F172A", mt: 0.5 }}>{displayFirstName || "—"}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>Last Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#0F172A", mt: 0.5 }}>{displayLastName || "—"}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>Email Address</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#0F172A", mt: 0.5 }}>{displayEmail || "—"}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>Phone Number</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#0F172A", mt: 0.5 }}>{empProfile?.phone || "—"}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>Gender</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#0F172A", mt: 0.5 }}>{empProfile?.gender || "—"}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>Date of Birth</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#0F172A", mt: 0.5 }}>
                    {empProfile?.dateOfBirth ? new Date(empProfile.dateOfBirth).toLocaleDateString(undefined, { dateStyle: "medium", timeZone: "UTC" }) : "—"}
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>Current Address</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#0F172A", mt: 0.5 }}>
                    {empProfile?.currentAddress?.addressLine1 ? (
                      `${empProfile.currentAddress.addressLine1}, ${empProfile.currentAddress.city || ""}, ${empProfile.currentAddress.state || ""}, ${empProfile.currentAddress.countryCode || ""} ${empProfile.currentAddress.zip || ""}`
                    ) : "—"}
                  </Typography>
                </Grid>
              </Grid>
            </Card>

            {/* Emergency Contacts Card */}
            <Card sx={{ p: 3.5, borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 1 }}>
                  <ContactEmergencyOutlinedIcon sx={{ color: "#4F46E5" }} />
                  Emergency Contacts
                </Typography>
                {!isViewingOther && (
                  <Button size="small" startIcon={<AddIcon />} onClick={() => ecDialog.open()} sx={{ textTransform: "none", color: "#4F46E5", fontWeight: 600 }}>
                    Add Contact
                  </Button>
                )}
              </Box>

              {(empProfile?.emergencyContacts ?? []).length === 0 ? (
                <Typography variant="body2" sx={{ color: "#94A3B8", textAlign: "center", py: 2 }}>
                  No emergency contacts added yet
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {(empProfile!.emergencyContacts!).map((ec, idx) => (
                    <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, borderRadius: 2, border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC" }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>{ec.name}</Typography>
                        <Typography variant="caption" sx={{ color: "#64748B" }}>{ec.relationship} · {ec.phone}</Typography>
                      </Box>
                      {!isViewingOther && (
                        <IconButton size="small" onClick={() => { setEcDeleteTarget(idx); setEcDeleteConfirmOpen(true); }} sx={{ color: "#94A3B8" }}>
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Card>
          </Box>
        )}

        {/* Tab 3: DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <Card sx={{ p: 3.5, borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 1 }}>
                <DescriptionOutlinedIcon sx={{ color: "#4F46E5" }} />
                Documents Management
              </Typography>
              {!isViewingOther && (
                <Button variant="contained" startIcon={<CloudUploadOutlinedIcon />} onClick={() => { resetDocUploadForm(); setDocUploadDialogOpen(true); }} sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#4F46E5", borderRadius: 2 }}>
                  Upload Document
                </Button>
              )}
            </Box>
            {(missingDocTypes || []).length > 0 && (
              <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                Missing required verification documents: <strong>{(missingDocTypes || []).join(", ")}</strong>
              </Alert>
            )}
            {documentsLoading ? (
              <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress size={28} sx={{ color: "#4F46E5" }} /></Box>
            ) : documents.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#64748B", textAlign: "center", py: 3 }}>No documents uploaded yet.</Typography>
            ) : (
              <Grid container spacing={2}>
                {documents.map((doc, index) => (
                  <Grid key={doc.id || doc._id || index} size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 2, borderRadius: 2, border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>{doc.fileName}</Typography>
                        <Chip label={doc.documentType} size="small" variant="outlined" sx={{ mt: 0.5, fontSize: "0.7rem" }} />
                      </Box>
                      <Button size="small" onClick={() => handleDocDownload(doc.id || doc._id)} sx={{ color: "#4F46E5" }}>
                        <DownloadOutlinedIcon fontSize="small" />
                      </Button>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Card>
        )}

        {/* Tab 4: PAYROLL & BANK ACCOUNTS TAB */}
        {activeTab === "payroll" && (
          <Card sx={{ p: 3.5, borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 1 }}>
                <AccountBalanceOutlinedIcon sx={{ color: "#4F46E5" }} />
                Bank Accounts
              </Typography>
              {!isViewingOther && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetBankForm(); setBankDialogOpen(true); }} sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#4F46E5", borderRadius: 2 }}>
                  Add Bank Account
                </Button>
              )}
            </Box>
            {bankAccountsLoading ? (
              <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress size={28} sx={{ color: "#4F46E5" }} /></Box>
            ) : bankAccounts.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#64748B", textAlign: "center", py: 3 }}>No bank account added yet.</Typography>
            ) : (
              <Grid container spacing={2}>
                {bankAccounts.map((acc, index) => (
                  <Grid key={acc.id || acc._id || index} size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 2, borderRadius: 2, border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>{acc.bankName}</Typography>
                        {!isViewingOther && (
                          <IconButton size="small" onClick={() => { setBankError(null); setBankDeleteTarget(acc); }}>
                            <DeleteOutlinedIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ color: "#64748B", fontFamily: "monospace", display: "block", mt: 0.5 }}>{acc.accountNumber}</Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Chip label={acc.ifscCode} size="small" variant="outlined" sx={{ fontSize: "0.7rem", fontFamily: "monospace" }} />
                        <Chip label={acc.accountType} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Card>
        )}

        {/* Generic Content Fallback for remaining tabs */}
        {!["overview", "personal", "documents", "payroll"].includes(activeTab) && (
          <Card sx={{ p: 5, borderRadius: "16px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", mb: 1, textTransform: "capitalize" }}>
              {activeTab} Section
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              Detailed {activeTab} information for {displayName} is loaded into this section.
            </Typography>
          </Card>
        )}

        {/* 
          ======================================================================
          COMMENTED OUT LEGACY LAYOUT BLOCK (PRESERVED FOR BACKWARD COMPATIBILITY)
          ======================================================================
          {/*
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ p: 3.5, borderRadius: 4, backgroundColor: "#fff" }}>
                <Typography variant="h6">Personal Information</Typography>
                <Grid container spacing={2.5}>
                  <Grid size={6}><Typography variant="caption">First Name</Typography><Typography>{displayFirstName}</Typography></Grid>
                  <Grid size={6}><Typography variant="caption">Last Name</Typography><Typography>{displayLastName}</Typography></Grid>
                  <Grid size={12}><Typography variant="caption">Email</Typography><Typography>{displayEmail}</Typography></Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
          */}

      </Box>

      {/* Add Skill Dialog */}
      <Dialog open={addSkillOpen} onClose={() => setAddSkillOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Skill or Expertise</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Skill Name"
            placeholder="e.g. Python, Docker, GraphQL"
            fullWidth
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddSkillOpen(false)} sx={{ color: "#64748B" }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (newSkillInput.trim()) {
                setSkills((prev) => [...prev, newSkillInput.trim()]);
                setNewSkillInput("");
                setAddSkillOpen(false);
                showSnackbar("Skill added to profile", "success");
              }
            }}
            sx={{ backgroundColor: "#4F46E5", fontWeight: 600 }}
          >
            Add Skill
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Bank Account Confirmation */}
      <Dialog
        open={!!bankDeleteTarget}
        onClose={() => { if (!bankDeleting) setBankDeleteTarget(null); }}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
          Delete Bank Account?
        </DialogTitle>
        <DialogContent>
          {bankError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{bankError}</Alert>}
          <Typography variant="body2" sx={{ color: "#6B7280" }}>
            {bankDeleteTarget?.bankName} ({bankDeleteTarget?.accountNumber}) will be permanently removed. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBankDeleteTarget(null)} disabled={bankDeleting} sx={{ textTransform: "none", color: "#6B7280" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteBankAccount}
            disabled={bankDeleting}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, backgroundColor: "#DC2626", "&:hover": { backgroundColor: "#B91C1C" } }}
          >
            {bankDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Bank Account Dialog */}
      <Dialog
        open={bankDialogOpen}
        onClose={() => { if (!bankSubmitting) setBankDialogOpen(false); }}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.15rem" }}>
          Add Bank Account
        </DialogTitle>
        <DialogContent>
          {bankError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{bankError}</Alert>}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
            <TextField
              label="Bank Name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              fullWidth
              required
              disabled={bankSubmitting}
            />
            <TextField
              label="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              fullWidth
              required
              disabled={bankSubmitting}
            />
            <TextField
              label="IFSC Code"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
              fullWidth
              required
              placeholder="e.g. SBIN0001234"
              disabled={bankSubmitting}
            />
            <TextField
              select
              label="Account Type"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as AddBankAccountRequest["accountType"])}
              fullWidth
              disabled={bankSubmitting}
            >
              <MenuItem value="SALARY">Salary</MenuItem>
              <MenuItem value="SAVINGS">Savings</MenuItem>
              <MenuItem value="CURRENT">Current</MenuItem>
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  disabled={bankSubmitting}
                />
              }
              label="Set as primary account"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setBankDialogOpen(false)}
            disabled={bankSubmitting}
            sx={{ textTransform: "none", color: "#6B7280" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddBankAccount}
            disabled={bankSubmitting || !bankName.trim() || !accountNumber.trim() || !ifscCode.trim()}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              backgroundColor: "#6D5DF6",
              "&:hover": { backgroundColor: "#5B4CE5" },
            }}
          >
            {bankSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog
        open={docUploadDialogOpen}
        onClose={() => { if (!docUploading) setDocUploadDialogOpen(false); }}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.15rem" }}>
          Upload Document
        </DialogTitle>
        <DialogContent>
          {docUploadError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{docUploadError}</Alert>}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
            <TextField
              select
              label="Document Type"
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              fullWidth
              disabled={docUploading}
            >
              {DOCUMENT_TYPES.map((dt) => (
                <MenuItem key={dt.value} value={dt.value}>{dt.label}</MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              component="label"
              disabled={docUploading}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#D1D5DB",
                color: "#374151",
                justifyContent: "flex-start",
                py: 1.5,
              }}
            >
              {selectedFile ? selectedFile.name : "Choose File"}
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".jpg,.jpeg,.pdf"
                onChange={handleFileSelect}
              />
            </Button>
            <Typography variant="caption" sx={{ color: "#9CA3AF", mt: -1 }}>
              Accepted: .pdf, .jpg, .jpeg
            </Typography>
            {docUploading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "#6B7280" }}>
                <CircularProgress size={16} sx={{ color: "#6D5DF6" }} />
                <Typography variant="caption">Uploading to server...</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDocUploadDialogOpen(false)}
            disabled={docUploading}
            sx={{ textTransform: "none", color: "#6B7280" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadDocument}
            disabled={docUploading || !selectedFile}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              backgroundColor: "#6D5DF6",
              "&:hover": { backgroundColor: "#5B4CE5" },
            }}
          >
            {docUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Edit Personal Details Dialog */}
      <Dialog
        open={editProfileOpen}
        onClose={() => { if (!personalDetailsUpdater.submitting) setEditProfileOpen(false); }}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.15rem" }}>
          Edit Personal Details & Address
        </DialogTitle>
        <Box component="form" onSubmit={handleSaveProfile}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
            {personalDetailsUpdater.error && <Alert severity="error" sx={{ borderRadius: 2 }}>{personalDetailsUpdater.error}</Alert>}
            
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#4B5563" }}>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Phone Number"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  fullWidth
                  required
                  placeholder="e.g. 9876543210"
                  disabled={personalDetailsUpdater.submitting}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  select
                  label="Gender"
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value)}
                  fullWidth
                  required
                  disabled={personalDetailsUpdater.submitting}
                >
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField
                  type="date"
                  label="Date of Birth"
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  disabled={personalDetailsUpdater.submitting}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#4B5563" }}>
              Current Address
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  label="Address Line 1"
                  value={editAddressLine1}
                  onChange={(e) => setEditAddressLine1(e.target.value)}
                  fullWidth
                  required
                  placeholder="Street name, floor, apartment number"
                  disabled={personalDetailsUpdater.submitting}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="City"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  fullWidth
                  required
                  disabled={personalDetailsUpdater.submitting}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="State"
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  fullWidth
                  required
                  disabled={personalDetailsUpdater.submitting}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="ZIP / Postal Code"
                  value={editZip}
                  onChange={(e) => setEditZip(e.target.value)}
                  fullWidth
                  required
                  disabled={personalDetailsUpdater.submitting}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Country Code"
                  value={editCountryCode}
                  onChange={(e) => setEditCountryCode(e.target.value)}
                  fullWidth
                  required
                  placeholder="e.g. IN"
                  disabled={personalDetailsUpdater.submitting}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setEditProfileOpen(false)}
              disabled={personalDetailsUpdater.submitting}
              sx={{ textTransform: "none", color: "#6B7280" }}
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
                borderRadius: 2,
                backgroundColor: "#6D5DF6",
                "&:hover": { backgroundColor: "#5B4CE5" },
              }}
            >
              {personalDetailsUpdater.submitting ? "Saving..." : "Save Details"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Add Emergency Contact Dialog */}
      <EmergencyContactDialog
        open={ecDialog.isOpen}
        onClose={ecDialog.close}
        onSave={handleAddEmergencyContact}
        submitting={ecUpdater.submitting}
        error={ecUpdater.error}
      />

      {/* Delete Emergency Contact Confirm Dialog */}
      <ConfirmDialog
        open={ecDeleteConfirmOpen}
        title="Remove Emergency Contact"
        content="Are you sure you want to remove this emergency contact? This action cannot be undone."
        confirmLabel="Remove"
        onConfirm={handleDeleteEmergencyContact}
        onClose={() => { setEcDeleteConfirmOpen(false); setEcDeleteTarget(null); }}
        loading={ecUpdater.submitting}
      />

      {/* Upload Avatar Dialog */}
      <UploadAvatarDialog
        open={avatarDialogOpen}
        onClose={() => setAvatarDialogOpen(false)}
        onUpload={handleUploadAvatar}
        submitting={avatarSubmitting}
        error={avatarError}
      />
    </DashboardLayout>
  );
}

export default ProfileView;
