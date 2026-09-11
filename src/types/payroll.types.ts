export interface PayrollKpiItem {
  id: string;
  title: string;
  value: string | number;
  subtext?: string;
  variant?: "green" | "purple" | "amber" | "rose" | "blue";
}

export interface StatutoryDueDateItem {
  id: string;
  title: string;
  dueDate: string;
  status: string;
}

export interface PayrollActivityItem {
  id: string;
  action: string;
  meta: string;
}

export interface PayrollOverviewData {
  periodLabel: string;
  periodStatus: string;
  kpiItems: PayrollKpiItem[];
  currentRun: {
    title: string;
    description: string;
    buttonText: string;
    stepInfo: string;
  };
  statutoryDueDates: StatutoryDueDateItem[];
  recentActivity: PayrollActivityItem[];
}

export type SalaryComponentType = "EARNING" | "DEDUCTION";
export type CalculationType = "FLAT" | "PERCENTAGE" | "FORMULA";

export interface SalaryComponentItem {
  _id?: string;
  id?: string;
  code: string;
  name: string;
  type: SalaryComponentType;
  calculationType?: CalculationType;
  isTaxable?: boolean;
  isPartOfWages?: boolean;
  isStatutory?: boolean;
  isActive?: boolean;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  calculation?: string;
  flags?: string;
}

export interface CreateSalaryComponentPayload {
  name: string;
  code: string;
  type: SalaryComponentType;
  calculationType: CalculationType;
  isTaxable?: boolean;
  isPartOfWages?: boolean;
}

export interface PtSlabItem {
  id?: string;
  minSalary: string | number;
  maxSalary: string | number;
  ptAmount: string | number;
}

export interface PtStateGroup {
  id?: string;
  stateName: string;
  stateCode: string;
  financialYear?: string;
  frequency?: string;
  slabs: PtSlabItem[];
}

export interface PtSlabRule {
  minSalary: number;
  maxSalary: number;
  ptAmount: number;
}

export interface CreatePtSlabsPayload {
  stateCode: string;
  stateName: string;
  financialYear: string;
  frequency: "MONTHLY" | "HALF_YEARLY" | "ANNUALLY" | string;
  slabs: PtSlabRule[];
}

export interface PtSlabConfigItem extends CreatePtSlabsPayload {
  _id?: string;
  id?: string;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StructureLineItem {
  id: string;
  name: string;
  calculation: string;
}

export interface StructureTemplateTag {
  label: string;
  variant?: "outlined" | "filled";
}

export interface StructureTemplateItem {
  id: string;
  title: string;
  description: string;
  tags: StructureTemplateTag[];
  earnings: StructureLineItem[];
  deductions: StructureLineItem[];
  assignedEmployeesCount?: number;
}

export interface PayCalendarPolicyData {
  payCycleType: string;
  payCycleOptions: { label: string; value: string }[];
  attendanceCutoffDay: number | string;
  startDay: number | string;
  endDay: number | string;
  paymentDay: number | string;
  paidWeeklyOffs: boolean;
  useFixed30DayDivisor: boolean;
}

export interface BankPayoutColumnItem {
  id: string;
  index: number;
  columnHeader: string;
  fieldSource: string;
}

export interface BankPayoutFormatData {
  id: string;
  title: string;
  bankCode: string;
  delimiter: string;
  fileExtension: string;
  endpointLabel: string;
  activePeriodLabel: string;
  columns: BankPayoutColumnItem[];
}

export interface PayslipTemplateItem {
  id: string;
  code: string;
  title: string;
  description: string;
  isDefault?: boolean;
}

export interface GLMappingData {
  grossSalaryAccount: string;
  netPayableAccount: string;
  tdsPayableAccount: string;
  pfPayableAccount: string;
  esiPayableAccount: string;
  ptPayableAccount: string;
}

export interface EmployeeStructureAssignmentItem {
  id: string;
  code: string;
  name: string;
  department: string;
  structure: string;
  annualCtc: string;
  status: string;
}

export interface EmployeeSalaryStructureOption {
  id: string;
  code: string;
  name: string;
  structureName?: string;
  annualCtc?: string;
  monthlyGross?: string;
}

export interface PreflightCheckItem {
  id: string;
  title: string;
  status: string;
}

// ── Pre-flight Validation API  ─────────────────────────────────────────────
// Real response shape for POST /payroll/runs/:id/validate
// data.errors[] is a flat mixed array:
//   - "CRITICAL: ..." prefix  → blocking issues (must fix before generating)
//   - "WARNING ..."  prefix   → informational only (can still proceed)
export interface PreflightValidationResult {
  valid: boolean;       // true when zero CRITICAL errors exist
  totalChecked: number; // total active employees validated
  errors: string[];     // flat mixed array with CRITICAL / WARNING prefixes
}

export interface PreflightValidationApiResponse {
  succeeded: boolean;
  message?: string;
  errors?: string[];
  data?: PreflightValidationResult | null;
}

export type WageWorkerType = "HOURLY" | "DAILY" | "JOB_BASED";

export interface WageInputItem {
  id: string;
  employeeId?: string;
  employeeCode?: string;
  employeeName: string;
  type: WageWorkerType;
  rate: string | number;
  unitsWorked: number;
  otHours: number;
  otAmount: string | number;
}

export interface SaveWageInputsPayload {
  wageInputs: Array<{
    employeeId: string;
    type: WageWorkerType;
    rate: number;
    unitsWorked: number;
    overtimeHours?: number;
    overtimeAmount?: number;
  }>;
}

export interface SaveWageInputsApiResponse {
  succeeded: boolean;
  message: string;
  errors?: string[];
  data?: PayrollRunSummary | null;
}

export interface LockAttendancePayload {
  year: number;
  month: number;
  branchId?: string;
}

export interface LockAttendanceApiResponse {
  succeeded: boolean;
  message: string;
  errors?: string[];
  data?: {
    period?: string;
    status?: string;
    lockedAt?: string;
    lockedBy?: string;
    [key: string]: any;
  } | null;
}
export type AdjustmentType = "EARNING" | "DEDUCTION";

export type AdjustmentCategory =
  | "BONUS"
  | "COMMISSION"
  | "INCENTIVE"
  | "ARREARS"
  | "REIMBURSEMENT"
  | "ALLOWANCE"
  | "LOAN_REPAYMENT"
  | "ADVANCE_RECOVERY"
  | "PENALTY"
  | "NOTICE_PAY"
  | "CUSTOM";

export type AdjustmentStatus = "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED" | "CANCELLED";

export interface CreatePayrollAdjustmentPayload {
  employeeId: string;
  type: AdjustmentType;
  category: AdjustmentCategory;
  customLabel: string;
  amount: number;
  month: number;
  year: number;
  frequency?: "ONE_TIME" | "RECURRING";
  recurringStartMonth?: number;
  recurringStartYear?: number;
  recurringEndMonth?: number;
  recurringEndYear?: number;
  isTaxable?: boolean;
  affectsPfWages?: boolean;
  affectsEsiWages?: boolean;
  notes?: string;
}

export interface BulkCreatePayrollAdjustmentPayload {
  adjustments: CreatePayrollAdjustmentPayload[];
}

export interface PayrollAdjustmentItem {
  _id: string;
  tenantId?: string;
  employeeId:
    | string
    | {
        _id: string;
        employeeCode: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      };
  branchId?: string;
  payrollRunId?: string;
  type: AdjustmentType;
  category: AdjustmentCategory;
  customLabel: string;
  amount: number;
  month: number;
  year: number;
  frequency: "ONE_TIME" | "RECURRING";
  isTaxable: boolean;
  affectsPfWages: boolean;
  affectsEsiWages: boolean;
  status: AdjustmentStatus;
  notes?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetAdjustmentsParams {
  year?: number;
  month?: number;
  employeeId?: string;
  branchId?: string;
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

export interface PayrollAdjustmentListResponse {
  items: PayrollAdjustmentItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdhocVariablePayItem {
  id: string;
  employeeCode: string;
  employeeName: string;
  component: string;
  amount: string;
  remarks: string;
}

export interface SalaryHoldInputItem {
  employeeId: string;
  reason?: string;
}

export interface SaveSalaryHoldPayload {
  holdList: SalaryHoldInputItem[];
}

export interface SaveSalaryHoldApiResponse {
  succeeded: boolean;
  message: string;
  errors?: string[];
  data?: {
    _id: string;
    wizardStep?: string;
    salaryOnHoldEmployees?: Array<{
      employeeId: string;
      reason?: string;
    }>;
    [key: string]: any;
  } | null;
}

export interface SalaryOnHoldItem {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  reason: string;
}

export interface TaxOverrideInputItem {
  employeeId: string;
  incomeTaxOverride?: number;
  ptOverride?: number;
  remarks?: string;
}

export interface SaveTaxOverridePayload {
  overrides: TaxOverrideInputItem[];
}

export interface SaveTaxOverrideApiResponse {
  succeeded: boolean;
  message: string;
  errors?: string[];
  data?: {
    _id: string;
    wizardStep?: string;
    manualTaxOverrides?: Array<{
      employeeId: string;
      incomeTaxOverride?: number;
      ptOverride?: number;
      remarks?: string;
    }>;
    [key: string]: any;
  } | null;
}

export interface TaxOverrideItem {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  incomeTax: number;
  pt: number;
  remarks: string;
}

export interface PayrollRunWizardStep {
  stepNumber: number;
  label: string;
}

export interface InitiatePayrollRunRequest {
  month: number;
  year: number;
  branchId: string;
}

export type PayrollRunStatus =
  | "DRAFT"
  | "PROCESSING"
  | "GENERATED"
  | "APPROVED"
  | "PAID"
  | "FAILED";

export interface PayrollRunSummary {
  _id: string;
  runNumber: string;
  month: number;
  year: number;
  status: PayrollRunStatus;
  totalEmployees: number;
  totalGross: number;
  totalNet: number;
  totalGrossAmount?: number;
  totalDeductionsAmount?: number;
  totalNetAmount?: number;
  createdAt: string;
  generatedAt?: string;
  wizardStep?: string;
  salaryOnHoldEmployees?: Array<{
    employeeId: any;
    reason?: string;
  }>;
  manualTaxOverrides?: Array<{
    employeeId: any;
    incomeTaxOverride?: number;
    ptOverride?: number;
    remarks?: string;
  }>;
}

export interface InitiatePayrollRunResponse {
  succeeded: boolean;
  message?: string;
  errors?: string[];
  data?: PayrollRunSummary | null;
}

export interface PayrollRunWizardData {
  periodLabel: string;
  periodStatus: string;
  steps: PayrollRunWizardStep[];
  currentStep: number;
  apiEndpoint: string;
  runTitle: string;
  branchName: string;
  employeeCount: number;
  runStatus: string;
  notes: string;
  preflightChecks: PreflightCheckItem[];
  wageInputs: WageInputItem[];
  adhocVariablePay: AdhocVariablePayItem[];
  salaryOnHold: SalaryOnHoldItem[];
  taxOverrides: TaxOverrideItem[];
}

export interface RunHistoryItem {
  id: string;
  period: string;
  status: string;
  employees: number;
  gross: string;
  deductions: string;
  net: string;
  approved: string | null;
  paid: string | null;
}

export interface AuditTrailItem {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
}

export interface RunHistoryAuditData {
  periodLabel: string;
  periodStatus: string;
  runHistory: RunHistoryItem[];
  auditTrail: AuditTrailItem[];
}

export interface BatchGeneratePayslipsPayload {
  employeeIds?: string[];
  sendEmailNotification?: boolean;
  sendSmsNotification?: boolean;
}

export interface BatchGeneratePayslipsApiResponse {
  succeeded: boolean;
  message: string;
  errors?: string[];
  data?: {
    run: PayrollRunSummary;
    generatedCount: number;
    skippedCount: number;
    errorCount: number;
    skipped?: string[];
    errors?: string[];
  } | null;
}

export interface PayslipItem {
  _id: string;
  payrollRunId: string;
  employeeId:
    | {
        _id: string;
        employeeCode: string;
        firstName: string;
        lastName: string;
      }
    | string;
  month: number;
  year: number;
  grossEarned: number;
  totalDeductions: number;
  netPay: number;
  lopAmount?: number;
  attendanceSummary?: {
    totalDaysInMonth?: number;
    payableDays?: number;
    presentDays?: number;
    absentDays?: number;
    paidLeaveDays?: number;
    unpaidLeaveDays?: number;
  };
  earnings?: Array<{ componentCode: string; componentName: string; amount: number }>;
  deductions?: Array<{ componentCode: string; componentName: string; amount: number }>;
  pfEmployeeContribution?: number;
  ptAmount?: number;
  tdsAmount?: number;
}

export interface GetRunPayslipsApiResponse {
  succeeded: boolean;
  message: string;
  errors?: string[];
  data?: PayslipItem[] | null;
}
