import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Chip from "@mui/material/Chip";
import { isAxiosError } from "axios";

import PermissionMatrix from "@/components/permission/PermissionMatrix";
import {
  getSystemPermissions,
  createRole,
  updateRole,
  type RoleItem,
  type SystemPermissionItem,
} from "@/api/role.api";
import { roleFormSchema } from "@/validations/role/role.schema";

interface RoleFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  role: RoleItem | null;
  readOnly?: boolean;
}

const inputFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#F8FAFC",
    fontSize: "14px",
    color: "text.primary",
    "& fieldset": { borderColor: "divider" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused": {
      backgroundColor: "#FFFFFF",
      "& fieldset": { borderColor: "primary.main", borderWidth: "2px" },
    },
  },
};

export default function RoleFormDialog({
  open,
  onClose,
  onSuccess,
  role,
  readOnly = false,
}: RoleFormDialogProps) {
  const isEditing = Boolean(role && !readOnly);
  const isViewOnly = Boolean(readOnly || (role && role.isSystemRole && !isEditing));

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const [systemPermissions, setSystemPermissions] = useState<SystemPermissionItem[]>([]);
  const [groupedByModule, setGroupedByModule] = useState<Record<string, SystemPermissionItem[]>>({});
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-generate slug from name if creating
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && !slugManuallyEdited) {
      const generated = val
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      setSlug(generated);
    }
  };

  // Load system permissions when dialog opens
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    const fetchPerms = async () => {
      setLoadingPerms(true);
      setError(null);
      try {
        const res = await getSystemPermissions();
        if (isMounted && res?.data) {
          setSystemPermissions(res.data.permissions || []);
          setGroupedByModule(res.data.groupedByModule || {});
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = isAxiosError<{ message?: string }>(err)
          ? err.response?.data?.message || err.message
          : "Failed to load system permissions";
        setError(msg);
      } finally {
        if (isMounted) setLoadingPerms(false);
      }
    };

    fetchPerms();

    // Populate role data if editing or viewing
    if (role) {
      setName(role.name || "");
      setSlug(role.slug || "");
      setDescription(role.description || "");
      setSelectedPermissions(role.permissions || []);
      setSlugManuallyEdited(true);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setSelectedPermissions([]);
      setSlugManuallyEdited(false);
    }

    setSuccess(null);

    return () => {
      isMounted = false;
    };
  }, [open, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) return;

    // Validate with Zod
    const validation = roleFormSchema.safeParse({
      name,
      slug,
      description,
      permissions: selectedPermissions,
    });

    if (!validation.success) {
      const firstErr = validation.error.issues[0]?.message || "Please check form errors";
      setError(firstErr);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (isEditing && role) {
        const roleId = role._id || role.id || "";
        const res = await updateRole(roleId, {
          name: validation.data.name,
          description: validation.data.description,
          permissions: validation.data.permissions,
        });
        setSuccess(res.message || "Role updated successfully!");
      } else {
        const res = await createRole({
          name: validation.data.name,
          slug: validation.data.slug,
          description: validation.data.description,
          permissions: validation.data.permissions,
        });
        setSuccess(res.message || "Custom role created successfully!");
      }

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const msg = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
          ? err.message
          : "Something went wrong while saving the role";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="md"
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
            p: { xs: 2.5, sm: 3.5 },
            backgroundColor: "background.paper",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid",
            borderColor: "divider",
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ fontSize: "20px", fontWeight: 800, color: "text.primary" }}>
            {isViewOnly ? "View Role & Permissions" : isEditing ? "Edit Custom Role" : "Create Custom Role"}
          </Typography>
          {role?.isSystemRole && (
            <Chip
              label="System Default"
              size="small"
              sx={{
                fontSize: "11px",
                fontWeight: 700,
                backgroundColor: "rgba(109, 93, 246, 0.1)",
                color: "primary.main",
                borderRadius: "6px",
              }}
            />
          )}
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          disabled={submitting}
          sx={{
            color: "#64748B",
            borderRadius: "10px",
            "&:hover": { backgroundColor: "action.hover", color: "text.primary" },
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", flexGrow: 1, overflow: "hidden" }}
      >
        <DialogContent
          sx={{
            p: 0,
            pr: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          {error && <Alert severity="error" sx={{ borderRadius: "12px" }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ borderRadius: "12px" }}>{success}</Alert>}

          {/* Form Header Information */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "text.primary", mb: 0.8 }}>
                Role Name *
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Payroll Specialist"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={submitting || isViewOnly}
                required
                sx={inputFieldSx}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "text.primary", mb: 0.8 }}>
                Role Slug (Identifier) *
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. PAYROLL_SPECIALIST"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toUpperCase());
                  setSlugManuallyEdited(true);
                }}
                disabled={submitting || isEditing || isViewOnly}
                required
                helperText={!isEditing && !isViewOnly ? "Used in RBAC system logic (uppercase only)" : undefined}
                sx={inputFieldSx}
              />
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "text.primary", mb: 0.8 }}>
              Description
            </Typography>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="Explain the duties and scope of this role..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting || isViewOnly}
              sx={inputFieldSx}
            />
          </Box>

          {/* Permission Matrix Section */}
          <Box sx={{ pt: 1 }}>
            <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "text.primary", mb: 1.5 }}>
              Assigned System Permissions
            </Typography>

            {loadingPerms ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6 }}>
                <CircularProgress size={32} sx={{ color: "primary.main" }} />
              </Box>
            ) : (
              <PermissionMatrix
                permissions={systemPermissions}
                groupedByModule={groupedByModule}
                selectedPermissions={selectedPermissions}
                onChange={setSelectedPermissions}
                disabled={submitting}
                readOnly={isViewOnly}
              />
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 0,
            pt: 2.5,
            mt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
          }}
        >
          <Button
            onClick={onClose}
            disabled={submitting}
            sx={{
              height: 42,
              borderRadius: "12px",
              px: 2.5,
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: "#F1F5F9",
              color: "#475569",
              "&:hover": { backgroundColor: "action.hover", color: "text.primary" },
            }}
          >
            {isViewOnly ? "Close" : "Cancel"}
          </Button>

          {!isViewOnly && (
            <Button
              type="submit"
              disabled={submitting || loadingPerms || selectedPermissions.length === 0}
              variant="contained"
              sx={{
                height: 42,
                borderRadius: "12px",
                px: 3,
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "none",
                backgroundColor: "primary.main",
                boxShadow: "0 4px 12px rgba(109, 93, 246, 0.25)",
                "&:hover": { backgroundColor: "primary.dark" },
              }}
            >
              {submitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Role"
              )}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}
