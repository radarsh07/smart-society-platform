import { httpClient } from './httpClient';
import type { ApiResponse, PageResponse } from '@/types/api';
import {
  Complaint,
  ComplaintRequest,
  Staff,
  MaintenanceBill,
  PaymentRequest,
  PaymentResponse,
  Vehicle,
  VehicleRequest,
  ParkingAllocation,
  FacilityBooking,
  FacilityBookingRequest,
  MarketplaceItem,
  MarketplaceItemRequest,
  ToLetListing,
  ToLetListingRequest,
  ServiceBooking,
  ServiceBookingRequest,
  Parcel,
  ParcelRequest
} from '../types/community';

// 1. Complaints
export const complaintApi = {
  getComplaints: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<Complaint>>> => {
    const res = await httpClient.get<ApiResponse<PageResponse<Complaint>>>(`/community/complaints?page=${page}&size=${size}`);
    return res.data;
  },
  createComplaint: async (data: ComplaintRequest): Promise<ApiResponse<Complaint>> => {
    const res = await httpClient.post<ApiResponse<Complaint>>('/community/complaints', data);
    return res.data;
  },
  assignComplaint: async (id: number, staffId?: number, priority?: string): Promise<ApiResponse<Complaint>> => {
    let url = `/community/complaints/${id}/assign?`;
    if (staffId) url += `staffId=${staffId}&`;
    if (priority) url += `priority=${priority}&`;
    const res = await httpClient.put<ApiResponse<Complaint>>(url);
    return res.data;
  },
  updateStatus: async (id: number, status: string): Promise<ApiResponse<Complaint>> => {
    const res = await httpClient.put<ApiResponse<Complaint>>(`/community/complaints/${id}/status?status=${status}`);
    return res.data;
  },
};

// 2. Staff Management
export const staffApi = {
  getStaff: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<Staff>>> => {
    const res = await httpClient.get<ApiResponse<PageResponse<Staff>>>(`/community/staff?page=${page}&size=${size}`);
    return res.data;
  },
  createStaff: async (data: Partial<Staff>): Promise<ApiResponse<Staff>> => {
    const res = await httpClient.post<ApiResponse<Staff>>('/community/staff', data);
    return res.data;
  },
};

// 3. Maintenance Billing & Payments
export const billingApi = {
  getBills: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<MaintenanceBill>>> => {
    const res = await httpClient.get<ApiResponse<PageResponse<MaintenanceBill>>>(`/community/maintenance-bills?page=${page}&size=${size}`);
    return res.data;
  },
  createBill: async (residentId: number): Promise<ApiResponse<MaintenanceBill>> => {
    const res = await httpClient.post<ApiResponse<MaintenanceBill>>(`/community/maintenance-bills/${residentId}`);
    return res.data;
  },
  processPayment: async (data: PaymentRequest): Promise<ApiResponse<PaymentResponse>> => {
    const res = await httpClient.post<ApiResponse<PaymentResponse>>('/community/payments', data);
    return res.data;
  },
};

// 4. Vehicles & Parking
export const parkingApi = {
  getVehicles: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<Vehicle>>> => {
    const res = await httpClient.get<ApiResponse<PageResponse<Vehicle>>>(`/community/vehicles?page=${page}&size=${size}`);
    return res.data;
  },
  createVehicle: async (data: VehicleRequest): Promise<ApiResponse<Vehicle>> => {
    const res = await httpClient.post<ApiResponse<Vehicle>>('/community/vehicles', data);
    return res.data;
  },
  getAllocations: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<ParkingAllocation>>> => {
    const res = await httpClient.get<ApiResponse<PageResponse<ParkingAllocation>>>(`/community/parking?page=${page}&size=${size}`);
    return res.data;
  },
  allocateParking: async (residentId: number, vehicleId: number): Promise<ApiResponse<ParkingAllocation>> => {
    const res = await httpClient.post<ApiResponse<ParkingAllocation>>(`/community/parking/allocate/${residentId}/${vehicleId}`);
    return res.data;
  },
};

// 5. Facility Booking
export const facilityApi = {
  getBookings: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<FacilityBooking>>> => {
    const res = await httpClient.get<ApiResponse<PageResponse<FacilityBooking>>>(`/community/facility-bookings?page=${page}&size=${size}`);
    return res.data;
  },
  createBooking: async (data: FacilityBookingRequest): Promise<ApiResponse<FacilityBooking>> => {
    const res = await httpClient.post<ApiResponse<FacilityBooking>>('/community/facility-bookings', data);
    return res.data;
  },
};

// 6. Community Marketplace
export const marketplaceApi = {
  getItems: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<MarketplaceItem>>> => {
    const res = await httpClient.get<ApiResponse<PageResponse<MarketplaceItem>>>(`/community/marketplace?page=${page}&size=${size}`);
    return res.data;
  },
  createItem: async (data: MarketplaceItemRequest): Promise<ApiResponse<MarketplaceItem>> => {
    const res = await httpClient.post<ApiResponse<MarketplaceItem>>('/community/marketplace', data);
    return res.data;
  },
};

// 7. To-Let Listings
export const toLetApi = {
  getListings: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<ToLetListing>>> => {
    const res = await httpClient.get<ApiResponse<PageResponse<ToLetListing>>>(`/community/to-let?page=${page}&size=${size}`);
    return res.data;
  },
  createListing: async (data: ToLetListingRequest): Promise<ApiResponse<ToLetListing>> => {
    const res = await httpClient.post<ApiResponse<ToLetListing>>('/community/to-let', data);
    return res.data;
  },
};

// 8. Service Bookings
export const serviceBookingApi = {
  getBookings: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<ServiceBooking>>> => {
    const res = await httpClient.get<ApiResponse<PageResponse<ServiceBooking>>>(`/community/service-bookings?page=${page}&size=${size}`);
    return res.data;
  },
  createBooking: async (data: ServiceBookingRequest): Promise<ApiResponse<ServiceBooking>> => {
    const res = await httpClient.post<ApiResponse<ServiceBooking>>('/community/service-bookings', data);
    return res.data;
  },
};

// 9. Smart Parcel Management
export const parcelApi = {
  getParcels: async (page = 0, size = 10): Promise<ApiResponse<PageResponse<Parcel>>> => {
    const res = await httpClient.get<ApiResponse<PageResponse<Parcel>>>(`/community/parcels?page=${page}&size=${size}`);
    return res.data;
  },
  createParcel: async (data: ParcelRequest): Promise<ApiResponse<Parcel>> => {
    const res = await httpClient.post<ApiResponse<Parcel>>('/community/parcels', data);
    return res.data;
  },
};
