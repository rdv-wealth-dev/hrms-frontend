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

        // Find user by employeeId or email
        const matched = users.find(
          (u) =>
            u.employeeId === employee._id ||
            u.email.toLowerCase() === employee.email.toLowerCase()
        );

        if (matched) {
          setUserAccount(matched);
          setSelectedRole(matched.role);
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
    if (!userAccount || !selectedRole) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await updateUserRole(userAccount._id, selectedRole);
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

  const isSelf = userAccount ? userAccount._id === currentUser?.id : false;
  const isOrgAdmin = userAccount ? userAccount.role === ROLES.ORG_ADMIN : false;

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="manage-role-title"
    >
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography
          id="manage-role-title"
          variant="h6"
          component="h2"
          sx={{ fontWeight: 700, color: "#111827" }}
        >
          Manage System Role
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          disabled={submitting}
          aria-label="Close dialog"
          sx={{ color: "#9CA3AF" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 3 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={30} sx={{ color: "#6D5DF6" }} />
            </Box>
          ) : (
            employee && (
              <>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Employee Profile
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {employee.firstName} {employee.lastName} ({employee.employeeCode})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: {employee.email}
                  </Typography>
                </Box>

                {userAccount && (
                  <>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                        Current Assigned Role
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ROLE_LABELS[userAccount.role] || userAccount.role}
                      </Typography>
                    </Box>

                    {isSelf && (
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        You cannot change your own role to prevent lockout or self-privilege modification.
                      </Alert>
                    )}

                    {isOrgAdmin && (
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        The Organization Admin account role cannot be reassigned or demoted.
                      </Alert>
                    )}

                    <TextField
                      select
                      label="Assign System Role"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      fullWidth
                      size="small"
                      required
                      disabled={submitting || isSelf || isOrgAdmin}
                    >
                      {Object.entries(ROLE_LABELS).map(([value, label]) => {
                        // Prevent assigning ORG_ADMIN role via this dialog
                        if (value === ROLES.ORG_ADMIN) return null;
                        return (
                          <MenuItem key={value} value={value}>
                            {label}
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  </>
                )}
              </>
            )
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={submitting} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || loading || !userAccount || isSelf || isOrgAdmin}
            variant="contained"
            sx={{
              backgroundColor: "#6D5DF6",
              "&:hover": { backgroundColor: "#5B4BEA" },
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : "Update Role"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
