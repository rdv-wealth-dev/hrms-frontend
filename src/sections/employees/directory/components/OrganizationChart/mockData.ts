// src/sections/employee/directory/components/OrganizationChart/mockData.ts

import type { EmployeeNode } from "./types";

export const organizationData: EmployeeNode = {
  id: "ceo",
  name: "Santiago Garcia",
  designation: "CEO",
  skills: "Leadership",
  teamCount: 6,

  children: [
    {
      id: "assistant",
      name: "Noah Williams",
      designation: "Executive Assistant",
      skills: "Communication",
      teamCount: 2,

      children: [
        {
          id: "finance",
          name: "Chuck Berry",
          designation: "Chief Financial Officer",
          department: "Finance",
          departmentColor: "#2563EB",
          skills: "Finance",
          teamCount: 3,

          children: [
            {
              id: "finance-1",
              name: "Antania Yates",
              designation: "Senior Accountant",
              skills: "Payroll",
              teamCount: 1,
            },
            {
              id: "finance-2",
              name: "Berta Kemper",
              designation: "Controller",
              skills: "Analytics",
              teamCount: 1,
            },
          ],
        },

        {
          id: "sales",
          name: "Alvera Douglas",
          designation: "Chief Revenue Officer",
          department: "Sales",
          departmentColor: "#F97316",
          skills: "Sales",
          teamCount: 11,

          children: [
            {
              id: "sales-1",
              name: "Amaris Sancho",
              designation: "Sales Manager",
              skills: "Sales",
              teamCount: 4,
            },
            {
              id: "sales-2",
              name: "Angeline Valenzuela",
              designation: "VP Sales",
              skills: "Website Design",
              teamCount: 4,
            },
          ],
        },

        {
          id: "marketing",
          name: "Annore Phillips",
          designation: "Chief Marketing Officer",
          department: "Marketing",
          departmentColor: "#16A34A",
          skills: "Marketing",
          teamCount: 9,

          children: [
            {
              id: "marketing-1",
              name: "Blake Wicos",
              designation: "Creative Director",
              skills: "Website Design",
              teamCount: 2,
            },
            {
              id: "marketing-2",
              name: "Andrea Ray",
              designation: "Director of Marketing",
              skills: "SEO",
              teamCount: 3,
            },
          ],
        },

        {
          id: "hr",
          name: "Korah Hunter",
          designation: "HR Manager",
          department: "Human Resources",
          departmentColor: "#3B82F6",
          skills: "HR",
          teamCount: 2,

          children: [
            {
              id: "hr-1",
              name: "Bruce Fisher",
              designation: "Recruiter",
              skills: "Hiring",
              teamCount: 1,
            },
          ],
        },
      ],
    },
  ],
};