import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { isAxiosError } from "axios";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";

import type { RootState } from "../../../../store/rootReducer";
import type { EmployeeListItem } from "../../../../store/employee/employee.types";
import { listUsers, updateUserRole, type UserAccountData } from "../../../../api/user.api";
import { ROLES } from "../../../../utils/roles";

type ManageRoleDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  employee: EmployeeListItem | null;
};

const ROLE_LABELS: Record<string, string> = {
  [ROLES.ORG_ADMIN]: "Organization Admin",
  [ROLES.HR_ADMIN]: "HR Admin",
  [ROLES.BRANCH_ADMIN]: "Branch Admin",
  [ROLES.LEADERSHIP]: "Leadership",
  [ROLES.MANAGER]: "Manager",
  [ROLES.PRODUCT_MANAGER]: "Product Manager",
  TEAM_LEADER: "Team Leader",
  [ROLES.EMPLOYEE]: "Employee",
};

const inputFieldSx = {
  "& .MuiOutlinedInput-root": {
    height: 44,
    borderRadius: "12px",
    backgroundColor: "#F8FAFC",
    fontSize: "14px",
    color: "#0F172A",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused": {
      backgroundColor: "#FFFFFF",
      "& fieldset": { borderColor: "#6D5DF6", borderWidth: "2px" },
    },
  },
  "& .MuiOutlinedInput-input": {
    height: 44,
    py: 0,
    px: "14px",
    fontSize: "14px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#475569",
    opacity: 1,
    fontSize: "13.5px",
    fontWeight: 500,
  },
  "& .MuiSelect-select": {
    height: "44px !important",
    minHeight: "44px !important",
    py: "0 !important",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
  },
};

const disabledMenuItemSx = {
  color: "#334155 !important",
  fontWeight: 600,
  "&.Mui-disabled": {
    opacity: "1 !important",
    color: "#334155 !important",
  },
};

export default function ManageRoleDialog({
  open,
  onClose,
  onSuccess,
  employee,
}: ManageRoleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [userAccount, setUserAccount] = useState<UserAccountData | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const currentUser = useSelector((state: RootState) => state.auth?.user);

  useEffect(() => {
    if (!open || !employee) return;

    let isMounted = true;
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      setUserAccount(null);
      setSelectedRole("");
      try {
        const users = await listUsers();
        if (!isMounted) return;

        const matched = users.find((u) => {
          const uEmpId = typeof u.employeeId === "object" ? (u.employeeId as any)?._id : u.employeeId;
          const targetEmpId = typeof employee._id === "object" ? (employee._id as any)?._id : employee._id;

          const empIdMatch = Boolean(uEmpId && targetEmpId && String(uEmpId) === String(targetEmpId));
          const emailMatch = Boolean(
            u.email && employee.email && u.email.trim().toLowerCase() === employee.email.trim().toLowerCase()
          );

          return empIdMatch || emailMatch;
        });

        if (matched) {
          setUserAccount(matched);
          setSelectedRole(matched.role || "");
        } else {
          setError("No system user account found for this employee.");
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const message = isAxiosError<{ message?: string }>(err)
          ? err.response?.data?.message ?? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load user account";
        setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [open, employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = userAccount?._id || (userAccount as any)?.id;
    if (!userId || !selectedRole) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await updateUserRole(userId, selectedRole);
      if (response.succeeded) {
        setSuccess(response.message || "Role updated successfully!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
      } else {
        setError(response.message || "Failed to update role");
      }
    } catch (err: unknown) {
      const message = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message ?? err.message
        : err instanceof Error
          ? err.message
          : "Something went wrong while updating the role";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const currentUserId = currentUser?.id || (currentUser as any)?._id;
  const targetUserId = userAccount ? (userAccount._id || (userAccount as any)?.id) : null;
  const isSelf = Boolean(currentUserId && targetUserId && String(currentUserId) === String(targetUserId));
  const isOrgAdmin = userAccount ? userAccount.role === ROLES.ORG_ADMIN : false;

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(15, 23, 42, 0.45)",
          },
        },
        paper: {
          sx: {
            borderRadius: "20px",
            p: 3,
            backgroundColor: "#FFFFFF",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid #E2E8F0",
          },
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          p: 0,
          mb: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#0F172A" }}>
          Manage System Role
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          disabled={submitting}
          sx={{
            color: "#64748B",
            borderRadius: "10px",
            "&:hover": { backgroundColor: "#F1F5F9", color: "#0F172A" },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 0, pr: 2, mr: -1, display: "flex", flexDirection: "column", gap: 2 }}>
          {error && <Alert severity="error" sx={{ borderRadius: "10px" }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ borderRadius: "10px" }}>{success}</Alert>}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} sx={{ color: "#6D5DF6" }} />
            </Box>
          ) : (
            employee && (
              <>
                <Box sx={{ p: 2, borderRadius: "12px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px", mb: 0.5 }}>
                    Employee Profile
                  </Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
                    {employee.firstName} {employee.lastName} ({employee.employeeCode})
                  </Typography>
                  <Typography sx={{ fontSize: "13px", color: "#64748B" }}>
                    {employee.email}
                  </Typography>
                </Box>

                {userAccount && (
                  <>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
                        Current Role:
                      </Typography>
                      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#6D5DF6" }}>
                        {ROLE_LABELS[userAccount.role] || userAccount.role}
                      </Typography>
                    </Box>

                    {isSelf && (
                      <Alert severity="warning" sx={{ borderRadius: "10px", fontSize: "13px" }}>
                        You cannot change your own role to prevent self-lockout.
                      </Alert>
                    )}

                    {isOrgAdmin && (
                      <Alert severity="warning" sx={{ borderRadius: "10px", fontSize: "13px" }}>
                        The Organization Admin account role cannot be demoted.
                      </Alert>
                    )}

                    <Box>
                      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", mb: 0.8 }}>
                        Assign New System Role
                      </Typography>
                      <TextField
                        select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        fullWidth
                        size="small"
                        required
                        disabled={submitting || isSelf || isOrgAdmin}
                        sx={inputFieldSx}
                        slotProps={{ select: { displayEmpty: true } }}
                      >
                        <MenuItem value="" disabled sx={disabledMenuItemSx}>
                          Choose role to assign
                        </MenuItem>
                        {Object.entries(ROLE_LABELS).map(([value, label]) => {
                          if (value === ROLES.ORG_ADMIN) return null;
                          return (
                            <MenuItem key={value} value={value}>
                              {label}
                            </MenuItem>
                          );
                        })}
                      </TextField>
                    </Box>
                  </>
                )}
              </>
            )
          )}
        </DialogContent>

        <DialogActions sx={{ p: 0, mt: 3, display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button
            onClick={onClose}
            disabled={submitting}
            sx={{
              height: 44,
              borderRadius: "12px",
              px: 2.5,
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: "#F1F5F9",
              color: "#475569",
              "&:hover": { backgroundColor: "#E2E8F0", color: "#0F172A" },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || loading || !userAccount || isSelf || isOrgAdmin}
            variant="contained"
            sx={{
              height: 44,
              borderRadius: "12px",
              px: 3,
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: "#6D5DF6",
              boxShadow: "0 4px 12px rgba(109, 93, 246, 0.25)",
              "&:hover": { backgroundColor: "#5B4EB3" },
            }}
          >
            {submitting ? <CircularProgress size={18} color="inherit" /> : "Update Role"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
