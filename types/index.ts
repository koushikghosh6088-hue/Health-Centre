export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification?: string;
  experience?: number;
  consultationFee: number;
  image?: string;
  bio?: string;
  isActive: boolean;
  availabilities?: DoctorAvailability[];
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface Test {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  duration?: number;
  preparation?: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  timeSlot: string;
  status: AppointmentStatus;
  notes?: string;
  totalAmount: number;
  paymentId?: string;
  paymentStatus: PaymentStatus;
  patient?: User;
  doctor?: Doctor;
}

export interface TestBooking {
  id: string;
  patientId: string;
  bookingDate: Date;
  preferredDate?: Date;
  preferredTime?: string;
  status: BookingStatus;
  totalAmount: number;
  paymentId?: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  address?: string;
  isHomeCollection: boolean;
  patient?: User;
  tests?: TestBookingItem[];
}

export interface TestBookingItem {
  id: string;
  testBookingId: string;
  testId: string;
  quantity: number;
  price: number;
  test?: Test;
}

export interface Testimonial {
  id: string;
  patientId: string;
  name: string;
  message: string;
  rating: number;
  isActive: boolean;
  createdAt: Date;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Enums
export enum UserRole {
  PATIENT = 'PATIENT',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// Form types
export interface DoctorBookingForm {
  doctorId: string;
  appointmentDate: string;
  timeSlot: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  notes?: string;
}

export interface TestBookingForm {
  tests: { testId: string; quantity: number }[];
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  preferredDate?: string;
  preferredTime?: string;
  isHomeCollection: boolean;
  address?: string;
  notes?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface TestimonialForm {
  name: string;
  message: string;
  rating: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Payment types
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt?: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

// Dashboard types
export interface DashboardStats {
  totalAppointments: number;
  totalTestBookings: number;
  totalRevenue: number;
  totalPatients: number;
  recentAppointments: Appointment[];
  recentBookings: TestBooking[];
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
}

export interface DayAvailability {
  date: string;
  dayOfWeek: number;
  timeSlots: TimeSlot[];
}
