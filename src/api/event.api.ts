import axiosInstance from "./axios";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface CompanyEvent {
  _id: string;
  title: string;
  description?: string;
  date: string;
  tenantId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  date: string;
  description?: string;
}

export interface CreateEventResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: CompanyEvent;
}

export interface ListEventsResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: CompanyEvent[];
}

export const createCompanyEvent = async (
  payload: CreateEventRequest
): Promise<CreateEventResponse> => {
  const response = await axiosInstance.post<CreateEventResponse>(
    "/events",
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const listCompanyEvents = async (
  pageNumber = 1,
  pageSize = 50
): Promise<ListEventsResponse> => {
  const response = await axiosInstance.get<ListEventsResponse>(
    "/events",
    {
      params: { pageNumber, pageSize },
      headers: getAuthHeader(),
    }
  );
  return response.data;
};
