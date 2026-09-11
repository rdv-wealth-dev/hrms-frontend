import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";

import StatusChip from "../../../components/common/StatusChip";
import TextInput from "../../../components/input/TextInput";
import { useSnackbar } from "../../../components/snackbar";
import {
  initiatePayrollRun,
  validatePayrollRun,
  saveWageInputs,
  lockAttendancePeriod,
  getAttendanceLockStatus,
  createPayrollAdjustment,
  listPayrollAdjustments,
  deletePayrollAdjustment,
  approvePayrollAdjustment,
  saveSalaryHoldStep,
  saveTaxOverrideStep,
  generateBatchPayslips,
  getRunPayslips,
} from "../../../api/payroll.api";
import { listEmployees } from "../../../api/employee.api";
import { listBranchesRequest } from "../../../store/branch";
import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import { getApiErrorMessage } from "../../../utils/handle-api-error";
import type {
  PayrollRunWizardData,
  SalaryOnHoldItem,
  SaveSalaryHoldPayload,
  TaxOverrideItem,
  SaveTaxOverridePayload,
  PayrollRunSummary,
  PreflightValidationResult,
  WageInputItem,
  WageWorkerType,
  SaveWageInputsPayload,
  AdjustmentType,
  AdjustmentCategory,
  AdjustmentStatus,
  PayrollAdjustmentItem,
  CreatePayrollAdjustmentPayload,
  BatchGeneratePayslipsPayload,
  PayslipItem,
} from "../../../types/payroll.types";

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getDefaultPayrollPeriod = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return { month: date.getMonth() + 1, year: date.getFullYear() };
};

const DEFAULT_PAYROLL_PERIOD = getDefaultPayrollPeriod();

const EMPTY_WIZARD_DATA: PayrollRunWizardData = {
  periodLabel: "Aug 2026",
  periodStatus: "DRAFT",
  currentStep: 1,
  apiEndpoint: "POST /payroll/runs",
  runTitle: "August 2026 · Salary Run",
  branchName: "All Branches",
  employeeCount: 0,
  runStatus: "DRAFT",
  notes: "August 2026 Salary Run",
  preflightChecks: [],
  wageInputs: [],
  adhocVariablePay: [],
  salaryOnHold: [],
  taxOverrides: [],
  steps: [
    { stepNumber: 1, label: "Overview" },
    { stepNumber: 2, label: "Attendance & LOP" },
    { stepNumber: 3, label: "Validation" },
    { stepNumber: 4, label: "Wage Inputs" },
    { stepNumber: 5, label: "Adhoc Variable Pay" },
    { stepNumber: 6, label: "Salary On-Hold" },
    { stepNumber: 7, label: "Tax Overrides" },
    { stepNumber: 8, label: "Generate Pay Register" },
    { stepNumber: 9, label: "CFO Approval" },
    { stepNumber: 10, label: "Payout & Mark Paid" },
  ],
};

// Pure helpers — OXC (Vite Rust parser) cannot parse regex literals inside JSX
// expression containers, so regex is kept outside the component at module scope.
const stripCriticalPrefix = (msg: string) => msg.replace(/^CRITICAL:\s*/i, "");
const stripWarningPrefix  = (msg: string) => msg.replace(/^WARNING[:\s]*/i, "");

export default function RunWizardContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { showSnackbar } = useSnackbar();
  const branches = useSelector((state: RootState) => state.branch?.branches ?? []);
  const branchesLoading = useSelector((state: RootState) => state.branch?.loading ?? false);
  const activeBranches = useMemo(
    () => branches.filter((branch) => branch?.isActive !== false),
    [branches]
  );

  const [selectedMonth, setSelectedMonth] = useState(DEFAULT_PAYROLL_PERIOD.month);
  const [selectedYear, setSelectedYear] = useState(DEFAULT_PAYROLL_PERIOD.year);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [payrollRun, setPayrollRun] = useState<PayrollRunSummary | null>(null);
  const [initiatingRun, setInitiatingRun] = useState(false);
  const [initiationError, setInitiationError] = useState<string | null>(null);
  const effectiveSelectedBranchId =
    selectedBranchId || (activeBranches.length === 1 ? activeBranches[0]._id : "");
  const selectedBranch = activeBranches.find(
    (branch) => branch?._id === effectiveSelectedBranchId
  );
  const periodLabel = `${MONTH_OPTIONS[selectedMonth - 1]} ${selectedYear}`;

  const data: PayrollRunWizardData = {
    ...EMPTY_WIZARD_DATA,
    periodLabel,
    periodStatus: payrollRun?.status ?? "DRAFT",
    runTitle: `${periodLabel} · ${payrollRun ? "Salary Run" : "New Payroll Run"}`,
    branchName: selectedBranch?.name ?? "Select Branch",
    employeeCount: payrollRun?.totalEmployees ?? 0,
    runStatus: payrollRun?.status ?? "DRAFT",
  };
  const [currentStep, setCurrentStep] = useState<number>(data.currentStep);
  const [notes, setNotes] = useState<string>(data.notes);
  const [runningPreflight, setRunningPreflight]   = useState<boolean>(false);
  const [preflightExecuted, setPreflightExecuted] = useState<boolean>(false);
  const [preflightResult, setPreflightResult]     = useState<PreflightValidationResult | null>(null);
  const [preflightError, setPreflightError]       = useState<string | null>(null);
  const [attendanceLocked, setAttendanceLocked]   = useState<boolean>(false);
  const [attendanceLockTime, setAttendanceLockTime] = useState<string>("");
  const [lockingAttendance, setLockingAttendance] = useState<boolean>(false);

  // Sync attendance lock status from backend
  useEffect(() => {
    async function checkLockStatus() {
      const branchId = effectiveSelectedBranchId || (payrollRun as any)?.branchId;
      if (!branchId || !selectedYear || !selectedMonth) return;
      try {
        const res = await getAttendanceLockStatus(selectedYear, selectedMonth, branchId);
        if (res?.data?.status === "LOCKED") {
          setAttendanceLocked(true);
          if (res.data.lockedAt) {
            const dt = new Date(res.data.lockedAt);
            setAttendanceLockTime(
              `${dt.toISOString().slice(0, 10)} ${dt.toTimeString().slice(0, 5)}`
            );
          }
        } else {
          setAttendanceLocked(false);
          setAttendanceLockTime("");
        }
      } catch {
        // Fallback silently
      }
    }
    void checkLockStatus();
  }, [effectiveSelectedBranchId, selectedYear, selectedMonth, payrollRun]);

  useEffect(() => {
    dispatch(listBranchesRequest());
  }, [dispatch]);

  // Employee catalog — supports 24-char ObjectId for backend Zod validation, with real employee API fetch
  const [employeeCatalog, setEmployeeCatalog] = useState<
    Array<{ id: string; code: string; name: string }>
  >([
    { id: "66e14a2b9f1a2c3d4e5f6a01", code: "EMP-0001", name: "Aditi Sharma" },
    { id: "66e14a2b9f1a2c3d4e5f6a02", code: "EMP-0002", name: "Rohan Mehta" },
    { id: "66e14a2b9f1a2c3d4e5f6a03", code: "EMP-0003", name: "Priya Nair" },
    { id: "66e14a2b9f1a2c3d4e5f6a04", code: "EMP-0004", name: "Karan Verma" },
    { id: "66e14a2b9f1a2c3d4e5f6a05", code: "EMP-0005", name: "Neha Gupta" },
    { id: "66e14a2b9f1a2c3d4e5f6a06", code: "EMP-0006", name: "Vikram Singh" },
    { id: "66e14a2b9f1a2c3d4e5f6a07", code: "EMP-0007", name: "Ananya Iyer" },
    { id: "66e14a2b9f1a2c3d4e5f6a08", code: "EMP-0008", name: "Rahul Deshmukh" },
    { id: "66e14a2b9f1a2c3d4e5f6a09", code: "EMP-0009", name: "Sneha Kulkarni" },
    { id: "66e14a2b9f1a2c3d4e5f6a10", code: "EMP-0010", name: "Sourabh Panchal" },
    { id: "66e14a2b9f1a2c3d4e5f6a11", code: "EMP-0011", name: "Farhan Sheikh" },
    { id: "66e14a2b9f1a2c3d4e5f6a12", code: "EMP-0012", name: "Meera Joshi" },
  ]);

  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await listEmployees(1, 100);
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setEmployeeCatalog(
            res.data.map((emp) => ({
              id: emp._id,
              code: emp.employeeCode || `EMP-${emp._id.slice(-4)}`,
              name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.employeeCode || "Employee",
            }))
          );
        }
      } catch {
        // Fallback to default catalog
      }
    }
    void loadEmployees();
  }, []);


  // Step 4 Wage Inputs state
  const [wageInputsList, setWageInputsList] = useState<WageInputItem[]>([
    {
      id: "wage-1",
      employeeId: "66e14a2b9f1a2c3d4e5f6a01",
      employeeCode: "EMP-0001",
      employeeName: "Aditi Sharma",
      type: "HOURLY",
      rate: 250,
      unitsWorked: 160,
      otHours: 8.5,
      otAmount: 2656.25,
    },
    {
      id: "wage-2",
      employeeId: "66e14a2b9f1a2c3d4e5f6a04",
      employeeCode: "EMP-0004",
      employeeName: "Karan Verma",
      type: "DAILY",
      rate: 1200,
      unitsWorked: 22,
      otHours: 0,
      otAmount: 0,
    },
  ]);
  const [wageSelectedEmpId, setWageSelectedEmpId] = useState<string>("");
  const [wageWorkerType, setWageWorkerType] = useState<WageWorkerType>("HOURLY");
  const [wageRate, setWageRate] = useState<string>("");
  const [wageUnitsWorked, setWageUnitsWorked] = useState<string>("");
  const [wageOtHours, setWageOtHours] = useState<string>("");
  const [wageOtAmount, setWageOtAmount] = useState<string>("");
  const [savingWageInputs, setSavingWageInputs] = useState<boolean>(false);
  const [wageInputsSaved, setWageInputsSaved] = useState<boolean>(false);
  const [wageInputsError, setWageInputsError] = useState<string | null>(null);

  const totalRegularPay = useMemo(
    () =>
      wageInputsList.reduce(
        (sum, item) => sum + (Number(item.rate) || 0) * (Number(item.unitsWorked) || 0),
        0
      ),
    [wageInputsList]
  );
  const totalOtHours = useMemo(
    () => wageInputsList.reduce((sum, item) => sum + (Number(item.otHours) || 0), 0),
    [wageInputsList]
  );
  const totalOtPay = useMemo(
    () => wageInputsList.reduce((sum, item) => sum + (Number(item.otAmount) || 0), 0),
    [wageInputsList]
  );
  const totalWagePayable = totalRegularPay + totalOtPay;

  const handleAddWageInput = () => {
    if (!wageSelectedEmpId) {
      showSnackbar("Please select an employee.", "warning");
      return;
    }
    const rateNum = Number(wageRate);
    const unitsNum = Number(wageUnitsWorked);
    if (isNaN(rateNum) || rateNum <= 0) {
      showSnackbar("Please enter a valid rate greater than 0.", "warning");
      return;
    }
    if (isNaN(unitsNum) || unitsNum <= 0) {
      showSnackbar("Please enter valid units worked greater than 0.", "warning");
      return;
    }

    const otHoursNum = Number(wageOtHours) || 0;
    let otAmountNum = Number(wageOtAmount);
    if (isNaN(otAmountNum) || otAmountNum < 0 || !wageOtAmount) {
      otAmountNum =
        wageWorkerType === "HOURLY"
          ? Math.round(rateNum * otHoursNum * 1.5 * 100) / 100
          : Math.round((rateNum / 8) * otHoursNum * 1.5 * 100) / 100;
    }

    const emp = employeeCatalog.find((e) => e.id === wageSelectedEmpId);
    const newItem: WageInputItem = {
      id: `wage-${Date.now()}`,
      employeeId: wageSelectedEmpId,
      employeeCode: emp?.code,
      employeeName: emp?.name || "Employee",
      type: wageWorkerType,
      rate: rateNum,
      unitsWorked: unitsNum,
      otHours: otHoursNum,
      otAmount: otAmountNum,
    };

    setWageInputsList((prev) => [...prev, newItem]);
    setWageInputsSaved(false);
    setWageSelectedEmpId("");
    setWageRate("");
    setWageUnitsWorked("");
    setWageOtHours("");
    setWageOtAmount("");
    showSnackbar("Wage input record added", "success");
  };

  const handleDeleteWageInput = (id: string) => {
    setWageInputsList((prev) => prev.filter((item) => item.id !== id));
    setWageInputsSaved(false);
  };

  const handleSaveWageInputs = async (): Promise<boolean> => {
    if (!payrollRun?._id) {
      showSnackbar("No active payroll run found. Please initiate a run first.", "warning");
      return false;
    }

    setSavingWageInputs(true);
    setWageInputsError(null);

    const payload: SaveWageInputsPayload = {
      wageInputs: wageInputsList.map((item) => ({
        employeeId: item.employeeId || item.id,
        type: item.type,
        rate: Number(item.rate) || 0,
        unitsWorked: Number(item.unitsWorked) || 0,
        overtimeHours: Number(item.otHours) || 0,
        overtimeAmount: Number(item.otAmount) || 0,
      })),
    };

    try {
      const response = await saveWageInputs(payrollRun._id, payload);
      if (response?.succeeded) {
        setWageInputsSaved(true);
        showSnackbar(response?.message || "Wage and overtime inputs saved successfully", "success");
        return true;
      } else {
        const errMsg = response?.message || response?.errors?.[0] || "Failed to save wage inputs.";
        setWageInputsError(errMsg);
        showSnackbar(errMsg, "error");
        return false;
      }
    } catch (error: unknown) {
      const errMsg = getApiErrorMessage(error, "Failed to save wage inputs. Please try again.");
      setWageInputsError(errMsg);
      showSnackbar(errMsg, "error");
      return false;
    } finally {
      setSavingWageInputs(false);
    }
  };

  // Step 5 Adhoc Variable Pay (Payroll Adjustments) state
  const [adjustmentsList, setAdjustmentsList] = useState<PayrollAdjustmentItem[]>([]);
  const [loadingAdjustments, setLoadingAdjustments] = useState(false);
  const [creatingAdjustment, setCreatingAdjustment] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [approvingAll, setApprovingAll] = useState(false);
  const [adjError, setAdjError] = useState<string | null>(null);

  // Form states for Step 5
  const [adjSelectedEmployeeId, setAdjSelectedEmployeeId] = useState<string>("");
  const [adjType, setAdjType] = useState<AdjustmentType>("EARNING");
  const [adjCategory, setAdjCategory] = useState<AdjustmentCategory>("BONUS");
  const [adjCustomLabel, setAdjCustomLabel] = useState<string>("Performance Bonus");
  const [adjAmount, setAdjAmount] = useState<string>("");
  const [adjNotes, setAdjNotes] = useState<string>("");

  const EARNING_CATEGORIES = useMemo<
    Array<{ value: AdjustmentCategory; label: string; defaultTitle: string }>
  >(
    () => [
      { value: "BONUS", label: "Bonus", defaultTitle: "Performance Bonus" },
      { value: "INCENTIVE", label: "Incentive", defaultTitle: "Monthly Incentive" },
      { value: "COMMISSION", label: "Commission", defaultTitle: "Sales Commission" },
      { value: "ARREARS", label: "Arrears", defaultTitle: "Salary Arrears" },
      { value: "ALLOWANCE", label: "Allowance", defaultTitle: "Special Allowance" },
      { value: "REIMBURSEMENT", label: "Reimbursement", defaultTitle: "Expense Reimbursement" },
      { value: "CUSTOM", label: "Other Earning", defaultTitle: "Custom Addition" },
    ],
    []
  );

  const DEDUCTION_CATEGORIES = useMemo<
    Array<{ value: AdjustmentCategory; label: string; defaultTitle: string }>
  >(
    () => [
      { value: "ADVANCE_RECOVERY", label: "Advance Recovery", defaultTitle: "Salary Advance Recovery" },
      { value: "LOAN_REPAYMENT", label: "Loan Repayment", defaultTitle: "Staff Loan Repayment" },
      { value: "PENALTY", label: "Penalty / Fine", defaultTitle: "Disciplinary Penalty" },
      { value: "NOTICE_PAY", label: "Notice Pay", defaultTitle: "Notice Period Deduction" },
      { value: "CUSTOM", label: "Other Deduction", defaultTitle: "Custom Deduction" },
    ],
    []
  );

  const activeCategories = adjType === "EARNING" ? EARNING_CATEGORIES : DEDUCTION_CATEGORIES;

  const handleTypeChange = (newType: AdjustmentType) => {
    setAdjType(newType);
    const firstCat = newType === "EARNING" ? EARNING_CATEGORIES[0] : DEDUCTION_CATEGORIES[0];
    setAdjCategory(firstCat.value);
    setAdjCustomLabel(firstCat.defaultTitle);
  };

  const handleCategoryChange = (newCat: AdjustmentCategory) => {
    setAdjCategory(newCat);
    const found = activeCategories.find((c) => c.value === newCat);
    if (found) {
      setAdjCustomLabel(found.defaultTitle);
    }
  };

  const loadAdjustments = async () => {
    setLoadingAdjustments(true);
    setAdjError(null);
    try {
      const res = await listPayrollAdjustments({
        year: selectedYear,
        month: selectedMonth,
        branchId: selectedBranchId || undefined,
        pageSize: 100,
      });
      if (res?.data?.items && Array.isArray(res.data.items)) {
        setAdjustmentsList(res.data.items);
      } else {
        setAdjustmentsList([]);
      }
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "Failed to load payroll adjustments");
      setAdjError(msg);
    } finally {
      setLoadingAdjustments(false);
    }
  };

  useEffect(() => {
    if (currentStep === 5) {
      void loadAdjustments();
    }
  }, [currentStep, selectedMonth, selectedYear, selectedBranchId]);

  const handleAddAdjustment = async () => {
    if (!adjSelectedEmployeeId) {
      showSnackbar("Please select an employee", "warning");
      return;
    }
    const parsedAmount = parseFloat(adjAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showSnackbar("Please enter a valid positive amount", "warning");
      return;
    }
    const label = adjCustomLabel.trim() || adjCategory;

    setCreatingAdjustment(true);
    setAdjError(null);
    try {
      const payload: CreatePayrollAdjustmentPayload = {
        employeeId: adjSelectedEmployeeId,
        type: adjType,
        category: adjCategory,
        customLabel: label,
        amount: parsedAmount,
        month: selectedMonth,
        year: selectedYear,
        frequency: "ONE_TIME",
        isTaxable: adjType === "EARNING",
        affectsPfWages: false,
        affectsEsiWages: false,
        notes: adjNotes.trim() || undefined,
      };

      const res = await createPayrollAdjustment(payload);
      if (res?.succeeded && res?.data) {
        showSnackbar("Adjustment added successfully", "success");
        setAdjustmentsList((prev) => [res.data, ...prev]);
        setAdjAmount("");
        setAdjNotes("");
      } else {
        showSnackbar(res?.message || "Failed to create adjustment", "error");
      }
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "Failed to create adjustment");
      setAdjError(msg);
      showSnackbar(msg, "error");
    } finally {
      setCreatingAdjustment(false);
    }
  };

  const handleDeleteAdjustment = async (id: string) => {
    setActionInProgressId(id);
    try {
      const res = await deletePayrollAdjustment(id);
      if (res?.succeeded) {
        showSnackbar("Adjustment deleted successfully", "success");
        setAdjustmentsList((prev) => prev.filter((item) => item._id !== id));
      } else {
        showSnackbar(res?.message || "Failed to delete adjustment", "error");
      }
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "Failed to delete adjustment");
      showSnackbar(msg, "error");
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleApproveAdjustment = async (id: string) => {
    setActionInProgressId(id);
    try {
      const res = await approvePayrollAdjustment(id);
      if (res?.succeeded && res?.data) {
        showSnackbar("Adjustment approved for payslips", "success");
        setAdjustmentsList((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: "APPROVED" as AdjustmentStatus } : item))
        );
      } else {
        showSnackbar(res?.message || "Failed to approve adjustment", "error");
      }
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "Failed to approve adjustment");
      showSnackbar(msg, "error");
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleApproveAllPending = async () => {
    const pendingItems = adjustmentsList.filter((item) => item.status === "PENDING");
    if (pendingItems.length === 0) return;

    setApprovingAll(true);
    let successCount = 0;
    try {
      for (const item of pendingItems) {
        try {
          const res = await approvePayrollAdjustment(item._id);
          if (res?.succeeded) successCount++;
        } catch {
          // continue
        }
      }
      showSnackbar(`Approved ${successCount} adjustments for payslips`, "success");
      await loadAdjustments();
    } finally {
      setApprovingAll(false);
    }
  };

  // KPI Calculations
  const totalAdjustmentsCount = adjustmentsList.length;
  const totalAdditionsAmount = useMemo(
    () =>
      adjustmentsList
        .filter((a) => a.type === "EARNING")
        .reduce((sum, a) => sum + (Number(a.amount) || 0), 0),
    [adjustmentsList]
  );
  const totalDeductionsAmount = useMemo(
    () =>
      adjustmentsList
        .filter((a) => a.type === "DEDUCTION")
        .reduce((sum, a) => sum + (Number(a.amount) || 0), 0),
    [adjustmentsList]
  );
  const netAdjustmentImpact = totalAdditionsAmount - totalDeductionsAmount;
  const pendingAdjustmentsCount = useMemo(
    () => adjustmentsList.filter((a) => a.status === "PENDING").length,
    [adjustmentsList]
  );

  // Step 6 Salary On-Hold state
  const [holdList, setHoldList] = useState<SalaryOnHoldItem[]>([]);
  const [holdSelectedEmpId, setHoldSelectedEmpId] = useState<string>("");
  const [holdReason, setHoldReason] = useState<string>("Pending exit clearance");
  const [savingHoldList, setSavingHoldList] = useState<boolean>(false);
  const [holdError, setHoldError] = useState<string | null>(null);

  // Initialize holdList from payrollRun.salaryOnHoldEmployees when entering Step 6
  useEffect(() => {
    if (currentStep === 6 && payrollRun?.salaryOnHoldEmployees && Array.isArray(payrollRun.salaryOnHoldEmployees)) {
      setHoldList((prev) => {
        if (prev.length === 0 && payrollRun.salaryOnHoldEmployees!.length > 0) {
          return payrollRun.salaryOnHoldEmployees!.map((item: any, idx: number) => {
            const empIdStr =
              typeof item.employeeId === "object" && item.employeeId !== null
                ? item.employeeId._id || item.employeeId.id
                : String(item.employeeId);
            const foundEmp = employeeCatalog.find((e) => e.id === empIdStr);
            return {
              id: `hold-${idx}-${Date.now()}`,
              employeeId: empIdStr,
              employeeCode: foundEmp?.code || item.employeeId?.employeeCode || "EMP",
              employeeName:
                foundEmp?.name ||
                (item.employeeId ? `${item.employeeId.firstName || ""} ${item.employeeId.lastName || ""}`.trim() : "Employee"),
              reason: item.reason || "Pending clearance",
            };
          });
        }
        return prev;
      });
    }
  }, [currentStep, payrollRun, employeeCatalog]);

  const handleHoldSalary = () => {
    if (!holdSelectedEmpId) {
      showSnackbar("Please select an employee", "warning");
      return;
    }
    // Check if already in holdList
    if (holdList.some((item) => item.employeeId === holdSelectedEmpId)) {
      showSnackbar("This employee is already placed on hold", "warning");
      return;
    }
    const emp = employeeCatalog.find((e) => e.id === holdSelectedEmpId);
    const newItem: SalaryOnHoldItem = {
      id: `hold-${Date.now()}`,
      employeeId: holdSelectedEmpId,
      employeeCode: emp?.code || "EMP",
      employeeName: emp?.name || "Employee",
      reason: holdReason.trim() || "Pending clearance",
    };
    setHoldList((prev) => [newItem, ...prev]);
    setHoldSelectedEmpId("");
    setHoldReason("");
  };

  const handleReleaseHold = (id: string) => {
    setHoldList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveSalaryHold = async (): Promise<boolean> => {
    if (!payrollRun?._id) {
      showSnackbar("No active payroll run found. Please initiate run first.", "warning");
      return false;
    }
    setSavingHoldList(true);
    setHoldError(null);
    try {
      const payload: SaveSalaryHoldPayload = {
        holdList: holdList.map((item) => ({
          employeeId: item.employeeId,
          reason: item.reason,
        })),
      };
      const response = await saveSalaryHoldStep(payrollRun._id, payload);
      if (response?.succeeded) {
        showSnackbar(response.message || "Salary on-hold list updated successfully", "success");
        return true;
      } else {
        const msg = response?.message || "Failed to save salary on-hold list";
        setHoldError(msg);
        showSnackbar(msg, "error");
        return false;
      }
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "Failed to save salary on-hold list");
      setHoldError(msg);
      showSnackbar(msg, "error");
      return false;
    } finally {
      setSavingHoldList(false);
    }
  };

  // Step 7 Tax Overrides state
  const [taxOverrideList, setTaxOverrideList] = useState<TaxOverrideItem[]>([]);
  const [taxSelectedEmpId, setTaxSelectedEmpId] = useState<string>("");
  const [incomeTaxOverride, setIncomeTaxOverride] = useState<string>("");
  const [ptOverride, setPtOverride] = useState<string>("");
  const [taxRemarks, setTaxRemarks] = useState<string>("Form 12BB declaration");
  const [savingTaxOverrides, setSavingTaxOverrides] = useState<boolean>(false);
  const [taxError, setTaxError] = useState<string | null>(null);

  // Initialize taxOverrideList from active payrollRun when entering Step 7
  useEffect(() => {
    if (currentStep === 7 && payrollRun?.manualTaxOverrides && Array.isArray(payrollRun.manualTaxOverrides)) {
      setTaxOverrideList((prev) => {
        if (prev.length === 0 && payrollRun.manualTaxOverrides!.length > 0) {
          return payrollRun.manualTaxOverrides!.map((item: any, idx: number) => {
            const empIdStr =
              typeof item.employeeId === "object" && item.employeeId !== null
                ? item.employeeId._id || item.employeeId.id
                : String(item.employeeId);
            const foundEmp = employeeCatalog.find((e) => e.id === empIdStr);
            return {
              id: `tax-${idx}-${Date.now()}`,
              employeeId: empIdStr,
              employeeCode: foundEmp?.code || item.employeeId?.employeeCode || "EMP",
              employeeName:
                foundEmp?.name ||
                (item.employeeId ? `${item.employeeId.firstName || ""} ${item.employeeId.lastName || ""}`.trim() : "Employee"),
              incomeTax: Number(item.incomeTaxOverride) || 0,
              pt: Number(item.ptOverride) || 0,
              remarks: item.remarks || "Form 12BB declaration",
            };
          });
        }
        return prev;
      });
    }
  }, [currentStep, payrollRun, employeeCatalog]);

  const handleAddTaxOverride = () => {
    if (!taxSelectedEmpId) {
      showSnackbar("Please select an employee", "warning");
      return;
    }
    if (taxOverrideList.some((item) => item.employeeId === taxSelectedEmpId)) {
      showSnackbar("A tax override for this employee already exists", "warning");
      return;
    }
    const parsedIt = parseFloat(incomeTaxOverride);
    const parsedPt = parseFloat(ptOverride);
    if (isNaN(parsedIt) && isNaN(parsedPt)) {
      showSnackbar("Please specify either an Income Tax (TDS) or PT override amount", "warning");
      return;
    }
    const emp = employeeCatalog.find((e) => e.id === taxSelectedEmpId);
    const newItem: TaxOverrideItem = {
      id: `tax-${Date.now()}`,
      employeeId: taxSelectedEmpId,
      employeeCode: emp?.code || "EMP",
      employeeName: emp?.name || "Employee",
      incomeTax: !isNaN(parsedIt) ? Math.max(0, parsedIt) : 0,
      pt: !isNaN(parsedPt) ? Math.max(0, parsedPt) : 0,
      remarks: taxRemarks.trim() || "Manual adjustment",
    };
    setTaxOverrideList((prev) => [newItem, ...prev]);
    setTaxSelectedEmpId("");
    setIncomeTaxOverride("");
    setPtOverride("");
    setTaxRemarks("");
  };

  const handleDeleteTaxOverride = (id: string) => {
    setTaxOverrideList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveTaxOverrides = async (): Promise<boolean> => {
    if (!payrollRun?._id) {
      showSnackbar("No active payroll run found. Please initiate run first.", "warning");
      return false;
    }
    setSavingTaxOverrides(true);
    setTaxError(null);
    try {
      const payload: SaveTaxOverridePayload = {
        overrides: taxOverrideList.map((item) => ({
          employeeId: item.employeeId,
          incomeTaxOverride: item.incomeTax,
          ptOverride: item.pt,
          remarks: item.remarks,
        })),
      };
      const response = await saveTaxOverrideStep(payrollRun._id, payload);
      if (response?.succeeded) {
        showSnackbar(response.message || "Manual tax overrides saved successfully", "success");
        return true;
      } else {
        const msg = response?.message || "Failed to save tax overrides";
        setTaxError(msg);
        showSnackbar(msg, "error");
        return false;
      }
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "Failed to save tax overrides");
      setTaxError(msg);
      showSnackbar(msg, "error");
      return false;
    } finally {
      setSavingTaxOverrides(false);
    }
  };

  // KPI Calculations for Step 7
  const totalTaxOverridesCount = taxOverrideList.length;
  const totalCustomTdsAmount = useMemo(
    () => taxOverrideList.reduce((sum, item) => sum + (Number(item.incomeTax) || 0), 0),
    [taxOverrideList]
  );
  const totalCustomPtAmount = useMemo(
    () => taxOverrideList.reduce((sum, item) => sum + (Number(item.pt) || 0), 0),
    [taxOverrideList]
  );

  // Step 8 Generate Pay Register state
  const [notificationType, setNotificationType] = useState<string>("EMAIL");
  const [generatingBatch, setGeneratingBatch] = useState<boolean>(false);
  const [batchGenerated, setBatchGenerated] = useState<boolean>(false);
  const [payslipsList, setPayslipsList] = useState<PayslipItem[]>([]);
  const [loadingPayslips, setLoadingPayslips] = useState<boolean>(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [generationStats, setGenerationStats] = useState<{
    generatedCount?: number;
    skippedCount?: number;
    errorCount?: number;
    skipped?: string[];
    errors?: string[];
  } | null>(null);

  const loadRunPayslips = async (runId: string) => {
    setLoadingPayslips(true);
    try {
      const res = await getRunPayslips(runId);
      if (res?.succeeded && Array.isArray(res?.data)) {
        setPayslipsList(res.data);
      }
    } catch {
      // Non-blocking fallback
    } finally {
      setLoadingPayslips(false);
    }
  };

  useEffect(() => {
    if (currentStep === 8 && payrollRun?._id) {
      if (
        payrollRun.status === "GENERATED" ||
        payrollRun.status === "APPROVED" ||
        payrollRun.status === "PAID"
      ) {
        setBatchGenerated(true);
        void loadRunPayslips(payrollRun._id);
      }
    }
  }, [currentStep, payrollRun]);

  const handleGenerateBatch = async () => {
    if (!payrollRun?._id) {
      showSnackbar("No active payroll run found. Please initiate run first.", "warning");
      return;
    }
    setGeneratingBatch(true);
    setBatchError(null);
    try {
      const payload: BatchGeneratePayslipsPayload = {
        sendEmailNotification: notificationType === "EMAIL" || notificationType === "BOTH",
        sendSmsNotification: notificationType === "SMS" || notificationType === "BOTH",
      };
      const response = await generateBatchPayslips(payrollRun._id, payload);
      if (response?.succeeded) {
        setBatchGenerated(true);
        if (response?.data?.run) {
          setPayrollRun((prev) => (prev ? { ...prev, ...response.data!.run } : response.data!.run));
        }
        setGenerationStats({
          generatedCount: response?.data?.generatedCount,
          skippedCount: response?.data?.skippedCount,
          errorCount: response?.data?.errorCount,
          skipped: response?.data?.skipped,
          errors: response?.data?.errors,
        });
        showSnackbar(
          response.message || `Pay register generated for ${response?.data?.generatedCount ?? 0} employees!`,
          "success"
        );
        await loadRunPayslips(payrollRun._id);
      } else {
        const msg = response?.message || "Failed to generate pay register batch";
        setBatchError(msg);
        showSnackbar(msg, "error");
      }
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "Failed to generate pay register batch");
      setBatchError(msg);
      showSnackbar(msg, "error");
    } finally {
      setGeneratingBatch(false);
    }
  };

  // Step 9 CFO Approval state
  const [approvalNotes, setApprovalNotes] = useState<string>("");
  const [approving, setApproving] = useState<boolean>(false);
  const [approved, setApproved] = useState<boolean>(false);

  // Step 10 Payout & Mark Paid state
  const [markingPaid, setMarkingPaid] = useState<boolean>(false);
  const [markedPaid, setMarkedPaid] = useState<boolean>(false);

  const handleApproveAndFreeze = () => {
    setApproving(true);
    setTimeout(() => {
      setApproving(false);
      setApproved(true);
    }, 900);
  };

  const handleMarkAsPaid = () => {
    setMarkingPaid(true);
    setTimeout(() => {
      setMarkingPaid(false);
      setMarkedPaid(true);
    }, 900);
  };

  const handleRunPreflight = async () => {
    if (!payrollRun?._id) {
      showSnackbar("No active payroll run. Please initiate a run first.", "warning");
      return;
    }
    setRunningPreflight(true);
    setPreflightError(null);
    setPreflightResult(null);
    setPreflightExecuted(false);

    try {
      const response = await validatePayrollRun(payrollRun._id);

      if (response?.succeeded && response?.data) {
        setPreflightResult(response.data);
        setPreflightExecuted(true);
      } else {
        setPreflightError(
          response?.message ??
          response?.errors?.[0] ??
          "Validation returned an unexpected response."
        );
      }
    } catch (error: unknown) {
      setPreflightError(
        getApiErrorMessage(error, "Pre-flight validation failed. Please try again.")
      );
    } finally {
      setRunningPreflight(false);
    }
  };

  const handleLockAttendance = async () => {
    const branchId = effectiveSelectedBranchId || (payrollRun as any)?.branchId;
    if (!branchId) {
      showSnackbar("Branch is required to lock attendance. Please select a branch first.", "warning");
      return;
    }
    setLockingAttendance(true);
    try {
      const res = await lockAttendancePeriod({
        year: Number(selectedYear),
        month: Number(selectedMonth),
        branchId,
      });
      if (res?.succeeded) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        const timeStr = now.toTimeString().slice(0, 5);
        setAttendanceLockTime(`${dateStr} ${timeStr}`);
        setAttendanceLocked(true);
        showSnackbar(
          res?.message || `Attendance locked for ${selectedYear}-${String(selectedMonth).padStart(2, "0")}`,
          "success"
        );
      } else {
        showSnackbar(res?.message || "Failed to lock attendance", "error");
      }
    } catch (error: any) {
      if (error?.response?.status === 409) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        const timeStr = now.toTimeString().slice(0, 5);
        setAttendanceLockTime(`${dateStr} ${timeStr}`);
        setAttendanceLocked(true);
        showSnackbar(`Attendance for ${selectedYear}-${String(selectedMonth).padStart(2, "0")} is already locked.`, "info");
      } else {
        const msg = getApiErrorMessage(error, "Failed to lock attendance. Please try again.");
        showSnackbar(msg, "error");
      }
    } finally {
      setLockingAttendance(false);
    }
  };

  const handleInitiatePayrollRun = async () => {
    if (!effectiveSelectedBranchId) {
      setInitiationError("Please select a branch before initiating payroll.");
      return;
    }

    setInitiatingRun(true);
    setInitiationError(null);

    try {
      const response = await initiatePayrollRun({
        month: selectedMonth,
        year: selectedYear,
        branchId: effectiveSelectedBranchId,
      });

      if (response?.succeeded && response?.data?._id) {
        setPayrollRun(response.data);
        setCurrentStep(2);
        showSnackbar(response?.message || "Payroll run initiated successfully", "success");
        return;
      }

      setInitiationError(
        response?.message || response?.errors?.[0] || "Failed to initiate payroll run."
      );
    } catch (error: unknown) {
      setInitiationError(
        getApiErrorMessage(error, "Failed to initiate payroll run. Please try again.")
      );
    } finally {
      setInitiatingRun(false);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1 && !payrollRun?._id) {
      void handleInitiatePayrollRun();
      return;
    }

    // Step 3 gate: preflight must be run and must have no CRITICAL errors
    if (currentStep === 3) {
      if (!preflightExecuted || !preflightResult) {
        showSnackbar("Please run the pre-flight validation check before proceeding.", "warning");
        return;
      }
      const hasCriticals = preflightResult.errors.some((e) => e.startsWith("CRITICAL"));
      if (hasCriticals) {
        showSnackbar("Resolve all critical issues before moving to the next step.", "error");
        return;
      }
    }

    // Step 4: auto-save wage inputs if unpersisted changes exist
    if (currentStep === 4 && payrollRun?._id && wageInputsList.length > 0 && !wageInputsSaved) {
      const ok = await handleSaveWageInputs();
      if (!ok) return;
    }

    // Step 6: auto-save salary on-hold list when advancing
    if (currentStep === 6 && payrollRun?._id) {
      const ok = await handleSaveSalaryHold();
      if (!ok) return;
    }

    // Step 7: auto-save tax overrides when advancing
    if (currentStep === 7 && payrollRun?._id) {
      const ok = await handleSaveTaxOverrides();
      if (!ok) return;
    }

    // Step 8: validate that batch has been generated before advancing to Step 9
    if (currentStep === 8) {
      const isAlreadyGenerated =
        payrollRun?.status === "GENERATED" ||
        payrollRun?.status === "APPROVED" ||
        payrollRun?.status === "PAID" ||
        batchGenerated;
      if (!isAlreadyGenerated) {
        showSnackbar("Please generate the pay register batch before moving to CFO Approval.", "warning");
        return;
      }
    }

    if (currentStep < data.steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: { xs: 2, md: 3 } }}>
      {/* Top Header Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
          Monthly Payroll Run
        </Typography>

        <Chip
          label={`${data.periodLabel} · ${data.periodStatus}`}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
            borderColor: "warning.main",
            color: "warning.dark",
            backgroundColor: "warning.lighter",
            px: 1,
            py: 0.5,
          }}
        />
      </Box>

      {/* Stepper Header Card (Matching Employee Onboarding Wizard) */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        {/* Mobile Step Indicator */}
        <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "primary.main" }}>
              Step {currentStep} of {data.steps.length}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
              {data.steps[currentStep - 1]?.label}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(currentStep / data.steps.length) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "action.hover",
              "& .MuiLinearProgress-bar": { backgroundColor: "primary.main" },
            }}
          />
        </Box>

        {/* Desktop Stepper */}
        <Box sx={{ display: { xs: "none", md: "block" }, overflowX: "auto" }}>
          <Stepper activeStep={currentStep - 1} alternativeLabel sx={{ minWidth: 900 }}>
            {data.steps.map((step) => (
              <Step
                key={step.stepNumber}
                onClick={() => {
                  if (step.stepNumber === 1 || payrollRun?._id) {
                    setCurrentStep(step.stepNumber);
                  }
                }}
                sx={{
                  cursor: step.stepNumber === 1 || payrollRun?._id ? "pointer" : "not-allowed",
                  opacity: step.stepNumber === 1 || payrollRun?._id ? 1 : 0.6,
                }}
              >
                <StepLabel
                  slotProps={{
                    label: {
                      sx: {
                        fontSize: "12px",
                        fontWeight: 600,
                        "&.Mui-active": { color: "primary.main", fontWeight: 700 },
                        "&.Mui-completed": { color: "success.main" },
                      },
                    },
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Paper>

      {/* STEP 1: Overview */}
      {currentStep === 1 && (
        <Card
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            maxWidth: 680,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                {data.runTitle}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                  Branch: {data.branchName} · {data.employeeCount} employees · Status:
                </Typography>
                <StatusChip status={data.runStatus} />
              </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                  gap: 2,
                  mb: 2.5,
                }}
              >
                <TextInput
                  select
                  label="Payroll Month"
                  value={selectedMonth}
                  onChange={(event) => {
                    setSelectedMonth(Number(event.target.value));
                    setPayrollRun(null);
                    setInitiationError(null);
                  }}
                  disabled={initiatingRun || Boolean(payrollRun)}
                >
                  {MONTH_OPTIONS.map((month, index) => (
                    <MenuItem key={month} value={index + 1}>
                      {month}
                    </MenuItem>
                  ))}
                </TextInput>

                <TextInput
                  select
                  label="Payroll Year"
                  value={selectedYear}
                  onChange={(event) => {
                    setSelectedYear(Number(event.target.value));
                    setPayrollRun(null);
                    setInitiationError(null);
                  }}
                  disabled={initiatingRun || Boolean(payrollRun)}
                >
                  {Array.from(
                    { length: Math.max(new Date().getFullYear() + 1 - 2020 + 1, 1) },
                    (_, index) => new Date().getFullYear() + 1 - index
                  ).map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </TextInput>

                <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
                  <TextInput
                    select
                    label="Branch"
                    required
                    value={effectiveSelectedBranchId}
                    error={!effectiveSelectedBranchId && initiationError ? "Branch is required" : undefined}
                    onChange={(event) => {
                      setSelectedBranchId(event.target.value);
                      setPayrollRun(null);
                      setInitiationError(null);
                    }}
                    disabled={branchesLoading || initiatingRun || Boolean(payrollRun)}
                  >
                    <MenuItem value="" disabled>
                      {branchesLoading ? "Loading branches..." : "Select Branch"}
                    </MenuItem>
                    {activeBranches.map((branch) => (
                      <MenuItem key={branch._id} value={branch._id}>
                        {branch.name} {branch.isHeadOffice ? "(HQ)" : ""}
                      </MenuItem>
                    ))}
                  </TextInput>
                </Box>
              </Box>

              {initiationError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
                  {initiationError}
                </Alert>
              )}

              {payrollRun && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 1.5 }}>
                  {payrollRun.runNumber} initiated with {payrollRun.totalEmployees ?? 0} employees · Gross ₹
                  {(payrollRun.totalGross ?? 0).toLocaleString("en-IN")} · Net ₹
                  {(payrollRun.totalNet ?? 0).toLocaleString("en-IN")}
                </Alert>
              )}

              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}>
                Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add run notes..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "action.hover",
                    borderRadius: 1.5,
                    fontSize: "14px",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "primary.main" },
                  },
                }}
              />
            </Box>
          </Box>
        </Card>
      )}

      {/* STEP 2: Attendance & LOP */}
      {currentStep === 2 && (
        <Card
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            maxWidth: 680,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                Attendance &amp; Loss of Pay
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                Lock attendance for the payroll period before running validation. Once locked, no further attendance edits can be made for this period.
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2.5,
                borderRadius: 1.5,
                backgroundColor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500, mb: 2 }}>
                Attendance cutoff day: 20. Locking prevents further attendance edits for this period.
              </Typography>

              {attendanceLocked && (
                <Box
                  sx={{
                    p: 1.25,
                    px: 2,
                    borderRadius: 1,
                    backgroundColor: "#DCFCE7",
                    color: "#166534",
                    fontWeight: 600,
                    fontSize: "13.5px",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 18, color: "success.main" }} />
                  Attendance locked {attendanceLockTime ? `at ${attendanceLockTime}` : "for this period"}
                </Box>
              )}

              <Button
                variant="contained"
                onClick={handleLockAttendance}
                disabled={lockingAttendance || attendanceLocked}
                startIcon={lockingAttendance ? <CircularProgress size={18} color="inherit" /> : undefined}
                sx={{
                  px: 3,
                  py: 1.2,
                  backgroundColor: attendanceLocked ? "success.main" : "#F87171",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "15px",
                  textTransform: "none",
                  boxShadow: "none",
                  borderRadius: 1.5,
                  "&:hover": {
                    backgroundColor: attendanceLocked ? "success.dark" : "#EF4444",
                    boxShadow: "none",
                  },
                }}
              >
                {lockingAttendance
                  ? "Locking Attendance..."
                  : attendanceLocked
                  ? "Attendance Locked ✓"
                  : "Lock Attendance"}
              </Button>
            </Box>
          </Box>
        </Card>
      )}

      {/* STEP 3: Validation */}
      {currentStep === 3 && (
        <Card
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            maxWidth: 680,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                Pre-Flight Validation Check
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                Run system validation to verify employee active statuses, salary structures, bank accounts, and tax declarations before proceeding.
              </Typography>
            </Box>

            {/* Run Pre-Flight Check Container Box */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: 1.5,
                backgroundColor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                mt: 1,
              }}
            >
              <Button
                fullWidth
                variant="contained"
                onClick={handleRunPreflight}
                disabled={runningPreflight}
                startIcon={runningPreflight ? <CircularProgress size={18} color="inherit" /> : undefined}
                sx={{
                  py: 1.2,
                  backgroundColor: "#E2E8F0",
                  color: "#1E293B",
                  fontWeight: 700,
                  fontSize: "15px",
                  textTransform: "none",
                  boxShadow: "none",
                  border: "1px solid",
                  borderColor: "#CBD5E1",
                  "&:hover": {
                    backgroundColor: "#CBD5E1",
                    boxShadow: "none",
                  },
                }}
              >
                {runningPreflight ? "Running Validation Checks..." : "Run Pre-Flight Check"}
              </Button>

              {/* Pre-Flight API error — shown inside the container when the call itself fails */}
              {preflightError && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5, fontSize: "13.5px" }}>
                  {preflightError}
                </Alert>
              )}

              {/* Pre-Flight Results — shown after a successful API call */}
              {preflightExecuted && preflightResult && (() => {
                const criticals = preflightResult.errors.filter((e) => e.startsWith("CRITICAL"));
                const warnings  = preflightResult.errors.filter((e) => !e.startsWith("CRITICAL"));
                const allClear  = preflightResult.errors.length === 0;

                return (
                  <Box sx={{ mt: 2.5, pt: 0.5 }}>

                    {/* Summary bar */}
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 0.75,
                        mb: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "14px" }}>
                        Checked {preflightResult.totalChecked}{" "}
                        {preflightResult.totalChecked === 1 ? "employee" : "employees"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>·</Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontSize: "14px",
                          color: criticals.length > 0 ? "error.main" : "success.main",
                        }}
                      >
                        {criticals.length} critical {criticals.length === 1 ? "issue" : "issues"}
                      </Typography>
                      {warnings.length > 0 && (
                        <>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>·</Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, fontSize: "14px", color: "warning.dark" }}
                          >
                            {warnings.length} {warnings.length === 1 ? "warning" : "warnings"}
                          </Typography>
                        </>
                      )}
                    </Box>

                    {/* All clear */}
                    {allClear && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 18, color: "success.main", flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ color: "success.main", fontWeight: 600, fontSize: "13.5px" }}>
                          All checks passed. Ready to proceed to the next step.
                        </Typography>
                      </Box>
                    )}

                    {/* Critical issues — red, blocking */}
                    {criticals.length > 0 && (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mb: warnings.length > 0 ? 2 : 0 }}>
                        {criticals.map((issue, i) => (
                          <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                            <WarningAmberIcon sx={{ fontSize: 17, color: "error.main", mt: "2px", flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ color: "error.main", fontSize: "13.5px", fontWeight: 500 }}>
                              {stripCriticalPrefix(issue)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Warnings — amber, non-blocking */}
                    {warnings.length > 0 && (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                        {warnings.map((warn, i) => (
                          <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                            <WarningAmberIcon sx={{ fontSize: 17, color: "warning.main", mt: "2px", flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13.5px", fontWeight: 500 }}>
                              {stripWarningPrefix(warn)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                  </Box>
                );
              })()}
            </Box>
          </Box>
        </Card>
      )}


      {/* STEP 4: Wage Inputs */}
      {currentStep === 4 && (
        <Card
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            maxWidth: 1000,
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Step Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Wage Inputs & Variable Overtime
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                  Enter verified monthly units worked, hourly/daily base rates, and overtime hours for wage-based workers.
                </Typography>
              </Box>
              {wageInputsSaved && (
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: "16px !important" }} />}
                  label="Saved to Payroll Run"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: "12px" }}
                />
              )}
            </Box>

            {/* KPI Metric Summary Strip */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                gap: 1.5,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "action.hover",
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase" }}>
                  Wage Workers
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mt: 0.5 }}>
                  {wageInputsList.length}
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "action.hover",
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase" }}>
                  Regular Pay
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mt: 0.5 }}>
                  ₹{totalRegularPay.toLocaleString("en-IN")}
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "action.hover",
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase" }}>
                  Total OT Hours
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "warning.dark", mt: 0.5 }}>
                  {totalOtHours} hrs
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "action.hover",
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase" }}>
                  Total Payout
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main", mt: 0.5 }}>
                  ₹{totalWagePayable.toLocaleString("en-IN")}
                </Typography>
              </Paper>
            </Box>

            {/* Quick-Add Row Container */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "action.hover",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: 1.5 }}>
                Add Wage / Overtime Record
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "2fr 1.3fr 1.1fr 1.1fr 1fr 1.1fr auto",
                  },
                  gap: 1.5,
                  alignItems: "end",
                }}
              >
                {/* Employee Select */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Employee
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={wageSelectedEmpId}
                    onChange={(e) => setWageSelectedEmpId(e.target.value)}
                    displayEmpty
                    sx={{
                      backgroundColor: "background.paper",
                      fontSize: "13.5px",
                      borderRadius: 1,
                    }}
                  >
                    <MenuItem value="" disabled sx={{ color: "text.disabled" }}>
                      Select employee...
                    </MenuItem>
                    {employeeCatalog.map((emp) => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {emp.code} - {emp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {/* Worker Type Select */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Type
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={wageWorkerType}
                    onChange={(e) => setWageWorkerType(e.target.value as WageWorkerType)}
                    sx={{
                      backgroundColor: "background.paper",
                      fontSize: "13.5px",
                      borderRadius: 1,
                    }}
                  >
                    <MenuItem value="HOURLY">HOURLY</MenuItem>
                    <MenuItem value="DAILY">DAILY</MenuItem>
                    <MenuItem value="JOB_BASED">JOB_BASED</MenuItem>
                  </Select>
                </Box>

                {/* Rate Input */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Rate (₹)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="Rate"
                    value={wageRate}
                    onChange={(e) => setWageRate(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                        fontSize: "13.5px",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* Units Worked Input */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Units Worked
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="Units"
                    value={wageUnitsWorked}
                    onChange={(e) => setWageUnitsWorked(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                        fontSize: "13.5px",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* OT Hours Input */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    OT Hours
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="0"
                    value={wageOtHours}
                    onChange={(e) => setWageOtHours(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                        fontSize: "13.5px",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* OT Amount Input */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    OT Pay (₹)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="Auto / custom"
                    value={wageOtAmount}
                    onChange={(e) => setWageOtAmount(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                        fontSize: "13.5px",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* Add Entry Button */}
                <Button
                  variant="contained"
                  onClick={handleAddWageInput}
                  disabled={!wageSelectedEmpId}
                  sx={{
                    px: 2.5,
                    py: 0.85,
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: 1,
                    fontSize: "13.5px",
                    boxShadow: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Add Entry
                </Button>
              </Box>
            </Paper>

            {/* Error Alert if any */}
            {wageInputsError && (
              <Alert severity="error" sx={{ borderRadius: 1.5, fontSize: "13.5px" }}>
                {wageInputsError}
              </Alert>
            )}

            {/* Spreadsheet Table */}
            <TableContainer
              sx={{
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
                overflowX: "auto",
              }}
            >
              <Table size="small" sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "action.hover" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                      Employee
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                      Type
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                      Rate (₹)
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                      Units Worked
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                      Regular Pay (₹)
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                      OT Hours
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                      OT Pay (₹)
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                      Total (₹)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {wageInputsList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          No wage-based worker records added yet.
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mt: 0.5 }}>
                          Salaried employees are processed automatically and skip this step.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    wageInputsList.map((row) => {
                      const regularPay = (Number(row?.rate) || 0) * (Number(row?.unitsWorked) || 0);
                      const otPay = Number(row?.otAmount) || 0;
                      const totalPay = regularPay + otPay;
                      return (
                        <TableRow key={row?.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: "13.5px", color: "text.primary" }}>
                            {row?.employeeName}
                            {row?.employeeCode && (
                              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                                {row.employeeCode}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row?.type}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: "11px",
                                fontWeight: 600,
                                borderColor:
                                  row?.type === "HOURLY"
                                    ? "primary.main"
                                    : row?.type === "DAILY"
                                    ? "info.main"
                                    : "secondary.main",
                                color:
                                  row?.type === "HOURLY"
                                    ? "primary.main"
                                    : row?.type === "DAILY"
                                    ? "info.main"
                                    : "secondary.main",
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500, fontSize: "13.5px" }}>
                            ₹{Number(row?.rate).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500, fontSize: "13.5px" }}>
                            {row?.unitsWorked}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: "13.5px", color: "text.primary" }}>
                            ₹{regularPay.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500, fontSize: "13.5px", color: "warning.dark" }}>
                            {row?.otHours ?? 0}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500, fontSize: "13.5px", color: "warning.dark" }}>
                            ₹{otPay.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, fontSize: "13.5px", color: "success.main" }}>
                            ₹{totalPay.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteWageInput(row?.id)}
                              sx={{ color: "error.main", "&:hover": { backgroundColor: "error.lighter" } }}
                            >
                              <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Bottom Actions Row inside Card */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                pt: 1,
              }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                Hourly/daily-wage workers only — salaried staff skip this step.
              </Typography>

              <Button
                variant="contained"
                onClick={handleSaveWageInputs}
                disabled={savingWageInputs || !payrollRun?._id}
                startIcon={savingWageInputs ? <CircularProgress size={16} color="inherit" /> : undefined}
                sx={{
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  fontSize: "13.5px",
                  textTransform: "none",
                  borderRadius: 1.5,
                  boxShadow: "none",
                  backgroundColor: wageInputsSaved ? "success.main" : "primary.main",
                  "&:hover": {
                    backgroundColor: wageInputsSaved ? "success.dark" : "primary.dark",
                    boxShadow: "none",
                  },
                }}
              >
                {savingWageInputs
                  ? "Saving to Run..."
                  : wageInputsSaved
                  ? "Saved to Payroll Run ✓"
                  : "Save Wage Inputs"}
              </Button>
            </Box>
          </Box>
        </Card>
      )}

      {/* STEP 5: Adhoc Variable Pay */}
      {currentStep === 5 && (
        <Card
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            maxWidth: 1000,
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Step Header */}
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Adhoc Variable Pay & Adjustments
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                  Manage one-time bonuses, incentives, arrears, and deductions for {MONTH_OPTIONS[selectedMonth - 1]} {selectedYear}. Approved adjustments are automatically included in payslips.
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {pendingAdjustmentsCount > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    startIcon={approvingAll ? <CircularProgress size={14} color="inherit" /> : <DoneAllIcon fontSize="small" />}
                    onClick={handleApproveAllPending}
                    disabled={approvingAll || loadingAdjustments}
                    sx={{ textTransform: "none", fontWeight: 700, fontSize: "12.5px", borderRadius: 1 }}
                  >
                    Approve All ({pendingAdjustmentsCount})
                  </Button>
                )}
                <Tooltip title="Refresh adjustment records">
                  <IconButton
                    size="small"
                    onClick={loadAdjustments}
                    disabled={loadingAdjustments}
                    sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* KPI Summary Cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 1.5,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "action.hover",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase" }}>
                  Total Records
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mt: 0.25 }}>
                  {totalAdjustmentsCount}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {pendingAdjustmentsCount} pending approval
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "action.hover",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase" }}>
                  Total Additions
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "success.main", mt: 0.25 }}>
                  +₹{totalAdditionsAmount.toLocaleString("en-IN")}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Bonuses & Incentives
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "action.hover",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase" }}>
                  Total Deductions
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "error.main", mt: 0.25 }}>
                  -₹{totalDeductionsAmount.toLocaleString("en-IN")}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Advances & Penalties
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "action.hover",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase" }}>
                  Net Impact
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: netAdjustmentImpact >= 0 ? "success.main" : "error.main",
                    mt: 0.25,
                  }}
                >
                  {netAdjustmentImpact >= 0 ? "+" : "-"}₹{Math.abs(netAdjustmentImpact).toLocaleString("en-IN")}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Net payroll adjustment
                </Typography>
              </Paper>
            </Box>

            {/* Input Form Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "action.hover",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {/* Type selector header */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Add Adjustment Entry
                </Typography>

                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant={adjType === "EARNING" ? "contained" : "outlined"}
                    color="success"
                    onClick={() => handleTypeChange("EARNING")}
                    sx={{
                      fontWeight: 700,
                      fontSize: "12px",
                      textTransform: "none",
                      borderRadius: 1,
                      py: 0.4,
                      px: 1.5,
                    }}
                  >
                    + Earning (Addition)
                  </Button>
                  <Button
                    size="small"
                    variant={adjType === "DEDUCTION" ? "contained" : "outlined"}
                    color="error"
                    onClick={() => handleTypeChange("DEDUCTION")}
                    sx={{
                      fontWeight: 700,
                      fontSize: "12px",
                      textTransform: "none",
                      borderRadius: 1,
                      py: 0.4,
                      px: 1.5,
                    }}
                  >
                    - Deduction (Reduction)
                  </Button>
                </Box>
              </Box>

              {/* Responsive Inputs Grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "2fr 1.6fr 2fr 1.4fr 1.8fr auto",
                  },
                  gap: 1.5,
                  alignItems: "end",
                }}
              >
                {/* Employee Select */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Employee *
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={adjSelectedEmployeeId}
                    onChange={(e) => setAdjSelectedEmployeeId(e.target.value)}
                    displayEmpty
                    sx={{
                      backgroundColor: "background.paper",
                      fontSize: "13px",
                      borderRadius: 1,
                      "& .MuiSelect-select": {
                        pr: "32px !important",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    <MenuItem value="" disabled sx={{ color: "text.disabled" }}>
                      Choose employee...
                    </MenuItem>
                    {employeeCatalog.map((emp) => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {emp.code} — {emp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {/* Category Select */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Category
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={adjCategory}
                    onChange={(e) => handleCategoryChange(e.target.value as AdjustmentCategory)}
                    sx={{
                      backgroundColor: "background.paper",
                      fontSize: "13px",
                      borderRadius: 1,
                      "& .MuiSelect-select": {
                        pr: "32px !important",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    {activeCategories.map((c) => (
                      <MenuItem key={c.value} value={c.value}>
                        {c.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {/* Custom Label / Description */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Label / Description
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. Performance Bonus"
                    value={adjCustomLabel}
                    onChange={(e) => setAdjCustomLabel(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                        fontSize: "13px",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* Amount (₹) */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Amount (₹) *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="0"
                    value={adjAmount}
                    onChange={(e) => setAdjAmount(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                        fontSize: "13px",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* Notes (Optional) */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Notes (Optional)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Remarks / reference"
                    value={adjNotes}
                    onChange={(e) => setAdjNotes(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                        fontSize: "13px",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* Submit Button */}
                <Button
                  variant="contained"
                  color={adjType === "EARNING" ? "primary" : "secondary"}
                  onClick={handleAddAdjustment}
                  disabled={creatingAdjustment || !adjSelectedEmployeeId || !adjAmount}
                  startIcon={creatingAdjustment ? <CircularProgress size={14} color="inherit" /> : undefined}
                  sx={{
                    px: 2.5,
                    py: 0.85,
                    fontWeight: 700,
                    fontSize: "13px",
                    textTransform: "none",
                    borderRadius: 1,
                    whiteSpace: "nowrap",
                    boxShadow: "none",
                  }}
                >
                  {creatingAdjustment ? "Saving..." : "Add Record"}
                </Button>
              </Box>
            </Paper>

            {/* Error Alert if any */}
            {adjError && (
              <Alert severity="error" sx={{ borderRadius: 1.5, fontSize: "13.5px" }}>
                {adjError}
              </Alert>
            )}

            {/* Adjustments Table */}
            {loadingAdjustments ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 5, gap: 1.5 }}>
                <CircularProgress size={32} />
                <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                  Fetching period adjustments...
                </Typography>
              </Box>
            ) : adjustmentsList.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  py: 5,
                  px: 3,
                  textAlign: "center",
                  borderRadius: 1.5,
                  border: "1px dashed",
                  borderColor: "divider",
                  backgroundColor: "action.hover",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                  No variable pay records for this period
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, maxWidth: 500, mx: "auto" }}>
                  Use the entry form above to register bonuses, incentives, arrears, or deductions. Approved entries will automatically be processed in the pay register.
                </Typography>
              </Paper>
            ) : (
              <TableContainer
                sx={{
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  overflowX: "auto",
                }}
              >
                <Table size="small" sx={{ minWidth: 700 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "action.hover" }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Employee
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Type
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Category & Label
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Amount
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Notes
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {adjustmentsList.map((row) => {
                      const empDisplay = (() => {
                        if (typeof row?.employeeId === "object" && row?.employeeId !== null) {
                          const code = row.employeeId.employeeCode || "EMP";
                          const name = `${row.employeeId.firstName || ""} ${row.employeeId.lastName || ""}`.trim() || code;
                          return { code, name };
                        }
                        const empIdStr = typeof row?.employeeId === "string" ? row.employeeId : "";
                        const match = employeeCatalog.find((e) => e.id === empIdStr || e.code === empIdStr);
                        if (match) return { code: match.code, name: match.name };
                        return { code: empIdStr ? `EMP-${empIdStr.slice(-4)}` : "EMP", name: "Employee" };
                      })();

                      const isActing = actionInProgressId === row?._id;

                      return (
                        <TableRow key={row?._id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          {/* Employee */}
                          <TableCell sx={{ py: 1.25 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "13.5px" }}>
                              {empDisplay.code}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                              {empDisplay.name}
                            </Typography>
                          </TableCell>

                          {/* Type */}
                          <TableCell sx={{ py: 1.25 }}>
                            <Chip
                              size="small"
                              label={row?.type === "EARNING" ? "+ Earning" : "- Deduction"}
                              color={row?.type === "EARNING" ? "success" : "error"}
                              variant="outlined"
                              sx={{ fontWeight: 700, fontSize: "11px", height: 22 }}
                            />
                          </TableCell>

                          {/* Category & Label */}
                          <TableCell sx={{ py: 1.25 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "13.5px" }}>
                              {row?.customLabel || row?.category}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                              {row?.category?.replace(/_/g, " ")} · {row?.frequency || "ONE_TIME"}
                            </Typography>
                          </TableCell>

                          {/* Amount */}
                          <TableCell align="right" sx={{ py: 1.25 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                fontSize: "14px",
                                color: row?.type === "EARNING" ? "success.main" : "error.main",
                              }}
                            >
                              {row?.type === "EARNING" ? "+" : "-"}₹{(Number(row?.amount) || 0).toLocaleString("en-IN")}
                            </Typography>
                          </TableCell>

                          {/* Status */}
                          <TableCell sx={{ py: 1.25 }}>
                            <StatusChip status={row?.status || "PENDING"} />
                          </TableCell>

                          {/* Notes */}
                          <TableCell sx={{ py: 1.25, maxWidth: 160 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {row?.notes || "—"}
                            </Typography>
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="right" sx={{ py: 1.25, whiteSpace: "nowrap" }}>
                            {row?.status === "PENDING" && (
                              <Tooltip title="Approve adjustment so it is processed in payslips">
                                <span>
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleApproveAdjustment(row?._id)}
                                    disabled={isActing}
                                    sx={{ mr: 0.5 }}
                                  >
                                    {isActing ? <CircularProgress size={14} color="inherit" /> : <CheckIcon fontSize="small" />}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}

                            <Tooltip title="Delete adjustment">
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteAdjustment(row?._id)}
                                  disabled={isActing}
                                >
                                  <DeleteOutlineOutlinedIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Card>
      )}

      {/* STEP 6: Salary On-Hold */}
      {currentStep === 6 && (
        <Card
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            maxWidth: 900,
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Step Header */}
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Salary On-Hold / Withholding
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                  Withhold salary payouts for specific employees for {MONTH_OPTIONS[selectedMonth - 1]} {selectedYear}. Withheld employees will have their net payouts excluded from the bank transfer file.
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => void handleSaveSalaryHold()}
                disabled={savingHoldList || !payrollRun?._id}
                startIcon={savingHoldList ? <CircularProgress size={14} color="inherit" /> : undefined}
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  textTransform: "none",
                  borderRadius: 1,
                  boxShadow: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {savingHoldList ? "Saving..." : "Save On-Hold List"}
              </Button>
            </Box>

            {/* Hold Counter Banner */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: holdList.length > 0 ? "warning.light" : "divider",
                backgroundColor: holdList.length > 0 ? "warning.lighter" : "action.hover",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <WarningAmberIcon sx={{ color: holdList.length > 0 ? "warning.main" : "text.secondary", fontSize: 24 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                    {holdList.length === 0
                      ? "No employees placed on hold"
                      : `${holdList.length} employee${holdList.length > 1 ? "s" : ""} on hold`}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {holdList.length === 0
                      ? "All eligible employees are scheduled for salary payout."
                      : "Salaries for these employees will be withheld during bank payout until released."}
                  </Typography>
                </Box>
              </Box>

              {holdList.length > 0 && (
                <Chip
                  size="small"
                  label={`${holdList.length} Withheld`}
                  color="warning"
                  sx={{ fontWeight: 700, fontSize: "11px" }}
                />
              )}
            </Paper>

            {/* Input Form Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "action.hover",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                Add Employee to On-Hold List
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "2fr 3fr auto",
                  },
                  gap: 1.5,
                  alignItems: "end",
                }}
              >
                {/* Employee Dropdown */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Employee *
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={holdSelectedEmpId}
                    onChange={(e) => setHoldSelectedEmpId(e.target.value)}
                    displayEmpty
                    sx={{
                      backgroundColor: "background.paper",
                      fontSize: "13px",
                      borderRadius: 1,
                      "& .MuiSelect-select": {
                        pr: "32px !important",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    <MenuItem value="" disabled sx={{ color: "text.disabled" }}>
                      Choose employee...
                    </MenuItem>
                    {employeeCatalog.map((emp) => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {emp.code} — {emp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {/* Reason Input */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Reason for Withholding *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. Pending exit clearance / Investigation"
                    value={holdReason}
                    onChange={(e) => setHoldReason(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                        fontSize: "13px",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* Hold Salary Button */}
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleHoldSalary}
                  disabled={!holdSelectedEmpId}
                  sx={{
                    px: 2.5,
                    py: 0.85,
                    fontWeight: 700,
                    fontSize: "13px",
                    textTransform: "none",
                    borderRadius: 1,
                    whiteSpace: "nowrap",
                    boxShadow: "none",
                  }}
                >
                  Hold Salary
                </Button>
              </Box>

              {/* Quick suggestions chips */}
              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.75, mt: 0.5 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mr: 0.5 }}>
                  Quick reasons:
                </Typography>
                {[
                  "Pending exit clearance",
                  "Absconding / Inactive",
                  "Bank details verification",
                  "Disciplinary inquiry",
                ].map((reason) => (
                  <Chip
                    key={reason}
                    size="small"
                    label={reason}
                    onClick={() => setHoldReason(reason)}
                    sx={{
                      fontSize: "11px",
                      cursor: "pointer",
                      backgroundColor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  />
                ))}
              </Box>
            </Paper>

            {/* Error Alert if any */}
            {holdError && (
              <Alert severity="error" sx={{ borderRadius: 1.5, fontSize: "13.5px" }}>
                {holdError}
              </Alert>
            )}

            {/* Table of Held Salaries */}
            {holdList.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  py: 4,
                  px: 3,
                  textAlign: "center",
                  borderRadius: 1.5,
                  border: "1px dashed",
                  borderColor: "divider",
                  backgroundColor: "action.hover",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                  All employees marked for payout
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, maxWidth: 500, mx: "auto" }}>
                  No employees are currently withheld. If you need to stop payout for any staff member, select their name above and click "Hold Salary".
                </Typography>
              </Paper>
            ) : (
              <TableContainer
                sx={{
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  overflowX: "auto",
                }}
              >
                <Table size="small" sx={{ minWidth: 600 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "action.hover" }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Employee
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Withholding Reason
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Status
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {holdList.map((row) => (
                      <TableRow key={row?.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell sx={{ py: 1.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "13.5px" }}>
                            {row?.employeeCode}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                            {row?.employeeName}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ py: 1.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "13.5px", color: "text.secondary" }}>
                            {row?.reason || "Pending clearance"}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ py: 1.25 }}>
                          <Chip
                            size="small"
                            label="ON HOLD"
                            color="warning"
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: "11px", height: 22 }}
                          />
                        </TableCell>

                        <TableCell align="right" sx={{ py: 1.25 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleReleaseHold(row?.id)}
                            sx={{
                              fontWeight: 700,
                              textTransform: "none",
                              fontSize: "12px",
                              borderRadius: 1,
                              py: 0.25,
                              px: 1.5,
                            }}
                          >
                            Release Hold
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Card>
      )}

      {/* STEP 7: Tax Overrides */}
      {currentStep === 7 && (
        <Card
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            maxWidth: 1000,
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Step Header */}
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Statutory Tax Overrides
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                  Manually specify Income Tax (TDS) or Professional Tax (PT) deductions for {MONTH_OPTIONS[selectedMonth - 1]} {selectedYear}. Unlisted employees will be calculated automatically using tax slabs.
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => void handleSaveTaxOverrides()}
                disabled={savingTaxOverrides || !payrollRun?._id}
                startIcon={savingTaxOverrides ? <CircularProgress size={14} color="inherit" /> : undefined}
                sx={{
                  fontWeight: 700,
                  fontSize: "13px",
                  textTransform: "none",
                  borderRadius: 1,
                  boxShadow: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {savingTaxOverrides ? "Saving..." : "Save Overrides"}
              </Button>
            </Box>

            {/* KPI Summary Cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 1.5,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "action.hover",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase" }}>
                  Total Overrides
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mt: 0.25 }}>
                  {totalTaxOverridesCount}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Employees with custom tax
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "action.hover",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase" }}>
                  Custom TDS Total
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main", mt: 0.25 }}>
                  ₹{totalCustomTdsAmount.toLocaleString("en-IN")}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Total overridden Income Tax
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "action.hover",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase" }}>
                  Custom PT Total
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mt: 0.25 }}>
                  ₹{totalCustomPtAmount.toLocaleString("en-IN")}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Total overridden PT
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "action.hover",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase" }}>
                  Default Calculation
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "success.main", mt: 0.25 }}>
                  System Slabs
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Auto-calculated for other staff
                </Typography>
              </Paper>
            </Box>

            {/* Input Form Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "action.hover",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                Add Custom Tax Override
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "2fr 1.5fr 1.2fr 2fr auto",
                  },
                  gap: 1.5,
                  alignItems: "end",
                }}
              >
                {/* Employee Dropdown */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Employee *
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={taxSelectedEmpId}
                    onChange={(e) => setTaxSelectedEmpId(e.target.value)}
                    displayEmpty
                    sx={{
                      backgroundColor: "background.paper",
                      fontSize: "13px",
                      borderRadius: 1,
                      "& .MuiSelect-select": {
                        pr: "32px !important",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    <MenuItem value="" disabled sx={{ color: "text.disabled" }}>
                      Choose employee...
                    </MenuItem>
                    {employeeCatalog.map((emp) => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {emp.code} — {emp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {/* Income Tax Override Input */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    TDS / Income Tax (₹)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="0"
                    value={incomeTaxOverride}
                    onChange={(e) => setIncomeTaxOverride(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                        fontSize: "13px",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* PT Override Input */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    PT (₹)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="0"
                    value={ptOverride}
                    onChange={(e) => setPtOverride(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                        fontSize: "13px",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* Remarks Input */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Remarks / Justification
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. Form 12BB declaration"
                    value={taxRemarks}
                    onChange={(e) => setTaxRemarks(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                        fontSize: "13px",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* Add Button */}
                <Button
                  variant="contained"
                  onClick={handleAddTaxOverride}
                  disabled={!taxSelectedEmpId || (!incomeTaxOverride && !ptOverride)}
                  sx={{
                    px: 2.5,
                    py: 0.85,
                    fontWeight: 700,
                    fontSize: "13px",
                    textTransform: "none",
                    borderRadius: 1,
                    whiteSpace: "nowrap",
                    boxShadow: "none",
                  }}
                >
                  Add Override
                </Button>
              </Box>

              {/* Quick suggestions chips */}
              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.75, mt: 0.5 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mr: 0.5 }}>
                  Quick reasons:
                </Typography>
                {[
                  "Form 12BB declaration",
                  "Section 80C adjustment",
                  "Senior citizen rebate",
                  "PT state exemption",
                ].map((reason) => (
                  <Chip
                    key={reason}
                    size="small"
                    label={reason}
                    onClick={() => setTaxRemarks(reason)}
                    sx={{
                      fontSize: "11px",
                      cursor: "pointer",
                      backgroundColor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  />
                ))}
              </Box>
            </Paper>

            {/* Error Alert if any */}
            {taxError && (
              <Alert severity="error" sx={{ borderRadius: 1.5, fontSize: "13.5px" }}>
                {taxError}
              </Alert>
            )}

            {/* Table of Added Tax Overrides */}
            {taxOverrideList.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  py: 4,
                  px: 3,
                  textAlign: "center",
                  borderRadius: 1.5,
                  border: "1px dashed",
                  borderColor: "divider",
                  backgroundColor: "action.hover",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Automated tax slabs active for all employees
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, maxWidth: 500, mx: "auto" }}>
                  No manual overrides configured. All staff will have Income Tax (TDS) and Professional Tax computed automatically based on configured tax regimes and salary structure.
                </Typography>
              </Paper>
            ) : (
              <TableContainer
                sx={{
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  overflowX: "auto",
                }}
              >
                <Table size="small" sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "action.hover" }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Employee
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        TDS Override
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        PT Override
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Remarks
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Status
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {taxOverrideList.map((row) => (
                      <TableRow key={row?.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell sx={{ py: 1.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "13.5px" }}>
                            {row?.employeeCode}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                            {row?.employeeName}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ py: 1.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main", fontSize: "13.5px" }}>
                            ₹{(Number(row?.incomeTax) || 0).toLocaleString("en-IN")}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ py: 1.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "13.5px" }}>
                            ₹{(Number(row?.pt) || 0).toLocaleString("en-IN")}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ py: 1.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "13px", color: "text.secondary" }}>
                            {row?.remarks || "Manual adjustment"}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ py: 1.25 }}>
                          <Chip
                            size="small"
                            label="CUSTOM TAX"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: "11px", height: 22 }}
                          />
                        </TableCell>

                        <TableCell align="right" sx={{ py: 1.25 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTaxOverride(row?.id)}
                            sx={{ color: "error.main" }}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Card>
      )}

      {/* STEP 8: Generate Pay Register */}
      {currentStep === 8 && (
        <Card
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            width: "100%",
            maxWidth: { xs: "100%", lg: 1100 },
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Header & Status */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: 1.5,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Step 8: Generate Pay Register & Payslips
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                  Execute full statutory rules, attendance deductions, and variable adjustments to compute net pay.
                </Typography>
              </Box>

              <StatusChip status={payrollRun?.status || (batchGenerated ? "GENERATED" : "DRAFT")} />
            </Box>

            {/* Notification & Generation Controls */}
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 1.5,
                backgroundColor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                Notification Dispatch Settings
              </Typography>

              <RadioGroup
                row
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
                sx={{
                  gap: { xs: 1.5, sm: 3 },
                  display: "flex",
                  flexWrap: "wrap",
                }}
              >
                <FormControlLabel
                  value="EMAIL"
                  control={<Radio size="small" sx={{ color: "primary.main", "&.Mui-checked": { color: "primary.main" } }} />}
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                      Send email notifications
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="SMS"
                  control={<Radio size="small" sx={{ color: "primary.main", "&.Mui-checked": { color: "primary.main" } }} />}
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                      Send SMS notifications
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="BOTH"
                  control={<Radio size="small" sx={{ color: "primary.main", "&.Mui-checked": { color: "primary.main" } }} />}
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                      Email & SMS
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="NONE"
                  control={<Radio size="small" sx={{ color: "primary.main", "&.Mui-checked": { color: "primary.main" } }} />}
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                      Silent Run (No notifications)
                    </Typography>
                  }
                />
              </RadioGroup>

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", pt: 0.5 }}>
                <Button
                  variant="contained"
                  onClick={handleGenerateBatch}
                  disabled={generatingBatch || !payrollRun?._id}
                  startIcon={generatingBatch ? <CircularProgress size={18} color="inherit" /> : undefined}
                  sx={{
                    px: 3.5,
                    py: 1.2,
                    backgroundColor: "error.main",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "14.5px",
                    textTransform: "none",
                    boxShadow: "none",
                    borderRadius: 1.5,
                    "&:hover": {
                      backgroundColor: "error.dark",
                      boxShadow: "none",
                    },
                  }}
                >
                  {generatingBatch
                    ? "Calculating & Generating..."
                    : batchGenerated
                    ? "Regenerate Batch"
                    : "Generate Batch"}
                </Button>

                {batchGenerated && payrollRun?._id && (
                  <Button
                    variant="outlined"
                    onClick={() => void loadRunPayslips(payrollRun._id)}
                    disabled={loadingPayslips}
                    startIcon={loadingPayslips ? <CircularProgress size={16} /> : <RefreshIcon />}
                    sx={{
                      py: 1.2,
                      px: 2.5,
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 1.5,
                    }}
                  >
                    Refresh Register
                  </Button>
                )}
              </Box>

              {/* Error Alert */}
              {batchError && (
                <Alert
                  severity="error"
                  icon={<WarningAmberIcon fontSize="inherit" />}
                  sx={{ borderRadius: 1.5, fontWeight: 500 }}
                >
                  {batchError}
                </Alert>
              )}

              {/* Success Result */}
              {batchGenerated && (
                <Alert
                  severity="success"
                  icon={<CheckCircleIcon fontSize="inherit" />}
                  sx={{ borderRadius: 1.5, fontWeight: 600 }}
                >
                  Pay register batch generated successfully for{" "}
                  {generationStats?.generatedCount ?? payslipsList.length ?? payrollRun?.totalEmployees ?? 0}{" "}
                  employees!{" "}
                  {notificationType === "NONE"
                    ? "No notifications queued."
                    : `${notificationType === "BOTH" ? "Email and SMS" : notificationType} notifications queued.`}
                </Alert>
              )}
            </Box>

            {/* KPI Metric Summary Cards (Live Calculations) */}
            {(batchGenerated || payrollRun?.status === "GENERATED") && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 2,
                }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    backgroundColor: "background.paper",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    Employees Processed
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mt: 0.5 }}>
                    {generationStats?.generatedCount ?? payslipsList.length ?? payrollRun?.totalEmployees ?? 0}
                  </Typography>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    backgroundColor: "background.paper",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    Total Gross Earnings
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main", mt: 0.5 }}>
                    ₹
                    {(
                      Number(
                        payrollRun?.totalGrossAmount ||
                          payslipsList.reduce((sum, p) => sum + (Number(p.grossEarned) || 0), 0)
                      ) || 0
                    ).toLocaleString("en-IN")}
                  </Typography>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    backgroundColor: "background.paper",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    Total Deductions
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "error.main", mt: 0.5 }}>
                    ₹
                    {(
                      Number(
                        payrollRun?.totalDeductionsAmount ||
                          payslipsList.reduce((sum, p) => sum + (Number(p.totalDeductions) || 0), 0)
                      ) || 0
                    ).toLocaleString("en-IN")}
                  </Typography>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    backgroundColor: "background.paper",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    Net Payout
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "success.main", mt: 0.5 }}>
                    ₹
                    {(
                      Number(
                        payrollRun?.totalNetAmount ||
                          payslipsList.reduce((sum, p) => sum + (Number(p.netPay) || 0), 0)
                      ) || 0
                    ).toLocaleString("en-IN")}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Computed Pay Register Table */}
            {batchGenerated && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                    Computed Pay Register ({payslipsList.length} Records)
                  </Typography>
                  {loadingPayslips && <CircularProgress size={18} />}
                </Box>

                {payslipsList.length === 0 ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 4,
                      textAlign: "center",
                      borderRadius: 1.5,
                      backgroundColor: "action.hover",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                      No payslips found for this run. Click &quot;Generate Batch&quot; to compute payslips.
                    </Typography>
                  </Paper>
                ) : (
                  <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{
                      borderRadius: 1.5,
                      borderColor: "divider",
                      overflowX: "auto",
                      maxHeight: 480,
                    }}
                  >
                    <Table size="small" stickyHeader sx={{ minWidth: 680 }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "action.hover" }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary" }}>
                            EMPLOYEE
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary" }}>
                            PAYABLE DAYS
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary" }}>
                            GROSS (₹)
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary" }}>
                            DEDUCTIONS (₹)
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary" }}>
                            NET PAY (₹)
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary" }}>
                            STATUS
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {payslipsList.map((row) => {
                          const empObj =
                            typeof row.employeeId === "object" && row.employeeId !== null
                              ? row.employeeId
                              : null;
                          const empCode = empObj?.employeeCode || "EMP";
                          const empName = empObj
                            ? `${empObj.firstName || ""} ${empObj.lastName || ""}`.trim()
                            : "Employee";
                          const payableDays =
                            row.attendanceSummary?.payableDays ??
                            row.attendanceSummary?.totalDaysInMonth ??
                            "—";
                          const totalDays = row.attendanceSummary?.totalDaysInMonth ?? 30;

                          return (
                            <TableRow key={row._id} hover>
                              <TableCell sx={{ py: 1.25 }}>
                                <Box sx={{ display: "flex", flexDirection: "column" }}>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 700, color: "text.primary", fontSize: "13.5px" }}
                                  >
                                    {empName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "text.secondary", fontWeight: 500 }}
                                  >
                                    {empCode}
                                  </Typography>
                                </Box>
                              </TableCell>

                              <TableCell align="center" sx={{ py: 1.25 }}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600, color: "text.primary", fontSize: "13px" }}
                                >
                                  {payableDays} / {totalDays}
                                </Typography>
                              </TableCell>

                              <TableCell align="right" sx={{ py: 1.25 }}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600, color: "primary.main", fontSize: "13.5px" }}
                                >
                                  ₹{(Number(row.grossEarned) || 0).toLocaleString("en-IN")}
                                </Typography>
                              </TableCell>

                              <TableCell align="right" sx={{ py: 1.25 }}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600, color: "error.main", fontSize: "13.5px" }}
                                >
                                  ₹{(Number(row.totalDeductions) || 0).toLocaleString("en-IN")}
                                </Typography>
                              </TableCell>

                              <TableCell align="right" sx={{ py: 1.25 }}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 700, color: "success.main", fontSize: "14px" }}
                                >
                                  ₹{(Number(row.netPay) || 0).toLocaleString("en-IN")}
                                </Typography>
                              </TableCell>

                              <TableCell align="center" sx={{ py: 1.25 }}>
                                <Chip
                                  size="small"
                                  label="GENERATED"
                                  color="success"
                                  variant="outlined"
                                  sx={{ fontWeight: 700, fontSize: "11px", height: 22 }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </Box>
        </Card>
      )}

      {/* STEP 9: CFO Approval */}
      {currentStep === 9 && (
        <Card
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            maxWidth: 680,
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Inner container matching reference screenshot */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: 1.5,
                backgroundColor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {/* Description text */}
              <Typography
                variant="body2"
                sx={{ color: "text.primary", fontWeight: 500, mb: 2, fontSize: "14px" }}
              >
                Freezes all calculations for August 2026. Requires payroll.approve (CFO / ORG_ADMIN).
              </Typography>

              {/* Approval Notes textarea */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "text.secondary", mb: 0.75, display: "block" }}
                >
                  Approval Notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add approval notes..."
                  disabled={approved}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "background.paper",
                      borderRadius: 1.5,
                      fontSize: "14px",
                      "& fieldset": { borderColor: "divider" },
                      "&:hover fieldset": { borderColor: "primary.main" },
                    },
                  }}
                />
              </Box>

              {/* Approve & Freeze Button */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleApproveAndFreeze}
                disabled={approving || approved}
                startIcon={approving ? <CircularProgress size={18} color="inherit" /> : undefined}
                sx={{
                  py: 1.4,
                  backgroundColor: "#F87171",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "15px",
                  textTransform: "none",
                  boxShadow: "none",
                  borderRadius: 1.5,
                  "&:hover": {
                    backgroundColor: "#EF4444",
                    boxShadow: "none",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#FECACA",
                    color: "#FFFFFF",
                  },
                }}
              >
                {approving ? "Approving..." : approved ? "Approved & Frozen ✓" : "Approve & Freeze"}
              </Button>
            </Box>

            {/* Approval Success Alert */}
            {approved && (
              <Alert
                severity="success"
                icon={<CheckCircleIcon fontSize="inherit" />}
                sx={{ borderRadius: 1.5, fontWeight: 600 }}
              >
                August 2026 payroll run approved and frozen. All calculations are now locked.
              </Alert>
            )}
          </Box>
        </Card>
      )}

      {/* STEP 10: Payout & Mark Paid */}
      {currentStep === 10 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, maxWidth: 680, width: "100%" }}>

          {/* Export Bank File Section */}
          <Card
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 2 }}>
              Export Bank File
            </Typography>

            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                backgroundColor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {/* Format info */}
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, fontSize: "13.5px" }}>
                Format: Noida Branch - Kotak CMS Format
              </Typography>

              {/* Download Button */}
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  py: 1.2,
                  backgroundColor: "background.paper",
                  color: "text.primary",
                  fontWeight: 700,
                  fontSize: "14.5px",
                  textTransform: "none",
                  boxShadow: "none",
                  borderRadius: 1.5,
                  borderColor: "divider",
                  "&:hover": {
                    backgroundColor: "action.selected",
                    borderColor: "text.secondary",
                    boxShadow: "none",
                  },
                }}
              >
                Download Bank File (CSV)
              </Button>
            </Box>
          </Card>

          {/* Mark as Paid Section */}
          <Card
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 2 }}>
              Mark as Paid
            </Typography>

            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                backgroundColor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {/* Mark as Paid Button */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleMarkAsPaid}
                disabled={markingPaid || markedPaid}
                startIcon={markingPaid ? <CircularProgress size={18} color="inherit" /> : undefined}
                sx={{
                  py: 1.4,
                  backgroundColor: "#F87171",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "15px",
                  textTransform: "none",
                  boxShadow: "none",
                  borderRadius: 1.5,
                  "&:hover": {
                    backgroundColor: "#EF4444",
                    boxShadow: "none",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#FECACA",
                    color: "#FFFFFF",
                  },
                }}
              >
                {markingPaid ? "Processing..." : markedPaid ? "Payroll Run Marked as Paid ✓" : "Mark Payroll Run as Paid"}
              </Button>

              {/* Success Alert */}
              {markedPaid && (
                <Alert
                  severity="success"
                  icon={<CheckCircleIcon fontSize="inherit" />}
                  sx={{ borderRadius: 1.5, fontWeight: 600 }}
                >
                  August 2026 payroll run has been marked as Paid. Payslips are now available to employees.
                </Alert>
              )}
            </Box>
          </Card>
        </Box>
      )}

      {/* Bottom Action Controls (Matching Employee Onboarding Wizard) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          maxWidth: 680,
          flexDirection: { xs: "column-reverse", sm: "row" },
        }}
      >
        <Button
          variant="outlined"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          startIcon={<ArrowBackIcon />}
          sx={{
            px: 3,
            py: 1.2,
            borderRadius: "10px",
            color: "#64748B",
            borderColor: "#CBD5E1",
            textTransform: "none",
            fontWeight: 600,
            width: { xs: "100%", sm: "auto" },
            "&:hover": {
              borderColor: "#94A3B8",
              backgroundColor: "action.hover",
            },
          }}
        >
          Back
        </Button>

        <Button
          variant="contained"
          onClick={handleNextStep}
          disabled={currentStep === data.steps.length || initiatingRun}
          endIcon={initiatingRun ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />}
          sx={{
            px: 4,
            py: 1.2,
            borderRadius: "10px",
            backgroundColor: "#4F46E5",
            fontWeight: 700,
            textTransform: "none",
            fontSize: "14px",
            width: { xs: "100%", sm: "auto" },
            "&:hover": {
              backgroundColor: "#4338CA",
            },
            "&.Mui-disabled": {
              backgroundColor: "action.disabledBackground",
              color: "action.disabled",
            },
          }}
        >
          {currentStep === 1 && !payrollRun
            ? initiatingRun
              ? "Initiating Payroll Run..."
              : "Initiate Payroll Run"
            : "Next Step"}
        </Button>
      </Box>
    </Box>
  );
}
