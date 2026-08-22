import axiosInstance from "./axios";

export type TeamType = "PERMANENT" | "TEMPORARY" | "PROJECT_BASED";
export type ReportingType = "DEPARTMENT_HEAD" | "CUSTOM" | "DIRECT_MANAGER";

export interface TeamReporting {
  type: ReportingType;
  targetId?: string;
  targetName?: string;
}

export interface CreateTeamPayload {
  name: string;
  code: string;
  type: TeamType;
  departmentId: string;
  branchId?: string;
  leadId?: string;
  isCrossFunctional?: boolean;
  description?: string;
  maxConcurrentLeaves?: number;
  reporting?: TeamReporting;
  tags?: string[];
  startDate?: string;
}

export interface TeamItem {
  id?: string;
  _id?: string;
  name: string;
  code: string;
  type: TeamType;
  departmentId: string;
  branchId?: string;
  leadId?: string;
  isCrossFunctional?: boolean;
  description?: string;
  maxConcurrentLeaves?: number;
  reporting?: TeamReporting;
  tags?: string[];
  isActive?: boolean;
  startDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamResponse {
  success: boolean;
  message: string;
  data: TeamItem;
}

export interface TeamListResponse {
  success: boolean;
  message?: string;
  data: TeamItem[] | { items: TeamItem[]; total: number };
}

/**
 * Creates a new Team / Squad
 * POST /teams
 */
export const createTeam = async (payload: CreateTeamPayload): Promise<TeamResponse> => {
  const { data } = await axiosInstance.post<TeamResponse>("/teams", payload);
  return data;
};

/**
 * List all Teams with optional filtering by department or branch
 * GET /teams
 */
export const listTeams = async (params?: {
  departmentId?: string;
  branchId?: string;
}): Promise<TeamListResponse> => {
  const { data } = await axiosInstance.get<TeamListResponse>("/teams", { params });
  return data;
};
