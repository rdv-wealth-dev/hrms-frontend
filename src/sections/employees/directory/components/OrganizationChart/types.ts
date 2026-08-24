import type { OrgTreeNode } from "../../../../../api/orgtree.api";

export type { OrgTreeNode };

export type EmployeeNode = {
  id: string;
  _id?: string;
  name: string;
  designation: string;
  department?: string;
  departmentColor?: string;
  skills?: string;
  teamCount?: number;
  avatarUrl?: string;
  employeeCode?: string;
  email?: string;
  cSuiteRole?: string;
  isVacant?: boolean;
  levelTier?: number;
  children?: EmployeeNode[];
};

export type DepartmentNode = {
  id: string;
  name: string;
  employee: EmployeeNode;
};