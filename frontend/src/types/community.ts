export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Complaint {
  id: number;
  ticketNumber: string;
  residentId: number;
  residentName: string;
  categoryId: number;
  categoryName: string;
  subject: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedStaffId?: number;
  assignedStaffName?: string;
  assignedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  feedbackRating?: number;
  feedbackComment?: string;
  imageUrls?: string[];
  active: boolean;
}

export interface ComplaintRequest {
  residentId: number;
  categoryId: number;
  subject: string;
  description: string;
  priority: ComplaintPriority;
  imageUrls?: string[];
}

export interface Staff {
  id: number;
  fullName: string;
  specialization: string;
  phoneNumber: string;
  email?: string;
  workStatus?: string;
  userId?: number;
  active: boolean;
}

export interface BillItem {
  id: number;
  name: string;
  description?: string;
  amount: number;
}

export interface MaintenanceBill {
  id: number;
  residentId: number;
  residentName: string;
  billNumber: string;
  billingMonth: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  items?: BillItem[];
  active: boolean;
}

export interface PaymentRequest {
  billId: number;
  amount: number;
  paymentMethod: 'RAZORPAY' | 'UPI' | 'NET_BANKING' | 'CARD';
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export interface PaymentResponse {
  id: number;
  billId: number;
  receiptNumber: string;
  amountPaid: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  paymentDate: string;
}

export interface Vehicle {
  id: number;
  residentId: number;
  residentName: string;
  vehicleNumber: string;
  make: string;
  model: string;
  color: string;
  active: boolean;
}

export interface VehicleRequest {
  residentId: number;
  vehicleNumber: string;
  make: string;
  model: string;
  color: string;
}

export interface ParkingAllocation {
  id: number;
  residentId: number;
  residentName: string;
  slotId: number;
  slotNumber: string;
  vehicleId?: number;
  vehicleNumber?: string;
  allocatedAt?: string;
  expiresAt?: string;
  active: boolean;
}

export interface Facility {
  id: number;
  name: string;
  description: string;
  capacity: number;
  feePerHour: number;
  active: boolean;
}

export interface FacilityBooking {
  id: number;
  facilityId: number;
  facilityName: string;
  residentId: number;
  residentName: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  notes?: string;
  active: boolean;
}

export interface FacilityBookingRequest {
  facilityId: number;
  residentId: number;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface MarketplaceItem {
  id: number;
  residentId: number;
  residentName: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  active: boolean;
}

export interface MarketplaceItemRequest {
  residentId: number;
  title: string;
  description: string;
  price: number;
  category: string;
}

export interface ToLetListing {
  id: number;
  residentId: number;
  residentName: string;
  title: string;
  description: string;
  rent: number;
  location: string;
  status: 'AVAILABLE' | 'RENTED';
  active: boolean;
}

export interface ToLetListingRequest {
  residentId: number;
  title: string;
  description: string;
  rent: number;
  location: string;
}

export interface ServiceBooking {
  id: number;
  residentId: number;
  residentName: string;
  serviceType: string;
  description: string;
  preferredTime: string;
  status: 'REQUESTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  active: boolean;
}

export interface ServiceBookingRequest {
  residentId: number;
  serviceType: string;
  description: string;
  preferredTime: string;
}

export interface Parcel {
  id: number;
  residentId: number;
  residentName: string;
  trackingNumber: string;
  courierName: string;
  description?: string;
  receivedAt?: string;
  status: 'ARRIVED' | 'NOTIFIED' | 'COLLECTED';
  active: boolean;
}

export interface ParcelRequest {
  residentId: number;
  trackingNumber: string;
  courierName: string;
  description?: string;
  status?: 'ARRIVED' | 'NOTIFIED' | 'COLLECTED';
}
