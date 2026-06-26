export type EmployeeNode = {
  id: string;
  name: string;
  designation: string;
  department?: string;
  departmentColor?: string;
  skills: string;
  teamCount: number;
  children?: EmployeeNode[];
};
export type DepartmentNode = {
  id: string;
  name: string;
  employee: EmployeeNode;
};