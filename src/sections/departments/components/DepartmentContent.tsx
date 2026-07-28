import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import TextInput from "../../../components/input/TextInput";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import type { Department } from "../../../auth/types";
import { usePermissions } from "../../../hooks/usePermissions";

import {
    listDepartmentsRequest,
    createDepartmentRequest,
    updateDepartmentRequest,
    clearDepartmentError,
} from "../../../store/department";

// ============================================================
// Create / Update Form Dialog
// ============================================================

type DeptFormProps = {
    open: boolean;
    mode: "create" | "update";
    initial?: Partial<Department>;
    branchId: string;
    submitting: boolean;
    error: string | null;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        code: string;
        description: string;
        branchId: string;
    }) => void;
};

function DeptFormDialog({
    open,
    mode,
    initial,
    branchId,
    submitting,
    error,
    onClose,
    onSubmit,
}: DeptFormProps) {
    const [name, setName] = useState(initial?.name ?? "");
    const [code, setCode] = useState(initial?.code ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");

    useEffect(() => {
        if (open) {
            setName(initial?.name ?? "");
            setCode(initial?.code ?? "");
            setDescription(initial?.description ?? "");
        }
    }, [open, initial]);

    const handleSubmit = () => {
        if (!name?.trim() || !code?.trim()) return;
        onSubmit({
            name: name.trim(),
            code: code.trim().toUpperCase(),
            description: description?.trim() ?? "",
            branchId,
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
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
                        backgroundColor: "#FFFFFF",
                        boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
                        border: "1px solid #E2E8F0",
                        mx: { xs: 2, sm: "auto" },
                        width: { xs: "calc(100% - 32px)", sm: "100%" },
                    },
                },
            }}
        >
            <DialogTitle sx={{ p: 0, mb: 2, fontWeight: 800, fontSize: { xs: "1.15rem", sm: "1.3rem" }, color: "#0F172A" }}>
                {mode === "create" ? "Create Department" : "Update Department"}
            </DialogTitle>

            <DialogContent
                sx={{
                    p: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                }}
            >
                {error && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                <TextInput
                    label="Department Name"
                    value={name}
                    onChange={(e) => setName(e.target.value ?? "")}
                    placeholder="e.g. Engineering"
                    required
                    slotProps={{
                        htmlInput: {
                            maxLength: 20,
                        },
                    }}
                />

                <TextInput
                    label="Code"
                    value={code}
                    onChange={(e) => setCode((e.target.value ?? "").toUpperCase())}
                    placeholder="e.g. ENG"
                    required
                    slotProps={{
                        htmlInput: {
                            maxLength: 20,
                        },
                    }}
                />

                <TextInput
                    multiline
                    rows={3}
                    label="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value ?? "")}
                    placeholder="Brief description of this department"
                />
            </DialogContent>

            <DialogActions sx={{ p: 0, mt: 3, display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
                <Button
                    onClick={onClose}
                    disabled={submitting}
                    sx={{
                        height: 42,
                        borderRadius: "10px",
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
                    onClick={handleSubmit}
                    disabled={submitting || !name?.trim() || !code?.trim()}
                    variant="contained"
                    sx={{
                        height: 42,
                        borderRadius: "10px",
                        px: 3,
                        fontSize: "14px",
                        fontWeight: 600,
                        textTransform: "none",
                        backgroundColor: "#6D5DF6",
                        boxShadow: "0 2px 8px rgba(109, 93, 246, 0.25)",
                        "&:hover": { backgroundColor: "#5B4BEA" },
                    }}
                >
                    {submitting ? <CircularProgress size={18} color="inherit" /> : mode === "create" ? "Create" : "Update"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ============================================================
// Department Content — layout-agnostic, embeddable anywhere
// ============================================================

function DepartmentContent() {
    const dispatch = useDispatch<AppDispatch>();

    const { departments, loading, submitting, error, total } =
        useSelector((state: RootState) => state.department ?? {
            departments: [],
            loading: false,
            submitting: false,
            error: null,
            total: 0,
        });

    const user = useSelector((state: RootState) => state.auth?.user);
    const branchId = user?.branchIds?.[0] ?? "";
    
    const { hasPermission } = usePermissions();
    const canCreate = hasPermission("department.create");
    const canUpdate = hasPermission("department.update");

    const [createOpen, setCreateOpen] = useState(false);
    const [hasSubmittedCreate, setHasSubmittedCreate] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [hasSubmittedUpdate, setHasSubmittedUpdate] = useState(false);
    const [editTarget, setEditTarget] = useState<Department | null>(null);

    // Load on mount
    useEffect(() => {
        dispatch(listDepartmentsRequest());
    }, [dispatch]);

    // Only close "Create" dialog after an actual submit succeeded
    useEffect(() => {
        if (hasSubmittedCreate && !submitting && !error && createOpen) {
            setCreateOpen(false);
            setHasSubmittedCreate(false);
            dispatch(listDepartmentsRequest());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submitting, error, hasSubmittedCreate]);

    // Only close "Update" dialog after an actual submit succeeded
    useEffect(() => {
        if (hasSubmittedUpdate && !submitting && !error && updateOpen) {
            setUpdateOpen(false);
            setHasSubmittedUpdate(false);
            setEditTarget(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submitting, error, hasSubmittedUpdate]);

    const handleCreate = (data: {
        name: string;
        code: string;
        description: string;
        branchId: string;
    }) => {
        setHasSubmittedCreate(true);
        dispatch(createDepartmentRequest({ ...data, branchId }));
    };

    const handleUpdate = (data: {
        name: string;
        code: string;
        description: string;
    }) => {
        if (!editTarget?._id) return;
        setHasSubmittedUpdate(true);
        dispatch(
            updateDepartmentRequest({
                id: editTarget._id,
                data: {
                    name: data.name,
                    code: data.code,
                    description: data.description,
                },
            })
        );
    };

    const openEdit = (dept: Department) => {
        setEditTarget(dept);
        setHasSubmittedUpdate(false);
        dispatch(clearDepartmentError());
        setUpdateOpen(true);
    };

    return (
        <>
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                {/* Page Header */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 2,
                        mb: 3,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <ApartmentOutlinedIcon
                            sx={{ fontSize: 32, color: "#6D5DF6" }}
                        />
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
                                Departments
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {total > 0 ? `${total} department${total !== 1 ? "s" : ""}` : "Manage your organisation's departments"}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Action Buttons — only for HR/SUPER_ADMIN */}
                    {canCreate && (
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    setHasSubmittedCreate(false);
                                    dispatch(clearDepartmentError());
                                    setCreateOpen(true);
                                }}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    backgroundColor: "#6D5DF6",
                                    "&:hover": { backgroundColor: "#5B4BEA" },
                                }}
                            >
                                Create Department
                            </Button>
                        </Box>
                    )}
                </Box>

                {/* Error Banner */}
                {error && !createOpen && !updateOpen && (
                    <Alert
                        severity="error"
                        onClose={() => dispatch(clearDepartmentError())}
                        sx={{ mb: 2 }}
                    >
                        {error}
                    </Alert>
                )}


                {/* Department Table */}
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer
                        component={Paper}
                        sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Code</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Description</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Status</TableCell>
                                    {canUpdate && (
                                        <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Actions</TableCell>
                                    )}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {(departments ?? []).length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={canUpdate ? 5 : 4} align="center">
                                            <Box sx={{ py: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                                                <ApartmentOutlinedIcon
                                                    sx={{ fontSize: 54, color: "#9CA3AF" }}
                                                />
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#111827" }}>
                                                    No Departments Configured Yet
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
                                                    Click "Create Department" to set up your organization's first department.
                                                </Typography>
                                                {canCreate && (
                                                    <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
                                                        <Button
                                                            variant="contained"
                                                            onClick={() => setCreateOpen(true)}
                                                            startIcon={<AddIcon />}
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: "none",
                                                                fontWeight: 600,
                                                                backgroundColor: "#6D5DF6",
                                                                "&:hover": { backgroundColor: "#5B4BEA" },
                                                            }}
                                                        >
                                                            Create Department
                                                        </Button>
                                                    </Box>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    (departments ?? []).map((dept) => (
                                        <TableRow
                                            key={dept?._id ?? Math.random()}
                                            hover
                                            sx={{ "&:last-child td": { border: 0 } }}
                                        >
                                            <TableCell sx={{ fontWeight: 500, fontSize: 14 }}>
                                                {dept?.name ?? "—"}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={dept?.code ?? ""}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: "#EEF2FF",
                                                        color: "#6D5DF6",
                                                        fontWeight: 600,
                                                        fontSize: 12,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: "#6B7280", fontSize: 13 }}>
                                                {dept?.description || "—"}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={dept?.isActive ? "Active" : "Inactive"}
                                                    size="small"
                                                    color={dept?.isActive ? "success" : "default"}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            {canUpdate && (
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => openEdit(dept)}
                                                        sx={{ color: "#6D5DF6" }}
                                                    >
                                                        <EditOutlinedIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            {/* Create Department Dialog */}
            <DeptFormDialog
                open={createOpen}
                mode="create"
                branchId={branchId}
                submitting={submitting}
                error={createOpen ? (error ?? null) : null}
                onClose={() => {
                    setCreateOpen(false);
                    setHasSubmittedCreate(false);
                    dispatch(clearDepartmentError());
                }}
                onSubmit={handleCreate}
            />

            {/* Update Department Dialog */}

            <DeptFormDialog
                open={updateOpen}
                mode="update"
                initial={editTarget ?? {}}
                branchId={branchId}
                submitting={submitting}
                error={updateOpen ? (error ?? null) : null}
                onClose={() => {
                    setUpdateOpen(false);
                    setHasSubmittedUpdate(false);
                    setEditTarget(null);
                    dispatch(clearDepartmentError());
                }}
                onSubmit={handleUpdate}
            />
        </>
    );
}

export default DepartmentContent;
