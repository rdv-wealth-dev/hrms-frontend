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
import MenuItem from "@mui/material/MenuItem";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import TextInput from "../../../components/input/TextInput";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import type { Designation } from "../../../auth/types";
import { usePermissions } from "../../../hooks/usePermissions";

import {
  createDesignationRequest,
  listDesignationsRequest,
  updateDesignationRequest,
  clearDesignationError,
} from "../../../store/designation";
import { listDepartmentsRequest } from "../../../store/department";

// ============================================================
// Designation Content — layout-agnostic, embeddable anywhere
// ============================================================

function DesignationContent() {
  const dispatch = useDispatch<AppDispatch>();

  const { designations, submitting, loading, error } = useSelector(
    (state: RootState) =>
      state.designation ?? {
        designations: [],
        submitting: false,
        loading: false,
        error: null,
      }
  );

  const user = useSelector((state: RootState) => state.auth?.user);
  const branchId = user?.branchIds?.[0] ?? "";
  
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("designation.create");
  const canUpdate = hasPermission("designation.update");

  const departments = useSelector(
    (state: RootState) => state.department?.departments ?? []
  );

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [hasSubmittedCreate, setHasSubmittedCreate] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [level, setLevel] = useState("1");

  // Update dialog state
  const [updateOpen, setUpdateOpen] = useState(false);
  const [hasSubmittedUpdate, setHasSubmittedUpdate] = useState(false);
  const [editTarget, setEditTarget] = useState<Designation | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLevel, setEditLevel] = useState("1");

  // Fetch list on mount
  useEffect(() => {
    dispatch(listDesignationsRequest({ pageNumber: 1, pageSize: 10 }));
  }, [dispatch]);

  // Fetch departments if cache is empty
  useEffect(() => {
    if (departments.length === 0) {
      dispatch(listDepartmentsRequest());
    }
  }, [dispatch, departments.length]);

  // Only close create dialog after an actual submit succeeded
  useEffect(() => {
    if (hasSubmittedCreate && !submitting && !error && createOpen) {
      setCreateOpen(false);
      setHasSubmittedCreate(false);
      setName("");
      setCode("");
      setDescription("");
      setDepartmentId("");
      setLevel("1");
      dispatch(listDesignationsRequest({ pageNumber: 1, pageSize: 10 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitting, error, hasSubmittedCreate]);

  // Only close update dialog after an actual submit succeeded
  useEffect(() => {
    if (hasSubmittedUpdate && !submitting && !error && updateOpen) {
      setUpdateOpen(false);
      setHasSubmittedUpdate(false);
      setEditTarget(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitting, error, hasSubmittedUpdate]);

  const handleCreate = () => {
    if (!name?.trim() || !code?.trim() || !departmentId?.trim()) return;
    setHasSubmittedCreate(true);
    dispatch(
      createDesignationRequest({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description?.trim() ?? "",
        departmentId: departmentId.trim(),
        branchId,
        level: Number(level) || 1,
      })
    );
  };

  const openEdit = (dept: Designation) => {
    setEditTarget(dept);
    setEditName(dept?.name ?? "");
    setEditCode(dept?.code ?? "");
    setEditDescription(dept?.description ?? "");
    setEditLevel(String(dept?.level ?? 1));
    setHasSubmittedUpdate(false);
    dispatch(clearDesignationError());
    setUpdateOpen(true);
  };

  const handleUpdate = () => {
    if (!editTarget?._id) return;
    setHasSubmittedUpdate(true);
    dispatch(
      updateDesignationRequest({
        id: editTarget._id,
        data: {
          name: editName?.trim() ?? "",
          code: editCode?.trim()?.toUpperCase() ?? "",
          description: editDescription?.trim() ?? "",
          level: Number(editLevel) || 1,
        },
      })
    );
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
            <BadgeOutlinedIcon sx={{ fontSize: 32, color: "#6D5DF6" }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
                Designations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage job titles and levels within departments
              </Typography>
            </Box>
          </Box>

          {canCreate && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => {
                setHasSubmittedCreate(false);
                dispatch(clearDesignationError());
                setCreateOpen(true);
              }}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                backgroundColor: "#6D5DF6",
                "&:hover": { backgroundColor: "#5B4BEA" },
              }}
            >
              Create Designation
            </Button>
          )}
        </Box>

        {/* Error Banner (only when all dialogs are closed) */}
        {error && !createOpen && !updateOpen && (
          <Alert
            severity="error"
            onClose={() => dispatch(clearDesignationError())}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* Designation Table */}
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
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Level</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Status</TableCell>
                  {canUpdate && (
                    <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {(designations ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canUpdate ? 6 : 5} align="center">
                      <Box sx={{ py: 6 }}>
                        <BadgeOutlinedIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No designations yet.
                          {canCreate ? " Click \"Create Designation\" to add one." : ""}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  (designations ?? []).map((d) => (
                    <TableRow
                      key={d?._id ?? Math.random()}
                      hover
                      sx={{ "&:last-child td": { border: 0 } }}
                    >
                      <TableCell sx={{ fontWeight: 500, fontSize: 14 }}>
                        {d?.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={d?.code ?? ""}
                          size="small"
                          sx={{
                            backgroundColor: "#EEF2FF",
                            color: "#6D5DF6",
                            fontWeight: 600,
                            fontSize: 12,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: 13 }}>{d?.level ?? "—"}</TableCell>
                      <TableCell sx={{ color: "#6B7280", fontSize: 13 }}>
                        {d?.description || "—"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={d?.isActive ? "Active" : "Inactive"}
                          size="small"
                          color={d?.isActive ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      {canUpdate && (
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => openEdit(d)}
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

      {/* Create Designation Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setHasSubmittedCreate(false);
          dispatch(clearDesignationError());
        }}
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
          Create Designation
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {error && createOpen && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

          <TextInput
            label="Designation Name"
            value={name}
            onChange={(e) => setName(e.target.value ?? "")}
            placeholder="e.g. Software Engineer"
            required
          />

          <TextInput
            label="Code"
            value={code}
            onChange={(e) => setCode((e.target.value ?? "").toUpperCase())}
            placeholder="e.g. SDE1"
            required
            slotProps={{ htmlInput: { maxLength: 20 } }}
          />

          <TextInput
            select
            label="Department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value ?? "")}
            required
          >
            <MenuItem value="" disabled>
              Select Department
            </MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept._id} value={dept._id}>
                {dept.name} ({dept.code})
              </MenuItem>
            ))}
          </TextInput>

          <TextInput
            type="number"
            label="Level"
            value={level}
            onChange={(e) => setLevel(e.target.value ?? "1")}
            placeholder="e.g. 2"
          />

          <TextInput
            multiline
            rows={3}
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value ?? "")}
            placeholder="Brief description of this role"
          />
        </DialogContent>

        <DialogActions sx={{ p: 0, mt: 3, display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button
            onClick={() => {
              setCreateOpen(false);
              setHasSubmittedCreate(false);
              dispatch(clearDesignationError());
            }}
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
            onClick={handleCreate}
            disabled={submitting || !name?.trim() || !code?.trim() || !departmentId?.trim()}
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
            {submitting ? <CircularProgress size={18} color="inherit" /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Designation Dialog */}
      <Dialog
        open={updateOpen}
        onClose={() => {
          setUpdateOpen(false);
          setHasSubmittedUpdate(false);
          setEditTarget(null);
          dispatch(clearDesignationError());
        }}
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
          Update Designation
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {error && updateOpen && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

          <TextInput
            label="Designation Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value ?? "")}
            required
          />

          <TextInput
            label="Code"
            value={editCode}
            onChange={(e) => setEditCode((e.target.value ?? "").toUpperCase())}
            placeholder="e.g. SDE1"
            required
            slotProps={{ htmlInput: { maxLength: 20 } }}
          />

          <TextInput
            type="number"
            label="Level"
            value={editLevel}
            onChange={(e) => setEditLevel(e.target.value ?? "1")}
          />

          <TextInput
            multiline
            rows={3}
            label="Description (optional)"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value ?? "")}
          />
        </DialogContent>

        <DialogActions sx={{ p: 0, mt: 3, display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button
            onClick={() => {
              setUpdateOpen(false);
              setHasSubmittedUpdate(false);
              setEditTarget(null);
              dispatch(clearDesignationError());
            }}
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
            onClick={handleUpdate}
            disabled={submitting || !editName?.trim() || !editCode?.trim()}
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
            {submitting ? <CircularProgress size={18} color="inherit" /> : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DesignationContent;
