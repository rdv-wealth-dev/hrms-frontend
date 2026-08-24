import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ButtonGroup from "@mui/material/ButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";

import TreeNode from "./TreeNode/TreeNode";
import ReparentNodeDialog from "./ReparentNodeDialog";
import { getOrgHierarchy, type OrgTreeNode } from "../../../../../api/orgtree.api";
import type { RootState } from "../../../../../store/rootReducer";

// Helper: Build a fallback tree from live Redux employees if org-tree collection is empty
function buildTreeFromEmployees(employees: any[]): OrgTreeNode[] {
  if (!employees || employees.length === 0) return [];

  const empMap = new Map<string, any>();
  const rootNodes: any[] = [];

  employees.forEach((emp) => {
    const id = String(emp._id || emp.id);
    const mgrId = emp.managerId
      ? typeof emp.managerId === "object"
        ? String(emp.managerId._id || emp.managerId.id)
        : String(emp.managerId)
      : null;

    const deptName =
      emp.departmentId && typeof emp.departmentId === "object"
        ? emp.departmentId.name
        : "Department";

    const desigTitle =
      emp.designationId && typeof emp.designationId === "object"
        ? emp.designationId.name
        : "Employee";

    empMap.set(id, {
      id,
      _id: id,
      title: desigTitle,
      assignedEmployee: {
        _id: id,
        id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        fullName: `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Employee",
        email: emp.email,
        employeeCode: emp.employeeCode,
        avatarUrl: emp.avatarUrl,
        designationTitle: desigTitle,
        departmentName: deptName,
      },
      department: {
        name: deptName,
      },
      parentId: mgrId,
      children: [],
    });
  });

  employees.forEach((emp) => {
    const id = String(emp._id || emp.id);
    const node = empMap.get(id);
    if (!node) return;

    if (node.parentId && empMap.has(node.parentId) && node.parentId !== id) {
      empMap.get(node.parentId).children.push(node);
    } else {
      rootNodes.push(node);
    }
  });

  return rootNodes;
}

export default function OrganizationChart() {
  const [treeData, setTreeData] = useState<OrgTreeNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Reparent Modal State
  const [reparentOpen, setReparentOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<OrgTreeNode | null>(null);

  // Redux Employees fallback
  const employees = useSelector((state: RootState) => state.employee?.employees ?? []);

  const fetchHierarchy = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getOrgHierarchy();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setTreeData(res.data);
      } else {
        // Construct dynamic live tree directly from active employee records
        const fallback = buildTreeFromEmployees(employees);
        setTreeData(fallback);
      }
    } catch (err: any) {
      // If org-tree endpoint is newly initialized, fallback to employee database seamlessly
      const fallback = buildTreeFromEmployees(employees);
      if (fallback.length > 0) {
        setTreeData(fallback);
      } else {
        setError(err?.response?.data?.message || "Failed to load live organizational chart.");
      }
    } finally {
      setLoading(false);
    }
  }, [employees]);

  useEffect(() => {
    fetchHierarchy();
  }, [fetchHierarchy]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(1.4, Math.round((prev + 0.1) * 10) / 10));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.6, Math.round((prev - 0.1) * 10) / 10));
  const handleZoomReset = () => setZoomLevel(1);

  const handleReparentClick = (node: OrgTreeNode) => {
    setSelectedNode(node);
    setReparentOpen(true);
  };

  const handleReparentSuccess = () => {
    fetchHierarchy();
  };

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      {/* ── Top Canvas Action Toolbar ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccountTreeOutlinedIcon sx={{ color: "#6D5DF6", fontSize: 22 }} />
          <Typography sx={{ fontWeight: 700, fontSize: "16px", color: "#0F172A" }}>
            Live Organizational Hierarchy
          </Typography>
        </Box>

        {/* Zoom & View Controls */}
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <ButtonGroup size="small" variant="outlined" sx={{ bgcolor: "#FFFFFF", borderRadius: "10px" }}>
            <Tooltip title="Zoom Out">
              <IconButton size="small" onClick={handleZoomOut} disabled={zoomLevel <= 0.6}>
                <ZoomOutIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Button
              size="small"
              onClick={handleZoomReset}
              sx={{
                px: 1.5,
                fontWeight: 700,
                fontSize: "12px",
                color: "#475569",
                minWidth: 54,
                textTransform: "none",
              }}
            >
              {Math.round(zoomLevel * 100)}%
            </Button>
            <Tooltip title="Zoom In">
              <IconButton size="small" onClick={handleZoomIn} disabled={zoomLevel >= 1.4}>
                <ZoomInIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </ButtonGroup>

          <Tooltip title="Reset Zoom">
            <IconButton
              size="small"
              onClick={handleZoomReset}
              sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px" }}
            >
              <RestartAltIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh Chart">
            <IconButton
              size="small"
              onClick={fetchHierarchy}
              disabled={loading}
              sx={{ bgcolor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px" }}
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* ── Main Canvas Viewport ── */}
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          minHeight: 520,
          maxHeight: "78vh",
          p: { xs: 2, sm: 4 },
          borderRadius: "20px",
          backgroundColor: "#F8FAFC",
          border: "1px solid #E2E8F0",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          backgroundImage: "radial-gradient(#E2E8F0 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {error && (
          <Alert severity="warning" sx={{ mb: 3, maxWidth: 600, width: "100%", borderRadius: "12px" }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Stack spacing={3} sx={{ alignItems: "center", py: 8, width: "100%" }}>
            <Skeleton variant="rectangular" width={290} height={120} sx={{ borderRadius: "16px" }} />
            <Skeleton variant="rectangular" width={2} height={40} />
            <Box sx={{ display: "flex", gap: 4 }}>
              <Skeleton variant="rectangular" width={290} height={120} sx={{ borderRadius: "16px" }} />
              <Skeleton variant="rectangular" width={290} height={120} sx={{ borderRadius: "16px" }} />
            </Box>
          </Stack>
        ) : treeData.length === 0 ? (
          <Box sx={{ py: 12, textAlign: "center" }}>
            <AccountTreeOutlinedIcon sx={{ fontSize: 48, color: "#94A3B8", mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0F172A" }}>
              No Hierarchy Data Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mt: 0.5 }}>
              Add employees with reporting managers to automatically generate the organization tree.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top center",
              transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              py: 2,
              px: 4,
              minWidth: "fit-content",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", gap: 6 }}>
              {treeData.map((rootNode) => (
                <TreeNode
                  key={rootNode?.id || rootNode?._id}
                  node={rootNode}
                  onReparent={handleReparentClick}
                  defaultExpanded={true}
                />
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      {/* ── Reparenting Node Modal ── */}
      <ReparentNodeDialog
        open={reparentOpen}
        node={selectedNode}
        allNodes={treeData}
        onClose={() => {
          setReparentOpen(false);
          setSelectedNode(null);
        }}
        onSuccess={handleReparentSuccess}
      />
    </Box>
  );
}