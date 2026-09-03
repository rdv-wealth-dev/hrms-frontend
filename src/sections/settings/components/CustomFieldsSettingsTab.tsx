import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Card from "@mui/material/Card";

import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import DragHandleIcon from "@mui/icons-material/DragHandle";

import { useSnackbar } from "../../../components/snackbar";
import ConfirmDialog from "../../../components/modal/ConfirmDialog";
import CreateCustomFieldDialog from "./CreateCustomFieldDialog";
import { useResponsive } from "../../../hooks/useResponsive";
import {
  getCustomFields,
  reorderCustomFields,
  deleteCustomField,
  type CustomFieldDefinition,
  type FieldScope,
} from "../../../api/custom-field.api";

export function CustomFieldsSettingsTab() {
  const { showSnackbar } = useSnackbar();
  const { isMobile } = useResponsive();

  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scope] = useState<FieldScope>("ORGANIZATION");

  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomFieldDefinition | null>(null);
  const [purgeValues, setPurgeValues] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [reordering, setReordering] = useState<boolean>(false);

  const fetchFields = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomFields(scope);
      if (res?.succeeded || (res as any)?.success) {
        const items = Array.isArray(res.data) ? res.data : [];
        items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setFields(items);
      } else {
        setError(res?.message || "Failed to fetch custom fields");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load custom fields";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  // Handle reordering up/down (API 3)
  const handleMoveOrder = async (index: number, direction: "UP" | "DOWN") => {
    if ((direction === "UP" && index === 0) || (direction === "DOWN" && index === fields.length - 1)) {
      return;
    }

    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    const reordered = [...fields];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    const itemsPayload = reordered.map((item, idx) => ({
      id: item._id,
      order: idx + 1,
    }));

    setFields(reordered);
    setReordering(true);

    try {
      const res = await reorderCustomFields({ items: itemsPayload });
      if (res?.succeeded || (res as any)?.success) {
        showSnackbar("Custom fields reordered successfully", "success");
      } else {
        fetchFields(); // rollback
      }
    } catch (err: any) {
      showSnackbar(err?.message || "Failed to reorder fields", "error");
      fetchFields(); // rollback
    } finally {
      setReordering(false);
    }
  };

  // Handle delete / purge field (API 4)
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const res = await deleteCustomField(deleteTarget._id, purgeValues);
      if (res?.succeeded || (res as any)?.success) {
        showSnackbar(
          purgeValues ? "Custom field permanently purged" : "Custom field hidden successfully",
          "success"
        );
        setDeleteTarget(null);
        fetchFields();
      } else {
        showSnackbar(res?.message || "Failed to delete custom field", "error");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete custom field";
      showSnackbar(msg, "error");
    } finally {
      setDeleting(false);
    }
  };

  const formatSectionLabel = (sec?: string) => {
    if (!sec) return "Personal Details";
    const map: Record<string, string> = {
      WORK_PREFERENCES: "Work Preferences",
      PERSONAL: "Personal Details",
      BANK_DETAILS: "Bank Details",
      FAMILY: "Family Info",
      GENERAL: "General",
    };
    return map[sec] || sec.replace(/_/g, " ");
  };

  const getWidgetBadge = (widget?: string) => {
    switch (widget) {
      case "RADIO_GROUP":
        return { label: "Radio Pills", bg: "rgba(109, 93, 246, 0.1)", color: "primary.main" };
      case "PILL_SELECT":
        return { label: "Pill Selector", bg: "#F0FDF4", color: "#166534" };
      case "DROPDOWN":
        return { label: "Dropdown", bg: "#FFFBEB", color: "#B45309" };
      case "SWITCH":
        return { label: "Switch Toggle", bg: "#FAF5FF", color: "#7E22CE" };
      default:
        return { label: "Text Input", bg: "#F1F5F9", color: "#475569" };
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 3.5 } }}>
      {/* Unified Settings Paper Shell */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
          border: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {/* Header Row: Icon + Title/Description + Action Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "rgba(109, 93, 246, 0.08)",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TuneIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 750, color: "text.primary" }}>
                Dynamic Custom Fields Engine
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              backgroundColor: "primary.main",
              color: "#fff",
              px: 3,
              py: 1.2,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0px 4px 12px rgba(109, 93, 246, 0.2)",
              "&:hover": {
                backgroundColor: "primary.dark",
                boxShadow: "0px 6px 16px rgba(109, 93, 246, 0.3)",
              },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Add Custom Field
          </Button>
        </Box>

        <Divider />

        {error && (
          <Alert severity="error" sx={{ borderRadius: 2.5 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Content Section */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress size={40} sx={{ color: "primary.main" }} />
          </Box>
        ) : fields.length === 0 ? (
          /* Empty State */
          <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
            <TuneIcon sx={{ fontSize: 48, color: "#CBD5E1", mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1E293B" }}>
              No Custom Fields Defined Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: "auto", mb: 2.5 }}>
              Click <strong>"+ Add Custom Field"</strong> to create custom radio pills, dropdowns, datepickers, or text fields for your organization.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                borderRadius: 2.5,
                backgroundColor: "primary.main",
                "&:hover": { backgroundColor: "primary.dark" },
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1,
              }}
            >
              Add Custom Field
            </Button>
          </Box>
        ) : isMobile ? (
          /* 📱 Mobile Responsive Card Stack */
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {fields.map((field, idx) => {
              const badge = getWidgetBadge(field.uiComponent);

              return (
                <Card
                  key={field._id}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "action.hover",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 750, color: "text.primary" }}>
                        {field.fieldLabel}
                      </Typography>
                      <Chip
                        label={field.fieldKey}
                        size="small"
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: 700,
                          fontSize: 11,
                          backgroundColor: "action.hover",
                          color: "#334155",
                          borderRadius: "6px",
                          mt: 0.5,
                        }}
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setPurgeValues(false);
                        setDeleteTarget(field);
                      }}
                      sx={{ color: "#EF4444", backgroundColor: "#FEE2E2", "&:hover": { backgroundColor: "#FCA5A5" } }}
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                    <Chip
                      label={field.fieldType}
                      size="small"
                      sx={{ fontSize: 10, fontWeight: 700, borderRadius: "4px" }}
                    />
                    <Chip
                      label={badge.label}
                      size="small"
                      sx={{
                        fontSize: 10,
                        fontWeight: 700,
                        backgroundColor: badge.bg,
                        color: badge.color,
                        borderRadius: "4px",
                      }}
                    />
                    <Chip
                      label={`Step ${field.wizardStep || 1} · ${formatSectionLabel(field.section)}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: 10, fontWeight: 600, borderColor: "#CBD5E1" }}
                    />
                    <Chip
                      label={field.isRequired ? "Required" : "Optional"}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: 10,
                        backgroundColor: field.isRequired ? "#FEE2E2" : "#F1F5F9",
                        color: field.isRequired ? "#991B1B" : "#475569",
                        borderRadius: "4px",
                      }}
                    />
                  </Box>

                  {/* Reorder Action Row for Mobile */}
                  <Box sx={{ display: "flex", gap: 1, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                    <Button
                      size="small"
                      startIcon={<ArrowUpwardIcon />}
                      disabled={idx === 0 || reordering}
                      onClick={() => handleMoveOrder(idx, "UP")}
                      fullWidth
                      variant="outlined"
                      sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
                    >
                      Move Up
                    </Button>
                    <Button
                      size="small"
                      startIcon={<ArrowDownwardIcon />}
                      disabled={idx === fields.length - 1 || reordering}
                      onClick={() => handleMoveOrder(idx, "DOWN")}
                      fullWidth
                      variant="outlined"
                      sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
                    >
                      Move Down
                    </Button>
                  </Box>
                </Card>
              );
            })}
          </Box>
        ) : (
          /* 🖥️ Enterprise Desktop & Tablet Data Table */
          <TableContainer sx={{ overflowX: "auto", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 750, color: "#475569", fontSize: "11.5px", py: 1.5 }}>REORDER</TableCell>
                  <TableCell sx={{ fontWeight: 750, color: "#475569", fontSize: "11.5px", py: 1.5 }}>FIELD LABEL</TableCell>
                  <TableCell sx={{ fontWeight: 750, color: "#475569", fontSize: "11.5px", py: 1.5 }}>FIELD KEY</TableCell>
                  <TableCell sx={{ fontWeight: 750, color: "#475569", fontSize: "11.5px", py: 1.5 }}>TYPE &amp; WIDGET</TableCell>
                  <TableCell sx={{ fontWeight: 750, color: "#475569", fontSize: "11.5px", py: 1.5 }}>STEP &amp; SECTION</TableCell>
                  <TableCell sx={{ fontWeight: 750, color: "#475569", fontSize: "11.5px", py: 1.5 }}>REQUIRED</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 750, color: "#475569", fontSize: "11.5px", py: 1.5 }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, idx) => {
                  const badge = getWidgetBadge(field.uiComponent);

                  return (
                    <TableRow key={field._id} hover sx={{ "&:last-child td": { border: 0 } }}>
                      {/* Reorder column */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <DragHandleIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                          <IconButton
                            size="small"
                            onClick={() => handleMoveOrder(idx, "UP")}
                            disabled={idx === 0 || reordering}
                            sx={{ p: 0.25, color: "#475569" }}
                          >
                            <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveOrder(idx, "DOWN")}
                            disabled={idx === fields.length - 1 || reordering}
                            sx={{ p: 0.25, color: "#475569" }}
                          >
                            <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </TableCell>

                      {/* Field Label */}
                      <TableCell sx={{ py: 1.5, fontWeight: 700, color: "text.primary", fontSize: 14 }}>
                        {field.fieldLabel}
                        {field.helperText && (
                          <Typography variant="caption" sx={{ color: "#64748B", display: "block", fontWeight: 400 }}>
                            {field.helperText}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Field Key */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          label={field.fieldKey}
                          size="small"
                          sx={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            fontSize: 11,
                            backgroundColor: "#F1F5F9",
                            color: "#334155",
                            borderRadius: "6px",
                          }}
                        />
                      </TableCell>

                      {/* Type & Widget */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack spacing={0.5} direction="row" sx={{ alignItems: "center" }}>
                          <Chip
                            label={field.fieldType}
                            size="small"
                            sx={{ fontSize: 10, fontWeight: 700, borderRadius: "4px" }}
                          />
                          <Chip
                            label={badge.label}
                            size="small"
                            sx={{
                              fontSize: 10,
                              fontWeight: 700,
                              backgroundColor: badge.bg,
                              color: badge.color,
                              borderRadius: "4px",
                            }}
                          />
                        </Stack>
                      </TableCell>

                      {/* Step & Section */}
                      <TableCell sx={{ py: 1.5, fontSize: 13, color: "#475569", fontWeight: 500 }}>
                        Step {field.wizardStep || 1} · {formatSectionLabel(field.section)}
                      </TableCell>

                      {/* Is Required */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          label={field.isRequired ? "Required" : "Optional"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: 10,
                            backgroundColor: field.isRequired ? "#FEE2E2" : "#F1F5F9",
                            color: field.isRequired ? "#991B1B" : "#475569",
                            borderRadius: "4px",
                          }}
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Tooltip title="Delete or Hide Custom Field">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setPurgeValues(false);
                              setDeleteTarget(field);
                            }}
                            sx={{ color: "#EF4444", "&:hover": { backgroundColor: "#FEE2E2" } }}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create Modal Dialog (API 1) */}
      <CreateCustomFieldDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          showSnackbar("Custom field created successfully", "success");
          fetchFields();
        }}
      />

      {/* Delete Confirmation Dialog (API 4) */}
      {deleteTarget && (
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title={`Delete Custom Field: '${deleteTarget.fieldLabel}'`}
          content="Are you sure you want to delete this custom field? This action cannot be undone."
          confirmLabel={purgeValues ? "Permanently Purge" : "Delete Field"}
          cancelLabel="Cancel"
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </Box>
  );
}

export default CustomFieldsSettingsTab;
