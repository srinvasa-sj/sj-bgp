import React, { useState, useEffect } from 'react';
import { promotionService } from '@/services/promotionService';
import { Timestamp } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';

interface Promotion {
  id?: string;
  name: string;
  description: string;
  type: 'discount' | 'bogo' | 'bundle' | 'gift';
  startDate: Timestamp;
  endDate: Timestamp;
  conditions: {
    minPurchaseAmount?: number;
    applicableProducts?: string[];
    applicableCategories?: string[];
    maxUsagePerCustomer?: number;
  };
  benefits: {
    discountPercentage?: number;
    discountAmount?: number;
    freeProducts?: Array<{
      productId: string;
      quantity: number;
    }>;
    giftDescription?: string;
  };
  status: 'draft' | 'active' | 'ended' | 'cancelled';
}

export const PromotionManagement = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPromotion, setNewPromotion] = useState<Partial<Promotion>>({
    type: 'discount',
    conditions: {},
    benefits: {},
    status: 'draft',
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const activePromotions = await promotionService.getActivePromotions();
      setPromotions(activePromotions);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromotion = async () => {
    try {
      if (!newPromotion.name || !newPromotion.type || !newPromotion.description) {
        toast.error('Please fill in all required fields');
        return;
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30 days from now

      const promotion = {
        name: newPromotion.name,
        description: newPromotion.description,
        type: newPromotion.type,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        conditions: newPromotion.conditions || {},
        benefits: newPromotion.benefits || {},
        status: newPromotion.status || 'draft'
      };

      await promotionService.createPromotion(promotion);
      toast.success('Promotion created successfully');
      fetchPromotions();
      setNewPromotion({
        type: 'discount',
        conditions: {},
        benefits: {},
        status: 'draft',
      });
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast.error('Failed to create promotion');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return <div>Loading promotions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create New Promotion */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Promotion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Promotion Name
              </label>
              <Input
                value={newPromotion.name || ''}
                onChange={(e) =>
                  setNewPromotion({ ...newPromotion, name: e.target.value })
                }
                placeholder="Enter promotion name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Input
                value={newPromotion.description || ''}
                onChange={(e) =>
                  setNewPromotion({ ...newPromotion, description: e.target.value })
                }
                placeholder="Enter promotion description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <Select
                value={newPromotion.type}
                onValueChange={(value) =>
                  setNewPromotion({ ...newPromotion, type: value as Promotion['type'] })
                }
              >
                <option value="discount">Discount</option>
                <option value="bogo">Buy One Get One</option>
                <option value="bundle">Bundle</option>
                <option value="gift">Gift</option>
              </Select>
            </div>

            {newPromotion.type === 'discount' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Discount Percentage
                </label>
                <Input
                  type="number"
                  value={newPromotion.benefits?.discountPercentage || ''}
                  onChange={(e) =>
                    setNewPromotion({
                      ...newPromotion,
                      benefits: {
                        ...newPromotion.benefits,
                        discountPercentage: Number(e.target.value),
                      },
                    })
                  }
                  placeholder="Enter discount percentage"
                />
              </div>
            )}

            <Button onClick={handleCreatePromotion}>Create Promotion</Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Promotions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Promotions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {promotions.map((promotion) => (
              <div
                key={promotion.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{promotion.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                      promotion.status
                    )}`}
                  >
                    {promotion.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{promotion.description}</p>
                <div className="text-sm">
                  <p>
                    <span className="font-medium">Type:</span>{' '}
                    {promotion.type.toUpperCase()}
                  </p>
                  <p>
                    <span className="font-medium">Valid Until:</span>{' '}
                    {promotion.endDate.toDate().toLocaleDateString()}
                  </p>
                  {promotion.benefits.discountPercentage && (
                    <p>
                      <span className="font-medium">Discount:</span>{' '}
                      {promotion.benefits.discountPercentage}%
                    </p>
                  )}
                </div>
              </div>
            ))}
            {promotions.length === 0 && (
              <p className="text-gray-500">No active promotions</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
