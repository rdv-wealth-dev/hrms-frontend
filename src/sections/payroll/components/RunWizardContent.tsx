import { useState } from "react";
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
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import StatusChip from "../../../components/common/StatusChip";
import type { PayrollRunWizardData, AdhocVariablePayItem, SalaryOnHoldItem, TaxOverrideItem } from "../../../types/payroll.types";

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
    { stepNumber: 2, label: "Validation" },
    { stepNumber: 3, label: "Attendance & LOP" },
    { stepNumber: 4, label: "Wage Inputs" },
    { stepNumber: 5, label: "Adhoc Variable Pay" },
    { stepNumber: 6, label: "Salary On-Hold" },
    { stepNumber: 7, label: "Tax Overrides" },
    { stepNumber: 8, label: "Generate Pay Register" },
    { stepNumber: 9, label: "CFO Approval" },
    { stepNumber: 10, label: "Payout & Mark Paid" },
  ],
};

export default function RunWizardContent() {
  const data = EMPTY_WIZARD_DATA;
  const [currentStep, setCurrentStep] = useState<number>(data.currentStep);
  const [notes, setNotes] = useState<string>(data.notes);
  const [runningPreflight, setRunningPreflight] = useState<boolean>(false);
  const [preflightExecuted, setPreflightExecuted] = useState<boolean>(false);
  const [attendanceLocked, setAttendanceLocked] = useState<boolean>(true);
  const [attendanceLockTime, setAttendanceLockTime] = useState<string>("2026-09-08 08:26");

  // Step 5 Adhoc Variable Pay state
  const [adhocList, setAdhocList] = useState<AdhocVariablePayItem[]>(data.adhocVariablePay || []);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedComponent, setSelectedComponent] = useState<string>("PERFORMANCE_BONUS");
  const [adhocAmount, setAdhocAmount] = useState<string>("");
  const [adhocRemarks, setAdhocRemarks] = useState<string>("");

  const employeeOptions = [
    { code: "EMP-0001", name: "Aditi Sharma" },
    { code: "EMP-0002", name: "Rohan Mehta" },
    { code: "EMP-0003", name: "Priya Nair" },
    { code: "EMP-0004", name: "Karan Verma" },
    { code: "EMP-0005", name: "Neha Gupta" },
    { code: "EMP-0006", name: "Vikram Singh" },
    { code: "EMP-0007", name: "Ananya Iyer" },
    { code: "EMP-0008", name: "Rahul Deshmukh" },
    { code: "EMP-0009", name: "Sneha Kulkarni" },
    { code: "EMP-0010", name: "Sourabh Panchal" },
    { code: "EMP-0011", name: "Farhan Sheikh" },
    { code: "EMP-0012", name: "Meera Joshi" },
  ];

  const componentOptions = ["PERFORMANCE_BONUS", "ARREARS", "INCENTIVE"];

  const handleAddAdhoc = () => {
    if (!selectedEmployee) return;
    const emp = employeeOptions.find((e) => e.code === selectedEmployee);
    const newItem: AdhocVariablePayItem = {
      id: `adhoc-${Date.now()}`,
      employeeCode: selectedEmployee,
      employeeName: emp?.name || selectedEmployee,
      component: selectedComponent,
      amount: adhocAmount || "0",
      remarks: adhocRemarks || "-",
    };
    setAdhocList((prev) => [...prev, newItem]);
    setSelectedEmployee("");
    setAdhocAmount("");
    setAdhocRemarks("");
  };

  const handleDeleteAdhoc = (id: string) => {
    setAdhocList((prev) => prev.filter((item) => item.id !== id));
  };

  // Step 6 Salary On-Hold state
  const [holdList, setHoldList] = useState<SalaryOnHoldItem[]>(data.salaryOnHold || []);
  const [holdSelectedEmployee, setHoldSelectedEmployee] = useState<string>("");
  const [holdReason, setHoldReason] = useState<string>("");

  const handleHoldSalary = () => {
    if (!holdSelectedEmployee) return;
    const emp = employeeOptions.find((e) => e.code === holdSelectedEmployee);
    const newItem: SalaryOnHoldItem = {
      id: `hold-${Date.now()}`,
      employeeCode: holdSelectedEmployee,
      employeeName: emp?.name || holdSelectedEmployee,
      reason: holdReason || "Pending verification",
    };
    setHoldList((prev) => [...prev, newItem]);
    setHoldSelectedEmployee("");
    setHoldReason("");
  };

  const handleReleaseHold = (id: string) => {
    setHoldList((prev) => prev.filter((item) => item.id !== id));
  };

  // Step 7 Tax Overrides state
  const [taxOverrideList, setTaxOverrideList] = useState<TaxOverrideItem[]>(data.taxOverrides || []);
  const [taxSelectedEmployee, setTaxSelectedEmployee] = useState<string>("");
  const [incomeTaxOverride, setIncomeTaxOverride] = useState<string>("");
  const [ptOverride, setPtOverride] = useState<string>("");
  const [taxRemarks, setTaxRemarks] = useState<string>("");

  const handleAddTaxOverride = () => {
    if (!taxSelectedEmployee) return;
    const emp = employeeOptions.find((e) => e.code === taxSelectedEmployee);
    const newItem: TaxOverrideItem = {
      id: `tax-${Date.now()}`,
      employeeCode: taxSelectedEmployee,
      employeeName: emp?.name || taxSelectedEmployee,
      incomeTax: incomeTaxOverride || "0",
      pt: ptOverride || "0",
      remarks: taxRemarks || "-",
    };
    setTaxOverrideList((prev) => [...prev, newItem]);
    setTaxSelectedEmployee("");
    setIncomeTaxOverride("");
    setPtOverride("");
    setTaxRemarks("");
  };

  const handleDeleteTaxOverride = (id: string) => {
    setTaxOverrideList((prev) => prev.filter((item) => item.id !== id));
  };

  // Step 8 Generate Pay Register state
  const [notificationType, setNotificationType] = useState<string>("EMAIL");
  const [generatingBatch, setGeneratingBatch] = useState<boolean>(false);
  const [batchGenerated, setBatchGenerated] = useState<boolean>(false);

  // Step 9 CFO Approval state
  const [approvalNotes, setApprovalNotes] = useState<string>("");
  const [approving, setApproving] = useState<boolean>(false);
  const [approved, setApproved] = useState<boolean>(false);

  // Step 10 Payout & Mark Paid state
  const [markingPaid, setMarkingPaid] = useState<boolean>(false);
  const [markedPaid, setMarkedPaid] = useState<boolean>(false);

  const handleGenerateBatch = () => {
    setGeneratingBatch(true);
    setTimeout(() => {
      setGeneratingBatch(false);
      setBatchGenerated(true);
    }, 800);
  };

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

  const handleRunPreflight = () => {
    setRunningPreflight(true);
    setTimeout(() => {
      setRunningPreflight(false);
      setPreflightExecuted(true);
    }, 600);
  };

  const handleLockAttendance = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5);
    setAttendanceLockTime(`${dateStr} ${timeStr}`);
    setAttendanceLocked(true);
  };

  const handleNextStep = () => {
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
                onClick={() => setCurrentStep(step.stepNumber)}
                sx={{ cursor: "pointer" }}
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

      {/* STEP 2: Validation */}
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

              {/* Pre-Flight Inspection Results (Expanded on Click / Executed) */}
              {preflightExecuted && (
                <Box sx={{ mt: 2.5, pt: 0.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      mb: 2,
                      fontSize: "14px",
                    }}
                  >
                    Checked 12 employees ·{" "}
                    <Box component="span" sx={{ color: "error.main", fontWeight: 700 }}>
                      0 critical errors
                    </Box>
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <WarningAmberIcon sx={{ fontSize: 18, color: "text.secondary", opacity: 0.7 }} />
                      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13.5px", fontWeight: 500 }}>
                        2 employees missing PAN on file
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <WarningAmberIcon sx={{ fontSize: 18, color: "text.secondary", opacity: 0.7 }} />
                      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13.5px", fontWeight: 500 }}>
                        1 employee has an unverified bank IFSC
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Card>
      )}

      {/* STEP 3: Attendance & LOP */}
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
                Attendance cutoff day: 20. Locking prevents further attendance edits for August 2026.
              </Typography>

              {attendanceLocked && (
                <Box
                  sx={{
                    p: 1.25,
                    px: 2,
                    borderRadius: 1,
                    backgroundColor: "#FEE2E2",
                    color: "#991B1B",
                    fontWeight: 600,
                    fontSize: "13.5px",
                    mb: 2,
                  }}
                >
                  Locked at{attendanceLockTime}
                </Box>
              )}

              <Button
                variant="contained"
                onClick={handleLockAttendance}
                sx={{
                  px: 3,
                  py: 1.2,
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
                }}
              >
                Lock Attendance
              </Button>
            </Box>
          </Box>
        </Card>
      )}

      {/* STEP 4: Wage Inputs */}
      {currentStep === 4 && (
        <Card
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            maxWidth: 800,
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TableContainer
              sx={{
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
                overflowX: "auto",
              }}
            >
              <Table size="medium" sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "action.hover" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Employee
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Type
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Rate
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Units Worked
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      OT Hours
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      OT Amount
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {data?.wageInputs?.map((row) => (
                    <TableRow key={row?.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: "14px", color: "text.primary" }}>
                        {row?.employeeName}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "13px", color: "text.secondary" }}>
                        {row?.type}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "14px", color: "text.primary" }}>
                        {row?.rate}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: "14px", color: "text.primary" }}>
                        {row?.unitsWorked}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: "14px", color: "text.primary" }}>
                        {row?.otHours}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "14px", color: "text.primary" }}>
                        {row?.otAmount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, mt: 0.5 }}>
              Hourly/daily-wage workers only — salaried staff skip this step.
            </Typography>
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
            maxWidth: 900,
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Input Form Row matching reference screenshots */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "action.hover",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "2fr 2.6fr 1.5fr 2fr auto",
                  },
                  gap: 1.5,
                  alignItems: "end",
                }}
              >
                {/* Employee Dropdown */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Employee
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    displayEmpty
                    sx={{
                      backgroundColor: "background.paper",
                      fontSize: "13.5px",
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
                      Choose...
                    </MenuItem>
                    {employeeOptions.map((emp) => (
                      <MenuItem key={emp.code} value={emp.code}>
                        {emp.code}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {/* Component Dropdown */}
                <Box sx={{ minWidth: 180 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Component
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={selectedComponent}
                    onChange={(e) => setSelectedComponent(e.target.value)}
                    sx={{
                      backgroundColor: "background.paper",
                      fontSize: "13.5px",
                      borderRadius: 1,
                      "& .MuiSelect-select": {
                        pr: "32px !important",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    {componentOptions.map((comp) => (
                      <MenuItem key={comp} value={comp}>
                        {comp}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {/* Amount Input */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Amount
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Amount"
                    value={adhocAmount}
                    onChange={(e) => setAdhocAmount(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                        fontSize: "14px",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* Remarks Input */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Remarks
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Remarks"
                    value={adhocRemarks}
                    onChange={(e) => setAdhocRemarks(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                        fontSize: "14px",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* Add Button */}
                <Button
                  variant="outlined"
                  onClick={handleAddAdhoc}
                  disabled={!selectedEmployee}
                  sx={{
                    px: 3,
                    py: 0.85,
                    fontWeight: 700,
                    fontSize: "14px",
                    textTransform: "none",
                    borderColor: "#CBD5E1",
                    color: "text.primary",
                    backgroundColor: "background.paper",
                    borderRadius: 1,
                    whiteSpace: "nowrap",
                    "&:hover": {
                      backgroundColor: "action.hover",
                      borderColor: "#94A3B8",
                    },
                  }}
                >
                  Add
                </Button>
              </Box>
            </Paper>

            {/* List Table of Added Records */}
            {adhocList.length > 0 && (
              <TableContainer
                sx={{
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  overflowX: "auto",
                }}
              >
                <Table size="medium" sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "action.hover" }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Employee
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Component
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Amount
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Remarks
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {adhocList.map((row) => (
                      <TableRow key={row?.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: "14px", color: "text.primary" }}>
                          {row?.employeeCode} ({row?.employeeName})
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "13px", color: "text.secondary" }}>
                          {row?.component}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "14px", color: "text.primary" }}>
                          {row?.amount ? (row.amount.startsWith("₹") ? row.amount : `₹${row.amount}`) : "₹0"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, fontSize: "14px", color: "text.secondary" }}>
                          {row?.remarks || "-"}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleDeleteAdhoc(row?.id)} sx={{ color: "error.main" }}>
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

      {/* STEP 6: Salary On-Hold */}
      {currentStep === 6 && (
        <Card
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            maxWidth: 800,
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Table of Held Salaries */}
            {holdList.length > 0 && (
              <TableContainer
                sx={{
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  overflowX: "auto",
                }}
              >
                <Table size="medium" sx={{ minWidth: 600 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "action.hover" }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Employee
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Reason
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {holdList.map((row) => (
                      <TableRow key={row?.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: "14px", color: "text.primary" }}>
                          {row?.employeeName} ({row?.employeeCode})
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, fontSize: "14px", color: "text.secondary" }}>
                          {row?.reason}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() => handleReleaseHold(row?.id)}
                            sx={{
                              color: "error.main",
                              fontWeight: 700,
                              textTransform: "none",
                              fontSize: "14px",
                              "&:hover": {
                                backgroundColor: "error.lighter",
                              },
                            }}
                          >
                            Release
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Input Form Row at bottom matching reference screenshot */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "action.hover",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1.5fr 3fr auto",
                  },
                  gap: 1.5,
                  alignItems: "end",
                }}
              >
                {/* Employee Dropdown */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Employee
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={holdSelectedEmployee}
                    onChange={(e) => setHoldSelectedEmployee(e.target.value)}
                    displayEmpty
                    sx={{
                      backgroundColor: "background.paper",
                      fontSize: "13.5px",
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
                      Choose...
                    </MenuItem>
                    {employeeOptions.map((emp) => (
                      <MenuItem key={emp.code} value={emp.code}>
                        {emp.code}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {/* Reason Input */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Reason
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Reason for holding salary..."
                    value={holdReason}
                    onChange={(e) => setHoldReason(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                        fontSize: "14px",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* Hold Salary Button */}
                <Button
                  variant="outlined"
                  onClick={handleHoldSalary}
                  disabled={!holdSelectedEmployee}
                  sx={{
                    px: 3,
                    py: 0.85,
                    fontWeight: 700,
                    fontSize: "14px",
                    textTransform: "none",
                    borderColor: "#CBD5E1",
                    color: "text.primary",
                    backgroundColor: "background.paper",
                    borderRadius: 1,
                    whiteSpace: "nowrap",
                    "&:hover": {
                      backgroundColor: "action.hover",
                      borderColor: "#94A3B8",
                    },
                  }}
                >
                  Hold Salary
                </Button>
              </Box>
            </Paper>
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
            maxWidth: 900,
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Input Form Row matching reference screenshot */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "action.hover",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "2fr 1.8fr 1.5fr 2fr auto",
                  },
                  gap: 1.5,
                  alignItems: "end",
                }}
              >
                {/* Employee Dropdown */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Employee
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={taxSelectedEmployee}
                    onChange={(e) => setTaxSelectedEmployee(e.target.value)}
                    displayEmpty
                    sx={{
                      backgroundColor: "background.paper",
                      fontSize: "13.5px",
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
                      Choose...
                    </MenuItem>
                    {employeeOptions.map((emp) => (
                      <MenuItem key={emp.code} value={emp.code}>
                        {emp.code}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {/* Income Tax Override Input */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Income Tax
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="Amount"
                    value={incomeTaxOverride}
                    onChange={(e) => setIncomeTaxOverride(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                        fontSize: "14px",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* PT Override Input */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    PT
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Amount"
                    value={ptOverride}
                    onChange={(e) => setPtOverride(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                        fontSize: "14px",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* Remarks Input */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5, display: "block" }}>
                    Remarks
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Remarks"
                    value={taxRemarks}
                    onChange={(e) => setTaxRemarks(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "background.paper",
                        fontSize: "14px",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* Add Button */}
                <Button
                  variant="outlined"
                  onClick={handleAddTaxOverride}
                  disabled={!taxSelectedEmployee}
                  sx={{
                    px: 3,
                    py: 0.85,
                    fontWeight: 700,
                    fontSize: "14px",
                    textTransform: "none",
                    borderColor: "#CBD5E1",
                    color: "text.primary",
                    backgroundColor: "background.paper",
                    borderRadius: 1,
                    whiteSpace: "nowrap",
                    "&:hover": {
                      backgroundColor: "action.hover",
                      borderColor: "#94A3B8",
                    },
                  }}
                >
                  Add
                </Button>
              </Box>
            </Paper>

            {/* List Table of Added Tax Overrides */}
            {taxOverrideList.length > 0 && (
              <TableContainer
                sx={{
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  overflowX: "auto",
                }}
              >
                <Table size="medium" sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "action.hover" }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Employee
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Income Tax Override
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        PT Override
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Remarks
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary", textTransform: "uppercase" }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {taxOverrideList.map((row) => (
                      <TableRow key={row?.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: "14px", color: "text.primary" }}>
                          {row?.employeeCode} ({row?.employeeName})
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "14px", color: "text.primary" }}>
                          {row?.incomeTax ? (row.incomeTax.startsWith("₹") ? row.incomeTax : `₹${row.incomeTax}`) : "₹0"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "14px", color: "text.primary" }}>
                          {row?.pt ? (row.pt.startsWith("₹") ? row.pt : `₹${row.pt}`) : "₹0"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, fontSize: "14px", color: "text.secondary" }}>
                          {row?.remarks || "-"}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleDeleteTaxOverride(row?.id)} sx={{ color: "error.main" }}>
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
            {/* Notification Radio Options Row matching reference screenshot */}
            <RadioGroup
              row
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value)}
              sx={{ gap: 3, flexWrap: "wrap" }}
            >
              <FormControlLabel
                value="EMAIL"
                control={<Radio size="small" sx={{ color: "error.main", "&.Mui-checked": { color: "error.main" } }} />}
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                    Send email notifications
                  </Typography>
                }
              />
              <FormControlLabel
                value="SMS"
                control={<Radio size="small" sx={{ color: "error.main", "&.Mui-checked": { color: "error.main" } }} />}
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                    Send SMS notifications
                  </Typography>
                }
              />
            </RadioGroup>

            {/* Action Button matching screenshot */}
            <Box>
              <Button
                variant="contained"
                onClick={handleGenerateBatch}
                disabled={generatingBatch}
                startIcon={generatingBatch ? <CircularProgress size={18} color="inherit" /> : undefined}
                sx={{
                  px: 4,
                  py: 1.2,
                  backgroundColor: "error.main",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "15px",
                  textTransform: "none",
                  boxShadow: "none",
                  borderRadius: 1.5,
                  "&:hover": {
                    backgroundColor: "error.dark",
                    boxShadow: "none",
                  },
                }}
              >
                {generatingBatch ? "Generating Batch..." : "Generate Batch"}
              </Button>
            </Box>

            {/* Batch Generation Success Result */}
            {batchGenerated && (
              <Alert
                severity="success"
                icon={<CheckCircleIcon fontSize="inherit" />}
                sx={{ borderRadius: 1.5, fontWeight: 600, mt: 1 }}
              >
                Pay register batch generated successfully for {data.employeeCount} employees! {notificationType === "EMAIL" ? "Email" : "SMS"} notifications queued.
              </Alert>
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
          disabled={currentStep === data.steps.length}
          endIcon={<ArrowForwardIcon />}
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
          Next Step
        </Button>
      </Box>
    </Box>
  );
}
