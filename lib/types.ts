// Nova Rides – JSON API types (peer-to-peer car sharing)

export type UserRole = "host" | "renter" | "admin";

export interface Location {
  city: string;
  state?: string;
  lat: number;
  lng: number;
  address?: string;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  verified: boolean;
  emailVerifyToken?: string;
  emailVerifyExpires?: string;
  identityVerified: boolean;
  licenseVerified: boolean;
  /** Government-issued ID document URLs (front/back) */
  identityDocFront?: string;
  identityDocBack?: string;
  /** Driver's licence document URLs and expiry */
  licenseDocFront?: string;
  licenseDocBack?: string;
  licenseExpiryDate?: string;
  /** Last time we sent licence-expiry reminder (to avoid duplicate emails) */
  licenseExpiryReminderSentAt?: string;
  hostVerifiedBadge?: boolean;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
}

export interface UserProfile extends User {
  bio?: string;
  responseRate?: number;
  responseTime?: string;
}

export type VehicleClass =
  | "economy"
  | "compact"
  | "midsize"
  | "fullsize"
  | "luxury"
  | "suv"
  | "van"
  | "sports"
  | "electric";

export type BookingType = "instant" | "approval";

export interface Vehicle {
  id: string;
  hostId: string;
  title: string;
  description: string;
  year: number;
  make: string;
  model: string;
  mileage: number;
  vehicleClass: VehicleClass;
  pricePerDay: number;
  pricePerWeek?: number;
  currency: string;
  images: string[];
  location: Location;
  availability: string[]; // ISO dates available
  rules?: string[];
  minRentalDays: number;
  bookingType: BookingType;
  featured: boolean;
  promoted: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive" | "pending_approval";
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed"
  | "in_progress";

export type PaymentStatus = "pending" | "authorized" | "paid" | "refunded" | "failed";

export interface Booking {
  id: string;
  vehicleId: string;
  renterId: string;
  hostId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  securityDeposit: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  bookingType: BookingType;
  createdAt: string;
  updatedAt: string;
  tripCheckInVerified?: boolean;
  tripCheckOutVerified?: boolean;
  odometerStart?: number;
  odometerEnd?: number;
  fuelLevelStart?: string;
  fuelLevelEnd?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
  moderated?: boolean;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "payment" | "payout" | "refund" | "fee";
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  bookingId?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
