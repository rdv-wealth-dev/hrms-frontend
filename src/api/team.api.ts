import axiosInstance from "./axios";

export type TeamType = "PERMANENT" | "TEMPORARY" | "PROJECT_BASED" | string;
export type ReportingType = "DEPARTMENT_HEAD" | "CUSTOM" | "DIRECT_MANAGER" | string;

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

export interface UpdateTeamPayload extends Partial<CreateTeamPayload> {
  isActive?: boolean;
}

export interface AddTeamMemberPayload {
  employeeId: string;
  roleInTeam?: "LEAD" | "MEMBER" | string;
  isPrimary?: boolean;
  allocationPercentage?: number;
}

export interface UpdateTeamMemberPayload {
  roleInTeam?: "LEAD" | "MEMBER" | string;
  isPrimary?: boolean;
  allocationPercentage?: number;
}

export interface MyTeamItem {
  teamId: string;
  teamName: string;
  teamCode: string;
  roleInTeam: string;
  isPrimary?: boolean;
  allocationPercentage?: number;
  leadName?: string;
}

export interface TeamDepartmentInfo {
  id?: string;
  _id?: string;
  name: string;
  code?: string;
}

export interface TeamBranchInfo {
  id?: string;
  _id?: string;
  name: string;
  code?: string;
}

export interface TeamLeadInfo {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
}

export interface TeamItem {
  id?: string;
  _id?: string;
  name: string;
  code: string;
  type: TeamType;
  departmentId?: string;
  department?: TeamDepartmentInfo | string;
  branchId?: string;
  branch?: TeamBranchInfo | string;
  leadId?: string;
  lead?: TeamLeadInfo | string;
  memberCount?: number;
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

export interface TeamMember {
  id?: string;
  _id?: string;
  employeeId?: any;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  employeeCode?: string;
  designation?: string;
  roleInTeam?: "LEAD" | "MEMBER" | string;
  isPrimary?: boolean;
  allocationPercentage?: number;
  joinedAt?: string;
}

export interface TeamDetailData {
  team: TeamItem;
  members: TeamMember[];
}

export interface TeamResponse {
  success?: boolean;
  succeeded?: boolean;
  message?: string;
  data: TeamItem;
}

export interface TeamListResponse {
  success?: boolean;
  succeeded?: boolean;
  message?: string;
  data: TeamItem[] | { items: TeamItem[]; total: number };
}

export interface TeamDetailResponse {
  success?: boolean;
  succeeded?: boolean;
  message?: string;
  data: TeamDetailData | { team: TeamItem; members: TeamMember[] };
}

export interface MyTeamsResponse {
  success?: boolean;
  succeeded?: boolean;
  message?: string;
  data: MyTeamItem[];
}

export interface ListTeamsParams {
  departmentId?: string;
  branchId?: string;
  type?: string;
  isCrossFunctional?: boolean;
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
 * Updates an existing Team / Squad by ID
 * PUT /teams/:id
 */
export const updateTeam = async (
  id: string,
  payload: UpdateTeamPayload
): Promise<TeamResponse> => {
  const { data } = await axiosInstance.put<TeamResponse>(`/teams/${id}`, payload);
  return data;
};

/**
 * Soft deletes / Deactivates a team and its active member allocations
 * DELETE /teams/:id
 */
export const deleteTeam = async (id: string): Promise<{ success?: boolean; message?: string }> => {
  const { data } = await axiosInstance.delete<{ success?: boolean; message?: string }>(`/teams/${id}`);
  return data;
};

/**
 * Adds an employee member to a team with role and allocation %
 * POST /teams/:id/members
 */
export const addTeamMember = async (
  teamId: string,
  payload: AddTeamMemberPayload
): Promise<{ success?: boolean; message?: string; data?: any }> => {
  const { data } = await axiosInstance.post<{ success?: boolean; message?: string; data?: any }>(
    `/teams/${teamId}/members`,
    payload
  );
  return data;
};

/**
 * Updates an existing team member's role, allocation %, or primary status
 * PATCH /teams/:id/members/:memberId
 */
export const updateTeamMember = async (
  teamId: string,
  memberId: string,
  payload: UpdateTeamMemberPayload
): Promise<{ success?: boolean; message?: string; data?: any }> => {
  const { data } = await axiosInstance.patch<{ success?: boolean; message?: string; data?: any }>(
    `/teams/${teamId}/members/${memberId}`,
    payload
  );
  return data;
};

/**
 * Removes an employee member from a team
 * DELETE /teams/:id/members/:memberId
 */
export const removeTeamMember = async (
  teamId: string,
  memberId: string
): Promise<{ success?: boolean; message?: string }> => {
  const { data } = await axiosInstance.delete<{ success?: boolean; message?: string }>(
    `/teams/${teamId}/members/${memberId}`
  );
  return data;
};

/**
 * Reassigns or hands over leadership of the squad to another employee
 * PATCH /teams/:id/lead
 */
export const changeTeamLead = async (
  teamId: string,
  leadId: string
): Promise<{ success?: boolean; message?: string; data?: any }> => {
  const { data } = await axiosInstance.patch<{ success?: boolean; message?: string; data?: any }>(
    `/teams/${teamId}/lead`,
    { leadId }
  );
  return data;
};

/**
 * Fetches current logged-in employee's assigned teams & squad allocations
 * GET /teams/my-teams
 */
export const getMyTeams = async (employeeId?: string): Promise<MyTeamsResponse> => {
  const { data } = await axiosInstance.get<MyTeamsResponse>("/teams/my-teams", {
    params: employeeId ? { employeeId } : undefined,
  });
  return data;
};

/**
 * List all Teams with optional filtering by department, branch, type, cross-functional
 * GET /teams
 */
export const listTeams = async (params?: ListTeamsParams): Promise<TeamListResponse> => {
  const { data } = await axiosInstance.get<TeamListResponse>("/teams", { params });
  return data;
};

/**
 * Fetches single team details with assigned members, designations, and allocation percentages
 * GET /teams/:id
 */
export const getTeamById = async (id: string): Promise<TeamDetailResponse> => {
  const { data } = await axiosInstance.get<TeamDetailResponse>(`/teams/${id}`);
  return data;
};
