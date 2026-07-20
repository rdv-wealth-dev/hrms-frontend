import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
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
import Snackbar from "@mui/material/Snackbar";
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
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ContactEmergencyOutlinedIcon from "@mui/icons-material/ContactEmergencyOutlined";

import type { RootState } from "../../store/rootReducer";
import { paths } from "../../routes/paths";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import { useDialog } from "../../hooks/useDialog";
import { useProfileSelfUpdate } from "../../hooks/useProfileSelfUpdate";
import EmergencyContactDialog from "./components/EmergencyContactDialog";
import {
  addBankAccount,
  deleteBankAccount,
  getBankAccounts,
  uploadDocument,
  getEmployeeDocuments,
  getDownloadUrl,
  getEmployeeCompleteProfile,
  getLoggedInEmployeeProfile,
  type AddBankAccountRequest,
  type BankAccount,
  type EmployeeDocument,
  type CompleteProfileEmployee,
  type EmergencyContact,
} from "../../api/employee.api";

interface ProfileViewProps {
  targetEmployeeId?: string;
}

function ProfileView({ targetEmployeeId }: ProfileViewProps) {
  const navigate = useNavigate();
  const routeParams = useParams<{ id: string }>();
  const user = useSelector((state: RootState) => state.auth?.user);
  const resolvedTargetId = targetEmployeeId || routeParams.id;
  const employeeId = resolvedTargetId || user?.employeeId;
  const isViewingOther = !!resolvedTargetId;

  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [bankSubmitting, setBankSubmitting] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [bankSuccess, setBankSuccess] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountType, setAccountType] = useState<AddBankAccountRequest["accountType"]>("SALARY");
  const [isPrimary, setIsPrimary] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(true);
  const [bankDeleteTarget, setBankDeleteTarget] = useState<BankAccount | null>(null);
  const [bankDeleting, setBankDeleting] = useState(false);
  const [bankDeleteSuccess, setBankDeleteSuccess] = useState(false);
  const [empProfile, setEmpProfile] = useState<CompleteProfileEmployee | null>(null);
  const [missingDocTypes, setMissingDocTypes] = useState<string[]>([]);

  // ── Edit Personal Details dialog ──────────────────────────────────────────
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editProfileSuccess, setEditProfileSuccess] = useState(false);

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
  const [ecSuccessOpen, setEcSuccessOpen] = useState(false);
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
          setEmpProfile(res.data.employee || null);
          setBankAccounts((res.data.bankAccounts || []) as BankAccount[]);
          setDocuments((res.data.documents || []) as EmployeeDocument[]);
          setMissingDocTypes(res.data.organizationRequirements?.missingDocuments || []);
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
          setEmpProfile(profileRes.data || null);
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
  }, [employeeId, isViewingOther, user]);

  // Shared self-update hook for personal details
  const onProfileUpdated = useCallback(async () => {
    await loadProfileData();
    setEditProfileSuccess(true);
    setEditProfileOpen(false);
  }, []);

  const personalDetailsUpdater = useProfileSelfUpdate(onProfileUpdated);

  // Shared self-update hook for emergency contacts
  const onEcUpdated = useCallback(async () => {
    await loadProfileData();
    ecDialog.close();
    setEcDeleteConfirmOpen(false);
    setEcDeleteTarget(null);
    setEcSuccessOpen(true);
  }, [ecDialog]);

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

      setBankSuccess(true);
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
  const [docUploadSuccess, setDocUploadSuccess] = useState(false);
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

      setDocUploadSuccess(true);
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
        setBankDeleteSuccess(true);
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
      <Box sx={{ p: 4, maxWidth: "1200px", margin: "0 auto" }}>
        {isViewingOther && (
          <Button
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={() => navigate(paths.employees.list)}
            sx={{ mb: 2, textTransform: "none", fontWeight: 600, color: "#6D5DF6" }}
          >
            Back to Employees
          </Button>
        )}
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
            {displayFirstName?.[0]?.toUpperCase() ?? "U"}
            {displayLastName?.[0]?.toUpperCase() ?? ""}
          </Avatar>
          <Box sx={{ textAlign: { xs: "center", sm: "left" }, flexGrow: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "center", sm: "flex-start" }, gap: 1.5, mb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {displayName}
              </Typography>
              {(isViewingOther || user?.isActive) && (
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
              {displayEmail}
            </Typography>
            <Chip
              icon={<AdminPanelSettingsOutlinedIcon sx={{ color: "#fff !important" }} />}
              label={displayRole}
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

        {/* Profile Completion */}
        {empProfile && (() => {
          const computedCompletion = {
            personalDetails: !!(empProfile.phone && empProfile.dateOfBirth && empProfile.gender) || (empProfile.profileCompletion?.personalDetails ?? false),
            address: !!(
              empProfile.currentAddress &&
              (empProfile.currentAddress as any).addressLine1 &&
              (empProfile.currentAddress as any).city &&
              (empProfile.currentAddress as any).state &&
              (empProfile.currentAddress as any).zip
            ) || (empProfile.profileCompletion?.address ?? false),
            emergencyContact: !!(empProfile.emergencyContacts && empProfile.emergencyContacts.length > 0) || (empProfile.profileCompletion?.emergencyContact ?? false),
            bankDetails: bankAccounts.length > 0 || (empProfile.profileCompletion?.bankDetails ?? false),
            mandatoryDocs: (documents.length > 0 && missingDocTypes.length === 0) || (empProfile.profileCompletion?.mandatoryDocs ?? false),
          };

          const isProfileComplete = Object.values(computedCompletion).every(Boolean);
          const completedCount = Object.values(computedCompletion).filter(Boolean).length;

          return (
            <Card
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 4,
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
                backgroundColor: "#fff",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleOutlinedIcon sx={{ color: isProfileComplete ? "#10B981" : "#F59E0B" }} />
                  Profile {isProfileComplete ? "Complete" : "Incomplete"}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: isProfileComplete ? "#10B981" : "#F59E0B" }}>
                  {completedCount}/5 completed
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                {[
                  { key: "personalDetails", label: "Personal Details" },
                  { key: "address", label: "Address" },
                  { key: "emergencyContact", label: "Emergency Contact" },
                  { key: "bankDetails", label: "Bank Details" },
                  { key: "mandatoryDocs", label: "Mandatory Documents" },
                ].map((item) => {
                  const done = computedCompletion[item.key as keyof typeof computedCompletion] ?? false;
                  return (
                    <Chip
                      key={item.key}
                      icon={done ? <CheckCircleOutlinedIcon sx={{ fontSize: "14px !important" }} /> : <HourglassEmptyOutlinedIcon sx={{ fontSize: "14px !important" }} />}
                      label={item.label}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: done ? "#D1FAE5" : "#FEF3C7",
                        color: done ? "#065F46" : "#92400E",
                        borderRadius: 2,
                      }}
                    />
                  );
                })}
              </Box>
              {(missingDocTypes || []).length > 0 && (
                <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                  Missing documents: <strong>{(missingDocTypes || []).join(", ")}</strong>
                </Alert>
              )}
            </Card>
          );
        })()}

        {/* Content Cards */}
        <Grid container spacing={3}>
          {/* Column 1 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, height: "100%" }}>
              <Card
                sx={{
                  p: 3.5,
                  borderRadius: 4,
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
                  backgroundColor: "#fff",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 1 }}>
                    <BadgeOutlinedIcon sx={{ color: "#6D5DF6" }} />
                    Personal Information
                  </Typography>
                  {!isViewingOther && (
                    <Button
                      size="small"
                      startIcon={<EditOutlinedIcon />}
                      onClick={handleOpenEditProfile}
                      sx={{ textTransform: "none", color: "#6D5DF6", fontWeight: 600 }}
                    >
                      Edit
                    </Button>
                  )}
                </Box>
                <Grid container spacing={2.5}>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>First Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#1F2937", mt: 0.5 }}>{displayFirstName || "—"}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Last Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#1F2937", mt: 0.5 }}>{displayLastName || "—"}</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Email Address</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: "#1F2937" }}>{displayEmail || "—"}</Typography>
                      {(isViewingOther || user?.isEmailVerified) && (
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
                  {!isViewingOther && user?.id && (
                    <Grid size={12}>
                      <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Account ID</Typography>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", color: "#4B5563", backgroundColor: "#F9FAFB", p: 1, borderRadius: 2, border: "1px solid #E5E7EB", mt: 0.5 }}>
                        {user.id}
                      </Typography>
                    </Grid>
                  )}
                  {displayId && (
                    <Grid size={12}>
                      <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Employee profile ID</Typography>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", color: "#4B5563", backgroundColor: "#F9FAFB", p: 1, borderRadius: 2, border: "1px solid #E5E7EB", mt: 0.5 }}>
                        {displayId}
                      </Typography>
                    </Grid>
                  )}
                  {empProfile?.employeeCode && (
                    <Grid size={6}>
                      <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Employee Code</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: "#1F2937", mt: 0.5 }}>{empProfile.employeeCode}</Typography>
                    </Grid>
                  )}
                  {empProfile?.departmentId && (
                    <Grid size={6}>
                      <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Department</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: "#1F2937", mt: 0.5 }}>{empProfile.departmentId.name}</Typography>
                    </Grid>
                  )}
                  {empProfile?.designationId && (
                    <Grid size={6}>
                      <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Designation</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: "#1F2937", mt: 0.5 }}>{empProfile.designationId.name}</Typography>
                    </Grid>
                  )}
                  {empProfile?.managerId && (
                    <Grid size={6}>
                      <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Manager</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: "#1F2937", mt: 0.5 }}>
                        {empProfile.managerId.firstName} {empProfile.managerId.lastName}
                      </Typography>
                    </Grid>
                  )}
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Phone Number</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#1F2937", mt: 0.5 }}>{empProfile?.phone || "—"}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Gender</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#1F2937", mt: 0.5 }}>{empProfile?.gender || "—"}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Date of Birth</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#1F2937", mt: 0.5 }}>
                      {empProfile?.dateOfBirth ? new Date(empProfile.dateOfBirth).toLocaleDateString(undefined, { dateStyle: "medium", timeZone: "UTC" }) : "—"}
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>Current Address</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#1F2937", mt: 0.5, lineHeight: 1.5 }}>
                      {empProfile?.currentAddress?.addressLine1 ? (
                        `${empProfile.currentAddress.addressLine1}, ${empProfile.currentAddress.city || ""}, ${empProfile.currentAddress.state || ""}, ${empProfile.currentAddress.countryCode || ""} ${empProfile.currentAddress.zip || ""}`
                      ) : "—"}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>

              {/* Documents */}
              <Card
                sx={{
                  p: 3.5,
                  borderRadius: 4,
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
                  backgroundColor: "#fff",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: "#111827", display: "flex", alignItems: "center", gap: 1 }}>
                  <DescriptionOutlinedIcon sx={{ color: "#6D5DF6" }} />
                  Documents
                </Typography>
                {(missingDocTypes || []).length > 0 && (
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                    Missing: <strong>{(missingDocTypes || []).join(", ")}</strong>
                  </Alert>
                )}
                {documentsLoading ? (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <CircularProgress size={24} sx={{ color: "#9CA3AF" }} />
                  </Box>
                ) : documents.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 2 }}>
                    <Typography variant="body2" sx={{ color: "#6B7280", mb: 2 }}>
                      No documents uploaded yet
                    </Typography>
                    {!isViewingOther && (
                      <Button
                        variant="outlined"
                        startIcon={<CloudUploadOutlinedIcon />}
                        onClick={() => { resetDocUploadForm(); setDocUploadDialogOpen(true); }}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          borderColor: "#D1D5DB",
                          color: "#374151",
                        }}
                      >
                        Upload Document
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {documents.map((doc, index) => (
                      <Box
                        key={doc.id || doc._id || index}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid #E5E7EB",
                          backgroundColor: "#F9FAFB",
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1F2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {doc.fileName}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
                              <Chip label={doc.documentType} size="small" variant="outlined" sx={{ fontSize: "0.65rem" }} />
                              {doc.isVerified ? (
                                <Chip label="Verified" size="small" sx={{ height: 18, fontSize: "0.65rem", backgroundColor: "#D1FAE5", color: "#065F46", fontWeight: 600 }} />
                              ) : (
                                <Chip icon={<HourglassEmptyOutlinedIcon sx={{ fontSize: "12px !important" }} />} label="Pending" size="small" sx={{ height: 18, fontSize: "0.65rem", backgroundColor: "#FEF3C7", color: "#92400E", fontWeight: 600 }} />
                              )}
                            </Box>
                          </Box>
                          <Button
                            size="small"
                            onClick={() => handleDocDownload(doc.id || doc._id)}
                            sx={{ minWidth: 32, p: 0.5, color: "#6D5DF6" }}
                          >
                            <DownloadOutlinedIcon fontSize="small" />
                          </Button>
                        </Box>
                      </Box>
                    ))}
                    {!isViewingOther && (
                      <Button
                        variant="outlined"
                        startIcon={<CloudUploadOutlinedIcon />}
                        onClick={() => { resetDocUploadForm(); setDocUploadDialogOpen(true); }}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          borderColor: "#D1D5DB",
                          color: "#374151",
                          mt: 0.5,
                        }}
                      >
                        Upload Document
                      </Button>
                    )}
                  </Box>
                )}
              </Card>

              {/* Emergency Contacts */}
              <Card
                sx={{
                  p: 3.5,
                  borderRadius: 4,
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
                  backgroundColor: "#fff",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 1 }}>
                    <ContactEmergencyOutlinedIcon sx={{ color: "#6D5DF6" }} />
                    Emergency Contacts
                  </Typography>
                  {!isViewingOther && (
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => ecDialog.open()}
                      sx={{ textTransform: "none", color: "#6D5DF6", fontWeight: 600 }}
                    >
                      Add
                    </Button>
                  )}
                </Box>

                {(empProfile?.emergencyContacts ?? []).length === 0 ? (
                  <Typography variant="body2" sx={{ color: "#9CA3AF", textAlign: "center", py: 2 }}>
                    No emergency contacts added yet
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {(empProfile!.emergencyContacts!).map((ec, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid #E5E7EB",
                          backgroundColor: "#F9FAFB",
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#1F2937" }}>{ec.name}</Typography>
                          <Typography variant="caption" sx={{ color: "#6B7280" }}>
                            {ec.relationship} · {ec.phone}
                          </Typography>
                        </Box>
                        {!isViewingOther && (
                          <IconButton
                            size="small"
                            onClick={() => { setEcDeleteTarget(idx); setEcDeleteConfirmOpen(true); }}
                            sx={{ color: "#9CA3AF", p: 0.3 }}
                          >
                            <DeleteOutlinedIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Card>
            </Box>
          </Grid>

          {/* Column 2 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, height: "100%" }}>
              {/* System Credentials & Organization */}
              {!isViewingOther && (
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
              )}

              {/* Bank Account */}
              <Card
                sx={{
                  p: 3.5,
                  borderRadius: 4,
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
                  backgroundColor: "#fff",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: "#111827", display: "flex", alignItems: "center", gap: 1 }}>
                  <AccountBalanceOutlinedIcon sx={{ color: "#6D5DF6" }} />
                  Bank Accounts
                </Typography>
                {bankAccountsLoading ? (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <CircularProgress size={24} sx={{ color: "#9CA3AF" }} />
                  </Box>
                ) : bankAccounts.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 2 }}>
                    <Typography variant="body2" sx={{ color: "#6B7280", mb: 2 }}>
                      No bank account added yet
                    </Typography>
                    {!isViewingOther && (
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => { resetBankForm(); setBankDialogOpen(true); }}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          borderColor: "#D1D5DB",
                          color: "#374151",
                        }}
                      >
                        Add Bank Account
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {bankAccounts.map((acc, index) => (
                      <Box
                        key={acc.id || acc._id || index}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid #E5E7EB",
                          backgroundColor: "#F9FAFB",
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#1F2937" }}>
                            {acc.bankName}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            {acc.isPrimary && (
                              <Chip
                                label="Primary"
                                size="small"
                                sx={{ height: 18, fontSize: "0.65rem", backgroundColor: "#D1FAE5", color: "#065F46", fontWeight: 600 }}
                              />
                            )}
                            {!isViewingOther && (
                              <IconButton
                                size="small"
                                onClick={() => { setBankError(null); setBankDeleteTarget(acc); }}
                                sx={{ color: "#9CA3AF", p: 0.3 }}
                              >
                                <DeleteOutlinedIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                        <Typography variant="caption" sx={{ color: "#6B7280", fontFamily: "monospace" }}>
                          {acc.accountNumber}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                          <Chip label={acc.ifscCode} size="small" variant="outlined" sx={{ fontSize: "0.65rem", fontFamily: "monospace" }} />
                          <Chip label={acc.accountType} size="small" variant="outlined" sx={{ fontSize: "0.65rem" }} />
                        </Box>
                      </Box>
                    ))}
                    {!isViewingOther && (
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => { resetBankForm(); setBankDialogOpen(true); }}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          borderColor: "#D1D5DB",
                          color: "#374151",
                          mt: 1,
                        }}
                      >
                        Add Bank Account
                      </Button>
                    )}
                  </Box>
                )}
              </Card>

              {/* Account Activity Logs */}
              {!isViewingOther && (
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
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

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

      {/* Success Snackbar */}
      <Snackbar
        open={bankSuccess}
        autoHideDuration={4000}
        onClose={() => setBankSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ borderRadius: 2 }} onClose={() => setBankSuccess(false)}>
          Bank account added successfully
        </Alert>
      </Snackbar>

      {/* Delete Bank Account Success Snackbar */}
      <Snackbar
        open={bankDeleteSuccess}
        autoHideDuration={4000}
        onClose={() => setBankDeleteSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ borderRadius: 2 }} onClose={() => setBankDeleteSuccess(false)}>
          Bank account deleted successfully
        </Alert>
      </Snackbar>

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

      {/* Document Upload Success Snackbar */}
      <Snackbar
        open={docUploadSuccess}
        autoHideDuration={4000}
        onClose={() => setDocUploadSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ borderRadius: 2 }} onClose={() => setDocUploadSuccess(false)}>
          Document uploaded — awaiting HR verification
        </Alert>
      </Snackbar>
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

      {/* Edit Profile Success Snackbar */}
      <Snackbar
        open={editProfileSuccess}
        autoHideDuration={4000}
        onClose={() => setEditProfileSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ borderRadius: 2 }} onClose={() => setEditProfileSuccess(false)}>
          Personal details and address updated successfully
        </Alert>
      </Snackbar>

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

      {/* Emergency Contact Action Snackbar */}
      <Snackbar
        open={ecSuccessOpen}
        autoHideDuration={3000}
        onClose={() => setEcSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ borderRadius: 2 }} onClose={() => setEcSuccessOpen(false)}>
          {ecSuccessMessage}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default ProfileView;
