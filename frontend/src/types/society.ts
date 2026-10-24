export interface SocietyRequest {
  societyName: string;
  registrationNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface SocietyResponse {
  id: number;
  societyName: string;
  registrationNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  contactPhone?: string;
  contactEmail?: string;
  buildingCount: number;
  flatCount: number;
}

export interface BuildingRequest {
  societyId: number;
  buildingName: string;
  buildingCode?: string;
  totalFloors: number;
}

export interface BuildingResponse {
  id: number;
  societyId: number;
  societyName: string;
  buildingName: string;
  buildingCode: string;
  totalFloors: number;
  active: boolean;
}

export interface FlatRequest {
  buildingId: number;
  flatNumber: string;
  flatType: string;
  floorNumber: number;
  carpetArea?: number;
  status: string;
}

export interface FlatResponse {
  id: number;
  buildingId: number;
  buildingName: string;
  societyId: number;
  societyName: string;
  flatNumber: string;
  flatType: string;
  floorNumber: number;
  carpetArea?: number;
  status: string;
  active: boolean;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type OccupancyType = 'OWNER' | 'TENANT';
export type ResidentLifecycleStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE' | 'REJECTED' | 'MOVED_OUT';

export interface ResidentRequest {
  buildingId: number;
  flatId: number;
  username: string;
  fullName: string;
  profilePhotoUrl?: string;
  email: string;
  phoneNumber: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  occupation?: string;
  bloodGroup?: string;
  governmentIdNumber?: string;
  moveInDate?: string;
  occupancyType: OccupancyType;
  residentStatus?: ResidentLifecycleStatus;
  initialPassword?: string;
  familyMembers?: string[];
}

export interface ResidentResponse {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  profilePhotoUrl?: string;
  email: string;
  phoneNumber: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  occupation?: string;
  bloodGroup?: string;
  governmentIdNumber?: string;
  familyMembers: string[];
  flatId: number;
  flatNumber: string;
  buildingId: number;
  buildingName: string;
  moveInDate?: string;
  occupancyType: OccupancyType;
  residentStatus: ResidentLifecycleStatus;
  active: boolean;
  gatePassToken?: string;
}

export interface ResidentSummaryResponse {
  id: number;
  username?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  flatNumber: string;
  buildingName: string;
  residentStatus: string;
  occupancyType?: string;
  gatePassToken?: string;
}

export interface ResidentSearchRequest {
  residentName?: string;
  flatNumber?: string;
  phoneNumber?: string;
  buildingName?: string;
  residentStatus?: ResidentLifecycleStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface FlatSearchRequest {
  buildingId?: number;
  buildingName?: string;
  floorNumber?: number;
  flatType?: string;
  status?: 'VACANT' | 'OCCUPIED' | 'RESERVED';
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}
