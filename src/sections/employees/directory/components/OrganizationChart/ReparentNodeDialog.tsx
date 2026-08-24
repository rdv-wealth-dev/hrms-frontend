import { useState, useMemo } from "react";
import { toast } from "sonner";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";

import CloseIcon from "@mui/icons-material/Close";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

import CustomAvatar from "../../../../../components/avatar/CustomAvatar";
import CustomSelect, { type CustomSelectOption } from "../../../../../components/input/CustomSelect";
import { reparentOrgNode, type OrgTreeNode } from "../../../../../api/orgtree.api";

export interface ReparentNodeDialogProps {
  open: boolean;
  node: OrgTreeNode | any | null;
  allNodes: OrgTreeNode[];
  onClose: () => void;
  onSuccess: (data?: any) => void;
}

// Helper: Recursively collect all descendant IDs of a given node
function collectDescendantIds(root: OrgTreeNode | any): string[] {
  const ids: string[] = [];
  if (!root || !root.children) return ids;

  for (const child of root.children) {
    const childId = String(child.id || child._id);
    if (childId) {
      ids.push(childId);
      ids.push(...collectDescendantIds(child));
    }
  }
  return ids;
}

// Helper: Flatten entire tree to extract all candidate manager positions
function flattenTree(nodes: OrgTreeNode[] | any[]): Array<{ id: string; name: string; title: string; dept?: string }> {
  const result: Array<{ id: string; name: string; title: string; dept?: string }> = [];

  function traverse(list: any[]) {
    for (const item of list) {
      const id = String(item.id || item._id);
      const name = item.assignedEmployee?.fullName || item.name || item.title || "Position Node";
      const title = item.title || item.designation || item.assignedEmployee?.designationTitle || "Role";
      const dept = item.department?.name || item.department || "";

      if (id) {
        result.push({ id, name, title, dept });
      }
      if (item.children && Array.isArray(item.children)) {
        traverse(item.children);
      }
    }
  }

  traverse(nodes);
  return result;
}

export function ReparentNodeDialog({
  open,
  node,
  allNodes,
  onClose,
  onSuccess,
}: ReparentNodeDialogProps) {
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const nodeId = String(node?.id || node?._id || "");
  const nodeName = node?.assignedEmployee?.fullName || node?.name || node?.title || "Employee Position";
  const nodeTitle = node?.title || node?.designation || "Position";
  const nodeDept = node?.department?.name || node?.department || "";
  const directReportsCount = node?.children?.length || node?.teamCount || 0;

  // Compute excluded IDs (self + descendants) to prevent circular loop
  const excludedIds = useMemo(() => {
    if (!node) return new Set<string>();
    const descIds = collectDescendantIds(node);
    return new Set<string>([nodeId, ...descIds]);
  }, [node, nodeId]);

  // Compute eligible new parent options
  const parentOptions: CustomSelectOption[] = useMemo(() => {
    const flattened = flattenTree(allNodes);
    return flattened
      .filter((candidate) => !excludedIds.has(candidate.id))
      .map((candidate) => ({
        value: candidate.id,
        label: `${candidate.name} (${candidate.title})`,
      }));
  }, [allNodes, excludedIds]);

  const handleReparent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeId || !selectedParentId) {
      setError("Please select a valid new parent manager position.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await reparentOrgNode({
        nodeId,
        newParentId: selectedParentId,
      });

      if (res?.success || (res as any)?.succeeded) {
        toast.success(
          res.message ||
            `Subtree reparented successfully! ${nodeName} now reports to the new position.`
        );
        onSuccess(res.data);
        onClose();
      } else {
        const msg = res?.message || "Failed to reparent organizational node.";
        setError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reparent node. Circular reporting loop or invalid parent detected.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
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
            borderRadius: { xs: "12px", sm: "18px" },
            p: { xs: 2, sm: 3 },
            backgroundColor: "#FFFFFF",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid #E2E8F0",
          },
        },
      }}
    >
      <DialogTitle component="div" sx={{ p: 0, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                backgroundColor: "rgba(109, 93, 246, 0.1)",
                color: "#6D5DF6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AccountTreeOutlinedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#0F172A" }}>
                Change Reporting Line (Reparent)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "13px" }}>
                Reassign this position and its subordinates under a new manager
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={onClose}
            size="small"
            disabled={submitting}
            sx={{
              color: "#64748B",
              borderRadius: "8px",
              "&:hover": { backgroundColor: "#F1F5F9", color: "#0F172A" },
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box component="form" onSubmit={handleReparent}>
        <DialogContent sx={{ p: 0, py: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>
              {error}
            </Alert>
          )}

          {/* Node Information Card */}
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              mb: 2.5,
            }}
          >
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1, display: "block" }}>
              Selected Node to Reparent
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <CustomAvatar name={nodeName} src={node?.assignedEmployee?.avatarUrl} size={42} />
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#0F172A" }}>
                    {nodeName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6D5DF6", fontWeight: 600 }}>
                    {nodeTitle} {nodeDept ? `• ${nodeDept}` : ""}
                  </Typography>
                </Box>
              </Box>

              {directReportsCount > 0 && (
                <Chip
                  label={`${directReportsCount} Subordinate${directReportsCount > 1 ? "s" : ""}`}
                  size="small"
                  sx={{ fontWeight: 700, backgroundColor: "#EEF2FF", color: "#4F46E5", fontSize: "12px" }}
                />
              )}
            </Box>
          </Box>

          {/* Warning for Downline Reports */}
          {directReportsCount > 0 && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: "10px",
                backgroundColor: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                display: "flex",
                alignItems: "flex-start",
                gap: 1.25,
                mb: 2.5,
              }}
            >
              <WarningAmberOutlinedIcon sx={{ color: "#D97706", fontSize: 20, mt: 0.2 }} />
              <Typography variant="caption" sx={{ color: "#92400E", lineHeight: 1.4 }}>
                <strong>Subtree Transfer Notice:</strong> Moving <strong>{nodeName}</strong> will automatically transfer all <strong>{directReportsCount}</strong> direct reports beneath them to the new reporting line.
              </Typography>
            </Box>
          )}

          {/* New Parent Selection */}
          <Box sx={{ mb: 2 }}>
            <CustomSelect
              label="Select New Reporting Manager / Parent Node *"
              placeholder="Search or select new manager..."
              options={parentOptions}
              value={selectedParentId}
              onChange={(val) => setSelectedParentId(String(val))}
              searchable
              required
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 0,
            pt: 2.5,
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
          }}
        >
          <Button
            onClick={onClose}
            disabled={submitting}
            sx={{
              height: 40,
              borderRadius: "10px",
              px: 2.5,
              textTransform: "none",
              backgroundColor: "#F1F5F9",
              color: "#475569",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#E2E8F0" },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={submitting || !selectedParentId}
            variant="contained"
            endIcon={!submitting && <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              height: 40,
              borderRadius: "10px",
              px: 3,
              textTransform: "none",
              backgroundColor: "#6D5DF6",
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(109, 93, 246, 0.25)",
              "&:hover": { backgroundColor: "#5B4BEA" },
            }}
          >
            {submitting ? <CircularProgress size={18} color="inherit" /> : "Confirm Move"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default ReparentNodeDialog;
