import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TablePagination from "@mui/material/TablePagination";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import TextInput from "../../../components/input/TextInput";
import { CreateTeamDialog, TeamsListContent } from "../../teams";
import { VirtualizedTable } from "../../../components/table";
import DeleteBranchDepartmentsDialog from "./DeleteBranchDepartmentsDialog";
import DeleteSingleDepartmentDialog from "./DeleteSingleDepartmentDialog";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import type { Department } from "../../../auth/types";
import { usePermissions } from "../../../hooks/usePermissions";
import { useActiveBranchId } from "../../../hooks/useActiveBranchId";

import {
    listDepartmentsRequest,
    createDepartmentRequest,
    updateDepartmentRequest,
    clearDepartmentError,
} from "../../../store/department";
import { listBranchesRequest, getHeadOfficeRequest } from "../../../store/branch";

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
                        backgroundColor: "background.paper",
                        boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
                        border: "1px solid",
                        borderColor: "divider",
                        mx: { xs: 2, sm: "auto" },
                        width: { xs: "calc(100% - 32px)", sm: "100%" },
                    },
                },
            }}
        >
            <DialogTitle sx={{ p: 0, mb: 2, fontWeight: 800, fontSize: { xs: "1.15rem", sm: "1.3rem" }, color: "text.primary" }}>
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
                    label="Description"
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
                        backgroundColor: "action.hover",
                        color: "text.secondary",
                        "&:hover": { backgroundColor: "divider", color: "text.primary" },
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
                        backgroundColor: "primary.main",
                        boxShadow: "0 2px 8px rgba(109, 93, 246, 0.25)",
                        "&:hover": { backgroundColor: "primary.dark" },
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

    const branchId = useActiveBranchId();
    const [selectedBranchId, setSelectedBranchId] = useState<string>(branchId || "");
    
    const { hasPermission, canCreateTeam } = usePermissions();
    const canCreate = hasPermission("department.create");
    const canUpdate = hasPermission("department.update");

    const [activeTab, setActiveTab] = useState<"departments" | "teams">("departments");
    const [createOpen, setCreateOpen] = useState(false);
    const [createTeamOpen, setCreateTeamOpen] = useState(false);
    const [deleteBranchDeptsOpen, setDeleteBranchDeptsOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
    const [hasSubmittedCreate, setHasSubmittedCreate] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [hasSubmittedUpdate, setHasSubmittedUpdate] = useState(false);
    const [editTarget, setEditTarget] = useState<Department | null>(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        if (branchId && !selectedBranchId) {
            setSelectedBranchId(branchId);
        }
    }, [branchId, selectedBranchId]);

    // Load departments filtered by selected branch
    useEffect(() => {
        dispatch(listDepartmentsRequest({ pageNumber: 1, pageSize: 100, branchId: selectedBranchId || undefined }));
        dispatch(getHeadOfficeRequest());
        dispatch(listBranchesRequest());
    }, [dispatch, selectedBranchId]);

    // Only close "Create" dialog after an actual submit succeeded
    useEffect(() => {
        if (hasSubmittedCreate && !submitting && !error && createOpen) {
            setCreateOpen(false);
            setHasSubmittedCreate(false);
            dispatch(listDepartmentsRequest({ pageNumber: 1, pageSize: 100, branchId: selectedBranchId || undefined }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submitting, error, hasSubmittedCreate, selectedBranchId]);

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
        dispatch(createDepartmentRequest({
            ...data,
            branchId: data.branchId || selectedBranchId || branchId,
        }));
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
                        alignItems: { xs: "stretch", sm: "center" },
                        justifyContent: "space-between",
                        flexDirection: { xs: "column", sm: "row" },
                        flexWrap: "wrap",
                        gap: 2,
                        mb: 3,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <ApartmentOutlinedIcon
                            sx={{ fontSize: 32, color: "primary.main" }}
                        />
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
                            Departments
                        </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", width: { xs: "100%", sm: "auto" } }}>
                        {canUpdate && selectedBranchId && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteForeverOutlinedIcon />}
                                onClick={() => setDeleteBranchDeptsOpen(true)}
                                sx={{
                                    height: 40,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: "10px",
                                    px: 2.5,
                                    whiteSpace: "nowrap",
                                    width: { xs: "100%", sm: "auto" },
                                }}
                            >
                                Delete All Departments
                            </Button>
                        )}

                        {canCreateTeam && (
                            <Button
                                variant="outlined"
                                startIcon={<GroupsRoundedIcon />}
                                onClick={() => setCreateTeamOpen(true)}
                                sx={{
                                    height: 40,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: "10px",
                                    px: 2.5,
                                    borderColor: "primary.main",
                                    color: "primary.main",
                                    "&:hover": {
                                        backgroundColor: "primary.lighter",
                                        borderColor: "primary.dark",
                                    },
                                    width: { xs: "100%", sm: "auto" },
                                }}
                            >
                                Create Squad / Team
                            </Button>
                        )}

                        {canCreate && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setCreateOpen(true)}
                                sx={{
                                    height: 40,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: "10px",
                                    px: 2.5,
                                    backgroundColor: "primary.main",
                                    boxShadow: "0 2px 8px rgba(109, 93, 246, 0.25)",
                                    "&:hover": { backgroundColor: "primary.dark" },
                                    width: { xs: "100%", sm: "auto" },
                                }}
                            >
                                Add Department
                            </Button>
                        )}
                    </Box>
                </Box>

                {/* Tab Switcher */}
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, val) => setActiveTab(val)}
                        sx={{
                            "& .MuiTab-root": {
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: "14px",
                                minHeight: 44,
                                color: "text.secondary",
                                "&.Mui-selected": { color: "primary.main" },
                            },
                            "& .MuiTabs-indicator": {
                                backgroundColor: "primary.main",
                                height: 3,
                                borderRadius: "3px 3px 0 0",
                            },
                        }}
                    >
                        <Tab
                            icon={<ApartmentOutlinedIcon sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                            label={`Departments Overview (${total || 0})`}
                            value="departments"
                        />
                        <Tab
                            icon={<GroupsRoundedIcon sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                            label="Teams & Squads"
                            value="teams"
                        />
                    </Tabs>
                </Box>

                {activeTab === "teams" ? (
                    <TeamsListContent />
                ) : (
                    <>
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
                <VirtualizedTable<any>
                    data={(departments ?? []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
                    loading={loading}
                    maxHeight="none"
                    minWidth={600}
                    estimateRowHeight={52}
                    rowKey={(dept, index) => dept?._id || `dept-${index}`}
                    emptyState={
                        <Box sx={{ py: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                            <ApartmentOutlinedIcon sx={{ fontSize: 54, color: "#9CA3AF" }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                                No Departments Configured Yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, textAlign: "center" }}>
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
                                            backgroundColor: "primary.main",
                                            "&:hover": { backgroundColor: "primary.dark" },
                                        }}
                                    >
                                        Create Department
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    }
                    columns={[
                        {
                            id: "name",
                            header: "Name",
                            minWidth: 150,
                            sticky: "left",
                            cell: (dept) => (
                                <Typography sx={{ fontWeight: 500, fontSize: 14 }}>
                                    {dept?.name ?? "—"}
                                </Typography>
                            ),
                        },
                        {
                            id: "code",
                            header: "Code",
                            minWidth: 100,
                            cell: (dept) => (
                                <Chip
                                    label={dept?.code ?? ""}
                                    size="small"
                                    sx={{
                                        backgroundColor: "primary.lighter",
                                        color: "primary.main",
                                        fontWeight: 600,
                                        fontSize: 12,
                                    }}
                                />
                            ),
                        },
                        {
                            id: "description",
                            header: "Description",
                            minWidth: 200,
                            cell: (dept) => (
                                <Typography sx={{ color: "#6B7280", fontSize: 13 }}>
                                    {dept?.description || "—"}
                                </Typography>
                            ),
                        },
                        {
                            id: "status",
                            header: "Status",
                            minWidth: 100,
                            cell: (dept) => (
                                <Chip
                                    label={dept?.isActive ? "Active" : "Inactive"}
                                    size="small"
                                    color={dept?.isActive ? "success" : "default"}
                                    variant="outlined"
                                />
                            ),
                        },
                        ...(canUpdate
                            ? [
                                  {
                                      id: "actions",
                                      header: "Actions",
                                      minWidth: 100,
                                      align: "center" as const,
                                      sticky: "right" as const,
                                      cell: (dept: any) => (
                                          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                                              <IconButton
                                                  size="small"
                                                  onClick={() => openEdit(dept)}
                                                  sx={{ color: "primary.main" }}
                                                  title="Edit Department"
                                              >
                                                  <EditOutlinedIcon fontSize="small" />
                                              </IconButton>
                                              <IconButton
                                                  size="small"
                                                  onClick={() => setDeleteTarget(dept)}
                                                  sx={{ color: "error.main" }}
                                                  title="Delete Department"
                                              >
                                                  <DeleteOutlineOutlinedIcon fontSize="small" />
                                              </IconButton>
                                          </Box>
                                      ),
                                  },
                              ]
                            : []),
                    ]}
                />
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={(departments ?? []).length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    sx={{
                        borderTop: "1px solid",
                        borderColor: "divider",
                        color: "text.secondary",
                        "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                            fontSize: "13px",
                            fontWeight: 500,
                        },
                    }}
                />
                    </>
                )}
            </Box>

            {/* Create Department Dialog */}
            <DeptFormDialog
                open={createOpen}
                mode="create"
                branchId={selectedBranchId || branchId}
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

            {/* Create Team / Squad Dialog */}
            <CreateTeamDialog
                open={createTeamOpen}
                defaultBranchId={selectedBranchId || branchId}
                onClose={() => setCreateTeamOpen(false)}
            />

            {/* Delete All Branch Departments Dialog */}
            <DeleteBranchDepartmentsDialog
                open={deleteBranchDeptsOpen}
                branchId={selectedBranchId || branchId}
                onClose={() => setDeleteBranchDeptsOpen(false)}
                onSuccess={() => {
                    dispatch(listDepartmentsRequest({ pageNumber: 1, pageSize: 100, branchId: selectedBranchId || undefined }));
                }}
            />

            {/* Delete Single Department Dialog */}
            <DeleteSingleDepartmentDialog
                open={Boolean(deleteTarget)}
                department={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onSuccess={() => {
                    dispatch(listDepartmentsRequest({ pageNumber: 1, pageSize: 100, branchId: selectedBranchId || undefined }));
                }}
            />
        </>
    );
}

export default DepartmentContent;
