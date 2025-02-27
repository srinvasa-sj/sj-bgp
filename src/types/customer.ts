export interface CustomerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notificationPreferences: {
    newProducts: boolean;
    promotions: boolean;
  };
  createdAt: any;
  updatedAt: any;
} 