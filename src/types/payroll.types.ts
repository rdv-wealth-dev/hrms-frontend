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

export interface WageInputItem {
  id: string;
  employeeName: string;
  type: "HOURLY" | "DAILY";
  rate: string;
  unitsWorked: number;
  otHours: number;
  otAmount: string;
}

export interface AdhocVariablePayItem {
  id: string;
  employeeCode: string;
  employeeName: string;
  component: string;
  amount: string;
  remarks: string;
}

export interface SalaryOnHoldItem {
  id: string;
  employeeCode: string;
  employeeName: string;
  reason: string;
}

export interface TaxOverrideItem {
  id: string;
  employeeCode: string;
  employeeName: string;
  incomeTax: string;
  pt: string;
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
  createdAt: string;
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
