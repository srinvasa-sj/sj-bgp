import { Timestamp } from "firebase/firestore";

export type ContactInquiryType = 'general' | 'custom_design' | 'appointment' | 'bulk_order';
export type ContactInquiryStatus = 'new' | 'in_progress' | 'completed' | 'archived';
export type PreferredContactMethod = 'email' | 'phone' | 'whatsapp';
export type ContactPriority = 'low' | 'medium' | 'high';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type AppointmentType = 'custom_design' | 'consultation' | 'repair';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  inquiryType: ContactInquiryType;
  message: string;
  imageUrl?: string | null;
  preferredContactMethod: PreferredContactMethod;
  preferredMetal?: string | null;
  budgetRange?: string | null;
  appointmentDate?: Date | null;
  allowNewsletter?: boolean;
}

export interface ContactInquiry {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  inquiryType: ContactInquiryType;
  message: string;
  imageUrl?: string | null;
  preferredContactMethod: PreferredContactMethod;
  preferredMetal?: string | null;
  budgetRange?: string | null;
  appointmentDate?: Timestamp | null;
  allowNewsletter?: boolean;
  status: ContactInquiryStatus;
  priority: ContactPriority;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  assignedTo?: string;
}

export interface AppointmentRequest {
  id?: string;
  customerId: string;
  customerName?: string;
  customerContact?: string;
  date: Timestamp;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}