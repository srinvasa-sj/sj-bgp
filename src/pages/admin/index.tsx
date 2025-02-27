import React from 'react';
import { DashboardAnalytics } from '@/components/admin/DashboardAnalytics';

const AdminDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <DashboardAnalytics />
    </div>
  );
};

export default AdminDashboard; 