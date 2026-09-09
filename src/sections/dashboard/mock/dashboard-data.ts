import type { KpiCardItem } from "@/components/card/KpiCard";

export interface AiInsightItem {
  id: string;
  title: string;
  description: string;
  category: "attrition" | "attendance" | "onboarding" | "retention";
  actionLabel: string;
}

export interface WorkforceOverviewPoint {
  month: string;
  headcount: number;
  newHires: number;
  exits: number;
}

export interface DepartmentDistributionItem {
  name: string;
  count: number;
  percentage: number;
}

export interface AttendanceSummary {
  present: number;
  presentPct: number;
  absent: number;
  absentPct: number;
  late: number;
  latePct: number;
  wfh: number;
  wfhPct: number;
  onLeave: number;
  onLeavePct: number;
}

export interface DepartmentAttendanceBreakdown {
  department: string;
  presentPct: number;
  absentPct: number;
  latePct: number;
  wfhPct: number;
  onLeavePct: number;
}

export interface LeaveRequestItem {
  id: string;
  employeeName: string;
  employeeAvatar?: string;
  employeeId: string;
  department: string;
  designation: string;
  status: "PENDING" | "REENTRY" | "APPROVED" | "REJECTED";
  leaveType: string;
  dateRange: string;
}

export interface RecruitmentPipelineStage {
  id: string;
  stage: string;
  count: number;
  conversionPct: number;
}

export interface RecruitmentMetrics {
  timeToHire: string;
  timeToHireTrend: string;
  timeToFill: string;
  timeToFillTrend: string;
  offerAcceptance: string;
  offerAcceptanceTrend: string;
  totalOpenJobs: number;
}

export interface RecentEmployeeItem {
  id: string;
  name: string;
  avatar?: string;
  employeeId: string;
  designation: string;
  department: string;
  joinDate: string;
  status: "ACTIVE" | "PROBATION";
}

export interface UpcomingEventItem {
  id: string;
  title: string;
  personName: string;
  date: string;
  type: "birthday" | "anniversary" | "holiday" | "interview" | "event";
}

export interface DashboardData {
  kpis: KpiCardItem[];
  insights: AiInsightItem[];
  workforceOverview: {
    "6M": WorkforceOverviewPoint[];
    "12M": WorkforceOverviewPoint[];
    "YTD": WorkforceOverviewPoint[];
    avgHeadcount: number;
    netGrowthText: string;
    totalExits: number;
  };
  departmentDistribution: DepartmentDistributionItem[];
  attendanceToday: {
    summary: AttendanceSummary;
    departmentBreakdown: DepartmentAttendanceBreakdown[];
  };
  leaveRequests: LeaveRequestItem[];
  recruitmentPipeline: {
    stages: RecruitmentPipelineStage[];
    metrics: RecruitmentMetrics;
  };
  recentEmployees: RecentEmployeeItem[];
  upcomingEvents: UpcomingEventItem[];
}

export const DASHBOARD_MOCK_DATA: DashboardData = {
  kpis: [
    {
      id: "total-employees",
      title: "Total Employees",
      value: "1,248",
      subtext: "vs last month",
      trend: "+3.2%",
      trendType: "positive",
      variant: "blue",
    },
    {
      id: "present-today",
      title: "Present Today",
      value: "1,086",
      subtext: "87% of total workforce",
      progress: 87,
      progressColor: "#10B981",
      variant: "green",
    },
    {
      id: "on-leave",
      title: "On Leave",
      value: "42",
      subtext: "3.4% of total workforce",
      progress: 3.4,
      progressColor: "#F59E0B",
      variant: "amber",
    },
    {
      id: "new-joiners",
      title: "New Joiners",
      value: "18",
      subtext: "vs last month",
      trend: "+8.6%",
      trendType: "positive",
      variant: "purple",
    },
  ],

  insights: [
    {
      id: "insight-1",
      title: "Attrition Risk",
      description: "Engineering team shows higher attrition risk in next 60 days.",
      category: "attrition",
      actionLabel: "View Analysis",
    },
    {
      id: "insight-2",
      title: "Attendance Pattern",
      description: "Unplanned absences increased 18% on Mondays over the last 4 weeks.",
      category: "attendance",
      actionLabel: "View Details",
    },
    {
      id: "insight-3",
      title: "Onboarding Delay",
      description: "IT access setup is adding ~2-4 days to onboarding completion.",
      category: "onboarding",
      actionLabel: "Explore",
    },
    {
      id: "insight-4",
      title: "Retention Positive",
      description: "Teams with flexible work policy have 14% higher retention rate.",
      category: "retention",
      actionLabel: "View Report",
    },
  ],

  workforceOverview: {
    "6M": [
      { month: "Mar", headcount: 980, newHires: 310, exits: 110 },
      { month: "Apr", headcount: 1020, newHires: 325, exits: 115 },
      { month: "May", headcount: 1060, newHires: 340, exits: 120 },
      { month: "Jun", headcount: 1100, newHires: 330, exits: 118 },
      { month: "Jul", headcount: 1160, newHires: 350, exits: 122 },
      { month: "Aug", headcount: 1248, newHires: 380, exits: 112 },
    ],
    "12M": [
      { month: "Sep", headcount: 820, newHires: 250, exits: 90 },
      { month: "Oct", headcount: 850, newHires: 260, exits: 95 },
      { month: "Nov", headcount: 890, newHires: 275, exits: 98 },
      { month: "Dec", headcount: 910, newHires: 280, exits: 102 },
      { month: "Jan", headcount: 940, newHires: 295, exits: 105 },
      { month: "Feb", headcount: 960, newHires: 300, exits: 108 },
      { month: "Mar", headcount: 980, newHires: 310, exits: 110 },
      { month: "Apr", headcount: 1020, newHires: 325, exits: 115 },
      { month: "May", headcount: 1060, newHires: 340, exits: 120 },
      { month: "Jun", headcount: 1100, newHires: 330, exits: 118 },
      { month: "Jul", headcount: 1160, newHires: 350, exits: 122 },
      { month: "Aug", headcount: 1248, newHires: 380, exits: 112 },
    ],
    "YTD": [
      { month: "Jan", headcount: 940, newHires: 295, exits: 105 },
      { month: "Feb", headcount: 960, newHires: 300, exits: 108 },
      { month: "Mar", headcount: 980, newHires: 310, exits: 110 },
      { month: "Apr", headcount: 1020, newHires: 325, exits: 115 },
      { month: "May", headcount: 1060, newHires: 340, exits: 120 },
      { month: "Jun", headcount: 1100, newHires: 330, exits: 118 },
      { month: "Jul", headcount: 1160, newHires: 350, exits: 122 },
      { month: "Aug", headcount: 1248, newHires: 380, exits: 112 },
    ],
    avgHeadcount: 1124,
    netGrowthText: "+38 (↑3.2%)",
    totalExits: 12,
  },

  departmentDistribution: [
    { name: "Engineering", count: 342, percentage: 27.4 },
    { name: "Sales", count: 156, percentage: 12.5 },
    { name: "Customer Support", count: 123, percentage: 9.9 },
    { name: "Product", count: 89, percentage: 7.1 },
    { name: "Marketing", count: 67, percentage: 5.4 },
    { name: "Finance", count: 54, percentage: 4.3 },
    { name: "HR & Operations", count: 52, percentage: 4.2 },
  ],

  attendanceToday: {
    summary: {
      present: 1086,
      presentPct: 87,
      absent: 76,
      absentPct: 6.1,
      late: 28,
      latePct: 2.2,
      wfh: 36,
      wfhPct: 2.9,
      onLeave: 42,
      onLeavePct: 3.4,
    },
    departmentBreakdown: [
      { department: "Engineering", presentPct: 85, absentPct: 5, latePct: 3, wfhPct: 4, onLeavePct: 3 },
      { department: "Sales", presentPct: 80, absentPct: 8, latePct: 4, wfhPct: 2, onLeavePct: 6 },
      { department: "Support", presentPct: 90, absentPct: 4, latePct: 2, wfhPct: 1, onLeavePct: 3 },
      { department: "Product", presentPct: 88, absentPct: 4, latePct: 2, wfhPct: 4, onLeavePct: 2 },
      { department: "Others", presentPct: 82, absentPct: 7, latePct: 3, wfhPct: 3, onLeavePct: 5 },
    ],
  },

  leaveRequests: [
    {
      id: "lq-1",
      employeeName: "Jenny Wilson",
      employeeId: "EMP-1248",
      department: "Engineering",
      designation: "Software Engineer",
      status: "PENDING",
      leaveType: "Casual Leave",
      dateRange: "28 Aug - 29 Aug",
    },
    {
      id: "lq-2",
      employeeName: "Ralph Edwards",
      employeeId: "EMP-1247",
      department: "Marketing",
      designation: "Marketing Executive",
      status: "PENDING",
      leaveType: "Sick Leave",
      dateRange: "28 Aug",
    },
    {
      id: "lq-3",
      employeeName: "Theresa Webb",
      employeeId: "EMP-1246",
      department: "Product",
      designation: "Product Manager",
      status: "PENDING",
      leaveType: "Privilege Leave",
      dateRange: "01 Sep - 05 Sep",
    },
    {
      id: "lq-4",
      employeeName: "Roneon Williamson",
      employeeId: "EMP-1245",
      department: "Sales",
      designation: "Sales Executive",
      status: "REENTRY",
      leaveType: "Comp Off",
      dateRange: "30 Aug",
    },
  ],

  recruitmentPipeline: {
    stages: [
      { id: "stg-1", stage: "Applied", count: 428, conversionPct: 100 },
      { id: "stg-2", stage: "Screening", count: 186, conversionPct: 43 },
      { id: "stg-3", stage: "Interview", count: 92, conversionPct: 49 },
      { id: "stg-4", stage: "Offer", count: 28, conversionPct: 30 },
      { id: "stg-5", stage: "Hired", count: 19, conversionPct: 68 },
    ],
    metrics: {
      timeToHire: "24 Days",
      timeToHireTrend: "↗ 3 Days",
      timeToFill: "42 Days",
      timeToFillTrend: "↗ 5 Days",
      offerAcceptance: "67%",
      offerAcceptanceTrend: "↗ 8%",
      totalOpenJobs: 24,
    },
  },

  recentEmployees: [
    {
      id: "emp-1",
      name: "Cody Fisher",
      employeeId: "EMP-1248",
      designation: "Engineering",
      department: "Engineering",
      joinDate: "26 Aug 2026",
      status: "ACTIVE",
    },
    {
      id: "emp-2",
      name: "Kristin Watson",
      employeeId: "EMP-1247",
      designation: "Marketing Executive",
      department: "Marketing",
      joinDate: "24 Aug 2026",
      status: "ACTIVE",
    },
    {
      id: "emp-3",
      name: "Dianne Russell",
      employeeId: "EMP-1246",
      designation: "Product Manager",
      department: "Product",
      joinDate: "21 Aug 2026",
      status: "PROBATION",
    },
    {
      id: "emp-4",
      name: "Cameron Williamson",
      employeeId: "EMP-1245",
      designation: "Sales Executive",
      department: "Sales",
      joinDate: "19 Aug 2026",
      status: "ACTIVE",
    },
  ],

  upcomingEvents: [
    {
      id: "evt-1",
      title: "Birthday",
      personName: "Jacob Jones",
      date: "28 Aug",
      type: "birthday",
    },
    {
      id: "evt-2",
      title: "Work Anniversary",
      personName: "Esther Howard",
      date: "29 Aug",
      type: "anniversary",
    },
    {
      id: "evt-3",
      title: "Holiday",
      personName: "Raksha Bandhan",
      date: "30 Aug",
      type: "holiday",
    },
    {
      id: "evt-4",
      title: "Interview",
      personName: "Frontend Developer",
      date: "31 Aug",
      type: "interview",
    },
    {
      id: "evt-5",
      title: "Team Event",
      personName: "Quarterly Townhall",
      date: "02 Sep",
      type: "event",
    },
  ],
};
