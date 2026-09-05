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

export const PAYROLL_OVERVIEW_MOCK_DATA: PayrollOverviewData = {
  periodLabel: "Aug 2026",
  periodStatus: "DRAFT",
  kpiItems: [
    {
      id: "emp-payroll",
      title: "EMPLOYEES ON PAYROLL",
      value: 12,
      variant: "rose",
    },
    {
      id: "proj-gross",
      title: "PROJECTED GROSS (AUG)",
      value: "₹11,00,001",
      variant: "amber",
    },
    {
      id: "curr-run",
      title: "CURRENT RUN",
      value: "DRAFT",
      subtext: "August 2026 · Step 1 of 10",
      variant: "purple",
    },
    {
      id: "pending-appr",
      title: "PENDING APPROVALS",
      value: 3,
      variant: "green",
    },
  ],
  currentRun: {
    title: "Continue August 2026 Payroll Run",
    description:
      "Work through the 10-step processing wizard — attendance sync, wage inputs, adjustments, tax overrides, batch generation and CFO approval.",
    buttonText: "Open Run Wizard →",
    stepInfo: "August 2026 · Step 1 of 10",
  },
  statutoryDueDates: [
    {
      id: "pf",
      title: "PF (EPFO ECR + Challan)",
      dueDate: "15th of month",
      status: "Upcoming",
    },
    {
      id: "esi",
      title: "ESI Return & Payment",
      dueDate: "21st of month",
      status: "Upcoming",
    },
    {
      id: "pt",
      title: "Professional Tax (MH)",
      dueDate: "30th of month",
      status: "Upcoming",
    },
    {
      id: "tds",
      title: "TDS Deposit (Form 24Q)",
      dueDate: "7th of next month",
      status: "Upcoming",
    },
  ],
  recentActivity: [
    {
      id: "act-1",
      action: "Marked July 2026 payroll run as Paid",
      meta: "Finance Team · 2026-07-29 16:00",
    },
    {
      id: "act-2",
      action: "Approved and froze July 2026 payroll run",
      meta: "CFO · 2026-07-28 14:30",
    },
    {
      id: "act-3",
      action: "Generated pay register batch for July 2026 — 12 employees",
      meta: "HR Admin · 2026-07-28 11:05",
    },
    {
      id: "act-4",
      action: "Locked attendance for July 2026",
      meta: "System · 2026-07-20 09:00",
    },
  ],
};

export type SalaryComponentType = "EARNING" | "DEDUCTION";

export interface SalaryComponentItem {
  id: string;
  code: string;
  name: string;
  type: SalaryComponentType;
  category: string;
  calculation: string;
  flags: string;
}

export const SALARY_COMPONENTS_MOCK_DATA: SalaryComponentItem[] = [
  {
    id: "comp-1",
    code: "BASIC",
    name: "Basic Salary",
    type: "EARNING",
    category: "BASE",
    calculation: "CTC * 0.40",
    flags: "In CTC · Taxable",
  },
  {
    id: "comp-2",
    code: "HRA",
    name: "House Rent Allowance",
    type: "EARNING",
    category: "RECURRING",
    calculation: "BASIC * 0.40",
    flags: "In CTC · Taxable",
  },
  {
    id: "comp-3",
    code: "CONVEYANCE_ALLOWANCE",
    name: "Conveyance Allowance",
    type: "EARNING",
    category: "RECURRING",
    calculation: "1600",
    flags: "In CTC",
  },
  {
    id: "comp-4",
    code: "SPECIAL_ALLOWANCE",
    name: "Special Allowance",
    type: "EARNING",
    category: "RECURRING",
    calculation: "BALANCING_AMOUNT",
    flags: "In CTC · Taxable",
  },
  {
    id: "comp-5",
    code: "PF_EMPLOYEE",
    name: "Provident Fund (Employee)",
    type: "DEDUCTION",
    category: "STATUTORY",
    calculation: "min(15000, BASIC) * 0.12",
    flags: "Statutory · In CTC",
  },
  {
    id: "comp-6",
    code: "ESI_EMPLOYEE",
    name: "ESI (Employee)",
    type: "DEDUCTION",
    category: "STATUTORY",
    calculation: "GROSS * 0.0075",
    flags: "Statutory · In CTC",
  },
  {
    id: "comp-7",
    code: "PROFESSIONAL_TAX",
    name: "Professional Tax",
    type: "DEDUCTION",
    category: "STATUTORY",
    calculation: "STATE_PT_SLAB",
    flags: "Statutory",
  },
  {
    id: "comp-8",
    code: "TDS",
    name: "Income Tax (TDS)",
    type: "DEDUCTION",
    category: "STATUTORY",
    calculation: "INCOME_TAX_SLAB",
    flags: "Statutory",
  },
];

export interface PtSlabItem {
  id: string;
  minSalary: string;
  maxSalary: string;
  ptAmount: string;
}

export interface PtStateGroup {
  id: string;
  stateName: string;
  stateCode: string;
  slabs: PtSlabItem[];
}

export const PROFESSIONAL_TAX_SLABS_MOCK_DATA: PtStateGroup[] = [
  {
    id: "pt-mh",
    stateName: "Maharashtra",
    stateCode: "MH",
    slabs: [
      { id: "slab-1", minSalary: "₹0", maxSalary: "₹7500", ptAmount: "₹0" },
      { id: "slab-2", minSalary: "₹7501", maxSalary: "₹10000", ptAmount: "₹175" },
      { id: "slab-3", minSalary: "₹10001", maxSalary: "₹9999999", ptAmount: "₹200" },
    ],
  },
];

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

export const STRUCTURE_TEMPLATES_MOCK_DATA: StructureTemplateItem[] = [
  {
    id: "struct-1",
    title: "Structure 1",
    description: "Standard corporate structure — 40% Basic, 40% HRA and a balancing Special Allowance.",
    tags: [
      { label: "REGULAR", variant: "outlined" },
      { label: "DEFAULT", variant: "filled" },
    ],
    earnings: [
      { id: "e1", name: "BASIC", calculation: "40% of CTC" },
      { id: "e2", name: "HRA", calculation: "40% of Basic" },
      { id: "e3", name: "CONVEYANCE_ALLOWANCE", calculation: "Flat ₹1,600" },
      { id: "e4", name: "SPECIAL_ALLOWANCE", calculation: "Balancing amount" },
    ],
    deductions: [
      { id: "d1", name: "PF_EMPLOYEE", calculation: "12% of Basic (capped ₹15,000)" },
      { id: "d2", name: "PROFESSIONAL_TAX", calculation: "State slab" },
      { id: "d3", name: "ESI_EMPLOYEE", calculation: "0.75% of gross (≤ ₹21,000)" },
    ],
    assignedEmployeesCount: 0,
  },
  {
    id: "struct-2",
    title: "Contractor Salary Structure",
    description: "Consolidated pay for contract staff — no statutory deductions.",
    tags: [{ label: "CONTRACTOR", variant: "outlined" }],
    earnings: [
      { id: "e1", name: "CONSOLIDATED_PAY", calculation: "100% of CTC" },
    ],
    deductions: [
      { id: "d1", name: "TDS", calculation: "10% flat (Sec 194C)" },
    ],
    assignedEmployeesCount: 0,
  },
];

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

export const PAY_CALENDAR_POLICY_MOCK_DATA: PayCalendarPolicyData = {
  payCycleType: "FIRST_TO_LAST",
  payCycleOptions: [
    { label: "FIRST_TO_LAST", value: "FIRST_TO_LAST" },
    { label: "CUSTOM_RANGE", value: "CUSTOM_RANGE" },
  ],
  attendanceCutoffDay: 20,
  startDay: 1,
  endDay: 31,
  paymentDay: 30,
  paidWeeklyOffs: true,
  useFixed30DayDivisor: false,
};

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

export const BANK_PAYOUT_FORMAT_MOCK_DATA: BankPayoutFormatData = {
  id: "bank-fmt-1",
  title: "Noida Branch - Kotak CMS Format",
  bankCode: "KOTAK_NOIDA",
  delimiter: "','",
  fileExtension: ".csv",
  endpointLabel: "POST /payroll/bank-formats",
  activePeriodLabel: "Aug 2026 · DRAFT",
  columns: [
    { id: "col-1", index: 1, columnHeader: "Payment Mode", fieldSource: "Static: NEFT" },
    { id: "col-2", index: 2, columnHeader: "Beneficiary Account", fieldSource: "Account Number" },
    { id: "col-3", index: 3, columnHeader: "Payee Name", fieldSource: "Beneficiary Name" },
    { id: "col-4", index: 4, columnHeader: "IFSC", fieldSource: "IFSC Code" },
    { id: "col-5", index: 5, columnHeader: "Amount", fieldSource: "Net Amount" },
    { id: "col-6", index: 6, columnHeader: "Narration", fieldSource: "Remarks" },
  ],
};

export interface PayslipTemplateItem {
  id: string;
  code: string;
  title: string;
  description: string;
  isDefault?: boolean;
}

export const PAYSLIP_TEMPLATES_MOCK_DATA: PayslipTemplateItem[] = [
  {
    id: "fmt-1",
    code: "FORMAT_1",
    title: "Format 1 (Modern Corporate)",
    description: "Modern grid — logo, CIN, PAN/UAN, bank details, YTD tax, net pay in words.",
    isDefault: true,
  },
  {
    id: "fmt-2",
    code: "FORMAT_2",
    title: "Format 2 (Classic Ledger)",
    description: "Two-column ledger, no photo, leave balance summary.",
    isDefault: false,
  },
  {
    id: "fmt-3",
    code: "FORMAT_3",
    title: "Format 3 (Minimal)",
    description: "Single column, net pay emphasis, no signature box.",
    isDefault: false,
  },
];

export interface GLMappingData {
  grossSalaryAccount: string;
  netPayableAccount: string;
  tdsPayableAccount: string;
  pfPayableAccount: string;
  esiPayableAccount: string;
  ptPayableAccount: string;
}

export const GL_MAPPING_MOCK_DATA: GLMappingData = {
  grossSalaryAccount: "5100-WAGES-EXPENSE",
  netPayableAccount: "1100-BANK-ACCOUNT",
  tdsPayableAccount: "2200-TDS-PAYABLE",
  pfPayableAccount: "2210-PF-PAYABLE",
  esiPayableAccount: "2220-ESI-PAYABLE",
  ptPayableAccount: "2230-PT-PAYABLE",
};

export interface EmployeeStructureAssignmentItem {
  id: string;
  code: string;
  name: string;
  department: string;
  structure: string;
  annualCtc: string;
  status: string;
}

export const EMPLOYEE_STRUCTURE_ASSIGNMENTS_MOCK_DATA: EmployeeStructureAssignmentItem[] = [
  { id: "emp-1", code: "EMP-0001", name: "Aditi Sharma", department: "Engineering", structure: "Structure 1", annualCtc: "₹12,00,000", status: "ACTIVE" },
  { id: "emp-2", code: "EMP-0002", name: "Rohan Mehta", department: "Engineering", structure: "Structure 1", annualCtc: "₹18,00,000", status: "ACTIVE" },
  { id: "emp-3", code: "EMP-0003", name: "Priya Nair", department: "Sales", structure: "Structure 1", annualCtc: "₹8,00,000", status: "ACTIVE" },
  { id: "emp-4", code: "EMP-0004", name: "Karan Verma", department: "Sales", structure: "Structure 1", annualCtc: "₹15,00,000", status: "ACTIVE" },
  { id: "emp-5", code: "EMP-0005", name: "Neha Gupta", department: "HR", structure: "Structure 1", annualCtc: "₹9,50,000", status: "ACTIVE" },
  { id: "emp-6", code: "EMP-0006", name: "Vikram Singh", department: "Finance", structure: "Structure 1", annualCtc: "₹9,00,000", status: "ACTIVE" },
  { id: "emp-7", code: "EMP-0007", name: "Ananya Iyer", department: "Finance", structure: "Structure 1", annualCtc: "₹20,00,000", status: "ACTIVE" },
  { id: "emp-8", code: "EMP-0008", name: "Rahul Deshmukh", department: "Operations", structure: "Structure 1", annualCtc: "₹6,50,000", status: "ACTIVE" },
  { id: "emp-9", code: "EMP-0009", name: "Sneha Kulkarni", department: "Engineering", structure: "Structure 1", annualCtc: "₹7,00,000", status: "ACTIVE" },
  { id: "emp-10", code: "EMP-0010", name: "Sourabh Panchal", department: "Engineering", structure: "Structure 1", annualCtc: "₹11,00,000", status: "ACTIVE" },
];

export interface EmployeeSalaryStructureOption {
  id: string;
  code: string;
  name: string;
  structureName?: string;
  annualCtc?: string;
  monthlyGross?: string;
}

export const SALARY_STRUCTURE_EMPLOYEES_MOCK_DATA: EmployeeSalaryStructureOption[] = [
  { id: "emp-1", code: "EMP-0001", name: "Aditi Sharma", structureName: "Structure 1", annualCtc: "₹12,00,000", monthlyGross: "₹1,00,000" },
  { id: "emp-2", code: "EMP-0002", name: "Rohan Mehta", structureName: "Structure 1", annualCtc: "₹18,00,000", monthlyGross: "₹1,50,000" },
  { id: "emp-3", code: "EMP-0003", name: "Priya Nair", structureName: "Structure 1", annualCtc: "₹8,00,000", monthlyGross: "₹66,667" },
  { id: "emp-4", code: "EMP-0004", name: "Karan Verma", structureName: "Structure 1", annualCtc: "₹15,00,000", monthlyGross: "₹1,25,000" },
  { id: "emp-5", code: "EMP-0005", name: "Neha Gupta", structureName: "Structure 1", annualCtc: "₹9,50,000", monthlyGross: "₹79,167" },
  { id: "emp-6", code: "EMP-0006", name: "Vikram Singh", structureName: "Structure 1", annualCtc: "₹9,00,000", monthlyGross: "₹75,000" },
  { id: "emp-7", code: "EMP-0007", name: "Ananya Iyer", structureName: "Structure 1", annualCtc: "₹20,00,000", monthlyGross: "₹1,66,667" },
  { id: "emp-8", code: "EMP-0008", name: "Rahul Deshmukh", structureName: "Structure 1", annualCtc: "₹6,50,000", monthlyGross: "₹54,167" },
  { id: "emp-9", code: "EMP-0009", name: "Sneha Kulkarni", structureName: "Structure 1", annualCtc: "₹7,00,000", monthlyGross: "₹58,333" },
  { id: "emp-10", code: "EMP-0010", name: "Sourabh Panchal", structureName: "Structure 1", annualCtc: "₹11,00,000", monthlyGross: "₹91,667" },
  { id: "emp-11", code: "EMP-0011", name: "Farhan Sheikh", structureName: "Contractor Salary Structure", annualCtc: "₹14,00,000", monthlyGross: "₹1,16,667" },
  { id: "emp-12", code: "EMP-0012", name: "Meera Joshi", structureName: "Structure 1", annualCtc: "₹13,50,000", monthlyGross: "₹1,12,500" },
];








