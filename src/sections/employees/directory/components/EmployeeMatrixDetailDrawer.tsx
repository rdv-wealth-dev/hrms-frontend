import { useState, useEffect } from "react";
import { toast } from "sonner";

import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";

import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import CodeIcon from "@mui/icons-material/Code";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

import CustomAvatar from "../../../../components/avatar/CustomAvatar";
import StatusChip from "../../../../components/common/StatusChip";
import CustomSelect from "../../../../components/input/CustomSelect";
import TextInput from "../../../../components/input/TextInput";
import PrimaryButton from "../../../../components/button/PrimaryButton";

import { usePermissions } from "../../../../hooks/usePermissions";
import { updateEmployee, listEmployees } from "../../../../api/employee.api";
import { createWorkRoute, type MatrixRelationshipType } from "../../../../api/orgtree.api";

export interface EmployeeMatrixDetailDrawerProps {
  open: boolean;
  employee: any | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export function EmployeeMatrixDetailDrawer({
  open,
  employee,
  onClose,
  onRefresh,
}: EmployeeMatrixDetailDrawerProps) {
  const { hasPermission } = usePermissions();
  const canUpdateEmployee = hasPermission("employee.update");
  const canUpdateTeam = hasPermission("team.update");
  const canCreateOrgTree = hasPermission("orgtree.create");

  // Manager Change Dialog State
  const [changeManagerOpen, setChangeManagerOpen] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [managerOptions, setManagerOptions] = useState<{ value: string; label: string; subtext?: string }[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [submittingManager, setSubmittingManager] = useState(false);
  const [managerError, setManagerError] = useState<string | null>(null);

  // Work Route (Code Reviewer) Dialog State
  const [addRouteOpen, setAddRouteOpen] = useState(false);
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>("");
  const [relationshipType, setRelationshipType] = useState<MatrixRelationshipType>("CODE_REVIEW");
  const [projectName, setProjectName] = useState<string>("");
  const [routeNotes, setRouteNotes] = useState<string>("");
  const [submittingRoute, setSubmittingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Load candidate managers when dialog opens
  useEffect(() => {
    if (!changeManagerOpen && !addRouteOpen) return;

    let isMounted = true;
    setLoadingManagers(true);

    listEmployees(1, 100, undefined, "ACTIVE")
      .then((res) => {
        if (!isMounted) return;
        const items = Array.isArray(res?.data) ? res.data : (res?.data as any)?.items || [];
        setManagerOptions(
          items
            .filter((emp: any) => String(emp._id || emp.id) !== String(employee?._id || employee?.id))
            .map((emp: any) => {
              const empId = String(emp._id || emp.id);
              const name = emp.fullName || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Employee";
              const code = emp.employeeCode ? `[${emp.employeeCode}]` : "";
              const desig = typeof emp.designationId === "object" ? emp.designationId?.name : emp.designationId || "";
              return {
                value: empId,
                label: `${name} ${code}`.trim(),
                subtext: desig || undefined,
              };
            })
        );
      })
      .catch((err) => console.error("Failed to load candidate managers:", err))
      .finally(() => {
        if (isMounted) setLoadingManagers(false);
      });

    return () => {
      isMounted = false;
    };
  }, [changeManagerOpen, addRouteOpen, employee]);

  if (!employee) return null;

  const empName =
    employee.fullName ||
    `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
    "Employee";
  const empCode = employee.employeeCode ? `[${employee.employeeCode}]` : "";
  const desigName =
    typeof employee.designationId === "object"
      ? employee.designationId?.name
      : employee.designationId || employee.designation || "Staff Member";
  const deptName =
    typeof employee.departmentId === "object"
      ? employee.departmentId?.name
      : employee.departmentId || employee.department || "Engineering";

  // Reporting Manager info
  const managerObj =
    typeof employee.reportingManager === "object" && employee.reportingManager
      ? employee.reportingManager
      : typeof employee.managerId === "object" && employee.managerId
        ? employee.managerId
        : null;

  const managerName = managerObj
    ? managerObj.fullName || `${managerObj.firstName || ""} ${managerObj.lastName || ""}`.trim()
    : employee.managerName || "Unassigned";

  const managerDesig = managerObj
    ? typeof managerObj.designation === "object"
      ? managerObj.designation?.name
      : managerObj.designation || "Manager"
    : "HR / Administrative Line";

  // Handle Manager Change Submission
  const handleSaveManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee?._id && !employee?.id) return;
    if (!selectedManagerId) {
      setManagerError("Please select a Reporting Manager.");
      return;
    }

    setManagerError(null);
    setSubmittingManager(true);

    try {
      const empId = String(employee._id || employee.id);
      const res = await updateEmployee(empId, { managerId: selectedManagerId } as any);

      if (res.succeeded || (res as any).success) {
        toast.success("Reporting Manager updated successfully!");
        setChangeManagerOpen(false);
        onRefresh?.();
      } else {
        const msg = res.message || "Failed to update Reporting Manager.";
        setManagerError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update Reporting Manager. Circular assignment loop detected.";
      setManagerError(msg);
      toast.error(msg);
    } finally {
      setSubmittingManager(false);
    }
  };

  // Handle Work Route (Code Reviewer) Submission
  const handleSaveWorkRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewerId) {
      setRouteError("Please select a Senior Dev / Reviewer.");
      return;
    }

    setRouteError(null);
    setSubmittingRoute(true);

    try {
      const fromNodeId = String(employee._id || employee.id);
      const res = await createWorkRoute({
        fromNodeId,
        toNodeId: selectedReviewerId,
        relationshipType,
        projectName,
        notes: routeNotes,
      });

      if (res.success || (res as any).succeeded) {
        toast.success("Work submission route configured successfully!");
        setAddRouteOpen(false);
        onRefresh?.();
      } else {
        const msg = res.message || "Failed to configure work route.";
        setRouteError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create work route.";
      setRouteError(msg);
      toast.error(msg);
    } finally {
      setSubmittingRoute(false);
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          backdrop: {
            sx: { backgroundColor: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(4px)" },
          },
          paper: {
            sx: {
              width: { xs: "100%", sm: 520, md: 600 },
              p: 0,
              backgroundColor: "#F8FAFC",
              boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            },
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            py: 2.5,
            px: 3,
            backgroundColor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CustomAvatar name={empName} size={44} fontSize="16px" />
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "text.primary", lineHeight: 1.2 }}>
                {empName} {empCode}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                {desigName} • {deptName}
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "#64748B", borderRadius: "10px", "&:hover": { backgroundColor: "#F1F5F9" } }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Drawer Body — 4 Matrix Layers */}
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5, overflowY: "auto" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", fontSize: "11px" }}>
            Multi-Level Stakeholder & Matrix Architecture
          </Typography>

          {/* Layer 1: Reporting Manager (HR / Administrative Line) */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", border: "1px solid", borderColor: "divider", backgroundColor: "background.paper" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: "10px", backgroundColor: "primary.lighter", color: "primary.main", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PersonIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                    1. Reporting Manager (HR / Admin Line)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                    Official Leaves, Appraisals & Regularizations
                  </Typography>
                </Box>
              </Box>

              {canUpdateEmployee && (
                <Button
                  size="small"
                  startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                  onClick={() => setChangeManagerOpen(true)}
                  sx={{ textTransform: "none", fontWeight: 700, fontSize: "12px", color: "primary.main" }}
                >
                  Change
                </Button>
              )}
            </Box>

            <Box sx={{ p: 1.5, borderRadius: "10px", backgroundColor: "#F8FAFC", border: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CustomAvatar name={managerName} size={30} fontSize="11px" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                    {managerName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                    {managerDesig}
                  </Typography>
                </Box>
              </Box>
              <StatusChip status="PRESENT" label="Official Line" size="small" />
            </Box>
          </Paper>

          {/* Layer 2: Team Lead & Squad (Agile Line) */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", border: "1px solid", borderColor: "divider", backgroundColor: "background.paper" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <GroupsIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                    2. Team Lead & Squad (Agile Sprint Line)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                    Daily Standups, Sprints & Capacity Allocation
                  </Typography>
                </Box>
              </Box>

              {canUpdateTeam && (
                <Chip label="100% Allocated" size="small" sx={{ fontWeight: 700, fontSize: "10px", backgroundColor: "#ECFDF5", color: "#047857" }} />
              )}
            </Box>

            <Box sx={{ p: 1.5, borderRadius: "10px", backgroundColor: "#F8FAFC", border: "1px solid #F1F5F9" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {employee.team || "Bangalore Backend Core Squad"}
                </Typography>
                <Chip label={employee.roleInTeam || "DEVELOPER"} size="small" sx={{ fontWeight: 700, fontSize: "10px", height: 20, backgroundColor: "#F1F5F9", color: "#475569" }} />
              </Box>
              <LinearProgress variant="determinate" value={100} sx={{ height: 5, borderRadius: 3, backgroundColor: "divider", "& .MuiLinearProgress-bar": { backgroundColor: "#10B981" } }} />
            </Box>
          </Paper>

          {/* Layer 3: Senior Dev / Mentor (Code Review & Matrix Route) */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", border: "1px solid", borderColor: "divider", backgroundColor: "background.paper" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: "10px", backgroundColor: "rgba(14, 165, 233, 0.1)", color: "#0EA5E9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CodeIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                    3. Senior Dev / Technical Reviewer (PR Route)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                    Pull Request Code Reviews & Architecture Guidance
                  </Typography>
                </Box>
              </Box>

              {canCreateOrgTree && (
                <Button
                  size="small"
                  startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                  onClick={() => setAddRouteOpen(true)}
                  sx={{ textTransform: "none", fontWeight: 700, fontSize: "12px", color: "#0EA5E9" }}
                >
                  Add Route
                </Button>
              )}
            </Box>

            <Box sx={{ p: 1.5, borderRadius: "10px", backgroundColor: "#F8FAFC", border: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CustomAvatar name="Rohan Mehta" size={30} fontSize="11px" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                    Rohan Mehta (Senior Dev)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#0EA5E9", fontWeight: 600 }}>
                    Type: CODE_REVIEW • Core API Optimization
                  </Typography>
                </Box>
              </Box>
              <CheckCircleOutlinedIcon sx={{ fontSize: 18, color: "#10B981" }} />
            </Box>
          </Paper>

          {/* Layer 4: Executive Lineage (Org Chart Line) */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", border: "1px solid", borderColor: "divider", backgroundColor: "background.paper" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: "10px", backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AccountTreeIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                  4. Executive Hierarchy Lineage
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B" }}>
                  Top-down chain of command up to CEO
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: 1.5, borderRadius: "10px", backgroundColor: "#F8FAFC", border: "1px solid #F1F5F9" }}>
              <Typography variant="caption" sx={{ color: "#475569", fontWeight: 700, display: "block" }}>
                Rajesh Verma (CEO) ──► Priya Nair (CTO) ──► Vikram Malhotra (EM) ──► {empName}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Drawer>

      {/* Change Reporting Manager Dialog */}
      <Dialog open={changeManagerOpen} onClose={() => setChangeManagerOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Change Reporting Manager</DialogTitle>
        <Box component="form" onSubmit={handleSaveManager}>
          <DialogContent>
            {managerError && <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>{managerError}</Alert>}
            <CustomSelect
              label="Select New Reporting Manager"
              placeholder={loadingManagers ? "Loading managers..." : "Search manager..."}
              options={managerOptions}
              value={selectedManagerId}
              onChange={(val) => setSelectedManagerId(String(val))}
              searchable
              required
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setChangeManagerOpen(false)} disabled={submittingManager}>Cancel</Button>
            <PrimaryButton type="submit" loading={submittingManager} disabled={submittingManager || !selectedManagerId}>Save Manager</PrimaryButton>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Add Code Reviewer Work Route Dialog */}
      <Dialog open={addRouteOpen} onClose={() => setAddRouteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Configure Technical Work Route</DialogTitle>
        <Box component="form" onSubmit={handleSaveWorkRoute}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {routeError && <Alert severity="error" sx={{ borderRadius: "10px" }}>{routeError}</Alert>}
            <CustomSelect
              label="Select Senior Dev / Reviewer"
              placeholder={loadingManagers ? "Loading employees..." : "Search reviewer..."}
              options={managerOptions}
              value={selectedReviewerId}
              onChange={(val) => setSelectedReviewerId(String(val))}
              searchable
              required
            />
            <CustomSelect
              label="Relationship Type"
              options={[
                { value: "CODE_REVIEW", label: "CODE_REVIEW (Senior Dev / PR Reviewer)" },
                { value: "MATRIX_PROJECT", label: "MATRIX_PROJECT (Project Mentor)" },
                { value: "FUNCTIONAL_APPROVER", label: "FUNCTIONAL_APPROVER (Tech Lead)" },
                { value: "PEER_REVIEW", label: "PEER_REVIEW (Peer Collaborator)" },
              ]}
              value={relationshipType}
              onChange={(val) => setRelationshipType(String(val) as MatrixRelationshipType)}
              required
            />
            <TextInput
              label="Project Name"
              placeholder="e.g. Core API Optimization"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <TextInput
              label="Notes"
              placeholder="e.g. All backend pull requests submitted to Senior Dev for review"
              value={routeNotes}
              onChange={(e) => setRouteNotes(e.target.value)}
              multiline
              rows={2}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setAddRouteOpen(false)} disabled={submittingRoute}>Cancel</Button>
            <PrimaryButton type="submit" loading={submittingRoute} disabled={submittingRoute || !selectedReviewerId}>Configure Route</PrimaryButton>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}

export default EmployeeMatrixDetailDrawer;
