import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";

import TextInput from "../../../components/input/TextInput";
import PhoneInput from "../../../components/input/PhoneInput";
import CascadingSelect, { type SelectOption } from "../../../components/input/CascadingSelect";
import { MultiSelect } from "../../../components/input/MultiSelect";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import { listBranchesRequest } from "../../../store/branch";
import { listDepartments } from "../../../api/department.api";
import { listDesignations } from "../../../api/designation.api";
import { updateEmployee, type CompleteProfileEmployee } from "../../../api/employee.api";
import { getApiErrorMessage } from "../../../utils/handle-api-error";

interface OverviewEditDialogProps {
  open: boolean;
  empProfile: CompleteProfileEmployee | null;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

const WORK_MODE_OPTIONS = [
  { value: "OFFICE", label: "Office" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "REMOTE", label: "Remote" },
];

const BAND_OPTIONS = ["L1", "L2", "L3", "L4", "L5", "L6", "L7"];

const BUSINESS_UNIT_OPTIONS = [
  "Technology",
  "Operations",
  "Sales",
  "HR",
  "Finance",
  "Product",
  "Marketing",
];

const EMPLOYEE_TYPE_OPTIONS = [
  { value: "FULL_TIME", label: "Full-Time" },
  { value: "PART_TIME", label: "Part-Time" },
  { value: "CONTRACT", label: "Contractor" },
  { value: "INTERN", label: "Intern" },
  { value: "CONSULTANT", label: "Consultant" },
];

const resolveId = (val: unknown): string => {
  if (!val) return "";
  if (typeof val === "object" && val !== null) {
    return (val as any)._id || (val as any).id || "";
  }
  return typeof val === "string" ? val : "";
};

const resolveIds = (val: unknown): string[] => {
  if (!Array.isArray(val)) return [];
  return val.map(resolveId).filter(Boolean);
};

export default function OverviewEditDialog({
  open,
  empProfile,
  onClose,
  onSuccess,
}: OverviewEditDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const branches = useSelector((state: RootState) => state.branch?.branches ?? []);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("IN");
  const [city, setCity] = useState("");
  const [workMode, setWorkMode] = useState("HYBRID");
  const [branchId, setBranchId] = useState("");
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const departmentId = departmentIds[0] ?? "";
  const [designationId, setDesignationId] = useState("");
  const [band, setBand] = useState("L5");
  const [businessUnit, setBusinessUnit] = useState("Technology");
  const [employeeType, setEmployeeType] = useState("FULL_TIME");

  // Cascading Dynamic Options
  const [departments, setDepartments] = useState<Array<{ _id: string; name: string; code: string }>>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [designations, setDesignations] = useState<Array<{ _id: string; name: string; code: string }>>([]);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const empId = empProfile?._id || empProfile?.id;

  useEffect(() => {
    if (open) {
      if (branches.length === 0) {
        dispatch(listBranchesRequest());
      }
      setError(null);

      if (empProfile) {
        setPhone(empProfile.phone || "");
        setCountryCode((empProfile as any).countryCode || "IN");
        setCity(empProfile.currentAddress?.city || "");
        setWorkMode((empProfile as any).workMode || "HYBRID");

        const resolvedBranch = resolveId(empProfile.branchId);
        const resolvedDeptIds = resolveIds(empProfile.departmentIds);
        const departmentSelection = resolvedDeptIds.length
          ? resolvedDeptIds
          : [resolveId(empProfile.departmentId)].filter(Boolean);
        const resolvedDesig = resolveId(empProfile.designationId);

        setBranchId(resolvedBranch);
        setDepartmentIds(departmentSelection);
        setDesignationId(resolvedDesig);

        setBand((empProfile as any).band || "L5");
        setBusinessUnit((empProfile as any).businessUnit || "Technology");
        setEmployeeType(empProfile.employeeType || "FULL_TIME");
      }
    }
  }, [open, empProfile, branches.length, dispatch]);

  // Fetch departments when branchId changes
  useEffect(() => {
    if (!branchId) {
      setDepartments([]);
      return;
    }
    let isMounted = true;
    setLoadingDepartments(true);
    listDepartments(1, 100, branchId)
      .then((res) => {
        if (!isMounted) return;
        if (res?.succeeded && res?.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data as any)?.items ?? [];
          setDepartments(list);
        } else {
          setDepartments([]);
        }
      })
      .catch(() => {
        if (isMounted) setDepartments([]);
      })
      .finally(() => {
        if (isMounted) setLoadingDepartments(false);
      });

    return () => {
      isMounted = false;
    };
  }, [branchId]);

  // Fetch designations when departmentId changes
  useEffect(() => {
    if (!departmentId) {
      setDesignations([]);
      return;
    }
    let isMounted = true;
    setLoadingDesignations(true);
    listDesignations(1, 100, departmentId)
      .then((res) => {
        if (!isMounted) return;
        if (res?.succeeded && res?.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data as any)?.items ?? [];
          setDesignations(list);
        } else {
          setDesignations([]);
        }
      })
      .catch(() => {
        if (isMounted) setDesignations([]);
      })
      .finally(() => {
        if (isMounted) setLoadingDesignations(false);
      });

    return () => {
      isMounted = false;
    };
  }, [departmentId]);

  const departmentOptions: SelectOption[] = useMemo(
    () =>
      departments?.map((d) => ({
        value: d._id,
        label: `${d.name} (${d.code || "—"})`,
      })) ?? [],
    [departments]
  );

  const designationOptions: SelectOption[] = useMemo(
    () =>
      designations?.map((des) => ({
        value: des._id,
        label: des.name,
      })) ?? [],
    [designations]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empId) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        phone: phone.trim() || undefined,
        countryCode: countryCode || "IN",
        workMode,
        branchId: branchId || undefined,
        departmentIds: departmentIds.length ? departmentIds : undefined,
        departmentId: departmentId || undefined,
        designationId: designationId || undefined,
        band,
        businessUnit,
        employeeType,
        currentAddress: {
          ...(empProfile.currentAddress || {}),
          city: city.trim(),
        },
      };

      const res = await updateEmployee(empId, payload);
      if (res?.succeeded) {
        toast.success("Overview & Employment details updated successfully!");
        await onSuccess();
        onClose();
      } else {
        setError(res?.message || "Failed to update overview details.");
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Failed to update overview details."));
    } finally {
      setSubmitting(false);
    }
  };

  const fullName = empProfile
    ? `${empProfile.firstName || ""} ${empProfile.lastName || ""}`.trim()
    : "Employee";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
            borderRadius: { xs: "12px", sm: "20px" },
            p: { xs: 2, sm: 3 },
            backgroundColor: "background.paper",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid",
            borderColor: "divider",
          },
        },
      }}
    >
      <DialogTitle component="div" sx={{ p: 0, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <BusinessOutlinedIcon sx={{ color: "primary.main", fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                Edit Overview & Employment Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {fullName} • {empProfile?.employeeCode || empId || "Employee"}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} disabled={submitting} size="small" sx={{ color: "#64748B" }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>{error}</Alert>}

          <Grid container spacing={2.5}>
            {/* Phone Number */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <PhoneInput
                label="Mobile Phone Number"
                countryCodeValue={countryCode}
                phoneValue={phone}
                onCountryCodeChange={(code) => setCountryCode(code)}
                onPhoneChange={(val) => setPhone(val)}
                disabled={submitting}
              />
            </Grid>

            {/* Location (City) */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                label="Location (City)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bangalore"
                disabled={submitting}
              />
            </Grid>

            {/* Work Mode */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                select
                label="Work Mode"
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                disabled={submitting}
              >
                {WORK_MODE_OPTIONS.map((wm) => (
                  <MenuItem key={wm.value} value={wm.value}>
                    {wm.label}
                  </MenuItem>
                ))}
              </TextInput>
            </Grid>

            {/* Branch Location */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                select
                label="Branch Location"
                value={branchId}
                onChange={(e) => {
                  setBranchId(e.target.value);
                  setDepartmentIds([]);
                  setDesignationId("");
                }}
                disabled={submitting}
              >
                <MenuItem value="" disabled sx={{ color: "#94A3B8" }}>
                  Select Branch
                </MenuItem>
                {branches?.map((b) => (
                  <MenuItem key={b._id} value={b._id}>
                    {b.name} {b.isHeadOffice ? "(HQ)" : ""}
                  </MenuItem>
                ))}
              </TextInput>
            </Grid>

            {/* Departments (first selection is primary) */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <MultiSelect
                label="Department(s)"
                options={departmentOptions}
                value={departmentIds}
                disabled={!branchId || submitting || loadingDepartments}
                placeholder={
                  !branchId
                    ? "Select Branch first"
                    : loadingDepartments
                      ? "Loading departments..."
                      : "Select department(s)"
                }
                onChange={(values) => {
                  setDepartmentIds(values);
                  if ((values[0] ?? "") !== departmentId) {
                    setDesignationId("");
                  }
                }}
                searchable
              />
            </Grid>

            {/* Designation */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <CascadingSelect
                label="Designation"
                value={designationId}
                options={designationOptions}
                loading={loadingDesignations}
                disabled={!departmentId || submitting}
                disabledPlaceholder="Select Department first"
                emptyPlaceholder="No designations in department"
                onChange={(e) => setDesignationId(e.target.value)}
              />
            </Grid>

            {/* Grade / Band */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                select
                label="Grade / Band"
                value={band}
                onChange={(e) => setBand(e.target.value)}
                disabled={submitting}
              >
                {BAND_OPTIONS.map((b) => (
                  <MenuItem key={b} value={b}>
                    {b}
                  </MenuItem>
                ))}
              </TextInput>
            </Grid>

            {/* Business Unit */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                select
                label="Business Unit"
                value={businessUnit}
                onChange={(e) => setBusinessUnit(e.target.value)}
                disabled={submitting}
              >
                {BUSINESS_UNIT_OPTIONS.map((bu) => (
                  <MenuItem key={bu} value={bu}>
                    {bu}
                  </MenuItem>
                ))}
              </TextInput>
            </Grid>

            {/* Employment Type */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                select
                label="Employment Type"
                value={employeeType}
                onChange={(e) => setEmployeeType(e.target.value)}
                disabled={submitting}
              >
                {EMPLOYEE_TYPE_OPTIONS.map((et) => (
                  <MenuItem key={et.value} value={et.value}>
                    {et.label}
                  </MenuItem>
                ))}
              </TextInput>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ pt: 2, px: { xs: 1, sm: 2 } }}>
          <Button onClick={onClose} disabled={submitting} sx={{ textTransform: "none", color: "text.secondary", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              px: 3,
              bgcolor: "primary.main",
            }}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
