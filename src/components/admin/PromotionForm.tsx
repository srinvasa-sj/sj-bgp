import { useState } from "react";
import { doc, setDoc, serverTimestamp, deleteDoc, getDoc, collection, getDocs, query, where, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import PromotionHeader from "./promotion/PromotionHeader";
import PromotionBasicInfo from "./promotion/PromotionBasicInfo";
import PromotionDiscounts from "./promotion/PromotionDiscounts";
import PromotionDates from "./promotion/PromotionDates";
import ProductSelector from "./promotion/ProductSelector";
import DeletePromotions from "./promotion/DeletePromotions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Product {
  name: string;
  productCategory: string;
  category: string;
  weight: number;
  imageUrl: string;
  material?: string;
  purity?: string;
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'single' | 'bulk'>('single');
  const [promotionsToDelete, setPromotionsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const priceDiscount = formData.priceDiscount ? parseFloat(formData.priceDiscount) : 0;
      const wastageDiscount = formData.wastageDiscount ? parseFloat(formData.wastageDiscount) : 0;
      const makingChargesDiscount = formData.makingChargesDiscount ? parseFloat(formData.makingChargesDiscount) : 0;

      if (formData.priceDiscount && (isNaN(priceDiscount) || priceDiscount < 0 || priceDiscount > 99.99)) {
        toast.error("Price discount must be between 0 and 99.99");
        return;
      }
      if (formData.wastageDiscount && (isNaN(wastageDiscount) || wastageDiscount < 0 || wastageDiscount > 99.99)) {
        toast.error("Wastage charges discount must be between 0 and 99.99");
        return;
      }
      if (formData.makingChargesDiscount && (isNaN(makingChargesDiscount) || makingChargesDiscount < 0 || makingChargesDiscount > 99.99)) {
        toast.error("Making charges discount must be between 0 and 99.99");
        return;
      }

      if (formData.selectedProducts.length === 0) {
        toast.error("Please select at least one product");
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

    setDeleteMode('single');
    setPromotionsToDelete(formData.selectedProducts.map(productName => 
      `${productName.toLowerCase().replace(/\s+/g, '-')}-${formData.promotionName.toLowerCase().replace(/\s+/g, '-')}`
    ));
    setShowDeleteDialog(true);
  };

  const handleBulkDelete = async (promotionIds: string[]) => {
    setDeleteMode('bulk');
    setPromotionsToDelete(promotionIds);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const batch = writeBatch(db);
      
      for (const promotionId of promotionsToDelete) {
        const docRef = doc(db, "promotions", promotionId);
        batch.delete(docRef);
      }

      await batch.commit();
      
      toast.success(`Successfully deleted ${promotionsToDelete.length} promotion(s)`);
      
      if (deleteMode === 'single') {
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
      }
    } catch (error) {
      console.error("Error deleting promotions:", error);
      toast.error("Error deleting promotions");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setPromotionsToDelete([]);
    }
  };

  const handleProductSelect = (productName: string) => {
    if (productName.includes(",")) {
      const productNames = productName.split(",");
      setFormData(prev => ({
        ...prev,
        selectedProducts: productNames
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedProducts: prev.selectedProducts.includes(productName)
          ? prev.selectedProducts.filter(name => name !== productName)
          : [...prev.selectedProducts, productName]
      }));
    }
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

      {!formData.promotionName && !formData.priceDiscount && !formData.wastageDiscount && 
       !formData.makingChargesDiscount && !formData.giftDescription && formData.selectedProducts.length === 0 && (
        <div className="mt-8 pt-8 border-t">
          <DeletePromotions
            products={products}
            onDelete={handleBulkDelete}
          />
        </div>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {promotionsToDelete.length} promotion(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromotionForm;

