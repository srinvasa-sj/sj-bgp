import { collection, addDoc, getDocs, query, where, orderBy, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ContactInquiryType, ContactInquiryStatus, PreferredContactMethod, ContactPriority, AppointmentType, AppointmentStatus } from '@/types/contact';

export interface ContactInquiry {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  inquiryType: ContactInquiryType;
  message: string;
  preferredContactMethod: PreferredContactMethod;
  status: ContactInquiryStatus;
  priority: ContactPriority;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  assignedTo?: string;
  appointmentDate?: Timestamp;
  preferredMetal?: string;
  budgetRange?: string;
  imageUrl?: string;
}

export interface AppointmentRequest {
  id?: string;
  customerId: string;
  date: Timestamp;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

class ContactService {
  // Inquiry Management
  async submitInquiry(inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'inquiries'), {
        ...inquiry,
        status: 'new',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      throw error;
    }
  }

  async getInquiries(filters?: {
    status?: ContactInquiry['status'];
    type?: ContactInquiry['inquiryType'];
    startDate?: Date;
    endDate?: Date;
  }): Promise<ContactInquiry[]> {
    try {
      let q = collection(db, 'inquiries');
      const conditions = [];

      if (filters?.status) {
        conditions.push(where('status', '==', filters.status));
      }
      if (filters?.type) {
        conditions.push(where('inquiryType', '==', filters.type));
      }
      if (filters?.startDate) {
        conditions.push(where('createdAt', '>=', filters.startDate));
      }
      if (filters?.endDate) {
        conditions.push(where('createdAt', '<=', filters.endDate));
      }

      const querySnapshot = await getDocs(
        query(q, ...conditions, orderBy('createdAt', 'desc'))
      );

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContactInquiry[];
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      throw error;
    }
  }

  async updateInquiryStatus(
    inquiryId: string,
    status: ContactInquiry['status'],
    assignedTo?: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'inquiries', inquiryId), {
        status,
        assignedTo,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      throw error;
    }
  }

  // Appointment Management
  async scheduleAppointment(appointment: Omit<AppointmentRequest, 'id' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        ...appointment,
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      throw error;
    }
  }

  async getAppointments(filters?: {
    status?: AppointmentRequest['status'];
    startDate?: Date;
    endDate?: Date;
  }): Promise<AppointmentRequest[]> {
    try {
      let q = collection(db, 'appointments');
      const conditions = [];

      if (filters?.status) {
        conditions.push(where('status', '==', filters.status));
      }
      if (filters?.startDate) {
        conditions.push(where('date', '>=', filters.startDate));
      }
      if (filters?.endDate) {
        conditions.push(where('date', '<=', filters.endDate));
      }

      const querySnapshot = await getDocs(
        query(q, ...conditions, orderBy('date', 'asc'))
      );

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppointmentRequest[];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentRequest['status'],
    notes?: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status,
        ...(notes && { notes }),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  // Analytics
  async getContactAnalytics(startDate: Date, endDate: Date) {
    try {
      const [inquiries, appointments] = await Promise.all([
        this.getInquiries({ startDate, endDate }),
        this.getAppointments({ startDate, endDate })
      ]);

      const inquiryStats = {
        byStatus: {
          new: inquiries.filter(i => i.status === 'new').length,
          in_progress: inquiries.filter(i => i.status === 'in_progress').length,
          completed: inquiries.filter(i => i.status === 'completed').length,
          archived: inquiries.filter(i => i.status === 'archived').length
        },
        byType: {
          general: inquiries.filter(i => i.inquiryType === 'general').length,
          custom_design: inquiries.filter(i => i.inquiryType === 'custom_design').length,
          appointment: inquiries.filter(i => i.inquiryType === 'appointment').length,
          bulk_order: inquiries.filter(i => i.inquiryType === 'bulk_order').length
        }
      };

      const appointmentStats = {
        byStatus: {
          pending: appointments.filter(a => a.status === 'pending').length,
          confirmed: appointments.filter(a => a.status === 'confirmed').length,
          completed: appointments.filter(a => a.status === 'completed').length,
          cancelled: appointments.filter(a => a.status === 'cancelled').length
        }
      };

      const responseRate = inquiries.length > 0
        ? (inquiries.filter(i => i.status !== 'new').length / inquiries.length) * 100
        : 0;

      const averageResponseTime = inquiries
        .filter(i => i.updatedAt && i.createdAt)
        .reduce((acc, curr) => {
          return acc + (curr.updatedAt.seconds - curr.createdAt.seconds);
        }, 0) / inquiries.length || 0;

      return {
        inquiryStats,
        appointmentStats,
        responseRate,
        averageResponseTime
      };
    } catch (error) {
      console.error('Error getting contact analytics:', error);
      throw error;
    }
  }
}

export const contactService = new ContactService(); 