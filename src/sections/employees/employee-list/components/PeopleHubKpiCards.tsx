import { useMemo } from "react";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import type { EmployeeListItem } from "../../../../store/employee/employee.types";
import KpiCardsGrid, { type KpiCardItem } from "../../../../components/card/KpiCard";

interface PeopleHubKpiCardsProps {
  totalEmployees?: number;
  newJoinersCount?: number;
  probationCount?: number;
  upcomingBirthdaysCount?: number;
  employees?: EmployeeListItem[];
}

export function PeopleHubKpiCards({
  totalEmployees,
  newJoinersCount,
  probationCount,
  upcomingBirthdaysCount,
  employees = [],
}: PeopleHubKpiCardsProps) {
  const metrics = useMemo(() => {
    const total = totalEmployees !== undefined ? totalEmployees : employees.length;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // 1. New Joiners (joined in current month or year)
    const computedNewJoiners = employees.filter((e) => {
      if (!e.joiningDate) return false;
      const d = new Date(e.joiningDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }).length;
    const newJoiners = newJoinersCount !== undefined ? newJoinersCount : computedNewJoiners;

    // 2. On Probation
    const computedProbation = employees.filter((e) => {
      const st = (e.status || "").toUpperCase();
      const et = (e.employeeType || "").toUpperCase();
      return st.includes("PROBATION") || et.includes("PROBATION") || st === "PROBATIONARY";
    }).length;
    const probation = probationCount !== undefined ? probationCount : computedProbation;

    // 3. Upcoming Birthdays (within next 7 days or current month)
    const computedBirthdays = employees.filter((e) => {
      if (!e.dateOfBirth) return false;
      const dob = new Date(e.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const bdayThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      if (bdayThisYear < today) {
        bdayThisYear.setFullYear(today.getFullYear() + 1);
      }
      const diffDays = Math.ceil((bdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length;
    const birthdays = upcomingBirthdaysCount !== undefined ? upcomingBirthdaysCount : computedBirthdays;

    return { total, newJoiners, probation, birthdays };
  }, [employees, totalEmployees, newJoinersCount, probationCount, upcomingBirthdaysCount]);

  const cards: KpiCardItem[] = [
    {
      title: "TOTAL EMPLOYEES",
      value: metrics.total,
      subtext: "Active workforce",
      trend: "AS ON TODAY",
      trendType: "neutral",
      icon: <PeopleOutlinedIcon sx={{ fontSize: 20, color: "#6366F1" }} />,
      iconBg: "rgba(99, 102, 241, 0.08)",
    },
    {
      title: "NEW JOINERS",
      value: metrics.newJoiners,
      subtext: "Joined this month",
      trend: metrics.newJoiners > 0 ? `+${metrics.newJoiners}` : "0",
      trendType: metrics.newJoiners > 0 ? "positive" : "neutral",
      icon: <PersonAddOutlinedIcon sx={{ fontSize: 20, color: "#10B981" }} />,
      iconBg: "rgba(16, 185, 129, 0.1)",
    },
    {
      title: "ON PROBATION",
      value: metrics.probation,
      subtext: "Confirmation pending",
      trend: "UNDER REVIEW",
      trendType: "neutral",
      icon: <AccessTimeIcon sx={{ fontSize: 20, color: "#F59E0B" }} />,
      iconBg: "rgba(245, 158, 11, 0.1)",
    },
    {
      title: "UPCOMING BIRTHDAYS",
      value: metrics.birthdays,
      subtext: "In next 7 days",
      trend: "THIS WEEK",
      trendType: "neutral",
      icon: <CakeOutlinedIcon sx={{ fontSize: 20, color: "#EC4899" }} />,
      iconBg: "rgba(236, 72, 153, 0.1)",
    },
  ];

  return <KpiCardsGrid items={cards} mb={3} />;
}

export default PeopleHubKpiCards;
