import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Promotion {
  id: string;
  promotionName: string;
  startDate: string;
  endDate: string;
  priceDiscount: number;
  wastageDiscount: number;
  makingChargesDiscount: number;
  giftDescription: string;
  productName: string;
}

interface PromotionEditFormProps {
  promotion: Promotion;
  onUpdate: (updatedPromotion: Promotion) => void;
}

const PromotionEditForm = ({ promotion, onUpdate }: PromotionEditFormProps) => {
  const [formData, setFormData] = useState(promotion);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="promotionName">Promotion Name</Label>
        <Input
          id="promotionName"
          value={formData.promotionName}
          onChange={(e) => setFormData({ ...formData, promotionName: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            type="date"
            id="startDate"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            type="date"
            id="endDate"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priceDiscount">Price Discount (%)</Label>
          <Input
            type="number"
            id="priceDiscount"
            value={formData.priceDiscount}
            onChange={(e) => setFormData({ ...formData, priceDiscount: parseFloat(e.target.value) })}
            min="0"
            max="99.99"
            step="0.01"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wastageDiscount">Wastage Discount (%)</Label>
          <Input
            type="number"
            id="wastageDiscount"
            value={formData.wastageDiscount}
            onChange={(e) => setFormData({ ...formData, wastageDiscount: parseFloat(e.target.value) })}
            min="0"
            max="99.99"
            step="0.01"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="makingChargesDiscount">Making Charges Discount (%)</Label>
          <Input
            type="number"
            id="makingChargesDiscount"
            value={formData.makingChargesDiscount}
            onChange={(e) => setFormData({ ...formData, makingChargesDiscount: parseFloat(e.target.value) })}
            min="0"
            max="99.99"
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="giftDescription">Gift Description</Label>
        <Input
          id="giftDescription"
          value={formData.giftDescription}
          onChange={(e) => setFormData({ ...formData, giftDescription: e.target.value })}
          placeholder="e.g., Free silver coin with purchase"
        />
      </div>

      <Button type="submit" className="w-full">Update Promotion</Button>
    </form>
  );
};

export default PromotionEditForm;