import { useState, useEffect, useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { isAxiosError } from "axios";

import { listRoles, deleteRole, type RoleItem } from "@/api/role.api";
import { usePermissions } from "@/hooks/usePermissions";
import { useDebounce } from "@/hooks/useDebounce";
import { useDialog } from "@/hooks/useDialog";
import ConfirmDialog from "@/components/modal/ConfirmDialog";
import TableSkeleton from "@/components/table/TableSkeleton";
import TableEmptyState from "@/components/table/TableEmptyState";
import RoleFormDialog from "./RoleFormDialog";

export default function RolesListContent() {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("role.create");
  const canUpdate = hasPermission("role.update");

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 300);
  const [filterType, setFilterType] = useState<"ALL" | "SYSTEM" | "CUSTOM">("ALL");

  // Modals management
  const roleModal = useDialog<RoleItem | null>();
  const [isReadOnlyModal, setIsReadOnlyModal] = useState(false);
  const deleteModal = useDialog<RoleItem>();
  const [deleting, setDeleting] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listRoles();
      if (res?.data) {
        setRoles(res.data);
      }
    } catch (err: unknown) {
      const msg = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || err.message
        : "Failed to load roles list";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Filtered Roles computation
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch =
        !debouncedSearch ||
        role.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        role.slug?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        role.description?.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesType =
        filterType === "ALL" ||
        (filterType === "SYSTEM" && role.isSystemRole) ||
        (filterType === "CUSTOM" && !role.isSystemRole);

      return matchesSearch && matchesType;
    });
  }, [roles, debouncedSearch, filterType]);

  const systemRolesCount = useMemo(() => roles.filter((r) => r.isSystemRole).length, [roles]);
  const customRolesCount = useMemo(() => roles.filter((r) => !r.isSystemRole).length, [roles]);

  const handleOpenCreate = () => {
    setIsReadOnlyModal(false);
    roleModal.open(null);
  };

  const handleOpenEdit = (role: RoleItem) => {
    setIsReadOnlyModal(false);
    roleModal.open(role);
  };

  const handleOpenView = (role: RoleItem) => {
    setIsReadOnlyModal(true);
    roleModal.open(role);
  };

  const handleDeleteConfirm = async () => {
    const target = deleteModal.target;
    if (!target) return;

    const roleId = target._id || target.id || "";
    setDeleting(true);
    setError(null);
    try {
      const res = await deleteRole(roleId);
      setSuccess(res.message || `Role "${target.name}" deleted successfully`);
      deleteModal.close();
      await fetchRoles();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || err.message
        : "Failed to delete role";
      setError(msg);
      deleteModal.close();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
        maxWidth: { xs: "100%", sm: "880px", md: "960px", lg: "1020px" },
        mx: "auto",
        p: { xs: 1, sm: 2 },
      }}
    >
      {/* Top Header Card */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          p: { xs: 2, sm: 2.5 },
          borderRadius: "16px",
          backgroundColor: "#FFFFFF",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              p: 1.2,
              borderRadius: "12px",
              backgroundColor: "rgba(109, 93, 246, 0.1)",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SecurityOutlinedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "18px", fontWeight: 800, color: "text.primary" }}>
              Roles & Permissions
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#64748B" }}>
              Manage system permissions, access boundaries, and custom organizational roles
            </Typography>
          </Box>
        </Box>

        {canCreate && (
          <Button
            variant="contained"
            onClick={handleOpenCreate}
            startIcon={<AddIcon />}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "13.5px",
              px: 2.5,
              py: 1,
              backgroundColor: "primary.main",
              boxShadow: "0 4px 12px rgba(109, 93, 246, 0.25)",
              "&:hover": { backgroundColor: "primary.dark" },
              whiteSpace: "nowrap",
            }}
          >
            Create Custom Role
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: "12px" }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ borderRadius: "12px" }}>
          {success}
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: 1.5,
          p: 1.5,
          borderRadius: "14px",
          backgroundColor: "#FFFFFF",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <TextField
          size="small"
          placeholder="Search by role name, identifier, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            flexGrow: 1,
            maxWidth: { xs: "100%", md: 400 },
            "& .MuiOutlinedInput-root": {
              height: 40,
              borderRadius: "10px",
              backgroundColor: "#F8FAFC",
              fontSize: "13.5px",
              "& fieldset": { borderColor: "divider" },
              "&:hover fieldset": { borderColor: "#CBD5E1" },
              "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: "2px" },
            },
          }}
        />

        {/* Filter Badges */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflowX: "auto", py: 0.5 }}>
          <Chip
            label={`All Roles (${roles.length})`}
            clickable
            onClick={() => setFilterType("ALL")}
            sx={{
              height: 32,
              fontWeight: 700,
              fontSize: "12.5px",
              borderRadius: "8px",
              backgroundColor: filterType === "ALL" ? "primary.main" : "#F1F5F9",
              color: filterType === "ALL" ? "#FFFFFF" : "#475569",
              "&:hover": { backgroundColor: filterType === "ALL" ? "primary.dark" : "action.hover" },
            }}
          />
          <Chip
            label={`System (${systemRolesCount})`}
            clickable
            onClick={() => setFilterType("SYSTEM")}
            sx={{
              height: 32,
              fontWeight: 700,
              fontSize: "12.5px",
              borderRadius: "8px",
              backgroundColor: filterType === "SYSTEM" ? "primary.main" : "#F1F5F9",
              color: filterType === "SYSTEM" ? "#FFFFFF" : "#475569",
              "&:hover": { backgroundColor: filterType === "SYSTEM" ? "primary.dark" : "action.hover" },
            }}
          />
          <Chip
            label={`Custom (${customRolesCount})`}
            clickable
            onClick={() => setFilterType("CUSTOM")}
            sx={{
              height: 32,
              fontWeight: 700,
              fontSize: "12.5px",
              borderRadius: "8px",
              backgroundColor: filterType === "CUSTOM" ? "primary.main" : "#F1F5F9",
              color: filterType === "CUSTOM" ? "#FFFFFF" : "#475569",
              "&:hover": { backgroundColor: filterType === "CUSTOM" ? "primary.dark" : "action.hover" },
            }}
          />
        </Box>
      </Box>

      {/* Roles Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          overflow: "hidden",
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
            <TableRow>
              <TableCell sx={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                Role Name & Identifier
              </TableCell>
              <TableCell sx={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                Role Classification
              </TableCell>
              <TableCell sx={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                Permissions Scope
              </TableCell>
              <TableCell sx={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                Description
              </TableCell>
              <TableCell align="right" sx={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableSkeleton rows={5} columns={5} />
            ) : filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ p: 0 }}>
                  <TableEmptyState
                    title="No Roles Found"
                    description={
                      search
                        ? `No roles match your search term "${search}".`
                        : "No roles available under the selected filter."
                    }
                    isSearch={Boolean(search)}
                    onClearSearch={() => setSearch("")}
                    actionText={canCreate && !search ? "Create Custom Role" : undefined}
                    onAction={canCreate && !search ? handleOpenCreate : undefined}
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => {
                const roleId = role._id || role.id || role.slug;
                const isSystem = Boolean(role.isSystemRole);
                const permsCount = role.permissions?.length || 0;

                return (
                  <TableRow
                    key={roleId}
                    hover
                    sx={{
                      "&:hover": { backgroundColor: "#FAFAFE" },
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    {/* Name & Slug */}
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "10px",
                            backgroundColor: isSystem ? "rgba(109, 93, 246, 0.1)" : "rgba(16, 185, 129, 0.1)",
                            color: isSystem ? "primary.main" : "#10B981",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {isSystem ? <ShieldOutlinedIcon sx={{ fontSize: 19 }} /> : <SecurityOutlinedIcon sx={{ fontSize: 19 }} />}
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "text.primary" }}>
                            {role.name}
                          </Typography>
                          <Typography sx={{ fontSize: "11.5px", color: "#64748B", fontFamily: "monospace" }}>
                            {role.slug}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Classification */}
                    <TableCell>
                      <Chip
                        label={isSystem ? "System Default" : "Custom Role"}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: "11.5px",
                          fontWeight: 700,
                          backgroundColor: isSystem ? "rgba(109, 93, 246, 0.1)" : "rgba(16, 185, 129, 0.1)",
                          color: isSystem ? "primary.main" : "#059669",
                          borderRadius: "6px",
                        }}
                      />
                    </TableCell>

                    {/* Permissions Scope */}
                    <TableCell>
                      <Tooltip title={`${permsCount} total system permissions assigned`}>
                        <Chip
                          label={`${permsCount} permission${permsCount === 1 ? "" : "s"}`}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: "11.5px",
                            fontWeight: 700,
                            backgroundColor: "#F1F5F9",
                            color: "#334155",
                            borderRadius: "6px",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        />
                      </Tooltip>
                    </TableCell>

                    {/* Description */}
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: "#64748B",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {role.description || "—"}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                        <Tooltip title="View Permissions">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenView(role)}
                            sx={{
                              color: "#64748B",
                              borderRadius: "8px",
                              "&:hover": { backgroundColor: "primary.lighter", color: "primary.main" },
                            }}
                          >
                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>

                        {!isSystem && canUpdate && (
                          <Tooltip title="Edit Custom Role">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(role)}
                              sx={{
                                color: "#64748B",
                                borderRadius: "8px",
                                "&:hover": { backgroundColor: "primary.lighter", color: "primary.main" },
                              }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}

                        {!isSystem && canUpdate && (
                          <Tooltip title="Delete Custom Role">
                            <IconButton
                              size="small"
                              onClick={() => deleteModal.open(role)}
                              sx={{
                                color: "#64748B",
                                borderRadius: "8px",
                                "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.08)", color: "#EF4444" },
                              }}
                            >
                              <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Role Create / Edit / View Dialog */}
      <RoleFormDialog
        open={roleModal.isOpen}
        onClose={roleModal.close}
        onSuccess={fetchRoles}
        role={roleModal.target}
        readOnly={isReadOnlyModal}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteConfirm}
        title="Delete Custom Role"
        content={`Are you sure you want to delete the custom role "${deleteModal.target?.name}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete Role"}
        loading={deleting}
      />
    </Box>
  );
}
