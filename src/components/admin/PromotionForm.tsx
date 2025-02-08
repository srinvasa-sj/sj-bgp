import { useState } from "react";
import { doc, setDoc, serverTimestamp, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import PromotionHeader from "./promotion/PromotionHeader";
import PromotionBasicInfo from "./promotion/PromotionBasicInfo";
import PromotionDiscounts from "./promotion/PromotionDiscounts";
import PromotionDates from "./promotion/PromotionDates";
import ProductSelector from "./promotion/ProductSelector";

interface Product {
  name: string;
  category: string;
  weight: number;
  imageUrl: string;
}

const PromotionForm = ({ products }: { products: Product[] }) => {
  const [formData, setFormData] = useState({
    promotionName: "",
    priceDiscount: "",
    wastageDiscount: "",
    makingChargesDiscount: "",
    giftDescription: "",
    selectedProducts: [] as string[],
    startDate: "",
    endDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const priceDiscount = parseFloat(formData.priceDiscount);
      const wastageDiscount = parseFloat(formData.wastageDiscount);
      const makingChargesDiscount = parseFloat(formData.makingChargesDiscount);

      if (
        isNaN(priceDiscount) || priceDiscount < 0 || priceDiscount > 99.99 ||
        isNaN(wastageDiscount) || wastageDiscount < 0 || wastageDiscount > 99.99 ||
        isNaN(makingChargesDiscount) || makingChargesDiscount < 0 || makingChargesDiscount > 99.99
      ) {
        toast.error("Discount values must be between 0 and 99.99");
        return;
      }

      const savePromises = formData.selectedProducts.map(async (productName) => {
        const promotionId = `${productName.toLowerCase().replace(/\s+/g, '-')}-${formData.promotionName.toLowerCase().replace(/\s+/g, '-')}`;
        const docRef = doc(db, "promotions", promotionId);
        
        const promotionData = {
          promotionName: formData.promotionName,
          priceDiscount,
          wastageDiscount,
          makingChargesDiscount,
          giftDescription: formData.giftDescription,
          productName,
          startDate: formData.startDate,
          endDate: formData.endDate,
          timestamp: serverTimestamp(),
          active: true
        };

        return setDoc(docRef, promotionData);
      });

      await Promise.all(savePromises);
      toast.success("Promotions saved successfully!");
      
      setFormData({
        promotionName: "",
        priceDiscount: "",
        wastageDiscount: "",
        makingChargesDiscount: "",
        giftDescription: "",
        selectedProducts: [],
        startDate: "",
        endDate: "",
      });
    } catch (error) {
      console.error("Error saving promotions:", error);
      toast.error("Error saving promotions");
    }
  };

  const handleDeletePromotion = async () => {
    if (!formData.promotionName) {
      toast.error("Please enter a promotion name to delete");
      return;
    }

    if (formData.selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    try {
      const deletePromises = formData.selectedProducts.map(async (productName) => {
        const promotionId = `${productName.toLowerCase().replace(/\s+/g, '-')}-${formData.promotionName.toLowerCase().replace(/\s+/g, '-')}`;
        const docRef = doc(db, "promotions", promotionId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          await deleteDoc(docRef);
          return true;
        }
        return false;
      });

      const results = await Promise.all(deletePromises);
      const deletedCount = results.filter(Boolean).length;

      if (deletedCount > 0) {
        toast.success(`Successfully deleted ${deletedCount} promotion(s)`);
      } else {
        toast.error("No matching promotions found to delete");
      }
      
      setFormData({
        promotionName: "",
        priceDiscount: "",
        wastageDiscount: "",
        makingChargesDiscount: "",
        giftDescription: "",
        selectedProducts: [],
        startDate: "",
        endDate: "",
      });
    } catch (error) {
      console.error("Error deleting promotions:", error);
      toast.error("Error deleting promotions");
    }
  };

  const handleProductSelect = (productName: string) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productName)
        ? prev.selectedProducts.filter(name => name !== productName)
        : [...prev.selectedProducts, productName]
    }));
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-md animate-fade-in hover:shadow-lg transition-all duration-300">
      <PromotionHeader />
      <form onSubmit={handleSubmit} className="space-y-4">
        <PromotionBasicInfo
          promotionName={formData.promotionName}
          giftDescription={formData.giftDescription}
          onPromotionNameChange={(value) => setFormData({ ...formData, promotionName: value })}
          onGiftDescriptionChange={(value) => setFormData({ ...formData, giftDescription: value })}
        />

        <PromotionDiscounts
          priceDiscount={formData.priceDiscount}
          wastageDiscount={formData.wastageDiscount}
          makingChargesDiscount={formData.makingChargesDiscount}
          onPriceDiscountChange={(value) => setFormData({ ...formData, priceDiscount: value })}
          onWastageDiscountChange={(value) => setFormData({ ...formData, wastageDiscount: value })}
          onMakingChargesDiscountChange={(value) => setFormData({ ...formData, makingChargesDiscount: value })}
        />

        <PromotionDates
          startDate={formData.startDate}
          endDate={formData.endDate}
          onStartDateChange={(value) => setFormData({ ...formData, startDate: value })}
          onEndDateChange={(value) => setFormData({ ...formData, endDate: value })}
        />

        <ProductSelector
          products={products}
          selectedProducts={formData.selectedProducts}
          onProductSelect={handleProductSelect}
        />

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">Save Promotion</Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeletePromotion}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Promotion
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PromotionForm;