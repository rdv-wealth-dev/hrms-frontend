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
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";

import DashboardLayout from "../../layouts/dashboard/DashboardLayout";

import type { AppDispatch } from "../../store/store";
import type { RootState } from "../../store/rootReducer";
import type { Department } from "../../auth/types";

import {
    listDepartmentsRequest,
    getDepartmentByIdRequest,
    createDepartmentRequest,
    updateDepartmentRequest,
    clearSelectedDepartment,
    clearDepartmentError,
} from "../../store/department";

// ✅ Permission check helper — only HR and SUPER_ADMIN can create/update
const canManage = (role?: string) =>
    role === "HR" || role === "SUPER_ADMIN";

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
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>
                {mode === "create" ? "Create Department" : "Update Department"}
            </DialogTitle>

            <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 1 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    label="Department Name"
                    value={name}
                    onChange={(e) => setName(e.target.value ?? "")}
                    fullWidth
                    size="small"
                    placeholder="e.g. Engineering"
                    required
                />

                <TextField
                    label="Code"
                    value={code}
                    onChange={(e) => setCode((e.target.value ?? "").toUpperCase())}
                    fullWidth
                    size="small"
                    placeholder="e.g. ENG"
                    required
                    slotProps={{
                        htmlInput: {
                            maxLength: 20,
                        },
                    }}
                />

                <TextField
                    label="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value ?? "")}
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    placeholder="Brief description of this department"
                />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={submitting} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={submitting || !name?.trim() || !code?.trim()}
                    variant="contained"
                    sx={{ backgroundColor: "#6D5DF6", "&:hover": { backgroundColor: "#5B4BEA" } }}
                >
                    {submitting ? <CircularProgress size={18} color="inherit" /> : mode === "create" ? "Create" : "Update"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ============================================================
// Get By ID Dialog
// ============================================================

type GetByIdDialogProps = {
    open: boolean;
    loading: boolean;
    department: Department | null;
    error: string | null;
    onClose: () => void;
    onSearch: (id: string) => void;
};

function GetByIdDialog({
    open,
    loading,
    department,
    error,
    onClose,
    onSearch,
}: GetByIdDialogProps) {
    const [id, setId] = useState("");

    useEffect(() => {
        if (!open) setId("");
    }, [open]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Get Department by ID</DialogTitle>

            <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                        label="Department ID"
                        value={id}
                        onChange={(e) => setId(e.target.value ?? "")}
                        fullWidth
                        size="small"
                        placeholder="Paste department _id here"
                    />
                    <IconButton
                        onClick={() => { if (id?.trim()) onSearch(id.trim()); }}
                        disabled={loading || !id?.trim()}
                        sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}
                    >
                        <SearchIcon />
                    </IconButton>
                </Box>

                {loading && <CircularProgress size={24} sx={{ alignSelf: "center" }} />}

                {error && <Alert severity="error">{error}</Alert>}

                {!loading && department && (
                    <Box sx={{ backgroundColor: "#F5F6FA", borderRadius: 2, p: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            {department.name ?? ""} ({department.code ?? ""})
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                            ID: {department._id ?? ""}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                            Description: {department.description ?? "—"}
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                        >
                            Active: {department.isActive ? "Yes" : "No"}
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} color="inherit">Close</Button>
            </DialogActions>
        </Dialog>
    );
}

// ============================================================
// Main Department View
// ============================================================

function DepartmentView() {
    const dispatch = useDispatch<AppDispatch>();

    const { departments, selectedDepartment, loading, submitting, error, total } =
        useSelector((state: RootState) => state.department ?? {
            departments: [],
            selectedDepartment: null,
            loading: false,
            submitting: false,
            error: null,
            total: 0,
        });

    const user = useSelector((state: RootState) => state.auth?.user);
    const branchId = user?.branchIds?.[0] ?? "";
    const userCanManage = canManage(user?.role);

    const [createOpen, setCreateOpen] = useState(false);
    const [createHROpen, setCreateHROpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [getByIdOpen, setGetByIdOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Department | null>(null);

    // Load on mount
    useEffect(() => {
        dispatch(listDepartmentsRequest());
    }, [dispatch]);

    // Close create dialog on success
    useEffect(() => {
        if (!submitting && !error) {
            setCreateOpen(false);
            setCreateHROpen(false);
            setUpdateOpen(false);
        }
    }, [submitting, error]);

    const handleCreate = (data: {
        name: string;
        code: string;
        description: string;
        branchId: string;
    }) => {
        dispatch(createDepartmentRequest({ ...data, branchId }));
    };

    const handleUpdate = (data: {
        name: string;
        code: string;
        description: string;
    }) => {
        if (!editTarget?._id) return;
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
        dispatch(clearDepartmentError());
        setUpdateOpen(true);
    };

    const handleGetById = (id: string) => {
        dispatch(getDepartmentByIdRequest(id));
    };

    return (
        <DashboardLayout>
            <Box sx={{ p: { xs: 2, md: 4 } }}>
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
                    {userCanManage && (
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    dispatch(clearDepartmentError());
                                    setCreateHROpen(true);
                                }}
                                sx={{ borderRadius: 2, textTransform: "none" }}
                            >
                                Create Dept (HR)
                            </Button>

                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => {
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

                {/* Get By ID Button — visible to everyone */}
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant="text"
                        size="small"
                        startIcon={<SearchIcon />}
                        onClick={() => {
                            dispatch(clearSelectedDepartment());
                            dispatch(clearDepartmentError());
                            setGetByIdOpen(true);
                        }}
                        sx={{ textTransform: "none", color: "#6D5DF6" }}
                    >
                        Get Department by ID
                    </Button>
                </Box>

                {/* Error Banner */}
                {error && !createOpen && !createHROpen && !updateOpen && (
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
                                    {userCanManage && (
                                        <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Actions</TableCell>
                                    )}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {(departments ?? []).length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={userCanManage ? 5 : 4} align="center">
                                            <Box sx={{ py: 6 }}>
                                                <ApartmentOutlinedIcon
                                                    sx={{ fontSize: 48, color: "#D1D5DB", mb: 1 }}
                                                />
                                                <Typography variant="body2" color="text.secondary">
                                                    No departments yet.
                                                    {userCanManage ? " Click \"Create Department\" to add one." : ""}
                                                </Typography>
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
                                            {userCanManage && (
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
                onClose={() => { setCreateOpen(false); dispatch(clearDepartmentError()); }}
                onSubmit={handleCreate}
            />

            {/* Create Department HR Dialog */}
            <DeptFormDialog
                open={createHROpen}
                mode="create"
                initial={{ name: "Human Resources", code: "HR", description: "HR department" }}
                branchId={branchId}
                submitting={submitting}
                error={createHROpen ? (error ?? null) : null}
                onClose={() => { setCreateHROpen(false); dispatch(clearDepartmentError()); }}
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
                    setEditTarget(null);
                    dispatch(clearDepartmentError());
                }}
                onSubmit={handleUpdate}
            />

            {/* Get By ID Dialog */}
            <GetByIdDialog
                open={getByIdOpen}
                loading={loading}
                department={selectedDepartment}
                error={getByIdOpen ? (error ?? null) : null}
                onClose={() => {
                    setGetByIdOpen(false);
                    dispatch(clearSelectedDepartment());
                    dispatch(clearDepartmentError());
                }}
                onSearch={handleGetById}
            />
        </DashboardLayout>
    );
}

export default DepartmentView;