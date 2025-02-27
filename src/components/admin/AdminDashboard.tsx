import React, { useState } from 'react';
import { DashboardAnalytics } from './analytics/DashboardAnalytics';
import { InventoryManagement } from './inventory/InventoryManagement';
import { PromotionManagement } from './promotions/PromotionManagement';
import { WhatsAppMarketing } from './marketing/WhatsAppMarketing';
import { CustomerSegments } from './customers/CustomerSegments';
import { SalesForecasting } from './analytics/SalesForecasting';

type TabType = 'analytics' | 'inventory' | 'promotions' | 'marketing' | 'customers' | 'forecasting';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');

  const tabs = [
    { id: 'analytics', label: 'Analytics & Reporting' },
    { id: 'inventory', label: 'Inventory Management' },
    { id: 'promotions', label: 'Promotions' },
    { id: 'marketing', label: 'WhatsApp Marketing' },
    { id: 'customers', label: 'Customer Segments' },
    { id: 'forecasting', label: 'Sales Forecasting' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <DashboardAnalytics />;
      case 'inventory':
        return <InventoryManagement />;
      case 'promotions':
        return <PromotionManagement />;
      case 'marketing':
        return <WhatsAppMarketing />;
      case 'customers':
        return <CustomerSegments />;
      case 'forecasting':
        return <SalesForecasting />;
      default:
        return <DashboardAnalytics />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-4 border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}; 