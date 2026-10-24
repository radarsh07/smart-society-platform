import { httpClient } from './httpClient';
import type { ApiResponse, PageResponse } from '@/types/api';
import type {
  BuildingRequest,
  BuildingResponse,
  FlatRequest,
  FlatResponse,
  FlatSearchRequest,
  ResidentRequest,
  ResidentResponse,
  ResidentSearchRequest,
  ResidentSummaryResponse,
  SocietyRequest,
  SocietyResponse,
} from '@/types/society';

export const societyApi = {
  getCurrentSociety: async () => {
    const response = await httpClient.get<ApiResponse<SocietyResponse>>('/societies/current');
    return response.data.data;
  },
  createSociety: async (payload: SocietyRequest) => {
    const response = await httpClient.post<ApiResponse<SocietyResponse>>('/societies', payload);
    return response.data.data;
  },
  updateSociety: async (societyId: number, payload: SocietyRequest) => {
    const response = await httpClient.put<ApiResponse<SocietyResponse>>(`/societies/${societyId}`, payload);
    return response.data.data;
  },
  getSociety: async (societyId: number) => {
    const response = await httpClient.get<ApiResponse<SocietyResponse>>(`/societies/${societyId}`);
    return response.data.data;
  },
};

export const buildingApi = {
  createBuilding: async (payload: BuildingRequest) => {
    const response = await httpClient.post<ApiResponse<BuildingResponse>>('/buildings', payload);
    return response.data.data;
  },
  updateBuilding: async (buildingId: number, payload: BuildingRequest) => {
    const response = await httpClient.put<ApiResponse<BuildingResponse>>(`/buildings/${buildingId}`, payload);
    return response.data.data;
  },
  deleteBuilding: async (buildingId: number) => {
    const response = await httpClient.delete<ApiResponse<string>>(`/buildings/${buildingId}`);
    return response.data.data;
  },
  getBuilding: async (buildingId: number) => {
    const response = await httpClient.get<ApiResponse<BuildingResponse>>(`/buildings/${buildingId}`);
    return response.data.data;
  },
  listBuildings: async (societyId: number, page = 0, size = 10, sortBy = 'createdAt', sortDirection: 'ASC' | 'DESC' = 'DESC') => {
    const response = await httpClient.get<ApiResponse<PageResponse<BuildingResponse>>>('/buildings', {
      params: { societyId, page, size, sortBy, sortDirection },
    });
    return response.data.data;
  },
};

export const flatApi = {
  createFlat: async (payload: FlatRequest) => {
    const response = await httpClient.post<ApiResponse<FlatResponse>>('/flats', payload);
    return response.data.data;
  },
  updateFlat: async (flatId: number, payload: FlatRequest) => {
    const response = await httpClient.put<ApiResponse<FlatResponse>>(`/flats/${flatId}`, payload);
    return response.data.data;
  },
  deleteFlat: async (flatId: number) => {
    const response = await httpClient.delete<ApiResponse<string>>(`/flats/${flatId}`);
    return response.data.data;
  },
  getFlat: async (flatId: number) => {
    const response = await httpClient.get<ApiResponse<FlatResponse>>(`/flats/${flatId}`);
    return response.data.data;
  },
  listFlats: async (params: FlatSearchRequest) => {
    const response = await httpClient.get<ApiResponse<PageResponse<FlatResponse>>>('/flats', { params });
    return response.data.data;
  },
};

export const residentApi = {
  createResident: async (payload: ResidentRequest) => {
    const response = await httpClient.post<ApiResponse<ResidentResponse>>('/residents', payload);
    return response.data.data;
  },
  updateResident: async (residentId: number, payload: ResidentRequest) => {
    const response = await httpClient.put<ApiResponse<ResidentResponse>>(`/residents/${residentId}`, payload);
    return response.data.data;
  },
  deleteResident: async (residentId: number) => {
    const response = await httpClient.delete<ApiResponse<string>>(`/residents/${residentId}`);
    return response.data.data;
  },
  getResident: async (residentId: number) => {
    const response = await httpClient.get<ApiResponse<ResidentResponse>>(`/residents/${residentId}`);
    return response.data.data;
  },
  getResidentBasic: async (residentId: number) => {
    const response = await httpClient.get<ApiResponse<ResidentSummaryResponse>>(`/residents/basic/${residentId}`);
    return response.data.data;
  },
  listResidents: async (page = 0, size = 10, sortBy = 'createdAt', sortDirection: 'ASC' | 'DESC' = 'DESC') => {
    const response = await httpClient.get<ApiResponse<PageResponse<ResidentSummaryResponse>>>('/residents', {
      params: { page, size, sortBy, sortDirection },
    });
    return response.data.data;
  },
  searchResidents: async (params: ResidentSearchRequest) => {
    const response = await httpClient.get<ApiResponse<PageResponse<ResidentSummaryResponse>>>('/residents/search', {
      params,
    });
    return response.data.data;
  },
  getMyProfile: async () => {
    const response = await httpClient.get<ApiResponse<ResidentResponse>>('/residents/me');
    return response.data.data;
  },
  updateMyProfile: async (payload: ResidentRequest) => {
    const response = await httpClient.put<ApiResponse<ResidentResponse>>('/residents/me', payload);
    return response.data.data;
  },
  getPendingApprovals: async () => {
    const response = await httpClient.get<ApiResponse<ResidentSummaryResponse[]>>('/residents/pending-approvals');
    return response.data.data;
  },
  approveResident: async (residentId: number) => {
    const response = await httpClient.put<ApiResponse<ResidentResponse>>(`/residents/${residentId}/approve`);
    return response.data.data;
  },
  rejectResident: async (residentId: number) => {
    const response = await httpClient.put<ApiResponse<ResidentResponse>>(`/residents/${residentId}/reject`);
    return response.data.data;
  },
};

export interface PublicSocietyOption {
  id: number;
  societyName: string;
  address: string;
}

export interface PublicBuildingOption {
  id: number;
  buildingName: string;
  buildingCode: string;
  totalFloors: number;
}

export interface PublicFlatOption {
  id: number;
  flatNumber: string;
  flatType: string;
  floorNumber: number;
  status: string;
}

export interface ResidentSelfRegistrationPayload {
  buildingId: number;
  flatId: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  occupancyType: 'OWNER' | 'TENANT';
  password: string;
}

export const publicRegistrationApi = {
  getSocieties: async () => {
    const response = await httpClient.get<ApiResponse<PublicSocietyOption[]>>('/auth/public-societies');
    return response.data.data;
  },
  getBuildings: async (societyId: number) => {
    const response = await httpClient.get<ApiResponse<PublicBuildingOption[]>>('/auth/public-buildings', {
      params: { societyId },
    });
    return response.data.data;
  },
  getFlats: async (buildingId: number) => {
    const response = await httpClient.get<ApiResponse<PublicFlatOption[]>>('/auth/public-flats', {
      params: { buildingId },
    });
    return response.data.data;
  },
  selfRegister: async (payload: ResidentSelfRegistrationPayload) => {
    const response = await httpClient.post<ApiResponse<ResidentResponse>>('/auth/self-register-resident', payload);
    return response.data;
  },
};
